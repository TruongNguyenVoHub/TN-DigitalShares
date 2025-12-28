import { StockTokenRepository } from "@/repositories";
type ApiResponse<T = undefined> = {
    success: boolean;
    status: number;
    message: string;
    data?: T;
};
type StockPriceData = {
    price: bigint;
};

type StockPriceResponse = ApiResponse<StockPriceData>;


const stockTokenRepository = new StockTokenRepository();

export class StockService {
    async getStockPrice(): Promise<StockPriceResponse> {
        //goi stocktotken repository de lay gia
        const price = await stockTokenRepository.getLatestPrice();
        return {
            success: true,
            status: 200,
            message: "Stock price fetched successfully",
            data: { price: price / BigInt(10 ** 7) },
        };
    }
}