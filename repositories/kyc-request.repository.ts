import { KYCRequest, KycRequestStatus, Prisma } from '@/app/generated/prisma'
import { prisma } from '@/lib/primas'

// ==================== Types ====================

export type CreateKYCRequestInput = {
  userId: string
  idCardNumber: string
  idCardImageFront: string
  idCardImageBack: string
  selfieImage: string
  status?: KycRequestStatus
  adminNote?: string
}

export type UpdateKYCRequestInput = Partial<
  Omit<CreateKYCRequestInput, 'userId'>
>

// ==================== Repository ====================

export const kycRequestRepository = {
  /**
   * Tạo yêu cầu KYC mới
   */
  async create(data: CreateKYCRequestInput): Promise<KYCRequest> {
    return prisma.kYCRequest.create({
      data: {
        userId: data.userId,
        idCardNumber: data.idCardNumber,
        idCardImageFront: data.idCardImageFront,
        idCardImageBack: data.idCardImageBack,
        selfieImage: data.selfieImage,
        status: data.status ?? 'PENDING',
        adminNote: data.adminNote,
      },
    })
  },

  /**
   * Tìm yêu cầu KYC theo ID
   */
  async findById(id: string): Promise<KYCRequest | null> {
    return prisma.kYCRequest.findUnique({
      where: { id },
    })
  },

  /**
   * Tìm yêu cầu KYC theo ID kèm user
   */
  async findByIdWithUser(id: string): Promise<KYCRequest | null> {
    return prisma.kYCRequest.findUnique({
      where: { id },
      include: { user: true },
    })
  },

  /**
   * Lấy danh sách yêu cầu KYC của user
   */
  async findByUserId(userId: string): Promise<KYCRequest[]> {
    return prisma.kYCRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  /**
   * Lấy yêu cầu KYC mới nhất của user
   */
  async findLatestByUserId(userId: string): Promise<KYCRequest | null> {
    return prisma.kYCRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  /**
   * Lấy danh sách tất cả yêu cầu KYC
   */
  async findAll(options?: {
    skip?: number
    take?: number
    where?: Prisma.KYCRequestWhereInput
    orderBy?: Prisma.KYCRequestOrderByWithRelationInput
  }): Promise<KYCRequest[]> {
    return prisma.kYCRequest.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      orderBy: options?.orderBy ?? { createdAt: 'desc' },
      include: { user: true },
    })
  },

  /**
   * Đếm số lượng yêu cầu KYC
   */
  async count(where?: Prisma.KYCRequestWhereInput): Promise<number> {
    return prisma.kYCRequest.count({ where })
  },

  /**
   * Cập nhật yêu cầu KYC
   */
  async update(id: string, data: UpdateKYCRequestInput): Promise<KYCRequest> {
    return prisma.kYCRequest.update({
      where: { id },
      data,
    })
  },

  /**
   * Xóa yêu cầu KYC
   */
  async delete(id: string): Promise<KYCRequest> {
    return prisma.kYCRequest.delete({
      where: { id },
    })
  },

  /**
   * Duyệt yêu cầu KYC (APPROVED)
   */
  async approve(id: string, adminNote?: string): Promise<KYCRequest> {
    return prisma.kYCRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        adminNote,
      },
    })
  },

  /**
   * Từ chối yêu cầu KYC (REJECTED)
   */
  async reject(id: string, adminNote: string): Promise<KYCRequest> {
    return prisma.kYCRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNote,
      },
    })
  },

  /**
   * Lấy danh sách yêu cầu PENDING (chờ duyệt)
   */
  async findPending(): Promise<KYCRequest[]> {
    return prisma.kYCRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    })
  },

  /**
   * Lấy danh sách yêu cầu theo trạng thái
   */
  async findByStatus(status: KycRequestStatus): Promise<KYCRequest[]> {
    return prisma.kYCRequest.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    })
  },

  /**
   * Kiểm tra user đã có yêu cầu PENDING chưa
   */
  async hasPendingRequest(userId: string): Promise<boolean> {
    const count = await prisma.kYCRequest.count({
      where: {
        userId,
        status: 'PENDING',
      },
    })
    return count > 0
  },

  /**
   * Kiểm tra user đã được duyệt KYC chưa
   */
  async hasApprovedRequest(userId: string): Promise<boolean> {
    const count = await prisma.kYCRequest.count({
      where: {
        userId,
        status: 'APPROVED',
      },
    })
    return count > 0
  },

  /**
   * Tìm theo số CCCD
   */
  async findByIdCardNumber(idCardNumber: string): Promise<KYCRequest[]> {
    return prisma.kYCRequest.findMany({
      where: { idCardNumber },
      include: { user: true },
    })
  },

  /**
   * Đếm số yêu cầu pending (cho dashboard)
   */
  async countPending(): Promise<number> {
    return prisma.kYCRequest.count({
      where: { status: 'PENDING' },
    })
  },
}
