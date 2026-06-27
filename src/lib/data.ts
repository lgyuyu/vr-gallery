import { prisma } from "./prisma";
import type {
  OrganizationData,
  StudentData,
  PaintingData,
  StudentWithPaintings,
  GalleryStyle,
} from "./types";

export async function getOrganization(): Promise<OrganizationData | null> {
  const org = await prisma.organization.findFirst();
  if (!org) return null;
  return {
    id: org.id,
    name: org.name,
    logo: org.logo,
    subtitle: org.subtitle,
    style: org.style as GalleryStyle,
  };
}

export async function getAllStudents(): Promise<
  (StudentData & { paintingCount: number; coverImage: string | null })[]
> {
  const students = await prisma.student.findMany({
    include: {
      paintings: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });
  return students.map((s) => ({
    id: s.id,
    name: s.name,
    age: s.age,
    className: s.className,
    bio: s.bio,
    style: s.style as GalleryStyle | null,
    orgId: s.orgId,
    paintingCount: s.paintings.length,
    coverImage: s.paintings[0]?.imageUrl ?? null,
  }));
}

export async function getStudentWithPaintings(
  studentId: string
): Promise<StudentWithPaintings | null> {
  const s = await prisma.student.findUnique({
    where: { id: studentId },
    include: { paintings: { orderBy: { order: "asc" } } },
  });
  if (!s) return null;
  return {
    id: s.id,
    name: s.name,
    age: s.age,
    className: s.className,
    bio: s.bio,
    style: s.style as GalleryStyle | null,
    orgId: s.orgId,
    paintings: s.paintings.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      createdAt: p.createdAt,
      imageUrl: p.imageUrl,
      thumbnailUrl: p.thumbnailUrl,
      order: p.order,
      studentId: p.studentId,
    })),
  };
}
