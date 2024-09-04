import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service'; // Assumendo che esista un servizio di autenticazione

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isAuthenticated: boolean = false;
  userRole: string | null = null; // Aggiungi questa proprietà

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Verifica se l'utente è autenticato
    this.isAuthenticated = this.authService.isAuthenticated();

    // Verifica se il ruolo viene chiamato e stampato
    this.userRole = this.authService.getRoleFromToken();
    console.log('Ruolo utente:', this.userRole); // Log del ruolo utente
  }

  logout(){
    this.authService.logout();
  }
}
