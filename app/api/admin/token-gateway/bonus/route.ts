import { prisma } from "@/lib/prisma";
import { userRepository } from "@/repositories";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, amountToken, note } = await request.json();

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { success: false, status: 400, message: "walletAddress is required" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(amountToken) || amountToken <= 0) {
      return NextResponse.json(
        { success: false, status: 400, message: "amountToken must be a positive number" },
        { status: 400 },
      );
    }

    const normalizedWallet = walletAddress.toLowerCase();
    const user = await userRepository.findByWalletAddress(normalizedWallet);

    if (!user) {
      return NextResponse.json(
        { success: false, status: 404, message: "User not found" },
        { status: 404 },
      );
    }

    const [updatedUser, bonusTransaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          tokenBalance: {
            increment: amountToken,
          },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: "BONUS_TOKEN" as unknown as import("@/app/generated/prisma").TransactionType,
          amountVND: 0,
          amountToken,
          status: "SUCCESS",
          stockSymbol: "BONUS",
          refCode: note ?? null,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      status: 200,
      message: "Bonus token granted successfully",
      data: {
        transactionId: bonusTransaction.id,
        walletAddress: normalizedWallet,
        tokenBalance: updatedUser.tokenBalance,
      },
    });
  } catch (error) {
    console.error("Error granting bonus token:", error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
