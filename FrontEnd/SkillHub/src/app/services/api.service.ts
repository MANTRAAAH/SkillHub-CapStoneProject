import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Category, OrderDetailsDto, OrderStatsDto, Service, SubCategory,CategoryDto } from '../models/models';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ServiceDto } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:7117/api'; // L'URL base del tuo backend

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Ottieni tutti i servizi
  getServices(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/services`);
  }

  // Ottieni un servizio per ID
  getServiceById(id: number): Observable<Service> {
    return this.http.get<any>(`${this.apiUrl}/services/${id}`);
  }

  // Ottieni servizi casuali
  getRandomServices(): Observable<Service[]> {
    return this.http.get<any>(`${this.apiUrl}/services/random`);
  }

  // Ottieni tutte le categorie
  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.apiUrl}/categories/categories`);
  }


  // Ottieni tutte le sottocategorie
  getSubCategories(): Observable<SubCategory[]> {
    return this.http.get<any[]>(`${this.apiUrl}/subcategories`);
  }

  // Piazzare un ordine
  placeOrder(order: any): Observable<any> {
    const token = this.authService.getToken();

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

  // Ottieni tutti gli ordini dell'utente
  getUserOrders(): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/orders/user-orders`, { headers });
  }

  // Ottieni tutti i servizi dell'utente autenticato
  getUserServices(): Observable<ServiceDto[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    return this.http.get<ServiceDto[]>(`${this.apiUrl}/services/user-services`, { headers });
  }

  // Ottieni tutti gli ordini
  getOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders`);
  }

  // Ottieni statistiche degli ordini
  getOrderStats(): Observable<OrderStatsDto> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<OrderStatsDto>(`${this.apiUrl}/Orders/orders/stats`, { headers });
  }

  // **Crea un nuovo servizio** (Create)
  createService(serviceData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.apiUrl}/services`, serviceData, { headers })
      .pipe(
        catchError(error => {
          console.error('Errore durante la creazione del servizio', error);
          return throwError(error);
        })
      );
  }

  // Metodo per caricare un'immagine
uploadImage(formData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}/services/upload-image`, formData);
}

  // **Aggiorna un servizio esistente** (Update)
  updateService(serviceId: number, serviceData: FormData): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Non impostare manualmente il Content-Type, perché il browser lo gestisce automaticamente per FormData
    return this.http.put(`${this.apiUrl}/services/${serviceId}`, serviceData, { headers })
      .pipe(
        catchError(error => {
          console.error('Errore durante l\'aggiornamento del servizio', error);
          return throwError(error);
        })
      );
  }


  // **Elimina un servizio** (Delete)
  deleteService(serviceId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}/services/${serviceId}`, { headers })
      .pipe(
        catchError(error => {
          console.error('Errore durante l\'eliminazione del servizio', error);
          return throwError(error);
        })
      );
  }
}
