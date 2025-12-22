// npx tsx scripts/set-kyc.ts
import 'dotenv/config';
import type { Address } from 'viem';
import { stockTokenRepository } from '../repositories/stock-token.blockchain.repository';

async function main() {
  // Địa chỉ cần KYC (Whitelist)
  const addressToKYC: Address = '0x88B9480BC062544d99DbC41CF3471909570e88Ec';
  
  console.log('🔍 Đang kiểm tra trạng thái KYC hiện tại...');
  
  // Kiểm tra trạng thái hiện tại
  const isCurrentlyWhitelisted = await stockTokenRepository.isWhitelisted(addressToKYC);
  console.log(`📋 Trạng thái KYC hiện tại: ${isCurrentlyWhitelisted ? '✅ Đã KYC' : '❌ Chưa KYC'}`);
  
  if (isCurrentlyWhitelisted) {
    console.log('⚠️ Địa chỉ này đã được KYC rồi!');
    return;
  }
  
  console.log('\n🚀 Đang thực hiện KYC (Whitelist)...');
  
  try {
    const { hash, receipt } = await stockTokenRepository.setWhitelistedAndWait({
      account: addressToKYC,
      status: true
    });
    
    console.log('✅ KYC thành công!');
    console.log(`📝 Transaction Hash: ${hash}`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed}`);
    console.log(`📊 Block Number: ${receipt.blockNumber}`);
    
    // Kiểm tra lại trạng thái sau khi set
    const newStatus = await stockTokenRepository.isWhitelisted(addressToKYC);
    console.log(`\n✨ Trạng thái mới: ${newStatus ? '✅ Đã KYC' : '❌ Chưa KYC'}`);
    
  } catch (error) {
    console.error('❌ Lỗi khi thực hiện KYC:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
