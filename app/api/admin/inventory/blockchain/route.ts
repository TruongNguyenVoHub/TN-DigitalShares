// app/api/admin/inventory/blockchain/route.ts
import { stockTokenRepository } from '@/repositories'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}`
    
    if (!treasuryAddress) {
      return NextResponse.json(
        { success: false, status: 500, message: 'Treasury address not configured' },
        { status: 500 }
      )
    }

    // Fetch blockchain data
    const [totalSupply, treasuryBalance, currentPrice] = await Promise.all([
      stockTokenRepository.getTotalSupply(),
      stockTokenRepository.getBalanceOf(treasuryAddress),
      await stockTokenRepository.getLatestPrice() / BigInt(10 ** 7),
    ])

    const circulatingSupply = totalSupply - treasuryBalance

    return NextResponse.json({
      success: true,
      status: 200,
      message: 'Blockchain data retrieved successfully',
      data: {
        totalSupply,
        treasuryBalance,
        circulatingSupply,
        currentPrice: Number(currentPrice),
      },
    })
  } catch (error) {
    console.error('Error fetching blockchain data:', error)
    return NextResponse.json(
      { success: false, status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
