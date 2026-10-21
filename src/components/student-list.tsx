import Link from "next/link";
import type { StudentView } from "@/lib/ui-api";
import { formatMoney } from "@/lib/money";
import { UIState } from "./ui-state";
export function StudentList({ students }: { students: StudentView[] }) {
  if (!students.length) return <UIState kind="empty" message="Hozircha o‘quvchilar yo‘q. Birinchi o‘quvchini qo‘shing." />;
  return <div className="student-list">{students.map(s => <Link className="student-card" key={s.id} href={`/students/${s.id}`}><strong>{s.name}</strong><p>{s.groupName} · {s.phone}</p><span className="money">{formatMoney(s.monthlyFee)} / oy</span></Link>)}</div>;
}
