import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../models/models'; // Importa il modello User

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User = { userID: 0, username: '', email: '', bio: '', profilePicture: '' };  // Dati utente
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  selectedFile: File | null = null;  // Per gestire il file selezionato

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Quando il componente si inizializza, carica il profilo utente
    this.getUserProfile();
  }

  // Metodo per caricare il profilo utente
  getUserProfile() {
    this.userService.getUserProfile().subscribe(
      (data: User) => {
        this.user = data;
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

  // Gestione del file selezionato per il caricamento dell'immagine
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // Metodo per caricare l'immagine del profilo
  uploadProfileImage() {
    if (!this.selectedFile) {
      console.error('Nessun file selezionato');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.userService.uploadProfileImage(formData).subscribe(
      (response: any) => {
        console.log('Immagine caricata con successo:', response);
        this.user.profilePicture = response.path;  // Aggiorna il percorso dell'immagine
      },
      (error: any) => {
        console.error('Errore durante il caricamento dell\'immagine', error);
      }
    );
  }
  getProfilePictureUrl(): string {
    return this.userService.getProfilePicture(this.user);
  }


}
