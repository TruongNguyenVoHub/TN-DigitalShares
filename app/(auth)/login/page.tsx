'use client';

import { Button } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function LoginPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  
  // State
  const [loginMethod, setLoginMethod] = useState<'wallet' | 'credentials'>('wallet');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto login if wallet connected
  useEffect(() => {
    if (isConnected && address && loginMethod === 'wallet') {
      handleWalletLogin(address);
    }
  }, [isConnected, address, loginMethod]);

  const handleConnect = async () => {
    try {
      setError('');
      connect({ connector: injected() });
    } catch (err) {
      setError('Không thể kết nối ví. Vui lòng thử lại.');
    }
  };

  const handleWalletLogin = async (walletAddress: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
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
      setError('Lỗi kết nối server. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ username và password');
      return;
    }

    setIsLoading(true);
    setError('');

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

      {/* Login Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
          Đăng nhập
        </h2>

        {/* Method Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setLoginMethod('wallet');
              setError('');
              disconnect();
            }}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
              loginMethod === 'wallet'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🪙 Ví
          </button>
          <button
            onClick={() => {
              setLoginMethod('credentials');
              setError('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
              loginMethod === 'credentials'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👤 Tài khoản
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Wallet Login */}
        {loginMethod === 'wallet' && (
          <>
            {!isConnected ? (
              <>
                <Button
                  onClick={handleConnect}
                  isLoading={isPending}
                  fullWidth
                  size="lg"
                  className="mb-4"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 40 40" fill="none">
                    <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0z" fill="#F6851B"/>
                    <path d="M35.055 6.875L21.937 16.18l2.437-5.75-10.437 2.445z" fill="#E2761B"/>
                  </svg>
                  Kết nối MetaMask
                </Button>

                <div className="text-center text-sm text-gray-500">
                  Bạn cần có ví MetaMask để sử dụng phương thức này
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-4 p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">✓ Đã kết nối ví</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => disconnect()}
                    variant="outline"
                    fullWidth
                  >
                    Ngắt kết nối
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Credentials Login */}
        {loginMethod === 'credentials' && (
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <Input
              label="Username"
              type="text"
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
                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
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
        )}

        {/* Register Link */}
        <div className="text-center mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <button
              onClick={() => router.push('/register')}
              className="text-blue-600 hover:underline font-semibold"
            >
              Đăng ký
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
