class PriceData{
    final String symbol;
    final double price;
    final DateTime updateAt;

    PriceData({
        required this.symbol,
        required this.price,
        required this.updateAt,
    });

    //convert from json to PriceData
    factory PriceData.fromJson(Map<String, dynamic> json){
        return PriceData(
            symbol: json['symbol'] as String,
            price: double.parse(json['price'].toString()),
            updateAt: DateTime.parse(json['updateAt'] as String),
        );
    }
    //convert from PriceData to json
    Map<String, dynamic> toJson() {
        return {
            'symbol': symbol,
            'price': price.toString(),
            'updateAt': updateAt.toIso8601String(),
        };
    }
}