import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service'; // Importa il servizio
import { AuthService } from '../../../../services/auth.service';
import { Order, OrderDetailsDto } from '../../../../models/models'; // Importa il modello Order

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: OrderDetailsDto[] = [];
  userRole: string | null = null;

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRoleFromToken();
    this.loadOrders();
  }

  loadOrders() {
    this.apiService.getUserOrders().subscribe(
      (data: any) => {
        // Verifica se data.$values esiste e assegna solo l'array di ordini
        if (data && data.$values) {
          this.orders = data.$values; // Passiamo solo l'array di ordini
        } else {
          this.orders = data; // In caso non ci siano $values, usa direttamente data
        }

        // Log per confermare i dati
        console.log('Ordini caricati:', this.orders);
      },
      (error) => {
        console.error('Errore nel caricamento degli ordini', error);
        this.orders = []; // Imposta come array vuoto in caso di errore
      }
    );
  }



}
