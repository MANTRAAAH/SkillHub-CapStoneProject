import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../../../services/chat.service';
import { User } from '../../../models/models';

@Component({
  selector: 'app-chat-users',
  templateUrl: './chat-users.component.html',
  styleUrls: ['./chat-users.component.scss']
})
export class ChatUsersComponent implements OnInit {
  chattedUsers: User[] = [];  // Utenti con cui hai già chattato
  searchResults: User[] = [];  // Risultati della ricerca
  selectedUser: User | null = null;
  searchTerm: string = '';

  constructor(private chatService: ChatService, private router: Router) {}

  ngOnInit(): void {
    this.loadChattedUsers();  // Carica gli utenti con cui hai già chattato
  }

  // Carica tutti gli utenti con cui hai avuto una conversazione
  loadChattedUsers() {
    this.chatService.getChattedUsers().subscribe(
      (response: any) => {
        if (response && response.$values) {
          this.chattedUsers = response.$values; // Usa solo l'array di utenti
        } else if (Array.isArray(response)) {
          this.chattedUsers = response; // Se è già un array, usalo direttamente
        } else {
          console.error('Formato di risposta non valido:', response);
        }
      },
      error => {
        console.error('Error loading chatted users', error);
      }
    );
  }

  // Metodo per cercare gli utenti nel DB
  searchUsers() {
    if (this.searchTerm.trim()) {
      this.chatService.searchUsers(this.searchTerm).subscribe(
        (response: any) => {
          if (response && response.$values) {
            this.searchResults = response.$values;
          } else if (Array.isArray(response)) {
            this.searchResults = response;
          } else {
            console.error('Formato di risposta non valido:', response);
          }
        },
        error => {
          console.error('Error searching users:', error);
        }
      );
    } else {
      this.searchResults = [];  // Svuota i risultati se il termine di ricerca è vuoto
    }
  }

  // Seleziona l'utente e naviga alla chat
  onSelectUser(user: User) {
    this.chatService.selectUser(user);
  }
}
