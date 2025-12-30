'use client';

import { Badge, Button, Card, Input } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
// import UserLayout from '../../layout';

interface UserProfile {
  vndBalance: number;
  tokenBalance: number;
}

interface PriceData {
  price: string;
}

interface Transaction {
  id: string;
  type: string;
  amountToken: number;
  amountVND: number;
  stockPrice: number;
  createdAt: string;
}

export default function TradePage() {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'buy';
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [priceData, setPriceData] = useState<PriceData>({ price: '35000' });
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [recentOrders, setRecentOrders] = useState<Transaction[]>([]);

  useEffect(() => {
    if (address) {
      fetchProfile();
      fetchPrice();
      fetchTransactions();
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
    }
  };

  const fetchPrice = async () => {
    try {
      const response = await fetch('/api/stock/price');
      const data = await response.json();
      if (data.success) {
        setPriceData({ price: data.data.price });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/user/${address}/transaction`);
      const data = await response.json();
      if (data.success) {
        const orders = data.data.transactions
          .filter((t: Transaction) => t.type === 'BUY_STOCK' || t.type === 'SELL_STOCK')
          .slice(0, 5);
        setRecentOrders(orders);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleBuy = async () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      setMessage({ type: 'error', text: 'Vui lòng nhập số lượng hợp lệ' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/trade/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          amountToken: parseFloat(buyAmount),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Mua thành công!' });
        setBuyAmount('');
        fetchProfile();
        fetchTransactions();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSell = async () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      setMessage({ type: 'error', text: 'Vui lòng nhập số lượng hợp lệ' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/trade/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          amountToken: parseFloat(sellAmount),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Bán thành công!' });
        setSellAmount('');
        fetchProfile();
        fetchTransactions();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const price = parseFloat(priceData.price);
  const buyTotal = parseFloat(buyAmount || '0') * price;
  const sellTotal = parseFloat(sellAmount || '0') * price;

  return (  
    <>
      {/* Price Header */}
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Giá hiện tại</p>
            <p className="text-2xl font-bold text-gray-900">{formatVND(price)}</p>
          </div>
          <Badge variant="success">+2.5%</Badge>
        </div>
      </Card>

      {/* Balance Info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card variant="bordered" className="p-4">
          <p className="text-xs text-gray-500 mb-1">Số dư VND</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatVND(profile?.vndBalance || 0)}
          </p>
        </Card>
        <Card variant="bordered" className="p-4">
          <p className="text-xs text-gray-500 mb-1">Số dư Token</p>
          <p className="text-lg font-semibold text-gray-900">
            {profile?.tokenBalance || 0} TNT
          </p>
        </Card>
      </div>

      {/* Trade Tabs */}
      <Card className="mb-4">
        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="buy">Mua</TabsTrigger>
            <TabsTrigger value="sell">Bán</TabsTrigger>
          </TabsList>

          <TabsContent value="buy">
            <div className="space-y-4">
              <Input
                label="Số lượng muốn mua"
                type="number"
                placeholder="Nhập số lượng Token"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
              />
              
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Đơn giá</span>
                  <span className="font-medium">{formatVND(price)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-700">Thành tiền</span>
                  <span className="text-blue-600">{formatVND(buyTotal)}</span>
                </div>
              </div>

              {message.text && (
                <div className={`p-3 rounded-xl text-sm ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              <Button
                onClick={handleBuy}
                isLoading={isLoading}
                fullWidth
                size="lg"
                variant="success"
              >
                MUA NGAY
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sell">
            <div className="space-y-4">
              <Input
                label="Số lượng muốn bán"
                type="number"
                placeholder="Nhập số lượng Token"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
              />
              
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Đơn giá</span>
                  <span className="font-medium">{formatVND(price)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-700">Nhận về</span>
                  <span className="text-orange-600">{formatVND(sellTotal)}</span>
                </div>
              </div>

              {message.text && (
                <div className={`p-3 rounded-xl text-sm ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              <Button
                onClick={handleSell}
                isLoading={isLoading}
                fullWidth
                size="lg"
                variant="danger"
              >
                BÁN NGAY
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Recent Orders */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Lịch sử lệnh gần đây</h3>
        
        {recentOrders.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Chưa có lệnh nào</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <Badge variant={order.type === 'BUY_STOCK' ? 'success' : 'danger'}>
                    {order.type === 'BUY_STOCK' ? 'MUA' : 'BÁN'}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{order.amountToken} TNT</p>
                  <p className="text-sm text-gray-500">{formatVND(order.amountVND)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
