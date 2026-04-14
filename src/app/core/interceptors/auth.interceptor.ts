import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  let token = authService.getToken();
  if (token && authService.isTokenExpired(token)) {
    authService.logout();
    token = '';
  }

  if (isPublicRequest(request)) {
    return next(request);
  }

  const authRequest = token
    ? request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
    : request;

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();

        if (router.url.split('?')[0] !== '/login') {
          router.navigate(['/login'], {
            queryParams: {
              returnUrl: router.url
            }
          });
        }
      }

      return throwError(() => error);
    })
  );
};

function isPublicRequest(request: HttpRequest<unknown>): boolean {
  const url = request.url.toLowerCase();
  return /\/api\/(accounts|acounts)\/(login|register)/.test(url);
}
