export class CurrencyUtil {

  convertPriceETHToTNT(price: bigint): bigint {
    return price / BigInt(10 ** 7);
  }
}
