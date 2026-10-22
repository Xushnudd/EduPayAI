import { getStudent, updateStudent } from "@/services/students";
import { dataResponse, handle, jsonBody, studentDto } from "@/lib/api-response";
import { idSchema, studentPatchSchema } from "@/lib/validation";
type Context = { params: Promise<{ id: string }> };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: Context) { return handle(async () => dataResponse(studentDto(await getStudent(idSchema.parse((await context.params).id))))); }
export async function PATCH(request: Request, context: Context) { return handle(async () => dataResponse(studentDto(await updateStudent(idSchema.parse((await context.params).id), studentPatchSchema.parse(await jsonBody(request)))))); }
export async function DELETE(_request: Request, context: Context) { return handle(async () => { const { deleteStudent } = await import("@/services/students"); await deleteStudent(idSchema.parse((await context.params).id)); return new Response(null, { status: 204 }); }); }
