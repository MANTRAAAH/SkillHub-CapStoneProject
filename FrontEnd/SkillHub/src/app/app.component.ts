import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { Router,NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  notificationMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event =>{
    })
  }

  ngOnInit(): void {
  }

  // Funzione per verificare se l'utente è autenticato
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  // Funzione per effettuare il logout
  logout() {
    this.authService.logout();
  }
}
