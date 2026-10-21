import { ZodError } from "zod";
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export function errorResponse(error: unknown): Response {
  if (error instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of error.issues) fields[issue.path.join(".") || "form"] = issue.message;
    return Response.json({ error: { code: "VALIDATION_ERROR", message: "Kiritilgan ma’lumotlarni tekshiring.", fields } }, { status: 400 });
  }
  if (error instanceof ApiError) return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (code === "P2025") return errorResponse(new ApiError(404, "NOT_FOUND", "O‘quvchi topilmadi."));
  if (["P2002", "P2003", "P2034"].includes(code)) return errorResponse(new ApiError(409, "CONFLICT", "Ma’lumot o‘zgargan. Qayta tekshiring."));
  if (["P1001", "P1002", "P1017", "P2024", "ECONNREFUSED", "ETIMEDOUT"].includes(code)) return errorResponse(new ApiError(503, "DATABASE_UNAVAILABLE", "Baza vaqtincha mavjud emas."));
  console.error("EduPay request failed", { code: code || "UNKNOWN" });
  return Response.json({ error: { code: "INTERNAL_ERROR", message: "Kutilmagan xato yuz berdi." } }, { status: 500 });
}
