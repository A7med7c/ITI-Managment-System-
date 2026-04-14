import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Course, CreateCoursePayload, UpdateCoursePayload } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly baseUrl = `${environment.baseUrl}/courses`;

  constructor(private readonly http: HttpClient) { }

  getAll(): Observable<Course[]> {
    return this.http
      .get<Course[]>(this.baseUrl)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to load courses.')));
  }

  getById(id: number): Observable<Course> {
    return this.http
      .get<Course>(`${this.baseUrl}/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to load course details.')));
  }

  create(course: CreateCoursePayload): Observable<Course> {
    return this.http
      .post<Course>(this.baseUrl, course)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to create course.')));
  }

  update(id: number, course: UpdateCoursePayload): Observable<void> {
    return this.http
      .put<void>(`${this.baseUrl}/${id}`, course)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to update course.')));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to delete course.')));
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
