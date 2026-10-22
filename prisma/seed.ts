import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { databaseUrl } from "../src/lib/env";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl() }) });
async function main() {
  const students = [
    { id: "10000000-0000-4000-8000-000000000001", name: "Ali", monthlyFee: "500000.00", paid: "300000.00" },
    { id: "10000000-0000-4000-8000-000000000002", name: "Vali", monthlyFee: "600000.00", paid: "600000.00" },
    { id: "10000000-0000-4000-8000-000000000003", name: "Sardor", monthlyFee: "450000.00", paid: null },
  ];
  for (const student of students) {
    const { paid, ...data } = student;
    await prisma.student.upsert({ where: { id: data.id }, update: {}, create: { ...data, phone: "+998900000000", groupName: "Demo" } });
    if (paid) {
      const id = data.id.replace(/^1/, "2");
      await prisma.payment.upsert({ where: { id }, update: {}, create: { id, studentId: data.id, amount: paid, paidOn: new Date("2026-10-10T00:00:00Z") } });
    }
  }
  console.log("Demo: 2026-10, Ali / Vali / Sardor. Mavjud yozuvlar saqlandi.");
}
main().catch(() => { console.error("Seed bajarilmadi. DB sozlamalarini tekshiring."); process.exitCode = 1; }).finally(() => prisma.$disconnect());
