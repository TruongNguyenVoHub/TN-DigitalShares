import { verifyPassword } from '@/lib/auth-utils';
import { encryptPrivateKey, generateWallet } from '@/lib/crypto-utils';
import { userRepository } from '@/repositories';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, walletAddress } = body;

    // ===== Login by Username/Password =====
    if (username && password) {
      // Validation
      if (!username || !password) {
        return NextResponse.json(
          {
            success: false,
            status: 400,
            message: 'Username and password are required',
          },
          { status: 400 }
        );
      }

      // Find user by username
      const user = await userRepository.findByUsernameWithPassword(username);
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            status: 401,
            message: 'Invalid username or password',
          },
          { status: 401 }
        );
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.passwordHash || '');
      if (!isPasswordValid) {
        return NextResponse.json(
          {
            success: false,
            status: 401,
            message: 'Invalid username or password',
          },
          { status: 401 }
        );
      }

      // ===== Auto-generate wallet if missing =====
      let updatedUser = user;
      if (!user.walletAddress || user.walletAddress.trim() === '') {
        const generatedWallet = generateWallet();
        const privateKeyEnc = encryptPrivateKey(generatedWallet.privateKey);
        
        updatedUser = await userRepository.update(user.id, {
          walletAddress: generatedWallet.address,
          privateKeyEnc,
          walletType: 'MANAGED',
        });
      }

      // Login success
      return NextResponse.json({
        success: true,
        status: 200,
        message: 'Login successful',
        data: {
          userId: updatedUser.id,
          username: updatedUser.username,
          walletAddress: updatedUser.walletAddress,
          kycStatus: updatedUser.kycStatus,
          isWhitelisted: updatedUser.isWhitelisted,
          role: updatedUser.role,
        },
      });
    }

    // ===== Login by Wallet =====
    if (walletAddress) {
      if (!walletAddress) {
        return NextResponse.json(
          {
            success: false,
            status: 400,
            message: 'Wallet address is required',
          },
          { status: 400 }
        );
      }

      // Normalize wallet address to lowercase
      const normalizedWallet = walletAddress.toLowerCase();

      // Find existing user
      let user = await userRepository.findByWalletAddress(normalizedWallet);

      // If user doesn't exist, create new one
      if (!user) {
        user = await userRepository.create({
          walletAddress: normalizedWallet,
          fullName: '',
          kycStatus: 'PENDING',
          isWhitelisted: false,
          role: 'USER',
        });
      }

      return NextResponse.json({
        success: true,
        status: 200,
        message: 'Login successful',
        data: {
          userId: user.id,
          username: user.username || null,
          walletAddress: user.walletAddress,
          kycStatus: user.kycStatus,
          isWhitelisted: user.isWhitelisted,
          role: user.role,
        },
      });
    }

    // No credentials provided
    return NextResponse.json(
      {
        success: false,
        status: 400,
        message: 'Username/password or walletAddress is required',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
