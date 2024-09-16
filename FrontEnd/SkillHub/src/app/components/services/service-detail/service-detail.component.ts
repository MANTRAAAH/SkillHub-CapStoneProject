import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { PaymentService } from '../../../services/payment.service'; // Importa il PaymentService
import { ServiceDto } from '../../../models/models'; // Assicurati di avere l'interfaccia del servizio

declare const Stripe: any;

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  service: ServiceDto | undefined; // Usa il modello definito
  orderMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private paymentService: PaymentService // Aggiungi PaymentService al costruttore
  ) { }

  ngOnInit(): void {
    const serviceId = this.route.snapshot.paramMap.get('id');
    if (serviceId) {
      this.loadServiceDetails(+serviceId); // Converte serviceId in number
    }
  }

  loadServiceDetails(serviceId: number): void {
    this.apiService.getServiceById(serviceId).subscribe(
      (data: any) => {  // Usa "any" per accettare la risposta che non corrisponde direttamente a ServiceDto
        if (data) {
          this.service = {
            serviceID: data.serviceID,
            UserID: data.UserID || 0,
            title: data.title || 'Titolo non disponibile',
            description: data.description || 'Descrizione non disponibile',
            price: data.price || 0,
            categoryId: data.categoryId || 0,
            subCategoryId: data.subCategoryId || 0,
            categoryName: data.categoryName || 'Nessuna categoria',
            subCategoryName: data.subCategoryName || 'Nessuna sottocategoria',
            userName: data.userName || 'Utente non disponibile',
            imagePath: data.imagePath || '/assets/images/default-image.png' // Aggiungi un'immagine predefinita
          };
        } else {
          console.error('Servizio non trovato');
        }
      },
      (error) => {
        console.error('Errore nel caricamento dei dettagli del servizio', error);
      }
    );
  }


  placeOrder(): void {
    if (this.service) {
      const order = {
        serviceID: this.service.serviceID,
        totalPrice: this.service.price
      };

      this.apiService.placeOrder(order).subscribe(
        (response) => {
          this.orderMessage = 'Ordine piazzato con successo!';
          this.checkout(response); // Passa la risposta dell'ordine per il checkout
        },
        (error) => {
          this.orderMessage = 'Errore nel piazzare l\'ordine.';
          this.handleOrderError(error);
        }
      );
    }
  }

  checkout(orderResponse: any): void {
    this.paymentService.createCheckoutSession(orderResponse).subscribe(
      (sessionId: { sessionId: string }) => {
        const stripe = Stripe('pk_test_51PsLxx09lO4xKTPMmZwkHDRoZi8jCSzj8IvWxlQ2M8XnkaekNCyA69jFjA9Q6q0lnk4vS0cDVFYHnOZC5FDBWw3U003DwShOJf'); // Usa la tua chiave pubblica
        stripe.redirectToCheckout({ sessionId: sessionId.sessionId }).then((result: { error?: any }) => {
          if (result.error) {
            console.error('Errore durante il reindirizzamento:', result.error);
          }
        });
      },
      (error) => {
        this.orderMessage = 'Errore durante la creazione della sessione di checkout.';
        console.error('Errore nella creazione della sessione di checkout', error);
      }
    );
  }

  handleOrderError(error: any): void {
    if (error.status === 0) {
      this.orderMessage = 'Errore di connessione. Verifica la tua connessione internet.';
    } else if (error.status >= 400 && error.status < 500) {
      if (error.status === 400) {
        this.orderMessage = 'Richiesta non valida. Verifica i dati inseriti.';
      } else if (error.status === 401) {
        this.orderMessage = 'Non sei autorizzato. Effettua il login.';
      } else if (error.status === 404) {
        this.orderMessage = 'Servizio non trovato. Riprova.';
      } else {
        this.orderMessage = `Errore del client (${error.status}): ${error.error?.message || 'Errore sconosciuto.'}`;
      }
    } else if (error.status >= 500 && error.status < 600) {
      this.orderMessage = `Errore del server (${error.status}): ${error.error?.message || 'Errore sconosciuto.'}`;
    } else {
      this.orderMessage = 'Errore sconosciuto durante il piazzamento dell\'ordine.';
    }
    console.error('Errore dettagliato:', error);
  }
}
