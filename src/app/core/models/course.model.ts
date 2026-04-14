export interface Course {
  courseId: number;
  courseName: string;
  departmentId: number | null;
  departmentName: string | null;
}

export interface CreateCoursePayload {
  courseId: number;
  courseName: string;
  departmentId: number | null;
}

export interface UpdateCoursePayload {
  courseName: string;
  departmentId: number | null;
}
