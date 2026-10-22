"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { monthSchema } from "@/lib/validation";
import { uiRequest, type DebtorsView } from "@/lib/ui-api";
import { MonthPicker } from "./month-picker";
import { DebtorsList } from "./debtors-list";
import { UIState } from "./ui-state";

export function DebtorDashboard({ initialMonth }: { initialMonth: string }) {
  const [month, setMonth] = useState(initialMonth);
  const [data, setData] = useState<DebtorsView | null>(null);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const requestId = useRef(0);
  const validMonth = monthSchema.safeParse(month).success;
  const monthError = validMonth ? "" : "Oy YYYY-MM formatida bo‘lsin.";

  useEffect(() => {
    if (!validMonth) return;
    const controller = new AbortController();
    const id = ++requestId.current;
    void uiRequest<DebtorsView>(`/debtors?month=${encodeURIComponent(month)}`, { signal: controller.signal })
      .then(result => { if (id === requestId.current) { setData(result); setError(""); } })
      .catch(reason => {
        if (reason instanceof Error && reason.name === "AbortError") return;
        if (id === requestId.current) setError(reason instanceof Error ? reason.message : "Qarzdorlarni olishda xato.");
      });
    return () => controller.abort();
  }, [month, retryCount, validMonth]);

  const currentData = data?.month === month ? data : null;
  return <>
    <div className="dashboard-heading"><div><p className="eyebrow">EduPay · oylik nazorat</p><h1>Qarzdorlar</h1><p className="subtitle">Tanlangan oy bo‘yicha to‘lanmagan qoldiqlar.</p></div><Link className="button" href="/payments/new">Yangi to‘lov</Link></div>
    <section className="panel debtor-panel" aria-label="Qarzdorlik hisoboti">
      <MonthPicker month={month} error={monthError} onChange={value => { setMonth(value); setData(null); setError(""); }} />
      {error ? <UIState kind="error" message={error} onRetry={() => setRetryCount(value => value + 1)} /> : !validMonth ? <UIState kind="empty" message="Hisobotni ko‘rish uchun oy tanlang." /> : !currentData ? <UIState kind="loading" message="Qarzdorlik hisoblanmoqda…" /> : <><p className="result-count">{currentData.debtors.length ? `${currentData.debtors.length} nafar qarzdor` : "Natija"} · {currentData.month}</p><DebtorsList debtors={currentData.debtors} /></>}
    </section>
  </>;
}
