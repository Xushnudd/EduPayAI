import type { PaymentView } from "@/lib/ui-api";
import { formatMoney, formatPaymentDate } from "@/lib/ui-format";
import { UIState } from "./ui-state";

export function PaymentList({ payments }: { payments: PaymentView[] }) {
  if (!payments.length) return <UIState kind="empty" message="Hozircha to‘lovlar kiritilmagan." />;
  return <ol className="payment-list" aria-label="To‘lovlar tarixi">
    {payments.map(payment => <li className="payment-item" key={payment.id}>
      <time dateTime={payment.paidOn}>{formatPaymentDate(payment.paidOn)}</time>
      <span className="money">{formatMoney(payment.amount)}</span>
    </li>)}
  </ol>;
}
