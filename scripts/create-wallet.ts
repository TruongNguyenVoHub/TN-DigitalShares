// npx tsx scripts/create-wallet.ts
import crypto from 'crypto';
import { privateKeyToAccount } from 'viem/accounts';

/**
 * Generate a new Ethereum wallet
 */
function generateWallet() {
  // Generate random 32 bytes for private key
  const privateKeyBytes = crypto.randomBytes(32);
  const privateKey = `0x${privateKeyBytes.toString('hex')}` as `0x${string}`;

  // Create account from private key using viem
  const account = privateKeyToAccount(privateKey);

  return {
    address: account.address,
    privateKey: privateKey,
  };
}

async function main() {
  console.log('🔐 Generating new Ethereum wallet...\n');

  const wallet = generateWallet();

  console.log('✅ Wallet created successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📍 Public Address:');
  console.log(`   ${wallet.address}\n`);
  console.log('🔑 Private Key:');
  console.log(`   ${wallet.privateKey}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n⚠️  WARNING: Keep your private key secure!');
  console.log('   Never share it with anyone.');
  console.log('   Store it safely or encrypt it.\n');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
