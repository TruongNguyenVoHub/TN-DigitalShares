import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

// 1. Client để ĐỌC và LẮNG NGHE (Public)
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.RPC_URL) 
})

// 2. Client để GHI (Mint/Transfer) - Dùng ví Hot Wallet
const privateKey = process.env.SEPOLIA_PRIVATE_KEY || '';
const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`)

export const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(process.env.RPC_URL)
})