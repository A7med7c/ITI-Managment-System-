import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Course } from '../../../core/models/course.model';
import { Department } from '../../../core/models/department.model';
import { CourseService } from '../../../core/services/course.service';
import { DepartmentService } from '../../../core/services/department.service';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-list.component.html'
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  departments: Department[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly courseService: CourseService,
    private readonly departmentService: DepartmentService
  ) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      courses: this.courseService.getAll(),
      departments: this.departmentService.getAll()
    }).subscribe({
      next: ({ courses, departments }) => {
        this.loading = false;
        this.departments = departments;

        const departmentMap = new Map(departments.map((department) => [department.deptId, department.deptName]));
        this.courses = courses.map((course) => ({
          ...course,
          departmentName:
            course.departmentName ??
            (course.departmentId !== null ? departmentMap.get(course.departmentId) ?? 'N/A' : 'N/A')
        }));
      },
      error: (error: Error) => {
        this.loading = false;
        this.errorMessage = error.message;
      }
    });
  }

  deleteCourse(id: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    const confirmed = confirm('Are you sure you want to delete this course?');
    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.courseService.delete(id).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Course deleted successfully.';
        this.loadCourses();
      },
      error: (error: Error) => {
        this.loading = false;
        this.errorMessage = error.message;
      }
    });
  }
}
