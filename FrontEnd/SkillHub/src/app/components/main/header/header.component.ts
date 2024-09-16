import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isAuthenticated: boolean = false;
  userRole: string | null = null;
  items: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkAuthentication();
  }

  // Metodo per impostare il menu dinamicamente
  setupMenu() {
    this.items = [
      { label: 'Home', icon: 'pi pi-home', routerLink: '/' },
      { label: 'Servizi', icon: 'pi pi-briefcase', routerLink: '/services' },
      { label: 'Chat', icon: 'pi pi-comments', routerLink: '/chat' },
      { label: 'Dashboard', icon: 'pi pi-th-large', routerLink: '/dashboard', visible: this.isAuthenticated },
      {
        label: this.isAuthenticated ? 'Logout' : 'Login',
        icon: this.isAuthenticated ? 'pi pi-sign-out' : 'pi pi-sign-in',
        command: () => this.isAuthenticated ? this.logout() : null,
        routerLink: this.isAuthenticated ? null : '/login'
      },
      { label: 'Registrati', icon: 'pi pi-user-plus', routerLink: '/register', visible: !this.isAuthenticated }
    ];

    // Forza il rilevamento delle modifiche per aggiornare la UI
    this.cd.detectChanges();
  }

  // Metodo per controllare l'autenticazione e il ruolo
  checkAuthentication() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.userRole = this.authService.getRoleFromToken();

    // Reimposta il menu con le informazioni aggiornate
    this.setupMenu();

    console.log('Utente autenticato:', this.isAuthenticated);
    console.log('Ruolo utente:', this.userRole);
  }

  // Metodo per effettuare il logout
  logout() {
    this.authService.logout();
    this.isAuthenticated = false;
    this.userRole = null;

    // Navigazione e aggiornamento asincrono del menu
    this.router.navigate(['/home']).then(() => {
      this.setupMenu();
    });
  }
}
