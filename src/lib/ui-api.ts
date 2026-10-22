export type StudentView = { id: string; name: string; phone: string; groupName: string; monthlyFee: string };
export type PaymentView = { id: string; studentId: string; amount: string; paidOn: string };
export type DebtorView = { studentId: string; name: string; phone: string; groupName: string; monthlyFee: string; paidTotal: string; debt: string };
export type DebtorsView = { month: string; debtors: DebtorView[] };
export class UIError extends Error {
  constructor(message: string, public fields: Record<string, string> = {}) { super(message); }
}
export async function uiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  try { response = await fetch(path, { ...init, cache: "no-store", headers }); }
  catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    const method = (init?.method ?? "GET").toUpperCase();
    if (method === "POST" && path === "/api/payments") {
      throw new UIError("Ulanish uzildi. To‘lov natijasi noma’lum; qayta yuborishdan oldin o‘quvchi tarixini tekshiring.");
    }
    throw new UIError(method === "GET" ? "Ulanish uzildi. Qayta urinib ko‘ring." : "Ulanish uzildi. Natijani tekshirib, kerak bo‘lsa qayta urinib ko‘ring.");
  }
  if (response.status === 204) return undefined as T;
  let body: unknown;
  try { body = await response.json(); }
  catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new UIError("Serverdan tushunarsiz javob keldi.");
  }
  if (!body || typeof body !== "object") throw new UIError("Serverdan tushunarsiz javob keldi.");
  const payload = body as { data?: unknown; error?: { message?: unknown; fields?: unknown } };
  if (!response.ok) {
    const message = typeof payload.error?.message === "string" ? payload.error.message : "So‘rov bajarilmadi.";
    const fields = payload.error?.fields && typeof payload.error.fields === "object" ? payload.error.fields as Record<string, string> : {};
    throw new UIError(message, fields);
  }
  if (!("data" in payload)) throw new UIError("Server javobida ma’lumot topilmadi.");
  return payload.data as T;
}
