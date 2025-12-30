'use client';

import { Badge, Button, Card, Modal } from '@/components/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCallback, useEffect, useState } from 'react';

interface Transaction {
  id: string;
  userId: string;
  walletAddress: string;
  fullName: string;
  type: string;
  amountVND: number;
  amountToken?: number;
  status: string;
  txHash?: string;
  refCode?: string;
  bankInfo?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };
  createdAt: string;
}

export default function TreasuryPage() {
  const [selectedDeposit, setSelectedDeposit] = useState<Transaction | null>(null);
  const [selectedWithdraw, setSelectedWithdraw] = useState<Transaction | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [depositRequests, setDepositRequests] = useState<Transaction[]>([]);
  const [withdrawRequests, setWithdrawRequests] = useState<Transaction[]>([]);
  const [treasuryVnd, setTreasuryVnd] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      // Fetch deposit transactions
      const depositResponse = await fetch('/api/admin/transactions?type=DEPOSIT');
      const depositData = await depositResponse.json();
      if (depositData.success) {
        setDepositRequests(depositData.data.transactions);
      }

      // Fetch withdraw transactions
      const withdrawResponse = await fetch('/api/admin/transactions?type=WITHDRAW');
      const withdrawData = await withdrawResponse.json();
      if (withdrawData.success) {
        setWithdrawRequests(withdrawData.data.transactions);
      }

      // Fetch overall stats (to compute treasury VND = totalSupply * currentPrice)
      try {
        const statsResp = await fetch('/api/admin/stats');
        const statsData = await statsResp.json();
        if (statsData.success && statsData.data?.stats) {
          const totalSupply = statsData.data.stats.totalSupply || 0;
          console.log('Total Supply:', totalSupply);
          const currentPrice = statsData.data.stats.currentPrice || 0;
            console.log('Current Price:', currentPrice);
          setTreasuryVnd(totalSupply * currentPrice);
        }
      } catch {
        // ignore stats fetch errors
      }
    } catch {
      console.error('Error fetching data');
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingDeposits = depositRequests.filter(d => d.status === 'PENDING');
  const pendingWithdraws = withdrawRequests.filter(w => w.status === 'PENDING');

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Display value rounded down to nearest 1,000 (last 3 digits -> 000)
  const displayTreasuryVnd = Number.isFinite(treasuryVnd) ? Math.floor(treasuryVnd / 1000) * 1000 : 0;

  const handleConfirmDeposit = async () => {
    if (!selectedDeposit) return;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/payment/deposit-vnd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: selectedDeposit.walletAddress,
          amount: selectedDeposit.amountVND,
          transactionId: selectedDeposit.id,
          action: 'confirm',
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Đã xác nhận nạp tiền thành công!');
        setIsDepositModalOpen(false);
        setSelectedDeposit(null);
        fetchData();
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmWithdraw = async () => {
    if (!selectedWithdraw) return;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/payment/withdraw-vnd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: selectedWithdraw.walletAddress,
          transactionId: selectedWithdraw.id,
          action: 'confirm',
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Đã xác nhận chuyển tiền thành công!');
        setIsWithdrawModalOpen(false);
        setSelectedWithdraw(null);
        fetchData();
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Nạp tiền chờ duyệt</p>
              <p className="text-2xl font-bold text-orange-600">{pendingDeposits.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rút tiền chờ xử lý</p>
              <p className="text-2xl font-bold text-red-600">{pendingWithdraws.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng VND trong hệ thống</p>
              <p className="text-2xl font-bold text-green-600">{formatVND(displayTreasuryVnd)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="deposits">
        <TabsList className="mb-6">
          <TabsTrigger value="deposits">
            Duyệt nạp tiền
            {pendingDeposits.length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingDeposits.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="withdraws">
            Duyệt rút tiền
            {pendingWithdraws.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingWithdraws.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Deposits Tab */}
        <TabsContent value="deposits">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Yêu cầu nạp tiền</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Ref Code</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depositRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      Chưa có yêu cầu nạp tiền nào
                    </TableCell>
                  </TableRow>
                ) : (
                  depositRequests.map((dep) => (
                    <TableRow key={dep.id}>
                      <TableCell className="font-mono text-sm">{dep.id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-mono text-sm">
                        {dep.walletAddress.slice(0, 8)}...{dep.walletAddress.slice(-6)}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">{formatVND(dep.amountVND)}</TableCell>
                      <TableCell className="font-mono">{dep.refCode || '-'}</TableCell>
                      <TableCell>{new Date(dep.createdAt).toLocaleString('vi-VN')}</TableCell>
                      <TableCell>
                        <Badge variant={dep.status === 'SUCCESS' ? 'success' : dep.status === 'PENDING' ? 'warning' : 'danger'}>
                          {dep.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {dep.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => {
                              setSelectedDeposit(dep);
                              setIsDepositModalOpen(true);
                            }}
                          >
                            Xác nhận
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Withdraws Tab */}
        <TabsContent value="withdraws">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Yêu cầu rút tiền</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Ngân hàng</TableHead>
                  <TableHead>STK</TableHead>
                  <TableHead>Chủ TK</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                      Chưa có yêu cầu rút tiền nào
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawRequests.map((wit) => (
                    <TableRow key={wit.id}>
                      <TableCell className="font-mono text-sm">{wit.id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-mono text-sm">
                        {wit.walletAddress.slice(0, 8)}...{wit.walletAddress.slice(-6)}
                      </TableCell>
                      <TableCell className="font-medium text-red-600">{formatVND(wit.amountVND)}</TableCell>
                      <TableCell>{wit.bankInfo?.bankName || '-'}</TableCell>
                      <TableCell className="font-mono">{wit.bankInfo?.accountNumber || '-'}</TableCell>
                      <TableCell>{wit.bankInfo?.accountName || '-'}</TableCell>
                      <TableCell>{new Date(wit.createdAt).toLocaleString('vi-VN')}</TableCell>
                      <TableCell>
                        <Badge variant={wit.status === 'SUCCESS' ? 'success' : wit.status === 'PENDING' ? 'warning' : 'danger'}>
                          {wit.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {wit.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => {
                              setSelectedWithdraw(wit);
                              setIsWithdrawModalOpen(true);
                            }}
                          >
                            Đã chuyển
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Deposit Confirm Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setSelectedDeposit(null);
        }}
        title="Xác nhận nạp tiền"
      >
        {selectedDeposit && (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">Số tiền</p>
              <p className="text-2xl font-bold text-green-600">{formatVND(selectedDeposit.amountVND)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Wallet</p>
                <p className="font-mono">{selectedDeposit.walletAddress.slice(0, 12)}...</p>
              </div>
              <div>
                <p className="text-gray-500">Mã giao dịch</p>
                <p className="font-mono">{selectedDeposit.refCode || selectedDeposit.id.slice(0, 8)}</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Vui lòng kiểm tra app ngân hàng để xác nhận đã nhận được tiền với nội dung chuyển khoản khớp.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setIsDepositModalOpen(false)}
                variant="outline"
                fullWidth
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmDeposit}
                isLoading={isLoading}
                variant="success"
                fullWidth
              >
                ✅ Xác nhận đã nhận tiền
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Withdraw Confirm Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setSelectedWithdraw(null);
        }}
        title="Xác nhận rút tiền"
      >
        {selectedWithdraw && (
          <div className="space-y-4">
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">Số tiền cần chuyển</p>
              <p className="text-2xl font-bold text-red-600">{formatVND(selectedWithdraw.amountVND)}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">Thông tin người nhận:</p>
              <p className="font-medium">{selectedWithdraw.bankInfo?.bankName || 'N/A'}</p>
              <p className="font-mono text-lg">{selectedWithdraw.bankInfo?.accountNumber || 'N/A'}</p>
              {selectedWithdraw.bankInfo?.accountName && (
                <p className="text-sm text-gray-500">{selectedWithdraw.bankInfo.accountName}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                💡 Hãy chuyển khoản cho khách hàng qua app ngân hàng, sau đó bấm xác nhận.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setIsWithdrawModalOpen(false)}
                variant="outline"
                fullWidth
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmWithdraw}
                isLoading={isLoading}
                variant="success"
                fullWidth
              >
                ✅ Đã chuyển tiền
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
