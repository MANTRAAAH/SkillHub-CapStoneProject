import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    const userJson = localStorage.getItem('currentUser');
    try {
      this.currentUserSubject = new BehaviorSubject<any>(userJson ? JSON.parse(userJson) : null);
    } catch (error) {
      localStorage.removeItem('currentUser');
      this.currentUserSubject = new BehaviorSubject<any>(null);
    }
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:7117/api/Users/login', { email, password })
      .pipe(map(user => {
        if (user && user.token) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return user;
      }));
  }

  register(username: string, email: string, password: string, role: string): Observable<any> {
    return this.http.post<any>('http://localhost:7117/api/Users/register', { username, email, password, role })
      .pipe(map(user => {
        if (user && user.token) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return user;
      }));
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('currentUser');
    return !!token;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return this.currentUserValue?.token || null;
  }
  getDecodedToken(): any {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {

      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      return null;
    }
  }

  getUserFromToken(): any {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));

      return {
        userId: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        role: payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
        username: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
      };
    }
    return null;
  }




  getRoleFromToken(): string | null {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));

      const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      return role || null;
    }
    return null;
  }
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }



  // Estrai l'ID utente dal token
getUserId(): number | null {
  const token = this.getToken();
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    return userId ? parseInt(userId, 10) : null;
  }
  return null;
}

}
