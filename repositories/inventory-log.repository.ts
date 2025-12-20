import { InventoryAction, InventoryLog, Prisma } from '@/app/generated/prisma'
import { prisma } from '@/lib/primas'

// ==================== Types ====================

export type CreateInventoryLogInput = {
  adminId: string
  symbol: string
  action: InventoryAction
  quantity: number
  proofUrl: string
  txHash?: string
}

export type UpdateInventoryLogInput = Partial<
  Omit<CreateInventoryLogInput, 'adminId' | 'symbol' | 'action'>
>

// ==================== Repository ====================

export const inventoryLogRepository = {
  /**
   * Tạo log nhập/xuất kho mới
   */
  async create(data: CreateInventoryLogInput): Promise<InventoryLog> {
    return prisma.inventoryLog.create({
      data: {
        adminId: data.adminId,
        symbol: data.symbol,
        action: data.action,
        quantity: data.quantity,
        proofUrl: data.proofUrl,
        txHash: data.txHash,
      },
    })
  },

  /**
   * Tìm log theo ID
   */
  async findById(id: string): Promise<InventoryLog | null> {
    return prisma.inventoryLog.findUnique({
      where: { id },
    })
  },

  /**
   * Tìm log theo ID kèm stock inventory
   */
  async findByIdWithStock(id: string): Promise<InventoryLog | null> {
    return prisma.inventoryLog.findUnique({
      where: { id },
      include: { stockInventory: true },
    })
  },

  /**
   * Lấy danh sách logs theo symbol
   */
  async findBySymbol(
    symbol: string,
    options?: {
      skip?: number
      take?: number
      action?: InventoryAction
    }
  ): Promise<InventoryLog[]> {
    return prisma.inventoryLog.findMany({
      where: {
        symbol,
        action: options?.action,
      },
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
    })
  },

  /**
   * Lấy danh sách logs theo adminId
   */
  async findByAdminId(
    adminId: string,
    options?: {
      skip?: number
      take?: number
    }
  ): Promise<InventoryLog[]> {
    return prisma.inventoryLog.findMany({
      where: { adminId },
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
      include: { stockInventory: true },
    })
  },

  /**
   * Lấy danh sách tất cả logs
   */
  async findAll(options?: {
    skip?: number
    take?: number
    where?: Prisma.InventoryLogWhereInput
    orderBy?: Prisma.InventoryLogOrderByWithRelationInput
  }): Promise<InventoryLog[]> {
    return prisma.inventoryLog.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      orderBy: options?.orderBy ?? { createdAt: 'desc' },
      include: { stockInventory: true },
    })
  },

  /**
   * Đếm số lượng logs
   */
  async count(where?: Prisma.InventoryLogWhereInput): Promise<number> {
    return prisma.inventoryLog.count({ where })
  },

  /**
   * Cập nhật log (chỉ cập nhật proofUrl và txHash)
   */
  async update(id: string, data: UpdateInventoryLogInput): Promise<InventoryLog> {
    return prisma.inventoryLog.update({
      where: { id },
      data,
    })
  },

  /**
   * Cập nhật txHash
   */
  async updateTxHash(id: string, txHash: string): Promise<InventoryLog> {
    return prisma.inventoryLog.update({
      where: { id },
      data: { txHash },
    })
  },

  /**
   * Xóa log
   */
  async delete(id: string): Promise<InventoryLog> {
    return prisma.inventoryLog.delete({
      where: { id },
    })
  },

  /**
   * Tìm log theo txHash
   */
  async findByTxHash(txHash: string): Promise<InventoryLog | null> {
    return prisma.inventoryLog.findFirst({
      where: { txHash },
    })
  },

  /**
   * Tính tổng số lượng IMPORT của symbol
   */
  async sumImportBySymbol(symbol: string): Promise<number> {
    const result = await prisma.inventoryLog.aggregate({
      where: {
        symbol,
        action: 'IMPORT',
      },
      _sum: { quantity: true },
    })
    return result._sum.quantity ?? 0
  },

  /**
   * Tính tổng số lượng EXPORT của symbol
   */
  async sumExportBySymbol(symbol: string): Promise<number> {
    const result = await prisma.inventoryLog.aggregate({
      where: {
        symbol,
        action: 'EXPORT',
      },
      _sum: { quantity: true },
    })
    return result._sum.quantity ?? 0
  },

  /**
   * Lấy logs chưa có txHash (chưa mint/burn on-chain)
   */
  async findWithoutTxHash(): Promise<InventoryLog[]> {
    return prisma.inventoryLog.findMany({
      where: { txHash: null },
      orderBy: { createdAt: 'asc' },
      include: { stockInventory: true },
    })
  },

  /**
   * Lấy logs trong khoảng thời gian
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<InventoryLog[]> {
    return prisma.inventoryLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: { stockInventory: true },
    })
  },
}
