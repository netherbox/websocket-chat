import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { Command, WebSocketService } from './websocket.service';
import { ChatMessage } from '../models/chat-message.model';
import {
  JoinCommandRequest,
  JoinCommandResponse,
} from '../models/join-command.model';
import {
  SendCommandRequest,
  SendCommandResponse,
} from '../models/send-command.model';
import {
  DeleteCommandRequest,
  DeleteCommandResponse,
} from '../models/delete-command.model';
import {
  UpdateCommandRequest,
  UpdateCommandResponse,
} from '../models/edit-command.model';
import { MessageChangedCommandResponse } from '../models/message-changed-command.model';

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

    (
      this.webSocket.command$ as Observable<
        Command<MessageChangedCommandResponse>
      >
    ).subscribe((command) => {
      switch (command.type) {
        case 'MESSAGE_CHANGED_COMMAND':
          if (
            this.messages$
              .getValue()
              .findIndex(
                (item: ChatMessage) =>
                  item.messageId === command.payload.message.messageId
              ) !== -1
          ) {
            this.messages$.next([
              ...this.messages$
                .getValue()
                .map((item: ChatMessage) =>
                  item.messageId === command.payload.message.messageId
                    ? command.payload.message
                    : item
                ),
            ]);
          } else {
            this.messages$.next([
              ...this.messages$.getValue(),
              command.payload.message,
            ]);
          }
          break;
      }
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
      createdAt: new Date().toISOString(),
      createdBy: this.currentUserId,
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

  async update(target: ChatMessage) {
    const message: ChatMessage = {
      ...target,
      updated: true,
      updatedAt: new Date().toISOString(),
      updatedBy: this.currentUserId,
    };

    this.messages$.next([
      ...this.messages$
        .getValue()
        .map((item: ChatMessage) =>
          item.messageId === message.messageId ? message : item
        ),
    ]);

    const result = await this.webSocket.sendCommandAndWaitForResponse<
      UpdateCommandRequest,
      UpdateCommandResponse
    >('UPDATE_COMMAND', { userId: this.currentUserId, message });

    this.messages$.next([
      ...this.messages$
        .getValue()
        .map((item: ChatMessage) =>
          item.messageId === result.message.messageId ? result.message : item
        ),
    ]);
  }

  async delete(target: ChatMessage) {
    const message: ChatMessage = {
      ...target,
      deleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: this.currentUserId,
    };

    this.messages$.next([
      ...this.messages$
        .getValue()
        .map((item: ChatMessage) =>
          item.messageId === message.messageId ? message : item
        ),
    ]);

    const result = await this.webSocket.sendCommandAndWaitForResponse<
      DeleteCommandRequest,
      DeleteCommandResponse
    >('DELETE_COMMAND', { userId: this.currentUserId, message });

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
