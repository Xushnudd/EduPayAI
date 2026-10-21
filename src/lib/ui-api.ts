export type StudentView = { id: string; name: string; phone: string; groupName: string; monthlyFee: string };
export class UIError extends Error {
  constructor(message: string, public fields: Record<string, string> = {}) { super(message); }
}
export async function uiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try { response = await fetch(path, { ...init, cache: "no-store", headers: { "Content-Type": "application/json", ...init?.headers } }); }
  catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new UIError(init?.method && init.method !== "GET" ? "Ulanish uzildi. Qayta yuborishdan oldin ro‘yxatni tekshiring." : "Ulanish uzildi. Qayta urinib ko‘ring.");
  }
  if (response.status === 204) return undefined as T;
  const body = await response.json();
  if (!response.ok) throw new UIError(body.error?.message ?? "So‘rov bajarilmadi.", body.error?.fields);
  return body.data as T;
}
