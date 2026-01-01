'use client';

import { Badge, Button, Card, Input, Modal, ToastContainer, useToast } from '@/components/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormEvent, useCallback, useEffect, useState } from 'react';

interface TokenTransaction {
  id: string;
  userId: string;
  amountToken: number | null;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  txHash?: string | null;
  createdAt: string;
  userDailyTotal?: number;
  user?: {
    walletAddress: string;
    fullName: string;
  };
}

interface GatewayStats {
  pendingWithdrawCount: number;
  totalDepositToday: number;
  totalWithdrawToday: number;
  depositCountToday: number;
  withdrawCountToday: number;
}

interface GatewayData {
  deposits: TokenTransaction[];
  withdraws: TokenTransaction[];
  stats: GatewayStats;
}

export default function TokenGatewayPage() {
  const { toasts, removeToast, success, error } = useToast();
  const [selectedWithdraw, setSelectedWithdraw] = useState<TokenTransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isBonusSubmitting, setIsBonusSubmitting] = useState(false);

  const [bonusWallet, setBonusWallet] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusNote, setBonusNote] = useState('');

  const [data, setData] = useState<GatewayData>({
    deposits: [],
    withdraws: [],
    stats: {
      pendingWithdrawCount: 0,
      totalDepositToday: 0,
      totalWithdrawToday: 0,
      depositCountToday: 0,
      withdrawCountToday: 0
    }
  });

  const fetchData = useCallback(async () => {
    try {
      setIsDataLoading(true);
      const response = await fetch('/api/admin/token-gateway');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching token gateway data:', error);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitBonus = async (e: FormEvent) => {
    e.preventDefault();

    const amount = Number(bonusAmount);
    if (!bonusWallet || !Number.isFinite(amount) || amount <= 0) {
      error('Vui lòng nhập ví và số token hợp lệ (>0)');
      return;
    }

    setIsBonusSubmitting(true);
    try {
      const response = await fetch('/api/admin/token-gateway/bonus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: bonusWallet.trim(),
          amountToken: amount,
          note: bonusNote.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        success('Đã thưởng token thành công');
        setBonusWallet('');
        setBonusAmount('');
        setBonusNote('');
        fetchData();
      } else {
        error(result.message || 'Không thể thưởng token');
      }
    } catch (err) {
      console.error('Error granting bonus token:', err);
      error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsBonusSubmitting(false);
    }
  };

  const pendingWithdraws = data.withdraws.filter(w => w.status === 'PENDING');

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const handleApproveWithdraw = async () => {
    if (!selectedWithdraw) return;
    
    setIsLoading(true);
    try {
      // TODO: Call the API to approve and process the token transfer
      // This would call the smart contract to transfer from treasury to user wallet
      const response = await fetch(`/api/admin/token-gateway/${selectedWithdraw.id}/approve`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        success(`Đã chuyển ${selectedWithdraw.amountToken} TNT!`);
        setIsModalOpen(false);
        setSelectedWithdraw(null);
        fetchData(); // Refresh data
      } else {
        error(`Lỗi: ${result.message}`);
      }
    } catch {
      error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Bonus Grant */}
      <Card className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Thưởng Token cho nhân viên (off-chain)</h3>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmitBonus}>
          <Input
            label="Wallet Address"
            placeholder="0x..."
            value={bonusWallet}
            onChange={(e) => setBonusWallet(e.target.value)}
            required
          />
          <Input
            label="Số lượng Token"
            placeholder="Ví dụ: 100"
            type="number"
            min="0"
            step="0.0001"
            value={bonusAmount}
            onChange={(e) => setBonusAmount(e.target.value)}
            required
          />
          <div className="flex flex-col gap-2 md:col-span-1">
            <label className="text-sm font-medium text-gray-700">Ghi chú (optional)</label>
            <textarea
              className="w-full h-12 px-4 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900"
              placeholder="VD: Thưởng quý"
              value={bonusNote}
              onChange={(e) => setBonusNote(e.target.value)}
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" variant="success" isLoading={isBonusSubmitting}>
              Thưởng Token
            </Button>
          </div>
        </form>
      </Card>

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
                {formatNumber(data.stats.totalDepositToday)} TNT
              </p>
              <p className="text-xs text-gray-400">{data.stats.depositCountToday} giao dịch</p>
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
                {formatNumber(data.stats.totalWithdrawToday)} TNT
              </p>
              <p className="text-xs text-gray-400">{data.stats.withdrawCountToday} giao dịch</p>
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
          <TabsTrigger value="withdraw-history">Lịch sử rút Token</TabsTrigger>
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
                    <TableHead>Tổng rút hôm nay</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.withdraws.filter(w => w.status === 'PENDING').map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-sm">{req.id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-mono text-sm">
                        {req.user?.walletAddress ? `${req.user.walletAddress.slice(0, 8)}...${req.user.walletAddress.slice(-6)}` : '-'}
                      </TableCell>
                      <TableCell className="font-medium text-red-600">
                        {formatNumber(req.amountToken || 0)} TNT
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${(req.userDailyTotal || 0) > 200 ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatNumber(req.userDailyTotal || 0)} TNT
                          </span>
                          {(req.userDailyTotal || 0) > 200 && (
                            <Badge variant="danger" className="text-xs">⚠️ {'>'}200</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(req.createdAt).toLocaleString('vi-VN')}</TableCell>
                      <TableCell>
                        <Badge variant={
                          req.status === 'SUCCESS' ? 'success' :
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
                        {req.status === 'SUCCESS' && req.txHash && (
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

        {/* Withdraw History Tab */}
        <TabsContent value="withdraw-history">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Lịch sử rút Token</h3>
            
            {data.withdraws.filter(w => w.status !== 'PENDING').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Chưa có lịch sử rút Token</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Tổng rút hôm nay</TableHead>
                    <TableHead>TxHash</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.withdraws.filter(w => w.status !== 'PENDING').map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{log.id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.user?.walletAddress ? `${log.user.walletAddress.slice(0, 8)}...${log.user.walletAddress.slice(-6)}` : '-'}
                      </TableCell>
                      <TableCell className="font-medium text-red-600">
                        -{formatNumber(log.amountToken || 0)} TNT
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${(log.userDailyTotal || 0) > 200 ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatNumber(log.userDailyTotal || 0)} TNT
                          </span>
                          {(log.userDailyTotal || 0) > 200 && (
                            <Badge variant="danger" className="text-xs">⚠️ {'>'}200</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.txHash ? (
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${log.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-600 hover:underline"
                          >
                            {log.txHash.slice(0, 10)}...
                          </a>
                        ) : '-'}
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
            )}
          </Card>
        </TabsContent>

        {/* Deposit Logs Tab */}
        <TabsContent value="deposits">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Lịch sử nạp Token từ ví</h3>
            
            {data.deposits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p>Chưa có lịch sử nạp Token</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Tổng nạp hôm nay</TableHead>
                    <TableHead>TxHash</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.deposits.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{log.id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.user?.walletAddress ? `${log.user.walletAddress.slice(0, 8)}...${log.user.walletAddress.slice(-6)}` : '-'}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        +{formatNumber(log.amountToken || 0)} TNT
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${(log.userDailyTotal || 0) > 200 ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatNumber(log.userDailyTotal || 0)} TNT
                          </span>
                          {(log.userDailyTotal || 0) > 200 && (
                            <Badge variant="danger" className="text-xs">⚠️ {'>'}200</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.txHash ? (
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${log.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-600 hover:underline"
                          >
                            {log.txHash.slice(0, 10)}...
                          </a>
                        ) : '-'}
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
            )}
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
              <p className="text-3xl font-bold text-orange-600">{formatNumber(selectedWithdraw.amountToken || 0)} TNT</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">Chuyển đến ví:</p>
              <p className="font-mono text-sm break-all">{selectedWithdraw.user?.walletAddress || 'N/A'}</p>
            </div>

            {(selectedWithdraw.userDailyTotal || 0) > 200 && (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-800 mb-1">
                  ⚠️ CẢNH BÁO: User vượt hạn mức 200 token/ngày
                </p>
                <p className="text-sm text-red-700">
                  Tổng số token rút hôm nay: <strong>{formatNumber(selectedWithdraw.userDailyTotal || 0)} TNT</strong>
                  <br />
                  Cần xác nhận kỹ trước khi duyệt yêu cầu này.
                </p>
              </div>
            )}

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
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
