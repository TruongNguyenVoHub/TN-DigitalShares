import { UserService } from '@/services/user.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('KYC Submit - Received body:', body);
    
    const { walletAddress, idCardNumber, idCardImageFront, idCardImageBack, selfieImage } = body;

    // Validate required fields
    if (!walletAddress || !idCardNumber || !idCardImageFront || !idCardImageBack || !selfieImage) {
      console.log('KYC Submit - Validation failed:', {
        walletAddress: !!walletAddress,
        idCardNumber: !!idCardNumber,
        idCardImageFront: !!idCardImageFront,
        idCardImageBack: !!idCardImageBack,
        selfieImage: !!selfieImage
      });
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: walletAddress, idCardNumber, idCardImageFront, idCardImageBack, selfieImage' 
        },
        { status: 400 }
      );
    }

    const userService = new UserService();
    const result = await userService.kycSubmit(
      walletAddress,
      idCardNumber,
      idCardImageFront,
      idCardImageBack,
      selfieImage
    );

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.message 
        },
        { status: result.status }
      );
    }

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error('KYC submission error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process KYC submission' 
      },
      { status: 500 }
    );
  }
}
