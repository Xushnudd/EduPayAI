import { listDebtors } from "@/services/debtors";
import { dataResponse, handle } from "@/lib/api-response";
import { monthSchema } from "@/lib/validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return handle(async () => dataResponse(await listDebtors(monthSchema.parse(new URL(request.url).searchParams.get("month"))))); }
