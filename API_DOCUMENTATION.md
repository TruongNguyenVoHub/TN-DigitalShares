# Stock Token - API Documentation

## Table of Contents
- [Authentication APIs](#authentication-apis)
- [User Profile APIs](#user-profile-apis)
- [Payment APIs (VND)](#payment-apis-vnd)
- [Token Management APIs](#token-management-apis)
- [Stock Trading APIs](#stock-trading-apis)
- [Transaction APIs](#transaction-apis)
- [KYC APIs](#kyc-apis)
- [Admin APIs](#admin-apis)

---

## Authentication APIs

### 1. User Login
Đăng nhập hoặc tạo tài khoản mới cho user bằng wallet address.

- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Request Body:**
  ```json
  {
    "walletAddress": "0x1234567890abcdef..."
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Login successful",
    "data": {
      "userId": "cm123abc...",
      "walletAddress": "0x1234567890abcdef...",
      "kycStatus": "PENDING",
      "isWhitelisted": false,
      "role": "USER"
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Wallet address is required"
  }
  ```

---

## User Profile APIs

### 2. Get User Profile
Lấy thông tin chi tiết của user bao gồm số dư VND và Token.

- **Method:** `GET`
- **Endpoint:** `/api/user/[walletAddress]/profile`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Request Body:** None
- **Response:**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "User profile retrieved successfully",
    "data": {
      "walletAddress": "0x1234567890abcdef...",
      "fullName": "Nguyen Van A",
      "vndBalance": 1000000,
      "tokenBalance": 100,
      "kycStatus": "VERIFIED",
      "isWhitelisted": true,
      "role": "USER"
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Wallet address is required"
  }
  ```
  ```json
  {
    "success": false,
    "status": 404,
    "message": "User not found"
  }
  ```

---

## Payment APIs (VND)

### 3. Deposit VND
Nạp tiền VND vào tài khoản.

- **Method:** `POST`
- **Endpoint:** `/api/payment/deposit-vnd`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Request Body:**
  ```json
  {
    "walletAddress": "0x1234567890abcdef...",
    "amount": 1000000
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Deposit request created, waiting for admin approval",
    "data": {
      "walletAddress": "0x1234567890abcdef...",
      "newBalance": 1000000
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Invalid wallet address or amount"
  }
  ```
  ```json
  {
    "success": false,
    "status": 404,
    "message": "User not found"
  }
  ```

**Note:** 
- Transaction được tạo với status `PENDING`
- Balance chưa được cập nhật ngay
- Admin cần approve transaction qua API `/api/admin/approve-transaction`

### 4. Withdraw VND
Rút tiền VND từ tài khoản về ngân hàng.

- **Method:** `POST`
- **Endpoint:** `/api/payment/withdraw-vnd`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Request Body:**
  ```json
  {
    "walletAddress": "0x1234567890abcdef...",
    "amount": 500000,
    "bankInfo": {
      "bankName": "Vietcombank",
      "accountNumber": "1234567890",
      "accountName": "Nguyen Van A"
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Withdraw request created, waiting for admin approval",
    "data": {
      "walletAddress": "0x1234567890abcdef...",
      "remainingBalance": 500000
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Invalid wallet address or amount"
  }
  ```
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Insufficient balance"
  }
  ```
  ```json
  {
    "success": false,
    "status": 404,
    "message": "User not found"
  }
  ```

**Note:** 
- Transaction được tạo với status `PENDING`
- Balance chưa được trừ ngay
- Admin cần approve transaction qua API `/api/admin/approve-transaction`
- Bank info được lưu vào user record để admin xử lý chuyển khoản

---

## Token Management APIs

### 5. Deposit Token (On-chain)
Nạp token từ ví blockchain vào hệ thống bằng cách verify transaction hash.

- **Method:** `POST`
- **Endpoint:** `/api/user/[walletAddress]/deposit-token`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Request Body:**
  ```json
  {
    "txHash": "0xabcdef1234567890..."
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Token deposit successful",
    "data": {
      "walletAddress": "0x1234567890abcdef...",
      "oldToken": 50,
      "newToken": 100,
      "txHash": "0xabcdef1234567890..."
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Wallet address is required"
  }
  ```
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Transaction hash is required"
  }
  ```
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Transaction hash already used. Cannot deposit twice with same transaction."
  }
  ```
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Transaction failed on blockchain"
  }
  ```
  ```json
  {
    "success": false,
    "status": 400,
    "message": "No valid Transfer event found in transaction"
  }
  ```
  ```json
  {
    "success": false,
    "status": 403,
    "message": "Transaction sender does not match your wallet address"
  }
  ```
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Transaction was not sent to company wallet"
  }
  ```
  ```json
  {
    "success": false,
    "status": 404,
    "message": "User not found"
  }
  ```

**Note:** 
- User phải transfer token từ ví của mình đến Company Treasury Wallet trên blockchain trước
- Sau đó gọi API này với txHash để verify và cộng token vào balance
- Hệ thống sẽ verify:
  - Transaction đã success trên blockchain
  - Sender phải là wallet của user
  - Receiver phải là treasury wallet
  - TxHash chưa được sử dụng trước đó (chống replay attack)

### 6. Withdraw Token (On-chain)
Rút token từ hệ thống về ví blockchain của user.

- **Method:** `POST`
- **Endpoint:** `/api/user/[walletAddress]/withdraw-token`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Request Body:**
  ```json
  {
    "amount": 50
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Token withdraw successful",
    "data": {
      "walletAddress": "0x1234567890abcdef...",
      "oldToken": 100,
      "newToken": 50,
      "txHash": "0xabcdef1234567890..."
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "status": 400,
    "message": "walletAddress is required"
  }
  ```
  ```json
  {
    "success": false,
    "status": 400,
    "message": "amount must be a positive number"
  }
  ```
  ```json
  {
    "success": false,
    "status": 404,
    "message": "User not found"
  }
  ```

**Note:** 
- Hệ thống sẽ transfer token từ treasury wallet đến ví của user trên blockchain
- Transaction hash sẽ được trả về để user có thể track trên blockchain explorer

---

## Stock Trading APIs

### 7. Get Stock Price
Lấy giá hiện tại của token cổ phiếu từ blockchain.

- **Method:** `GET`
- **Endpoint:** `/api/stock/price`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Request Body:** None
- **Response:**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Stock price fetched successfully",
    "data": {
      "price": "50000"
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "error": "Failed to fetch stock price"
  }
  ```

**Note:** Giá được trả về là giá VND/token (đã chia cho 10^7 để convert từ wei)

### 8. Buy Token
Mua token cổ phiếu bằng VND (off-chain trading).

- **Method:** `POST`
- **Endpoint:** `/api/trade/buy`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Request Body:**
  ```json
  {
    "walletAddress": "0x1234567890abcdef...",
    "amountToken": 10
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Token purchase successful",
    "data": {
      "walletAddress": "0x1234567890abcdef...",
      "userToken": 110
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "status": 400,
    "message": "walletAddress is required"
  }
  ```
  ```json
  {
    "success": false,
    "status": 400,
    "message": "amountToken must be a positive number"
  }
  ```
  ```json
  {
    "success": false,
    "status": 404,
    "message": "User not found"
  }
  ```
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Insufficient VND balance"
  }
  ```

**Note:** 
- Giao dịch diễn ra off-chain (không ghi trên blockchain)
- User dùng VND balance để mua token
- Token balance sẽ được cập nhật trong database

### 9. Sell Token
Bán token cổ phiếu đổi lấy VND (off-chain trading).

- **Method:** `POST`
- **Endpoint:** `/api/trade/sell`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Request Body:**
  ```json
  {
    "walletAddress": "0x1234567890abcdef...",
    "amountToken": 10
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Token sale successful",
    "data": {
      "walletAddress": "0x1234567890abcdef...",
      "userToken": 90
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "status": 400,
    "message": "walletAddress is required"
  }
  ```
  ```json
  {
    "success": false,
    "status": 400,
    "message": "amountToken must be a positive number"
  }
  ```
  ```json
  {
    "success": false,
    "status": 404,
    "message": "User not found"
  }
  ```
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Insufficient token balance"
  }
  ```

**Note:** 
- Giao dịch diễn ra off-chain (không ghi trên blockchain)
- User bán token để nhận VND vào balance
- Token balance sẽ giảm, VND balance sẽ tăng

---

## Transaction APIs

### 10. Get User Transactions
Lấy danh sách tất cả giao dịch của user.

- **Method:** `GET`
- **Endpoint:** `/api/user/[walletAddress]/transaction`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Request Body:** None
- **Response:**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "User transactions retrieved successfully",
    "data": {
      "transactions": [
        {
          "id": "cm123abc...",
          "type": "DEPOSIT",
          "amountVND": 1000000,
          "status": "SUCCESS",
          "createdAt": "2025-12-29T10:30:00.000Z"
        },
        {
          "id": "cm456def...",
          "type": "BUY_STOCK",
          "stockSymbol": "TSLA",
          "stockPrice": 50000,
          "amountVND": 500000,
          "amountToken": 10,
          "status": "SUCCESS",
          "createdAt": "2025-12-29T11:00:00.000Z"
        },
        {
          "id": "cm789ghi...",
          "type": "DEPOSIT_TOKEN_ONCHAIN",
          "amountToken": 50,
          "amountVND": 0,
          "txHash": "0xabcdef1234567890...",
          "status": "SUCCESS",
          "createdAt": "2025-12-29T12:00:00.000Z"
        },
        {
          "id": "cm012jkl...",
          "type": "SELL_STOCK",
          "stockPrice": 52000,
          "amountVND": 520000,
          "amountToken": 10,
          "status": "SUCCESS",
          "createdAt": "2025-12-29T13:00:00.000Z"
        }
      ]
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Wallet address is required"
  }
  ```
  ```json
  {
    "success": false,
    "status": 404,
    "message": "User not found"
  }
  ```

**Transaction Types:**
- `DEPOSIT` - Nạp VND vào hệ thống
- `WITHDRAW` - Rút VND về ngân hàng
- `BUY_STOCK` - Mua token bằng VND (off-chain)
- `SELL_STOCK` - Bán token đổi VND (off-chain)
- `DEPOSIT_TOKEN_ONCHAIN` - Nạp token từ ví vào hệ thống (on-chain)
- `WITHDRAW_TOKEN_ONCHAIN` - Rút token từ hệ thống về ví (on-chain)

**Response Fields:**
- `id`: Transaction ID
- `type`: Loại giao dịch
- `stockSymbol`: Mã cổ phiếu (chỉ có khi type là BUY_STOCK hoặc SELL_STOCK)
- `stockPrice`: Giá khớp lệnh tại thời điểm giao dịch (VND)
- `amountVND`: Số tiền VND liên quan
- `amountToken`: Số lượng token (nếu có)
- `status`: Trạng thái giao dịch (PENDING, SUCCESS, FAILED)
- `txHash`: Hash transaction trên blockchain (chỉ có khi giao dịch on-chain)
- `refCode`: Mã tham chiếu VNPay (nếu có)
- `createdAt`: Thời gian tạo giao dịch

---

## KYC APIs

### 11. Submit KYC
Gửi yêu cầu xác thực danh tính (KYC).

- **Method:** `POST`
- **Endpoint:** `/api/user/kyc/submit`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Request Body:**
  ```json
  {
    "walletAddress": "0x1234567890abcdef...",
    "idCardNumber": "012345678901",
    "idCardImageFront": "https://example.com/id-front.jpg",
    "idCardImageBack": "https://example.com/id-back.jpg",
    "selfieImage": "https://example.com/selfie.jpg"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "KYC submission successful",
    "data": {
      "walletAddress": "0x1234567890abcdef...",
      "idCardNumber": "012345678901",
      "idCardImageFront": "https://example.com/id-front.jpg",
      "idCardImageBack": "https://example.com/id-back.jpg",
      "selfieImage": "https://example.com/selfie.jpg",
      "status": "PENDING"
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "error": "Missing required fields: walletAddress, idCardNumber, idCardImageFront, idCardImageBack, selfieImage"
  }
  ```

---

## Admin APIs

### 12. KYC Decision (Admin Only)
Phê duyệt hoặc từ chối yêu cầu KYC của user.

- **Method:** `POST`
- **Endpoint:** `/api/admin/kyc/decision`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Request Body:**
  ```json
  {
    "requestId": "cmjp4ddfc000fum04l63uohzk",
    "decision": "APPROVED",
    "extractedName": "Nguyen Van A",
    "reason": ""
  }
  ```
  *Note: `decision` phải là `"APPROVED"` hoặc `"REJECTED"`*
- **Response:**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "KYC request cmjp4ddfc000fum04l63uohzk has been APPROVED",
    "data": {
      "requestId": "cmjp4ddfc000fum04l63uohzk",
      "decision": "APPROVED",
      "reason": ""
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Missing required fields: requestId, decision"
  }
  ```
  ```json
  {
    "success": false,
    "status": 404,
    "message": "KYC request not found"
  }
  ```

**Note:**
- Khi KYC được APPROVED:
  - User status sẽ chuyển thành `VERIFIED`
  - User sẽ được tự động thêm vào whitelist trên blockchain
  - User có thể bắt đầu giao dịch token
- Khi KYC bị REJECTED:
  - User status sẽ chuyển thành `REJECTED`
  - Cần cung cấp `reason` để user biết lý do

### 13. Approve Transaction (Admin Only)
Admin phê duyệt hoặc từ chối yêu cầu nạp/rút tiền VND.

- **Method:** `POST`
- **Endpoint:** `/api/admin/approve-transaction`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Request Body:**
  ```json
  {
    "transactionId": "cm123abc...",
    "action": "approve"
  }
  ```
  *Note: `action` phải là `"approve"` hoặc `"reject"`*
- **Response (Approve):**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Transaction approved successfully",
    "data": {
      "transactionId": "cm123abc...",
      "status": "SUCCESS"
    }
  }
  ```
- **Response (Reject):**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Transaction rejected",
    "data": {
      "transactionId": "cm123abc...",
      "status": "FAILED"
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Missing transactionId or action"
  }
  ```
  ```json
  {
    "success": false,
    "status": 404,
    "message": "Transaction not found"
  }
  ```
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Transaction is not pending"
  }
  ```
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Insufficient balance"
  }
  ```

**Note:**
- Chỉ approve/reject được transaction có status `PENDING`
- Khi approve DEPOSIT: Cập nhật status → SUCCESS và cộng tiền vào balance user
- Khi approve WITHDRAW: Kiểm tra balance lần nữa, nếu đủ thì trừ tiền và cập nhật status → SUCCESS
- Khi reject: Cập nhật status → FAILED, không thay đổi balance
- Admin cần xử lý chuyển khoản ngân hàng ngoài hệ thống (đối với withdraw)

### 14. Import Stock Inventory (Admin Only)
Admin nhập kho cổ phiếu thật và mint token tương ứng trên blockchain.

- **Method:** `POST`
- **Endpoint:** `/api/admin/inventory/import`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Request Body:**
  ```json
  {
    "symbol": "TNT",
    "quantity": 1000,
    "proofUrl": "https://example.com/proof.pdf",
    "adminId": "cm123abc..."
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Stock imported successfully",
    "data": {
      "logId": "cm456def...",
      "txHash": "0xabcdef1234567890...",
      "newTotalSupply": 1000
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "error": "Internal server error"
  }
  ```

**Note:**
- API này sẽ mint token trên blockchain
- Token được mint vào treasury wallet (admin wallet)
- Giao dịch sẽ được ghi vào InventoryLog với proofUrl
- Total supply sẽ được cập nhật trong StockInventory

### 14. Export Stock Inventory (Admin Only)
Admin xuất kho cổ phiếu và burn token tương ứng trên blockchain.

- **Method:** `POST`
- **Endpoint:** `/api/admin/inventory/export`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Request Body:**
  ```json
  {
    "symbol": "TNT",
    "quantity": 500,
    "proofUrl": "https://example.com/proof.pdf",
    "adminId": "cm123abc..."
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Stock exported successfully",
    "data": {
      "logId": "cm789ghi...",
      "txHash": "0xfedcba0987654321...",
      "newTotalSupply": 500
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "status": 404,
    "message": "Stock inventory not found"
  }
  ```
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Insufficient shares in inventory"
  }
  ```
  ```json
  {
    "success": false,
    "error": "Internal server error"
  }
  ```

**Note:**
- API này sẽ burn token trên blockchain
- Token được burn từ treasury wallet (admin wallet)
- Giao dịch sẽ được ghi vào InventoryLog với proofUrl
- Total supply sẽ giảm đi trong StockInventory

---

## Common Response Format

Tất cả API đều trả về format chung:

```typescript
{
  success: boolean,    // true = thành công, false = lỗi
  status: number,      // HTTP status code (200, 400, 403, 404, 500, ...)
  message: string,     // Thông báo mô tả kết quả
  data?: object        // Dữ liệu trả về (tùy API)
}
```

## HTTP Status Codes

- **200** - OK: Request thành công
- **400** - Bad Request: Dữ liệu đầu vào không hợp lệ hoặc logic business bị vi phạm
- **403** - Forbidden: Không có quyền thực hiện hành động
- **404** - Not Found: Không tìm thấy resource
- **500** - Internal Server Error: Lỗi server

---

## System Architecture

### On-chain vs Off-chain

Hệ thống hoạt động theo mô hình hybrid:

**On-chain (Blockchain):**
- Deposit Token: User chuyển token từ ví → Treasury Wallet
- Withdraw Token: System chuyển token từ Treasury Wallet → User
- Import Stock: Admin mint token mới (phát hành)
- Export Stock: Admin burn token (giảm supply)
- KYC Whitelist: Thêm/xóa địa chỉ được phép giao dịch

**Off-chain (Database):**
- Deposit/Withdraw VND
- Buy/Sell Token (giao dịch nội bộ)
- KYC submission và approval
- Transaction history tracking
- User balance tracking (VND và Token)

### Transaction Flow

**Nạp Token vào hệ thống:**
1. User transfer token từ ví → Treasury Wallet trên blockchain
2. User submit txHash qua API `/api/user/[walletAddress]/deposit-token`
3. System verify transaction trên blockchain
4. Cộng token vào database balance của user

**Rút Token ra khỏi hệ thống:**
1. User gọi API `/api/user/[walletAddress]/withdraw-token`
2. System transfer token từ Treasury Wallet → User wallet
3. Trừ token trong database balance của user
4. Return txHash để user track

**Mua/Bán Token (Trading):**
1. User dùng VND balance để mua/bán token
2. Giao dịch diễn ra hoàn toàn off-chain
3. Chỉ cập nhật số dư VND và Token trong database
4. Không có transaction trên blockchain

---

## Notes

1. **Wallet Address**: Tất cả API yêu cầu `walletAddress` hợp lệ (Ethereum address format). Địa chỉ sẽ được tự động normalize về lowercase.

2. **KYC Status**: 
   - `PENDING`: User vừa tạo tài khoản hoặc vừa submit KYC
   - `VERIFIED`: KYC đã được approved, có thể giao dịch
   - `REJECTED`: KYC bị từ chối, cần submit lại

3. **Whitelist**: Sau khi KYC approved, user được tự động thêm vào whitelist của Smart Contract. Chỉ user trong whitelist mới có thể nhận token từ contract.

4. **Blockchain Transactions**: 
   - Deposit Token: User tự transfer, system chỉ verify
   - Withdraw Token: System transfer và trả về txHash
   - Import/Export Stock: Admin operations, mint/burn token
   - Trading (Buy/Sell): Không ghi lên blockchain

5. **Balance Tracking**: 
   - `vndBalance`: Số dư VND off-chain trong database
   - `tokenBalance`: Số token off-chain tracking trong database (để giao dịch nhanh)
   - Token thật luôn được lưu trên blockchain và có thể rút về ví bất cứ lúc nào

6. **Security Features**:
   - Transaction hash replay attack prevention
   - Verify sender/receiver trong deposit token
   - Normalize wallet address để tránh duplicate
   - Check allowance trong sell operations (commented out)

7. **Admin Operations**:
   - Chỉ admin có quyền import/export stock
   - Chỉ admin có quyền approve/reject KYC
   - Admin wallet là treasury wallet nhận/gửi token

8. **Price Mechanism**:
   - Giá token được lưu trên blockchain (latestPrice)
   - Giá được chia cho 10^7 để convert từ wei sang VND
   - Mọi giao dịch đều sử dụng giá realtime từ blockchain
