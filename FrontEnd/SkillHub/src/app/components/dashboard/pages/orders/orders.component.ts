import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { OrderService } from '../../../../services/order.service';
import { OrderDetailsDto } from '../../../../models/models';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: OrderDetailsDto[] = [];
  filteredOrders: OrderDetailsDto[] = [];
  userRole: string | null = null;
  selectedFiles: File[] = [];
  isFreelancer: boolean = false;

  filter = {
    status: '',
    dateFrom: '',
    dateTo: '',
    maxPrice: null as number | null,
    searchQuery: ''
  };
  filters: any = {}; // Puoi specificare il tipo appropriato
  selectedOrders: OrderDetailsDto[] = [];
  constructor(private apiService: ApiService, private authService: AuthService , private orderService: OrderService) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRoleFromToken();
    this.isFreelancer = this.userRole === 'Freelancer';
    this.loadOrders();
  }

  loadOrders() {
    this.apiService.getUserOrders().subscribe(
      (data: any) => {
        // Controlla se data è un oggetto con la proprietà $values e se è un array
        if (data && Array.isArray(data.$values)) {
          this.orders = data.$values.map((order: any) => {
            // Verifica se orderFiles è presente e se è un array
            if (order.orderFiles && Array.isArray(order.orderFiles.$values)) {
              // Mappa i file degli ordini
              order.files = order.orderFiles.$values;  // Assegna a `files` per coerenza col template
            } else {
              // Gestisci il caso in cui orderFiles non sia presente o non sia un array
              order.files = [];
            }
            return order;
          });
        } else {
          console.error('Errore: i dati ricevuti non sono un array', data);
          this.orders = []; // Imposta come array vuoto in caso di errore
        }

        // Applica i filtri agli ordini
        this.applyFilters();
        console.log('Ordini caricati:', this.orders);
      },
      (error) => {
        console.error('Errore nel caricamento degli ordini', error);
        this.orders = [];  // Imposta come array vuoto in caso di errore
      }
    );
  }


  onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  uploadFiles(orderId: number) {
    if (this.selectedFiles.length === 0) {
      console.error('Nessun file selezionato.');
      return;
    }

    this.orderService.uploadOrderFiles(orderId, this.selectedFiles).subscribe(
      () => {
        console.log('File caricati con successo.');
        this.selectedFiles = [];
        this.loadOrders();
      },
      (error) => {
        console.error('Errore durante il caricamento dei file', error);
      }
    );
  }

  deleteFile(orderId: number, fileId: number) {
    this.orderService.deleteOrderFile(orderId, fileId).subscribe(
      () => {
        console.log('File eliminato con successo.');
        this.loadOrders();
      },
      (error) => {
        console.error('Errore durante l\'eliminazione del file', error);
      }
    );
  }

  downloadFile(orderId: number, fileId: number) {
    this.orderService.downloadOrderFile(orderId, fileId).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // Usa il nome del file dal percorso per il download
        const fileName = blob.type.includes('pdf') ? 'file.pdf' : fileId.toString(); // Modifica se necessario
        link.download = fileName;
        link.click();
      },
      (error) => {
        console.error('Errore durante il download del file', error);
      }
    );
  }
  completeOrder(orderId: number) {
    this.orderService.completeOrder(orderId).subscribe(
      () => {
        console.log('Ordine completato con successo.');
        this.loadOrders();  // Ricarica gli ordini per aggiornare lo stato
      },
      (error) => {
        console.error('Errore durante il completamento dell\'ordine', error);
      }
    );
  }

  applyFilters() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesStatus = this.filter.status ? order.paymentStatus === this.filter.status : true;
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
