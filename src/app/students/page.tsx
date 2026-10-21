"use client";
import { useCallback, useEffect, useState } from "react";
import { StudentForm } from "@/components/student-form";
import { StudentList } from "@/components/student-list";
import { UIState } from "@/components/ui-state";
import { uiRequest, type StudentView } from "@/lib/ui-api";
export default function StudentsPage() {
  const [students,setStudents] = useState<StudentView[] | null>(null);
  const [error,setError] = useState("");
  const load = useCallback((signal?: AbortSignal) => uiRequest<StudentView[]>("/api/students", { signal }).then(data => { setError(""); setStudents(data); }).catch(e => { if (!(e instanceof Error && e.name === "AbortError")) setError(e instanceof Error ? e.message : "Xato yuz berdi."); }), []);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); },[load]);
  return <><h1>O‘quvchilar</h1><p className="subtitle">O‘quvchilar ma’lumotlari va oylik to‘lovlarini boshqaring.</p><div className="two-column"><section className="panel"><h2>O‘quvchilar ro‘yxati</h2>{error ? <UIState kind="error" message={error} onRetry={() => void load()} /> : students ? <StudentList students={students} /> : <UIState kind="loading" />}</section><section className="panel"><h2>Yangi o‘quvchi</h2><StudentForm onSaved={() => void load()} /></section></div></>;
}
