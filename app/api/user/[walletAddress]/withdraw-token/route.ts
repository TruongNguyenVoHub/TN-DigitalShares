import { UserService } from "@/services/user.service";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ walletAddress: string }> }
) {
    try {
        const { walletAddress: address } = await params;

        const body = await request.json();
        const { amount } = body;

        if (!address) {
            return NextResponse.json(
                { error: "walletAddress is required" },
                { status: 400 }
            );
        }

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: "amount must be a positive number" },
                { status: 400 }
            );
        }

        const userService = new UserService();
        const result = await userService.withdrawToken(address, amount);

        if (!result.success) {
            return NextResponse.json(
                { error: result.message },
                { status: result.status }
            );
        }
        return NextResponse.json(result, { status: result.status });

    } catch (error) {
        console.error("Error processing deposit request:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}