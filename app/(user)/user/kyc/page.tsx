'use client';

import { Badge, Button, Card, Input } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export default function KYCPage() {
  const { address } = useAccount();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>('PENDING');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form data
  const [fullName, setFullName] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [idCardFront, setIdCardFront] = useState('');
  const [idCardBack, setIdCardBack] = useState('');
  const [selfieImage, setSelfieImage] = useState('');

  useEffect(() => {
    // Check current KYC status
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setKycStatus(user.kycStatus);
      if (user.kycStatus === 'VERIFIED') {
        router.push('/user/dashboard');
      }
    }
  }, [router]);

  const handleSubmitKYC = async () => {
    if (!fullName || !idCardNumber || !idCardFront || !idCardBack || !selfieImage) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          idCardNumber,
          idCardImageFront: idCardFront,
          idCardImageBack: idCardBack,
          selfieImage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setKycStatus('PENDING');
        setStep(4); // Go to waiting screen
      } else {
        setMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Upload proof function
  const [showUploadProof, setShowUploadProof] = useState(false);
  const [proofIdFront, setProofIdFront] = useState('');
  const [proofIdBack, setProofIdBack] = useState('');
  const [proofSelfie, setProofSelfie] = useState('');
  const [proofAdditional, setProofAdditional] = useState('');

  const handleUploadProof = async () => {
    if (!proofIdFront || !proofIdBack || !proofSelfie) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ ảnh CCCD và selfie' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          idCardNumber: idCardNumber || 'N/A',
          idCardImageFront: proofIdFront,
          idCardImageBack: proofIdBack,
          selfieImage: proofSelfie,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Tải lên thành công! Vui lòng chờ duyệt.' });
        setShowUploadProof(false);
        setProofIdFront('');
        setProofIdBack('');
        setProofSelfie('');
        setProofAdditional('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Waiting/Verified/Rejected screens
  if (step === 4 || kycStatus === 'PENDING') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full space-y-4">
          <Card className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang chờ duyệt</h2>
            <p className="text-gray-600 mb-4">
              Yêu cầu KYC của bạn đang được xử lý. Vui lòng chờ trong 1-2 ngày làm việc.
            </p>
            <Badge variant="warning">Pending</Badge>
          </Card>

          {/* Upload Additional Proof Section */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Bổ sung giấy tờ</h3>
            <p className="text-sm text-gray-600 mb-4">
              Nếu cần bổ sung thêm giấy tờ xác minh, bạn có thể upload tại đây
            </p>
            {!showUploadProof ? (
              <Button variant="outline" fullWidth onClick={() => setShowUploadProof(true)}>
                Upload thêm giấy tờ
              </Button>
            ) : (
              <div className="space-y-4">
                {message.text && (
                  <div className={`p-3 rounded-lg text-sm ${
                    message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {message.text}
                  </div>
                )}

                <Input
                  label="Ảnh CCCD mặt trước *"
                  placeholder="Nhập URL ảnh CCCD mặt trước"
                  value={proofIdFront}
                  onChange={(e) => setProofIdFront(e.target.value)}
                />

                <Input
                  label="Ảnh CCCD mặt sau *"
                  placeholder="Nhập URL ảnh CCCD mặt sau"
                  value={proofIdBack}
                  onChange={(e) => setProofIdBack(e.target.value)}
                />

                <Input
                  label="Ảnh selfie với CCCD *"
                  placeholder="Nhập URL ảnh selfie"
                  value={proofSelfie}
                  onChange={(e) => setProofSelfie(e.target.value)}
                />

                <Input
                  label="Giấy tờ bổ sung (nếu có)"
                  placeholder="Nhập URL giấy tờ bổ sung"
                  value={proofAdditional}
                  onChange={(e) => setProofAdditional(e.target.value)}
                  helperText="Không bắt buộc"
                />

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { 
                    setShowUploadProof(false); 
                    setProofIdFront('');
                    setProofIdBack('');
                    setProofSelfie('');
                    setProofAdditional('');
                  }} fullWidth>
                    Hủy
                  </Button>
                  <Button onClick={handleUploadProof} isLoading={isLoading} fullWidth>
                    Tải lên
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  if (kycStatus === 'REJECTED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full space-y-4">
          <Card className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Xác minh thất bại</h2>
            <p className="text-gray-600 mb-4">
              Yêu cầu KYC của bạn đã bị từ chối. Vui lòng thử lại với thông tin chính xác.
            </p>
            <Badge variant="danger" className="mb-4">Rejected</Badge>
          </Card>

          {/* Upload Proof for Rejected */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Bổ sung giấy tờ</h3>
            <p className="text-sm text-gray-600 mb-4">
              Vui lòng upload lại giấy tờ với thông tin chính xác
            </p>
            {!showUploadProof ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setStep(1); setKycStatus(''); }} fullWidth>
                  Làm lại
                </Button>
                <Button fullWidth onClick={() => setShowUploadProof(true)}>
                  Upload giấy tờ
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {message.text && (
                  <div className={`p-3 rounded-lg text-sm ${
                    message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {message.text}
                  </div>
                )}

                <Input
                  label="Ảnh CCCD mặt trước *"
                  placeholder="Nhập URL ảnh CCCD mặt trước"
                  value={proofIdFront}
                  onChange={(e) => setProofIdFront(e.target.value)}
                />

                <Input
                  label="Ảnh CCCD mặt sau *"
                  placeholder="Nhập URL ảnh CCCD mặt sau"
                  value={proofIdBack}
                  onChange={(e) => setProofIdBack(e.target.value)}
                />

                <Input
                  label="Ảnh selfie với CCCD *"
                  placeholder="Nhập URL ảnh selfie"
                  value={proofSelfie}
                  onChange={(e) => setProofSelfie(e.target.value)}
                />

                <Input
                  label="Giấy tờ bổ sung (nếu có)"
                  placeholder="Nhập URL giấy tờ bổ sung"
                  value={proofAdditional}
                  onChange={(e) => setProofAdditional(e.target.value)}
                  helperText="Không bắt buộc"
                />

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { 
                    setShowUploadProof(false); 
                    setProofIdFront('');
                    setProofIdBack('');
                    setProofSelfie('');
                    setProofAdditional('');
                  }} fullWidth>
                    Hủy
                  </Button>
                  <Button onClick={handleUploadProof} isLoading={isLoading} fullWidth>
                    Upload
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">Xác minh danh tính</h1>
          <p className="text-sm text-gray-600">Hoàn thành KYC để bắt đầu giao dịch</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900">Bước 1: Thông tin cá nhân</h2>
              
              <Input
                label="Họ và tên (theo CCCD)"
                placeholder="Nhập họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <Input
                label="Số CCCD/CMND"
                placeholder="Nhập số CCCD"
                value={idCardNumber}
                onChange={(e) => setIdCardNumber(e.target.value)}
              />

              <Button onClick={() => setStep(2)} fullWidth disabled={!fullName || !idCardNumber}>
                Tiếp tục
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900">Bước 2: Ảnh CCCD</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mặt trước CCCD
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  {idCardFront ? (
                    <div className="text-green-600">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Đã tải lên</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <Input
                        type="text"
                        placeholder="Dán URL ảnh mặt trước"
                        value={idCardFront}
                        onChange={(e) => setIdCardFront(e.target.value)}
                      />
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mặt sau CCCD
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  {idCardBack ? (
                    <div className="text-green-600">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Đã tải lên</span>
                    </div>
                  ) : (
                    <Input
                      type="text"
                      placeholder="Dán URL ảnh mặt sau"
                      value={idCardBack}
                      onChange={(e) => setIdCardBack(e.target.value)}
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" fullWidth>
                  Quay lại
                </Button>
                <Button onClick={() => setStep(3)} fullWidth disabled={!idCardFront || !idCardBack}>
                  Tiếp tục
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900">Bước 3: Ảnh Selfie</h2>
              
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-medium mb-1">Hướng dẫn:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Chụp ảnh khuôn mặt rõ ràng</li>
                  <li>Ánh sáng đủ, không bị che khuất</li>
                  <li>Không đeo kính râm hoặc khẩu trang</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                {selfieImage ? (
                  <div className="text-green-600">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Đã tải lên</span>
                  </div>
                ) : (
                  <Input
                    type="text"
                    placeholder="Dán URL ảnh selfie"
                    value={selfieImage}
                    onChange={(e) => setSelfieImage(e.target.value)}
                  />
                )}
              </div>

              {message.text && (
                <div className={`p-3 rounded-xl text-sm ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="outline" fullWidth>
                  Quay lại
                </Button>
                <Button 
                  onClick={handleSubmitKYC} 
                  isLoading={isLoading}
                  fullWidth 
                  variant="success"
                  disabled={!selfieImage}
                >
                  Gửi xác minh
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
