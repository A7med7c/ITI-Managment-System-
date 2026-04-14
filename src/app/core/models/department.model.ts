import { Course } from './course.model';

export interface Department {
  deptId: number;
  deptName: string;
  deptDesc: string;
  deptLocation: string;
  studentCount: number;
  courses?: Course[];
}
