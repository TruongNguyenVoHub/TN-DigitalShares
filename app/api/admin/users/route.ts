// app/api/admin/users/route.ts
import { userRepository } from '@/repositories'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kycStatus = searchParams.get('kycStatus') // 'PENDING', 'VERIFIED', 'REJECTED' or null
    const search = searchParams.get('search') // search by wallet or name

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, prefer-const
    let where: any = {}
    
    if (kycStatus) {
      where.kycStatus = kycStatus
    }
    
    if (search) {
      where.OR = [
        { walletAddress: { contains: search.toLowerCase() } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const users = await userRepository.findAll({ where })
    const totalUsers = await userRepository.count()
    const pendingKyc = await userRepository.count({ kycStatus: 'PENDING' })
    const verifiedUsers = await userRepository.count({ kycStatus: 'VERIFIED' })

    return NextResponse.json({
      success: true,
      status: 200,
      message: 'Users retrieved successfully',
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        users: users.map((user: any) => ({
          id: user.id,
          walletAddress: user.walletAddress,
          fullName: user.fullName,
          vndBalance: user.vndBalance,
          tokenBalance: user.tokenBalance,
          kycStatus: user.kycStatus,
          isWhitelisted: user.isWhitelisted,
          role: user.role,
          createdAt: user.createdAt,
        })),
        stats: {
          totalUsers,
          pendingKyc,
          verifiedUsers,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
