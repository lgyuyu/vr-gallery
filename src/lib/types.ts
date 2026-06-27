export type GalleryStyle = "modern" | "cozy";

export interface OrganizationData {
  id: string;
  name: string;
  logo: string | null;
  subtitle: string;
  style: GalleryStyle;
}

export interface StudentData {
  id: string;
  name: string;
  age: string | null;
  className: string | null;
  bio: string | null;
  style: GalleryStyle | null;
  orgId: string;
}

export interface PaintingData {
  id: string;
  title: string | null;
  description: string | null;
  createdAt: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  order: number;
  studentId: string;
}

export interface StudentWithPaintings extends StudentData {
  paintings: PaintingData[];
}

// 有效风格：学生优先，否则机构
export function effectiveStyle(student: StudentData, org: OrganizationData): GalleryStyle {
  return (student.style ?? org.style) as GalleryStyle;
}
