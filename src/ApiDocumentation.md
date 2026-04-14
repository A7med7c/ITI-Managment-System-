# ITI Management API Documentation

## Base URL

`http://localhost:5000/api`

Use this base URL in Angular services, then append each endpoint path (for example, `/students` or `/courses/1`).

## Authentication

This API uses JWT Bearer authentication for protected routes.

1. Call `POST /api/accounts/login` with email and password.
2. Read the `token` value from the response.
3. Send the token in the `Authorization` header for protected endpoints:

```http
Authorization: Bearer <your-jwt-token>
```

Protected endpoints in this API:

- All `Courses` endpoints
- `POST /api/departments/{departmentId}/courses`
- `DELETE /api/departments/{departmentId}/courses`
- `POST /api/departments/{deptId}/courses/{courseId}/students`

> Note: Current controller naming in code may expose auth as `/api/accounts/login` and `/api/accounts/register`. If your backend is unchanged, replace `/api/auth/...` with `/api/accounts/...`.

## Angular JWT HttpInterceptor Example

```typescript
// auth.interceptor.ts
import { HttpInterceptorFn } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("token");

  // Add Authorization only when token exists
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq);
};
```

```typescript
// app.config.ts (Angular 16+)
import { ApplicationConfig } from "@angular/core";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { authInterceptor } from "./auth.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
};
```

## Angular HttpClient Usage Examples

```typescript
// courses.service.ts
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

export interface CourseDto {
  courseId: number;
  courseName: string;
  departmentId: number | null;
  departmentName: string | null;
}

export interface CreateCourseDto {
  courseId: number;
  courseName: string;
  departmentId: number | null;
}

@Injectable({ providedIn: "root" })
export class CoursesService {
  private readonly baseUrl = "http://localhost:5000/api";

  constructor(private http: HttpClient) {}

  // GET example (protected): interceptor adds Bearer token
  getCourses(): Observable<CourseDto[]> {
    return this.http.get<CourseDto[]>(`${this.baseUrl}/courses`);
  }

  // POST example (protected): Content-Type + interceptor Authorization
  createCourse(payload: CreateCourseDto): Observable<CourseDto> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    return this.http.post<CourseDto>(`${this.baseUrl}/courses`, payload, {
      headers,
    });
  }
}
```

## Endpoint Index

| Module            | Method | URL                                                   | Protected |
| ----------------- | ------ | ----------------------------------------------------- | --------- |
| Auth              | POST   | /api/accounts/register                                    | No        |
| Auth              | POST   | /api/accounts/login                                       | No        |
| Students          | GET    | /api/students                                         | No        |
| Students          | GET    | /api/students/{id}                                    | No        |
| Students          | POST   | /api/students                                         | No        |
| Students          | PUT    | /api/students/{id}                                    | No        |
| Students          | DELETE | /api/students/{id}                                    | No        |
| Departments       | GET    | /api/departments                                      | No        |
| Departments       | GET    | /api/departments/{id}                                 | No        |
| Courses           | GET    | /api/courses                                          | Yes       |
| Courses           | GET    | /api/courses/{id}                                     | Yes       |
| Courses           | POST   | /api/courses                                          | Yes       |
| Courses           | PUT    | /api/courses/{id}                                     | Yes       |
| Courses           | DELETE | /api/courses/{id}                                     | Yes       |
| Department-Course | POST   | /api/departments/{departmentId}/courses               | Yes       |
| Department-Course | DELETE | /api/departments/{departmentId}/courses               | Yes       |
| Enrollment        | POST   | /api/departments/{deptId}/courses/{courseId}/students | Yes       |

---

## Auth

### POST /api/accounts/register

**Description:** Register a new user account.

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Content-Type  | application/json | Yes      |
| Authorization | Bearer <token>   | No       |

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "P@ssw0rd!",
  "userName": "newuser",
  "displayName": "New User",
  "phoneNumber": "+201001234567"
}
```

**Response Body (Success - 200)**

```json
{
  "email": "user@example.com",
  "displayName": "New User",
  "token": "eyJhbGciOi..."
}
```

**Status Codes**

| Code | Meaning                             |
| ---- | ----------------------------------- |
| 200  | User registered successfully        |
| 400  | Invalid request data                |
| 401  | Not used for this endpoint normally |
| 404  | Not used for this endpoint normally |

### POST /api/accounts/login

**Description:** Authenticate user and return JWT token.

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Content-Type  | application/json | Yes      |
| Authorization | Bearer <token>   | No       |

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "P@ssw0rd!"
}
```

**Response Body (Success - 200)**

```json
{
  "email": "user@example.com",
  "displayName": "New User",
  "token": "eyJhbGciOi..."
}
```

**Status Codes**

| Code | Meaning                                  |
| ---- | ---------------------------------------- |
| 200  | Login succeeded                          |
| 400  | Invalid request data                     |
| 401  | Invalid credentials                      |
| 404  | User not found (implementation-specific) |

---

## Students

### GET /api/students

**Description:** Get paginated students list. Supports optional query parameters.

Optional query parameters:

- `page` (default: `1`)
- `pageSize` (default: `5`)
- `search` (optional text filter)

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Accept        | application/json | No       |
| Authorization | Bearer <token>   | No       |

**Request Body**

No body.

**Response Body (Success - 200)**

```json
{
  "totalRecords": 24,
  "page": 1,
  "pageSize": 5,
  "data": [
    {
      "stId": 1,
      "fullName": "Ahmed Ali",
      "address": "Cairo",
      "age": 22,
      "departmentName": "SD",
      "supervisorName": "Mona Hassan"
    }
  ]
}
```

**Status Codes**

| Code | Meaning                             |
| ---- | ----------------------------------- |
| 200  | Students returned successfully      |
| 400  | Invalid query parameters            |
| 401  | Not used for this endpoint normally |
| 404  | No students found                   |

### GET /api/students/{id}

**Description:** Get one student by ID.

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Accept        | application/json | No       |
| Authorization | Bearer <token>   | No       |

**Request Body**

No body.

**Response Body (Success - 200)**

```json
{
  "stId": 1,
  "fullName": "Ahmed Ali",
  "address": "Cairo",
  "age": 22,
  "departmentName": "SD",
  "supervisorName": "Mona Hassan"
}
```

**Status Codes**

| Code | Meaning                             |
| ---- | ----------------------------------- |
| 200  | Student returned successfully       |
| 400  | Invalid ID format                   |
| 401  | Not used for this endpoint normally |
| 404  | Student not found                   |

### POST /api/students

**Description:** Create a new student.

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Content-Type  | application/json | Yes      |
| Authorization | Bearer <token>   | No       |

**Request Body**

```json
{
  "stFname": "Ahmed",
  "stLname": "Ali",
  "stAddress": "Cairo",
  "stAge": 22,
  "deptId": 10,
  "stSuper": null
}
```

**Response Body (Success - 201)**

```json
{
  "stId": 31,
  "fullName": "Ahmed Ali",
  "address": "Cairo",
  "age": 22,
  "departmentName": "SD",
  "supervisorName": null
}
```

**Status Codes**

| Code | Meaning                                            |
| ---- | -------------------------------------------------- |
| 201  | Student created successfully                       |
| 400  | Invalid body or validation error                   |
| 401  | Not used for this endpoint normally                |
| 404  | Related entity not found (implementation-specific) |

### PUT /api/students/{id}

**Description:** Update existing student by ID.

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Content-Type  | application/json | Yes      |
| Authorization | Bearer <token>   | No       |

**Request Body**

```json
{
  "stFname": "Ahmed",
  "stLname": "Ali",
  "stAddress": "Alexandria",
  "stAge": 23,
  "deptId": 10,
  "stSuper": 5
}
```

**Response Body (Success - 204)**

No content.

**Status Codes**

| Code | Meaning                             |
| ---- | ----------------------------------- |
| 204  | Student updated successfully        |
| 400  | Invalid body or validation error    |
| 401  | Not used for this endpoint normally |
| 404  | Student not found                   |

### DELETE /api/students/{id}

**Description:** Delete student by ID.

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Accept        | application/json | No       |
| Authorization | Bearer <token>   | No       |

**Request Body**

No body.

**Response Body (Success - 204)**

No content.

**Status Codes**

| Code | Meaning                             |
| ---- | ----------------------------------- |
| 204  | Student deleted successfully        |
| 400  | Invalid ID format                   |
| 401  | Not used for this endpoint normally |
| 404  | Student not found                   |

---

## Departments

### GET /api/departments

**Description:** Get all departments with student count.

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Accept        | application/json | No       |
| Authorization | Bearer <token>   | No       |

**Request Body**

No body.

**Response Body (Success - 200)**

```json
[
  {
    "deptId": 10,
    "deptName": "SD",
    "deptDesc": "Software Development",
    "deptLocation": "Cairo",
    "studentCount": 120
  }
]
```

**Status Codes**

| Code | Meaning                             |
| ---- | ----------------------------------- |
| 200  | Departments returned successfully   |
| 400  | Invalid request                     |
| 401  | Not used for this endpoint normally |
| 404  | No departments found                |

### GET /api/departments/{id}

**Description:** Get department by ID.

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Accept        | application/json | No       |
| Authorization | Bearer <token>   | No       |

**Request Body**

No body.

**Response Body (Success - 200)**

```json
{
  "deptId": 10,
  "deptName": "SD",
  "deptDesc": "Software Development",
  "deptLocation": "Cairo",
  "studentCount": 120
}
```

**Status Codes**

| Code | Meaning                             |
| ---- | ----------------------------------- |
| 200  | Department returned successfully    |
| 400  | Invalid ID format                   |
| 401  | Not used for this endpoint normally |
| 404  | Department not found                |

---

## Courses

### GET /api/courses

**Description:** Get all courses.

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Accept        | application/json | No       |
| Authorization | Bearer <token>   | Yes      |

**Request Body**

No body.

**Response Body (Success - 200)**

```json
[
  {
    "courseId": 1,
    "courseName": "C# Fundamentals",
    "departmentId": 10,
    "departmentName": "SD"
  }
]
```

**Status Codes**

| Code | Meaning                       |
| ---- | ----------------------------- |
| 200  | Courses returned successfully |
| 400  | Invalid request               |
| 401  | Missing/invalid token         |
| 404  | No courses found              |

### GET /api/courses/{id}

**Description:** Get course by ID.

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Accept        | application/json | No       |
| Authorization | Bearer <token>   | Yes      |

**Request Body**

No body.

**Response Body (Success - 200)**

```json
{
  "courseId": 1,
  "courseName": "C# Fundamentals",
  "departmentId": 10,
  "departmentName": "SD"
}
```

**Status Codes**

| Code | Meaning                      |
| ---- | ---------------------------- |
| 200  | Course returned successfully |
| 400  | Invalid ID format            |
| 401  | Missing/invalid token        |
| 404  | Course not found             |

### POST /api/courses

**Description:** Create a new course.

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Content-Type  | application/json | Yes      |
| Authorization | Bearer <token>   | Yes      |

**Request Body**

```json
{
  "courseId": 50,
  "courseName": "Angular",
  "departmentId": 10
}
```

**Response Body (Success - 201)**

```json
{
  "courseId": 50,
  "courseName": "Angular",
  "departmentId": 10,
  "departmentName": "SD"
}
```

**Status Codes**

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 201  | Course created successfully             |
| 400  | Validation error or duplicate course ID |
| 401  | Missing/invalid token                   |
| 404  | Department not found                    |

### PUT /api/courses/{id}

**Description:** Update an existing course.

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Content-Type  | application/json | Yes      |
| Authorization | Bearer <token>   | Yes      |

**Request Body**

```json
{
  "courseName": "Advanced Angular",
  "departmentId": 10
}
```

**Response Body (Success - 204)**

No content.

**Status Codes**

| Code | Meaning                        |
| ---- | ------------------------------ |
| 204  | Course updated successfully    |
| 400  | Validation error               |
| 401  | Missing/invalid token          |
| 404  | Course or department not found |

### DELETE /api/courses/{id}

**Description:** Delete a course by ID.

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Accept        | application/json | No       |
| Authorization | Bearer <token>   | Yes      |

**Request Body**

No body.

**Response Body (Success - 204)**

No content.

**Status Codes**

| Code | Meaning                               |
| ---- | ------------------------------------- |
| 204  | Course deleted successfully           |
| 400  | Course is referenced by other records |
| 401  | Missing/invalid token                 |
| 404  | Course not found                      |

---

## Department-Course Relations

### POST /api/departments/{departmentId}/courses

**Description:** Assign an array of existing course IDs to a department.

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Content-Type  | application/json | Yes      |
| Authorization | Bearer <token>   | Yes      |

**Request Body**

```json
[1, 2, 3]
```

**Response Body (Success - 200)**

```json
{
  "departmentId": 10,
  "assignedCourses": [1, 2, 3]
}
```

**Status Codes**

| Code | Meaning                                  |
| ---- | ---------------------------------------- |
| 200  | Courses assigned successfully            |
| 400  | Empty or invalid `courseIds`             |
| 401  | Missing/invalid token                    |
| 404  | Department or one/more courses not found |

### DELETE /api/departments/{departmentId}/courses

**Description:** Remove an array of course IDs from a department (sets `DepartmentId = null`).

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Content-Type  | application/json | Yes      |
| Authorization | Bearer <token>   | Yes      |

**Request Body**

```json
[1, 2, 3]
```

**Response Body (Success - 204)**

No content.

**Status Codes**

| Code | Meaning                                                |
| ---- | ------------------------------------------------------ |
| 204  | Course associations removed successfully               |
| 400  | Empty `courseIds` or course not assigned to department |
| 401  | Missing/invalid token                                  |
| 404  | Department or one/more courses not found               |

---

## Enrollment

### POST /api/departments/{deptId}/courses/{courseId}/students

**Description:** Enroll students in a specific course under a specific department (many-to-many in `Stud_Course`).

**Request Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Content-Type  | application/json | Yes      |
| Authorization | Bearer <token>   | Yes      |

**Request Body**

```json
[12, 15, 21]
```

**Response Body (Success - 200)**

```json
{
  "courseId": 50,
  "enrolledStudents": [12, 15, 21]
}
```

**Status Codes**

| Code | Meaning                                               |
| ---- | ----------------------------------------------------- |
| 200  | Students enrolled successfully                        |
| 400  | Empty `studentIds` or course is not in the department |
| 401  | Missing/invalid token                                 |
| 404  | Department, course, or one/more students not found    |

---

## Quick Frontend Notes

- Keep the JWT token in `localStorage` or a secure storage strategy.
- Use an interceptor so every protected request automatically includes `Authorization: Bearer <token>`.
- For 401 responses in Angular, redirect users to login and clear the stored token.
