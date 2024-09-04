import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  services: any[] = []; // Assicuriamoci che sia un array

  constructor(private apiService: ApiService) {}

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
