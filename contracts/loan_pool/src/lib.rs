//! Loan Pool Contract
//! Manages the full lifecycle of a fractionalized loan:
//! creation → funding → active → repayment → yield distribution.

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Map, Symbol};

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum LoanStatus {
    Funding,
    Active,
    Repaying,
    Closed,
}

#[contracttype]
#[derive(Clone)]
pub struct Loan {
    pub borrower: Address,
    pub asset_contract: Address,
    pub target_amount: i128, // XLM stroops
    pub funded_amount: i128,
    pub interest_bps: u32,   // basis points e.g. 800 = 8%
    pub duration_days: u32,
    pub status: LoanStatus,
    pub repaid_amount: i128,
}

const LOAN: Symbol = symbol_short!("LOAN");
const INVESTORS: Symbol = symbol_short!("INVESTORS");
const LOAN_CTR: Symbol = symbol_short!("LOAN_CTR");

#[contract]
pub struct LoanPoolContract;

#[contractimpl]
impl LoanPoolContract {
    /// Borrower creates a new loan request.
    pub fn create_loan(
        env: Env,
        borrower: Address,
        asset_contract: Address,
        target_amount: i128,
        interest_bps: u32,
        duration_days: u32,
    ) -> u32 {
        borrower.require_auth();
        assert!(target_amount > 0 && duration_days > 0, "invalid params");

        let id: u32 = env.storage().instance().get(&LOAN_CTR).unwrap_or(0);
        let loan = Loan {
            borrower,
            asset_contract,
            target_amount,
            funded_amount: 0,
            interest_bps,
            duration_days,
            status: LoanStatus::Funding,
            repaid_amount: 0,
        };
        env.storage().persistent().set(&(LOAN, id), &loan);
        env.storage().instance().set(&LOAN_CTR, &(id + 1));
        id
    }

    /// Investor funds a portion of the loan.
    pub fn fund(env: Env, loan_id: u32, investor: Address, amount: i128) {
        investor.require_auth();
        let mut loan: Loan = env.storage().persistent()
            .get(&(LOAN, loan_id)).expect("loan not found");
        assert!(loan.status == LoanStatus::Funding, "not in funding phase");
        assert!(amount > 0, "amount must be positive");

        loan.funded_amount += amount;
        if loan.funded_amount >= loan.target_amount {
            loan.status = LoanStatus::Active;
        }
        env.storage().persistent().set(&(LOAN, loan_id), &loan);

        let mut investors: Map<Address, i128> = env
            .storage().persistent()
            .get(&(INVESTORS, loan_id))
            .unwrap_or(Map::new(&env));
        let prev = investors.get(investor.clone()).unwrap_or(0);
        investors.set(investor, prev + amount);
        env.storage().persistent().set(&(INVESTORS, loan_id), &investors);
    }

    /// Borrower repays principal + interest.
    pub fn repay(env: Env, loan_id: u32, borrower: Address, amount: i128) {
        borrower.require_auth();
        let mut loan: Loan = env.storage().persistent()
            .get(&(LOAN, loan_id)).expect("loan not found");
        assert!(
            loan.status == LoanStatus::Active || loan.status == LoanStatus::Repaying,
            "not active"
        );
        assert!(loan.borrower == borrower, "not borrower");

        loan.repaid_amount += amount;
        loan.status = LoanStatus::Repaying;
        let total_due =
            loan.funded_amount + (loan.funded_amount * loan.interest_bps as i128 / 10_000);
        if loan.repaid_amount >= total_due {
            loan.status = LoanStatus::Closed;
        }
        env.storage().persistent().set(&(LOAN, loan_id), &loan);
    }

    /// Returns investor's claimable yield share proportional to their contribution.
    pub fn yield_share(env: Env, loan_id: u32, investor: Address) -> i128 {
        let loan: Loan = env.storage().persistent()
            .get(&(LOAN, loan_id)).expect("loan not found");
        let investors: Map<Address, i128> = env
            .storage().persistent()
            .get(&(INVESTORS, loan_id))
            .unwrap_or(Map::new(&env));
        let contribution = investors.get(investor).unwrap_or(0);
        if loan.funded_amount == 0 || contribution == 0 {
            return 0;
        }
        let repaid_interest = if loan.repaid_amount > loan.funded_amount {
            loan.repaid_amount - loan.funded_amount
        } else {
            0
        };
        repaid_interest * contribution / loan.funded_amount
    }

    pub fn get_loan(env: Env, loan_id: u32) -> Loan {
        env.storage().persistent().get(&(LOAN, loan_id)).expect("loan not found")
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_loan_lifecycle() {
        let env = Env::default();
        env.mock_all_auths();
        let cid = env.register_contract(None, LoanPoolContract);
        let client = LoanPoolContractClient::new(&env, &cid);

        let borrower = Address::generate(&env);
        let investor = Address::generate(&env);
        let asset = Address::generate(&env);

        let loan_id = client.create_loan(&borrower, &asset, &1_000_000, &800, &90);
        client.fund(&loan_id, &investor, &1_000_000);

        let loan = client.get_loan(&loan_id);
        assert_eq!(loan.status, LoanStatus::Active);

        client.repay(&loan_id, &borrower, &1_080_000);
        let loan = client.get_loan(&loan_id);
        assert_eq!(loan.status, LoanStatus::Closed);

        let yield_amt = client.yield_share(&loan_id, &investor);
        assert_eq!(yield_amt, 80_000);
    }
}
