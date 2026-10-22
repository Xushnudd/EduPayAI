import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { monthRange } from "@/lib/dates";
import { debtAmount, moneyString } from "@/lib/money";
export async function listDebtors(month: string) {
  const paidOn = monthRange(month);
  return getPrisma().$transaction(async tx => {
    const students = await tx.student.findMany({ orderBy: [{ name: "asc" }, { id: "asc" }] });
    const totals = await tx.payment.groupBy({ by: ["studentId"], where: { paidOn }, _sum: { amount: true } });
    const paid = new Map(totals.map(t => [t.studentId, t._sum.amount?.toString() ?? "0"]));
    return { month, debtors: students.flatMap(student => {
      const paidTotal = paid.get(student.id) ?? "0";
      const debt = debtAmount(student.monthlyFee.toString(), paidTotal);
      return debt.gt(0) ? [{ studentId: student.id, name: student.name, phone: student.phone, groupName: student.groupName, monthlyFee: student.monthlyFee.toFixed(2), paidTotal: moneyString(paidTotal), debt: debt.toFixed(2) }] : [];
    }) };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
}
