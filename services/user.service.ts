import { transactionRepository, userRepository } from "@/repositories";
interface BankInfo {
  bankName: string;
  accountNumber: string;
}

type ApiResponse<T = undefined> = {
    success: boolean;
    status: number;
    message: string;
    data?: T;
};

type LoginData = {
    userId: string;
    walletAddress: string;
    kycStatus: string;
    isWhitelisted: boolean;
    role: string;
};
type DepositData = {
    walletAddress: string;
    newBalance: number;
};
type WithdrawData ={
    walletAddress: string;
    remainingBalance: number;
}

type LoginResponse = ApiResponse<LoginData>;
type DepositResponse = ApiResponse<DepositData>;
type WithdrawResponse = ApiResponse<WithdrawData>;

export class UserService {
    async login(walletAddress: string): Promise<LoginResponse> {
        if(!walletAddress) {
            return {
                success: false,
                status: 400,
                message: "Wallet address is required",
            };
        }
        
        // Find existing user
        let user = await userRepository.findByWalletAddress(walletAddress);
        // If user doesn't exist, create new one
        if (!user) {
            user = await userRepository.create({
                walletAddress,
                fullName: "",
                kycStatus: "PENDING",
                isWhitelisted: false,
                role: "USER",
            });
        }
        return {
            success: true,
            status: 200,
            message: "Login successful",
            data: {
                userId: user.id,
                walletAddress: user.walletAddress,
                kycStatus: user.kycStatus,
                isWhitelisted: user.isWhitelisted,
                role: user.role,
            },
        };
    }

    async deposit(walletAddress: string, amount: number): Promise<DepositResponse> {
        if(!walletAddress || amount <= 0) {
            return {
                success: false,
                status: 400,
                message: "Invalid wallet address or amount",
            };
        }

        const user = await userRepository.findByWalletAddress(walletAddress);
        if (!user) {
            return {
                success: false,
                status: 404,
                message: "User not found",
            };
        }

        const newBalance = (user.vndBalance || 0) + amount;
        //insert bang transaction
        await transactionRepository.create({
            userId: user.id,
            type: "DEPOSIT",
            amountVND: amount,
            status: "SUCCESS",
        });
        //update balance
        await userRepository.updateBalance(user.id, newBalance);
        return {
            success: true,
            status: 200,
            message: "Deposit successful",
            data: {
                walletAddress,
                newBalance,
            },
        };
    }

    async withdraw(walletAddress: string, amount: number, BankInfo: BankInfo): Promise<WithdrawResponse> {
        if(!walletAddress || amount <= 0) {
            return {
                success: false,
                status: 400,
                message: "Invalid wallet address or amount",
            };
        }

        const user = await userRepository.findByWalletAddress(walletAddress);
        if (!user) {
            return {
                success: false,
                status: 404,
                message: "User not found",
            };
        }

        if ((user.vndBalance || 0) < amount) {
            return {
                success: false,
                status: 400,
                message: "Insufficient balance",
            };
        }

        const remainingBalance = (user.vndBalance || 0) - amount;
        //insert bang transaction
        await transactionRepository.create({
            userId: user.id,
            type: "WITHDRAW",
            amountVND: amount,
            status: "SUCCESS",
        });
        //update balance
        await userRepository.updateBalance(user.id, remainingBalance);
        return {
            success: true,
            status: 200,
            message: "Withdraw successful",
            data: {
                walletAddress,
                remainingBalance,
            },
        };
    }
}