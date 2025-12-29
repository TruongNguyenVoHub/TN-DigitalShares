// app/api/admin/kyc/list/route.ts
import { kycRequestRepository } from '@/repositories'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'PENDING', 'APPROVED', 'REJECTED' or null for all

    const where = status ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' } : undefined

    const kycRequests = await kycRequestRepository.findAll({ where })

    return NextResponse.json({
      success: true,
      status: 200,
      message: 'KYC requests retrieved successfully',
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requests: kycRequests.map((req: any) => ({
          id: req.id,
          userId: req.userId,
          walletAddress: req.user?.walletAddress || '',
          fullName: req.user?.fullName || '',
          idCardNumber: req.idCardNumber,
          idCardImageFront: req.idCardImageFront,
          idCardImageBack: req.idCardImageBack,
          selfieImage: req.selfieImage,
          status: req.status,
          adminNote: req.adminNote,
          createdAt: req.createdAt,
          updatedAt: req.updatedAt,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching KYC requests:', error)
    return NextResponse.json(
      { success: false, status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
