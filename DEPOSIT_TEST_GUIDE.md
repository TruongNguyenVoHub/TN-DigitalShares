# Hướng dẫn Test Deposit Token

## ✅ Đã implement xong

### Backend:
1. ✅ `transactionRepository.findByTxHash()` - Check duplicate
2. ✅ `stockTokenRepository.getTransactionReceipt()` - Lấy receipt từ blockchain
3. ✅ `stockTokenRepository.parseTransferEvent()` - Parse ERC20 Transfer event
4. ✅ `stockTokenRepository.verifyDepositTransaction()` - Verify đầy đủ
5. ✅ `userService.depositToken()` - Service xử lý deposit với verification
6. ✅ `POST /api/user/[walletAddress]/deposit-token` - API endpoint

### Frontend:
7. ✅ `/user/deposit-token` - UI page với 4 bước
8. ✅ Tích hợp wagmi để transfer token
9. ✅ Tự động gọi API sau khi transfer thành công

## 🧪 Cách Test

### Bước 1: Chuẩn bị
```bash
# 1. Stop server
Ctrl+C

# 2. Generate Prisma
npx prisma generate

# 3. Restart server
npm run dev
```

### Bước 2: Kiểm tra .env
Đảm bảo có đầy đủ:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x73AC7fC7343e96D49Eb9B3835D7052492A5212f6
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/...
NEXT_PUBLIC_TREASURY_ADDRESS=0x5D0076ed6CfF3e9974FA81c6D1471DD155261Ca7
```

### Bước 3: Test trên UI

#### A. Truy cập trang deposit
```
http://localhost:3000/user/deposit-token
```

#### B. Connect wallet
- Nhấn "Kết nối ví"
- Chọn MetaMask
- Switch sang Sepolia network

#### C. Thực hiện deposit
1. Nhập số lượng: `10` token
2. Nhấn "Nạp Token"
3. MetaMask popup → **Confirm**
4. Đợi ~15-30 giây (Step 2: Confirm)
5. Tự động verify (Step 3: Verify)
6. Hoàn tất (Step 4: Done)

**Kết quả mong đợi:**
```
✅ Nạp token thành công! Số dư mới: X token
```

### Bước 4: Test API trực tiếp (Optional)

#### A. Lấy txHash từ một transaction thật
1. Chuyển token từ ví sang Treasury trên Metamask
2. Copy txHash (ví dụ: `0xabc123...`)

#### B. Gọi API
```bash
curl -X POST http://localhost:3000/api/user/0xYOUR_ADDRESS/deposit-token \
  -H "Content-Type: application/json" \
  -d '{"txHash":"0xabc123..."}'
```

**Response mong đợi:**
```json
{
  "success": true,
  "status": 200,
  "message": "Token deposit successful",
  "data": {
    "walletAddress": "0x...",
    "oldToken": 100,
    "newToken": 110,
    "txHash": "0xabc123..."
  }
}
```

## 🔒 Các Case Test Quan Trọng

### Case 1: Deposit bình thường ✅
- Transfer 10 token → Treasury
- API verify thành công
- Cộng 10 vào balance

### Case 2: Duplicate txHash ❌
- Dùng lại txHash cũ
- Expected: `"Transaction hash already used"`

### Case 3: Sai người gửi ❌
- Dùng txHash của người khác
- Expected: `"Transaction sender does not match"`

### Case 4: Chuyển sai địa chỉ ❌
- Transfer đến địa chỉ khác (không phải Treasury)
- Expected: `"Transaction was not sent to company wallet"`

### Case 5: Transaction failed ❌
- TxHash của transaction bị revert
- Expected: `"Transaction failed on blockchain"`

### Case 6: TxHash không tồn tại ❌
- TxHash fake
- Expected: `"Failed to verify transaction"`

## 🐛 Troubleshooting

### Lỗi: "User not found"
**Fix:** Phải login trước (gọi `/api/auth/login`)

### Lỗi: "Transaction hash required"
**Fix:** Phải gửi kèm `txHash` trong body

### Lỗi: "No Transfer event found"
**Fix:** TxHash không phải là ERC20 transfer

### Lỗi: "Invalid txHash format"
**Fix:** TxHash phải bắt đầu bằng `0x` và có 66 ký tự

### UI không gọi được contract
**Fix:** 
- Check MetaMask đã connect chưa
- Check network phải là Sepolia
- Check có đủ ETH để trả gas không

### Verify mãi không xong
**Fix:**
- Check RPC_URL trong .env có đúng không
- Check txHash có tồn tại trên Sepolia Etherscan không
- Restart server

## 📊 Flow Diagram

```
[User Wallet]
     |
     | 1. transfer(Treasury, 100 TNT)
     v
[Blockchain]
     |
     | 2. Return txHash
     v
[Frontend]
     |
     | 3. POST /deposit-token { txHash }
     v
[Backend API]
     |
     | 4. Verify Transaction:
     |    - Check duplicate
     |    - Get receipt
     |    - Parse Transfer event
     |    - Verify from/to/amount
     v
[Database]
     |
     | 5. Update user.tokenBalance += 100
     |    Save transaction record
     v
[Response Success]
```

## 🎯 Điểm Khác Biệt So Với Buy/Sell

| Feature | Buy/Sell | Deposit |
|---------|----------|---------|
| Ai ký transaction? | Backend (Admin) | User (Frontend) |
| Cần approve? | Chỉ Sell cần | Không |
| Verify blockchain? | Không | **CÓ** (Quan trọng!) |
| Check duplicate? | Không | **CÓ** (Chống scam) |
| Token đi từ đâu? | Admin → User | User → Admin |
| Rủi ro | Thấp | Cao (Cần verify kỹ) |

## 🔐 Security Checklist

- [x] Check duplicate txHash (Chống replay attack)
- [x] Verify transaction status = 'success'
- [x] Verify sender = user wallet
- [x] Verify receiver = treasury wallet
- [x] Parse Transfer event để lấy đúng amount
- [x] Chỉ cộng tiền sau khi verify hết
- [x] Lưu txHash vào DB để truy vết

## 📝 Logs Mẫu

Khi test thành công, backend sẽ log:
```
Token deposit request from 0x88b9...
Checking duplicate for txHash: 0xabc123...
Getting transaction receipt...
Receipt status: success
Parsing Transfer event...
Transfer: from=0x88b9..., to=0x5D00..., value=10
Verification passed!
Updating user balance: 100 -> 110
Transaction saved to DB
✅ Deposit successful!
```

## 🚀 Next Steps

Sau khi test xong, có thể mở rộng:
1. Thêm webhook để tự động detect transfer (không cần user gọi API)
2. Thêm QR code cho treasury address
3. Thêm history để xem các lần deposit
4. Thêm notification khi deposit thành công
5. Thêm minimum/maximum deposit amount

---

**Tổng kết:** Đây là implementation đầy đủ và an toàn cho chức năng Deposit Token, với verification blockchain chặt chẽ để chống mọi hình thức gian lận! 🎉
