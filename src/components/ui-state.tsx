"use client";
export function UIState({ kind, message, onRetry }: { kind: "loading" | "empty" | "error"; message?: string; onRetry?: () => void }) {
  return <div className={`ui-state ${kind}`} role={kind === "error" ? "alert" : "status"}><p>{message ?? (kind === "loading" ? "Yuklanmoqda…" : kind === "empty" ? "Hozircha ma’lumot yo‘q." : "Ma’lumotlarni olishda xato yuz berdi.")}</p>{kind === "error" && onRetry && <button type="button" className="button secondary" onClick={onRetry}>Qayta urinish</button>}</div>;
}
