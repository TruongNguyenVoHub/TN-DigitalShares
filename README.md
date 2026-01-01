# 🚀 TN-DigitalShares: Internal Equity Management & Trading Platform (ESOP 4.0)

***"Do not let employee equity be soulless numbers on Excel."***

Hybrid (Web2 x Blockchain) solution that turns ESOP grants into real digital assets: transparent, liquid, secure.

### 💥 Current Pain Points (Company & Employees)
- **Opaque information**: ESOP is just a paper/PDF; employees cannot see real value.
- **Excel hell**: manual cap table, error-prone, easy to tamper, data loss risk.
- **Zero liquidity**: selling equity requires approvals and slow paperwork.

### 💡 TN-DigitalShares Solution
- **Barrier-free hybrid**: username/password login auto-creates a wallet (Managed Wallet); supports Web3 wallet connection for advanced users when needed.
- **Instant off-chain trades, zero gas**; on-chain supply is 1:1 collateralized.
- **Proof of Reserve**: every mint requires evidence of stock intake; whitelist/KYC is mandatory.

### 💎 Why Companies NEED this system

- **Real ownership, real motivation:** ESOP is no longer a promise on paper; employees open the app and see balances, charts, and tokens in their wallet → clear ownership feeling, better retention.
- **Instant internal liquidity:** Build a mini-exchange for P2P trading among employees without waiting for IPO; turn equity into an “internal ATM.”
- **Clean data, IPO/M&A-ready:** Immutable transaction history on-chain, automated reconciliation; shorten due diligence from months to days and boost investor trust.
- **Raise capital from within:** Sell preferential shares (Stock Purchase Plan) right in the app, tap low-cost capital from employees, align “work and be a shareholder.”
- **Tech-forward, talent magnet:** Frictionless experience (username/password login, system handles wallet and gas) makes the company look modern to Gen Z/tech candidates and strengthens employer brand.

### ⚖️ Legal & Compliance

**Principle:** Compliance-first, internal token (Private Placement), not offered to the public. TNT token is the digital twin of ESOP, not a public payment token.

**Addressed:**
- **KYC/AML + smart contract whitelist**: only verified wallets can send/receive; 1:1 user-to-wallet traceability.
- **Proof of Reserve & anti-dilution**: every on-chain mint/burn has evidence; total supply is transparent.
- **Private Placement**: restricted to internal scope, no public ICO/IPO; adheres to corporate/securities laws on private issuance.
- **Audit trail & tax**: full transaction history stored for personal income tax on equity transfer (0.1%).

**Gaps & mitigations:**
- **Final legal source of truth**: the original shareholder registry remains the highest authority; blockchain is the digital twin, synced periodically.
- **Payment intermediary**: VND balance is escrow/internal limit, not for external goods/services; recommend deposit/withdraw via bank, system records status only.
- **Personal data protection**: KYC and private keys must be encrypted (AES-256 already for keys); add encryption-at-rest for KYC data and comply with Decree 13/2023/ND-CP in production.

**Disclaimer:**
- TN-DigitalShares is an internal governance SaaS, not a securities exchange or credit institution.
- TNT token circulates internally only, has no external payment value, and is not guaranteed by any financial institution.
- Operating companies are responsible for legal compliance, corporate charter, and tax obligations when issuing/valuing/trading tokens.

### 🔥 Key Features
- **🏦 P2P trading gateway**: buy/sell equity between employees or with the company.
- **🔐 Managed Wallet**: auto-create blockchain wallet on registration, removing technical hurdles.
- **📜 Smart contract**: transparent, tamper-proof ledger; controlled issuance.
- **👮‍♂️ Whitelist + KYC**: only verified wallets can hold tokens.
- **💰 Proof of Reserve**: admin minting requires stock intake evidence.


### 🛠️ Tech Stack (matches current code)
- **Blockchain**: Solidity (ERC20 + AccessControl), Hardhat, Sepolia testnet (Ethereum).
- **App (FE + BE)**: Next.js (App Router) + TypeScript. API routes/route handlers run on Next (no separate Express).
- **Data**: Prisma ORM (SQLite for dev; ready to switch to Postgres for prod).
- **Wallet Security**: AES-256 encrypt private key (WALLET_ENCRYPTION_KEY ≥ 32 chars).
- **UI**: Tailwind CSS UI kit.

---

## 📋 Deployment & Usage Guide

### **Step 1: Clone Project & Install Dependencies**

```bash
# Clone repository
git clone <your-repo-url>
cd stock-token

# Install dependencies
npm install
```

---

### **Step 2: Create Admin Wallet (Managed Wallet)**

Run the script to generate a new Ethereum wallet for the admin:

```bash
npx tsx scripts/create-wallet.ts
```

**Output:**
```
🔐 Generating new Ethereum wallet...

✅ Wallet created successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Public Address:
   0x1234567890abcdef...

🔑 Private Key:
   0xabcdefgh1234567890...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Save these two values; you will use them in the next step.**

---

### **Step 3: Request Sepolia ETH**

Use these faucets to get test ETH for the newly created admin wallet:

- [Sepolia Faucet (Alchemy)](https://sepoliafaucet.com/)
- [Sepolia Faucet (Infura)](https://www.infura.io/faucet/sepolia)
- [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)

Need ~0.5 ETH for deploy + verify.

---

### **Step 4: Configure Smart Contract & Deploy**

#### **4.1 Install dependencies inside contracts folder**

```bash
cd contracts
npm install
```

#### **4.2 Create `.env` inside `contracts/`**

```bash
cp env.example .env
```

Fill in the values:

```env
# Sepolia RPC URL (from Infura/Alchemy/QuickNode)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Admin private key from step 2 (without 0x prefix)
SEPOLIA_PRIVATE_KEY=abcdefgh1234567890...

# Etherscan API key (for contract verification)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Admin wallet address
DEFAULT_ADMIN=0x1234567890abcdef...

# Addresses for roles (can reuse admin wallet when testing)
INVENTORY_MANAGER=0x1234567890abcdef...
COMPLIANCE_ADDRESS=0x1234567890abcdef...

# Chainlink Price Feed (available on Sepolia)
PRICE_ORACLE_ADDRESS=0x694AA1769357215DE4FAC081bf1f309aDC325306
```

#### **4.3 Deploy Smart Contract**

```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia (using Ignition)
npx hardhat ignition deploy ignition/modules/StockToken.ts --network sepolia
```

**Save the `CONTRACT_ADDRESS` from the output for step 6.**

#### **4.4 Verify Contract on Etherscan**

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

---

### **Step 5: Configure Backend & Database**

#### **5.1 Go back to project root**

```bash
cd ..
```

#### **5.2 Create `.env` at project root**

```bash
cp env.example .env
```

Fill in the values:

```env
# Database (SQLite)
DATABASE_URL="file:./prisma/dev.db"

# Smart Contract
CONTRACT_ADDRESS=0x1234567890abcdef...      # From step 4.3
SEPOLIA_PRIVATE_KEY=abcdefgh1234567890...   # From step 2 (no 0x prefix)
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Frontend
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890abcdef...
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_TREASURY_ADDRESS=0x1234567890abcdef...  # Can reuse admin wallet

# Wallet Encryption Key (MUST be >= 32 characters, keep SECRET!)
WALLET_ENCRYPTION_KEY=your-super-secret-encryption-key-min-32-characters-abcdefghijklmnopqrstuvwxyz
```

#### **5.3 Initialize Prisma & create database**

```bash
# Generate Prisma client
npx prisma generate

# Run migration (create database schema)
npx prisma migrate dev --name init
```

---

### **Step 6: Update Admin Wallet in Seed**

Edit `prisma/seed.ts`:

```typescript
// Lines 32-33, replace these with the newly created wallet:
const adminPublicKey = '0x1234567890abcdef...';  // Public address from step 2
const adminPrivateKey = '0xabcdefgh1234567890...';  // Private key from step 2
```

---

### **Step 7: Run Seed & Create Initial Data**

```bash
npx prisma migrate reset
```

This command will:
- Drop the old database
- Re-run migrations
- Auto-run seed (if configured in package.json)

**Output:**
```
✅ Seed completed successfully!

📝 Login Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👨‍💼 ADMIN (Managed Wallet):
   Username: admin01
   Password: Admin@123456
   Wallet (auto): 0x1234...

👤 USER (Managed Wallet):
   Username: user01
   Password: User@123456
   Wallet (auto): 0xabcd...
   VND Balance: 1,000,000 VND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📱 How to Use the System

### **Step 1: Start the app**

```bash
npm run dev
```

Visit: `http://localhost:3000`

---

### **Step 2: Admin Login & Mint Token**

#### **2.1 Admin login**

- Go to login page: `http://localhost:3000/login`
- Username: `admin01`
- Password: `Admin@123456`

#### **2.2 Admin mint token (optional)**

If more supply is needed, admin goes to **Admin Dashboard → Token Gateway** to mint.

---

### **Step 3: User KYC Verification**

#### **3.1 User login**

- Go to login page: `http://localhost:3000/login`
- Username: `user01`
- Password: `User@123456`

#### **3.2 User submits KYC**

- Go to **User Dashboard → KYC**
- Upload:
   - National ID front
   - National ID back
   - Selfie photo
- Submit request (status: **PENDING**)

#### **3.3 Admin reviews KYC**

- Admin goes to **Admin Dashboard → Users → KYC Requests**
- Review images
- Click **Approve** or **Reject**
- User status changes to **VERIFIED** or **REJECTED**

---

### **Step 4: User Deposits VND into System**

#### **4.1 User submits deposit request**

- Go to **User Dashboard → Wallet → Deposit**
- Enter VND amount to deposit
<!-- - Choose payment method (VNPay/Bank Transfer) -->
- Submit request (status: **PENDING**)

#### **4.2 Admin approves deposit**

- Admin goes to **Admin Dashboard → Transactions → Deposits**
- Confirm bank transaction
- Click **Approve**
- User receives VND in account (status: **SUCCESS**)

---

### **Step 5: User Buys Token (Off-chain)**

#### **5.1 User selects token to buy**

- Go to **User Dashboard → Trade → Buy**
<!-- - Choose stock (TSLA, AAPL, etc.) -->
- Enter quantity to buy
- Review price: `quantity × current price`

#### **5.2 Confirm buy order**

- Click **Buy** → Confirm
- **VND balance ↓**
- **Token balance ↑**
- Transaction status: **SUCCESS**

---

### **Step 6: User Sells Token (Off-chain)**

#### **6.1 User selects token to sell**

- Go to **User Dashboard → Trade → Sell**
<!-- - Choose stock to sell -->
- Enter quantity
- Review amount received: `quantity × current price`

#### **6.2 Confirm sell order**

- Click **Sell** → Confirm
- **Token balance ↓**
- **VND balance ↑**
- Transaction status: **SUCCESS**

---

### **Step 7: User Withdraws Token to Personal Wallet (On-chain)**

- Go to **User Dashboard → Wallet → Withdraw Token**
- Enter token amount to withdraw
- Enter recipient Ethereum wallet (or use the system-created wallet)
- Confirm (smart contract transfers tokens to the user wallet)
---

### **Step 8: User Deposits Token from Personal Wallet (On-chain)**

- Go to **User Dashboard → Wallet → Deposit Token**
- Enter token amount to deposit
- Provide on-chain transaction hash for reconciliation
- Confirm (smart contract transfers tokens from the user wallet)
---

## 🛠️ Useful Commands

| Purpose | Command |
|----------|------|
| Create new wallet | `npx tsx scripts/create-wallet.ts` |
| Reset database & seed | `npx prisma migrate reset` |
| Run seed only | `npx tsx prisma/seed.ts` |
| Start dev server | `npm run dev` |
| Build production | `npm run build` |
| Compile smart contracts | `cd contracts && npx hardhat compile` |
| Deploy contract | `cd contracts && npx hardhat ignition deploy ignition/modules/StockToken.ts --network sepolia` |

---

## 👥 Default Accounts

| Role | Username | Password | Wallet | Wallet Type |
|---------|----------|----------|----|---------| 
| Admin | `admin01` | `Admin@123456` | Created externally (step 2) | Managed |
| User | `user01` | `User@123456` | Auto-generated | Managed |

---

## 🔐 Security

- **Private keys** are AES-256 encrypted before storing in the database
- **WALLET_ENCRYPTION_KEY** must be >= 32 characters; keep it strictly secret
- Never commit `.env` files containing sensitive data

---

## ⚠️ Important Notes

1. **Sepolia ETH**: Test only, no real value
2. **Admin Wallet**: Rotate SEPOLIA_PRIVATE_KEY in production
3. **Database**: SQLite for dev; production should use PostgreSQL
4. **Smart Contract**: Verify on Etherscan before production
5. **Testnet Faucet**: Sepolia ETH may run out; request again after a few days

---

## 📚 Project Structure

```
stock-token/
├── app/                      # Next.js frontend
│   ├── api/                  # API routes
│   ├── (auth)/               # Auth pages
│   ├── (admin)/              # Admin pages
│   └── (user)/               # User pages
├── contracts/                # Smart contracts (Hardhat)
├── lib/                      # Utilities
├── prisma/                   # Database schema
│   ├── schema.prisma
│   └── seed.ts
├── scripts/                  # Helper scripts
│   └── create-wallet.ts
└── .env                      # Environment variables
```

---

## 🐛 Troubleshooting

**Q: "WALLET_ENCRYPTION_KEY is not set"**
- A: Add `WALLET_ENCRYPTION_KEY` to `.env` with >= 32 characters

**Q: "Contract deployment failed"**
- A: Check Sepolia ETH balance, need >= 0.5 ETH

**Q: "Database connection error"**
- A: Run `npx prisma migrate dev` to create the database

**Q: "Private key error"**
- A: Ensure `SEPOLIA_PRIVATE_KEY` has no `0x` prefix

---
