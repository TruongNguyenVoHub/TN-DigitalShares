// npm run listen
import { PrismaClient } from '@/app/generated/prisma';
import StockTokenABI from "@/contracts/artifacts/contracts/StockToken.sol/StockToken.json";
import 'dotenv/config';
import { formatEther } from "viem";
import { publicClient } from '../lib/viem-client';

const prisma = new PrismaClient()
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as `0x${string}`
async function main() {
  console.log('🎧 Đang lắng nghe sự kiện Transfer...')

  publicClient.watchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: StockTokenABI.abi,
    eventName: 'Transfer',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onLogs: async (logs: any[]) => {
      for (const log of logs) {
        // 1. Chuẩn hóa dữ liệu
        const from = log.args.from.toLowerCase(); 
        const to = log.args.to.toLowerCase();
        const value = parseFloat(formatEther(log.args.value)); 
        const txHash = log.transactionHash;

        console.log(`🔔 Log: ${from} -> ${to} | SL: ${value}`);

        // 2. LOGIC LỌC (FILTER)
        // Chúng ta CHỈ quan tâm Transfer P2P.
        // Bỏ qua Mint (from == 0) và Burn (to == 0) vì API đã xử lý rồi.
        
        if (from !== '0x0000000000000000000000000000000000000000' && to !== '0x0000000000000000000000000000000000000000') {
            
            console.log('🔄 Đây là giao dịch P2P (User -> User)');

            // Bước 1: Tìm 2 ông User này trong DB xem có phải người của mình không
            // (Dùng Promise.all chạy cho nhanh)
            const [sender, receiver] = await Promise.all([
                prisma.user.findUnique({ where: { walletAddress: from } }),
                prisma.user.findUnique({ where: { walletAddress: to } })
            ]);

            // Bước 2: Nếu cả 2 đều tồn tại trong DB, thì lưu lịch sử
            if (sender && receiver) {
                // Kiểm tra xem transaction này đã lưu chưa (chống trùng lặp)
                const existingTransfer = await prisma.tokenTransfer.findFirst({
                    where: { txHash: txHash }
                });

                if (!existingTransfer) {
                    await prisma.tokenTransfer.create({
                        data: {
                            fromUserId: sender.id,
                            toUserId: receiver.id,
                            amount: value,
                            symbol: 'TNT',
                            txHash: txHash
                        }
                    });
                    console.log(`✅ Đã lưu lịch sử: ${sender.fullName} chuyển cho ${receiver.fullName}`);
                } else {
                    console.log('⚠️ Giao dịch này đã được lưu trước đó.');
                }
            } else {
                console.log('❌ Bỏ qua: Địa chỉ ví không thuộc hệ thống.');
            }
        } 
        else {
            console.log('⏩ Bỏ qua sự kiện Mint/Burn (Do API tự xử lý)');
        }
      }
    }
  })
}

main()

