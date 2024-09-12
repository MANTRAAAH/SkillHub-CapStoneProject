import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';  // Assicurati che AuthService sia importato
import { User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:7117/api/users';  // URL API

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Metodo per ottenere il profilo utente
  getUserProfile(): Observable<User> {
    const token = this.authService.getToken();  // Recupera il token dall'AuthService

    if (!token) {
      console.error('Token JWT non trovato. Effettua nuovamente il login.');
      return throwError('Token JWT non trovato.');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<User>(`${this.apiUrl}/me`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching user profile', error);
        return throwError(error);
      })
    );
  }

  // Metodo per aggiornare il profilo utente
  updateUserProfile(user: User): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Utilizza `user.userID` per identificare l'utente nell'URL
    return this.http.put(`${this.apiUrl}/${user.userID}`, user, { headers }).pipe(
      catchError(error => {
        console.error('Error updating profile', error);
        return throwError(error);
      })
    );
  }


  // Metodo per aggiornare la password
  updateUserPassword(oldPassword: string, newPassword: string): Observable<any> {
    const token = this.authService.getToken();  // Recupera il token dall'AuthService
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const body = {
      oldPassword: oldPassword,
      newPassword: newPassword
    };

    return this.http.put(`${this.apiUrl}/update-password`, body, { headers }).pipe(
      catchError(error => {
        console.error('Error updating password', error);
        return throwError(error);
      })
    );
  }
}
