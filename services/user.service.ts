import { TransactionType } from "@/app/generated/prisma";
import { kycRequestRepository, stockTokenRepository, transactionRepository, TransferParams, userRepository, type SetWhitelistedParams } from "@/repositories";
interface BankInfo {
  bankName: string;
  accountNumber: string;
    accountName: string;
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

type TradeTokenData = {
    walletAddress: string;
    oldToken: number;
    newToken: number;
    txHash: string;
}

type UserProfileData ={
    walletAddress: string;
    username?: string;
    fullName: string;
    vndBalance: number;
    tokenBalance: number;
    kycStatus: string;
    isWhitelisted: boolean;
    role: string;
    walletType: string;
}
type UserTransactionData = {
    transactions: Array<{
        id: string;
        type: TransactionType; // hoặc string
        stockSymbol?: string; // Để biết giao dịch cổ phiếu nào (TSLA, AAPL...)
        stockPrice?: number; // Giá khớp lệnh tại thời điểm giao dịch
        amountVND: number; // Số tiền VND
        amountToken?: number; // Số lượng token (nếu có)
        status: string; // PENDING, SUCCESS, FAILED...
        txHash?: string; // Hash blockchain (cho DEPOSIT/WITHDRAW_TOKEN_ONCHAIN)
        refCode?: string; // Mã tham chiếu VNPay (cho DEPOSIT/WITHDRAW VND)
        createdAt: string; // Thời gian giao dịch
    }>;
}

type LoginResponse = ApiResponse<LoginData>;
type DepositResponse = ApiResponse<DepositData>;
type WithdrawResponse = ApiResponse<WithdrawData>;
type KYCResponse = ApiResponse<KYCData>;
type KYCDecisionResponse = ApiResponse<KYCDecisionData>;
type TradeTokenResponse = ApiResponse<TradeTokenData>;
type UserProfileResponse = ApiResponse<UserProfileData>;
type UserTransactionResponse = ApiResponse<UserTransactionData>;

export class UserService {
    async login(walletAddress: string): Promise<LoginResponse> {
        if(!walletAddress) {
            return {
                success: false,
                status: 400,
                message: "Wallet address is required",
            };
        }
        
        // Normalize wallet address to lowercase
        walletAddress = walletAddress.toLowerCase();
        
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
    async getUserProfile(walletAddress: string): Promise<UserProfileResponse> {
        if(!walletAddress) {
            return {
                success: false,
                status: 400,
                message: "Wallet address is required",
            };
        }

        // Normalize wallet address to lowercase
        walletAddress = walletAddress.toLowerCase();

        const user = await userRepository.findByWalletAddress(walletAddress);
        if (!user) {
            return {
                success: false,
                status: 404,
                message: "User not found",
            };
        }

        return {
            success: true,
            status: 200,
            message: "User profile retrieved successfully",
            data: {
                walletAddress: user.walletAddress,
                username: user.username || undefined,
                fullName: user.fullName,
                vndBalance: user.vndBalance || 0,
                tokenBalance: user.tokenBalance || 0,
                kycStatus: user.kycStatus,
                isWhitelisted: user.isWhitelisted,
                role: user.role,
                walletType: user.walletType || 'EXTERNAL',
            },
        };
    }
    async getUserTransactions(walletAddress: string): Promise<UserTransactionResponse> {
        if(!walletAddress) {
            return {
                success: false,
                status: 400,
                message: "Wallet address is required",
            };
        }

        // Normalize wallet address to lowercase
        walletAddress = walletAddress.toLowerCase();

        const user = await userRepository.findByWalletAddress(walletAddress);
        if (!user) {
            return {
                success: false,
                status: 404,
                message: "User not found",
            };
        }

        const transactions = await transactionRepository.findByUserId(user.id);

        return {
            success: true,
            status: 200,
            message: "User transactions retrieved successfully",
            data: {
                transactions: transactions.map(tx => ({
                    id: tx.id,
                    type: tx.type,
                    stockSymbol: tx.stockSymbol || undefined,
                    stockPrice: tx.stockPrice || undefined,
                    amountVND: tx.amountVND,
                    amountToken: tx.amountToken || undefined,
                    status: tx.status,
                    txHash: tx.txHash || undefined,
                    refCode: tx.refCode || undefined,
                    createdAt: tx.createdAt.toISOString(),
                })),
            },
        };
    }

    async depositVND(walletAddress: string, amount: number): Promise<DepositResponse> {
        if(!walletAddress || amount <= 0) {
            return {
                success: false,
                status: 400,
                message: "Invalid wallet address or amount",
            };
        }

        // Normalize wallet address to lowercase
        walletAddress = walletAddress.toLowerCase();

        const user = await userRepository.findByWalletAddress(walletAddress);
        if (!user) {
            return {
                success: false,
                status: 404,
                message: "User not found",
            };
        }

        // Create PENDING transaction, admin will approve later
        await transactionRepository.create({
            userId: user.id,
            type: "DEPOSIT",
            amountVND: amount,
            status: "PENDING",
        });
        
        return {
            success: true,
            status: 200,
            message: "Deposit request created, waiting for admin approval",
            data: {
                walletAddress,
                newBalance: user.vndBalance,
            },
        };
    }

    async withdrawVND(walletAddress: string, amount: number, bankInfo: BankInfo): Promise<WithdrawResponse> {
        if(!walletAddress || amount <= 0) {
            return {
                success: false,
                status: 400,
                message: "Invalid wallet address or amount",
            };
        }

        // Normalize wallet address to lowercase
        walletAddress = walletAddress.toLowerCase();

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

        // Persist latest bank info for this withdrawal request
        await userRepository.update(user.id, {
            bankName: bankInfo.bankName,
            bankAccount: bankInfo.accountNumber,
            bankAccountName: bankInfo.accountName,
        });

        // Create PENDING transaction, admin will approve later
        await transactionRepository.create({
            userId: user.id,
            type: "WITHDRAW",
            amountVND: amount,
            status: "PENDING",
        });
        
        return {
            success: true,
            status: 200,
            message: "Withdraw request created, waiting for admin approval",
            data: {
                walletAddress,
                remainingBalance: user.vndBalance,
            },
        };
    }

    async depositToken(walletAddress: string, txHash: string): Promise<TradeTokenResponse> {
        // Normalize wallet address to lowercase
        walletAddress = walletAddress.toLowerCase();
        
        // 1. Kiểm tra user tồn tại
        const user = await userRepository.findByWalletAddress(walletAddress);
        if (!user) {
            return {
                success: false,
                status: 404,
                message: "User not found",
            };
        }

        // 2. Check xem txHash này đã được dùng để nạp tiền chưa (Chống Replay Attack)
        const existingTx = await transactionRepository.findByTxHash(txHash);
        if (existingTx) {
            return {
                success: false,
                status: 400,
                message: "Transaction hash already used. Cannot deposit twice with same transaction.",
            };
        }

        // 3. Verify transaction trên blockchain
        try {
            const receipt = await stockTokenRepository.getTransactionReceipt(txHash as `0x${string}`);
            
            // 3.1. Check transaction status
            if (receipt.status !== 'success') {
                return {
                    success: false,
                    status: 400,
                    message: "Transaction failed on blockchain",
                };
            }

            // 3.2. Parse Transfer event logs
            const transferEvent = await stockTokenRepository.parseTransferEvent(receipt.logs);
            if (!transferEvent) {
                return {
                    success: false,
                    status: 400,
                    message: "No valid Transfer event found in transaction",
                };
            }

            // 3.3. Verify sender (from) - phải là ví của user đang đăng nhập
            if (transferEvent.from.toLowerCase() !== walletAddress.toLowerCase()) {
                return {
                    success: false,
                    status: 403,
                    message: "Transaction sender does not match your wallet address",
                };
            }

            // 3.4. Verify receiver (to) - phải là ví công ty (treasury)
            const treasuryAddress = await stockTokenRepository.getTreasuryAddress();
            if (transferEvent.to.toLowerCase() !== treasuryAddress.toLowerCase()) {
                return {
                    success: false,
                    status: 400,
                    message: "Transaction was not sent to company wallet",
                };
            }

            // 3.5. Lấy số lượng token từ event
            const amountToken = transferEvent.value;
            const oldToken = user.tokenBalance;

            // 4. Mọi thứ OK -> Cộng token vào balance
            user.tokenBalance += amountToken;
            await userRepository.update(user.id, user);

            // 5. Lưu giao dịch vào database
            await transactionRepository.create({
                userId: user.id,
                type: "DEPOSIT_TOKEN_ONCHAIN",
                amountToken: amountToken,
                amountVND: 0,
                txHash: txHash,
                status: "SUCCESS",
            });

            return {
                success: true,
                status: 200,
                message: "Token deposit successful",
                data: {
                    walletAddress,
                    oldToken,
                    newToken: user.tokenBalance,
                    txHash,
                },
            };
        } catch (error) {
            console.error("Error verifying transaction:", error);
            return {
                success: false,
                status: 500,
                message: "Failed to verify transaction on blockchain",
            };
        }
    }
    async withdrawToken(walletAddress: string, amountToken: number): Promise<TradeTokenResponse> {
        // Normalize wallet address to lowercase
        walletAddress = walletAddress.toLowerCase();
        
        //tim user theo wallet address
        const user = await userRepository.findByWalletAddress(walletAddress);
        if (!user) {
            return {
                success: false,
                status: 404,
                message: "User not found",
            };
        }
        const oldToken = user.tokenBalance;

        //goi blockchain de chuyen token den vi
        const transfer = await stockTokenRepository.transferAndWait(<TransferParams>{
            to: walletAddress,
            amount: amountToken,
        });
        //doi cho den khi giao dich duoc xac nhan
        const txHash = transfer;
        user.tokenBalance -= amountToken;
        await userRepository.update(user.id, user);

        //luu giao dich vao bang transaction
        await transactionRepository.create({
            userId: user.id,
            type: "WITHDRAW_TOKEN_ONCHAIN",
            stockPrice: 0,
            amountToken: amountToken,
            amountVND: 0,
            txHash: txHash,
            status: "SUCCESS",
        });

        return {
            success: true,
            status: 200,
            message: "Token withdraw successful",
            data: {
                walletAddress,
                oldToken: oldToken, 
                newToken: user.tokenBalance,
                txHash,
            },
        };
    }

    async kycSubmit(walletAddress: string, idCardNumber: string, idCardImageFront: string, idCardImageBack: string, selfieImage: string): Promise<KYCResponse> {
        // Normalize wallet address to lowercase
        walletAddress = walletAddress.toLowerCase();

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