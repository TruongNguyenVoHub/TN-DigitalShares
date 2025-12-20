import StockTokenABI from "@/contracts/artifacts/contracts/StockToken.sol/StockToken.json";
import * as dotenv from "dotenv";
import {
    createPublicClient,
    createWalletClient,
    formatUnits,
    getContract,
    http,
    parseUnits,
    type Address,
    type Hash,
    type PublicClient,
    type WalletClient,
} from "viem";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
dotenv.config();

// ==================== Types ====================

export type MintParams = {
    to: Address;
    amount: number; // Số lượng token (sẽ tự convert theo decimals)
};

export type BurnParams = {
    from: Address;
    amount: number;
};

export type TransferParams = {
    to: Address;
    amount: number;
};

export type TransferFromParams = {
    from: Address;
    to: Address;
    amount: number;
};

export type ApproveParams = {
    spender: Address;
    amount: number;
};

export type SetWhitelistedParams = {
    account: Address;
    status: boolean;
};

export type RoleParams = {
    role: Hash;
    account: Address;
};

// ==================== Repository ====================

export class StockTokenRepository {
    private contractAddress: Address;
    private publicClient: PublicClient;
    private walletClient: WalletClient;
    private account: PrivateKeyAccount;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private contract: any;
    private decimals: number = 18; // Default, sẽ được update sau khi init

    constructor() {
        this.contractAddress = process.env.CONTRACT_ADDRESS as Address;
        const rpcUrl = process.env.RPC_URL;
        
        if (!rpcUrl) {
            throw new Error("RPC_URL is not defined in environment variables");
        }
        
        if (!this.contractAddress) {
            throw new Error("CONTRACT_ADDRESS is not defined in environment variables");
        }

        this.publicClient = createPublicClient({
            chain: sepolia,
            transport: http(rpcUrl),
        });

        const privateKey = process.env.WALLET_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("WALLET_PRIVATE_KEY is required in environment variables");
        }

        this.account = privateKeyToAccount(privateKey as `0x${string}`);
        this.walletClient = createWalletClient({
            account: this.account,
            chain: sepolia,
            transport: http(rpcUrl),
        });

        this.contract = getContract({
            address: this.contractAddress,
            abi: StockTokenABI.abi,
            client: {
                public: this.publicClient,
                wallet: this.walletClient,
            },
        });
    }

    // ==================== Helper ====================

    /**
     * Convert số lượng token sang wei (theo decimals)
     */
    private toWei(amount: number): bigint {
        return parseUnits(amount.toString(), this.decimals);
    }

    /**
     * Convert wei sang số lượng token
     */
    private fromWei(amount: bigint): number {
        return parseFloat(formatUnits(amount, this.decimals));
    }

    // ==================== Read Functions ====================

    /**
     * Lấy tên token
     */
    async getName(): Promise<string> {
        return this.contract.read.name();
    }

    /**
     * Lấy symbol token
     */
    async getSymbol(): Promise<string> {
        return this.contract.read.symbol();
    }

    /**
     * Lấy decimals
     */
    async getDecimals(): Promise<number> {
        const decimals = await this.contract.read.decimals();
        this.decimals = decimals;
        return decimals;
    }

    /**
     * Lấy tổng supply
     */
    async getTotalSupply(): Promise<number> {
        const supply = await this.contract.read.totalSupply();
        return this.fromWei(supply);
    }

    /**
     * Lấy số dư token của một địa chỉ
     */
    async getBalanceOf(address: Address): Promise<number> {
        const balance = await this.contract.read.balanceOf([address]);
        return this.fromWei(balance);
    }

    /**
     * Lấy allowance
     */
    async getAllowance(owner: Address, spender: Address): Promise<number> {
        const allowance = await this.contract.read.allowance([owner, spender]);
        return this.fromWei(allowance);
    }

    /**
     * Kiểm tra địa chỉ có trong whitelist không
     */
    async isWhitelisted(address: Address): Promise<boolean> {
        return this.contract.read.isWhitelisted([address]);
    }

    /**
     * Kiểm tra contract có đang pause không
     */
    async isPaused(): Promise<boolean> {
        return this.contract.read.paused();
    }

    /**
     * Lấy giá mới nhất từ Oracle
     */
    async getLatestPrice(): Promise<bigint> {
        return this.contract.read.getLatestPrice();
    }

    /**
     * Kiểm tra account có role không
     */
    async hasRole(role: Hash, account: Address): Promise<boolean> {
        return this.contract.read.hasRole([role, account]);
    }

    /**
     * Lấy role admin của một role
     */
    async getRoleAdmin(role: Hash): Promise<Hash> {
        return this.contract.read.getRoleAdmin([role]);
    }

    /**
     * Lấy COMPLIANCE_ROLE hash
     */
    async getComplianceRole(): Promise<Hash> {
        return this.contract.read.COMPLIANCE_ROLE();
    }

    /**
     * Lấy INVENTORY_MANAGER_ROLE hash
     */
    async getInventoryManagerRole(): Promise<Hash> {
        return this.contract.read.INVENTORY_MANAGER_ROLE();
    }

    /**
     * Lấy DEFAULT_ADMIN_ROLE hash
     */
    async getDefaultAdminRole(): Promise<Hash> {
        return this.contract.read.DEFAULT_ADMIN_ROLE();
    }

    // ==================== Write Functions ====================

    /**
     * Mint token (Yêu cầu INVENTORY_MANAGER_ROLE)
     */
    async mint(params: MintParams): Promise<Hash> {
        const { to, amount } = params;
        const hash = await this.contract.write.mint([to, this.toWei(amount)]);
        return hash;
    }

    /**
     * Burn token (Yêu cầu INVENTORY_MANAGER_ROLE)
     */
    async burn(params: BurnParams): Promise<Hash> {
        const { from, amount } = params;
        const hash = await this.contract.write.burn([from, this.toWei(amount)]);
        return hash;
    }

    /**
     * Transfer token
     */
    async transfer(params: TransferParams): Promise<Hash> {
        const { to, amount } = params;
        const hash = await this.contract.write.transfer([to, this.toWei(amount)]);
        return hash;
    }

    /**
     * Transfer token từ địa chỉ khác (cần approve trước)
     */
    async transferFrom(params: TransferFromParams): Promise<Hash> {
        const { from, to, amount } = params;
        const hash = await this.contract.write.transferFrom([from, to, this.toWei(amount)]);
        return hash;
    }

    /**
     * Approve cho địa chỉ khác xài token
     */
    async approve(params: ApproveParams): Promise<Hash> {
        const { spender, amount } = params;
        const hash = await this.contract.write.approve([spender, this.toWei(amount)]);
        return hash;
    }

    /**
     * Set whitelist status (Yêu cầu COMPLIANCE_ROLE)
     */
    async setWhitelisted(params: SetWhitelistedParams): Promise<Hash> {
        const { account, status } = params;
        const hash = await this.contract.write.setWhitelisted([account, status]);
        return hash;
    }

    /**
     * Pause contract (Yêu cầu DEFAULT_ADMIN_ROLE)
     */
    async pause(): Promise<Hash> {
        return this.contract.write.pause();
    }

    /**
     * Unpause contract (Yêu cầu DEFAULT_ADMIN_ROLE)
     */
    async unpause(): Promise<Hash> {
        return this.contract.write.unpause();
    }

    /**
     * Grant role cho account
     */
    async grantRole(params: RoleParams): Promise<Hash> {
        const { role, account } = params;
        const hash = await this.contract.write.grantRole([role, account]);
        return hash;
    }

    /**
     * Revoke role của account
     */
    async revokeRole(params: RoleParams): Promise<Hash> {
        const { role, account } = params;
        const hash = await this.contract.write.revokeRole([role, account]);
        return hash;
    }

    /**
     * Renounce role (tự bỏ role của mình)
     */
    async renounceRole(role: Hash): Promise<Hash> {
        const hash = await this.contract.write.renounceRole([role, this.account.address]);
        return hash;
    }

    // ==================== Utility Functions ====================

    /**
     * Chờ transaction được confirm
     */
    async waitForTransaction(hash: Hash) {
        return this.publicClient.waitForTransactionReceipt({ hash });
    }

    /**
     * Mint và chờ confirm
     */
    async mintAndWait(params: MintParams) {
        const hash = await this.mint(params);
        const receipt = await this.waitForTransaction(hash);
        return { hash, receipt };
    }

    /**
     * Burn và chờ confirm
     */
    async burnAndWait(params: BurnParams) {
        const hash = await this.burn(params);
        const receipt = await this.waitForTransaction(hash);
        return { hash, receipt };
    }

    /**
     * Set whitelist và chờ confirm
     */
    async setWhitelistedAndWait(params: SetWhitelistedParams) {
        const hash = await this.setWhitelisted(params);
        const receipt = await this.waitForTransaction(hash);
        return { hash, receipt };
    }

    /**
     * Lấy thông tin tổng quan của contract
     */
    async getContractInfo() {
        const [name, symbol, decimals, totalSupply, paused, latestPrice] = await Promise.all([
            this.getName(),
            this.getSymbol(),
            this.getDecimals(),
            this.getTotalSupply(),
            this.isPaused(),
            this.getLatestPrice(),
        ]);

        return {
            address: this.contractAddress,
            name,
            symbol,
            decimals,
            totalSupply,
            paused,
            latestPrice: latestPrice.toString(),
        };
    }

    /**
     * Lấy thông tin đầy đủ của một account
     */
    async getAccountInfo(address: Address) {
        const [balance, isWhitelisted, complianceRole, inventoryRole, adminRole] = await Promise.all([
            this.getBalanceOf(address),
            this.isWhitelisted(address),
            this.getComplianceRole(),
            this.getInventoryManagerRole(),
            this.getDefaultAdminRole(),
        ]);

        const [hasComplianceRole, hasInventoryRole, hasAdminRole] = await Promise.all([
            this.hasRole(complianceRole, address),
            this.hasRole(inventoryRole, address),
            this.hasRole(adminRole, address),
        ]);

        return {
            address,
            balance,
            isWhitelisted,
            roles: {
                compliance: hasComplianceRole,
                inventoryManager: hasInventoryRole,
                admin: hasAdminRole,
            },
        };
    }
}

// Export singleton instance
export const stockTokenRepository = new StockTokenRepository();
