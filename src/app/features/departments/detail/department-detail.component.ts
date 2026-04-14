import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin, timeout } from 'rxjs';
import { Course } from '../../../core/models/course.model';
import { Department } from '../../../core/models/department.model';
import { CourseService } from '../../../core/services/course.service';
import { DepartmentService } from '../../../core/services/department.service';

@Component({
  selector: 'app-department-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './department-detail.component.html'
})
export class DepartmentDetailComponent implements OnInit {
  departmentId?: number;
  department?: Department;
  allCourses: Course[] = [];
  assignedCourses: Course[] = [];
  availableCourses: Course[] = [];

  selectedToAdd: number[] = [];
  selectedToRemove: number[] = [];

  loading = false;
  actionLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly departmentService: DepartmentService,
    private readonly courseService: CourseService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.departmentId = idParam ? Number(idParam) : undefined;

    if (!this.departmentId) {
      this.errorMessage = 'Invalid department id.';
      return;
    }

    this.loadDepartmentData();
  }

  loadDepartmentData(): void {
    if (!this.departmentId) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    forkJoin({
      department: this.departmentService.getById(this.departmentId),
      courses: this.courseService.getAll()
    })
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: ({ department, courses }) => {
          this.department = department;
          this.allCourses = courses;

          this.assignedCourses =
            department.courses && department.courses.length > 0
              ? department.courses
              : courses.filter((course) => course.departmentId === department.deptId);

          const assignedIds = new Set(this.assignedCourses.map((course) => course.courseId));
          this.availableCourses = courses.filter((course) => !assignedIds.has(course.courseId));
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
        }
      });
  }

  onAddCourseToggle(courseId: number, checked: boolean): void {
    const next = new Set(this.selectedToAdd);

    if (checked) {
      next.add(courseId);
    } else {
      next.delete(courseId);
    }

    this.selectedToAdd = Array.from(next);
  }

  onRemoveCourseToggle(courseId: number, checked: boolean): void {
    const next = new Set(this.selectedToRemove);

    if (checked) {
      next.add(courseId);
    } else {
      next.delete(courseId);
    }

    this.selectedToRemove = Array.from(next);
  }

  addSelectedCourses(): void {
    if (!this.departmentId || this.selectedToAdd.length === 0) {
      return;
    }

    this.actionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.departmentService.addCourses(this.departmentId, this.selectedToAdd).subscribe({
      next: () => {
        this.actionLoading = false;
        this.successMessage = 'Courses added successfully.';
        this.selectedToAdd = [];
        this.loadDepartmentData();
      },
      error: (error: Error) => {
        this.actionLoading = false;
        this.errorMessage = error.message;
      }
    });
  }

  removeSelectedCourses(): void {
    if (!this.departmentId || this.selectedToRemove.length === 0) {
      return;
    }

    this.actionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.departmentService.removeCourses(this.departmentId, this.selectedToRemove).subscribe({
      next: () => {
        this.actionLoading = false;
        this.successMessage = 'Courses removed successfully.';
        this.selectedToRemove = [];
        this.loadDepartmentData();
      },
      error: (error: Error) => {
        this.actionLoading = false;
        this.errorMessage = error.message;
      }
    });
  }

  onBackToDepartments(): void {
    this.router.navigate(['/departments']);
  }
}
