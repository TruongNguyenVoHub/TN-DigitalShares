import { verifyPassword } from '@/lib/auth-utils';
import { encryptPrivateKey, isValidPrivateKey } from '@/lib/crypto-utils';
import { UpdateUserInput, userRepository } from '@/repositories';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const { password, newWalletAddress, newPrivateKey } = await request.json();
    const { walletAddress } = await params;

    // Validate input
    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập mật khẩu để xác thực' },
        { status: 400 }
      );
    }

    if (!newWalletAddress) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập địa chỉ ví mới' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await userRepository.findByWalletAddress(walletAddress.toLowerCase());
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy user' },
        { status: 404 }
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

    // Check if new wallet address already exists
    const existingUser = await userRepository.findByWalletAddress(newWalletAddress.toLowerCase());
    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Địa chỉ ví này đã được sử dụng bởi user khác' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: {
      walletAddress: string;
      privateKeyEnc?: string | null;
      walletType?: string;
    } = {
      walletAddress: newWalletAddress.toLowerCase()
    };

    // If private key provided, encrypt and store (MANAGED wallet)
    if (newPrivateKey) {
      if (!isValidPrivateKey(newPrivateKey)) {
        return NextResponse.json(
          { success: false, message: 'Private key không hợp lệ' },
          { status: 400 }
        );
      }
      
      updateData.privateKeyEnc = encryptPrivateKey(newPrivateKey);
      updateData.walletType = 'MANAGED';
    } else {
      // No private key = EXTERNAL wallet (MetaMask)
      updateData.privateKeyEnc = undefined;
      updateData.walletType = 'EXTERNAL';
    }

    // Update user
    const updatedUser = await userRepository.update(user.id, updateData as UpdateUserInput);

    return NextResponse.json({
      success: true,
      message: 'Cập nhật ví thành công',
      data: {
        walletAddress: updatedUser.walletAddress,
        walletType: updatedUser.walletType
      }
    });

  } catch (error) {
    console.error('Change wallet error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  }
}
