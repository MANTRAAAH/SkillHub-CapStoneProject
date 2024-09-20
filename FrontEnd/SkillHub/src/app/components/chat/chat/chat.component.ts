import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { Message, User } from '../../../models/models';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import * as signalR from '@microsoft/signalr';
import { ChangeDetectionStrategy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ChatComponent implements OnInit, OnDestroy {
  selectedUser: User | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  currentUserId: number = 0;
  private hubConnection?: signalR.HubConnection;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private notificationService: NotificationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUserId = Number(this.authService.getUserId());

    this.chatService.getSelectedUser().subscribe((user: User | null) => {
      if (user) {
        this.selectedUser = user;
        this.loadMessages();
      } else {
        this.messages = [];
      }
    });

    this.hubConnection = this.notificationService.hubConnection;

    if (this.hubConnection) {
      this.hubConnection.start().then(() => {
        this.hubConnection?.on('ReceiveMessage', (userId: string, message: Message) => {
          if (userId === String(this.currentUserId) || this.selectedUser?.userID === Number(userId)) {
            this.addNewMessages([message]);
            this.cdRef.detectChanges();
          }
        });

        this.hubConnection?.on('ReceiveNotification', (message: string) => {
          this.toastr.success(message, 'Nuova notifica');
        });
      });
    }
  }

  ngOnDestroy() {
    if (this.hubConnection) {
      this.hubConnection.off('ReceiveMessage');
      this.hubConnection.off('ReceiveNotification');
      this.hubConnection.stop();
    }
  }

  loadMessages() {
    if (this.selectedUser && this.selectedUser.userID) {
      this.chatService.getMessages(this.selectedUser.userID).subscribe(
        (data: any) => {
          const newMessages = data && data.$values ? data.$values : data;

          newMessages.forEach((message: Message) => {
            if (message.timestamp && typeof message.timestamp === 'string') {
              message.timestamp = new Date(message.timestamp);
            }
          });

          newMessages.sort((a: Message, b: Message) => {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          });

          this.addNewMessages(newMessages);
          this.cdRef.detectChanges();
        }
      );
    }
  }

  addNewMessages(newMessages: Message[]) {
    newMessages.forEach(newMessage => {
      const messageExists = this.messages.some(
        message => message.messageID === newMessage.messageID
      );
      if (!messageExists) {
        this.messages.push(newMessage);
      }
    });
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedUser) {
      const payload = {
        SenderId: this.currentUserId,
        ReceiverId: this.selectedUser.userID,
        Content: this.newMessage,
        SentDate: new Date(),
        Timestamp: new Date()
      };

      const tempMessage: Message = {
        messageID: Date.now(),
        senderId: this.currentUserId,
        receiverId: this.selectedUser.userID,
        content: this.newMessage,
        isRead: false,
        timestamp: new Date()
      };

      this.messages.push(tempMessage);

      this.chatService.sendMessage(payload).subscribe(() => {
        this.newMessage = '';
        this.cdRef.detectChanges();
      });
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) {
      return '';
    }

    const utcDate = new Date(date);
    return utcDate.toLocaleString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
}
