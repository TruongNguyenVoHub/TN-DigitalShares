import { TransactionStatus } from "@/app/generated/prisma";
import { transactionRepository } from "@/repositories";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'deposit' | 'withdraw'
    const status = searchParams.get('status') as TransactionStatus | null; // 'PENDING' | 'SUCCESS' | 'FAILED'

    // Get today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch token deposit transactions (DEPOSIT_TOKEN_ONCHAIN)
    const depositTransactions = await transactionRepository.findAll({
      where: {
        type: 'DEPOSIT_TOKEN_ONCHAIN',
        ...(status && { status })
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Fetch token withdraw transactions (WITHDRAW_TOKEN_ONCHAIN)
    const withdrawTransactions = await transactionRepository.findAll({
      where: {
        type: 'WITHDRAW_TOKEN_ONCHAIN',
        ...(status && { status })
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Calculate user daily totals
    const calculateDailyTotal = (userId: string, transactionType: 'DEPOSIT_TOKEN_ONCHAIN' | 'WITHDRAW_TOKEN_ONCHAIN') => {
      const allTransactions = transactionType === 'DEPOSIT_TOKEN_ONCHAIN' ? depositTransactions : withdrawTransactions;
      const userTodayTransactions = allTransactions.filter(t => 
        t.userId === userId && 
        new Date(t.createdAt) >= todayStart &&
        new Date(t.createdAt) <= todayEnd &&
        (t.status === 'SUCCESS' || t.status === 'PENDING')
      );
      return userTodayTransactions.reduce((sum, t) => sum + (t.amountToken || 0), 0);
    };

    // Add daily totals to each transaction
    const depositsWithTotals = depositTransactions.map(d => ({
      ...d,
      userDailyTotal: calculateDailyTotal(d.userId, 'DEPOSIT_TOKEN_ONCHAIN')
    }));

    const withdrawsWithTotals = withdrawTransactions.map(w => ({
      ...w,
      userDailyTotal: calculateDailyTotal(w.userId, 'WITHDRAW_TOKEN_ONCHAIN')
    }));

    // Filter by type if provided
    let deposits = depositsWithTotals;
    let withdraws = withdrawsWithTotals;

    if (type === 'deposit') {
      withdraws = [];
    } else if (type === 'withdraw') {
      deposits = [];
    }

    // Calculate stats
    const pendingWithdraws = withdrawTransactions.filter(w => w.status === 'PENDING');

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
