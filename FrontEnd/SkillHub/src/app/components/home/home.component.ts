import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  services: any[] = []; // Assicuriamoci che sia un array
  responsiveOptions: any[];

  constructor(private apiService: ApiService) {
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
      }
    ];
  }

  ngOnInit(): void {
    this.loadRandomServices();
  }

  loadRandomServices() {
    this.apiService.getRandomServices().subscribe(
      (data: any) => {
        // Verifica se data.$values esiste e assegna solo l'array di servizi
        if (data && data.$values) {
          this.services = data.$values; // Passiamo solo l'array di servizi
        } else {
          this.services = data; // In caso non ci siano $values, usa direttamente data
        }

        // Log per confermare i dati
        console.log('Servizi:', this.services);
      },
      (error) => {
        console.error('Errore nel caricamento dei servizi', error);
        this.services = []; // Imposta come array vuoto in caso di errore
      }
    );
  }
}
