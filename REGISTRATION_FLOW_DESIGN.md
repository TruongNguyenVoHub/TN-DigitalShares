# Thiết kế: Luồng Đăng ký (Registration) với Username, Password, Wallet

## 📋 Tổng quan hiện tại vs Mới

### Hiện tại (Wallet-only):
```
User connect MetaMask
        ↓
Lấy walletAddress
        ↓
POST /api/auth/login { walletAddress }
        ↓
Tự tạo User nếu chưa tồn tại
        ↓
→ Dashboard (nếu KYC xong)
→ KYC page (nếu chưa KYC)
```

### Mới (Username/Password + Wallet):
```
User nhập form
  - Username
  - Password
  - Confirm Password
  - Wallet Info:
    * Nhập wallet address HOẶC
    * Tự tạo ví (button)
        ↓
Validate & Hash password
        ↓
POST /api/auth/register { username, password, walletAddress }
        ↓
Tạo User mới + Hash password vào DB
        ↓
→ KYC page
```

---

## 🗄️ Schema Updates

### Cập nhật Prisma schema

Thêm field mới vào User model:

```prisma
model User {
  id            String   @id @default(cuid())
  
  // ===== New: Credentials =====
  username      String   @unique  // Username (unique constraint)
  passwordHash  String            // Hash của password (bcrypt)
  
  // ===== Existing: Wallet =====
  walletAddress String   @unique
  fullName      String?  // Optional lúc đầu
  vndBalance    Float    @default(0)
  tokenBalance  Float    @default(0)
  kycStatus     KycStatus @default(PENDING)
  isWhitelisted Boolean  @default(false)
  bankName      String?
  bankAccount   String?
  bankAccountName String?

  role          String   @default("USER")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  transactions Transaction[]
  kycRequests  KYCRequest[]
  sentTransfers     TokenTransfer[] @relation("Sender")
  receivedTransfers TokenTransfer[] @relation("Receiver")
  
  @@index([username])
  @@index([walletAddress])
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_auth_fields
```

---

## 🔐 Hash Password (Backend)

Cài package:
```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

Hàm utility: `lib/auth-utils.ts`

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash mật khẩu
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * So sánh mật khẩu với hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

---

## 💾 Repository Updates

### Cập nhật `repositories/user.repository.ts`

```typescript
// Thêm hàm check username tồn tại
async findByUsername(username: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { username },
  })
}

// Thêm hàm check username đã tồn tại
async existsByUsername(username: string): Promise<boolean> {
  const count = await prisma.user.count({
    where: { username: username.toLowerCase() },
  })
  return count > 0
}

// Update create function để support password
async create(data: CreateUserInput): Promise<User> {
  return prisma.user.create({
    data: {
      username: data.username,
      passwordHash: data.passwordHash,
      walletAddress: data.walletAddress.toLowerCase(),
      fullName: data.fullName || null,
      vndBalance: data.vndBalance ?? 0,
      kycStatus: data.kycStatus ?? 'PENDING',
      isWhitelisted: data.isWhitelisted ?? false,
      role: data.role ?? 'USER',
    },
  })
}

// Update login by username
async findByUsernameWithPassword(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      passwordHash: true,
      walletAddress: true,
      kycStatus: true,
      isWhitelisted: true,
      role: true,
    },
  })
}
```

---

## 🎨 UI - Registration Page

**File: `app/(auth)/register/page.tsx`**

```tsx
'use client';

import { Button, Card, Input } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function RegisterPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect, isPending: connectPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Use connected wallet address
  const displayWallet = address || walletAddress;

  const handleConnectWallet = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect({ connector: injected() });
    }
  };

  // Tự tạo ví mới (dùng ethers.js)
  const handleGenerateNewWallet = async () => {
    try {
      const { Wallet } = await import('ethers');
      const newWallet = Wallet.createRandom();
      setWalletAddress(newWallet.address);
      setError('');
    } catch (err) {
      setError('Không thể tạo ví. Vui lòng thử lại.');
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!username.trim()) {
      setError('Vui lòng nhập username');
      return false;
    }
    if (username.length < 3) {
      setError('Username phải tối thiểu 3 ký tự');
      return false;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      return false;
    }
    if (password.length < 8) {
      setError('Mật khẩu phải tối thiểu 8 ký tự');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return false;
    }
    if (!displayWallet) {
      setError('Vui lòng cấp ví blockchain');
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          walletAddress: displayWallet,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Lưu user info
        localStorage.setItem('user', JSON.stringify(data.data));
        // Redirect to KYC
        router.push('/user/kyc');
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-blue-600">TNT</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Stock Token</h1>
        <p className="text-blue-200 mt-2">Nền tảng giao dịch cổ phần ESOP</p>
      </div>

      {/* Registration Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
          Đăng ký tài khoản
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Username */}
          <Input
            label="Username"
            type="text"
            placeholder="Nhập username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />

          {/* Password */}
          <div className="relative">
            <Input
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              placeholder="Tối thiểu 8 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-gray-500"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {/* Confirm Password */}
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />

          {/* Wallet Info */}
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              Ví Blockchain
            </p>

            {displayWallet ? (
              <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
                <p className="text-xs text-green-700 mb-1">✓ Ví đã được cấp</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {displayWallet.slice(0, 10)}...{displayWallet.slice(-8)}
                </p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-xs text-yellow-700">Chưa có ví</p>
              </div>
            )}

            {/* Wallet Options */}
            {isConnected && address ? (
              <Button
                type="button"
                variant="outline"
                fullWidth
                className="mb-2"
                disabled={isLoading}
              >
                ✓ MetaMask: {address.slice(0, 6)}...{address.slice(-4)}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleConnectWallet}
                isLoading={connectPending}
                fullWidth
                className="mb-2"
                variant="outline"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 40 40" fill="none">
                  <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0z" fill="#F6851B"/>
                </svg>
                Kết nối MetaMask
              </Button>
            )}

            {/* OR Separator */}
            {isConnected && address && (
              <div className="relative mb-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">hoặc</span>
                </div>
              </div>
            )}

            {/* Generate New Wallet */}
            <Button
              type="button"
              onClick={handleGenerateNewWallet}
              variant="secondary"
              fullWidth
              disabled={isLoading}
            >
              🔐 Tạo ví mới
            </Button>

            {displayWallet && (
              <Button
                type="button"
                onClick={() => setWalletAddress('')}
                variant="outline"
                fullWidth
                className="mt-2 text-red-600 hover:text-red-700"
                disabled={isLoading}
              >
                Xóa ví
              </Button>
            )}
          </div>

          {/* Register Button */}
          <Button
            type="submit"
            isLoading={isLoading}
            fullWidth
            size="lg"
            className="mt-6"
          >
            Đăng ký
          </Button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <button
              onClick={() => router.push('/auth/login')}
              className="text-blue-600 hover:underline font-semibold"
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔌 API - Registration Endpoint

**File: `app/api/auth/register/route.ts`**

```typescript
import { hashPassword } from '@/lib/auth-utils';
import { userRepository } from '@/repositories';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password, walletAddress } = await request.json();

    // ===== Validation =====
    if (!username || !password || !walletAddress) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: 'Username, password, and walletAddress are required',
        },
        { status: 400 }
      );
    }

    // Validate username
    if (username.length < 3) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: 'Username must be at least 3 characters',
        },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: 'Password must be at least 8 characters',
        },
        { status: 400 }
      );
    }

    // ===== Check Duplicates =====
    const usernameExists = await userRepository.existsByUsername(username);
    if (usernameExists) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: 'Username already exists',
        },
        { status: 400 }
      );
    }

    const walletExists = await userRepository.existsByWalletAddress(walletAddress);
    if (walletExists) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: 'Wallet address already registered',
        },
        { status: 400 }
      );
    }

    // ===== Hash Password =====
    const passwordHash = await hashPassword(password);

    // ===== Create User =====
    const user = await userRepository.create({
      username: username.toLowerCase(),
      passwordHash,
      walletAddress: walletAddress.toLowerCase(),
      fullName: '',
      kycStatus: 'PENDING',
      isWhitelisted: false,
      role: 'USER',
    });

    return NextResponse.json(
      {
        success: true,
        status: 201,
        message: 'Registration successful',
        data: {
          userId: user.id,
          username: user.username,
          walletAddress: user.walletAddress,
          kycStatus: user.kycStatus,
          isWhitelisted: user.isWhitelisted,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
```

---

## 🔐 API - Updated Login Endpoint

**File: `app/api/auth/login/route.ts` (Cập nhật)**

```typescript
import { verifyPassword } from '@/lib/auth-utils';
import { userRepository } from '@/repositories';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // ===== Validation =====
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: 'Username and password are required',
        },
        { status: 400 }
      );
    }

    // ===== Find User =====
    const user = await userRepository.findByUsernameWithPassword(username);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          status: 401,
          message: 'Invalid username or password',
        },
        { status: 401 }
      );
    }

    // ===== Verify Password =====
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          status: 401,
          message: 'Invalid username or password',
        },
        { status: 401 }
      );
    }

    // ===== Login Success =====
    return NextResponse.json({
      success: true,
      status: 200,
      message: 'Login successful',
      data: {
        userId: user.id,
        username: user.username,
        walletAddress: user.walletAddress,
        kycStatus: user.kycStatus,
        isWhitelisted: user.isWhitelisted,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
```

---

## 🔄 Updated Login Page UI

**File: `app/(auth)/login/page.tsx` (Cập nhật)**

```tsx
'use client';

import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data));

        if (data.data.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          if (data.data.kycStatus === 'PENDING' || data.data.kycStatus === 'REJECTED') {
            router.push('/user/kyc');
          } else {
            router.push('/user/dashboard');
          }
        }
      } else {
        setError(data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-blue-600">TNT</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Stock Token</h1>
        <p className="text-blue-200 mt-2">Nền tảng giao dịch cổ phần ESOP</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
          Đăng nhập
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Username"
            placeholder="Nhập username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />

          <div className="relative">
            <Input
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-gray-500"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            fullWidth
            size="lg"
          >
            Đăng nhập
          </Button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <button
              onClick={() => router.push('/auth/register')}
              className="text-blue-600 hover:underline font-semibold"
            >
              Đăng ký
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 Luồng Đăng ký chi tiết

```
┌─────────────────────────────────────────────────────────────┐
│  USER REGISTRATION FLOW                                     │
└─────────────────────────────────────────────────────────────┘

1. Trang Register (/auth/register)
   - Nhập username
   - Nhập password + confirm
   - Chọn ví:
     a) Connect MetaMask
     b) Tạo ví mới (auto-generate)
        ↓

2. Validation (Frontend)
   - Username >= 3 ký tự?
   - Password >= 8 ký tự?
   - Mật khẩu khớp?
   - Có ví không?
        ↓

3. Gửi POST /api/auth/register
   {
     username: "john_doe",
     password: "actualPassword",
     walletAddress: "0x123..."
   }
        ↓

4. Backend Validation
   - Username >= 3?
   - Password >= 8?
   - Username không trùng?
   - Wallet không trùng?
        ↓

5. Hash Password
   password → bcrypt → hash
        ↓

6. Tạo User (DB)
   INSERT INTO User {
     username: "john_doe",
     passwordHash: "$2a$10$...",
     walletAddress: "0x123...",
     kycStatus: "PENDING",
     isWhitelisted: false,
     role: "USER"
   }
        ↓

7. Trả Response
   {
     success: true,
     data: {
       userId: "cm123...",
       username: "john_doe",
       walletAddress: "0x123...",
       kycStatus: "PENDING",
       ...
     }
   }
        ↓

8. Lưu localStorage
   localStorage.setItem('user', {...})
        ↓

9. Redirect
   → /user/kyc (bắt buộc KYC)
```

---

## 🔐 Bảo mật - Password Flow

```
REGISTRATION:
User password (plain) 
  ↓ (bcryptjs)
Hash + Salt 
  ↓
Save to DB (never save plain text!)

LOGIN:
User input (plain)
  ↓ (bcrypt.compare)
Compare với stored hash
  ↓
Match? → Login success
        → Generate JWT? (optional)
Not match? → Invalid credentials
```

---

## 📝 Updated API Documentation

Thêm vào `API_DOCUMENTATION.md`:

```markdown
### 1. User Registration
Đăng ký tài khoản mới với username, password, và wallet address.

- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Request Body:**
  ```json
  {
    "username": "john_doe",
    "password": "securePassword123",
    "walletAddress": "0x1234567890abcdef..."
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "status": 201,
    "message": "Registration successful",
    "data": {
      "userId": "cm123abc...",
      "username": "john_doe",
      "walletAddress": "0x1234567890abcdef...",
      "kycStatus": "PENDING",
      "isWhitelisted": false,
      "role": "USER"
    }
  }
  ```
- **Error Responses:**
  - Username quá ngắn: `{ "success": false, "status": 400, "message": "Username must be at least 3 characters" }`
  - Username trùng: `{ "success": false, "status": 400, "message": "Username already exists" }`
  - Wallet trùng: `{ "success": false, "status": 400, "message": "Wallet address already registered" }`

### 2. User Login (Updated)
Đăng nhập với username và password.

- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Request Body:**
  ```json
  {
    "username": "john_doe",
    "password": "securePassword123"
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
      "username": "john_doe",
      "walletAddress": "0x1234567890abcdef...",
      "kycStatus": "PENDING",
      "isWhitelisted": false,
      "role": "USER"
    }
  }
  ```
- **Error:**
  ```json
  {
    "success": false,
    "status": 401,
    "message": "Invalid username or password"
  }
  ```
```

---

## ✅ Checklist Implementation

- [ ] Cập nhật Prisma schema (thêm username, passwordHash)
- [ ] `npx prisma migrate dev`
- [ ] Cài bcryptjs: `npm install bcryptjs @types/bcryptjs`
- [ ] Tạo `lib/auth-utils.ts` (hash/verify)
- [ ] Cập nhật `repositories/user.repository.ts`
  - [ ] `findByUsername()`
  - [ ] `existsByUsername()`
  - [ ] `findByUsernameWithPassword()`
- [ ] Tạo `app/api/auth/register/route.ts`
- [ ] Cập nhật `app/api/auth/login/route.ts`
- [ ] Tạo `app/(auth)/register/page.tsx`
- [ ] Cập nhật `app/(auth)/login/page.tsx`
- [ ] Cập nhật navigation (thêm link Register/Login)
- [ ] Test flow đăng ký + đăng nhập
- [ ] Update API documentation

---

## 🎯 Flow User thực tế

```
New User
  ↓
Visit /auth/register
  ↓
Fill form (username, password, wallet)
  ↓
POST /api/auth/register
  ↓ (Tạo user + hash password)
Success → Redirect /user/kyc
  ↓
Fill KYC form (CCCD, ảnh)
  ↓
Submit → Admin approve
  ↓
Use app (trade, wallet, ...)

Returning User
  ↓
Visit /auth/login
  ↓
Enter username + password
  ↓
POST /api/auth/login
  ↓ (Verify password)
Success → Redirect dashboard/kyc
```

---

## 🔒 Security Notes

1. **Password**: Luôn hash bằng bcryptjs (NEVER save plain text)
2. **Username**: Normalize to lowercase (chống case-sensitive duplicate)
3. **Error messages**: Chung chung ("Invalid username or password") tránh leak user existence
4. **Rate limiting**: Nên thêm rate limit trên login/register (prevent brute force)
5. **JWT tokens**: Có thể thêm JWT tokens cho stateless auth (optional)
6. **HTTPS**: Dùng HTTPS trong production (protect password in transit)
