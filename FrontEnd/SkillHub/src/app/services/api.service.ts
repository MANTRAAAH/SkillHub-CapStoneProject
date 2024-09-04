import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,throwError  } from 'rxjs';
import { Category, Service, SubCategory } from '../models/models';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://localhost:7117/api'; // L'URL base del tuo backend

  constructor(private http: HttpClient,private authService: AuthService) { }

  getServices(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/services`);
  }

  getServiceById(id: number): Observable<Service> {
    return this.http.get<any>(`${this.apiUrl}/services/${id}`);
  }


  getRandomServices(): Observable<Service[]> {
    return this.http.get<any>(`${this.apiUrl}/services/random`);
  }

  // Nuovo metodo per ottenere le categorie
  getCategories(): Observable<Category[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  // Nuovo metodo per ottenere le sottocategorie
  getSubCategories(): Observable<SubCategory[]> {
    return this.http.get<any[]>(`${this.apiUrl}/subcategories`);
  }

  placeOrder(order: any): Observable<any> {
    const token = this.authService.getToken(); // Prendi il token dal servizio di autenticazione

    if (!token) {
      console.error('Token JWT mancante o non valido');
      return throwError('Token JWT mancante o non valido');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/orders`, order, { headers })
      .pipe(
        catchError(error => {
          console.error('Errore nel piazzare l\'ordine', error);
          return throwError(error);
        })
      );
  }
}
