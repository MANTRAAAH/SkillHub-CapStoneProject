import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiCategoriesUrl = 'http://localhost:7117/api/categories';
  private apiSubCategoriesUrl = 'http://localhost:7117/api/subcategories';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Ottenere tutte le categorie
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiCategoriesUrl}`);
  }

  // Creare una nuova categoria
  createCategory(category: any): Observable<any> {
    return this.http.post(`${this.apiCategoriesUrl}`, category, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  // Ottenere una categoria per ID
  getCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiCategoriesUrl}/${id}`);
  }

  // Creare una nuova sottocategoria
  createSubcategory(subcategory: any): Observable<any> {
    return this.http.post<any>(`${this.apiSubCategoriesUrl}`, subcategory, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  // Ottenere tutte le sottocategorie
  getSubcategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiSubCategoriesUrl}`);
  }

  // Ottenere una sottocategoria per ID
  getSubcategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiSubCategoriesUrl}/${id}`);
  }

// Metodo per eliminare una categoria
deleteCategory(categoryID: number): Observable<any> {
  return this.http.delete(`${this.apiCategoriesUrl}/${categoryID}`);
}

// Metodo per eliminare una sottocategoria
deleteSubcategory(subCategoryID: number): Observable<any> {
  return this.http.delete(`${this.apiSubCategoriesUrl}/${subCategoryID}`);
}


  // Aggiornare una sottocategoria
  updateSubcategory(id: number, subcategory: any): Observable<any> {
    return this.http.put(`${this.apiSubCategoriesUrl}/${id}`, subcategory, {
      headers: this.authService.getAuthHeaders(),
    });
  }
}
