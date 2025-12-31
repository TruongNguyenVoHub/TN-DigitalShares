import { hashPassword } from '@/lib/auth-utils';
import { encryptPrivateKey, generateWallet } from '@/lib/crypto-utils';
import { userRepository } from '@/repositories';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password, walletAddress: providedWallet, privateKey: providedPrivateKey } = await request.json();

    // ===== Validation =====
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

    // Validate username
    if (username.length < 3) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: 'Username must be at least 3 characters',
        },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: 'Password must be at least 8 characters',
        },
        { status: 400 }
      );
    }

    // ===== Check Duplicates =====
    const usernameExists = await userRepository.existsByUsername(username);
    if (usernameExists) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: 'Username already exists',
        },
        { status: 400 }
      );
    }

    // ===== Generate or Use Provided Wallet =====
    let walletAddress: string;
    let privateKey: string | undefined;
    let walletType = 'EXTERNAL'; // Default là external (MetaMask)
    
    if (providedWallet) {
      // User cung cấp wallet address (từ MetaMask)
      walletAddress = providedWallet.toLowerCase();
      
      // Check if wallet already exists
      const walletExists = await userRepository.existsByWalletAddress(walletAddress);
      if (walletExists) {
        return NextResponse.json(
          {
            success: false,
            status: 400,
            message: 'Wallet address already registered',
          },
          { status: 400 }
        );
      }
      
      if (providedPrivateKey) {
        // User cung cấp cả private key (ví managed)
        privateKey = providedPrivateKey;
        walletType = 'MANAGED';
      }
    } else {
      // Tự động generate wallet cho user
      const generatedWallet = generateWallet();
      walletAddress = generatedWallet.address;
      privateKey = generatedWallet.privateKey;
      walletType = 'MANAGED';
    }

    // ===== Hash Password =====
    const passwordHash = await hashPassword(password);

    // ===== Encrypt Private Key (nếu có) =====
    let privateKeyEnc: string | undefined;
    
    if (privateKey) {
      privateKeyEnc = encryptPrivateKey(privateKey);
    }

    // ===== Create User =====
    const user = await userRepository.create({
      username: username.toLowerCase(),
      passwordHash,
      walletAddress: walletAddress,
      privateKeyEnc,
      walletType,
      fullName: '',
      kycStatus: 'PENDING',
      isWhitelisted: false,
      role: 'USER',
    });

    return NextResponse.json(
      {
        success: true,
        status: 201,
        message: 'Registration successful',
        data: {
          userId: user.id,
          username: user.username,
          walletAddress: user.walletAddress,
          kycStatus: user.kycStatus,
          isWhitelisted: user.isWhitelisted,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
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
