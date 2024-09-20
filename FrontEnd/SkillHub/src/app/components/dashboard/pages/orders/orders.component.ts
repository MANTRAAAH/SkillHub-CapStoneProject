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
  filters: any = {};
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

        if (data && Array.isArray(data.$values)) {
          this.orders = data.$values.map((order: any) => {

            if (order.orderFiles && Array.isArray(order.orderFiles.$values)) {

              order.files = order.orderFiles.$values;
            } else {

              order.files = [];
            }
            return order;
          });
        } else {
          this.orders = [];
        }


        this.applyFilters();
      },
      (error) => {
        this.orders = [];
      }
    );
  }


  onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  uploadFiles(orderId: number) {
    if (this.selectedFiles.length === 0) {
      return;
    }

    this.orderService.uploadOrderFiles(orderId, this.selectedFiles).subscribe(
      () => {
        this.selectedFiles = [];
        this.loadOrders();
      },
      (error) => {
      }
    );
  }

  deleteFile(orderId: number, fileId: number) {
    this.orderService.deleteOrderFile(orderId, fileId).subscribe(
      () => {
        this.loadOrders();
      },
      (error) => {
      }
    );
  }

  downloadFile(orderId: number, fileId: number) {
    this.orderService.downloadOrderFile(orderId, fileId).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const fileName = blob.type.includes('pdf') ? 'file.pdf' : fileId.toString();
        link.download = fileName;
        link.click();
      },
      (error) => {
      }
    );
  }
  completeOrder(orderId: number) {
    this.orderService.completeOrder(orderId).subscribe(
      () => {
        this.loadOrders();  
      },
      (error) => {
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
