import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';

// Khai báo config
export const config = createConfig({
    chains: [sepolia],
    transports: {
        [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
    },
});

declare module 'wagmi' {
    interface Register {
        config: typeof config;
    }
}
