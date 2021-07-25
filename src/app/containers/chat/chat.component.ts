import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { ChatMessage } from '../../models/chat-message.model';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class Chat implements AfterViewInit, OnDestroy {
  @ViewChild('messages') messages: ElementRef | undefined;

  messagesSubcription: Subscription;

  constructor(public chatService: ChatService) {
    this.messagesSubcription = this.chatService.messages$.subscribe(() =>
      this.scrollDown()
    );
  }

  ngAfterViewInit(): void {
    this.scrollDown();
  }

  onSendMessageSubmit(messageInput: HTMLInputElement): boolean {
    this.sendMessage(messageInput.value);
    messageInput.value = '';
    return false;
  }

  async sendMessage(text: string) {
    await this.chatService.send(text);
  }

  scrollDown(): void {
    setTimeout(() => {
      if (this.messages) {
        this.messages.nativeElement.scrollTop =
          this.messages.nativeElement.scrollHeight;
      }
    }, 100);
  }

  onEditClick(message: ChatMessage) {
    // TODO: implement edit
  }

  onDeleteClick(message: ChatMessage) {
    this.chatService.delete(message);
  }

  ngOnDestroy(): void {
    this.messagesSubcription?.unsubscribe();
  }
}
