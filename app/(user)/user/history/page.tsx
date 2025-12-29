'use client';

import { Badge, Button, Card } from '@/components/ui';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import UserLayout from '../../layout';

interface Transaction {
  id: string;
  type: string;
  amountVND: number;
  amountToken: number;
  stockPrice: number;
  txHash?: string;
  status: string;
  createdAt: string;
}

export default function HistoryPage() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (address) {
      fetchTransactions();
    }
  }, [address]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/user/${address}/transaction`);
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DEPOSIT: 'Nạp VND',
      WITHDRAW: 'Rút VND',
      BUY_STOCK: 'Mua Token',
      SELL_STOCK: 'Bán Token',
      DEPOSIT_TOKEN_ONCHAIN: 'Nạp Token (On-chain)',
      WITHDRAW_TOKEN_ONCHAIN: 'Rút Token (On-chain)',
    };
    return labels[type] || type;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'success' | 'danger' | 'info' | 'warning'> = {
      DEPOSIT: 'success',
      WITHDRAW: 'danger',
      BUY_STOCK: 'info',
      SELL_STOCK: 'warning',
      DEPOSIT_TOKEN_ONCHAIN: 'success',
      WITHDRAW_TOKEN_ONCHAIN: 'danger',
    };
    return variants[type] || 'default';
  };

  const filteredTransactions = filter === 'ALL' 
    ? transactions 
    : transactions.filter(t => t.type === filter);

  const filterOptions = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'DEPOSIT', label: 'Nạp VND' },
    { value: 'WITHDRAW', label: 'Rút VND' },
    { value: 'BUY_STOCK', label: 'Mua' },
    { value: 'SELL_STOCK', label: 'Bán' },
  ];

  return (
    <UserLayout>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Lịch sử giao dịch</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {filterOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={filter === opt.value ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Transactions List */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getTypeBadge(tx.type)}>
                      {getTypeLabel(tx.type)}
                    </Badge>
                    <Badge variant={tx.status === 'SUCCESS' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'danger'}>
                      {tx.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.createdAt).toLocaleString('vi-VN')}
                  </p>
                  {tx.txHash && (
                    <p className="text-xs text-gray-400 font-mono truncate max-w-[200px]">
                      TxHash: {tx.txHash.slice(0, 10)}...
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {tx.amountVND > 0 && (
                    <p className={`font-medium ${
                      tx.type === 'DEPOSIT' || tx.type === 'SELL_STOCK' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'DEPOSIT' || tx.type === 'SELL_STOCK' ? '+' : '-'}{formatVND(tx.amountVND)}
                    </p>
                  )}
                  {tx.amountToken > 0 && (
                    <p className="text-sm text-gray-500">{tx.amountToken} TNT</p>
                  )}
                  {tx.stockPrice > 0 && (
                    <p className="text-xs text-gray-400">@ {formatVND(tx.stockPrice)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </UserLayout>
  );
}
