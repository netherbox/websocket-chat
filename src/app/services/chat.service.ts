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
import { filter, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  connected$ = new BehaviorSubject(false);
  joined$ = new BehaviorSubject(false);

  messages$ = new BehaviorSubject<Array<ChatMessage>>([]);
  participants$ = new BehaviorSubject<Array<string>>([]);

  connectionSubscription: Subscription;
  messageChangedCommandSubscription: Subscription;

  currentUserId = '';

  constructor(private webSocket: WebSocketService) {
    this.connectionSubscription = this.webSocket.connected$.subscribe(
      this.connected$
    );

    this.messageChangedCommandSubscription = this.webSocket.command$
      .pipe(
        filter(
          (command: Command<any>) => command.type === 'MESSAGE_CHANGED_COMMAND'
        ),
        map<Command<MessageChangedCommandResponse>, ChatMessage>(
          (command: Command<MessageChangedCommandResponse>) =>
            command.payload.message
        )
      )
      .subscribe((message: ChatMessage) => {
        const isNewMessage =
          this.messages$
            .getValue()
            .findIndex(
              (item: ChatMessage) => item.messageId === message.messageId
            ) === -1;

        if (isNewMessage) {
          this.messages$.next([...this.messages$.getValue(), message]);
        } else {
          this.messages$.next(
            this.replaceMessage(this.messages$.getValue(), message)
          );
        }
      });
  }

  async join(nickName: string) {
    this.currentUserId = nickName;

    const result = await this.webSocket.sendCommandAndWaitForResponse<
      JoinCommandRequest,
      JoinCommandResponse
    >('JOIN_COMMAND', { nickName });

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

    this.messages$.next(
      this.replaceMessage(this.messages$.getValue(), result.message)
    );
  }

  async update(target: ChatMessage) {
    const message: ChatMessage = {
      ...target,
      updated: true,
      updatedAt: new Date().toISOString(),
      updatedBy: this.currentUserId,
    };

    this.messages$.next(
      this.replaceMessage(this.messages$.getValue(), message)
    );

    const result = await this.webSocket.sendCommandAndWaitForResponse<
      UpdateCommandRequest,
      UpdateCommandResponse
    >('UPDATE_COMMAND', { userId: this.currentUserId, message });

    this.messages$.next(
      this.replaceMessage(this.messages$.getValue(), result.message)
    );
  }

  async delete(target: ChatMessage) {
    const message: ChatMessage = {
      ...target,
      deleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: this.currentUserId,
    };

    this.messages$.next(
      this.replaceMessage(this.messages$.getValue(), message)
    );

    const result = await this.webSocket.sendCommandAndWaitForResponse<
      DeleteCommandRequest,
      DeleteCommandResponse
    >('DELETE_COMMAND', { userId: this.currentUserId, message });

    this.messages$.next(
      this.replaceMessage(this.messages$.getValue(), result.message)
    );
  }

  private replaceMessage(
    messages: Array<ChatMessage>,
    replaceWith: ChatMessage
  ): Array<ChatMessage> {
    return [
      ...messages.map((item: ChatMessage) =>
        item.messageId === replaceWith.messageId ? replaceWith : item
      ),
    ];
  }

  ngOnDestroy() {
    this.connectionSubscription.unsubscribe();
    this.messageChangedCommandSubscription.unsubscribe();
  }
}
