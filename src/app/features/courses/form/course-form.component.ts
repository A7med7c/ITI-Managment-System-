import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { CreateCoursePayload, UpdateCoursePayload } from '../../../core/models/course.model';
import { Department } from '../../../core/models/department.model';
import { CourseService } from '../../../core/services/course.service';
import { DepartmentService } from '../../../core/services/department.service';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-form.component.html'
})
export class CourseFormComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private redirectTimeoutId: ReturnType<typeof setTimeout> | null = null;

  loading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  courseId?: number;
  departments: Department[] = [];

  readonly form = this.formBuilder.group({
    courseId: [null as number | null, [Validators.required, Validators.min(1)]],
    courseName: ['', [Validators.required, Validators.minLength(2)]],
    departmentId: [null as number | null, [Validators.required]]
  });

  constructor(
    private readonly courseService: CourseService,
    private readonly departmentService: DepartmentService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!idParam;
    this.courseId = idParam ? Number(idParam) : undefined;

    if (this.isEditMode) {
      this.form.controls.courseId.clearValidators();
      this.form.controls.courseId.updateValueAndValidity();
    }

    this.loading = true;
    this.errorMessage = '';

    if (this.isEditMode && this.courseId) {
      forkJoin({
        departments: this.departmentService.getAll(),
        course: this.courseService.getById(this.courseId)
      })
        .pipe(finalize(() => {
          this.loading = false;
        }))
        .subscribe({
          next: ({ departments, course }) => {
            this.departments = departments;
            this.form.patchValue({
              courseId: course.courseId,
              courseName: course.courseName,
              departmentId: course.departmentId
            });
          },
          error: (error: Error) => {
            this.errorMessage = error.message;
          }
        });

      return;
    }

    this.departmentService.getAll()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (departments) => {
          this.departments = departments;
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
        }
      });
  }

  ngOnDestroy(): void {
    this.clearRedirectTimeout();
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const rawValue = this.form.getRawValue();
    const departmentId = rawValue.departmentId;

    if (departmentId === null) {
      this.loading = false;
      this.errorMessage = 'Department is required.';
      return;
    }

    if (this.isEditMode && this.courseId) {
      const payload: UpdateCoursePayload = {
        courseName: rawValue.courseName ?? '',
        departmentId
      };

      this.courseService.update(this.courseId, payload)
        .pipe(finalize(() => {
          this.loading = false;
        }))
        .subscribe({
          next: () => {
            this.successMessage = 'Course updated successfully. Redirecting...';
            this.scheduleListRedirect('/courses');
          },
          error: (error: Error) => {
            this.errorMessage = error.message;
          }
        });

      return;
    }

    const newCourseId = rawValue.courseId;
    if (newCourseId === null) {
      this.loading = false;
      this.errorMessage = 'Course ID is required.';
      return;
    }

    const payload: CreateCoursePayload = {
      courseId: newCourseId,
      courseName: rawValue.courseName ?? '',
      departmentId
    };

    this.courseService.create(payload)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'Course created successfully. Redirecting...';
          this.scheduleListRedirect('/courses');
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
        }
      });
  }

  onCancel(): void {
    this.clearRedirectTimeout();
    this.router.navigate(['/courses']);
  }

  private scheduleListRedirect(route: string): void {
    this.clearRedirectTimeout();
    this.redirectTimeoutId = setTimeout(() => {
      this.router.navigate([route]);
    }, 1200);
  }

  private clearRedirectTimeout(): void {
    if (this.redirectTimeoutId !== null) {
      clearTimeout(this.redirectTimeoutId);
      this.redirectTimeoutId = null;
    }
  }
}
