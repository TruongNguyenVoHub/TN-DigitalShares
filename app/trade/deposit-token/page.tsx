'use client';

import { STOCK_TOKEN_ABI } from '@/utils/contract-abi';
import { useEffect, useState } from 'react';
import { parseUnits, type Hash } from 'viem';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function DepositTokenPage() {
  const { address, isConnected } = useAccount();
  const [amountToken, setAmountToken] = useState('');
  const [treasuryAddress, setTreasuryAddress] = useState<string>('');
  const [isLoadingTreasury, setIsLoadingTreasury] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [currentStep, setCurrentStep] = useState(1);

  // Hook để transfer token
  const { 
    data: transferHash, 
    writeContract: transfer, 
    isPending: isTransferring,
    error: transferError 
  } = useWriteContract();
  
  // Đợi transaction transfer confirm
  const { 
    isLoading: isConfirmingTransfer, 
    isSuccess: isTransferSuccess,
    data: transferReceipt 
  } = useWaitForTransactionReceipt({
    hash: transferHash,
  });

  // Lấy treasury address khi component mount
  useEffect(() => {
    fetchTreasuryAddress();
  }, []);

  // Tự động gọi API deposit sau khi transfer thành công
  useEffect(() => {
    if (isTransferSuccess && transferHash && address) {
      handleDepositToBackend(transferHash);
    }
  }, [isTransferSuccess, transferHash, address]);

  const fetchTreasuryAddress = async () => {
    setIsLoadingTreasury(true);
    try {
      // Giả sử có API để lấy treasury address
      // Hoặc hardcode địa chỉ admin
      const adminAddress = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0x5D0076ed6CfF3e9974FA81c6D1471DD155261Ca7';
      setTreasuryAddress(adminAddress);
    } catch (error) {
      console.error('Error fetching treasury address:', error);
      setMessage('Không thể lấy địa chỉ ví công ty');
      setMessageType('error');
    } finally {
      setIsLoadingTreasury(false);
    }
  };

  const handleTransfer = async () => {
    if (!address || !amountToken) {
      setMessage('Vui lòng nhập số lượng token');
      setMessageType('error');
      return;
    }

    const amount = parseFloat(amountToken);
    if (amount <= 0) {
      setMessage('Số lượng token phải lớn hơn 0');
      setMessageType('error');
      return;
    }

    if (!treasuryAddress) {
      setMessage('Chưa có địa chỉ ví công ty');
      setMessageType('error');
      return;
    }

    try {
      setCurrentStep(1);
      setMessage('Đang chuyển token lên blockchain...');
      setMessageType('info');

      // Gọi contract để transfer token
      transfer({
        address: CONTRACT_ADDRESS,
        abi: STOCK_TOKEN_ABI,
        functionName: 'transfer',
        args: [treasuryAddress as `0x${string}`, parseUnits(amountToken, 18)],
      });
    } catch (error) {
      console.error('Error transferring:', error);
      setMessage('Lỗi khi chuyển token');
      setMessageType('error');
      setCurrentStep(1);
    }
  };

  const handleDepositToBackend = async (txHash: Hash) => {
    if (!address) return;

    setCurrentStep(3);
    setIsProcessing(true);
    setMessage('Đang verify transaction và cộng tiền vào tài khoản...');
    setMessageType('info');

    try {
      const response = await fetch(`/api/user/${address}/deposit-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash: txHash,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Nạp token thành công! Số dư mới: ${data.data.newToken} token`);
        setMessageType('success');
        setAmountToken('');
        setCurrentStep(4);
      } else {
        setMessage(`❌ ${data.message}`);
        setMessageType('error');
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Error calling deposit API:', error);
      setMessage('❌ Lỗi khi gọi API deposit');
      setMessageType('error');
      setCurrentStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  // Hiển thị message khi transfer đang confirm
  useEffect(() => {
    if (isConfirmingTransfer) {
      setCurrentStep(2);
      setMessage('⏳ Đang đợi blockchain confirm... (15-30 giây)');
      setMessageType('info');
    }
  }, [isConfirmingTransfer]);

  // Hiển thị lỗi nếu transfer fail
  useEffect(() => {
    if (transferError) {
      setMessage(`❌ Lỗi: ${transferError.message}`);
      setMessageType('error');
      setCurrentStep(1);
    }
  }, [transferError]);

  if (!isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-800">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Vui lòng kết nối ví
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Bạn cần kết nối ví để nạp token
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-900">
      <div className="w-full max-w-2xl space-y-6 rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-800">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Nạp Token vào Sàn
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Địa chỉ: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-1 items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  currentStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`h-1 flex-1 ${
                    currentStep > step
                      ? 'bg-blue-600'
                      : 'bg-zinc-200 dark:bg-zinc-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="grid grid-cols-4 gap-2 text-xs text-center">
          <div>Transfer</div>
          <div>Confirm</div>
          <div>Verify</div>
          <div>Done</div>
        </div>

        {/* Treasury Address */}
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
            Địa chỉ Ví Công Ty (Treasury):
          </h3>
          <p className="mt-1 break-all font-mono text-xs text-blue-700 dark:text-blue-300">
            {isLoadingTreasury ? 'Đang tải...' : treasuryAddress || 'Không có'}
          </p>
          <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            ⚠️ Token sẽ được chuyển đến địa chỉ này
          </p>
        </div>

        {/* Input số lượng token */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Số lượng token muốn nạp
          </label>
          <input
            type="number"
            value={amountToken}
            onChange={(e) => setAmountToken(e.target.value)}
            placeholder="Nhập số lượng token"
            disabled={isTransferring || isConfirmingTransfer || isProcessing}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleTransfer}
          disabled={
            isTransferring ||
            isConfirmingTransfer ||
            isProcessing ||
            !amountToken ||
            !treasuryAddress
          }
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isTransferring
            ? 'Đang gửi giao dịch...'
            : isConfirmingTransfer
            ? 'Đang confirm...'
            : isProcessing
            ? 'Đang verify...'
            : 'Nạp Token'}
        </button>

        {/* Message */}
        {message && (
          <div
            className={`rounded-lg p-4 ${
              messageType === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : messageType === 'error'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}
          >
            <p className="text-sm">{message}</p>
            {transferHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${transferHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs underline"
              >
                Xem trên Etherscan →
              </a>
            )}
          </div>
        )}

        {/* Hướng dẫn */}
        <div className="rounded-lg border border-zinc-300 p-4 dark:border-zinc-600">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
            📝 Quy trình Nạp Token:
          </h3>
          <ol className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li><strong>Bước 1:</strong> Nhập số lượng token muốn nạp</li>
            <li><strong>Bước 2:</strong> Nhấn &quot;Nạp Token&quot; → Xác nhận trong MetaMask</li>
            <li><strong>Bước 3:</strong> Đợi blockchain confirm (~15-30 giây)</li>
            <li><strong>Bước 4:</strong> Hệ thống tự động verify và cộng tiền</li>
            <li><strong>Bước 5:</strong> Hoàn tất! Token đã vào tài khoản</li>
          </ol>
          
          <div className="mt-4 rounded bg-yellow-50 p-3 dark:bg-yellow-900/20">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Lưu ý:</strong> Bạn phải chuyển token đến đúng địa chỉ Ví Công Ty phía trên. 
              Nếu chuyển sai địa chỉ, token sẽ bị mất và không thể hoàn lại!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
