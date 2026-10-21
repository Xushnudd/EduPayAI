import { createStudent, listStudents } from "@/services/students";
import { dataResponse, handle, jsonBody, studentDto } from "@/lib/api-response";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() { return handle(async () => dataResponse((await listStudents()).map(studentDto))); }
export async function POST(request: Request) { return handle(async () => dataResponse(studentDto(await createStudent(await jsonBody(request))), 201)); }
