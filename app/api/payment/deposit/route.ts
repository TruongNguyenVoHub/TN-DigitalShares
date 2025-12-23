// app/api/payment/deposit/route.ts
import { UserService } from "@/services/user.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, walletAddress } = body;

    if (!amount || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields: amount and walletAddress" },
        { status: 400 }
      );
    }

    const userService = new UserService();
    const result = await userService.deposit(walletAddress, amount);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status }
      );
    }

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process deposit", message: (error as Error).message },
      { status: 500 }
    );
  }
}
