import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  role: string = 'User'; // Valore predefinito
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.authService.register(this.username, this.email, this.password, this.role).subscribe(
      data => {
        this.router.navigate(['/home']); // Naviga alla chat dopo la registrazione
      },
      err => {
        this.error = 'Registration failed';
      }
    );
  }
}
