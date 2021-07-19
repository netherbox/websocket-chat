import { Component } from '@angular/core';
import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  joining = false;

  constructor(public chatService: ChatService) {}

  async join(nickName: string) {
    this.joining = true;
    await this.chatService.join(nickName);
    this.joining = false;
  }
}
