/**
 * Script để fix users thiếu walletAddress
 * Chạy: npx tsx scripts/fix-missing-wallets.ts
 */

import { encryptPrivateKey, generateWallet } from '@/lib/crypto-utils';
import { prisma } from '@/lib/prisma';

async function fixMissingWallets() {
  console.log('🔍 Checking for users without wallet addresses...');

  // Find users without wallet address or with empty wallet address
  const usersWithoutWallet = await prisma.user.findMany({
    where: {
      walletAddress: '',
    },
    select: {
      id: true,
      username: true,
      walletAddress: true,
    },
  });

  if (usersWithoutWallet.length === 0) {
    console.log('✅ All users have wallet addresses!');
    return;
  }

  console.log(`⚠️  Found ${usersWithoutWallet.length} users without wallet addresses`);
  console.log('🔧 Generating wallets...\n');

  for (const user of usersWithoutWallet) {
    try {
      // Generate new wallet
      const wallet = generateWallet();
      const privateKeyEnc = encryptPrivateKey(wallet.privateKey);

      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          walletAddress: wallet.address,
          privateKeyEnc,
          walletType: 'MANAGED',
        },
      });

      console.log(`✅ Updated user: ${user.username || user.id}`);
      console.log(`   Wallet: ${wallet.address}`);
    } catch (error) {
      console.error(`❌ Failed to update user ${user.username || user.id}:`, error);
    }
  }

  console.log('\n✅ Migration completed!');
}

// Run the script
fixMissingWallets()
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
