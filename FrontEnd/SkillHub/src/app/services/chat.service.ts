import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Message, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private selectedUserSource = new BehaviorSubject<User | null>(null);
  selectedUser$ = this.selectedUserSource.asObservable();

  private hubConnection: signalR.HubConnection | null = null;

  private messagesSubject = new BehaviorSubject<Message[]>([]);

  private apiUrl = 'http://localhost:7117/api/chat';

  // Mantiene l'elenco di messaggi senza duplicati
  private allMessages: Message[] = [];

  constructor(private authService: AuthService, private http: HttpClient) {
    this.startConnection();
    this.registerSignalREvents();  // Registra gli eventi SignalR quando la connessione è attiva
  }

  // Avvia la connessione a SignalR
  private startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:7117/chathub', {
        accessTokenFactory: () => {
          const token = this.authService.getToken();
          if (!token) {
            throw new Error('JWT token not available');
          }
          return token;
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect([0, 2000, 10000, 30000])  // Gestione delle riconnessioni
      .build();

    this.hubConnection.start()
      .then(() => {
      })
      .catch(err => {
      });

    this.hubConnection.onreconnecting(() => {
    });

    this.hubConnection.onreconnected(() => {
    });

    this.hubConnection.onclose((error) => {
      this.startConnection();
    });
  }

  // Registra gli eventi di SignalR
  private registerSignalREvents() {
    if (this.hubConnection) {
      this.hubConnection.off('ReceiveMessage'); // Rimuove eventuali handler duplicati
      this.hubConnection.on('ReceiveMessage', (message: Message) => {
        this.addMessageWithoutDuplicate(message);
      });
    }
  }
  // Metodo per cercare utenti nel database
  searchUsers(searchTerm: string): Observable<User[]> {
    return this.http.get<any>(`http://localhost:7117/api/users/search?searchTerm=${searchTerm}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map(response => {
        if (response && response.$values && Array.isArray(response.$values)) {
          return response.$values;
        } else if (Array.isArray(response)) {
          return response;
        } else {
          throw new Error('Formato di risposta non valido');
        }
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }



  // Metodo per ottenere tutti gli utenti
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`https://localhost:7117/api/users/`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Metodo per aggiungere un messaggio, evitando duplicati
  private addMessageWithoutDuplicate(newMessage: Message) {
    const existingMessages = this.allMessages;

    // Verifica se il messaggio è già presente
    const messageExists = existingMessages.some(msg => msg.messageID === newMessage.messageID);

    if (!messageExists) {
      // Aggiungi solo il nuovo messaggio
      this.allMessages.push(newMessage);

      // Aggiorna il BehaviorSubject con la lista aggiornata
      this.messagesSubject.next([...this.allMessages]);
    } else {
    }
  }

  // Ottieni il flusso di messaggi aggiornato
  getMessagesStream(): Observable<Message[]> {
    return this.messagesSubject.asObservable();
  }

  // Metodo per ottenere gli utenti con cui si ha una chat attiva
  getChattedUsers(): Observable<User[]> {
    return this.http.get<any>(`${this.apiUrl}/get-chatted-users`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(response => console.log('Chatted users response:', response)),
      map((response: any) => {
        if (response && response.$values) {
          return response.$values;
        } else if (Array.isArray(response)) {
          return response;
        } else {
          throw new Error('Formato di risposta non valido');
        }
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }


  // Metodo per ottenere i messaggi di un utente
  getMessages(userId: number): Observable<Message[]> {
    return this.http.get<any>(`${this.apiUrl}/get-messages/${userId}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(response => {
        let messages: Message[] = [];

        if (response && response.$values && Array.isArray(response.$values)) {
          messages = response.$values;
        } else if (Array.isArray(response)) {
          messages = response;
        } else {
        }

        if (Array.isArray(messages)) {
          messages.forEach(msg => this.addMessageWithoutDuplicate(msg)); // Aggiungi i messaggi senza duplicati
        } else {
        }
      }),
      catchError((error: any) => {
        return throwError(error);
      })
    );
  }

  // Metodo per inviare un messaggio
  public sendMessage(payload: { SenderId: number; ReceiverId: number; Content: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, payload, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(() => {
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  // Metodo per selezionare l'utente
  selectUser(user: User | null) {
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
