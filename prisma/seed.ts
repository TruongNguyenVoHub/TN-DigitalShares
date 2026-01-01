// npx tsx seed.ts
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { privateKeyToAccount } from 'viem/accounts';
import { PrismaClient } from '../app/generated/prisma';
import { encryptPrivateKey } from '../lib/crypto-utils';
import { StockTokenRepository } from '../repositories/stock-token.blockchain.repository';

const prisma = new PrismaClient();

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
  console.log('🌱 Starting seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.kYCRequest.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.stockInventory.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleared existing data\n');

  const adminPassword = 'Admin@123456';
  const adminPublicKey = 'YOUR_ADMIN_WALLET_ADDRESS_HERE'; // Replace with actual admin wallet address
  const adminPrivateKey = 'YOUR_ADMIN_PRIVATE_KEY_HERE'; // Replace with actual admin private key
  
  const admin = await prisma.user.create({
    data: {
      username: 'admin01',
      passwordHash: await bcrypt.hash(adminPassword, 10),
      walletAddress: adminPublicKey,
      privateKeyEnc: encryptPrivateKey(adminPrivateKey), 
      walletType: 'MANAGED',
      fullName: 'System Administrator',
      role: 'ADMIN',
      kycStatus: 'VERIFIED',
      isWhitelisted: true,
      vndBalance: 0,
      tokenBalance: 0,
    },
  });
  console.log(`✅ Admin created: ${admin.username}`);
  console.log(`   - ID: ${admin.id}`);
  console.log(`   - Wallet: ${admin.walletAddress}`);
  console.log(`   - Wallet Type: ${admin.walletType}`);
  console.log(`   - Password: ${adminPassword}\n`);

  // ===== 2. Create Regular User (Managed Wallet) =====
  console.log('👤 Creating Regular user with managed wallet...');
  
  // Generate new wallet
  const userWallet = generateWallet();
  console.log(`   - Generated wallet: ${userWallet.address}`);
  
  // Hash password
  const password = 'User@123456';
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Encrypt private key (requires WALLET_ENCRYPTION_KEY in .env)
  let privateKeyEnc: string | undefined;
  try {
    privateKeyEnc = encryptPrivateKey(userWallet.privateKey);
    console.log('   - Private key encrypted ✓');
  } catch (error) {
    console.warn('   ⚠️  Warning: Could not encrypt private key. Set WALLET_ENCRYPTION_KEY in .env');
    console.warn(`   Error: ${error}`);
  }
  
  const user = await prisma.user.create({
    data: {
      username: 'user01',
      passwordHash: passwordHash,
      walletAddress: userWallet.address,
      privateKeyEnc: privateKeyEnc,
      walletType: 'MANAGED',
      fullName: 'Nguyen Van A',
      role: 'USER',
      kycStatus: 'PENDING',
      isWhitelisted: false,
      vndBalance: 1000000, // 1,000,000 VND
      tokenBalance: 0,
      bankName: 'Vietcombank',
      bankAccount: '1234567890',
      bankAccountName: 'NGUYEN VAN A',
    },
  });
  console.log(`✅ User created: ${user.username}`);
  console.log(`   - ID: ${user.id}`);
  console.log(`   - Wallet: ${user.walletAddress}`);
  console.log(`   - Wallet Type: ${user.walletType}`);
  console.log(`   - Password: ${password}`);
  console.log(`   - VND Balance: ${user.vndBalance.toLocaleString()} VND\n`);

  // ===== 3. Whitelist admin wallet on smart contract =====
  console.log('🔗 Whitelisting admin wallet on smart contract...');
  try {
    const stockTokenRepository = new StockTokenRepository();
    
    // Whitelist admin wallet
    console.log(`   - Whitelisting admin wallet: ${admin.walletAddress}`);
    const adminWhitelistTx = await stockTokenRepository.setWhitelisted({
      account: admin.walletAddress as `0x${string}`,
      status: true
    });
    console.log(`   ✅ Admin whitelisted - TX: ${adminWhitelistTx}`);
    console.log('   ℹ️ User wallet will be whitelisted after KYC approval.');
    
    // Update database to mark admin as whitelisted
    await prisma.user.update({
      where: { id: admin.id },
      data: { isWhitelisted: true }
    });
    
  } catch (error) {
    console.warn('   ⚠️  Warning: Could not whitelist wallets on smart contract');
    console.warn(`   Error: ${error}`);
    console.warn('   Note: Make sure CONTRACT_ADDRESS, RPC_URL, and SEPOLIA_PRIVATE_KEY are set in .env\n');
  }


  // ===== Summary =====
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Seed completed successfully!\n');
  console.log('📝 Login Information:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍💼 ADMIN (Managed Wallet):');
  console.log(`   Username: admin01`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Wallet (auto): ${admin.walletAddress}\n`);
  console.log('👤 USER (Managed Wallet):');
  console.log(`   Username: user01`);
  console.log(`   Password: ${password}`);
  console.log(`   Wallet (auto): ${user.walletAddress}`);
  console.log(`   VND Balance: ${user.vndBalance.toLocaleString()} VND`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
