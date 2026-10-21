import { z } from "zod";
const text = z.string().trim().min(1, "Majburiy maydon.").max(100, "100 belgidan oshmasin.");
export const moneySchema = z.string().regex(/^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/, "Musbat summa, ko‘pi bilan 2 kasr xonasi.").refine(v => /[1-9]/.test(v), "Summa noldan katta bo‘lsin.");
export const idSchema = z.uuid("UUID noto‘g‘ri.");
export const monthSchema = z.string().regex(/^(?!0000)\d{4}-(0[1-9]|1[0-2])$/, "Oy YYYY-MM formatida bo‘lsin.");
export const dateSchema = z.string().regex(/^(?!0000)\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, "Sana YYYY-MM-DD formatida bo‘lsin.").refine(value => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Haqiqiy kalendar sanasini kiriting.");
const phone = z.string().trim().transform(v => v.replace(/[\s()\-]/g, "")).pipe(z.string().regex(/^\+?\d{7,15}$/, "Telefon 7–15 raqamdan iborat bo‘lsin."));
export const studentSchema = z.object({ name: text, phone, groupName: text, monthlyFee: moneySchema }).strict();
export const studentPatchSchema = studentSchema.partial().refine(v => Object.keys(v).length > 0, "Kamida bitta maydon yuboring.");
export const paymentSchema = z.object({ studentId: idSchema, amount: moneySchema, paidOn: dateSchema }).strict();
