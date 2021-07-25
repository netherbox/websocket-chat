import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { WebSocketService } from './websocket.service';
import { ChatMessage } from '../models/chat-message.model';
import {
  JoinCommandRequest,
  JoinCommandResponse,
} from '../models/join-command.model';
import {
  SendCommandRequest,
  SendCommandResponse,
} from '../models/send-command.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  connected$ = new BehaviorSubject(false);
  joined$ = new BehaviorSubject(false);
  command$ = new Subject();

  messages$ = new BehaviorSubject<Array<ChatMessage>>([]);
  participants$ = new BehaviorSubject<Array<string>>([]);

  connectionSubscription: Subscription;

  currentUserId = '';

  constructor(private webSocket: WebSocketService) {
    this.connectionSubscription = this.webSocket.connected$.subscribe(
      this.connected$
    );

    this.participants$.subscribe((a) => {
      console.log(a);
    });
  }

  async join(nickName: string) {
    this.currentUserId = nickName;

    const result = await this.webSocket.sendCommandAndWaitForResponse<
      JoinCommandRequest,
      JoinCommandResponse
    >('JOIN_COMMAND', { nickName });

    console.log(result);

    this.messages$.next(result.messages);
    this.participants$.next(result.participants);

    this.joined$.next(true);
  }

  async send(text: string) {
    const message: ChatMessage = {
      messageId: uuidv4(),
      text: text,
    };

    this.messages$.next([...this.messages$.getValue(), message]);

    const result = await this.webSocket.sendCommandAndWaitForResponse<
      SendCommandRequest,
      SendCommandResponse
    >('SEND_COMMAND', { userId: this.currentUserId, message });

    this.messages$.next([
      ...this.messages$
        .getValue()
        .map((item: ChatMessage) =>
          item.messageId === result.message.messageId ? result.message : item
        ),
    ]);
  }

  ngOnDestroy() {
    this.connectionSubscription?.unsubscribe();
  }
}
