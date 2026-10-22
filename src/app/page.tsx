import { DebtorDashboard } from "@/components/debtor-dashboard";
import { currentMonth } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default function Home() {
  return <DebtorDashboard initialMonth={currentMonth()} />;
}
