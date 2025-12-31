import { verifyPassword } from '@/lib/auth-utils';
import { decryptPrivateKey } from '@/lib/crypto-utils';
import { userRepository } from '@/repositories';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const { password } = await request.json();
    const { walletAddress } = await params;

    // Validate input
    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập mật khẩu để xác thực' },
        { status: 400 }
      );
    }

    // Get user with password hash
    const user = await userRepository.findByWalletAddress(walletAddress.toLowerCase());
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy user' },
        { status: 404 }
      );
    }

    // Check if user has managed wallet
    if (user.walletType !== 'MANAGED') {
      return NextResponse.json(
        { success: false, message: 'Ví này không được quản lý bởi hệ thống. Vui lòng kiểm tra MetaMask của bạn.' },
        { status: 400 }
      );
    }

    // Verify password
    if (!user.passwordHash) {
      return NextResponse.json(
        { success: false, message: 'User chưa thiết lập mật khẩu' },
        { status: 400 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Check if private key exists
    if (!user.privateKeyEnc) {
      return NextResponse.json(
        { success: false, message: 'Private key không tồn tại' },
        { status: 404 }
      );
    }

    // Decrypt private key
    try {
      const privateKey = decryptPrivateKey(user.privateKeyEnc);
      
      return NextResponse.json({
        success: true,
        data: {
          privateKey,
          walletAddress: user.walletAddress,
          warning: 'Vui lòng không chia sẻ private key với bất kỳ ai. Hệ thống không bao giờ yêu cầu private key của bạn.'
        }
      });
    } catch (decryptError) {
      console.error('Failed to decrypt private key:', decryptError);
      return NextResponse.json(
        { success: false, message: 'Không thể giải mã private key' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('View private key error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  }
}
