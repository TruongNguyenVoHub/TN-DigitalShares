// app/api/admin/transactions/route.ts
import { transactionRepository } from '@/repositories'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // DEPOSIT, WITHDRAW, BUY_STOCK, etc.
    const status = searchParams.get('status') // PENDING, SUCCESS, FAILED

    // eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
    let where: any = {}
    
    if (type) {
      where.type = type
    }
    
    if (status) {
      where.status = status
    }

    const transactions = await transactionRepository.findAll({
      where,
      take: 100,
      orderBy: { createdAt: 'desc' },
    })

    // Count pending transactions
    const pendingDeposits = await transactionRepository.count({ type: 'DEPOSIT', status: 'PENDING' })
    const pendingWithdraws = await transactionRepository.count({ type: 'WITHDRAW', status: 'PENDING' })
    const pendingTokenDeposits = await transactionRepository.count({ type: 'DEPOSIT_TOKEN_ONCHAIN', status: 'PENDING' })
    const pendingTokenWithdraws = await transactionRepository.count({ type: 'WITHDRAW_TOKEN_ONCHAIN', status: 'PENDING' })

    return NextResponse.json({
      success: true,
      status: 200,
      message: 'Transactions retrieved successfully',
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transactions: transactions.map((tx: any) => ({
          id: tx.id,
          userId: tx.userId,
          walletAddress: tx.user?.walletAddress || '',
          fullName: tx.user?.fullName || '',
          type: tx.type,
          amountVND: tx.amountVND,
          amountToken: tx.amountToken,
          stockSymbol: tx.stockSymbol,
          stockPrice: tx.stockPrice,
          status: tx.status,
          txHash: tx.txHash,
          refCode: tx.refCode,
          bankInfo: tx.user
            ? {
                bankName: tx.user.bankName || undefined,
                accountNumber: tx.user.bankAccount || undefined,
                accountName: tx.user.bankAccountName || undefined,
              }
            : undefined,
          createdAt: tx.createdAt,
        })),
        stats: {
          pendingDeposits,
          pendingWithdraws,
          pendingTokenDeposits,
          pendingTokenWithdraws,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
