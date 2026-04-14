import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Department } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private readonly baseUrl = `${environment.baseUrl}/Departments`;

  constructor(private readonly http: HttpClient) { }

  getAll(): Observable<Department[]> {
    return this.http
      .get<Department[]>(this.baseUrl)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to load departments.')));
  }

  getById(id: number): Observable<Department> {
    return this.http
      .get<Department>(`${this.baseUrl}/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to load department details.')));
  }

  addCourses(departmentId: number, courseIds: number[]): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/${departmentId}/courses`, courseIds)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to add courses.')));
  }

  removeCourses(departmentId: number, courseIds: number[]): Observable<void> {
    return this.http
      .request<void>('delete', `${this.baseUrl}/${departmentId}/courses`, {
        body: courseIds
      })
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to remove courses.')));
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
