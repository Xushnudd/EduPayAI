import type { Payment, Student } from "@prisma/client";
import { ApiError, errorResponse } from "./errors";
export function studentDto(student: Student) { return { ...student, monthlyFee: student.monthlyFee.toFixed(2) }; }
export function paymentDto(payment: Payment) { return { ...payment, amount: payment.amount.toFixed(2), paidOn: payment.paidOn.toISOString().slice(0, 10) }; }
export function dataResponse(data: unknown, status = 200) { return Response.json({ data }, { status, headers: { "Cache-Control": "no-store" } }); }
export async function jsonBody(request: Request): Promise<unknown> {
  try { return await request.json(); } catch { throw new ApiError(400, "INVALID_JSON", "JSON noto‘g‘ri."); }
}
export async function handle(action: () => Promise<Response>): Promise<Response> {
  try { return await action(); } catch (error) { return errorResponse(error); }
}
