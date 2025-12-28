# Stock Token - API Documentation

## Table of Contents
- [Authentication APIs](#authentication-apis)
- [Payment APIs](#payment-apis)
- [Stock Trading APIs](#stock-trading-apis)
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

## Payment APIs

### 2. Deposit VND
Nạp tiền VND vào tài khoản.

- **Method:** `POST`
- **Endpoint:** `/api/payment/deposit`
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
    "message": "Deposit successful",
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

### 3. Withdraw VND
Rút tiền VND từ tài khoản về ngân hàng.

- **Method:** `POST`
- **Endpoint:** `/api/payment/withdraw`
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
      "accountNumber": "1234567890"
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "status": 200,
    "message": "Withdraw successful",
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
    "message": "Insufficient balance"
  }
  ```

---

## Stock Trading APIs

### 4. Get Stock Price
Lấy giá hiện tại của token cổ phiếu.

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

### 5. Buy Token
Mua token cổ phiếu bằng VND.

- **Method:** `POST`
- **Endpoint:** `/api/trand/buy`
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
      "txHash": "0xabcdef1234567890...",
      "userToken": 10
    }
  }
  ```
- **Error Response:**
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

---

## KYC APIs

### 6. Submit KYC
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

### 7. KYC Decision (Admin Only)
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
    "status": 404,
    "message": "KYC request not found"
  }
  ```

### 8. Import Stock Inventory (Admin Only)
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

---

## Common Response Format

Tất cả API đều trả về format chung:

```typescript
{
  success: boolean,    // true = thành công, false = lỗi
  status: number,      // HTTP status code (200, 400, 404, 500, ...)
  message: string,     // Thông báo mô tả kết quả
  data?: object        // Dữ liệu trả về (tùy API)
}
```

## HTTP Status Codes

- **200** - OK: Request thành công
- **400** - Bad Request: Dữ liệu đầu vào không hợp lệ
- **404** - Not Found: Không tìm thấy resource
- **500** - Internal Server Error: Lỗi server

---

## Notes

1. **Wallet Address**: Tất cả API yêu cầu `walletAddress` hợp lệ (Ethereum address format).
2. **KYC Status**: User phải hoàn thành KYC và được approved mới có thể giao dịch token.
3. **Whitelist**: Sau khi KYC approved, user được tự động thêm vào whitelist của Smart Contract.
4. **Blockchain Transactions**: Các API liên quan đến token (buy, transfer) sẽ tạo transaction trên blockchain và trả về `txHash`.
5. **Token vs VND**: 
   - `vndBalance`: Số dư VND off-chain trong database
   - `tokenBalance`: Số token off-chain (chỉ tracking, số thật lấy từ blockchain)
