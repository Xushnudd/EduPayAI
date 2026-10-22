import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
export const metadata: Metadata = { title: "EduPay", description: "O‘quv markazi to‘lovlarini boshqarish" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uz"><body><AppShell>{children}</AppShell></body></html>;
}
