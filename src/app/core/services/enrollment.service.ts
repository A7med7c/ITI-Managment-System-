import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AssignDegreePayload {
  studentId: number;
  courseId: number;
  departmentId: number;
  degree: number;
}

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private readonly departmentsBaseUrl = `${environment.baseUrl}/departments`;
  private readonly enrollmentsBaseUrl = `${environment.baseUrl}/enrollments`;

  constructor(private readonly http: HttpClient) { }

  enrollStudents(departmentId: number, courseId: number, studentIds: number[]): Observable<void> {
    return this.http
      .post<void>(`${this.departmentsBaseUrl}/${departmentId}/courses/${courseId}/students`, studentIds)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to enroll students.')));
  }

  assignDegree(data: AssignDegreePayload): Observable<void> {
    return this.http
      .post<void>(`${this.enrollmentsBaseUrl}/assign-degree`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to assign degree.')));
  }

  private handleError(error: HttpErrorResponse, fallbackMessage: string): Observable<never> {
    const message =
      error.error?.message ||
      error.error?.title ||
      error.message ||
      fallbackMessage;

    return throwError(() => new Error(message));
  }
}
