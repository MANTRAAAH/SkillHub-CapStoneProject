import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { Message, User } from '../../../models/models';
import { AuthService } from '../../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
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

    // Sottoscrivi agli aggiornamenti dell'utente selezionato
    this.chatService.getSelectedUser().subscribe((user: User | null) => {
      console.log('Utente selezionato:', user);
      if (user) {
        this.selectedUser = user;
        this.loadMessages();  // Carica i messaggi dell'utente selezionato
      } else {
        this.messages = []; // Resetta i messaggi se nessun utente è selezionato
      }
    });

    // Sottoscrivi allo stream dei messaggi aggiornati (aggiorna la chat in tempo reale)
    this.chatService.getMessagesStream().subscribe((newMessages: Message[]) => {
      this.addNewMessages(newMessages); // Aggiungi nuovi messaggi senza duplicati
      this.cdRef.detectChanges();  // Forza il rilevamento delle modifiche
    });
  }

  // Metodo per caricare i messaggi dell'utente selezionato
  loadMessages() {
    if (this.selectedUser && this.selectedUser.userID) {
      this.chatService.getMessages(this.selectedUser.userID).subscribe(
        (data: any) => {
          const newMessages = data && data.$values ? data.$values : data;

          // Converte la stringa UTC in oggetto Date per ogni messaggio
          newMessages.forEach((message: Message) => {
            if (message.timestamp && typeof message.timestamp === 'string') {
              message.timestamp = new Date(message.timestamp);  // Converte in oggetto Date
            }
          });

          // Ordina i messaggi in base al timestamp (più vecchi prima)
          newMessages.sort((a: Message, b: Message) => {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          });

          this.addNewMessages(newMessages); // Aggiungi nuovi messaggi senza duplicati
          this.cdRef.detectChanges();  // Forza il rilevamento delle modifiche
        },
        (error) => {
          console.error("Error loading messages:", error);
        }
      );
    } else {
      console.error("Selected user or user ID is undefined");
    }
  }


  // Metodo per aggiungere nuovi messaggi evitando duplicati
  addNewMessages(newMessages: Message[]) {
    newMessages.forEach(newMessage => {
      const messageExists = this.messages.some(
        message => message.messageID === newMessage.messageID
      );
      if (!messageExists) {
        this.messages.push(newMessage);  // Aggiungi solo i messaggi che non esistono già
      }
    });
  }

  // Metodo per inviare un nuovo messaggio
  sendMessage() {
    if (this.newMessage.trim() && this.selectedUser) {
      const payload = {
        SenderId: this.currentUserId,
        ReceiverId: this.selectedUser.userID,
        Content: this.newMessage,
        SentDate: new Date(),  // Invia la data come oggetto Date
        Timestamp: new Date()  // Invia la data come oggetto Date
      };

      // Crea un messaggio temporaneo per visualizzarlo subito nell'interfaccia utente
      const tempMessage: Message = {
        messageID: Date.now(),
        senderId: this.currentUserId,
        receiverId: this.selectedUser.userID,
        content: this.newMessage,
        isRead: false,
        timestamp: new Date()  // Mantieni l'oggetto Date
      };

      this.messages.push(tempMessage);

      this.chatService.sendMessage(payload).subscribe(
        () => {
          this.newMessage = '';  // Reset del campo messaggio
          this.cdRef.detectChanges();  // Forza il rilevamento delle modifiche
        },
        (error: any) => {
          console.error('Error sending message', error);
        }
      );
    }
  }



  // Conversione della data da UTC a locale solo nel template, non nel modello
  formatDate(date: Date | string | undefined): string {
    if (!date) {
      return '';  // Se la data non è definita, restituisce una stringa vuota
    }

    // Converte la stringa o l'oggetto Date in una data corretta
    const utcDate = new Date(date);  // JavaScript converte la data in base al fuso orario

    // Usa toLocaleString per convertire automaticamente all'ora locale
    return utcDate.toLocaleString('it-IT', {

      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }



}

