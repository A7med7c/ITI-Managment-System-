import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Student, StudentPayload, StudentsResponse } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/students`;
  private readonly studentsState = signal<Student[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly queryState = signal({
    page: 1,
    pageSize: 5,
    search: ''
  });
  private loadRequestId = 0;

  readonly students = this.studentsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly hasStudents = computed(() => this.studentsState().length > 0);

  clearError(): void {
    this.errorState.set(null);
  }

  loadStudents(page = 1, pageSize = 5, search = ''): void {
    const requestId = ++this.loadRequestId;
    this.queryState.set({ page, pageSize, search });
    this.loadingState.set(true);
    this.errorState.set(null);

    this.fetchStudents(page, pageSize, search)
      .pipe(
        finalize(() => {
          if (requestId === this.loadRequestId) {
            this.loadingState.set(false);
          }
        })
      )
      .subscribe({
        next: (students: Student[]) => {
          if (requestId !== this.loadRequestId) {
            return;
          }

          this.studentsState.set(students);
        },
        error: (error: Error) => {
          if (requestId !== this.loadRequestId) {
            return;
          }

          this.errorState.set(error.message);
        }
      });
  }

  refreshStudents(): void {
    const query = this.queryState();
    this.loadStudents(query.page, query.pageSize, query.search);
  }

  getAll(page = 1, pageSize = 5, search = ''): Observable<Student[]> {
    return this.fetchStudents(page, pageSize, search);
  }

  getById(id: number): Observable<Student> {
    return this.http
      .get<Student>(`${this.baseUrl}/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to load student details.')));
  }

  create(student: StudentPayload): Observable<Student> {
    this.errorState.set(null);

    return this.http
      .post<Student>(this.baseUrl, student)
      .pipe(
        tap((createdStudent: Student) => {
          this.studentsState.update((students: Student[]) => [createdStudent, ...students]);
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to create student.'))
      );
  }

  update(id: number, student: StudentPayload): Observable<void> {
    this.errorState.set(null);

    return this.http
      .put<void>(`${this.baseUrl}/${id}`, student)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to update student.')));
  }

  delete(id: number): Observable<void> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(
        tap(() => {
          this.studentsState.update((students: Student[]) =>
            students.filter((studentItem: Student) => studentItem.stId !== id)
          );
        }),
        finalize(() => this.loadingState.set(false)),
        catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to delete student.'))
      );
  }

  private fetchStudents(page = 1, pageSize = 5, search = ''): Observable<Student[]> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http
      .get<StudentsResponse | Student[]>(this.baseUrl, { params })
      .pipe(
        map((response: StudentsResponse | Student[]) =>
          Array.isArray(response) ? response : response.data ?? []
        )
      )
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to load students.')));
  }

  private handleError(error: HttpErrorResponse, fallbackMessage: string): Observable<never> {
    const apiErrorMessage =
      typeof error.error === 'string'
        ? error.error
        : error.error?.message || error.error?.title;

    const message =
      apiErrorMessage ||
      error.message ||
      fallbackMessage;

    this.errorState.set(message);

    return throwError(() => new Error(message));
  }
}
