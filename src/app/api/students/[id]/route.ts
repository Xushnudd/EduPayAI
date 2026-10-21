import { getStudent, updateStudent } from "@/services/students";
import { dataResponse, handle, jsonBody, studentDto } from "@/lib/api-response";
import { idSchema, studentPatchSchema } from "@/lib/validation";
type Context = { params: Promise<{ id: string }> };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: Context) { return handle(async () => dataResponse(studentDto(await getStudent(idSchema.parse((await context.params).id))))); }
export async function PATCH(request: Request, context: Context) { return handle(async () => dataResponse(studentDto(await updateStudent(idSchema.parse((await context.params).id), studentPatchSchema.parse(await jsonBody(request)))))); }
