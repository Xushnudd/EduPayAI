import { getPrisma } from "@/lib/prisma";
import { studentSchema } from "@/lib/validation";
export async function listStudents() { return getPrisma().student.findMany({ orderBy: [{ name: "asc" }, { id: "asc" }] }); }
export async function createStudent(input: unknown) { return getPrisma().student.create({ data: studentSchema.parse(input) }); }

export async function getStudent(id: string) { return getPrisma().student.findUniqueOrThrow({ where: { id } }); }
export async function updateStudent(id: string, data: import("@prisma/client").Prisma.StudentUpdateInput) { return getPrisma().student.update({ where: { id }, data }); }
export async function deleteStudent(id: string) { await getPrisma().student.delete({ where: { id } }); }
