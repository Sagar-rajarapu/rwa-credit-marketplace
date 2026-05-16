//! Asset Token Contract
//! Represents a fractionalized real-world asset (RWA) on Stellar.
//! Each token corresponds to a share of a physical asset (machinery, fleet, hardware).

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol,
};

#[contracttype]
#[derive(Clone)]
pub struct AssetMetadata {
    pub name: String,
    pub asset_type: String, // "machinery" | "fleet" | "hardware"
    pub valuation: i128,    // USD cents
    pub total_shares: i128,
    pub admin: Address,
}

const METADATA: Symbol = symbol_short!("METADATA");
const BALANCE: Symbol = symbol_short!("BALANCE");

fn balance_key(env: &Env, addr: &Address) -> soroban_sdk::Val {
    (BALANCE, addr.clone()).into_val(env)
}

#[contract]
pub struct AssetTokenContract;

#[contractimpl]
impl AssetTokenContract {
    /// Initialize the asset token with metadata and mint all shares to admin.
    pub fn initialize(
        env: Env,
        admin: Address,
        name: String,
        asset_type: String,
        valuation: i128,
        total_shares: i128,
    ) {
        admin.require_auth();
        assert!(!env.storage().instance().has(&METADATA), "already initialized");
        assert!(total_shares > 0 && valuation > 0, "invalid params");

        let meta = AssetMetadata { name, asset_type, valuation, total_shares, admin: admin.clone() };
        env.storage().instance().set(&METADATA, &meta);
        env.storage().persistent().set(&(BALANCE, admin), &total_shares);
    }

    pub fn metadata(env: Env) -> AssetMetadata {
        env.storage().instance().get(&METADATA).unwrap()
    }

    pub fn balance(env: Env, addr: Address) -> i128 {
        env.storage().persistent().get(&(BALANCE, addr)).unwrap_or(0)
    }

    /// Transfer shares between accounts.
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        assert!(amount > 0, "amount must be positive");
        let from_bal: i128 = env.storage().persistent().get(&(BALANCE, from.clone())).unwrap_or(0);
        assert!(from_bal >= amount, "insufficient balance");
        env.storage().persistent().set(&(BALANCE, from), &(from_bal - amount));
        let to_bal: i128 = env.storage().persistent().get(&(BALANCE, to.clone())).unwrap_or(0);
        env.storage().persistent().set(&(BALANCE, to), &(to_bal + amount));
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_initialize_and_transfer() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, AssetTokenContract);
        let client = AssetTokenContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let investor = Address::generate(&env);

        client.initialize(
            &admin,
            &String::from_str(&env, "Excavator Fleet A"),
            &String::from_str(&env, "fleet"),
            &1_000_000_00,
            &1000,
        );

        assert_eq!(client.balance(&admin), 1000);
        client.transfer(&admin, &investor, &100);
        assert_eq!(client.balance(&investor), 100);
        assert_eq!(client.balance(&admin), 900);
    }
}
