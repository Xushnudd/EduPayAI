"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StudentForm } from "./student-form";
import { DeleteStudentDialog } from "./delete-student-dialog";
import { UIState } from "./ui-state";
import { uiRequest, type StudentView } from "@/lib/ui-api";
export function StudentDetail({ id }: { id: string }) {
  const [student,setStudent] = useState<StudentView | null>(null);
  const [error,setError] = useState("");
  const load = useCallback((signal?: AbortSignal) => uiRequest<StudentView>(`/api/students/${id}`, { signal }).then(s => { setStudent(s); setError(""); }).catch(e => { if (e.name !== "AbortError") setError(e.message); }),[id]);
  useEffect(() => { const c = new AbortController(); void load(c.signal); return () => c.abort(); }, [load]);
  if(error) return <UIState kind="error" message={error} onRetry={() => void load()} />;
  if(!student) return <UIState kind="loading" />;
  return <><Link href="/students" className="button secondary">← O‘quvchilar</Link><h1 className="mt-6">{student.name}</h1><p className="subtitle">O‘quvchi ma’lumotlarini tahrirlash</p><section className="panel max-w-2xl"><StudentForm key={student.id} student={student} onSaved={setStudent} /><div className="actions"><Link className="button secondary" href={`/payments/new?studentId=${id}`}>To‘lov kiritish</Link><DeleteStudentDialog id={id} name={student.name} /></div></section></>;
}
