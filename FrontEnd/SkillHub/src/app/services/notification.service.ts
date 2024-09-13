import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public hubConnection?: signalR.HubConnection;

  constructor(private toastr: ToastrService) {
    this.startConnection();
    this.registerNotificationListener();
  }

  private startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:7117/notificationHub')  // L'endpoint per le notifiche
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connessione SignalR per le notifiche avviata con successo.'))
      .catch(err => console.error('Errore nell\'avvio della connessione SignalR per le notifiche:', err));
  }

  private registerNotificationListener() {
    if (this.hubConnection) {
      this.hubConnection.on('ReceiveNotification', (message: string) => {
        console.log('Notifica ricevuta:', message);
        this.toastr.success(message, 'Nuova notifica');
      });
    }
  }

  public stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => console.log('Connessione SignalR per le notifiche interrotta.'));
    }
  }
}
