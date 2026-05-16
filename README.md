# RWA Credit Marketplace

A decentralized marketplace for fractionalized private credit and equipment financing on Stellar (Soroban).

SMEs and engineering firms tokenize physical assets (machinery, fleets, hardware) to raise capital. Global investors fund fractionalized loans and earn yield tied to real-world asset utilization.

## Architecture

```
rwa-credit-marketplace/
├── contracts/        # Soroban smart contracts (Rust)
├── backend/          # Node.js/Express REST API
├── frontend/         # Next.js app
└── docker-compose.yml
```

## Contracts

- **asset_token** – SPL-style token representing a fractionalized RWA
- **loan_pool** – Manages loan lifecycle: funding, repayment, yield distribution
- **marketplace** – Lists assets, matches investors, handles offers

## System Architecture & Interaction Flow

```mermaid
sequenceDiagram
    autonumber
    actor SME as SME (Borrower)
    actor INV as Investor
    
    box rgba(128, 128, 128, 0.1) Off-Chain
    participant FE as Next.js Frontend
    participant BE as Node.js Backend
    end
    
    box rgba(0, 150, 255, 0.1) Soroban Smart Contracts
    participant MC as Marketplace Contract
    participant AT as Asset Token Contract
    participant LP as Loan Pool Contract
    end

    %% 1. Listing an Asset
    Note over SME, LP: ─── 1. Listing an Asset ───
    SME->>FE: Submit asset details & docs
    FE->>BE: Store metadata (off-chain/IPFS)
    BE-->>FE: Return metadata URI
    FE->>MC: Initialize asset listing (Wallet Sign)
    MC->>AT: Mint fractionalized asset tokens
    AT-->>MC: Tokens minted
    MC-->>FE: Listing confirmed
    FE-->>SME: Asset successfully listed

    %% 2. Investor Funding
    Note over SME, LP: ─── 2. Investor Funding ───
    INV->>FE: Browse marketplace & select asset
    FE->>LP: Deposit funding (e.g., USDC)
    LP->>AT: Transfer asset tokens to Investor
    AT-->>LP: Transfer confirmed
    LP-->>FE: Funding confirmed
    FE-->>INV: Investment successful

    %% 3. Repayment
    Note over SME, LP: ─── 3. Repayment ───
    SME->>FE: Initiate repayment
    FE->>LP: Deposit principal + interest (USDC)
    LP-->>FE: Repayment recorded
    FE->>BE: Update status (off-chain sync)
    FE-->>SME: Repayment successful

    %% 4. Yield Claim
    Note over SME, LP: ─── 4. Yield Claim ───
    INV->>FE: Request yield/return
    FE->>LP: Trigger claim function
    LP->>INV: Distribute pro-rata yield (USDC)
    LP-->>FE: Claim processed
    FE-->>INV: Yield received
```

## Quick Start

```bash
cp .env.example .env
docker-compose up
```
