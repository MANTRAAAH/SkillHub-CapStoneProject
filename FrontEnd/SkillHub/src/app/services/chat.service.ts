import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Message, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private selectedUserSource = new BehaviorSubject<User | null>(null);
  selectedUser$ = this.selectedUserSource.asObservable();

  private hubConnection: signalR.HubConnection | null = null;

  // Messages Source per gestire i messaggi in tempo reale
  private messagesSource = new BehaviorSubject<Message[]>([]);
  currentMessages = this.messagesSource.asObservable();

  private apiUrl = 'https://localhost:7117/api/chat';  // Definisci l'API URL

  constructor(private authService: AuthService, private http: HttpClient) {
    this.startConnection();
    this.registerSignalREvents();  // Registra gli eventi SignalR quando la connessione è attiva
  }

  // Avvia la connessione a SignalR
  private startConnection() {
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
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();

    // Avvia la connessione e gestisci eventuali errori
    this.hubConnection.start().catch(err => console.error('Error while starting connection: ' + err));
  }

  // Registra gli eventi di SignalR
  private registerSignalREvents() {
    if (this.hubConnection) {
      // Gestione degli eventi in arrivo da SignalR
      this.hubConnection.on('ReceiveMessage', (senderId: string, content: string) => {
        console.log('Real-time message received from:', senderId, 'Content:', content);

        const currentUserId = this.authService.getUserId() || 0; // Garantisce che sia sempre un numero valido

        const newMessage: Message = {
          messageId: 0,  // Placeholder, aggiornato con l'ID reale dal server
          senderId: Number(senderId),
          receiverId: Number(currentUserId),  // Usa sempre un numero
          content: content,
          timestamp: new Date()  // Timestamp locale o proveniente dal server
        };

        this.addMessageToList(newMessage);
      });
    }
  }


  // Aggiunge un messaggio alla lista locale
  private addMessageToList(message: Message) {
    const currentMessages = this.messagesSource.value;
    this.messagesSource.next([...currentMessages, message]);
  }

  // Metodo per ottenere gli utenti con cui si ha una chat attiva
  getChattedUsers(): Observable<User[]> {
    return this.http.get<any>(`${this.apiUrl}/get-chatted-users`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(response => console.log('Response from server:', response)),
      map((response: any) => {
        if (response && response.$values && Array.isArray(response.$values)) {
          return response.$values;
        } else if (Array.isArray(response)) {
          return response;
        } else {
          throw new Error('Invalid response format');
        }
      }),
      catchError((error: any) => {
        console.error('Error in getChattedUsers:', error);
        return throwError(error);
      })
    );
  }

  // Metodo per ottenere i messaggi
  getMessages(userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/get-messages/${userId}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError((error: any) => {
        console.error('Error getting messages:', error);
        return throwError(error);
      })
    );
  }

  // Metodo per inviare un messaggio
  sendMessage(payload: { SenderId: number; ReceiverId: number; Content: string }): Observable<any> {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      console.error("Connection is not in the 'Connected' state. Trying to reconnect...");
      return throwError(() => new Error("Connection is not in the 'Connected' state."));
    }

    return this.http.post(`${this.apiUrl}/send`, payload, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(() => {
        console.log('Message sent successfully:', payload);
      }),
      catchError(error => {
        console.error('Error sending message:', error);
        return throwError(error);
      })
    );
  }

  // Metodo per selezionare l'utente
  selectUser(user: User) {
    this.selectedUserSource.next(user);
  }

  // Metodo per ottenere l'utente selezionato
  getSelectedUser(): Observable<User | null> {
    return this.selectedUser$;
  }

  // Metodo per ottenere le intestazioni di autorizzazione con il token JWT
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }
}
