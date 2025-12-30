'use client';

import { Badge, Button, Card, Input, Modal } from '@/components/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCallback, useEffect, useState } from 'react';

interface InventoryLog {
  id: string;
  action: 'IMPORT' | 'EXPORT';
  quantity: number;
  proofUrl: string;
  txHash: string;
  adminId: string;
  createdAt: string;
}

interface InventoryData {
  symbol: string;
  realShares: number;
  mintedTokens: number;
  currentPrice: number;
}

export default function InventoryPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Form states
  const [importQuantity, setImportQuantity] = useState('');
  const [importProofUrl, setImportProofUrl] = useState('');
  const [exportQuantity, setExportQuantity] = useState('');
  const [exportProofUrl, setExportProofUrl] = useState('');

  // Data from API
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  
  // Blockchain data
  const [totalSupply, setTotalSupply] = useState(0);
  const [treasuryBalance, setTreasuryBalance] = useState(0);
  const [circulatingSupply, setCirculatingSupply] = useState(0);

  const fetchData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      // Fetch inventory logs
      const response = await fetch('/api/admin/inventory?symbol=TNT');
      const data = await response.json();
      
      if (data.success) {
        setInventory(data.data.inventory);
        setLogs(data.data.logs);
      }

      // Fetch blockchain data (totalSupply, treasuryBalance, price)
      const blockchainResponse = await fetch('/api/admin/inventory/blockchain');
      const blockchainData = await blockchainResponse.json();
      if (blockchainData.success) {
        setTotalSupply(blockchainData.data.totalSupply);
        setTreasuryBalance(blockchainData.data.treasuryBalance);
        setCirculatingSupply(blockchainData.data.circulatingSupply);
        setCurrentPrice(blockchainData.data.currentPrice);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const handleImport = async () => {
    if (!importQuantity || !importProofUrl) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/inventory/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'TNT',
          quantity: parseInt(importQuantity),
          proofUrl: importProofUrl,
          adminId: 'admin1', // Should come from auth
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Nhập kho thành công! TxHash: ${data.data.txHash}`);
        setIsImportModalOpen(false);
        setImportQuantity('');
        setImportProofUrl('');
        fetchData(); // Refresh data
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!exportQuantity || !exportProofUrl) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/inventory/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'TNT',
          quantity: parseInt(exportQuantity),
          proofUrl: exportProofUrl,
          adminId: 'admin1',
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Xuất kho thành công! TxHash: ${data.data.txHash}`);
        setIsExportModalOpen(false);
        setExportQuantity('');
        setExportProofUrl('');
        fetchData(); // Refresh data
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
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 text-sm">Giá hiện tại</p>
          <p className="text-2xl font-bold">{formatVND(currentPrice)}</p>
          <Badge className="mt-2 bg-white/20 text-white border-0">On-chain</Badge>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng cung</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(totalSupply)}</p>
              <p className="text-xs text-gray-400">Mint - Burn</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Số dư Kho Quỹ</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(treasuryBalance)}</p>
              <p className="text-xs text-gray-400">{totalSupply > 0 ? ((treasuryBalance / totalSupply) * 100).toFixed(1) : '0.0'}% tổng cung</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Đang lưu hành</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(circulatingSupply)}</p>
              <p className="text-xs text-gray-400">Token ngoài treasury</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Tác vụ quản lý kho</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => setIsImportModalOpen(true)}
            size="lg"
            variant="success"
            fullWidth
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            NHẬP KHO / PHÁT HÀNH
          </Button>

          <Button
            onClick={() => setIsExportModalOpen(true)}
            size="lg"
            variant="danger"
            fullWidth
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            XUẤT KHO / HỦY
          </Button>
        </div>
      </Card>

      {/* History Logs */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Lịch sử nhập/xuất kho</h3>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead>Chứng từ</TableHead>
              <TableHead>TxHash</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  Chưa có lịch sử nhập/xuất kho
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{log.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <Badge variant={log.action === 'IMPORT' ? 'success' : 'danger'}>
                      {log.action === 'IMPORT' ? '📥 Nhập' : '📤 Xuất'}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-medium ${log.action === 'IMPORT' ? 'text-green-600' : 'text-red-600'}`}>
                    {log.action === 'IMPORT' ? '+' : '-'}{formatNumber(log.quantity)} TNT
                  </TableCell>
                  <TableCell>
                    <a 
                      href={log.proofUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      📄 Xem file
                    </a>
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
                  <TableCell>{log.adminId}</TableCell>
                  <TableCell>{new Date(log.createdAt).toLocaleString('vi-VN')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportQuantity('');
          setImportProofUrl('');
        }}
        title="Nhập kho / Phát hành Token"
      >
        <div className="space-y-4">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-green-800">
              ⚠️ Hành động này sẽ <strong>MINT</strong> token mới lên blockchain và cộng vào Treasury Wallet.
            </p>
          </div>

          <Input
            label="Số lượng Token"
            type="number"
            placeholder="VD: 1000"
            value={importQuantity}
            onChange={(e) => setImportQuantity(e.target.value)}
          />

          <Input
            label="Link chứng từ (PDF Nghị quyết HĐQT)"
            placeholder="https://example.com/proof.pdf"
            value={importProofUrl}
            onChange={(e) => setImportProofUrl(e.target.value)}
          />

          <div className="bg-gray-50 rounded-xl p-4 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Supply hiện tại:</span>
              <span className="font-medium">{formatNumber(totalSupply)} TNT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Supply sau khi nhập:</span>
              <span className="font-medium text-green-600">
                {formatNumber(totalSupply + (parseInt(importQuantity) || 0))} TNT
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setIsImportModalOpen(false)}
              variant="outline"
              fullWidth
            >
              Hủy
            </Button>
            <Button
              onClick={handleImport}
              isLoading={isLoading}
              variant="success"
              fullWidth
            >
              Xác nhận MINT
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setExportQuantity('');
          setExportProofUrl('');
        }}
        title="Xuất kho / Hủy Token"
      >
        <div className="space-y-4">
          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-sm text-red-800">
              ⚠️ Hành động này sẽ <strong>BURN</strong> token từ Treasury Wallet trên blockchain.
            </p>
          </div>

          <Input
            label="Số lượng Token"
            type="number"
            placeholder="VD: 500"
            value={exportQuantity}
            onChange={(e) => setExportQuantity(e.target.value)}
            helperText={`Treasury hiện có: ${formatNumber(treasuryBalance)} TNT`}
          />

          <Input
            label="Link chứng từ"
            placeholder="https://example.com/proof.pdf"
            value={exportProofUrl}
            onChange={(e) => setExportProofUrl(e.target.value)}
          />

          <div className="bg-gray-50 rounded-xl p-4 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Treasury hiện tại:</span>
              <span className="font-medium">{formatNumber(treasuryBalance)} TNT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Treasury sau khi xuất:</span>
              <span className="font-medium text-red-600">
                {formatNumber(treasuryBalance - (parseInt(exportQuantity) || 0))} TNT
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setIsExportModalOpen(false)}
              variant="outline"
              fullWidth
            >
              Hủy
            </Button>
            <Button
              onClick={handleExport}
              isLoading={isLoading}
              variant="danger"
              fullWidth
            >
              Xác nhận BURN
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
