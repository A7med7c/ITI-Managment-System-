import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Course } from '../../core/models/course.model';
import { Department } from '../../core/models/department.model';
import { Student } from '../../core/models/student.model';
import { CourseService } from '../../core/services/course.service';
import { DepartmentService } from '../../core/services/department.service';
import { AssignDegreePayload, EnrollmentService } from '../../core/services/enrollment.service';
import { StudentService } from '../../core/services/student.service';

@Component({
  selector: 'app-enrollment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './enrollment.component.html'
})
export class EnrollmentComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  departments: Department[] = [];
  courses: Course[] = [];
  students: Student[] = [];

  submitting = false;
  errorMessage = '';
  successMessage = '';

  readonly form = this.formBuilder.group({
    studentId: [null as number | null, [Validators.required]],
    courseId: [null as number | null, [Validators.required]],
    departmentId: [null as number | null, [Validators.required]],
    degree: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  constructor(
    private readonly departmentService: DepartmentService,
    private readonly courseService: CourseService,
    private readonly studentService: StudentService,
    private readonly enrollmentService: EnrollmentService
  ) { }

  ngOnInit(): void {
    // Load all dropdown lists when the screen opens.
    this.loadDepartments();
    this.loadCourses();
    this.loadStudents();
  }

  private loadDepartments(): void {
    // Get departments for the department dropdown.
    this.departmentService.getAll().subscribe({
      next: (departments: Department[]) => {
        this.departments = departments;
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    });
  }

  private loadCourses(): void {
    // Get courses for the course dropdown.
    this.courseService.getAll().subscribe({
      next: (courses: Course[]) => {
        this.courses = courses;
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    });
  }

  private loadStudents(): void {
    // Get students for the student dropdown.
    this.studentService.getAll(1, 1000).subscribe({
      next: (students: Student[]) => {
        this.students = students;
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    });
  }

  onSubmit(): void {
    // Clear previous messages before each submit.
    this.errorMessage = '';
    this.successMessage = '';

    // Stop here and show validation messages if form is invalid.
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Read form values and confirm they are not null.
    const studentId = this.form.controls.studentId.value;
    const courseId = this.form.controls.courseId.value;
    const departmentId = this.form.controls.departmentId.value;
    const degree = this.form.controls.degree.value;

    if (studentId === null || courseId === null || departmentId === null || degree === null) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    // Build the payload exactly as the API expects.
    const payload: AssignDegreePayload = {
      studentId,
      courseId,
      departmentId,
      degree
    };

    this.submitting = true;

    // Call the backend endpoint and handle success/error.
    this.enrollmentService.assignDegree(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Degree assigned successfully.';

        // Optional UX step: reset form after successful submit.
        this.form.reset({
          studentId: null,
          courseId: null,
          departmentId: null,
          degree: null
        });
      },
      error: (error: Error) => {
        this.submitting = false;
        this.errorMessage = error.message;
      }
    });
  }
}
