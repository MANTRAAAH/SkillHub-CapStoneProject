import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'https://localhost:7117/api/payments';

  constructor(private http: HttpClient) { }

  createCheckoutSession(order: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-checkout-session`, order);
  }
  updateOrderStatus(orderStatus: { orderId: number, stripePaymentId: string, status: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-order-status`, orderStatus);
  }
}
