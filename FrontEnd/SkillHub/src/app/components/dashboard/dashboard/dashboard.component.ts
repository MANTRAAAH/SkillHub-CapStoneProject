import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  isFreelancer = false;
  userRole: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Recupera il token dell'utente
    this.currentUser = this.authService.currentUserValue;

    // Verifica il valore di currentUser
    console.log('Utente corrente:', this.currentUser);

    // Ottieni il ruolo dell'utente direttamente dal token
    this.userRole = this.authService.getRoleFromToken();

    if (this.userRole) {
      this.isFreelancer = this.userRole === 'Freelancer';
      console.log('Ruolo utente dal token:', this.userRole);
      console.log('Is Freelancer:', this.isFreelancer);
    } else {
      console.log('Ruolo non trovato nel token');
    }
  }

  logout() {
    this.authService.logout();
    console.log('Utente disconnesso');
  }
}
