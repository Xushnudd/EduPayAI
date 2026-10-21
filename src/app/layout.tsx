import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "EduPay", description: "O‘quv markazi to‘lovlarini boshqarish" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uz"><body>{children}</body></html>;
}
