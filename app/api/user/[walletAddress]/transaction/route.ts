// app/api/user/[walletAddress]/transaction/route.ts
import { UserService } from "@/services/user.service";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ walletAddress: string }> }
) {
    try {
        const { walletAddress: address } = await params;

        if (!address) {
            return NextResponse.json(
                { error: "walletAddress is required" },
                { status: 400 }
            );
        }
        const userService = new UserService();
        const result = await userService.getUserTransactions(address);

        if (!result.success) {
            return NextResponse.json(
                { error: result.message },
                { status: result.status }
            );
        }
        return NextResponse.json(result, { status: result.status });
    } catch (error) {
        console.error("Error fetching user transactions:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}