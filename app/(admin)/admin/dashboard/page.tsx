'use client';

import { Badge, Card } from '@/components/ui';
import Link from 'next/link';
import { useState } from 'react';
import AdminLayout from '../../layout';

interface Stats {
  totalUsers: number;
  totalSupply: number;
  treasuryBalance: number;
  vndLiability: number;
  pendingKyc: number;
  pendingDeposits: number;
}

export default function AdminDashboardPage() {
  // Mock data - replace with real API calls
  const [stats, setStats] = useState<Stats>({
    totalUsers: 156,
    totalSupply: 100000,
    treasuryBalance: 75000,
    vndLiability: 5000000000,
    pendingKyc: 3,
    pendingDeposits: 5,
  });

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <AdminLayout>
      {/* Alerts */}
      {(stats.pendingKyc > 0 || stats.pendingDeposits > 0) && (
        <div className="mb-6 space-y-3">
          {stats.pendingKyc > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-yellow-800">
                    Có {stats.pendingKyc} yêu cầu KYC mới cần duyệt
                  </p>
                </div>
              </div>
              <Link href="/admin/users" className="text-yellow-700 hover:text-yellow-800 font-medium text-sm">
                Xem ngay →
              </Link>
            </div>
          )}
          
          {stats.pendingDeposits > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-blue-800">
                    Có {stats.pendingDeposits} lệnh nạp tiền chờ xác nhận
                  </p>
                </div>
              </div>
              <Link href="/admin/treasury" className="text-blue-700 hover:text-blue-800 font-medium text-sm">
                Xem ngay →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng số người dùng</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            +12% so với tháng trước
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng Token phát hành</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalSupply)} TNT</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <Badge variant="info">On-chain</Badge>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Token trong Treasury</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.treasuryBalance)} TNT</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {((stats.treasuryBalance / stats.totalSupply) * 100).toFixed(1)}% tổng supply
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng VND ký gửi</p>
              <p className="text-2xl font-bold text-gray-900">{formatVND(stats.vndLiability)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <Badge variant="warning">Liability</Badge>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
          <div className="space-y-4">
            <ActivityItem
              icon="user"
              title="User 0x1234...5678 đã hoàn thành KYC"
              time="5 phút trước"
            />
            <ActivityItem
              icon="money"
              title="Nạp tiền 5,000,000 VND từ 0xabcd...efgh"
              time="15 phút trước"
            />
            <ActivityItem
              icon="trade"
              title="Giao dịch mua 100 TNT"
              time="30 phút trước"
            />
            <ActivityItem
              icon="token"
              title="Rút 50 Token về ví 0x9876...5432"
              time="1 giờ trước"
            />
          </div>
        </Card>

        {/* Quick Links */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Tác vụ nhanh</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/users" className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-medium text-gray-900">Duyệt KYC</p>
              <p className="text-sm text-gray-500">{stats.pendingKyc} yêu cầu</p>
            </Link>

            <Link href="/admin/treasury" className="p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="font-medium text-gray-900">Duyệt nạp tiền</p>
              <p className="text-sm text-gray-500">{stats.pendingDeposits} yêu cầu</p>
            </Link>

            <Link href="/admin/inventory" className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="font-medium text-gray-900">Nhập kho</p>
              <p className="text-sm text-gray-500">Phát hành Token</p>
            </Link>

            <Link href="/admin/inventory" className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <p className="font-medium text-gray-900">Thiết lập giá</p>
              <p className="text-sm text-gray-500">Price Oracle</p>
            </Link>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

interface ActivityItemProps {
  icon: string;
  title: string;
  time: string;
}

function ActivityItem({ icon, title, time }: ActivityItemProps) {
  const iconColors: Record<string, string> = {
    user: 'bg-blue-100 text-blue-600',
    money: 'bg-green-100 text-green-600',
    trade: 'bg-purple-100 text-purple-600',
    token: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColors[icon]}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}
