"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <><a className="skip-link" href="#main-content">Asosiy qismga o‘tish</a><header className="app-header"><div className="header-inner"><Link className="brand" href="/" aria-label="EduPay bosh sahifa"><span className="brand-mark">E</span>EduPay</Link><nav aria-label="Asosiy navigatsiya">{[["/", "Qarzdorlar"], ["/students", "O‘quvchilar"], ["/payments/new", "To‘lov kiritish"]].map(([href, label]) => <Link key={href} href={href} aria-current={(href === "/" ? pathname === href : pathname.startsWith(href)) ? "page" : undefined}>{label}</Link>)}</nav></div></header><main id="main-content" tabIndex={-1} className="page-container">{children}</main><footer className="page-footer">EduPay · O‘quv markazi to‘lovlari</footer></>;
}
