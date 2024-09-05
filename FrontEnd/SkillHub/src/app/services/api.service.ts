import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,throwError  } from 'rxjs';
import { Category, OrderDetailsDto, OrderStatsDto, Service, SubCategory } from '../models/models';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ServiceDto } from '../models/models';

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

  getUserOrders(): Observable<any> {
    const token = this.authService.getToken(); // Prendi il token dal servizio di autenticazione
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/orders/user-orders`, { headers });
  }
  getUserServices(): Observable<ServiceDto[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    return this.http.get<ServiceDto[]>(`${this.apiUrl}/services/user-services`, { headers });
  }
  getOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders`);
  }
  getOrderStats(): Observable<OrderStatsDto> {
    const token = this.authService.getToken();  // Supponiamo che il token sia salvato in un servizio di autenticazione
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<OrderStatsDto>(`${this.apiUrl}/Orders/orders/stats`, { headers });
  }


  createService(serviceData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.apiUrl}/services`, serviceData, { headers });
  }
}
