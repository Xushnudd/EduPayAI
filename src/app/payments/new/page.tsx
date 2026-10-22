import { PaymentForm } from "@/components/payment-form";
import { todayTashkent } from "@/lib/dates";
export const dynamic = "force-dynamic";
export default async function NewPaymentPage({ searchParams }: { searchParams: Promise<{ studentId?: string | string[] }> }) {
  const { studentId } = await searchParams;
  return <><h1>Yangi to‘lov</h1><p className="subtitle">O‘quvchining to‘lov summasi va sanasini kiriting.</p><section className="panel max-w-2xl"><PaymentForm selectedStudentId={typeof studentId === "string" ? studentId : undefined} today={todayTashkent()} /></section></>;
}
