import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Verifica se l'utente è autenticato e ha il ruolo di admin
    if (this.authService.isAuthenticated() && this.authService.getRoleFromToken() === 'admin') {
      return true;
    } else {
      // Se l'utente non è admin, reindirizza alla pagina di accesso negato
      this.router.navigate(['/home']);
      return false;
    }
  }
}
