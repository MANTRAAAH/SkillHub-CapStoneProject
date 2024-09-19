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
    return !!token; // Ritorna true se il token esiste, altrimenti false
  }

  logout(): void {
    localStorage.removeItem('currentUser'); // Rimuovi il token o i dati dell'utente
    this.currentUserSubject.next(null); // Resetta lo stato dell'utente corrente
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
      // Decodifica il payload del token
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Errore nel decodificare il token JWT:', error);
      return null;
    }
  }

  getUserFromToken(): any {
    const token = this.getToken(); // Recupera il token dal local storage o BehaviorSubject
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica il payload del token
      console.log('Payload del token:', payload); // Log per vedere cosa c'è dentro il payload

      return {
        userId: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"], // ID utente
        role: payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"], // Ruolo utente
        username: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] // Puoi aggiungere altre proprietà del token qui
      };
    }
    return null;
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
    const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica il payload del token
    console.log('Payload del token:', payload); // Log del payload

    const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    return userId ? parseInt(userId, 10) : null;  // Converti l'ID utente in numero
  }
  return null;
}

}
