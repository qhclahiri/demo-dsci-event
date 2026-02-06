import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  name: string;
  email: string;
  sessionToken?: string;
  expiresAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SESSION_TOKEN_KEY = 'dsci.sessionToken';
  private readonly EXPIRES_AT_KEY = 'dsci.expiresAt';
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/login`, data).pipe(
      tap(response => {
        if (response.sessionToken) {
          this.setSession(response.sessionToken, response.expiresAt || '');
          this.currentUserSubject.next(response);
        }
      })
    );
  }

  me(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${environment.apiBaseUrl}/me`).pipe(
      tap(response => {
        this.currentUserSubject.next(response);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearSession();
        this.currentUserSubject.next(null);
      })
    );
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.SESSION_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private setSession(token: string, expiresAt: string): void {
    sessionStorage.setItem(this.SESSION_TOKEN_KEY, token);
    sessionStorage.setItem(this.EXPIRES_AT_KEY, expiresAt);
  }

  private clearSession(): void {
    sessionStorage.removeItem(this.SESSION_TOKEN_KEY);
    sessionStorage.removeItem(this.EXPIRES_AT_KEY);
  }
}
