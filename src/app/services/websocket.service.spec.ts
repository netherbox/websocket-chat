import * as uuid from 'uuid';
jest.spyOn(uuid, 'v4').mockReturnValue('test-guid');

import * as rxjs from 'rxjs';

import { TestBed } from '@angular/core/testing';

import { WebSocketService } from './websocket.service';
import { Subject } from 'rxjs';

describe('ChatService', () => {
  let service: WebSocketService;
  let webSocketMock: any;
  let messageMock$: Subject<any>;
  let openMock$: Subject<any>;
  let closeMock$: Subject<any>;

  beforeEach(async () => {
    webSocketMock = {
      send: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    messageMock$ = new Subject<any>();
    openMock$ = new Subject<any>();
    closeMock$ = new Subject<any>();

    jest.spyOn(rxjs, 'fromEvent').mockImplementation((_object, type): any => {
      if (type === 'message') {
        return messageMock$;
      } else if (type === 'open') {
        return openMock$;
      } else if (type === 'close') {
        return closeMock$;
      } else {
        return false;
      }
    });

    await TestBed.configureTestingModule({
      providers: [WebSocketService],
    }).compileComponents();

    jest.spyOn(window, 'WebSocket').mockReturnValue(webSocketMock);

    service = TestBed.inject(WebSocketService);
  });

  it('should successfully create service', () => {
    expect(service).toBeTruthy();
  });

  it('should provide web socket message events as commands observable', (done) => {
    service.command$.subscribe((message) => {
      expect(message).toEqual({
        commandId: 'test-guid',
        payload: 'test-response-payload',
        type: 'test-type_RESPONSE',
      });
      done();
    });

    messageMock$.next({
      data: '{"commandId":"test-guid","type":"test-type_RESPONSE","payload":"test-response-payload"}',
    });
  });

  it('should provide web socket open events as connected observable', () => {
    service.connected$.next(false);

    expect(service.connected$.getValue()).toBeFalsy();

    openMock$.next(true);

    expect(service.connected$.getValue()).toBeTruthy();
  });

  it('should provide web socket closed events as connected observable', () => {
    service.connected$.next(true);
    expect(service.connected$.getValue()).toBeTruthy();

    closeMock$.next(true);

    expect(service.connected$.getValue()).toBeFalsy();
  });

  describe('sendCommand', () => {
    it('should send command', () => {
      jest.spyOn(webSocketMock, 'send').mockImplementation();

      service.sendCommand('test-type', 'test-payload');

      expect(webSocketMock.send).toHaveBeenCalledWith(
        '{"commandId":"test-guid","type":"test-type","payload":"test-payload"}'
      );
    });
  });

  describe('sendCommandAndWaitForResponse', () => {
    it('should send command and resolve response', () => {
      jest.resetAllMocks();

      jest.spyOn(service, 'sendCommand').mockReturnValue('test-command-id');
      jest
        .spyOn(webSocketMock, 'addEventListener')
        .mockImplementation((type: any, callback: any) => {
          switch (type) {
            case 'message':
              callback({
                data: '{"commandId":"test-guid","type":"test-type_RESPONSE","payload":"test-response-payload"}',
              } as MessageEvent);
              break;
          }
        });

      const response = service.sendCommandAndWaitForResponse(
        'test-type',
        'test-request-payload'
      );

      expect(service.sendCommand).toHaveBeenCalledWith(
        'test-type',
        'test-request-payload'
      );

      expect(response).resolves.toEqual('test-response-payload');
    });

    it('should send command and do not resolve on not response', () => {
      jest.resetAllMocks();

      jest.spyOn(service, 'sendCommand').mockReturnValue('test-command-id');
      jest
        .spyOn(webSocketMock, 'addEventListener')
        .mockImplementation((type: any, callback: any) => {
          switch (type) {
            case 'message':
              callback({
                data: '{"commandId":"test-guid","type":"test-type","payload":"test-not-response-payload"}',
              } as MessageEvent);

              callback({
                data: '{"commandId":"test-guid","type":"test-type_RESPONSE","payload":"test-response-payload"}',
              } as MessageEvent);
              break;
          }
        });

      const response = service.sendCommandAndWaitForResponse(
        'test-type',
        'test-request-payload'
      );

      expect(service.sendCommand).toHaveBeenCalledWith(
        'test-type',
        'test-request-payload'
      );

      expect(response).resolves.toEqual('test-response-payload');
    });

    it('should send command and reject on error', () => {
      jest.resetAllMocks();

      jest.spyOn(service, 'sendCommand').mockReturnValue('test-command-id');
      jest
        .spyOn(webSocketMock, 'addEventListener')
        .mockImplementation((type: any, callback: any) => {
          switch (type) {
            case 'onerror':
              callback('test-error-event-type');
              break;
          }
        });

      const response = service.sendCommandAndWaitForResponse(
        'test-type',
        'test-payload'
      );

      expect(service.sendCommand).toHaveBeenCalledWith(
        'test-type',
        'test-payload'
      );

      expect(response).rejects.toEqual('test-error-event-type');
    });

    it('should send command and reject on json parse error', () => {
      jest.resetAllMocks();

      jest.spyOn(service, 'sendCommand').mockReturnValue('test-command-id');
      jest
        .spyOn(webSocketMock, 'addEventListener')
        .mockImplementation((type: any, callback: any) => {
          switch (type) {
            case 'message':
              callback({
                data: 'test-malformed-json',
              } as MessageEvent);
              break;
          }
        });

      const response = service.sendCommandAndWaitForResponse(
        'test-type',
        'test-payload'
      );

      expect(service.sendCommand).toHaveBeenCalledWith(
        'test-type',
        'test-payload'
      );

      expect(response).rejects.toThrowError(
        'Unexpected token e in JSON at position 1'
      );
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe', async () => {
      jest.spyOn(service['commandSubscription'], 'unsubscribe');
      jest.spyOn(service['openSubscription'], 'unsubscribe');
      jest.spyOn(service['closeSubscription'], 'unsubscribe');

      service.ngOnDestroy();

      expect(service['commandSubscription'].unsubscribe).toHaveBeenCalled();
      expect(service['openSubscription'].unsubscribe).toHaveBeenCalled();
      expect(service['closeSubscription'].unsubscribe).toHaveBeenCalled();
    });
  });
});
