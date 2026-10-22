import { monthSchema } from "./validation";
export function monthRange(input: string): { gte: Date; lt?: Date; lte?: Date } {
  const month = monthSchema.parse(input);
  const gte = new Date(`${month}-01T00:00:00.000Z`);
  if (month === "9999-12") return { gte, lte: new Date("9999-12-31T00:00:00.000Z") };
  const next = new Date(gte);
  next.setUTCMonth(next.getUTCMonth() + 1);
  return { gte, lt: next };
}
export function todayTashkent(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tashkent", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (type: string) => parts.find(p => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function currentMonth(now = new Date()): string { return todayTashkent(now).slice(0, 7); }
