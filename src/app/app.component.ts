import { OnDestroy, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Component, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  joining = false;

  selectedTab = 1;

  constructor(public chatService: ChatService) {
  }

  onJoinSubmit(nickName: string): boolean {
    this.join(nickName);
    return false;
  }

  async join(nickName: string) {
    this.joining = true;
    await this.chatService.join(nickName);
    this.joining = false;
  }
}
