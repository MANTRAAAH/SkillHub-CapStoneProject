import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { ServiceDto } from '../../../../models/models';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  services: ServiceDto[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadUserServices();
  }

  loadUserServices() {
    this.apiService.getUserServices().subscribe(
      (data: any) => {
        if (data && data.$values) {
          this.services = data.$values; // Assegna l'array corretto
        } else {
          this.services = []; // Se non ci sono servizi, imposta un array vuoto
        }
        console.log('Servizi caricati:', this.services);
      },
      (error: any) => {
        console.error('Errore nel caricamento dei servizi', error);
      }
    );
  }

}
