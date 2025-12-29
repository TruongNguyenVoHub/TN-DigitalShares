import { inventoryLogRepository, stockInventoryRepository, stockTokenRepository, type BurnParams, type MintParams } from "@/repositories";
import dotenv from "dotenv";
dotenv.config();

type ApiResponse<T = undefined> = {
    success: boolean;
    status: number;
    message: string;
    data?: T;
};

type ImportStockData = {
    logId: string;
    txHash: string;
    newTotalSupply: number;
};

type ExportStockData = {
    logId: string;
    txHash: string;
    newTotalSupply: number;
};

type ImportStockResponse = ApiResponse<ImportStockData>;
type ExportStockResponse = ApiResponse<ExportStockData>;

export class InventoryService {
    async importStock(symbol: string, quantity: number, proofUrl: string, adminId: string): Promise<ImportStockResponse> {
        // 1. Tìm hoặc tạo StockInventory trước (vì InventoryLog reference tới nó)
        let stockInventory = await stockInventoryRepository.findBySymbol(symbol);
        if (!stockInventory) {
            stockInventory = await stockInventoryRepository.create({
                symbol,
                realShares: 0,
                mintedTokens: 0,
                currentPrice: 0,
            });
            console.log("Stock inventory created:", symbol);
        }

        // 2. Lưu vào bảng InventoryLog với proofUrl là link ảnh vừa up.
        const log = await inventoryLogRepository.create({
            symbol,
            quantity,
            proofUrl,
            adminId,
            action: "IMPORT",
        });
        console.log("Inventory log created:", log.id);

        // 3. Mint token trên blockchain và lấy về txHash 
        const addressAdmin = process.env.DEFAULT_ADMIN;
        const result = await stockTokenRepository.mintAndWait(<MintParams>{
            to: addressAdmin!,
            amount: quantity,
        });
        const txHash = result.hash;
        console.log("Stock token minted, txHash:", txHash);

        // 4. Cập nhật lại log với txHash
        await inventoryLogRepository.update(log.id, { txHash });
        console.log("Inventory log updated with txHash");

        // 5. Cập nhật lại stock inventory (tăng tổng supply)
        const newTotalSupply = stockInventory.realShares + quantity;
        await stockInventoryRepository.update(symbol, {
            realShares: newTotalSupply,
        });
        console.log("Stock inventory updated, new total supply:", newTotalSupply);

        // 6. Trả về response thành công
        return {
            success: true,
            status: 200,
            message: "Stock imported successfully",
            data: {
                logId: log.id,
                txHash,
                newTotalSupply,
            },
        };
    }
    
    async exportStock(symbol: string, quantity: number, proofUrl: string, adminId: string): Promise<ExportStockResponse> {
        // 1. Tìm StockInventory
        const stockInventory = await stockInventoryRepository.findBySymbol(symbol);
        if (!stockInventory) {
            return {
                success: false,
                status: 404,
                message: "Stock inventory not found",
            };
        }

        if (stockInventory.realShares < quantity) {
            return {
                success: false,
                status: 400,
                message: "Insufficient shares in inventory",
            };
        }

        // 2. Lưu vào bảng InventoryLog với proofUrl là link ảnh vừa up.
        const log = await inventoryLogRepository.create({
            symbol,
            quantity,
            proofUrl,
            adminId,
            action: "EXPORT",
        });
        console.log("Inventory log created:", log.id);

        // 3. Burn token trên blockchain và lấy về txHash 
        const addressAdmin = process.env.DEFAULT_ADMIN;
        const result = await stockTokenRepository.burnAndWait(<BurnParams>{
            from: addressAdmin!,
            amount: quantity,
        });
        const txHash = result.hash;
        console.log("Stock token burned, txHash:", txHash);

        // 4. Cập nhật lại log với txHash
        await inventoryLogRepository.update(log.id, { txHash });
        console.log("Inventory log updated with txHash");

        // 5. Cập nhật lại stock inventory (giảm tổng supply)
        const newTotalSupply = stockInventory.realShares - quantity;
        await stockInventoryRepository.update(symbol, {
            realShares: newTotalSupply,
        });
        console.log("Stock inventory updated, new total supply:", newTotalSupply);

        // 6. Trả về response thành công
        return {
            success: true,
            status: 200,
            message: "Stock exported successfully",
            data: {
                logId: log.id,
                txHash,
                newTotalSupply,
            },
        };
    }
}