import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';

import { WebSocketService } from './websocket.service';
import { ChatMessage } from '../models/chat-message.model';
import {
  JoinCommandRequest,
  JoinCommandResponse,
} from '../models/join-command.model';

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

  constructor(private webSocket: WebSocketService) {
    this.connectionSubscription = this.webSocket.connected$.subscribe(
      this.connected$
    );

    this.participants$.subscribe((a) => {
      console.log(a);
    })
  }

  async join(nickName: string) {
    const result = await this.webSocket.sendCommandAndWaitForResponse<
      JoinCommandRequest,
      JoinCommandResponse
    >('JOIN_COMMAND', { nickName });

    console.log(result);

    this.messages$.next(result.messages);
    this.participants$.next(result.participants);

    this.joined$.next(true);
  }

  ngOnDestroy() {
    this.connectionSubscription?.unsubscribe();
  }
}
