import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  message = '';
  receiverUserId = '';
  messages: string[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.currentMessages.subscribe(messages => this.messages = messages);
  }

  sendMessage(): void {
    if (this.receiverUserId && this.message) {
      this.chatService.sendMessage(this.receiverUserId, this.message);
      this.message = ''; // Clear the input after sending
    }
  }
}
