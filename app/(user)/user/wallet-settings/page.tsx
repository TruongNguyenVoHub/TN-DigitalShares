'use client';

import { Button, Card, Input, Modal, ToastContainer, useToast } from '@/components/ui';
import { Wallet } from 'ethers';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserData {
  walletAddress: string;
  username?: string;
  walletType?: string;
}

export default function WalletSettingsPage() {
  const router = useRouter();
  const { toasts, removeToast, success } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // View Private Key Modal
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [privateKeyError, setPrivateKeyError] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // Change Wallet Modal
  const [showChangeWalletModal, setShowChangeWalletModal] = useState(false);
  const [changeWalletPassword, setChangeWalletPassword] = useState('');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newPrivateKey, setNewPrivateKey] = useState('');
  const [changeWalletError, setChangeWalletError] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);
      // Fetch latest user data from API to sync with database
      fetchUserProfile(parsedUser.walletAddress);
    } else {
      router.push('/login');
    }
  }, [router]);

  // Fetch user profile from API
  const fetchUserProfile = async (walletAddress: string) => {
    try {
      setIsLoadingProfile(true);
      const response = await fetch(`/api/user/${walletAddress}/profile`);
      const data = await response.json();
      
      if (data.success) {
        const updatedUser = {
          walletAddress: data.data.walletAddress,
          username: data.data.username,
          walletType: data.data.walletType || 'EXTERNAL',
          kycStatus: data.data.kycStatus,
          role: data.data.role,
        };
        setUserData(updatedUser);
        // Update localStorage with latest data
        const currentUser = localStorage.getItem('user');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }));
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      success('Đã sao chép vào clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      success('Đã sao chép vào clipboard!');
    }
  };

  // Handle View Private Key
  const handleViewPrivateKey = async () => {
    if (!password) {
      setPrivateKeyError('Vui lòng nhập mật khẩu');
      return;
    }

    setIsLoading(true);
    setPrivateKeyError('');

    try {
      const response = await fetch(`/api/user/${userData?.walletAddress}/view-private-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setPrivateKey(data.data.privateKey);
        setShowPrivateKey(true);
      } else {
        setPrivateKeyError(data.message || 'Không thể lấy private key');
      }
    } catch {
      setPrivateKeyError('Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Generate New Wallet
  const handleGenerateNewWallet = async () => {
    try {
      const newWallet = Wallet.createRandom();
      setNewWalletAddress(newWallet.address);
      setNewPrivateKey(newWallet.privateKey);
      setChangeWalletError('');
    } catch {
      setChangeWalletError('Không thể tạo ví. Vui lòng thử lại.');
    }
  };

  // Handle Change Wallet
  const handleChangeWallet = async () => {
    if (!changeWalletPassword) {
      setChangeWalletError('Vui lòng nhập mật khẩu để xác thực');
      return;
    }

    if (!newWalletAddress) {
      setChangeWalletError('Vui lòng nhập địa chỉ ví mới hoặc tạo ví mới');
      return;
    }

    setIsLoading(true);
    setChangeWalletError('');

    try {
      const response = await fetch(`/api/user/${userData?.walletAddress}/change-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: changeWalletPassword,
          newWalletAddress,
          newPrivateKey: newPrivateKey || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local storage
        const updatedUser = { ...userData, walletAddress: data.data.walletAddress, walletType: data.data.walletType };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser as UserData);

        // Close modal and reset
        setShowChangeWalletModal(false);
        setChangeWalletPassword('');
        setNewWalletAddress('');
        setNewPrivateKey('');
        
        success('Cập nhật ví thành công!');
      } else {
        setChangeWalletError(data.message || 'Không thể đổi ví');
      }
    } catch {
      setChangeWalletError('Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  const closePrivateKeyModal = () => {
    setShowPrivateKeyModal(false);
    setPassword('');
    setPrivateKey('');
    setPrivateKeyError('');
    setShowPrivateKey(false);
  };

  const closeChangeWalletModal = () => {
    setShowChangeWalletModal(false);
    setChangeWalletPassword('');
    setNewWalletAddress('');
    setNewPrivateKey('');
    setChangeWalletError('');
  };

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Quản lý ví</h1>

      {isLoadingProfile ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Wallet Info Card */}
          <Card className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">Thông tin ví</h3>
        
        <div className="space-y-4">
          {/* Wallet Address */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Địa chỉ ví</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-50 px-4 py-3 rounded-lg text-sm font-mono text-gray-900 break-all">
                {userData?.walletAddress}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(userData?.walletAddress || '')}
              >
                📋
              </Button>
            </div>
          </div>

          {/* Wallet Type */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Loại ví</label>
            <div className="bg-gray-50 px-4 py-3 rounded-lg">
              {userData?.walletType === 'MANAGED' ? (
                <span className="text-green-600 font-medium">🔐 Ví do hệ thống quản lý</span>
              ) : (
                <span className="text-blue-600 font-medium">🔗 Ví ngoài (không do hệ thống quản lý)</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Actions Card */}
      <Card className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-4">Thao tác</h3>
        
        <div className="space-y-3">
          {/* View Private Key (only for MANAGED wallets) */}
          {userData?.walletType === 'MANAGED' && (
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowPrivateKeyModal(true)}
            >
              🔑 Xem Private Key
            </Button>
          )}

          {/* Change Wallet */}
          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowChangeWalletModal(true)}
          >
            🔄 Đổi thông tin ví
          </Button>
        </div>
      </Card>

      {/* Security Warning */}
      <Card className="bg-yellow-50 border-yellow-200">
        <div className="flex gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Cảnh báo bảo mật</h4>
            <p className="text-sm text-yellow-800">
              • Không bao giờ chia sẻ private key với bất kỳ ai<br />
              • Hệ thống không bao giờ yêu cầu private key của bạn qua email hay tin nhắn<br />
              • Sao lưu private key ở nơi an toàn<br />
              • Nếu mất private key, bạn sẽ mất quyền truy cập vào tài sản
            </p>
          </div>
        </div>
      </Card>

      {/* View Private Key Modal */}
      {showPrivateKeyModal && (
        <Modal isOpen={showPrivateKeyModal} onClose={closePrivateKeyModal}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Xem Private Key</h2>
            
            {!showPrivateKey ? (
              <>
                <p className="text-gray-600 mb-4">
                  Vui lòng nhập mật khẩu để xác thực
                </p>
                
                <Input
                  type="password"
                  label="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
                  className="mb-4"
                />

                {privateKeyError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {privateKeyError}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={closePrivateKeyModal}
                  >
                    Hủy
                  </Button>
                  <Button
                    fullWidth
                    onClick={handleViewPrivateKey}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                  <p className="text-red-800 font-semibold mb-2">⚠️ Cảnh báo bảo mật</p>
                  <p className="text-sm text-red-700">
                    Không bao giờ chia sẻ private key này với bất kỳ ai. 
                    Bất kỳ ai có private key đều có thể truy cập và chuyển tài sản của bạn.
                  </p>
                </div>

                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Private Key của bạn:
                </label>
                <div className="bg-gray-50 p-4 rounded-lg mb-4 break-all">
                  <code className="text-sm font-mono text-gray-900">
                    {privateKey}
                  </code>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => copyToClipboard(privateKey)}
                  >
                    📋 Sao chép
                  </Button>
                  <Button
                    fullWidth
                    onClick={closePrivateKeyModal}
                  >
                    Đóng
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Change Wallet Modal */}
      {showChangeWalletModal && (
        <Modal isOpen={showChangeWalletModal} onClose={closeChangeWalletModal}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Đổi thông tin ví</h2>
            
            <div className="space-y-4">
              <Input
                type="password"
                label="Mật khẩu"
                value={changeWalletPassword}
                onChange={(e) => setChangeWalletPassword(e.target.value)}
                placeholder="Nhập mật khẩu để xác thực"
              />

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Địa chỉ ví mới
                </label>
                <Input
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>

              <Button
                variant="outline"
                fullWidth
                onClick={handleGenerateNewWallet}
              >
                🎲 Tạo ví mới tự động
              </Button>

              {newPrivateKey && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    ✅ Đã tạo ví mới thành công!
                  </p>
                  <p className="text-xs text-blue-700">
                    Địa chỉ: {newWalletAddress.slice(0, 10)}...{newWalletAddress.slice(-8)}
                  </p>
                </div>
              )}

              {changeWalletError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {changeWalletError}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={closeChangeWalletModal}
                >
                  Hủy
                </Button>
                <Button
                  fullWidth
                  onClick={handleChangeWallet}
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      </>
      )}
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
