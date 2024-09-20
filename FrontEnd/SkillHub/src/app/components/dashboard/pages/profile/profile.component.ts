import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../models/models'; // Importa il modello User

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User = { userID: 0, username: '', email: '', bio: '', profilePicture: '' };
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  selectedFile: File | null = null;

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
      },
      error => {
      }
    );
  }

  // Metodo per aggiornare il profilo
  updateProfile() {
    this.userService.updateUserProfile(this.user).subscribe(
      response => {
      },
      error => {
      }
    );
  }

// Metodo per aggiornare la password
updateUserPassword() {
  if (this.newPassword !== this.confirmPassword) {
    console.error('Le password non coincidono.');
    return;
  }

  this.userService.updateUserPassword(this.oldPassword, this.newPassword).subscribe(
    response => {
      console.log('Password aggiornata con successo.');
      // Puoi aggiungere ulteriori azioni dopo l'aggiornamento della password, come notificare l'utente.
    },
    error => {
      console.error('Errore durante l\'aggiornamento della password:', error);
      // Log degli errori specifici
      if (error.status === 400) {
        console.error('Richiesta non valida. Controlla i dati inseriti.');
      } else if (error.status === 401) {
        console.error('Autenticazione fallita. L\'utente non è autorizzato.');
      } else {
        console.error('Errore generico:', error.message);
      }
    }
  );
}


// Gestione del file selezionato per il caricamento dell'immagine
onFileSelected(event: any) {
  if (event.currentFiles && event.currentFiles.length > 0) {
    this.selectedFile = event.currentFiles[0];
  }
}


  // Metodo per caricare l'immagine del profilo
  uploadProfileImage() {
    if (!this.selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.userService.uploadProfileImage(formData).subscribe(
      (response: any) => {
        this.user.profilePicture = response.path;
      },
      (error: any) => {
      }
    );
  }
  getProfilePictureUrl(): string {
    return this.userService.getProfilePicture(this.user);
  }


}
