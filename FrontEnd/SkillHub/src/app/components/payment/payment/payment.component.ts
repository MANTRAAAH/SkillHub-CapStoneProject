import { Component } from '@angular/core';
import { PaymentService } from '../../../services/payment.service';

declare const Stripe: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html'
})
export class PaymentComponent {
  constructor(private paymentService: PaymentService) {}

  checkout(order: any) {
    this.paymentService.createCheckoutSession(order).subscribe(sessionId => {
      const stripe = Stripe('pk_test_51PsLxx09lO4xKTPMmZwkHDRoZi8jCSzj8IvWxlQ2M8XnkaekNCyA69jFjA9Q6q0lnk4vS0cDVFYHnOZC5FDBWw3U003DwShOJf'); // Usa la tua chiave pubblica
      if (stripe) {
        console.log(Stripe);
        stripe.redirectToCheckout({ sessionId });
      } else {
        console.error('Stripe.js could not be loaded.');
      }
    });
  }

  updateOrderStatus(orderId: number, stripePaymentId: string) {
    // Usa il paymentService al posto di apiService
    this.paymentService.updateOrderStatus({ orderId, stripePaymentId, status: 'paid' }).subscribe(
      () => console.log('Order status updated successfully'),
      (error: any) => console.error('Error updating order status', error) // Aggiungi il tipo 'any' esplicitamente
    );
  }
}
