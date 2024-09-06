import { Component } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../models/models'; // Importa il modello User

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  user: User = { id: 0, username: '', email: '' };  // Inizializza con valori predefiniti
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private userService: UserService) {}

  // Metodo per aggiornare il profilo
  updateProfile() {
    this.userService.updateUserProfile(this.user).subscribe(
      response => {
        console.log('Profile updated successfully');
      },
      error => {
        console.error('Error updating profile', error);
      }
    );
  }

  // Metodo per aggiornare la password
  updateUserPassword() {
    if (this.newPassword !== this.confirmPassword) {
      console.error('New passwords do not match');
      return;
    }

    this.userService.updateUserPassword(this.oldPassword, this.newPassword).subscribe(
      response => {
        console.log('Password updated successfully');
      },
      error => {
        console.error('Error updating password', error);
      }
    );
  }
}
