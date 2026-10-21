import { getPrisma } from "@/lib/prisma";
import { studentSchema } from "@/lib/validation";
export async function listStudents() { return getPrisma().student.findMany({ orderBy: [{ name: "asc" }, { id: "asc" }] }); }
export async function createStudent(input: unknown) { return getPrisma().student.create({ data: studentSchema.parse(input) }); }
