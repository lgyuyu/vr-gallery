import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStudentWithPaintings, getOrganization } from "@/lib/data";
import { effectiveStyle } from "@/lib/types";
import GalleryClient from "@/components/gallery/GalleryClient";

interface PageProps {
  params: Promise<{ studentId: string }>;
}

// 预生成元数据（用于微信分享卡片）
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { studentId } = await params;
  const student = await getStudentWithPaintings(studentId);
  const org = await getOrganization();
  if (!student || !org) {
    return { title: "画展" };
  }
  const cover = student.paintings[0]?.imageUrl;
  const title = `${student.name}的线上画展`;
  const description = `${org.name} · 学生作品展示`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: cover ? [{ url: cover }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { studentId } = await params;
  const [student, org] = await Promise.all([
    getStudentWithPaintings(studentId),
    getOrganization(),
  ]);

  if (!student || !org) {
    notFound();
  }

  const style = effectiveStyle(student, org);
  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/gallery/${student.id}`;

  return (
    <GalleryClient
      studentName={student.name}
      studentBio={student.bio}
      paintings={student.paintings}
      style={style}
      orgName={org.name}
      shareUrl={shareUrl}
    />
  );
}
