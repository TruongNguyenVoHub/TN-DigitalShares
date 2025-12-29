'use client';

import { Badge, Button, Card, Input, Modal } from '@/components/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import AdminLayout from '../../layout';

interface User {
  id: string;
  walletAddress: string;
  fullName: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  isWhitelisted: boolean;
  createdAt: string;
}

interface KYCRequest {
  id: string;
  userId: string;
  walletAddress: string;
  idCardNumber: string;
  idCardImageFront: string;
  idCardImageBack: string;
  selfieImage: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function UsersPage() {
  const [selectedKYC, setSelectedKYC] = useState<KYCRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [extractedName, setExtractedName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const [users] = useState<User[]>([
    { id: '1', walletAddress: '0x1234567890abcdef1234567890abcdef12345678', fullName: 'Nguyen Van A', kycStatus: 'VERIFIED', isWhitelisted: true, createdAt: '2025-12-01' },
    { id: '2', walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12', fullName: 'Tran Thi B', kycStatus: 'PENDING', isWhitelisted: false, createdAt: '2025-12-15' },
    { id: '3', walletAddress: '0x9876543210fedcba9876543210fedcba98765432', fullName: 'Le Van C', kycStatus: 'REJECTED', isWhitelisted: false, createdAt: '2025-12-20' },
  ]);

  const [kycRequests] = useState<KYCRequest[]>([
    { id: 'kyc1', userId: '2', walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12', idCardNumber: '012345678901', idCardImageFront: 'https://example.com/front.jpg', idCardImageBack: 'https://example.com/back.jpg', selfieImage: 'https://example.com/selfie.jpg', status: 'PENDING', createdAt: '2025-12-15' },
    { id: 'kyc2', userId: '4', walletAddress: '0x1111222233334444555566667777888899990000', idCardNumber: '098765432109', idCardImageFront: 'https://example.com/front2.jpg', idCardImageBack: 'https://example.com/back2.jpg', selfieImage: 'https://example.com/selfie2.jpg', status: 'PENDING', createdAt: '2025-12-28' },
  ]);

  const pendingKYC = kycRequests.filter(k => k.status === 'PENDING');

  const handleApprove = async () => {
    if (!selectedKYC || !extractedName) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/kyc/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedKYC.id,
          decision: 'APPROVED',
          extractedName,
          reason: '',
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('KYC đã được duyệt thành công!');
        setIsModalOpen(false);
        setSelectedKYC(null);
        setExtractedName('');
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedKYC || !rejectReason) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/kyc/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedKYC.id,
          decision: 'REJECTED',
          extractedName: '',
          reason: rejectReason,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('KYC đã bị từ chối!');
        setIsModalOpen(false);
        setSelectedKYC(null);
        setRejectReason('');
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            KYC chờ duyệt
            {pendingKYC.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingKYC.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">Danh sách người dùng</TabsTrigger>
        </TabsList>

        {/* KYC Pending Tab */}
        <TabsContent value="pending">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Yêu cầu KYC chờ duyệt</h3>
            
            {pendingKYC.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Không có yêu cầu KYC nào đang chờ duyệt</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>CCCD</TableHead>
                    <TableHead>Ngày gửi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingKYC.map((kyc) => (
                    <TableRow key={kyc.id}>
                      <TableCell className="font-mono text-sm">{kyc.id}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {kyc.walletAddress.slice(0, 8)}...{kyc.walletAddress.slice(-6)}
                      </TableCell>
                      <TableCell>{kyc.idCardNumber}</TableCell>
                      <TableCell>{new Date(kyc.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>
                        <Badge variant="warning">Pending</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedKYC(kyc);
                            setIsModalOpen(true);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* All Users Tab */}
        <TabsContent value="users">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Danh sách người dùng</h3>
              <div className="w-64">
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Trạng thái KYC</TableHead>
                  <TableHead>Whitelist</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">{user.id}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
                    </TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>
                      <Badge variant={
                        user.kycStatus === 'VERIFIED' ? 'success' :
                        user.kycStatus === 'PENDING' ? 'warning' : 'danger'
                      }>
                        {user.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isWhitelisted ? (
                        <Badge variant="success">✅ Yes</Badge>
                      ) : (
                        <Badge variant="default">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* KYC Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedKYC(null);
          setExtractedName('');
          setRejectReason('');
        }}
        title="Chi tiết yêu cầu KYC"
        size="lg"
      >
        {selectedKYC && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Wallet Address</p>
                <p className="font-mono text-sm">{selectedKYC.walletAddress}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số CCCD</p>
                <p className="font-medium">{selectedKYC.idCardNumber}</p>
              </div>
            </div>

            {/* ID Card Images */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Ảnh CCCD</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-2">Mặt trước</p>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Ảnh CCCD mặt trước</span>
                  </div>
                </div>
                <div className="border rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-2">Mặt sau</p>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Ảnh CCCD mặt sau</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selfie */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Ảnh Selfie</p>
              <div className="border rounded-xl p-4 text-center max-w-xs mx-auto">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Ảnh selfie</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-4">
              <div className="mb-4">
                <Input
                  label="Họ tên trích xuất từ CCCD (để duyệt)"
                  placeholder="Nhập họ tên"
                  value={extractedName}
                  onChange={(e) => setExtractedName(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <Input
                  label="Lý do từ chối (nếu reject)"
                  placeholder="Nhập lý do..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleApprove}
                  isLoading={isLoading}
                  variant="success"
                  fullWidth
                  disabled={!extractedName}
                >
                  ✅ APPROVE
                </Button>
                <Button
                  onClick={handleReject}
                  isLoading={isLoading}
                  variant="danger"
                  fullWidth
                  disabled={!rejectReason}
                >
                  ❌ REJECT
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
