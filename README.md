# ITI Management System (Angular Client)

Single-page Angular application for managing ITI students, departments, courses, and enrollments. The app integrates with a JWT-protected backend API and uses standalone components with an HTTP interceptor.

## Features

- **Authentication**: Login and registration via `/api/accounts/*`, JWT stored in `localStorage`, and automatic redirect to `/login` on 401 responses.
- **Students**: List with pagination/search, create, edit, and delete students.
- **Departments**: List departments, view department details, and assign/remove courses.
- **Courses**: List courses, create, edit, and delete courses.
- **Enrollment**: Assign a degree to a student for a course within a department.
- **UI**: Bootstrap 5 via CDN.

## Routes

Public:
- `/login`
- `/register`
- `/students` (list)

Protected by auth guard:
- `/students/new`
- `/students/edit/:id`
- `/students/:id/edit`
- `/departments`
- `/departments/:id`
- `/courses`
- `/courses/new`
- `/courses/:id/edit`
- `/enrollment`

Fallback:
- `**` → `/not-found`

## API Configuration

The API base URL is configured in `src/environments/environment.ts` and `src/environments/environment.development.ts`:

```
https://localhost:7174/api
```

Update these files to match your backend host and port. Detailed backend endpoints are documented in `src/ApiDocumentation.md`.

## Getting Started

### Prerequisites
- Node.js and npm
- Backend API running and reachable from the browser

### Install
```bash
npm install
```

### Development server
```bash
npm start
```
Open `http://localhost:4200/`.

### Build
```bash
npm run build
```

### Tests
```bash
npm run test
```
