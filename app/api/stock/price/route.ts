import { StockService } from "@/services/stock.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await new StockService().getStockPrice();
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status }
      );
    }

    // Convert BigInt to string for JSON serialization
    const responseData = {
      ...result,
      data: result.data ? {
        ...result.data,
        price: result.data.price.toString()
      } : undefined
    };

    return NextResponse.json(responseData, { status: result.status });
  } catch (error) {
    console.error("Error fetching stock price:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock price" },
      { status: 500 }
    );
  }
}
