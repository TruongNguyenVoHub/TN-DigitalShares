'use client';

import { Button, Card, Input } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getWalletAddress } from '@/utils/wallet.util';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

interface UserProfile {
  vndBalance: number;
  tokenBalance: number;
}

export default function WalletPage() {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'vnd';
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [txHash, setTxHash] = useState('');
  const [tokenWithdrawAmount, setTokenWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [depositConfirmed, setDepositConfirmed] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  const COMPANY_WALLET = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0x...';
  const COMPANY_BANK = {
    name: 'Vietcombank',
    number: '1234567890',
    holder: 'CÔNG TY CỔ PHẦN TNT',
  };

  useEffect(() => {
    const wallet = getWalletAddress(address);
    if (wallet) {
      setWalletAddress(wallet);
      fetchProfile(wallet);
    }
  }, [address]);

  const fetchProfile = async (wallet: string) => {
    try {
      const response = await fetch(`/api/user/${wallet}/profile`);
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleDepositVND = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setMessage({ type: 'error', text: 'Vui lòng nhập số tiền hợp lệ' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/payment/deposit-vnd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletAddress,
          amount: parseFloat(depositAmount),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Nạp tiền thành công!' });
        setDepositAmount('');
        setDepositConfirmed(false);
        fetchProfile(walletAddress);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawVND = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0 || !bankName || !accountNumber || !accountName) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/payment/withdraw-vnd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletAddress,
          amount: parseFloat(withdrawAmount),
          bankInfo: { bankName, accountNumber, accountName },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Yêu cầu rút tiền đã được gửi!' });
        setWithdrawAmount('');
        setBankName('');
        setAccountName('');
        setAccountNumber('');
        fetchProfile(walletAddress);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepositToken = async () => {
    if (!txHash) {
      setMessage({ type: 'error', text: 'Vui lòng nhập Transaction Hash' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`/api/user/${walletAddress}/deposit-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Nạp Token thành công!' });
        setTxHash('');
        fetchProfile(walletAddress);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawToken = async () => {
    if (!tokenWithdrawAmount || parseFloat(tokenWithdrawAmount) <= 0) {
      setMessage({ type: 'error', text: 'Vui lòng nhập số lượng hợp lệ' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`/api/user/${walletAddress}/withdraw-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(tokenWithdrawAmount) }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Rút Token thành công! TxHash: ${data.data.txHash}` });
        setTokenWithdrawAmount('');
        fetchProfile(walletAddress);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Balance Overview */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4">
          <p className="text-green-100 text-xs mb-1">Số dư VND</p>
          <p className="text-xl font-bold">{formatVND(profile?.vndBalance || 0)}</p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4">
          <p className="text-blue-100 text-xs mb-1">Số dư Token</p>
          <p className="text-xl font-bold">{profile?.tokenBalance || 0} TNT</p>
        </Card>
      </div>

      {/* Main Tabs */}
      <Card>
        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="vnd">VND</TabsTrigger>
            <TabsTrigger value="token">Token (TNT)</TabsTrigger>
          </TabsList>

          {/* VND Tab */}
          <TabsContent value="vnd">
            <Tabs defaultValue="deposit">
              <TabsList className="mb-4">
                <TabsTrigger value="deposit">Nạp tiền</TabsTrigger>
                <TabsTrigger value="withdraw">Rút tiền</TabsTrigger>
              </TabsList>

              {/* Deposit VND */}
              <TabsContent value="deposit">
                <div className="space-y-4">
                  {!depositConfirmed ? (
                    <>
                      <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <p className="text-sm text-gray-600 mb-3">Chuyển khoản đến</p>
                        <div className="bg-white rounded-lg p-4 mb-3">
                          <p className="font-medium text-gray-900">{COMPANY_BANK.holder}</p>
                          <p className="text-lg font-bold text-blue-600">{COMPANY_BANK.number}</p>
                          <p className="text-sm text-gray-500">{COMPANY_BANK.name}</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          Nội dung CK: <span className="font-mono font-medium">{address?.slice(0, 8) || 'TNT Stock'}</span>
                        </p>
                      </div>

                      <Input
                        label="Số tiền nạp"
                        type="number"
                        placeholder="Nhập số tiền VND"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                      />

                      <Button
                        onClick={() => setDepositConfirmed(true)}
                        fullWidth
                        variant="outline"
                      >
                        Tôi đã chuyển khoản
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="bg-yellow-50 rounded-xl p-4 text-center">
                        <svg className="w-12 h-12 text-yellow-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium text-gray-900">Xác nhận giao dịch</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Bạn đã chuyển {formatVND(parseFloat(depositAmount || '0'))}?
                        </p>
                      </div>

                      {message.text && (
                        <div className={`p-3 rounded-xl text-sm ${
                          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {message.text}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          onClick={() => setDepositConfirmed(false)}
                          variant="outline"
                          fullWidth
                        >
                          Quay lại
                        </Button>
                        <Button
                          onClick={handleDepositVND}
                          isLoading={isLoading}
                          fullWidth
                          variant="success"
                        >
                          Xác nhận
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Withdraw VND */}
              <TabsContent value="withdraw">
                <div className="space-y-4">
                  <Input
                    label="Số tiền rút"
                    type="number"
                    placeholder="Nhập số tiền VND"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    helperText={`Khả dụng: ${formatVND(profile?.vndBalance || 0)}`}
                  />

                  <Input
                    label="Tên ngân hàng"
                    placeholder="VD: Vietcombank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />

                  <Input
                    label="Tên chủ tài khoản"
                    placeholder="Nhập tên chủ tài khoản"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />

                  <Input
                    label="Số tài khoản"
                    placeholder="Nhập số tài khoản"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />

                  {message.text && (
                    <div className={`p-3 rounded-xl text-sm ${
                      message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <Button
                    onClick={handleWithdrawVND}
                    isLoading={isLoading}
                    fullWidth
                    size="lg"
                    variant="danger"
                  >
                    Rút tiền
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Token Tab */}
          <TabsContent value="token">
            <Tabs defaultValue="deposit">
              <TabsList className="mb-4">
                <TabsTrigger value="deposit">Nạp Token</TabsTrigger>
                <TabsTrigger value="withdraw">Rút Token</TabsTrigger>
              </TabsList>

              {/* Deposit Token */}
              <TabsContent value="deposit">
                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-2">Hướng dẫn nạp Token:</p>
                    <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                      <li>Mở ví MetaMask của bạn</li>
                      <li>Chuyển Token TNT đến địa chỉ:</li>
                    </ol>
                    <div className="bg-white rounded-lg p-3 mt-2 font-mono text-xs break-all">
                      {COMPANY_WALLET}
                    </div>
                    <ol start={3} className="text-sm text-gray-700 space-y-2 list-decimal list-inside mt-2">
                      <li>Copy Transaction Hash và dán vào ô bên dưới</li>
                    </ol>
                  </div>

                  <Input
                    label="Transaction Hash"
                    placeholder="0x..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                  />

                  {message.text && (
                    <div className={`p-3 rounded-xl text-sm ${
                      message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <Button
                    onClick={handleDepositToken}
                    isLoading={isLoading}
                    fullWidth
                    size="lg"
                  >
                    Xác nhận nạp
                  </Button>
                </div>
              </TabsContent>

              {/* Withdraw Token */}
              <TabsContent value="withdraw">
                <div className="space-y-4">
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600">
                      Token sẽ được chuyển về ví MetaMask của bạn:
                    </p>
                    <p className="font-mono text-sm text-gray-900 mt-1 break-all">
                      {address}
                    </p>
                  </div>

                  <Input
                    label="Số lượng Token"
                    type="number"
                    placeholder="Nhập số lượng"
                    value={tokenWithdrawAmount}
                    onChange={(e) => setTokenWithdrawAmount(e.target.value)}
                    helperText={`Khả dụng: ${profile?.tokenBalance || 0} TNT`}
                  />

                  {message.text && (
                    <div className={`p-3 rounded-xl text-sm ${
                      message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <Button
                    onClick={handleWithdrawToken}
                    isLoading={isLoading}
                    fullWidth
                    size="lg"
                    variant="danger"
                  >
                    Rút Token
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </Card>
    </>
  );
}
