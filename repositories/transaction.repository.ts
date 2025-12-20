import {
    Prisma,
    Transaction,
    TransactionStatus,
    TransactionType,
} from '@/app/generated/prisma'
import { prisma } from '@/lib/primas'

// ==================== Types ====================

export type CreateTransactionInput = {
  userId: string
  type: TransactionType
  amountVND: number
  stockSymbol?: string
  stockPrice?: number
  amountToken?: number
  status?: TransactionStatus
  txHash?: string
  refCode?: string
}

export type UpdateTransactionInput = Partial<
  Omit<CreateTransactionInput, 'userId' | 'type'>
>

// ==================== Repository ====================

export const transactionRepository = {
  /**
   * Tạo giao dịch mới
   */
  async create(data: CreateTransactionInput): Promise<Transaction> {
    return prisma.transaction.create({
      data: {
        userId: data.userId,
        type: data.type,
        amountVND: data.amountVND,
        stockSymbol: data.stockSymbol,
        stockPrice: data.stockPrice,
        amountToken: data.amountToken,
        status: data.status ?? 'PENDING',
        txHash: data.txHash,
        refCode: data.refCode,
      },
    })
  },

  /**
   * Tìm giao dịch theo ID
   */
  async findById(id: string): Promise<Transaction | null> {
    return prisma.transaction.findUnique({
      where: { id },
    })
  },

  /**
   * Tìm giao dịch theo ID kèm user
   */
  async findByIdWithUser(id: string): Promise<Transaction | null> {
    return prisma.transaction.findUnique({
      where: { id },
      include: { user: true },
    })
  },

  /**
   * Lấy danh sách giao dịch của user
   */
  async findByUserId(
    userId: string,
    options?: {
      skip?: number
      take?: number
      type?: TransactionType
      status?: TransactionStatus
    }
  ): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: {
        userId,
        type: options?.type,
        status: options?.status,
      },
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
    })
  },

  /**
   * Lấy danh sách tất cả giao dịch
   */
  async findAll(options?: {
    skip?: number
    take?: number
    where?: Prisma.TransactionWhereInput
    orderBy?: Prisma.TransactionOrderByWithRelationInput
  }): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      orderBy: options?.orderBy ?? { createdAt: 'desc' },
      include: { user: true },
    })
  },

  /**
   * Đếm số lượng giao dịch
   */
  async count(where?: Prisma.TransactionWhereInput): Promise<number> {
    return prisma.transaction.count({ where })
  },

  /**
   * Cập nhật giao dịch
   */
  async update(id: string, data: UpdateTransactionInput): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id },
      data,
    })
  },

  /**
   * Cập nhật trạng thái giao dịch
   */
  async updateStatus(id: string, status: TransactionStatus): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id },
      data: { status },
    })
  },

  /**
   * Cập nhật txHash (sau khi giao dịch on-chain thành công)
   */
  async updateTxHash(id: string, txHash: string): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id },
      data: { txHash },
    })
  },

  /**
   * Xóa giao dịch
   */
  async delete(id: string): Promise<Transaction> {
    return prisma.transaction.delete({
      where: { id },
    })
  },

  /**
   * Tìm giao dịch theo refCode (VNPay)
   */
  async findByRefCode(refCode: string): Promise<Transaction | null> {
    return prisma.transaction.findFirst({
      where: { refCode },
    })
  },

  /**
   * Tìm giao dịch theo txHash (Blockchain)
   */
  async findByTxHash(txHash: string): Promise<Transaction | null> {
    return prisma.transaction.findFirst({
      where: { txHash },
    })
  },

  /**
   * Lấy giao dịch PENDING (để xử lý)
   */
  async findPending(type?: TransactionType): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: {
        status: 'PENDING',
        type,
      },
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    })
  },

  /**
   * Lấy giao dịch theo loại và trạng thái
   */
  async findByTypeAndStatus(
    type: TransactionType,
    status: TransactionStatus
  ): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: { type, status },
      orderBy: { createdAt: 'desc' },
    })
  },

  /**
   * Tính tổng VND đã nạp của user
   */
  async sumDepositByUserId(userId: string): Promise<number> {
    const result = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'DEPOSIT',
        status: 'SUCCESS',
      },
      _sum: { amountVND: true },
    })
    return result._sum.amountVND ?? 0
  },

  /**
   * Tính tổng VND đã rút của user
   */
  async sumWithdrawByUserId(userId: string): Promise<number> {
    const result = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'WITHDRAW',
        status: 'SUCCESS',
      },
      _sum: { amountVND: true },
    })
    return result._sum.amountVND ?? 0
  },
}
