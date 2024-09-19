import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service'; // Importa il servizio di autenticazione
import { NotificationService } from './services/notification.service'; // Importa il servizio delle notifiche
import { Router,NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  notificationMessage: string | null = null; // Proprietà per mostrare il messaggio di notifica

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event =>{
      console.log('Navigated to:', event);
    })
  }

  ngOnInit(): void {
  }

  // Funzione per verificare se l'utente è autenticato
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated(); // Può essere una funzione del tuo servizio di autenticazione
  }

  // Funzione per effettuare il logout
  logout() {
    this.authService.logout(); // Chiama il logout dal servizio di autenticazione
  }
}
