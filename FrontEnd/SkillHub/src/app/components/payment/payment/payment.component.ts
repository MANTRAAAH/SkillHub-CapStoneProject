import { Component } from '@angular/core';
import { PaymentService } from '../../../services/payment.service';

declare const Stripe: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html'
})
export class PaymentComponent {
  constructor(private paymentService: PaymentService) {}

  // Metodo per avviare la sessione di checkout
  checkout(order: any) {
    this.paymentService.createCheckoutSession(order).subscribe(sessionId => {
      const stripe = Stripe('pk_test_51PsLxx09lO4xKTPMmZwkHDRoZi8jCSzj8IvWxlQ2M8XnkaekNCyA69jFjA9Q6q0lnk4vS0cDVFYHnOZC5FDBWw3U003DwShOJf'); // Usa la tua chiave pubblica
      if (stripe) {
        stripe.redirectToCheckout({ sessionId }).then((result: any) => {
          if (result.error) {
            // Gestisci l'errore, ad esempio mostrandolo all'utente
            console.error('Payment failed:', result.error.message);
            // Mostra un messaggio all'utente senza reindirizzarlo
          }
        });
      } else {
        console.error('Stripe.js could not be loaded.');
      }
    });
  }


  // Metodo per aggiornare lo stato dell'ordine
  updateOrderStatus(orderId: number, stripePaymentId: string) {
    this.paymentService.updateOrderStatus({ orderId, stripePaymentId, status: 'paid' }).subscribe(
      () => console.log('Order status updated successfully'),
      (error: any) => console.error('Error updating order status', error)
    );
  }
}
