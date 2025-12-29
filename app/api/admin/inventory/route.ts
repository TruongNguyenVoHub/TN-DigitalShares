// app/api/admin/inventory/route.ts
import { inventoryLogRepository, stockInventoryRepository } from '@/repositories'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'TNT'

    // Get stock inventory
    const inventory = await stockInventoryRepository.findBySymbol(symbol)
    
    // Get inventory logs
    const logs = await inventoryLogRepository.findBySymbol(symbol, { take: 50 })

    // Get stock price from blockchain (use current price from DB for now)
    const currentPrice = inventory?.currentPrice || 0

    return NextResponse.json({
      success: true,
      status: 200,
      message: 'Inventory retrieved successfully',
      data: {
        inventory: inventory ? {
          symbol: inventory.symbol,
          realShares: inventory.realShares,
          mintedTokens: inventory.mintedTokens,
          currentPrice: inventory.currentPrice,
        } : null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logs: logs.map((log: any) => ({
          id: log.id,
          action: log.action,
          quantity: log.quantity,
          proofUrl: log.proofUrl,
          txHash: log.txHash,
          adminId: log.adminId,
          createdAt: log.createdAt,
        })),
        currentPrice,
      },
    })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { success: false, status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
