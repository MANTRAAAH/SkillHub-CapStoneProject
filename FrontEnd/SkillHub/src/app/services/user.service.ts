import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:7117/api/users';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Metodo per ottenere il profilo utente
  getUserProfile(): Observable<User> {
    const token = this.authService.getToken();  // Recupera il token dall'AuthService

    if (!token) {
      return throwError('Token JWT non trovato.');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<User>(`${this.apiUrl}/me`, { headers }).pipe(
      catchError(error => {
        return throwError(error);
      })
    );
  }

  // Metodo per aggiornare il profilo utente
  updateUserProfile(user: User): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put(`${this.apiUrl}/${user.userID}`, user, { headers }).pipe(
      catchError(error => {
        return throwError(error);
      })
    );
  }

  updateUserPassword(oldPassword: string, newPassword: string): Observable<any> {
    const token = this.authService.getToken();

    if (!token) {
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const body = {
      oldPassword: oldPassword,
      newPassword: newPassword
    };


    return this.http.put(`${this.apiUrl}/update-password`, body, { headers }).pipe(
      catchError(error => {
        return throwError(error);
      })
    );
  }




  // Metodo per caricare l'immagine del profilo
  uploadProfileImage(formData: FormData): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.apiUrl}/upload-profile-image`, formData, { headers }).pipe(
      catchError(error => {
        return throwError(error);
      })
    );
  }
  // Metodo per ottenere il percorso dell'immagine del profilo
  getProfilePicture(user: User): string {
    if (user.profilePicture) {
      return `http://localhost:7117${user.profilePicture}`;
    } else {
      return 'http://localhost:7117/images/profiles/default-profile-picture.jpg';
    }
  }

}
