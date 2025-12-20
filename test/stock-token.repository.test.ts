import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { type Address, type Hash } from 'viem';

// Mock environment variables
process.env.CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';
process.env.RPC_URL = 'https://sepolia.infura.io/v3/test';
process.env.WALLET_PRIVATE_KEY = '0x1234567890123456789012345678901234567890123456789012345678901234';

// Mock viem
const mockReadFunctions = {
    name: jest.fn(),
    symbol: jest.fn(),
    decimals: jest.fn(),
    totalSupply: jest.fn(),
    balanceOf: jest.fn(),
    allowance: jest.fn(),
    isWhitelisted: jest.fn(),
    paused: jest.fn(),
    getLatestPrice: jest.fn(),
    hasRole: jest.fn(),
    getRoleAdmin: jest.fn(),
    COMPLIANCE_ROLE: jest.fn(),
    INVENTORY_MANAGER_ROLE: jest.fn(),
    DEFAULT_ADMIN_ROLE: jest.fn(),
};

const mockWriteFunctions = {
    mint: jest.fn(),
    burn: jest.fn(),
    transfer: jest.fn(),
    transferFrom: jest.fn(),
    approve: jest.fn(),
    setWhitelisted: jest.fn(),
    pause: jest.fn(),
    unpause: jest.fn(),
    grantRole: jest.fn(),
    revokeRole: jest.fn(),
    renounceRole: jest.fn(),
};

const mockWaitForTransactionReceipt = jest.fn();

jest.mock('viem', () => ({
    createPublicClient: jest.fn(() => ({
        waitForTransactionReceipt: mockWaitForTransactionReceipt,
    })),
    createWalletClient: jest.fn(() => ({})),
    getContract: jest.fn(() => ({
        read: mockReadFunctions,
        write: mockWriteFunctions,
    })),
    http: jest.fn(),
    parseUnits: jest.fn((value: string, decimals: number) => {
        // Xử lý chính xác như viem thực sự làm
        const [intPart, decPart = ''] = value.split('.');
        const paddedDecPart = decPart.padEnd(decimals, '0').slice(0, decimals);
        return BigInt(intPart + paddedDecPart);
    }),
    formatUnits: jest.fn((value: bigint, decimals: number) => (Number(value) / 10 ** decimals).toString()),
}));

jest.mock('viem/accounts', () => ({
    privateKeyToAccount: jest.fn(() => ({
        address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as Address,
    })),
}));

jest.mock('viem/chains', () => ({
    sepolia: { id: 11155111, name: 'Sepolia' },
}));

// Import after mocking
import { StockTokenRepository } from '../repositories/stock-token.blockchain.repository';

describe('StockTokenRepository', () => {
    let repository: StockTokenRepository;

    // Test addresses
    const testAddress: Address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const testAddress2: Address = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
    const testTxHash: Hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const testRoleHash: Hash = '0x70d2ef7b36d4d736c45b93d416eb05228e962106468d1bcabdf09a53d30ad8f6';

    beforeAll(() => {
        repository = new StockTokenRepository();
    });

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    // ==================== Read Functions Tests ====================

    describe('Read Functions', () => {
        describe('getName()', () => {
            it('should return token name', async () => {
                mockReadFunctions.name.mockResolvedValue('TruongNguyenVo Token');
                
                const name = await repository.getName();
                
                expect(name).toBe('TruongNguyenVo Token');
                expect(mockReadFunctions.name).toHaveBeenCalledTimes(1);
            });
        });

        describe('getSymbol()', () => {
            it('should return token symbol', async () => {
                mockReadFunctions.symbol.mockResolvedValue('TST');
                
                const symbol = await repository.getSymbol();
                
                expect(symbol).toBe('TST');
                expect(mockReadFunctions.symbol).toHaveBeenCalledTimes(1);
            });
        });

        describe('getDecimals()', () => {
            it('should return token decimals and update internal state', async () => {
                mockReadFunctions.decimals.mockResolvedValue(18);
                
                const decimals = await repository.getDecimals();
                
                expect(decimals).toBe(18);
                expect(mockReadFunctions.decimals).toHaveBeenCalledTimes(1);
            });

            it('should handle different decimal values', async () => {
                mockReadFunctions.decimals.mockResolvedValue(8);
                
                const decimals = await repository.getDecimals();
                
                expect(decimals).toBe(8);
            });
        });

        describe('getTotalSupply()', () => {
            it('should return total supply formatted', async () => {
                mockReadFunctions.totalSupply.mockResolvedValue(BigInt('1000000000000000000000')); // 1000 tokens
                
                const supply = await repository.getTotalSupply();
                
                expect(typeof supply).toBe('number');
                expect(mockReadFunctions.totalSupply).toHaveBeenCalledTimes(1);
            });
        });

        describe('getBalanceOf()', () => {
            it('should return balance of an address', async () => {
                mockReadFunctions.balanceOf.mockResolvedValue(BigInt('500000000000000000000')); // 500 tokens
                
                const balance = await repository.getBalanceOf(testAddress);
                
                expect(typeof balance).toBe('number');
                expect(mockReadFunctions.balanceOf).toHaveBeenCalledWith([testAddress]);
            });

            it('should return 0 for address with no balance', async () => {
                mockReadFunctions.balanceOf.mockResolvedValue(BigInt(0));
                
                const balance = await repository.getBalanceOf(testAddress);
                
                expect(balance).toBe(0);
            });
        });

        describe('getAllowance()', () => {
            it('should return allowance between owner and spender', async () => {
                mockReadFunctions.allowance.mockResolvedValue(BigInt('100000000000000000000')); // 100 tokens
                
                const allowance = await repository.getAllowance(testAddress, testAddress2);
                
                expect(typeof allowance).toBe('number');
                expect(mockReadFunctions.allowance).toHaveBeenCalledWith([testAddress, testAddress2]);
            });
        });

        describe('isWhitelisted()', () => {
            it('should return true for whitelisted address', async () => {
                mockReadFunctions.isWhitelisted.mockResolvedValue(true);
                
                const result = await repository.isWhitelisted(testAddress);
                
                expect(result).toBe(true);
                expect(mockReadFunctions.isWhitelisted).toHaveBeenCalledWith([testAddress]);
            });

            it('should return false for non-whitelisted address', async () => {
                mockReadFunctions.isWhitelisted.mockResolvedValue(false);
                
                const result = await repository.isWhitelisted(testAddress);
                
                expect(result).toBe(false);
            });
        });

        describe('isPaused()', () => {
            it('should return true when contract is paused', async () => {
                mockReadFunctions.paused.mockResolvedValue(true);
                
                const result = await repository.isPaused();
                
                expect(result).toBe(true);
                expect(mockReadFunctions.paused).toHaveBeenCalledTimes(1);
            });

            it('should return false when contract is not paused', async () => {
                mockReadFunctions.paused.mockResolvedValue(false);
                
                const result = await repository.isPaused();
                
                expect(result).toBe(false);
            });
        });

        describe('getLatestPrice()', () => {
            it('should return latest price from oracle', async () => {
                const expectedPrice = BigInt('450000000000'); // Example price
                mockReadFunctions.getLatestPrice.mockResolvedValue(expectedPrice);
                
                const price = await repository.getLatestPrice();
                
                expect(price).toBe(expectedPrice);
                expect(mockReadFunctions.getLatestPrice).toHaveBeenCalledTimes(1);
            });
        });

        describe('hasRole()', () => {
            it('should return true when account has role', async () => {
                mockReadFunctions.hasRole.mockResolvedValue(true);
                
                const result = await repository.hasRole(testRoleHash, testAddress);
                
                expect(result).toBe(true);
                expect(mockReadFunctions.hasRole).toHaveBeenCalledWith([testRoleHash, testAddress]);
            });

            it('should return false when account does not have role', async () => {
                mockReadFunctions.hasRole.mockResolvedValue(false);
                
                const result = await repository.hasRole(testRoleHash, testAddress);
                
                expect(result).toBe(false);
            });
        });

        describe('getRoleAdmin()', () => {
            it('should return admin role hash', async () => {
                const adminRoleHash: Hash = '0x0000000000000000000000000000000000000000000000000000000000000000';
                mockReadFunctions.getRoleAdmin.mockResolvedValue(adminRoleHash);
                
                const result = await repository.getRoleAdmin(testRoleHash);
                
                expect(result).toBe(adminRoleHash);
                expect(mockReadFunctions.getRoleAdmin).toHaveBeenCalledWith([testRoleHash]);
            });
        });

        describe('getComplianceRole()', () => {
            it('should return COMPLIANCE_ROLE hash', async () => {
                const complianceHash: Hash = '0x442a94f1a1fac79af32856af2a64f63648cfa2ef3b98610a5bb7cbec4cee6985';
                mockReadFunctions.COMPLIANCE_ROLE.mockResolvedValue(complianceHash);
                
                const result = await repository.getComplianceRole();
                
                expect(result).toBe(complianceHash);
            });
        });

        describe('getInventoryManagerRole()', () => {
            it('should return INVENTORY_MANAGER_ROLE hash', async () => {
                const inventoryHash: Hash = '0x70d2ef7b36d4d736c45b93d416eb05228e962106468d1bcabdf09a53d30ad8f6';
                mockReadFunctions.INVENTORY_MANAGER_ROLE.mockResolvedValue(inventoryHash);
                
                const result = await repository.getInventoryManagerRole();
                
                expect(result).toBe(inventoryHash);
            });
        });

        describe('getDefaultAdminRole()', () => {
            it('should return DEFAULT_ADMIN_ROLE hash', async () => {
                const adminHash: Hash = '0x0000000000000000000000000000000000000000000000000000000000000000';
                mockReadFunctions.DEFAULT_ADMIN_ROLE.mockResolvedValue(adminHash);
                
                const result = await repository.getDefaultAdminRole();
                
                expect(result).toBe(adminHash);
            });
        });
    });

    // ==================== Write Functions Tests ====================

    describe('Write Functions', () => {
        describe('mint()', () => {
            it('should mint tokens to address', async () => {
                mockWriteFunctions.mint.mockResolvedValue(testTxHash);
                
                const hash = await repository.mint({ to: testAddress, amount: 100 });
                
                expect(hash).toBe(testTxHash);
                expect(mockWriteFunctions.mint).toHaveBeenCalledTimes(1);
            });

            it('should handle decimal amounts', async () => {
                mockWriteFunctions.mint.mockResolvedValue(testTxHash);
                
                const hash = await repository.mint({ to: testAddress, amount: 50.5 });
                
                expect(hash).toBe(testTxHash);
            });
        });

        describe('burn()', () => {
            it('should burn tokens from address', async () => {
                mockWriteFunctions.burn.mockResolvedValue(testTxHash);
                
                const hash = await repository.burn({ from: testAddress, amount: 50 });
                
                expect(hash).toBe(testTxHash);
                expect(mockWriteFunctions.burn).toHaveBeenCalledTimes(1);
            });
        });

        describe('transfer()', () => {
            it('should transfer tokens to address', async () => {
                mockWriteFunctions.transfer.mockResolvedValue(testTxHash);
                
                const hash = await repository.transfer({ to: testAddress, amount: 25 });
                
                expect(hash).toBe(testTxHash);
                expect(mockWriteFunctions.transfer).toHaveBeenCalledTimes(1);
            });
        });

        describe('transferFrom()', () => {
            it('should transfer tokens from one address to another', async () => {
                mockWriteFunctions.transferFrom.mockResolvedValue(testTxHash);
                
                const hash = await repository.transferFrom({
                    from: testAddress,
                    to: testAddress2,
                    amount: 10,
                });
                
                expect(hash).toBe(testTxHash);
                expect(mockWriteFunctions.transferFrom).toHaveBeenCalledTimes(1);
            });
        });

        describe('approve()', () => {
            it('should approve spender to use tokens', async () => {
                mockWriteFunctions.approve.mockResolvedValue(testTxHash);
                
                const hash = await repository.approve({ spender: testAddress, amount: 1000 });
                
                expect(hash).toBe(testTxHash);
                expect(mockWriteFunctions.approve).toHaveBeenCalledTimes(1);
            });
        });

        describe('setWhitelisted()', () => {
            it('should add address to whitelist', async () => {
                mockWriteFunctions.setWhitelisted.mockResolvedValue(testTxHash);
                
                const hash = await repository.setWhitelisted({ account: testAddress, status: true });
                
                expect(hash).toBe(testTxHash);
                expect(mockWriteFunctions.setWhitelisted).toHaveBeenCalledTimes(1);
            });

            it('should remove address from whitelist', async () => {
                mockWriteFunctions.setWhitelisted.mockResolvedValue(testTxHash);
                
                const hash = await repository.setWhitelisted({ account: testAddress, status: false });
                
                expect(hash).toBe(testTxHash);
            });
        });

        describe('pause()', () => {
            it('should pause the contract', async () => {
                mockWriteFunctions.pause.mockResolvedValue(testTxHash);
                
                const hash = await repository.pause();
                
                expect(hash).toBe(testTxHash);
                expect(mockWriteFunctions.pause).toHaveBeenCalledTimes(1);
            });
        });

        describe('unpause()', () => {
            it('should unpause the contract', async () => {
                mockWriteFunctions.unpause.mockResolvedValue(testTxHash);
                
                const hash = await repository.unpause();
                
                expect(hash).toBe(testTxHash);
                expect(mockWriteFunctions.unpause).toHaveBeenCalledTimes(1);
            });
        });

        describe('grantRole()', () => {
            it('should grant role to account', async () => {
                mockWriteFunctions.grantRole.mockResolvedValue(testTxHash);
                
                const hash = await repository.grantRole({ role: testRoleHash, account: testAddress });
                
                expect(hash).toBe(testTxHash);
                expect(mockWriteFunctions.grantRole).toHaveBeenCalledTimes(1);
            });
        });

        describe('revokeRole()', () => {
            it('should revoke role from account', async () => {
                mockWriteFunctions.revokeRole.mockResolvedValue(testTxHash);
                
                const hash = await repository.revokeRole({ role: testRoleHash, account: testAddress });
                
                expect(hash).toBe(testTxHash);
                expect(mockWriteFunctions.revokeRole).toHaveBeenCalledTimes(1);
            });
        });

        describe('renounceRole()', () => {
            it('should renounce own role', async () => {
                mockWriteFunctions.renounceRole.mockResolvedValue(testTxHash);
                
                const hash = await repository.renounceRole(testRoleHash);
                
                expect(hash).toBe(testTxHash);
                expect(mockWriteFunctions.renounceRole).toHaveBeenCalledTimes(1);
            });
        });
    });

    // ==================== Utility Functions Tests ====================

    describe('Utility Functions', () => {
        describe('waitForTransaction()', () => {
            it('should wait for transaction receipt', async () => {
                const mockReceipt = {
                    blockHash: '0xabc123',
                    blockNumber: BigInt(12345),
                    status: 'success',
                };
                mockWaitForTransactionReceipt.mockResolvedValue(mockReceipt);
                
                const receipt = await repository.waitForTransaction(testTxHash);
                
                expect(receipt).toEqual(mockReceipt);
                expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: testTxHash });
            });
        });

        describe('mintAndWait()', () => {
            it('should mint and wait for confirmation', async () => {
                const mockReceipt = { status: 'success' };
                mockWriteFunctions.mint.mockResolvedValue(testTxHash);
                mockWaitForTransactionReceipt.mockResolvedValue(mockReceipt);
                
                const result = await repository.mintAndWait({ to: testAddress, amount: 100 });
                
                expect(result.hash).toBe(testTxHash);
                expect(result.receipt).toEqual(mockReceipt);
            });
        });

        describe('burnAndWait()', () => {
            it('should burn and wait for confirmation', async () => {
                const mockReceipt = { status: 'success' };
                mockWriteFunctions.burn.mockResolvedValue(testTxHash);
                mockWaitForTransactionReceipt.mockResolvedValue(mockReceipt);
                
                const result = await repository.burnAndWait({ from: testAddress, amount: 50 });
                
                expect(result.hash).toBe(testTxHash);
                expect(result.receipt).toEqual(mockReceipt);
            });
        });

        describe('setWhitelistedAndWait()', () => {
            it('should set whitelist and wait for confirmation', async () => {
                const mockReceipt = { status: 'success' };
                mockWriteFunctions.setWhitelisted.mockResolvedValue(testTxHash);
                mockWaitForTransactionReceipt.mockResolvedValue(mockReceipt);
                
                const result = await repository.setWhitelistedAndWait({
                    account: testAddress,
                    status: true,
                });
                
                expect(result.hash).toBe(testTxHash);
                expect(result.receipt).toEqual(mockReceipt);
            });
        });

        describe('getContractInfo()', () => {
            it('should return complete contract information', async () => {
                mockReadFunctions.name.mockResolvedValue('TruongNguyenVo Token');
                mockReadFunctions.symbol.mockResolvedValue('TST');
                mockReadFunctions.decimals.mockResolvedValue(18);
                mockReadFunctions.totalSupply.mockResolvedValue(BigInt('1000000000000000000000'));
                mockReadFunctions.paused.mockResolvedValue(false);
                mockReadFunctions.getLatestPrice.mockResolvedValue(BigInt('450000000000'));
                
                const info = await repository.getContractInfo();
                
                expect(info).toHaveProperty('address');
                expect(info).toHaveProperty('name', 'TruongNguyenVo Token');
                expect(info).toHaveProperty('symbol', 'TST');
                expect(info).toHaveProperty('decimals', 18);
                expect(info).toHaveProperty('totalSupply');
                expect(info).toHaveProperty('paused', false);
                expect(info).toHaveProperty('latestPrice');
            });
        });

        describe('getAccountInfo()', () => {
            it('should return complete account information', async () => {
                const complianceRole: Hash = '0x442a94f1a1fac79af32856af2a64f63648cfa2ef3b98610a5bb7cbec4cee6985';
                const inventoryRole: Hash = '0x70d2ef7b36d4d736c45b93d416eb05228e962106468d1bcabdf09a53d30ad8f6';
                const adminRole: Hash = '0x0000000000000000000000000000000000000000000000000000000000000000';

                mockReadFunctions.balanceOf.mockResolvedValue(BigInt('500000000000000000000'));
                mockReadFunctions.isWhitelisted.mockResolvedValue(true);
                mockReadFunctions.COMPLIANCE_ROLE.mockResolvedValue(complianceRole);
                mockReadFunctions.INVENTORY_MANAGER_ROLE.mockResolvedValue(inventoryRole);
                mockReadFunctions.DEFAULT_ADMIN_ROLE.mockResolvedValue(adminRole);
                mockReadFunctions.hasRole.mockResolvedValue(false);
                
                const info = await repository.getAccountInfo(testAddress);
                
                expect(info).toHaveProperty('address', testAddress);
                expect(info).toHaveProperty('balance');
                expect(info).toHaveProperty('isWhitelisted', true);
                expect(info).toHaveProperty('roles');
                expect(info.roles).toHaveProperty('compliance');
                expect(info.roles).toHaveProperty('inventoryManager');
                expect(info.roles).toHaveProperty('admin');
            });

            it('should correctly identify account with admin role', async () => {
                const adminRole: Hash = '0x0000000000000000000000000000000000000000000000000000000000000000';
                
                mockReadFunctions.balanceOf.mockResolvedValue(BigInt(0));
                mockReadFunctions.isWhitelisted.mockResolvedValue(true);
                mockReadFunctions.COMPLIANCE_ROLE.mockResolvedValue('0x1' as Hash);
                mockReadFunctions.INVENTORY_MANAGER_ROLE.mockResolvedValue('0x2' as Hash);
                mockReadFunctions.DEFAULT_ADMIN_ROLE.mockResolvedValue(adminRole);
                mockReadFunctions.hasRole
                    .mockResolvedValueOnce(false) // compliance
                    .mockResolvedValueOnce(false) // inventory
                    .mockResolvedValueOnce(true);  // admin
                
                const info = await repository.getAccountInfo(testAddress);
                
                expect(info.roles.admin).toBe(true);
                expect(info.roles.compliance).toBe(false);
                expect(info.roles.inventoryManager).toBe(false);
            });
        });
    });

    // ==================== Error Handling Tests ====================

    describe('Error Handling', () => {
        describe('Read function errors', () => {
            it('should throw error when balanceOf fails', async () => {
                mockReadFunctions.balanceOf.mockRejectedValue(new Error('Contract call failed'));
                
                await expect(repository.getBalanceOf(testAddress)).rejects.toThrow('Contract call failed');
            });

            it('should throw error when isWhitelisted fails', async () => {
                mockReadFunctions.isWhitelisted.mockRejectedValue(new Error('Network error'));
                
                await expect(repository.isWhitelisted(testAddress)).rejects.toThrow('Network error');
            });
        });

        describe('Write function errors', () => {
            it('should throw error when mint fails due to insufficient role', async () => {
                mockWriteFunctions.mint.mockRejectedValue(new Error('AccessControlUnauthorizedAccount'));
                
                await expect(repository.mint({ to: testAddress, amount: 100 }))
                    .rejects.toThrow('AccessControlUnauthorizedAccount');
            });

            it('should throw error when transfer fails due to whitelist', async () => {
                mockWriteFunctions.transfer.mockRejectedValue(new Error('Sender not KYC'));
                
                await expect(repository.transfer({ to: testAddress, amount: 50 }))
                    .rejects.toThrow('Sender not KYC');
            });

            it('should throw error when setWhitelisted fails', async () => {
                mockWriteFunctions.setWhitelisted.mockRejectedValue(new Error('Only compliance can whitelist'));
                
                await expect(repository.setWhitelisted({ account: testAddress, status: true }))
                    .rejects.toThrow('Only compliance can whitelist');
            });

            it('should throw error when pause fails without admin role', async () => {
                mockWriteFunctions.pause.mockRejectedValue(new Error('AccessControlUnauthorizedAccount'));
                
                await expect(repository.pause()).rejects.toThrow('AccessControlUnauthorizedAccount');
            });
        });

        describe('Transaction confirmation errors', () => {
            it('should throw error when transaction fails', async () => {
                mockWriteFunctions.mint.mockResolvedValue(testTxHash);
                mockWaitForTransactionReceipt.mockRejectedValue(new Error('Transaction reverted'));
                
                await expect(repository.mintAndWait({ to: testAddress, amount: 100 }))
                    .rejects.toThrow('Transaction reverted');
            });
        });
    });

    // ==================== Edge Cases Tests ====================

    describe('Edge Cases', () => {
        it('should handle zero amount mint', async () => {
            mockWriteFunctions.mint.mockResolvedValue(testTxHash);
            
            const hash = await repository.mint({ to: testAddress, amount: 0 });
            
            expect(hash).toBe(testTxHash);
        });

        it('should handle very large amounts', async () => {
            mockWriteFunctions.mint.mockResolvedValue(testTxHash);
            
            const hash = await repository.mint({ to: testAddress, amount: 1000000000 });
            
            expect(hash).toBe(testTxHash);
        });

        it('should handle very small decimal amounts', async () => {
            mockWriteFunctions.transfer.mockResolvedValue(testTxHash);
            
            // Dùng 0.001 thay vì 0.000000001 vì JS sẽ convert số quá nhỏ sang scientific notation (1e-9)
            const hash = await repository.transfer({ to: testAddress, amount: 0.001 });
            
            expect(hash).toBe(testTxHash);
        });

        it('should handle address checksum correctly', async () => {
            const checksumAddress: Address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
            mockReadFunctions.balanceOf.mockResolvedValue(BigInt(0));
            
            await repository.getBalanceOf(checksumAddress);
            
            expect(mockReadFunctions.balanceOf).toHaveBeenCalledWith([checksumAddress]);
        });
    });
});
