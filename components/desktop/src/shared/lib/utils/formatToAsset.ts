export function formatToAsset(amount: string | number, currency: string, precision=4): string {
  const formattedAmount = (typeof amount === 'number' ? amount : parseFloat(amount)).toFixed(precision);
  return `${formattedAmount} ${currency}`;
}
