import { UserService } from "@/services/user.service";
import { NextRequest, NextResponse } from "next/server";

const userService = new UserService();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const { password, newWalletAddress, newPrivateKey } = await request.json();
    const { walletAddress } = await params;

    const result = await userService.changeWallet(walletAddress, password, newWalletAddress, newPrivateKey);
    return NextResponse.json(result, { status: result.status });

  } catch (error) {
    console.error('Change wallet error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  }
}
