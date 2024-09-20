import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:7117/api/orders';

  constructor(private http: HttpClient, private authService: AuthService) { }


  // Metodo per scaricare un file specifico
  downloadOrderFile(orderId: number, fileId: number): Observable<Blob> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}/${orderId}/download-file/${fileId}`, { headers, responseType: 'blob' });
  }
// Metodo per caricare i file di un ordine
uploadOrderFiles(orderId: number, files: File[]): Observable<any> {
  const formData: FormData = new FormData();
  files.forEach(file => formData.append('files', file));

  const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
  return this.http.post(`${this.apiUrl}/${orderId}/upload-files`, formData, { headers });
}

// Metodo per eliminare un file di un ordine
deleteOrderFile(orderId: number, fileId: number): Observable<any> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
  return this.http.delete(`${this.apiUrl}/${orderId}/delete-file/${fileId}`, { headers });
}
completeOrder(orderId: number) {
  return this.http.post(`http://localhost:7117/api/orders/${orderId}/complete`, {});
}


}
