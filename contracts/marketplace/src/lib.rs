//! Marketplace Contract
//! Lists tokenized RWA loan opportunities and matches investors with borrowers.

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum ListingStatus {
    Open,
    Funded,
    Cancelled,
}

#[contracttype]
#[derive(Clone)]
pub struct Listing {
    pub borrower: Address,
    pub asset_contract: Address,
    pub loan_pool_contract: Address,
    pub loan_id: u32,
    pub title: String,
    pub description: String,
    pub target_amount: i128,
    pub interest_bps: u32,
    pub duration_days: u32,
    pub status: ListingStatus,
}

const LISTING: Symbol = symbol_short!("LISTING");
const LIST_CTR: Symbol = symbol_short!("LIST_CTR");

#[contract]
pub struct MarketplaceContract;

#[contractimpl]
impl MarketplaceContract {
    /// Borrower lists a loan opportunity on the marketplace.
    pub fn list_asset(
        env: Env,
        borrower: Address,
        asset_contract: Address,
        loan_pool_contract: Address,
        loan_id: u32,
        title: String,
        description: String,
        target_amount: i128,
        interest_bps: u32,
        duration_days: u32,
    ) -> u32 {
        borrower.require_auth();
        let id: u32 = env.storage().instance().get(&LIST_CTR).unwrap_or(0);
        let listing = Listing {
            borrower,
            asset_contract,
            loan_pool_contract,
            loan_id,
            title,
            description,
            target_amount,
            interest_bps,
            duration_days,
            status: ListingStatus::Open,
        };
        env.storage().persistent().set(&(LISTING, id), &listing);
        env.storage().instance().set(&LIST_CTR, &(id + 1));
        id
    }

    /// Mark a listing as funded. Only the borrower who created it may call this.
    pub fn mark_funded(env: Env, borrower: Address, listing_id: u32) {
        borrower.require_auth();
        let mut listing: Listing = env.storage().persistent()
            .get(&(LISTING, listing_id)).expect("listing not found");
        assert!(listing.borrower == borrower, "not borrower");
        assert!(listing.status == ListingStatus::Open, "not open");
        listing.status = ListingStatus::Funded;
        env.storage().persistent().set(&(LISTING, listing_id), &listing);
    }

    /// Borrower cancels an open listing.
    pub fn cancel(env: Env, borrower: Address, listing_id: u32) {
        borrower.require_auth();
        let mut listing: Listing = env.storage().persistent()
            .get(&(LISTING, listing_id)).expect("listing not found");
        assert!(listing.borrower == borrower, "not borrower");
        assert!(listing.status == ListingStatus::Open, "not open");
        listing.status = ListingStatus::Cancelled;
        env.storage().persistent().set(&(LISTING, listing_id), &listing);
    }

    pub fn get_listing(env: Env, listing_id: u32) -> Listing {
        env.storage().persistent().get(&(LISTING, listing_id)).expect("listing not found")
    }

    pub fn listing_count(env: Env) -> u32 {
        env.storage().instance().get(&LIST_CTR).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_list_and_fund() {
        let env = Env::default();
        env.mock_all_auths();
        let cid = env.register_contract(None, MarketplaceContract);
        let client = MarketplaceContractClient::new(&env, &cid);

        let borrower = Address::generate(&env);
        let asset = Address::generate(&env);
        let pool = Address::generate(&env);

        let lid = client.list_asset(
            &borrower,
            &asset,
            &pool,
            &0,
            &String::from_str(&env, "Excavator Fleet A"),
            &String::from_str(&env, "Fund 5 excavators for 90 days"),
            &500_000_000,
            &800,
            &90,
        );
        assert_eq!(client.listing_count(), 1);

        client.mark_funded(&borrower, &lid);
        let listing = client.get_listing(&lid);
        assert_eq!(listing.status, ListingStatus::Funded);
    }
}
