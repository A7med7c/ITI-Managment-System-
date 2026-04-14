import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { CourseFormComponent } from './features/courses/form/course-form.component';
import { CourseListComponent } from './features/courses/list/course-list.component';
import { DepartmentDetailComponent } from './features/departments/detail/department-detail.component';
import { DepartmentListComponent } from './features/departments/list/department-list.component';
import { EnrollmentComponent } from './features/enrollment/enrollment.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { StudentFormComponent } from './features/students/form/student-form.component';
import { StudentListComponent } from './features/students/list/student-list.component';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'students'
	},
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: 'register',
		component: RegisterComponent
	},
	{
		path: 'students',
		component: StudentListComponent,
	},
	{
		path: 'students/new',
		component: StudentFormComponent,
		canActivate: [authGuard]
	},
	{
		path: 'students/edit/:id',
		component: StudentFormComponent,
		canActivate: [authGuard]
	},
	{
		path: 'students/:id/edit',
		component: StudentFormComponent,
		canActivate: [authGuard]
	},
	{
		path: 'departments',
		component: DepartmentListComponent,
		canActivate: [authGuard]
	},
	{
		path: 'departments/:id',
		component: DepartmentDetailComponent,
		canActivate: [authGuard]
	},
	{
		path: 'courses',
		component: CourseListComponent,
		canActivate: [authGuard]
	},
	{
		path: 'courses/new',
		component: CourseFormComponent,
		canActivate: [authGuard]
	},
	{
		path: 'courses/:id/edit',
		component: CourseFormComponent,
		canActivate: [authGuard]
	},
	{
		path: 'enrollment',
		component: EnrollmentComponent,
		canActivate: [authGuard]
	},
	{
		path: 'not-found',
		component: NotFoundComponent
	},
	{
		path: '**',
		redirectTo: 'not-found'
	}
];
