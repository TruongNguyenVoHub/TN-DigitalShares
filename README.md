# 🚀 TN-DigitalShares: Nền tảng Quản trị & Giao dịch Cổ phần Nội bộ (ESOP 4.0)

***"Đừng để cổ phần của nhân viên chỉ là những con số vô hồn trên Excel."***

Giải pháp hybrid (Web2 x Blockchain) giúp biến cổ phiếu thưởng (ESOP) thành tài sản số thực sự: minh bạch, thanh khoản cao, an toàn.

### 💥 Nỗi đau hiện tại (Doanh nghiệp & Nhân viên)
- **Tù mù thông tin**: ESOP chỉ là tờ giấy/PDF, nhân viên không thấy giá trị thực.
- **"Địa ngục" Excel**: danh sách cổ đông thủ công, dễ sai, dễ bị sửa, mất dữ liệu.
- **Thanh khoản bằng 0**: muốn bán cổ phần phải chờ duyệt, xử lý giấy tờ rất lâu.

### 💡 Giải pháp TN-DigitalShares
- **Hybrid không rào cản**: đăng nhập username/password, hệ thống tự tạo ví (Managed Wallet); hỗ trợ kết nối ví Web3 cho người dùng nâng cao nếu cần.
- **Giao dịch off-chain tức thì, không phí gas**; tài sản gốc được bảo chứng 1:1 on-chain.
- **Proof of Reserve**: mọi đợt mint phải có bằng chứng nhập kho; whitelist/KYC bắt buộc.

### 💎 Tại sao Doanh nghiệp CẦN hệ thống này?

- **Sở hữu thật, động lực thật:** ESOP không còn là giấy hứa hẹn; nhân viên mở app thấy số dư, biểu đồ, và token trong ví → cảm giác sở hữu rõ ràng, giữ chân nhân tài tốt hơn.
- **Thanh khoản nội bộ ngay lập tức:** Tạo “sàn thu nhỏ” cho nhân viên mua bán P2P, giải quyết bài toán tài sản chết mà không cần chờ IPO; biến cổ phần thành “ATM nội bộ”.
- **Dữ liệu sạch, IPO/M&A-ready:** Lịch sử giao dịch bất biến trên blockchain, đối soát tự động; rút ngắn due diligence từ tháng xuống ngày, tăng uy tín với nhà đầu tư.
- **Huy động vốn từ chính nội bộ:** Bán cổ phần ưu đãi (Stock Purchase Plan) ngay trên app, khai thác nguồn vốn rẻ từ nhân viên, gắn lợi ích “vừa làm vừa là cổ đông”.
- **Tech-forward, hút nhân tài:** Trải nghiệm không ma sát (login username/password, hệ thống lo ví và gas) giúp doanh nghiệp nhìn hiện đại trong mắt ứng viên Gen Z/tech, nâng thương hiệu tuyển dụng.

### ⚖️ Pháp lý & Tuân thủ (Legal & Compliance)

**Nguyên tắc:** Compliance-first, token nội bộ (Private Placement), không phát hành ra công chúng. Token TNT là “digital twin” của ESOP, không phải tiền tệ giao dịch công khai.

**Đã xử lý:**
- **KYC/AML + Smart Contract Whitelist**: chỉ ví đã định danh mới gửi/nhận, truy vết 1:1 người dùng–ví.
- **Proof of Reserve & Anti-dilution**: mọi mint/burn on-chain kèm bằng chứng, tổng cung minh bạch.
- **Private Placement**: giới hạn phạm vi nội bộ, không ICO/IPO công khai; tuân thủ Luật DN/CK về phát hành riêng lẻ.
- **Audit trail & thuế**: lưu toàn bộ lịch sử giao dịch để tính/khai báo thuế TNCN chuyển nhượng vốn (0.1%).

**Tồn tại & hướng xử lý:**
- **Giá trị pháp lý cuối cùng**: Sổ đăng ký cổ đông gốc vẫn là căn cứ cao nhất; blockchain là bản sao số, định kỳ đồng bộ.
- **Trung gian thanh toán**: số dư VND là tiền ký quỹ/hạn mức nội bộ, không dùng thanh toán hàng hóa/dịch vụ ngoài; khuyến nghị nạp/rút qua ngân hàng, hệ thống chỉ ghi trạng thái.
- **Bảo vệ dữ liệu cá nhân**: KYC và private key cần mã hóa (AES-256 đã áp dụng cho key); triển khai thêm encryption-at-rest cho dữ liệu KYC và tuân thủ NĐ 13/2023/NĐ-CP khi lên production.

**Miễn trừ trách nhiệm:**
- TN-DigitalShares là SaaS quản trị nội bộ, không phải sàn giao dịch chứng khoán hay tổ chức tín dụng.
- Token TNT chỉ lưu hành nội bộ, không có giá trị thanh toán bên ngoài và không được bảo lãnh bởi tổ chức tài chính.
- Doanh nghiệp vận hành chịu trách nhiệm tuân thủ pháp luật, điều lệ công ty và nghĩa vụ thuế khi phát hành/định giá/trao đổi token.

### 🔥 Tính năng chính
- **🏦 Cổng giao dịch P2P**: mua/bán cổ phần giữa nhân viên với nhau hoặc với công ty.
- **🔐 Managed Wallet**: tạo ví blockchain tự động khi đăng ký, xoá rào cản kỹ thuật.
- **📜 Smart Contract**: sổ cái minh bạch, không thể tẩy xoá; kiểm soát phát hành.
- **👮‍♂️ Whitelist + KYC**: chỉ ví định danh mới được nắm giữ token.
- **💰 Proof of Reserve**: admin mint token phải có bằng chứng nhập kho.


### 🛠️ Tech Stack (đúng với code hiện tại)
- **Blockchain**: Solidity (ERC20 + AccessControl), Hardhat, testnet Sepolia (Ethereum).
- **App (FE + BE)**: Next.js (App Router) + TypeScript. API routes/route handlers chạy trên Next (không dùng Express riêng).
- **Data**: Prisma ORM (SQLite cho dev; sẵn sàng chuyển Postgres cho prod).
- **Wallet Security**: AES-256 encrypt private key (WALLET_ENCRYPTION_KEY ≥ 32 chars).
- **UI**: Tailwind CSS UI kit.

---

## 📋 Quy Trình Triển Khai & Sử Dụng

### **Bước 1: Clone Project & Cài Đặt Thư Viện**

```bash
# Clone repository
git clone <your-repo-url>
cd stock-token

# Cài đặt dependencies
npm install
```

---

### **Bước 2: Tạo Ví Admin (Managed Wallet)**

Chạy script để tạo ví Ethereum mới cho admin:

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

**Lưu lại 2 giá trị này, sẽ dùng ở bước tiếp theo.**

---

### **Bước 3: Xin Sepolia ETH**

Vào các faucet sau để lấy test ETH cho ví admin vừa tạo:

- [Sepolia Faucet (Alchemy)](https://sepoliafaucet.com/)
- [Sepolia Faucet (Infura)](https://www.infura.io/faucet/sepolia)
- [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)

Cần ~0.5 ETH cho deploy + verify contract.

---

### **Bước 4: Cấu Hình Smart Contract & Deploy**

#### **4.1 Cài đặt dependencies trong thư mục contracts**

```bash
cd contracts
npm install
```

#### **4.2 Tạo file `.env` trong thư mục `contracts/`**

```bash
cp env.example .env
```

Điền các giá trị:

```env
# Sepolia RPC URL (lấy từ Infura/Alchemy/QuickNode)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Private key admin từ bước 2 (không có 0x prefix)
SEPOLIA_PRIVATE_KEY=abcdefgh1234567890...

# Etherscan API key (để verify contract)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Admin wallet address
DEFAULT_ADMIN=0x1234567890abcdef...

# Addresses for roles (có thể dùng cùng admin wallet lúc test)
INVENTORY_MANAGER=0x1234567890abcdef...
COMPLIANCE_ADDRESS=0x1234567890abcdef...

# Chainlink Price Feed (đã có sẵn cho Sepolia)
PRICE_ORACLE_ADDRESS=0x694AA1769357215DE4FAC081bf1f309aDC325306
```

#### **4.3 Deploy Smart Contract**

```bash
# Compile contracts
npx hardhat compile

# Deploy lên Sepolia (sử dụng Ignition)
npx hardhat ignition deploy ignition/modules/StockToken.ts --network sepolia
```

**Lưu lại `CONTRACT_ADDRESS` từ output, sẽ dùng ở bước 6.**

#### **4.4 Verify Contract trên Etherscan**

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

---

### **Bước 5: Cấu Hình Backend & Database**

#### **5.1 Quay lại thư mục gốc**

```bash
cd ..
```

#### **5.2 Tạo file `.env` ở thư mục gốc**

```bash
cp env.example .env
```

Điền các giá trị:

```env
# Database (SQLite)
DATABASE_URL="file:./prisma/dev.db"

# Smart Contract
CONTRACT_ADDRESS=0x1234567890abcdef...      # Từ bước 4.3
SEPOLIA_PRIVATE_KEY=abcdefgh1234567890...   # Từ bước 2 (không có 0x prefix)
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Frontend
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890abcdef...
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_TREASURY_ADDRESS=0x1234567890abcdef...  # Có thể dùng admin wallet

# Wallet Encryption Key (MUST be >= 32 characters, keep SECRET!)
WALLET_ENCRYPTION_KEY=your-super-secret-encryption-key-min-32-characters-abcdefghijklmnopqrstuvwxyz
```

#### **5.3 Khởi tạo Prisma & tạo Database**

```bash
# Generate Prisma client
npx prisma generate

# Chạy migration (tạo database schema)
npx prisma migrate dev --name init
```

---

### **Bước 6: Cập Nhật Admin Wallet trong Seed**

Sửa file `prisma/seed.ts`:

```typescript
// Dòng 32-33, thay các giá trị này bằng ví vừa tạo:
const adminPublicKey = '0x1234567890abcdef...';  // Public address từ bước 2
const adminPrivateKey = '0xabcdefgh1234567890...';  // Private key từ bước 2
```

---

### **Bước 7: Chạy Seed & Tạo Dữ Liệu Ban Đầu**

```bash
npx prisma migrate reset
```

Lệnh này sẽ:
- Xóa database cũ
- Chạy lại migrations
- Tự động chạy seed (nếu cấu hình trong package.json)

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

## 📱 Quy Trình Sử Dụng Hệ Thống

### **Bước 1: Khởi động ứng dụng**

```bash
npm run dev
```

Truy cập: `http://localhost:3000`

---

### **Bước 2: Admin Đăng Nhập & Mint Token**

#### **2.1 Đăng nhập Admin**

- Vào trang login: `http://localhost:3000/login`
- Username: `admin01`
- Password: `Admin@123456`

#### **2.2 Admin Mint Token (Optional)**

Nếu cần mint thêm, admin vào **Admin Dashboard → Token Gateway** để mint.

---

### **Bước 3: User KYC Verification**

#### **3.1 User Đăng Nhập**

- Vào trang login: `http://localhost:3000/login`
- Username: `user01`
- Password: `User@123456`

#### **3.2 User Gửi KYC**

- Vào **User Dashboard → KYC**
- Upload:
  - CCCD mặt trước
  - CCCD mặt sau
  - Ảnh selfie
- Gửi yêu cầu (status: **PENDING**)

#### **3.3 Admin Duyệt KYC**

- Admin vào **Admin Dashboard → Users → KYC Requests**
- Review hình ảnh
- Click **Approve** hoặc **Reject**
- User status thay đổi thành **VERIFIED** hoặc **REJECTED**

---

### **Bước 4: User Nạp VND vào Hệ Thống**

#### **4.1 User Yêu Cầu Nạp**

- Vào **User Dashboard → Wallet → Deposit**
- Nhập số tiền VND muốn nạp
<!-- - Chọn phương thức thanh toán (VNPay/Bank Transfer) -->
- Gửi yêu cầu (status: **PENDING**)

#### **4.2 Admin Duyệt Deposit**

- Admin vào **Admin Dashboard → Transactions → Deposits**
- Xác nhận giao dịch từ ngân hàng
- Click **Approve**
- User nhận tiền VND vào tài khoản (status: **SUCCESS**)

---

### **Bước 5: User Mua Token (Offchain)**

#### **5.1 User Chọn Token Mua**

- Vào **User Dashboard → Trade → Buy**
<!-- - Chọn cổ phiếu (TSLA, AAPL, v.v.) -->
- Nhập số lượng token muốn mua
- Review giá tính theo: `số lượng × giá hiện tại`

#### **5.2 Xác Nhận Lệnh Mua**

- Click **Buy** → Xác nhận
- **VND balance ↓**
- **Token balance ↑**
- Transaction status: **SUCCESS**

---

### **Bước 6: User Bán Token (Offchain)**

#### **6.1 User Chọn Token Bán**

- Vào **User Dashboard → Trade → Sell**
<!-- - Chọn cổ phiếu muốn bán -->
- Nhập số lượng token
- Review giá nhận lại: `số lượng × giá hiện tại`

#### **6.2 Xác Nhận Lệnh Bán**

- Click **Sell** → Xác nhận
- **Token balance ↓**
- **VND balance ↑**
- Transaction status: **SUCCESS**

---

### **Bước 7: User Rút Token Về Ví Cá Nhân (Onchain)**

- Vào **User Dashboard → Wallet → Withdraw Token**
- Nhập số lượng token muốn rút
- Nhập ví Ethereum nhận token (hoặc dùng ví được hệ thống tạo sẵn)
- Xác nhận (Smart contract sẽ transfer token đến ví user)
---

### **Bước 8: User Nạp Lại Token Từ Ví Cá Nhân (Onchain)**

- Vào **User Dashboard → Wallet → Deposit Token**
- Nhập số lượng token muốn nạp
- User cung cấp mã giao dịch on-chain để hệ thống đối soát
- Xác nhận (Smart contract sẽ transfer token từ ví user)
---

## 🛠️ Lệnh Hữu Ích

| Mục Đích | Lệnh |
|----------|------|
| Tạo ví mới | `npx tsx scripts/create-wallet.ts` |
| Reset database & seed | `npx prisma migrate reset` |
| Chỉ chạy seed | `npx tsx prisma/seed.ts` |
| Khởi động dev server | `npm run dev` |
| Build production | `npm run build` |
| Compile smart contracts | `cd contracts && npx hardhat compile` |
| Deploy contract | `cd contracts && npx hardhat ignition deploy ignition/modules/StockToken.ts --network sepolia` |

---

## 👥 Tài Khoản Mặc Định

| Vai Trò | Username | Password | Ví | Loại Ví |
|---------|----------|----------|----|---------| 
| Admin | `admin01` | `Admin@123456` | Được tạo bên ngoài (bước 2) | Managed |
| User | `user01` | `User@123456` | Được sinh tự động | Managed |

---

## 🔐 Bảo Mật

- **Private keys** được mã hóa AES-256 trước khi lưu database
- **WALLET_ENCRYPTION_KEY** phải có >= 32 ký tự, giữ bí mật tuyệt đối
- Không bao giờ commit file `.env` chứa sensitive data

---

## ⚠️ Lưu Ý Quan Trọng

1. **Sepolia ETH**: Chỉ dùng cho test, không có giá trị thực
2. **Admin Wallet**: Thay đổi SEPOLIA_PRIVATE_KEY trên production
3. **Database**: Dùng SQLite cho dev, production cần PostgreSQL
4. **Smart Contract**: Phải verify trên Etherscan trước khi production
5. **Testnet Faucet**: Sepolia ETH có thể hết, cần xin lại sau một vài ngày

---

## 📚 Cấu Trúc Dự Án

```
stock-token/
├── app/                      # Next.js Frontend
│   ├── api/                  # API Routes
│   ├── (auth)/               # Auth Pages
│   ├── (admin)/              # Admin Pages
│   └── (user)/               # User Pages
├── contracts/                # Smart Contracts (Hardhat)
├── lib/                      # Utilities
├── prisma/                   # Database Schema
│   ├── schema.prisma
│   └── seed.ts
├── scripts/                  # Helper Scripts
│   └── create-wallet.ts
└── .env                      # Environment Variables
```

---

## 🐛 Troubleshooting

**Q: "WALLET_ENCRYPTION_KEY is not set"**
- A: Thêm `WALLET_ENCRYPTION_KEY` vào `.env` với >= 32 ký tự

**Q: "Contract deployment failed"**
- A: Kiểm tra Sepolia ETH balance, cần >= 0.5 ETH

**Q: "Database connection error"**
- A: Chạy `npx prisma migrate dev` để tạo database

**Q: "Private key error"**
- A: Kiểm tra `SEPOLIA_PRIVATE_KEY` không có `0x` prefix

---
