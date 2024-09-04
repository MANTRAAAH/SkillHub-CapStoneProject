import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  service: any;

  constructor(private route: ActivatedRoute, private apiService: ApiService) { }

  ngOnInit(): void {
    const serviceId = this.route.snapshot.paramMap.get('id');
    this.loadServiceDetails(serviceId ? +serviceId : null); // Convertiamo la stringa in numero
  }

  loadServiceDetails(serviceId: number | null) {
    if (serviceId !== null) {
      this.apiService.getServiceById(serviceId.toString()).subscribe( // Convertiamo il numero in stringa
        (data) => {
          this.service = data;
        },
        (error) => {
          console.error('Errore nel caricamento dei dettagli del servizio', error);
        }
      );
    }
  }
}
