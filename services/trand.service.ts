import { StockTokenRepository, transactionRepository, userRepository, type TransferParams } from "@/repositories";

type ApiResponse<T = undefined> = {
    success: boolean;
    status: number;
    message: string;
    data?: T;
};
type BuyTokenData = {
    walletAddress: string;
    txHash: string;
    userToken: number;
}
type BuyTokenResponse = ApiResponse<BuyTokenData>;

const stockTokenRepository = new StockTokenRepository();


export class TrandService {
    async buyToken(walletAddress: string, amountToken: number): Promise<BuyTokenResponse> {
        //lay gia token
        const tokenPrice = await stockTokenRepository.getLatestPrice() / BigInt(10 ** 7);

        console.log("Token price:", tokenPrice);

        //tinh tien can thanh toan
        const totalCost = amountToken * Number(tokenPrice);
        console.log("Total cost (VND):", totalCost);

        //tru tien truoc
        const user = await userRepository.findByWalletAddress(walletAddress);
        if (!user) {
            return {
                success: false,
                status: 404,
                message: "User not found",
            };
        }
        if( user.vndBalance < totalCost) {
            return {
                success: false,
                status: 400,
                message: "Insufficient VND balance",
            };
        }
        user.vndBalance -= totalCost;
        await userRepository.update(user.id, user);

        //tao transaction mua token
        const transaction = await transactionRepository.create({
            userId: user.id,
            type: "BUY_STOCK",
            stockPrice: Number(tokenPrice),
            amountToken: amountToken,
            amountVND: totalCost,
            status: "PENDING", //set trang thai ban dau la PENDING
        });
        //chuyen tien tren blockchain va lay ve txHash
        const transfer = await stockTokenRepository.transferAndWait(<TransferParams>{
            to: walletAddress,
            amount: amountToken,
        });
        //doi cho den khi giao dich duoc xac nhan
        const txHash = transfer;

        transactionRepository.updateStatus(transaction.id, "SUCCESS");
        transactionRepository.updateTxHash(transaction.id, txHash);

        user.tokenBalance += amountToken;
        await userRepository.update(user.id, user);

        return {
            success: true,
            status: 200,
            message: "Token purchase successful",
            data: {
                walletAddress,
                txHash,
                userToken: user.tokenBalance,
            },
        };
    }
}