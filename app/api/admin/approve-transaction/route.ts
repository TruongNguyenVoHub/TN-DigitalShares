import { transactionRepository, userRepository } from '@/repositories'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId, action } = body // action: 'approve' or 'reject'

    if (!transactionId || !action) {
      return NextResponse.json(
        { success: false, status: 400, message: 'Missing transactionId or action' },
        { status: 400 }
      )
    }

    // Find transaction with user info
    const transaction = await transactionRepository.findByIdWithUser(transactionId)
    if (!transaction) {
      return NextResponse.json(
        { success: false, status: 404, message: 'Transaction not found' },
        { status: 404 }
      )
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, status: 400, message: 'Transaction is not pending' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Update transaction status to SUCCESS
      await transactionRepository.updateStatus(transactionId, 'SUCCESS')

      // Update user balance based on transaction type
      const user = await userRepository.findById(transaction.userId)
      if (!user) {
        return NextResponse.json(
          { success: false, status: 404, message: 'User not found' },
          { status: 404 }
        )
      }
      
      if (transaction.type === 'DEPOSIT') {
        const newBalance = (user.vndBalance || 0) + transaction.amountVND
        await userRepository.updateBalance(user.id, newBalance)
      } else if (transaction.type === 'WITHDRAW') {
        // Check balance again before withdrawing
        if ((user.vndBalance || 0) < transaction.amountVND) {
          await transactionRepository.updateStatus(transactionId, 'FAILED')
          return NextResponse.json(
            { success: false, status: 400, message: 'Insufficient balance' },
            { status: 400 }
          )
        }
        const newBalance = (user.vndBalance || 0) - transaction.amountVND
        await userRepository.updateBalance(user.id, newBalance)
      }

      return NextResponse.json({
        success: true,
        status: 200,
        message: 'Transaction approved successfully',
        data: { transactionId, status: 'SUCCESS' },
      })
    } else if (action === 'reject') {
      // Update transaction status to FAILED
      await transactionRepository.updateStatus(transactionId, 'FAILED')

      return NextResponse.json({
        success: true,
        status: 200,
        message: 'Transaction rejected',
        data: { transactionId, status: 'FAILED' },
      })
    } else {
      return NextResponse.json(
        { success: false, status: 400, message: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error approving transaction:', error)
    return NextResponse.json(
      { success: false, status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
