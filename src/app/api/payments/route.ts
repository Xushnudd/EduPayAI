import { createPayment } from "@/services/payments";
import { dataResponse, handle, jsonBody, paymentDto } from "@/lib/api-response";
export const runtime = "nodejs";
export async function POST(request: Request) { return handle(async () => dataResponse(paymentDto(await createPayment(await jsonBody(request))), 201)); }
