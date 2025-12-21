// app/api/auth/user-login/route.ts
import { UserService } from "@/services/user.service";
import { NextRequest, NextResponse } from "next/server";



const userService = new UserService();
export async function POST(request: NextRequest) {
    try {
        const { walletAddress } = await request.json();
        const result = await userService.login(walletAddress);
        return NextResponse.json(result, { status: result.status });
    } catch (error) {
        console.error("User login error:", error);
        return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
        );
    }
}
