import { TradeService } from "@/services/trade.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, amountToken } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 400 }
      );
    }

    if (!amountToken || amountToken <= 0) {
      return NextResponse.json(
        { error: "amountToken must be a positive number" },
        { status: 400 }
      );
    }

    const tradeService = new TradeService();
    const result = await tradeService.sellToken(walletAddress, amountToken);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status }
      );
    }
    return NextResponse.json(result, { status: result.status });

  } catch (error) {
    console.error("Error processing sell request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}