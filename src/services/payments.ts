import { getPrisma } from "@/lib/prisma";
import { paymentSchema } from "@/lib/validation";
export async function createPayment(input: unknown) {
  const data = paymentSchema.parse(input);
  return getPrisma().$transaction(async tx => {
    await tx.student.findUniqueOrThrow({ where: { id: data.studentId } });
    return tx.payment.create({ data: { ...data, paidOn: new Date(`${data.paidOn}T00:00:00Z`) } });
  });
}
