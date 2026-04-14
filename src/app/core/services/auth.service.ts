import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;
  private readonly accountsPath = '/accounts';
  private readonly tokenKey = 'token';

  constructor() { }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}${this.accountsPath}/login`, credentials).pipe(
      tap((response: LoginResponse) => {
        const token = this.extractToken(response);
        if (token) {
          this.setToken(token);
        }
      }),
      catchError((error: HttpErrorResponse) =>
        this.handleError(error, 'Login failed. Please verify your credentials.')
      )
    );
  }

  register(data: RegisterRequest): Observable<void> {
    return this.http.post<LoginResponse>(`${this.baseUrl}${this.accountsPath}/register`, data).pipe(
      map(() => undefined),
      catchError((error: HttpErrorResponse) =>
        this.handleError(error, 'Registration failed. Please try again.')
      )
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  getToken(): string {
    return localStorage.getItem(this.tokenKey) ?? '';
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  isTokenExpired(token = this.getToken()): boolean {
    if (!token) {
      return true;
    }

    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return true;
      }

      const decoded = JSON.parse(this.decodeBase64Url(payload));
      const exp = decoded?.exp;
      if (typeof exp !== 'number') {
        return false;
      }

      const nowInSeconds = Math.floor(Date.now() / 1000);
      return exp <= nowInSeconds;
    } catch {
      return true;
    }
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }

      const decoded = JSON.parse(this.decodeBase64Url(payload));
      const role =
        decoded.role ??
        decoded.roles ??
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (Array.isArray(role)) {
        return role[0] ?? null;
      }

      return typeof role === 'string' ? role : null;
    } catch {
      return null;
    }
  }

  private decodeBase64Url(value: string): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const remainder = normalized.length % 4;
    const base64 = remainder ? normalized + '='.repeat(4 - remainder) : normalized;

    return atob(base64);
  }

  private extractToken(response: LoginResponse): string {
    const directToken = response.token ?? response.accessToken ?? response.Token ?? response.AccessToken;
    if (directToken) {
      return directToken;
    }

    const responseEntries = Object.entries(response as Record<string, unknown>);
    for (const [key, value] of responseEntries) {
      if (key.toLowerCase().includes('token') && typeof value === 'string') {
        return value;
      }
    }

    return '';
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

    return throwError(() => new Error(message));
  }
}
