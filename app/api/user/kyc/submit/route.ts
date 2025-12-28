import { UserService } from '@/services/user.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, idCardNumber, idCardImageFront, idCardImageBack, selfieImage } = body;

    // Validate required fields
    if (!walletAddress || !idCardNumber || !idCardImageFront || !idCardImageBack || !selfieImage) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, idCardNumber, idCardImageFront, idCardImageBack, selfieImage' },
        { status: 400 }
      );
    }

    const userService = new UserService();
    const reult = await userService.kycSubmit(
      walletAddress,
      idCardNumber,
      idCardImageFront,
      idCardImageBack,
      selfieImage
    );

    if (!reult.success) {
      return NextResponse.json(
        { error: reult.message },
        { status: reult.status }
      );
    }

    return NextResponse.json(reult, { status: reult.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process KYC submission' },
      { status: 500 }
    );
  }
}
