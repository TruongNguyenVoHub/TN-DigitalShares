import { prisma } from "@/lib/prisma";
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

type LoginResponse = ApiResponse<LoginData>;

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
        let user = await prisma.user.findUnique({
            where: { walletAddress },
        });
        // If user doesn't exist, create new one
        if (!user) {
            user = await prisma.user.create({
                data: {
                    walletAddress,
                    fullName: "",
                    kycStatus: "PENDING",
                    role: "USER",
                    isWhitelisted: false,
                },
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
}