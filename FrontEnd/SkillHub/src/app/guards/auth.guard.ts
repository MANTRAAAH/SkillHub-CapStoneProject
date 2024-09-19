import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';  // Assicurati di importare il servizio di autenticazione

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      // Se l'utente è autenticato, consenti l'accesso
      return true;
    } else {
      // Se l'utente non è autenticato, reindirizza al login
      this.router.navigate(['/login']);
      return false;
    }
  }
}
