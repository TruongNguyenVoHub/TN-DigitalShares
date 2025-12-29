import { TradeService } from "@/services/trade.service";
import { NextResponse } from "next/server";

export async function GET(
    request: Request) {
    try {
        const tradeService = new TradeService();
        const result = await tradeService.getAllTransactions();

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