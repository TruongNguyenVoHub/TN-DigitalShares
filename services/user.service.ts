import { kycRequestRepository, stockTokenRepository, transactionRepository, userRepository, type SetWhitelistedParams } from "@/repositories";
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
type KYCData = {
    walletAddress: string;
    idCardNumber: string;
    idCardImageFront: string;
    idCardImageBack: string;
    selfieImage: string;
    status: string;
}
type KYCDecisionData = {
    requestId: string;
    decision: 'APPROVED' | 'REJECTED';
    reason?: string;
};

type LoginResponse = ApiResponse<LoginData>;
type DepositResponse = ApiResponse<DepositData>;
type WithdrawResponse = ApiResponse<WithdrawData>;
type KYCResponse = ApiResponse<KYCData>;
type KYCDecisionResponse = ApiResponse<KYCDecisionData>;

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

    async kycSubmit(walletAddress: string, idCardNumber: string, idCardImageFront: string, idCardImageBack: string, selfieImage: string): Promise<KYCResponse> {

        //tim user theo wallet address
        const user = await userRepository.findByWalletAddress(walletAddress);
        if (!user) {
            return {
                success: false,
                status: 404,
                message: "User not found",
            };
        }
        //tao yeu cau kyc moi
        await kycRequestRepository.create({
            userId: user.id,
            idCardNumber,
            idCardImageFront,
            idCardImageBack,
            selfieImage,
            status: "PENDING",
        });
        return {
            success: true,
            status: 200,
            message: "KYC submission successful",
            data: {
                walletAddress: user.walletAddress,
                idCardNumber,
                idCardImageFront,
                idCardImageBack,
                selfieImage,
                status: "PENDING",
            },
        };
    }

    async kycDecision(requestId: string, decision: 'APPROVED' | 'REJECTED',extractedName: string , reason?: string): Promise<KYCDecisionResponse> {
        //tim yeu cau kyc theo requestId
        const kycRequest = await kycRequestRepository.findById(requestId);
        if (!kycRequest) {
            return {
                success: false,
                status: 404,
                message: "KYC request not found",
            };
        }
        // console.log("doan 1");
        //cap nhat trang thai yeu cau kyc
        await kycRequestRepository.update(kycRequest.id, {
            status: decision,
            adminNote: reason,
        });
        console.log("doan 2");
        //cap nhat trang thai kyc cua user
        await userRepository.update(
            kycRequest.userId,
            {
                kycStatus: decision === 'APPROVED' ? 'VERIFIED' : 'REJECTED',
                fullName: extractedName,
            });
        console.log("doan 3");
        //them vao whitelist tren blockchain neu duoc phe duyet
        if (decision === 'APPROVED') {
            //tim user de lay dia chi vi
            const user = await userRepository.findById(kycRequest.userId);
            if (!user) {
                return {
                    success: false,
                    status: 404,
                    message: "User not found",
                };
            }
            await stockTokenRepository.setWhitelisted(<SetWhitelistedParams>{
                account: user.walletAddress,
                status: true,
            });
        }
        //them vao whitelist tren he thong
        await userRepository.update(
            kycRequest.userId,
            {
                isWhitelisted: decision === 'APPROVED' ? true : false,
            });
        return {
            success: true,
            status: 200,
            message: `KYC request ${requestId} has been ${decision}`,
            data: {
                requestId,
                decision,
                reason,
            },
        };
    }
}