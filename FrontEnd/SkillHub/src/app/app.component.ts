import { Component } from '@angular/core';
import { AuthService } from './services/auth.service'; // Importa il servizio di autenticazione

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private authService: AuthService) {}

  // Funzione per verificare se l'utente è autenticato
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated(); // Può essere una funzione del tuo servizio di autenticazione
  }

  // Funzione per effettuare il logout
  logout() {
    this.authService.logout(); // Chiama il logout dal servizio di autenticazione
  }
}
