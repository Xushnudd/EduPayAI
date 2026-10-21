"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uiRequest } from "@/lib/ui-api";
export function DeleteStudentDialog({ id, name }: { id: string; name: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  const [pending,setPending] = useState(false);
  const [error,setError] = useState("");
  const router = useRouter();
  async function remove() {
    if (busy.current) return;
    busy.current = true; setPending(true); setError("");
    try { await uiRequest(`/api/students/${id}`, { method: "DELETE" }); dialog.current?.close(); router.push("/students"); }
    catch(e) { setError(e instanceof Error ? e.message : "O‘chirishda xato."); }
    finally { busy.current = false; setPending(false); }
  }
  return <><button ref={trigger} type="button" className="button danger" onClick={() => { setError(""); dialog.current?.showModal(); cancel.current?.focus(); }}>O‘quvchini o‘chirish</button><dialog ref={dialog} aria-labelledby="delete-title" aria-describedby="delete-description" onCancel={e => { if (busy.current) e.preventDefault(); }} onClose={() => trigger.current?.focus()}><h2 id="delete-title">O‘quvchini o‘chirish?</h2><p id="delete-description">{name} va uning barcha to‘lovlar tarixi o‘chiriladi. Bu amalni qaytarib bo‘lmaydi.</p>{error && <p role="alert" className="field-error">{error}</p>}<div className="actions"><button ref={cancel} type="button" className="button secondary" disabled={pending} onClick={() => dialog.current?.close()}>Bekor qilish</button><button type="button" className="button danger" disabled={pending} onClick={() => void remove()}>{pending ? "O‘chirilmoqda…" : "Ha, o‘chirish"}</button></div></dialog></>;
}
