import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
      console.error('Errore nel parsing del token JWT dal localStorage:', error);
      localStorage.removeItem('currentUser'); // Elimina il token malformato
      this.currentUserSubject = new BehaviorSubject<any>(null);
    }
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>('https://localhost:7117/api/Users/login', { email, password })
      .pipe(map(user => {
        if (user && user.token) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return user;
      }));
  }

  register(username: string, email: string, password: string, role: string): Observable<any> {
    return this.http.post<any>('https://localhost:7117/api/Users/register', { username, email, password, role })
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
    return !!token; // Ritorna true se il token esiste, altrimenti false
  }

  logout(): void {
    localStorage.removeItem('currentUser'); // Rimuovi il token o i dati dell'utente
    this.currentUserSubject.next(null); // Resetta lo stato dell'utente corrente
  }

  getToken(): string | null {
    return this.currentUserValue?.token || null;
  }

  // Estrai il ruolo dal token decodificato
  getRoleFromToken(): string | null {
    const token = this.getToken(); // Recupera il token
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica il payload del token
      console.log('Token decodificato:', payload); // Log del token decodificato

      const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      console.log('Ruolo estratto:', role); // Verifica se il ruolo viene estratto
      return role || null; // Ritorna il ruolo se presente
    }
    console.log('Nessun token presente'); // Se non esiste token, stampalo
    return null;
  }

  // Estrai l'ID utente dal token
  getUserId(): string | null {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica il payload del token
      console.log('Payload del token:', payload); // Log del payload

      return payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]; // Assume che il JWT contenga il `nameidentifier` come ID utente
    }
    return null;
  }
}
