'use client';

import { Button } from '@/components/ui';
import { Input } from '@/components/ui/input';
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
  const [privateKey, setPrivateKey] = useState(''); // Store private key for generated wallets
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Generate new wallet
  const handleGenerateNewWallet = async () => {
    try {
      const { Wallet } = await import('ethers');
      const newWallet = Wallet.createRandom();
      setWalletAddress(newWallet.address);
      setPrivateKey(newWallet.privateKey); // Save private key for database storage
      setError('');
    } catch {
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
          privateKey: privateKey || undefined, // Send private key if wallet was generated
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data));
        router.push('/user/kyc');
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch {
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
            placeholder="Nhập username (tối thiểu 3 ký tự)"
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
              className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Input
              label="Xác nhận mật khẩu"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {/* Wallet Info Section */}
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              🪙 Ví Blockchain
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
                <p className="text-xs text-yellow-700">⚠️ Chưa chọn ví</p>
              </div>
            )}

            {/* MetaMask Connect */}
            {isConnected && address ? (
              <Button
                type="button"
                disabled
                fullWidth
                className="mb-2 bg-green-100 text-green-700 cursor-default"
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
                  <path d="M35.055 6.875L21.937 16.18l2.437-5.75-10.437 2.445z" fill="#E2761B"/>
                </svg>
                Kết nối MetaMask
              </Button>
            )}

            {/* Separator */}
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
              className="mb-2"
            >
              🔐 Tạo ví mới
            </Button>

            {/* Clear Wallet */}
            {displayWallet && (
              <Button
                type="button"
                onClick={() => {
                  setWalletAddress('');
                  disconnect();
                }}
                variant="outline"
                fullWidth
                className="text-red-600 hover:text-red-700"
                disabled={isLoading}
              >
                ✕ Xóa ví
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
        <div className="text-center mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:underline font-semibold"
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-blue-200 text-sm">
        <p>© 2025 Stock Token. All rights reserved.</p>
      </div>
    </div>
  );
}
