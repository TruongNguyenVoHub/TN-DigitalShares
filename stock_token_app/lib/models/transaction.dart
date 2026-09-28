class Transaction {
  final String id;
  final String userId;
  final String? stockSymbol; // Có thể null (nếu là giao dịch nạp/rút VND)
  final double? stockPrice;  // Giá tại thời điểm giao dịch
  final TransactionType type; // Enum loại giao dịch
  final double amountVND;
  final double? amountToken; // Có thể null (nếu chỉ nạp/rút VND)
  final TransactionStatus status; // Enum trạng thái
  final String? txHash; // Mã giao dịch trên Blockchain
  final String? refCode; // Mã giao dịch của VNPay/Ngân hàng
  final DateTime createdAt;

  //contructor
  Transaction({
    required this.id,
    required this.userId,
    required this.stockSymbol,
    required this.stockPrice,
    required this.type,
    required this.amountVND,
    required this.amountToken,
    required this.status,
    required this.txHash,
    required this.refCode,
    required this.createdAt,
  });

  //convert from json to Transaction
  factory Transaction.fromJson(Map<String, dynamic> json){
    return Transaction(
      id: json['id'],
      userId: json['userId'],
      stockSymbol: json['stockSymbol'] as String,
      stockPrice: json['stockPrice'] as double,
      type: json['type'] as TransactionType,
      amountVND: json['amountVND'] as double,
      amountToken: json['amountToken'] as double,
      status: json['status'] as TransactionStatus,
      txHash: json['txHash'],
      refCode: json['refCode'],
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  //convert from Transaction to json
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'stockSymbol': stockSymbol,
      'stockPrice': stockPrice,
      'type': type,
      'amountVND': amountVND,
      'amountToken': amountToken,
      'status': status,
      'txHash': txHash,
      'refCode': refCode,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  
}
//enum -> sử dụng: transaction.type.label
enum TransactionType{
    deposite('DEPOSIT', 'Nạp VND'),
    withdraw('WITHDRAW', 'Rút VND'),
    buyStock('BUY_STOCK', 'Mua Token'),
    sellStock('SELL_STOCK', 'Bán Token'),
    depositTokenOnchain('DEPOSIT_TOKEN_ONCHAIN', 'Nạp Token (On-chain)'),
    withdrawTokenOnchain('WITHDRAW_TOKEN_ONCHAIN', 'Rút Token (On-chain)');

    final String value;
    final String label;
    const TransactionType(this.value, this.label);
}
enum TransactionStatus{
    pending('PENDING', 'Đang xử lý'),
    success('SUCCESS', 'Thành công'),
    failed('FAILED', 'Thất bại');
    final String value;
    final String label;
    const TransactionStatus(this.value, this.label);
}
