'use client';

import { Badge, Button, Card } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import UserLayout from '../../layout';

interface UserProfile {
  walletAddress: string;
  fullName: string;
  vndBalance: number;
  tokenBalance: number;
  kycStatus: string;
  isWhitelisted: boolean;
  role: string;
}

export default function ProfilePage() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchProfile();
    }
  }, [address]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/user/${address}/profile`);
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    disconnect();
    router.push('/login');
  };

  const getKYCBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge variant="success">✅ Đã xác minh</Badge>;
      case 'PENDING':
        return <Badge variant="warning">⏳ Đang chờ duyệt</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">❌ Bị từ chối</Badge>;
      default:
        return <Badge variant="default">Chưa xác minh</Badge>;
    }
  };

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Hồ sơ cá nhân</h1>

      {/* Profile Card */}
      <Card className="mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white font-bold">
              {profile?.fullName?.charAt(0) || '?'}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {profile?.fullName || 'Chưa cập nhật'}
            </h2>
            <p className="text-sm text-gray-500">{profile?.role || 'USER'}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Wallet Address */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Địa chỉ ví</span>
            <span className="font-mono text-sm text-gray-900 max-w-[180px] truncate">
              {profile?.walletAddress}
            </span>
          </div>

          {/* KYC Status */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Trạng thái KYC</span>
            {getKYCBadge(profile?.kycStatus || '')}
          </div>

          {/* Whitelist Status */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Whitelist</span>
            {profile?.isWhitelisted ? (
              <Badge variant="success">✅ Đã thêm</Badge>
            ) : (
              <Badge variant="default">Chưa thêm</Badge>
            )}
          </div>

          {/* Role */}
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-600">Vai trò</span>
            <Badge variant="info">{profile?.role || 'USER'}</Badge>
          </div>
        </div>
      </Card>

      {/* Quick Links */}
      <Card className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-4">Cài đặt</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <span className="text-gray-700">Bảo mật</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <span className="text-gray-700">Thông báo</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-700">Hỗ trợ</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </Card>

      {/* Logout */}
      <Button
        onClick={handleLogout}
        variant="danger"
        fullWidth
        size="lg"
      >
        Đăng xuất
      </Button>
    </UserLayout>
  );
}
