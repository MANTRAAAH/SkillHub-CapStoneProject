import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Importa il Router
import { ChatService } from '../../../services/chat.service';
import { User } from '../../../models/models';

@Component({
  selector: 'app-chat-users',
  templateUrl: './chat-users.component.html',
  styleUrls: ['./chat-users.component.scss']
})
export class ChatUsersComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;

  constructor(private chatService: ChatService,private router: Router) {}

  ngOnInit(): void {
    this.loadChattedUsers();
  }

  loadChattedUsers() {
    this.chatService.getChattedUsers().subscribe(
      (data: User[]) => {
        this.users = data;
      },
      error => {
        console.error('Error loading chatted users', error);
      }
    );
  }

  onSelectUser(user: User) {
    console.log('User selected:', user);  // Aggiungi questo log per vedere se l'utente viene passato correttamente
    this.chatService.selectUser(user);  // Seleziona l'utente tramite il servizio
    this.router.navigate(['/chat', user.userID]); // Naviga alla rotta della chat con l'ID dell'utente
  }
}
