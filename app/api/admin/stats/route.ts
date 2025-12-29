// app/api/admin/stats/route.ts
import { publicClient } from '@/lib/viem-client'
import { kycRequestRepository, stockInventoryRepository, transactionRepository, userRepository } from '@/repositories'
import { StockService } from '@/services/stock.service'
import { STOCK_TOKEN_ABI } from '@/utils/contract-abi'
import { NextResponse } from 'next/server'
import type { Abi } from 'viem'

// Treasury address stored in env (frontend uses NEXT_PUBLIC_TREASURY_ADDRESS)
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || process.env.TREASURY_ADDRESS || ''
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''

export async function GET() {
  try {
    // User stats
    const totalUsers = await userRepository.count()
    const pendingKyc = await kycRequestRepository.count({ status: 'PENDING' })
    const verifiedUsers = await userRepository.count({ kycStatus: 'VERIFIED' })

    // Transaction stats
    const pendingDeposits = await transactionRepository.count({
      type: 'DEPOSIT',
      status: 'PENDING',
    })
    const pendingWithdraws = await transactionRepository.count({
      type: 'WITHDRAW',
      status: 'PENDING',
    })

    // Get total VND liability (sum of all user balances)
    const users = await userRepository.findAll()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vndLiability = users.reduce((sum: number, user: any) => sum + (user.vndBalance || 0), 0)

    // Inventory / on-chain stats
    const inventory = await stockInventoryRepository.findBySymbol('TNT')
    // Try to fetch current price from StockService API (preferred)
    let currentPrice = inventory?.currentPrice || 0
    try {
      const priceResult = await new StockService().getStockPrice()
      if (priceResult.success && priceResult.data?.price != null) {
        // price may be BigInt/string depending on implementation
        currentPrice = Number(priceResult.data.price.toString())
      }
    } catch {
      // fallback to DB inventory currentPrice
    }

    // Simplify: treat "supply" as all tokens held in Treasury wallet (address in env)
    let totalSupply = inventory?.mintedTokens || 0
    let treasuryBalance = inventory?.realShares || 0

    if (CONTRACT_ADDRESS && TREASURY_ADDRESS) {
      try {
        // readContract returns a bigint representing raw token units (assume 18 decimals)
        const rawBalance = (await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: STOCK_TOKEN_ABI as Abi,
          functionName: 'balanceOf',
          args: [TREASURY_ADDRESS as `0x${string}`],
        })) as bigint

        const rawStr = rawBalance.toString() || '0'
        // convert from wei (18 decimals) to float token amount
        const tokenAmount = parseFloat(rawStr) / 1e18
        totalSupply = tokenAmount
        treasuryBalance = tokenAmount
      } catch (err) {
        // if on-chain read fails, fallback to DB inventory values
        console.error('Failed to read treasury balance on-chain, falling back to DB inventory', err)
      }
    }

    // Recent transactions
    const recentTransactions = await transactionRepository.findAll({
      take: 10,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      status: 200,
      message: 'Stats retrieved successfully',
      data: {
        stats: {
          totalUsers,
          pendingKyc,
          verifiedUsers,
          pendingDeposits,
          pendingWithdraws,
          vndLiability,
          // Simplified: supply is the treasury wallet balance
          totalSupply,
          treasuryBalance,
          currentPrice,
          treasuryVnd: (totalSupply || 0) * (currentPrice || 0),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recentTransactions: recentTransactions.map((tx: any) => ({
          id: tx.id,
          type: tx.type,
          amountVND: tx.amountVND,
          amountToken: tx.amountToken,
          status: tx.status,
          createdAt: tx.createdAt,
          user: tx.user ? {
            walletAddress: tx.user.walletAddress,
            fullName: tx.user.fullName,
          } : null,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { success: false, status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
