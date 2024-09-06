import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/models'; // Importa il modello User

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7117/api/users'; // Assicurati che l'URL sia corretto

  constructor(private http: HttpClient) { }

  // Metodo per aggiornare il profilo utente
  updateUserProfile(user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.id}`, user);
  }

  // Metodo per aggiornare la password
  updateUserPassword(oldPassword: string, newPassword: string): Observable<any> {
    const body = { oldPassword, newPassword };
    return this.http.put(`${this.apiUrl}/update-password`, body); // Assicurati che l'endpoint sia corretto
  }
}
