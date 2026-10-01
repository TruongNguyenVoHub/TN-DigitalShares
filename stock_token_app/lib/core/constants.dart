// final response = await _dio.get(ApiEndpoints.getProfile('0x123...'));
class ApiEndpoints {
  // Auth
  static const String login = '/api/auth/login';

  // Stock & Trade
  static const String getStockPrice = '/api/stock/price';
  static const String buyToken = '/api/trade/buy';
  static const String sellToken = '/api/trade/sell';

  // Payment (VND)
  static const String depositVnd = '/api/payment/deposit-vnd';
  static const String withdrawVnd = '/api/payment/withdraw-vnd';

  // KYC
  static const String submitKyc = '/api/user/kyc/submit';

  // --- Dynamic Endpoints (Cần truyền wallet address vào) ---

  // User Profile & Transactions
  static String getProfile(String wallet) => '/api/user/$wallet/profile';
  static String getTransactions(String wallet) => '/api/user/$wallet/transaction';

  // Token Deposit/Withdraw
  static String depositToken(String wallet) => '/api/user/$wallet/deposit-token';
  static String withdrawToken(String wallet) => '/api/user/$wallet/withdraw-token';

  // Wallet Settings
  static String viewPrivateKey(String wallet) => '/api/user/$wallet/view-private-key';
  static String changeWallet(String wallet) => '/api/user/$wallet/change-wallet';
}
