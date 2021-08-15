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
export class ChatComponent implements AfterViewInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer: ElementRef | undefined;

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
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  async onUpdateMessage(message: ChatMessage) {
    await this.chatService.update(message);
  }

  onDeleteMessage(message: ChatMessage) {
    this.chatService.delete(message);
  }

  messageById(_index: number, message: ChatMessage) {
    return message.messageId;
  }

  ngOnDestroy(): void {
    this.messagesSubcription.unsubscribe();
  }
}
