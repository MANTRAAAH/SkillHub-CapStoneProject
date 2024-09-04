import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Service, SubCategory } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://localhost:7117/api'; // L'URL base del tuo backend

  constructor(private http: HttpClient) { }

  getServices(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/services`);
  }

  getServiceById(id: string): Observable<Service> {
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
}
