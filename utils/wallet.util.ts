/**
 * Utility function to get wallet address from wagmi (MetaMask) or localStorage (username/password login)
 */
export function getWalletAddress(wagmiAddress: string | undefined): string | null {
  // First, try to get from wagmi (MetaMask connection)
  if (wagmiAddress) {
    return wagmiAddress;
  }

  // If not available, try to get from localStorage (username/password login)
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.walletAddress || null;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
  }

  return null;
}
