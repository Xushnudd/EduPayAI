"use client";

export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="panel max-w-2xl" role="alert">
    <h1>Sahifani ochib bo‘lmadi</h1>
    <p className="subtitle">Ma’lumotlar vaqtincha mavjud emas. Qayta urinib ko‘ring.</p>
    <button className="button" type="button" onClick={reset}>Qayta urinish</button>
  </section>;
}
