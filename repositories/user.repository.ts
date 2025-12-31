import { KycStatus, Prisma, User } from '@/app/generated/prisma'
import { prisma } from '@/lib/prisma'

// ==================== Types ====================

export type CreateUserInput = {
  walletAddress: string
  fullName?: string
  username?: string
  passwordHash?: string
  privateKeyEnc?: string
  walletType?: string
  vndBalance?: number
  kycStatus?: KycStatus
  isWhitelisted?: boolean
  role?: string
  bankName?: string | null
  bankAccount?: string | null
  bankAccountName?: string | null
}

export type UpdateUserInput = Partial<CreateUserInput>

// ==================== Repository ====================

export const userRepository = {
  /**
   * Tạo user mới
   */
  async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data: {
        username: data.username ? data.username.toLowerCase() : null,
        passwordHash: data.passwordHash || null,
        privateKeyEnc: data.privateKeyEnc || null,
        walletType: data.walletType || 'EXTERNAL',
        walletAddress: data.walletAddress.toLowerCase(),
        fullName: data.fullName || null,
        vndBalance: data.vndBalance ?? 0,
        kycStatus: data.kycStatus ?? 'PENDING',
        isWhitelisted: data.isWhitelisted ?? false,
        bankName: data.bankName ?? null,
        bankAccount: data.bankAccount ?? null,
        bankAccountName: data.bankAccountName ?? null,
        role: data.role ?? 'USER',
      },
    })
  },

  /**
   * Tìm user theo ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    })
  },

  /**
   * Tìm user theo ID kèm relations
   */
  async findByIdWithRelations(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        transactions: true,
        kycRequests: true,
      },
    })
  },

  /**
   * Tìm user theo địa chỉ ví Metamask
   */
  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    })
  },

  /**
   * Lấy danh sách tất cả users
   */
  async findAll(options?: {
    skip?: number
    take?: number
    where?: Prisma.UserWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
  }): Promise<User[]> {
    return prisma.user.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      orderBy: options?.orderBy ?? { createdAt: 'desc' },
    })
  },

  /**
   * Đếm số lượng users
   */
  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where })
  },

  /**
   * Cập nhật thông tin user
   */
  async update(id: string, data: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    })
  },

  /**
   * Xóa user
   */
  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    })
  },

  /**
   * Cập nhật số dư VND
   */
  async updateBalance(id: string, amount: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { vndBalance: amount },
    })
  },

  /**
   * Tăng/giảm số dư VND
   */
  async incrementBalance(id: string, amount: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        vndBalance: {
          increment: amount,
        },
      },
    })
  },

  /**
   * Cập nhật trạng thái KYC
   */
  async updateKycStatus(id: string, status: KycStatus): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { kycStatus: status },
    })
  },

  /**
   * Cập nhật trạng thái whitelist
   */
  async updateWhitelistStatus(id: string, isWhitelisted: boolean): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { isWhitelisted },
    })
  },

  /**
   * Lấy danh sách users đã verified KYC nhưng chưa whitelist
   */
  async findVerifiedNotWhitelisted(): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        kycStatus: 'VERIFIED',
        isWhitelisted: false,
      },
    })
  },

  /**
   * Lấy danh sách users theo trạng thái KYC
   */
  async findByKycStatus(status: KycStatus): Promise<User[]> {
    return prisma.user.findMany({
      where: { kycStatus: status },
      orderBy: { createdAt: 'desc' },
    })
  },

  /**
   * Kiểm tra wallet address đã tồn tại chưa
   */
  async existsByWalletAddress(walletAddress: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { walletAddress: walletAddress.toLowerCase() },
    })
    return count > 0
  },

  /**
   * Tìm user theo username
   */
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    })
  },

  /**
   * Kiểm tra username đã tồn tại chưa
   */
  async existsByUsername(username: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { username: username.toLowerCase() },
    })
    return count > 0
  },

  /**
   * Tìm user theo username kèm password (để login)
   */
  async findByUsernameWithPassword(username: string) {
    return prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        walletAddress: true,
        kycStatus: true,
        isWhitelisted: true,
        role: true,
      },
    })
  },
}
