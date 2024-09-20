import { Component } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { User } from '../../../models/models';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent {
  isMinimized = true;
  selectedUser: User | null = null;

  constructor(private chatService: ChatService) {
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
