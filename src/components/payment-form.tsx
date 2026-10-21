"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { paymentSchema } from "@/lib/validation";
import { UIError, uiRequest, type StudentView } from "@/lib/ui-api";
import { UIState } from "./ui-state";
export function PaymentForm({ selectedStudentId = "", today }: { selectedStudentId?: string; today: string }) {
  const [students,setStudents] = useState<StudentView[] | null>(null);
  const [loadError,setLoadError] = useState("");
  const [fields,setFields] = useState<Record<string,string>>({});
  const [message,setMessage] = useState("");
  const [savedStudent,setSavedStudent] = useState("");
  const [pending,setPending] = useState(false);
  const busy = useRef(false);
  const load = useCallback((signal?: AbortSignal) => uiRequest<StudentView[]>("/api/students", { signal }).then(data => { setStudents(data); setLoadError(""); }).catch(e => { if(e.name !== "AbortError") setLoadError(e.message); }), []);
  useEffect(() => { const c = new AbortController(); void load(c.signal); return () => c.abort(); }, [load]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(busy.current) return;
    const form = event.currentTarget;
    const result = paymentSchema.safeParse(Object.fromEntries(new FormData(form)));
    setFields({}); setMessage(""); setSavedStudent("");
    if (!result.success) { setFields(Object.fromEntries(result.error.issues.map(i => [i.path.join("."),i.message]))); return; }
    busy.current=true; setPending(true);
    try {
      await uiRequest("/api/payments", { method:"POST", body: JSON.stringify(result.data) });
      setMessage("To‘lov saqlandi."); setSavedStudent(result.data.studentId);
      const amount = form.elements.namedItem("amount"); if(amount instanceof HTMLInputElement) amount.value="";
    } catch(e) { setMessage(e instanceof Error ? e.message : "To‘lov saqlanmadi."); if(e instanceof UIError) setFields(e.fields); }
    finally { busy.current=false; setPending(false); }
  }
  if(loadError) return <UIState kind="error" message={loadError} onRetry={() => void load()} />;
  if(!students) return <UIState kind="loading" />;
  if(!students.length) return <><UIState kind="empty" message="To‘lov kiritish uchun avval o‘quvchi qo‘shing." /><Link className="button mt-4" href="/students">O‘quvchi qo‘shish</Link></>;
  const preselected = students.some(s => s.id === selectedStudentId) ? selectedStudentId : "";
  return <form noValidate onSubmit={submit} aria-label="To‘lov kiritish formasi">
    {selectedStudentId && !preselected && <p className="note">Tanlangan o‘quvchi topilmadi. Ro‘yxatdan o‘quvchi tanlang.</p>}
    <div className="field"><label htmlFor="payment-student">O‘quvchi</label><select id="payment-student" name="studentId" defaultValue={preselected} required aria-invalid={!!fields.studentId} aria-describedby={fields.studentId ? "studentId-error" : undefined}><option value="">O‘quvchini tanlang</option>{students.map(s => <option value={s.id} key={s.id}>{s.name} · {s.groupName}</option>)}</select><span id="studentId-error" className="field-error">{fields.studentId}</span></div>
    <div className="field"><label htmlFor="payment-amount">Summa (so‘m)</label><input id="payment-amount" name="amount" inputMode="decimal" required placeholder="Masalan, 500000.00" aria-invalid={!!fields.amount} aria-describedby={fields.amount ? "amount-error" : undefined} /><span id="amount-error" className="field-error">{fields.amount}</span></div>
    <div className="field"><label htmlFor="payment-date">To‘lov sanasi</label><input id="payment-date" name="paidOn" type="date" defaultValue={today} min="0001-01-01" max="9999-12-31" required aria-invalid={!!fields.paidOn} aria-describedby={fields.paidOn ? "paidOn-error" : "payment-date-help"} /><span id="paidOn-error" className="field-error">{fields.paidOn}</span><p id="payment-date-help" className="text-sm text-slate-600">To‘lov tanlangan sananing oyiga hisoblanadi.</p></div>
    {message && <p role="status" className={savedStudent ? "success" : "field-error"}>{message}</p>}
    <div className="actions"><button type="submit" className="button" disabled={pending}>{pending ? "Saqlanmoqda…" : "To‘lovni saqlash"}</button>{savedStudent && <Link className="button secondary" href={`/students/${savedStudent}`}>O‘quvchi sahifasi</Link>}</div>
  </form>;
}
