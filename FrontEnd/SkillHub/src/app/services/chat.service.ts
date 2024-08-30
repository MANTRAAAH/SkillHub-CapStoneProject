import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';  // Assicurati che questo servizio gestisca il token JWT

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection: signalR.HubConnection;
  private messagesSource = new BehaviorSubject<string[]>([]);
  currentMessages = this.messagesSource.asObservable();

  constructor(private authService: AuthService) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7117/chathub', {
        accessTokenFactory: () => {
          const token = this.authService.getToken();
          if (!token) {
            throw new Error('JWT token not available');
          }
          return token;
        }
      })
      .build();

    this.hubConnection.on('ReceiveMessage', (senderId: string, message: string) => {
      this.addMessage(`${senderId}: ${message}`);
    });

    this.hubConnection.start().catch(err => console.error('Error while starting connection: ' + err));
  }

  public sendMessage(receiverUserId: string, message: string): void {
    this.hubConnection.invoke('SendMessage', receiverUserId, message)
      .catch(err => console.error('Error while sending message: ' + err));
  }

  private addMessage(message: string) {
    const currentMessages = this.messagesSource.value;
    this.messagesSource.next([...currentMessages, message]);
  }
}
