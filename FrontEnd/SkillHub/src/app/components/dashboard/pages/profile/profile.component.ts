import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../models/models'; // Importa il modello User

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User = { userID: 0, username: '', email: '', bio: '', profilePicture: '' };  // Aggiungi campi mancanti
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Quando il componente si inizializza, carica il profilo utente
    this.getUserProfile();
  }

  // Metodo per caricare il profilo utente
  getUserProfile() {
    this.userService.getUserProfile().subscribe(
      (data: User) => {
        this.user = data;  // Verifica che l'ID sia presente qui
        console.log(this.user); // Log per controllare l'ID utente
      },
      error => {
        console.error('Error fetching user profile', error);
      }
    );
  }



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
