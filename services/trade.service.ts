import { StockTokenRepository, transactionRepository, userRepository } from "@/repositories";

type ApiResponse<T = undefined> = {
    success: boolean;
    status: number;
    message: string;
    data?: T;
};
type TradeTokenData = {
    walletAddress: string;
    userToken: number;
}
type TradeTokenResponse = ApiResponse<TradeTokenData>;

const stockTokenRepository = new StockTokenRepository();


export class TrandService {
    async buyToken(walletAddress: string, amountToken: number): Promise<TradeTokenResponse> {
        // Normalize wallet address to lowercase
        walletAddress = walletAddress.toLowerCase();
        
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
        // //chuyen tien tren blockchain va lay ve txHash
        // const transfer = await stockTokenRepository.transferAndWait(<TransferParams>{
        //     to: walletAddress,
        //     amount: amountToken,
        // });
        // //doi cho den khi giao dich duoc xac nhan
        // const txHash = transfer;

        transactionRepository.updateStatus(transaction.id, "SUCCESS");
        // transactionRepository.updateTxHash(transaction.id, txHash);

        user.tokenBalance += amountToken;
        await userRepository.update(user.id, user);

        return {
            success: true,
            status: 200,
            message: "Token purchase successful",
            data: {
                walletAddress,
                userToken: user.tokenBalance,
            },
        };
    }

    async sellToken(walletAddress: string, amountToken: number): Promise<TradeTokenResponse> {
        // Normalize wallet address to lowercase
        walletAddress = walletAddress.toLowerCase();
        
        //lay gia token
        const tokenPrice = await stockTokenRepository.getLatestPrice() / BigInt(10 ** 7);

        console.log("Token price:", tokenPrice);

        //tinh tien can thanh toan
        const totalProceeds = amountToken * Number(tokenPrice);
        console.log("Total proceeds (VND):", totalProceeds);

        //kiem tra so token cua user
        const user = await userRepository.findByWalletAddress(walletAddress);
        if (!user) {
            return {
                success: false,
                status: 404,
                message: "User not found",
            };
        }
        if( user.tokenBalance < amountToken) {
            return {
                success: false,
                status: 400,
                message: "Insufficient token balance",
            };
        }

        // //kiểm tra allowance trước khi bán
        // const treasuryAddress = await stockTokenRepository.getTreasuryAddress();
        // const allowance = await stockTokenRepository.getAllowance(walletAddress as `0x${string}`, treasuryAddress);
        
        // if (allowance < amountToken) {
        //     return {
        //         success: false,
        //         status: 403,
        //         message: `Insufficient allowance. You need to approve ${amountToken} tokens but only approved ${allowance} tokens. Please approve tokens first.`,
        //     };
        // }

        user.tokenBalance -= amountToken;
        await userRepository.update(user.id, user);

        //tao transaction ban token
        const transaction = await transactionRepository.create({
            userId: user.id,
            type: "SELL_STOCK",
            stockPrice: Number(tokenPrice),
            amountToken: amountToken,
            amountVND: totalProceeds,
            status: "PENDING", //set trang thai ban dau la PENDING
        });
        // //chuyen token từ user về cho admin va lay ve txHash 
        // const transfer = await stockTokenRepository.transferFrom(<TransferFromParams>{
        //     from: walletAddress,
        //     to: treasuryAddress,
        //     amount: amountToken,
        // });
        // //doi cho den khi giao dich duoc xac nhan
        // const txHash = transfer;

        transactionRepository.updateStatus(transaction.id, "SUCCESS");
        // transactionRepository.updateTxHash(transaction.id, txHash);

        user.vndBalance += totalProceeds;
        await userRepository.update(user.id, user);

        return {
            success: true,
            status: 200,
            message: "Token sale successful",
            data: {
                walletAddress,
                userToken: user.tokenBalance,
            },
        };
    }
}