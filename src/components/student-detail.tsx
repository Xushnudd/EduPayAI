"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StudentForm } from "./student-form";
import { DeleteStudentDialog } from "./delete-student-dialog";
import { UIState } from "./ui-state";
import { uiRequest, type PaymentView, type StudentView } from "@/lib/ui-api";
import { PaymentList } from "./payment-list";
export function StudentDetail({ id }: { id: string }) {
  const [student,setStudent] = useState<StudentView | null>(null);
  const [error,setError] = useState("");
  const [payments,setPayments] = useState<PaymentView[] | null>(null);
  const [paymentsError,setPaymentsError] = useState("");
  const load = useCallback((signal?: AbortSignal) => uiRequest<StudentView>(`/api/students/${id}`, { signal }).then(s => { setStudent(s); setError(""); }).catch(e => { if (e.name !== "AbortError") setError(e.message); }),[id]);
  useEffect(() => { const c = new AbortController(); void load(c.signal); return () => c.abort(); }, [load]);
  const loadPayments = useCallback((signal?: AbortSignal) => uiRequest<PaymentView[]>(`/api/students/${id}/payments`, { signal }).then(items => { setPayments(items); setPaymentsError(""); }).catch(e => { if (e.name !== "AbortError") setPaymentsError(e.message); }), [id]);
  useEffect(() => { const c = new AbortController(); void loadPayments(c.signal); return () => c.abort(); }, [loadPayments]);
  if(error) return <UIState kind="error" message={error} onRetry={() => void load()} />;
  if(!student) return <UIState kind="loading" />;
  return <><Link href="/students" className="button secondary">← O‘quvchilar</Link><h1 className="mt-6">{student.name}</h1><p className="subtitle">O‘quvchi ma’lumotlarini tahrirlash</p><div className="two-column"><section className="panel"><h2>Ma’lumotlar</h2><StudentForm key={student.id} student={student} onSaved={setStudent} /><div className="actions"><Link className="button secondary" href={`/payments/new?studentId=${id}`}>To‘lov kiritish</Link><DeleteStudentDialog id={id} name={student.name} /></div></section><section className="panel"><h2>To‘lovlar tarixi</h2>{paymentsError ? <UIState kind="error" message={paymentsError} onRetry={() => void loadPayments()} /> : payments ? <PaymentList payments={payments} /> : <UIState kind="loading" message="To‘lovlar yuklanmoqda…" />}</section></div></>;
}
