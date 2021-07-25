import { Component } from '@angular/core';
import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  joining = false;

  selectedTab = 1;

  constructor(public chatService: ChatService) {}

  onJoinSubmit(nickName: string) {
    this.join(nickName);
    return false;
  }

  async join(nickName: string) {
    this.joining = true;
    await this.chatService.join(nickName);
    this.joining = false;
  }

  onSendMessageSubmit(message: string) {
    this.sendMessage(message);
    return false;
  }

  async sendMessage(message: string) {
    // TODO: send message
    console.log(message);
  }
}
