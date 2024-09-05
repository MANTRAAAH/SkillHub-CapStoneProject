import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service'; // Importa il servizio
import { AuthService } from '../../../../services/auth.service';
import { OrderDetailsDto } from '../../../../models/models'; // Importa il modello Order

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: OrderDetailsDto[] = [];
  filteredOrders: OrderDetailsDto[] = []; // Aggiungi filteredOrders
  userRole: string | null = null;

  // Proprietà per i filtri
  filter = {
    status: '',
    dateFrom: '',
    dateTo: '',
    maxPrice: null as number | null,
    searchQuery: ''
  };

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

        // Applica subito i filtri dopo aver caricato gli ordini
        this.applyFilters();

        // Log per confermare i dati
        console.log('Ordini caricati:', this.orders);
      },
      (error) => {
        console.error('Errore nel caricamento degli ordini', error);
        this.orders = []; // Imposta come array vuoto in caso di errore
      }
    );
  }

  applyFilters() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesStatus = this.filter.status ? order.status === this.filter.status : true;
      const matchesDateFrom = this.filter.dateFrom ? new Date(order.orderDate) >= new Date(this.filter.dateFrom) : true;
      const matchesDateTo = this.filter.dateTo ? new Date(order.orderDate) <= new Date(this.filter.dateTo) : true;
      const matchesPrice = this.filter.maxPrice ? order.totalPrice <= this.filter.maxPrice : true;

      const matchesSearch = this.filter.searchQuery
        ? (order.serviceTitle && order.serviceTitle.toLowerCase().includes(this.filter.searchQuery.toLowerCase())) ||
          (order.clientUsername && order.clientUsername.toLowerCase().includes(this.filter.searchQuery.toLowerCase())) ||
          (order.freelancerUsername && order.freelancerUsername.toLowerCase().includes(this.filter.searchQuery.toLowerCase()))
        : true;

      return matchesStatus && matchesDateFrom && matchesDateTo && matchesPrice && matchesSearch;
    });
  }
}
