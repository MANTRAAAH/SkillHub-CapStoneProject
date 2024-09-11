import { Component } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { User } from '../../../models/models';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent {
  isMinimized = true;  // Stato per la minimizzazione della finestra
  selectedUser: User | null = null;  // Utente selezionato per la chat

  constructor(private chatService: ChatService) {
    // Sottoscrivi al servizio per ottenere l'utente selezionato
    this.chatService.getSelectedUser().subscribe(user => {
      this.selectedUser = user;
    });
  }

  // Mostra o nasconde la finestra di chat
  toggleChatWindow() {
    this.isMinimized = !this.isMinimized;
  }

  // Torna indietro alla lista di chat
  goBack() {
    this.selectedUser = null;
    this.chatService.selectUser(null);  // Deseleziona l'utente
  }
}
