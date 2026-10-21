import { listPayments } from "@/services/payments";
import { dataResponse, handle, paymentDto } from "@/lib/api-response";
import { idSchema } from "@/lib/validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) { return handle(async () => dataResponse((await listPayments(idSchema.parse((await context.params).id))).map(paymentDto))); }
