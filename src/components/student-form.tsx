"use client";
import { useRef, useState } from "react";
import { studentSchema } from "@/lib/validation";
import { UIError, uiRequest, type StudentView } from "@/lib/ui-api";
export function StudentForm({ student, onSaved }: { student?: StudentView; onSaved?: (student: StudentView) => void }) {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy.current) return;
    const form = event.currentTarget;
    const parsed = studentSchema.safeParse(Object.fromEntries(new FormData(form)));
    setMessage(""); setFields({});
    if (!parsed.success) { setFields(Object.fromEntries(parsed.error.issues.map(i => [i.path.join("."), i.message]))); return; }
    busy.current = true; setPending(true);
    try {
      const result = await uiRequest<StudentView>(student ? `/api/students/${student.id}` : "/api/students", { method: student ? "PATCH" : "POST", body: JSON.stringify(parsed.data) });
      if (!student) form.reset();
      setMessage("Ma’lumot saqlandi."); onSaved?.(result);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Saqlashda xato."); if (error instanceof UIError) setFields(error.fields); }
    finally { busy.current = false; setPending(false); }
  }
  return <form onSubmit={submit} noValidate aria-label={student ? "O‘quvchini tahrirlash" : "O‘quvchi qo‘shish"}>
    {([ ["name", "Ism", "text"], ["phone", "Telefon", "tel"], ["groupName", "Guruh", "text"], ["monthlyFee", "Oylik to‘lov (so‘m)", "text"] ] as const).map(([name,label,type]) => <div className="field" key={name}><label htmlFor={`student-${name}`}>{label}</label><input id={`student-${name}`} name={name} type={type} inputMode={name === "monthlyFee" ? "decimal" : undefined} defaultValue={student?.[name] ?? ""} maxLength={name === "name" || name === "groupName" ? 100 : undefined} required aria-invalid={!!fields[name]} aria-describedby={fields[name] ? `${name}-error` : undefined} /><span className="field-error" id={`${name}-error`}>{fields[name]}</span></div>)}
    {student && <p className="note">Oylik to‘lov o‘zgarsa, oldingi oylarning qarzi ham yangi tarif bo‘yicha hisoblanadi.</p>}
    {message && <p role="status">{message}</p>}<button className="button" disabled={pending} type="submit">{pending ? "Saqlanmoqda…" : student ? "O‘zgarishlarni saqlash" : "O‘quvchi qo‘shish"}</button>
  </form>;
}
