import { Decimal } from "decimal.js";
// PostgreSQL money columns have 14 digits; aggregation may exceed that.
export const Money = Decimal.clone({ precision: 40 });
export function moneyString(value: Decimal.Value): string { return new Money(value).toFixed(2); }
export function debtAmount(fee: Decimal.Value, paid: Decimal.Value): Decimal { return new Money(fee).minus(paid); }
