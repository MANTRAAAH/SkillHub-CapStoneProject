import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://localhost:7117/api'; // L'URL base del tuo backend

  constructor(private http: HttpClient) { }

  getRandomServices(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/services/random`);
  }

  // Aggiungi altri metodi per comunicare con altre API
}
