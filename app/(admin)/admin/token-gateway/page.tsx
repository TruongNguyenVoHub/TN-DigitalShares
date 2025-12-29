'use client';

import { Badge, Button, Card, Modal } from '@/components/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import AdminLayout from '../../layout';

interface TokenWithdrawRequest {
  id: string;
  userId: string;
  walletAddress: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  txHash?: string;
  createdAt: string;
}

interface TokenDepositLog {
  id: string;
  walletAddress: string;
  amount: number;
  txHash: string;
  status: 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export default function TokenGatewayPage() {
  const [selectedWithdraw, setSelectedWithdraw] = useState<TokenWithdrawRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  const [withdrawRequests] = useState<TokenWithdrawRequest[]>([
    { id: 'tw1', userId: 'user1', walletAddress: '0x1234567890abcdef1234567890abcdef12345678', amount: 100, status: 'PENDING', createdAt: '2025-12-29T10:00:00' },
    { id: 'tw2', userId: 'user2', walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12', amount: 50, status: 'PENDING', createdAt: '2025-12-29T11:30:00' },
    { id: 'tw3', userId: 'user3', walletAddress: '0x9876543210fedcba9876543210fedcba98765432', amount: 200, status: 'APPROVED', txHash: '0xabc123...', createdAt: '2025-12-28T15:00:00' },
  ]);

  const [depositLogs] = useState<TokenDepositLog[]>([
    { id: 'td1', walletAddress: '0x1234567890abcdef1234567890abcdef12345678', amount: 150, txHash: '0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeefffff', status: 'SUCCESS', createdAt: '2025-12-29T08:00:00' },
    { id: 'td2', walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12', amount: 75, txHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321', status: 'SUCCESS', createdAt: '2025-12-28T14:00:00' },
    { id: 'td3', walletAddress: '0x9876543210fedcba9876543210fedcba98765432', amount: 25, txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', status: 'FAILED', createdAt: '2025-12-27T10:00:00' },
  ]);

  const pendingWithdraws = withdrawRequests.filter(w => w.status === 'PENDING');

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const handleApproveWithdraw = async () => {
    if (!selectedWithdraw) return;
    
    setIsLoading(true);
    try {
      // This would call the API to transfer tokens
      // The backend will call the smart contract to transfer from treasury to user wallet
      
      // Simulate API call
      setTimeout(() => {
        alert(`Đã chuyển ${selectedWithdraw.amount} TNT cho ví ${selectedWithdraw.walletAddress}!`);
        setIsModalOpen(false);
        setSelectedWithdraw(null);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Yêu cầu rút Token</p>
              <p className="text-2xl font-bold text-orange-600">{pendingWithdraws.length}</p>
              <p className="text-xs text-gray-400">Đang chờ xử lý</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Nạp Token hôm nay</p>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(depositLogs.filter(d => d.status === 'SUCCESS').reduce((sum, d) => sum + d.amount, 0))} TNT
              </p>
              <p className="text-xs text-gray-400">{depositLogs.filter(d => d.status === 'SUCCESS').length} giao dịch</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rút Token hôm nay</p>
              <p className="text-2xl font-bold text-red-600">
                {formatNumber(withdrawRequests.filter(w => w.status === 'APPROVED').reduce((sum, w) => sum + w.amount, 0))} TNT
              </p>
              <p className="text-xs text-gray-400">{withdrawRequests.filter(w => w.status === 'APPROVED').length} giao dịch</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="withdraws">
        <TabsList className="mb-6">
          <TabsTrigger value="withdraws">
            Yêu cầu rút Token
            {pendingWithdraws.length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingWithdraws.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="deposits">Lịch sử nạp Token</TabsTrigger>
        </TabsList>

        {/* Withdraw Requests Tab */}
        <TabsContent value="withdraws">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Yêu cầu rút Token ra ví</h3>
            
            {pendingWithdraws.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Không có yêu cầu rút Token nào đang chờ</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-sm">{req.id}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {req.walletAddress.slice(0, 8)}...{req.walletAddress.slice(-6)}
                      </TableCell>
                      <TableCell className="font-medium text-red-600">
                        {formatNumber(req.amount)} TNT
                      </TableCell>
                      <TableCell>{new Date(req.createdAt).toLocaleString('vi-VN')}</TableCell>
                      <TableCell>
                        <Badge variant={
                          req.status === 'APPROVED' ? 'success' :
                          req.status === 'PENDING' ? 'warning' : 'danger'
                        }>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {req.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => {
                              setSelectedWithdraw(req);
                              setIsModalOpen(true);
                            }}
                          >
                            Duyệt
                          </Button>
                        )}
                        {req.status === 'APPROVED' && req.txHash && (
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${req.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Xem TX
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* Deposit Logs Tab */}
        <TabsContent value="deposits">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Lịch sử nạp Token từ ví</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>TxHash</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depositLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">{log.id}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.walletAddress.slice(0, 8)}...{log.walletAddress.slice(-6)}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      +{formatNumber(log.amount)} TNT
                    </TableCell>
                    <TableCell>
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${log.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-blue-600 hover:underline"
                      >
                        {log.txHash.slice(0, 10)}...
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'SUCCESS' ? 'success' : 'danger'}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(log.createdAt).toLocaleString('vi-VN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Withdraw Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWithdraw(null);
        }}
        title="Duyệt yêu cầu rút Token"
      >
        {selectedWithdraw && (
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">Số Token cần chuyển</p>
              <p className="text-3xl font-bold text-orange-600">{formatNumber(selectedWithdraw.amount)} TNT</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">Chuyển đến ví:</p>
              <p className="font-mono text-sm break-all">{selectedWithdraw.walletAddress}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Hệ thống sẽ tự động gọi Smart Contract để chuyển Token từ Treasury Wallet đến ví của user.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                💡 Giao dịch sẽ được thực hiện trên blockchain. Vui lòng đảm bảo Treasury Wallet có đủ token và ETH để trả gas.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                fullWidth
              >
                Hủy
              </Button>
              <Button
                onClick={handleApproveWithdraw}
                isLoading={isLoading}
                variant="success"
                fullWidth
              >
                ✅ Duyệt & Chuyển Token
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
