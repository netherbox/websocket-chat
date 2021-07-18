import { Injectable, OnDestroy } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { BehaviorSubject, fromEvent, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

export interface Command<T> {
  commandId: string;
  responseTo?: string;
  type: string;
  payload: T;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  private webSocket = new WebSocket(environment.server);

  public connected$ = new BehaviorSubject(false);
  public message$ = new Subject();

  private messageSubscription: Subscription;
  private openSubscription: Subscription;
  private closeSubscription: Subscription;

  constructor() {
    this.messageSubscription = fromEvent(this.webSocket, 'message').subscribe(
      this.message$
    );

    this.openSubscription = fromEvent(this.webSocket, 'open')
      .pipe(map(() => true))
      .subscribe(this.connected$);

    this.closeSubscription = fromEvent(this.webSocket, 'close')
      .pipe(map(() => false))
      .subscribe(this.connected$);
  }

  sendCommand<RequestPayloadType>(
    type: string,
    payload: RequestPayloadType
  ): string {
    let commandId = uuidv4();

    this.webSocket.send(
      JSON.stringify({
        commandId: commandId,
        type,
        payload,
      } as Command<RequestPayloadType>)
    );

    return commandId;
  }

  sendCommandAndWaitForResponse<RequestPayloadType, ResponsePayloadType>(
    type: string,
    payload: RequestPayloadType
  ): Promise<ResponsePayloadType> {
    return new Promise<ResponsePayloadType>((resolve, reject) => {
      let commandId: string;

      const onMessageCallback = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);

          if (
            message?.responseTo === commandId &&
            message.type === `${type}_RESPONSE`
          ) {
            removeListeners();
            resolve(message.payload);
          }
        } catch (error) {
          removeListeners();
          reject(error);
        }
      };

      const onErrorCallback = (event: Event) => {
        removeListeners();
        reject(event);
      };

      const removeListeners = () => {
        this.webSocket.removeEventListener('message', onMessageCallback);
        this.webSocket.removeEventListener('onerror', onErrorCallback);
      };

      this.webSocket.addEventListener('message', onMessageCallback.bind(this));
      this.webSocket.addEventListener('onerror', onErrorCallback.bind(this));

      commandId = this.sendCommand<RequestPayloadType>(type, payload);
    });
  }

  ngOnDestroy() {
    this.messageSubscription?.unsubscribe();
    this.openSubscription?.unsubscribe();
    this.closeSubscription?.unsubscribe();
  }
}
