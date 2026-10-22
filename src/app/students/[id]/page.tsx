import { notFound } from "next/navigation";
import { StudentDetail } from "@/components/student-detail";
import { idSchema } from "@/lib/validation";
export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  return <StudentDetail key={id} id={id} />;
}
