/** Server-side callers only. Never forward these values to client components. */
export function databaseUrl(name: "DATABASE_URL" | "TEST_DATABASE_URL" = "DATABASE_URL"): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} sozlanmagan.`);
  try {
    const url = new URL(value);
    if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname || url.pathname.length < 2) throw new Error();
  } catch {
    throw new Error(`${name} haqiqiy PostgreSQL URL bo‘lishi kerak.`);
  }
  return value;
}
