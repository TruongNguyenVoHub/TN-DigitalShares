import { TransactionStatus } from "@/app/generated/prisma";
import { transactionRepository } from "@/repositories";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'deposit' | 'withdraw'
    const status = searchParams.get('status') as TransactionStatus | null; // 'PENDING' | 'SUCCESS' | 'FAILED'

    // Fetch token deposit transactions (DEPOSIT_TOKEN_ONCHAIN)
    const depositTransactions = await transactionRepository.findAll({
      where: {
        type: 'DEPOSIT_TOKEN_ONCHAIN',
        ...(status && { status })
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Fetch token withdraw transactions (WITHDRAW_TOKEN_ONCHAIN)
    const withdrawTransactions = await transactionRepository.findAll({
      where: {
        type: 'WITHDRAW_TOKEN_ONCHAIN',
        ...(status && { status })
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Filter by type if provided
    let deposits = depositTransactions;
    let withdraws = withdrawTransactions;

    if (type === 'deposit') {
      withdraws = [];
    } else if (type === 'withdraw') {
      deposits = [];
    }

    // Calculate stats
    const pendingWithdraws = withdrawTransactions.filter(w => w.status === 'PENDING');
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayDeposits = depositTransactions.filter(d => 
      d.status === 'SUCCESS' && new Date(d.createdAt) >= todayStart
    );
    const todayWithdraws = withdrawTransactions.filter(w => 
      w.status === 'SUCCESS' && new Date(w.createdAt) >= todayStart
    );

    const totalDepositToday = todayDeposits.reduce((sum, d) => sum + (d.amountToken || 0), 0);
    const totalWithdrawToday = todayWithdraws.reduce((sum, w) => sum + (w.amountToken || 0), 0);

    return NextResponse.json({
      success: true,
      status: 200,
      message: "Token gateway data retrieved successfully",
      data: {
        deposits,
        withdraws,
        stats: {
          pendingWithdrawCount: pendingWithdraws.length,
          totalDepositToday,
          totalWithdrawToday,
          depositCountToday: todayDeposits.length,
          withdrawCountToday: todayWithdraws.length
        }
      }
    });
  } catch (error) {
    console.error("Error fetching token gateway data:", error);
    return NextResponse.json({
      success: false,
      status: 500,
      message: "Failed to fetch token gateway data",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
