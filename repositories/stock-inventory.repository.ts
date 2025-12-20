import { Prisma, StockInventory } from '@/app/generated/prisma'
import { prisma } from '@/lib/primas'

// ==================== Types ====================

export type CreateStockInventoryInput = {
  symbol: string
  realShares?: number
  mintedTokens?: number
  currentPrice?: number
}

export type UpdateStockInventoryInput = Partial<Omit<CreateStockInventoryInput, 'symbol'>>

// ==================== Repository ====================

export const stockInventoryRepository = {
  /**
   * Tạo stock inventory mới
   */
  async create(data: CreateStockInventoryInput): Promise<StockInventory> {
    return prisma.stockInventory.create({
      data: {
        symbol: data.symbol,
        realShares: data.realShares ?? 0,
        mintedTokens: data.mintedTokens ?? 0,
        currentPrice: data.currentPrice ?? 0,
      },
    })
  },

  /**
   * Tìm stock theo symbol
   */
  async findBySymbol(symbol: string): Promise<StockInventory | null> {
    return prisma.stockInventory.findUnique({
      where: { symbol },
    })
  },

  /**
   * Tìm stock theo symbol kèm logs
   */
  async findBySymbolWithLogs(symbol: string): Promise<StockInventory | null> {
    return prisma.stockInventory.findUnique({
      where: { symbol },
      include: {
        inventoryLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  },

  /**
   * Lấy danh sách tất cả stocks
   */
  async findAll(options?: {
    skip?: number
    take?: number
    orderBy?: Prisma.StockInventoryOrderByWithRelationInput
  }): Promise<StockInventory[]> {
    return prisma.stockInventory.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy ?? { symbol: 'asc' },
    })
  },

  /**
   * Đếm số lượng stocks
   */
  async count(): Promise<number> {
    return prisma.stockInventory.count()
  },

  /**
   * Cập nhật thông tin stock
   */
  async update(symbol: string, data: UpdateStockInventoryInput): Promise<StockInventory> {
    return prisma.stockInventory.update({
      where: { symbol },
      data,
    })
  },

  /**
   * Xóa stock
   */
  async delete(symbol: string): Promise<StockInventory> {
    return prisma.stockInventory.delete({
      where: { symbol },
    })
  },

  /**
   * Cập nhật giá hiện tại
   */
  async updatePrice(symbol: string, currentPrice: number): Promise<StockInventory> {
    return prisma.stockInventory.update({
      where: { symbol },
      data: { currentPrice },
    })
  },

  /**
   * Tăng số lượng cổ phiếu thật (khi IMPORT)
   */
  async incrementRealShares(symbol: string, quantity: number): Promise<StockInventory> {
    return prisma.stockInventory.update({
      where: { symbol },
      data: {
        realShares: { increment: quantity },
      },
    })
  },

  /**
   * Giảm số lượng cổ phiếu thật (khi EXPORT)
   */
  async decrementRealShares(symbol: string, quantity: number): Promise<StockInventory> {
    return prisma.stockInventory.update({
      where: { symbol },
      data: {
        realShares: { decrement: quantity },
      },
    })
  },

  /**
   * Tăng số lượng Token đã mint
   */
  async incrementMintedTokens(symbol: string, quantity: number): Promise<StockInventory> {
    return prisma.stockInventory.update({
      where: { symbol },
      data: {
        mintedTokens: { increment: quantity },
      },
    })
  },

  /**
   * Giảm số lượng Token (khi burn)
   */
  async decrementMintedTokens(symbol: string, quantity: number): Promise<StockInventory> {
    return prisma.stockInventory.update({
      where: { symbol },
      data: {
        mintedTokens: { decrement: quantity },
      },
    })
  },

  /**
   * Kiểm tra Proof of Reserve (so sánh cổ thật vs token đã mint)
   */
  async checkProofOfReserve(symbol: string): Promise<{
    symbol: string
    realShares: number
    mintedTokens: number
    isValid: boolean
    difference: number
  } | null> {
    const stock = await prisma.stockInventory.findUnique({
      where: { symbol },
    })

    if (!stock) return null

    return {
      symbol: stock.symbol,
      realShares: stock.realShares,
      mintedTokens: stock.mintedTokens,
      isValid: stock.realShares >= stock.mintedTokens,
      difference: stock.realShares - stock.mintedTokens,
    }
  },

  /**
   * Lấy danh sách stocks có vấn đề về PoR (mint > real)
   */
  async findInvalidPoR(): Promise<StockInventory[]> {
    return prisma.stockInventory.findMany({
      where: {
        mintedTokens: {
          gt: prisma.stockInventory.fields.realShares,
        },
      },
    })
  },

  /**
   * Tạo hoặc cập nhật stock (upsert)
   */
  async upsert(data: CreateStockInventoryInput): Promise<StockInventory> {
    return prisma.stockInventory.upsert({
      where: { symbol: data.symbol },
      create: {
        symbol: data.symbol,
        realShares: data.realShares ?? 0,
        mintedTokens: data.mintedTokens ?? 0,
        currentPrice: data.currentPrice ?? 0,
      },
      update: {
        realShares: data.realShares,
        mintedTokens: data.mintedTokens,
        currentPrice: data.currentPrice,
      },
    })
  },
}
