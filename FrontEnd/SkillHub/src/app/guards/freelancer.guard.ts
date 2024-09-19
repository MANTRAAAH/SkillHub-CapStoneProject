import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FreelancerGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const role = this.authService.getRoleFromToken();

    // Controlla se l'utente è un freelancer
    if (role  === "Freelancer") {
      return true;
    }

    // Se l'utente non è un freelancer, lo reindirizziamo
    this.router.navigate(['/home']);
    return false;
  }
}
