import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Service } from '../../../models/models'; // Assicurati di avere l'interfaccia del servizio

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  service: Service | undefined; // Usa il modello definito
  orderMessage: string = '';

  constructor(private route: ActivatedRoute, private apiService: ApiService) { }

  ngOnInit(): void {
    const serviceId = this.route.snapshot.paramMap.get('id');
    if (serviceId) {
      this.loadServiceDetails(+serviceId); // Converte serviceId in number
    }
  }

  loadServiceDetails(serviceId: number) {
    this.apiService.getServiceById(serviceId).subscribe(
      (data) => {
        this.service = data;
      },
      (error) => {
        console.error('Errore nel caricamento dei dettagli del servizio', error);
      }
    );
  }

  placeOrder() {
    if (this.service) {
      const order = {
        serviceID: this.service.serviceID,
        totalPrice: this.service.price
      };

      this.apiService.placeOrder(order).subscribe(
        (response) => {
          this.orderMessage = 'Ordine piazzato con successo!';
        },
        (error) => {
          this.orderMessage = 'Errore nel piazzare l\'ordine.';
          console.error('Errore nel piazzare l\'ordine', error);
        }
      );
    }
  }





  handleOrderError(error: any) {
    if (error.status === 0) {
      // Errore di rete
      this.orderMessage = 'Errore di connessione. Verifica la tua connessione internet.';
    } else if (error.status >= 400 && error.status < 500) {
      // Errore lato client (4xx)
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
      // Errore lato server (5xx)
      this.orderMessage = `Errore del server (${error.status}): ${error.error?.message || 'Errore sconosciuto.'}`;
    } else {
      // Errore generico
      this.orderMessage = 'Errore sconosciuto durante il piazzamento dell\'ordine.';
    }
    console.error('Errore dettagliato:', error);
  }

}
