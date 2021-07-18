import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';

import { WebSocketService } from './websocket.service';
import { ChatMessage } from '../models/chat-message.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  connected$ = new BehaviorSubject(false);
  joined$ = new BehaviorSubject(false);
  command$ = new Subject();

  messages$ = new Subject<Array<ChatMessage>>();
  participants$ = new Subject<Array<string>>();

  connectionSubscription: Subscription;

  constructor(private webSocket: WebSocketService) {
    this.connectionSubscription = this.webSocket.connected$.subscribe(
      this.connected$
    );
  }

  ngOnDestroy() {
    this.connectionSubscription?.unsubscribe();
  }
}
