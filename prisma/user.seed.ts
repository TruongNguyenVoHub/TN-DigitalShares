// npx tsx prisma/user.seed.ts
import { PrismaClient } from '../app/generated/prisma'
const prisma = new PrismaClient()

async function main() {
  // 1. Mock Admin (Trong MVP, Admin không cần lưu trong DB user, nhưng lưu config kho)
  // Chúng ta sẽ hardcode user/pass admin trong .env, nên không seed admin vào bảng User.

  // 2. Mock User A: Mới toanh (Chưa làm gì cả)
  await prisma.user.upsert({
    where: { walletAddress: '0x1111111111111111111111111111111111111111' },
    update: {},
    create: {
      walletAddress: '0x1111111111111111111111111111111111111111',
      fullName: "",
      kycStatus: 'PENDING',
      isWhitelisted: false,
      vndBalance: 0,
    },
  })

  // 3. Mock User B: Đã KYC xịn (Tên trùng Bank)
  await prisma.user.upsert({
    where: { walletAddress: '0x2222222222222222222222222222222222222222' },
    update: {},
    create: {
      walletAddress: '0x2222222222222222222222222222222222222222',
      fullName: 'NGUYEN VAN B', // Tên thật
      kycStatus: 'VERIFIED',
      isWhitelisted: true, // Đã vào Smart Contract
      vndBalance: 50000000, // Đã nạp 50 triệu
    },
  })

   // 4. Mock User C: Bị từ chối (Fake ảnh)
   await prisma.user.upsert({
    where: { walletAddress: '0x3333333333333333333333333333333333333333' },
    update: {},
    create: {
      walletAddress: '0x3333333333333333333333333333333333333333',
      fullName: "",
      kycStatus: 'REJECTED',
      isWhitelisted: false,
      vndBalance: 0,
    },
  })

  console.log('✅ Mock data seeded!')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })