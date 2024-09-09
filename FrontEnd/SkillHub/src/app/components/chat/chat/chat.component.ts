import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { Message, User } from '../../../models/models';
import { AuthService } from '../../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core'; // Importa ChangeDetectorRef

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  selectedUser: User | null = null;  // Utente selezionato per la chat
  messages: Message[] = [];          // Lista di messaggi
  newMessage: string = '';            // Nuovo messaggio da inviare
  currentUserId: number = 0;          // ID utente corrente

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef  // Inietta ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Ottieni l'ID utente corrente dall'autenticazione
    this.currentUserId = Number(this.authService.getUserId());

    // Sottoscrivi agli aggiornamenti dei messaggi
    this.chatService.currentMessages.subscribe((messages: Message[]) => {
      this.messages = messages;
      this.cdRef.detectChanges();  // Forza il rilevamento delle modifiche
    });

    // Sottoscrivi agli aggiornamenti dell'utente selezionato dal ChatService
    this.chatService.getSelectedUser().subscribe((user: User | null) => {
      console.log('Selected user:', user);
      if (user) {
        this.selectedUser = user;
        this.loadMessages();  // Carica i messaggi dell'utente selezionato
      }
    });
  }

  // Metodo per caricare i messaggi dell'utente selezionato
  loadMessages() {
    if (this.selectedUser) {
      this.chatService.getMessages(this.selectedUser.userID).subscribe((data: any) => {
        // Controlla se i messaggi sono dentro $values
        if (data && data.$values) {
          this.messages = data.$values;
        } else {
          this.messages = data;  // Se non c'è $values, assegna direttamente
        }
        this.cdRef.detectChanges();  // Forza il rilevamento delle modifiche
      });
    }
  }

  // Metodo per inviare un nuovo messaggio
  sendMessage() {
    if (this.newMessage.trim() && this.selectedUser) {
      const payload = {
        SenderId: this.currentUserId,
        ReceiverId: this.selectedUser.userID,  // Garantito che selectedUser esista
        Content: this.newMessage
      };

      console.log('Payload inviato al server:', payload);

      this.chatService.sendMessage(payload)
        .subscribe(
          () => {
            // SignalR gestirà l'invio e l'aggiornamento automatico dei messaggi
            this.newMessage = '';  // Reset del campo messaggio
            this.cdRef.detectChanges();  // Forza il rilevamento delle modifiche
          },
          (error: any) => {
            console.error('Error sending message', error);
          }
        );
    }
  }
}
