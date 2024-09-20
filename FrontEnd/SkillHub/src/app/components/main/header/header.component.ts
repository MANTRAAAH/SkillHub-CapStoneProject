import { UserService } from './../../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, NavigationEnd} from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isAuthenticated: boolean = false;
  userRole: string | null = null;
  items: MenuItem[] = [];
  profilePictureUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.isAuthenticated = !!user;
      this.userRole = this.authService.getRoleFromToken();

      if (this.isAuthenticated) {

        this.userService.getUserProfile().subscribe(
          (userProfile) => {
            this.profilePictureUrl = this.userService.getProfilePicture(userProfile);
            this.setupMenu();
          },
          (error) => {
          }
        );
      } else {
        this.setupMenu();
      }
    });
  }




  setupMenu() {
    this.items = [
      { label: 'Home', icon: 'pi pi-home', routerLink: '/' },
      { label: 'Servizi', icon: 'pi pi-briefcase', routerLink: '/services' },
      { label: 'Dashboard', icon: 'pi pi-th-large', routerLink: '/dashboard', visible: this.isAuthenticated },
    ];

    // Se l'utente è un Admin, aggiungi l'opzione per la gestione delle categorie
    if (this.userRole === 'Admin') {
      this.items.push(
        { label: 'Gestione Categorie', icon: 'pi pi-cog', routerLink: '/admin/categories' }
      );
    }

    // Forza il rilevamento delle modifiche per aggiornare la UI
    this.cd.detectChanges();
  }


  // Metodo per controllare l'autenticazione e il ruolo
  checkAuthentication() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.userRole = this.authService.getRoleFromToken();
    // Reimposta il menu con le informazioni aggiornate
    this.setupMenu();
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
