import { UserService } from "@/services/user.service";
import { NextRequest, NextResponse } from "next/server";

interface BankInfo {
  bankName: string;
  accountNumber: string;
}

interface WithdrawRequest {
    walletAddress: string;
    amount: number;
    bankInfo: BankInfo;
}

export async function POST(request: NextRequest) {
    try {
    const body: WithdrawRequest = await request.json();
    const { amount, bankInfo, walletAddress } = body;

    // Validate required fields
    if (!amount || !bankInfo) {
        return NextResponse.json(
            { error: "Amount and bankInfo are required" },
            { status: 400 }
        );
    }

    if (!bankInfo.bankName || !bankInfo.accountNumber) {
        return NextResponse.json(
            { error: "Bank name and account number are required" },
            { status: 400 }
        );
    }

    if (amount <= 0) {
        return NextResponse.json(
            { error: "Amount must be greater than 0" },
            { status: 400 }
        );
    }
    const userService = new UserService();
    const result = await userService.withdrawVND(walletAddress, amount, bankInfo);

    if (!result.success) {
        return NextResponse.json(
            { error: result.message },
            { status: result.status }
        );
    }
    

    return NextResponse.json(result, { status: result.status });
    } catch (error) {
        console.error("Withdrawal error:", error);
        return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
        );
    }
}
