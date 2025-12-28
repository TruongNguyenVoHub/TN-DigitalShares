import { UserService } from "@/services/user.service";
import { NextRequest, NextResponse } from "next/server";

const userService = new UserService();

/**
 * API Deposit Token - Nạp token từ ví vào hệ thống
 * POST /api/user/[walletAddress]/deposit-token
 * 
 * Flow:
 * 1. User chuyển token từ ví -> Company Wallet (Treasury) trên blockchain
 * 2. User gửi txHash lên API này
 * 3. Backend verify transaction trên blockchain
 * 4. Nếu hợp lệ -> Cộng token vào database balance
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ walletAddress: string }> }
) {
    try {
        const { walletAddress } = await params;
        const body = await request.json();
        const { txHash } = body;

        // Validation
        if (!walletAddress) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Wallet address is required",
                },
                { status: 400 }
            );
        }

        if (!txHash) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Transaction hash is required",
                },
                { status: 400 }
            );
        }

        // Verify và process deposit
        const result = await userService.depositToken(walletAddress, txHash);

        return NextResponse.json(result, { status: result.status });
    } catch (error) {
        console.error("Error processing deposit token request:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
