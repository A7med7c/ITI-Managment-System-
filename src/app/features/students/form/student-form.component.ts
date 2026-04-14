import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { Department } from '../../../core/models/department.model';
import { StudentPayload } from '../../../core/models/student.model';
import { DepartmentService } from '../../../core/services/department.service';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-form.component.html'
})
export class StudentFormComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private redirectTimeoutId: ReturnType<typeof setTimeout> | null = null;

  loading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  studentId?: number;
  departments: Department[] = [];

  readonly form = this.formBuilder.group({
    stFname: ['', [Validators.required, Validators.minLength(2)]],
    stLname: ['', [Validators.required, Validators.minLength(2)]],
    stAddress: ['', [Validators.required, Validators.minLength(2)]],
    stAge: [18, [Validators.required, Validators.min(1)]],
    deptId: [null as number | null, [Validators.required]],
    stSuper: [null as number | null]
  });

  constructor(
    private readonly studentService: StudentService,
    private readonly departmentService: DepartmentService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!idParam;
    this.studentId = idParam ? Number(idParam) : undefined;

    this.loading = true;
    this.errorMessage = '';

    if (this.isEditMode && this.studentId) {
      forkJoin({
        departments: this.departmentService.getAll(),
        student: this.studentService.getById(this.studentId)
      })
        .pipe(finalize(() => {
          this.loading = false;
        }))
        .subscribe({
          next: ({ departments, student }) => {
            this.departments = departments;

            const { firstName, lastName } = this.splitFullName(student.fullName);
            const departmentId =
              student.deptId ??
              departments.find((department) => department.deptName === student.departmentName)?.deptId ??
              null;

            this.form.patchValue({
              stFname: firstName,
              stLname: lastName,
              stAddress: student.address,
              stAge: student.age,
              deptId: departmentId,
              stSuper: student.stSuper ?? null
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
    const departmentId = rawValue.deptId;

    if (departmentId === null) {
      this.loading = false;
      this.errorMessage = 'Department is required.';
      return;
    }

    const payload: StudentPayload = {
      stFname: rawValue.stFname ?? '',
      stLname: rawValue.stLname ?? '',
      stAddress: rawValue.stAddress ?? '',
      stAge: rawValue.stAge ?? 0,
      deptId: departmentId,
      stSuper: rawValue.stSuper ?? null
    };

    if (this.isEditMode && this.studentId) {
      this.studentService.update(this.studentId, payload)
        .pipe(finalize(() => {
          this.loading = false;
        }))
        .subscribe({
          next: () => {
            this.successMessage = 'Student updated successfully. Redirecting...';
            this.scheduleListRedirect('/students');
          },
          error: (error: Error) => {
            this.errorMessage = error.message;
          }
        });

      return;
    }

    this.studentService.create(payload)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'Student created successfully. Redirecting...';
          this.scheduleListRedirect('/students');
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
        }
      });
  }

  onCancel(): void {
    this.clearRedirectTimeout();
    this.router.navigate(['/students']);
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

  private splitFullName(fullName: string): { firstName: string; lastName: string } {
    const trimmed = fullName.trim();
    if (!trimmed) {
      return { firstName: '', lastName: '' };
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }

    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' ')
    };
  }
}
