'use client';

import { Badge, Card } from '@/components/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

interface UserProfile {
  walletAddress: string;
  fullName: string;
  vndBalance: number;
  tokenBalance: number;
  kycStatus: string;
  isWhitelisted: boolean;
}

interface PriceData {
  price: string;
  change: number;
}

export default function DashboardPage() {
  const { address } = useAccount();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [priceData, setPriceData] = useState<PriceData>({ price: '35000', change: 2.5 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchProfile();
      fetchPrice();
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
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrice = async () => {
    try {
      const response = await fetch('/api/stock/price');
      const data = await response.json();
      if (data.success) {
        setPriceData({ price: data.data.price, change: 2.5 }); // Mock change
      }
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const totalAsset = profile 
    ? profile.vndBalance + (profile.tokenBalance * parseFloat(priceData.price))
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      {/* Greeting */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">
          Xin chào, {profile?.fullName || 'Nhà đầu tư'} 👋
        </h1>
        <p className="text-sm text-gray-500">
          {profile?.isWhitelisted && (
            <span className="inline-flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Đã xác minh
            </span>
          )}
        </p>
      </div>

      {/* Asset Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white mb-4">
        <div className="mb-4">
          <p className="text-blue-200 text-sm mb-1">Tổng tài sản</p>
          <h2 className="text-3xl font-bold">{formatVND(totalAsset)}</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-blue-200 text-xs mb-0.5">Số dư VND</p>
            <p className="text-lg font-semibold">{formatVND(profile?.vndBalance || 0)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-blue-200 text-xs mb-0.5">Cổ phần TNT</p>
            <p className="text-lg font-semibold">{profile?.tokenBalance || 0} Token</p>
          </div>
        </div>
      </Card>

      {/* Price Chart Card */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Giá cổ phần TNT</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatVND(parseFloat(priceData.price))}
              </span>
              <Badge variant={priceData.change >= 0 ? 'success' : 'danger'}>
                {priceData.change >= 0 ? '+' : ''}{priceData.change}%
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Cập nhật</p>
            <p className="text-xs text-gray-600">Hôm nay</p>
          </div>
        </div>
        
        {/* Simple Chart Placeholder */}
        <div className="h-32 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl flex items-end justify-center p-4">
          <svg viewBox="0 0 200 60" className="w-full h-full">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,50 Q20,45 40,40 T80,35 T120,25 T160,30 T200,20"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
            />
            <path
              d="M0,50 Q20,45 40,40 T80,35 T120,25 T160,30 T200,20 L200,60 L0,60 Z"
              fill="url(#chartGradient)"
            />
          </svg>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">30 ngày qua</p>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <Link href="/user/wallet?tab=vnd&action=deposit">
          <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-700">Nạp tiền</span>
          </div>
        </Link>
        
        <Link href="/user/wallet?tab=vnd&action=withdraw">
          <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18V6m-6 6h12" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-700">Rút tiền</span>
          </div>
        </Link>
        
        <Link href="/user/trade?tab=buy">
          <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-700">Mua ESOP</span>
          </div>
        </Link>
        
        <Link href="/user/trade?tab=sell">
          <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-700">Bán ESOP</span>
          </div>
        </Link>
      </div>

      {/* Recent Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Giao dịch gần đây</h3>
          <Link href="/user/history" className="text-sm text-blue-600 hover:text-blue-700">
            Xem tất cả
          </Link>
        </div>
        
        <div className="space-y-3">
          {/* Sample transactions - will be replaced with real data */}
          <TransactionItem
            type="BUY_STOCK"
            amount={10}
            vnd={350000}
            date="Hôm nay, 14:30"
          />
          <TransactionItem
            type="DEPOSIT"
            amount={0}
            vnd={1000000}
            date="Hôm qua, 09:15"
          />
          <TransactionItem
            type="SELL_STOCK"
            amount={5}
            vnd={175000}
            date="25/12/2025"
          />
        </div>
      </Card>
    </>
  );
}

interface TransactionItemProps {
  type: string;
  amount: number;
  vnd: number;
  date: string;
}

function TransactionItem({ type, amount, vnd, date }: TransactionItemProps) {
  const typeConfig: Record<string, { label: string; icon: string; color: string }> = {
    DEPOSIT: { label: 'Nạp tiền', icon: '+', color: 'text-green-600' },
    WITHDRAW: { label: 'Rút tiền', icon: '-', color: 'text-red-600' },
    BUY_STOCK: { label: 'Mua ESOP', icon: '↓', color: 'text-blue-600' },
    SELL_STOCK: { label: 'Bán ESOP', icon: '↑', color: 'text-orange-600' },
  };

  const config = typeConfig[type] || { label: type, icon: '•', color: 'text-gray-600' };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
          type === 'DEPOSIT' || type === 'SELL_STOCK' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <span className={config.color}>{config.icon}</span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{config.label}</p>
          <p className="text-xs text-gray-500">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-medium ${config.color}`}>
          {type === 'DEPOSIT' || type === 'SELL_STOCK' ? '+' : '-'}{formatVND(vnd)}
        </p>
        {amount > 0 && (
          <p className="text-xs text-gray-500">{amount} Token</p>
        )}
      </div>
    </div>
  );
}
