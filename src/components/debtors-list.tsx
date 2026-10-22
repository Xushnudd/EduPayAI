import Link from "next/link";
import type { DebtorView } from "@/lib/ui-api";
import { formatMoney } from "@/lib/ui-format";
import { UIState } from "./ui-state";

export function DebtorsList({ debtors }: { debtors: DebtorView[] }) {
  if (!debtors.length) return <UIState kind="empty" message="Ushbu oyda qarzdorlar yo‘q." />;
  return <div className="debtor-list" aria-label="Qarzdor o‘quvchilar">
    {debtors.map(debtor => <article className="debtor-card" key={debtor.studentId}>
      <div className="debtor-heading"><div><h2>{debtor.name}</h2><p>{debtor.groupName} · {debtor.phone}</p></div><strong className="debt-value">{formatMoney(debtor.debt)}</strong></div>
      <dl className="debtor-breakdown">
        <div><dt>Oylik to‘lov</dt><dd>{formatMoney(debtor.monthlyFee)}</dd></div>
        <div><dt>To‘langan</dt><dd>{formatMoney(debtor.paidTotal)}</dd></div>
        <div><dt>Qoldiq qarz</dt><dd>{formatMoney(debtor.debt)}</dd></div>
      </dl>
      <Link className="button secondary" href={`/payments/new?studentId=${encodeURIComponent(debtor.studentId)}`}>To‘lov kiritish</Link>
    </article>)}
  </div>;
}
