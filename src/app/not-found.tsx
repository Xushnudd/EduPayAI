import Link from "next/link";

export default function NotFound() {
  return <section className="panel max-w-2xl" role="status">
    <h1>Ma’lumot topilmadi</h1>
    <p className="subtitle">Havola noto‘g‘ri yoki o‘quvchi o‘chirilgan bo‘lishi mumkin.</p>
    <Link className="button" href="/students">O‘quvchilar ro‘yxatiga qaytish</Link>
  </section>;
}
