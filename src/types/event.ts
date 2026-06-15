export interface Event {
  id: number;
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  featuredImage: string;
  galleryImages: string[];
}

export type EventCategory = 
  | "all"
  | "workshop"
  | "bootcamp"
  | "classroom"
  | "special"
  | "student";

export const CATEGORY_LABELS: Record<Exclude<EventCategory, "all">, string> = {
  workshop: "Workshops",
  bootcamp: "Bootcamps",
  classroom: "Classroom Sessions",
  special: "Special Events",
  student: "Student Spotlights"
};