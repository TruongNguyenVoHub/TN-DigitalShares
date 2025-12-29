'use client';

import { Badge, Button, Card, Modal } from '@/components/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import AdminLayout from '../../layout';

interface DepositRequest {
  id: string;
  walletAddress: string;
  amount: number;
  memo: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  createdAt: string;
}

interface WithdrawRequest {
  id: string;
  walletAddress: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  status: 'PENDING' | 'DONE' | 'REJECTED';
  createdAt: string;
}

export default function TreasuryPage() {
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [selectedWithdraw, setSelectedWithdraw] = useState<WithdrawRequest | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  const [depositRequests] = useState<DepositRequest[]>([
    { id: 'dep1', walletAddress: '0x1234567890abcdef1234567890abcdef12345678', amount: 5000000, memo: '0x123456', status: 'PENDING', createdAt: '2025-12-29T10:30:00' },
    { id: 'dep2', walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12', amount: 10000000, memo: '0xabcdef', status: 'PENDING', createdAt: '2025-12-29T11:00:00' },
    { id: 'dep3', walletAddress: '0x9876543210fedcba9876543210fedcba98765432', amount: 2000000, memo: '0x987654', status: 'CONFIRMED', createdAt: '2025-12-28T15:00:00' },
  ]);

  const [withdrawRequests] = useState<WithdrawRequest[]>([
    { id: 'with1', walletAddress: '0x1234567890abcdef1234567890abcdef12345678', amount: 3000000, bankName: 'Vietcombank', accountNumber: '1234567890', status: 'PENDING', createdAt: '2025-12-29T09:00:00' },
    { id: 'with2', walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12', amount: 7500000, bankName: 'Techcombank', accountNumber: '0987654321', status: 'PENDING', createdAt: '2025-12-29T12:00:00' },
  ]);

  const pendingDeposits = depositRequests.filter(d => d.status === 'PENDING');
  const pendingWithdraws = withdrawRequests.filter(w => w.status === 'PENDING');

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleConfirmDeposit = async () => {
    if (!selectedDeposit) return;
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      alert('Đã xác nhận nạp tiền thành công!');
      setIsDepositModalOpen(false);
      setSelectedDeposit(null);
      setIsLoading(false);
    }, 1000);
  };

  const handleConfirmWithdraw = async () => {
    if (!selectedWithdraw) return;
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      alert('Đã xác nhận chuyển tiền thành công!');
      setIsWithdrawModalOpen(false);
      setSelectedWithdraw(null);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <AdminLayout>
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
              <p className="text-2xl font-bold text-green-600">{formatVND(5000000000)}</p>
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
                  <TableHead>Nội dung CK</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depositRequests.map((dep) => (
                  <TableRow key={dep.id}>
                    <TableCell className="font-mono text-sm">{dep.id}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {dep.walletAddress.slice(0, 8)}...{dep.walletAddress.slice(-6)}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">{formatVND(dep.amount)}</TableCell>
                    <TableCell className="font-mono">{dep.memo}</TableCell>
                    <TableCell>{new Date(dep.createdAt).toLocaleString('vi-VN')}</TableCell>
                    <TableCell>
                      <Badge variant={dep.status === 'CONFIRMED' ? 'success' : dep.status === 'PENDING' ? 'warning' : 'danger'}>
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
                ))}
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
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawRequests.map((wit) => (
                  <TableRow key={wit.id}>
                    <TableCell className="font-mono text-sm">{wit.id}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {wit.walletAddress.slice(0, 8)}...{wit.walletAddress.slice(-6)}
                    </TableCell>
                    <TableCell className="font-medium text-red-600">{formatVND(wit.amount)}</TableCell>
                    <TableCell>{wit.bankName}</TableCell>
                    <TableCell className="font-mono">{wit.accountNumber}</TableCell>
                    <TableCell>{new Date(wit.createdAt).toLocaleString('vi-VN')}</TableCell>
                    <TableCell>
                      <Badge variant={wit.status === 'DONE' ? 'success' : wit.status === 'PENDING' ? 'warning' : 'danger'}>
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
                ))}
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
              <p className="text-2xl font-bold text-green-600">{formatVND(selectedDeposit.amount)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Wallet</p>
                <p className="font-mono">{selectedDeposit.walletAddress.slice(0, 12)}...</p>
              </div>
              <div>
                <p className="text-gray-500">Nội dung CK</p>
                <p className="font-mono">{selectedDeposit.memo}</p>
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
              <p className="text-2xl font-bold text-red-600">{formatVND(selectedWithdraw.amount)}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">Thông tin người nhận:</p>
              <p className="font-medium">{selectedWithdraw.bankName}</p>
              <p className="font-mono text-lg">{selectedWithdraw.accountNumber}</p>
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
    </AdminLayout>
  );
}
