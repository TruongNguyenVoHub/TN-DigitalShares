import 'package:intl/intl.dart';

extension CurrencyFormat on double {
  String toVND() {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '₫');
    return formatter.format(this); // profile.vndBalance.toVND() → "1.000.000 ₫"
  }
}