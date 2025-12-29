import { InventoryService } from "@/services/inventory.service";
import { NextRequest, NextResponse } from "next/server";

type ExportRequestBody = {
    symbol: string;      // Mã cổ phiếu (VD: "TNT")
    quantity: number;    // Số lượng phát hành
    proofUrl: string;    // Bằng chứng pháp lý
    adminId: string;     // ID admin thực hiện
};

export async function POST(request: NextRequest) {
    try {
        const { symbol, quantity, proofUrl, adminId }: ExportRequestBody = await request.json();
        const inventoryService = new InventoryService();
        const result = await inventoryService.exportStock(symbol, quantity, proofUrl, adminId);
        return NextResponse.json(result, { status: result.status });
    } catch (error) {
        console.error("Inventory export error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}