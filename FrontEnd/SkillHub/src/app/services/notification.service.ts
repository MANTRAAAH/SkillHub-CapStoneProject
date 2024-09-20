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
      .withUrl('http://localhost:7117/notificationHub')
      .build();

    this.hubConnection
      .start()
  }

  private registerNotificationListener() {
    if (this.hubConnection) {
      this.hubConnection.on('ReceiveNotification', (message: string) => {
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
