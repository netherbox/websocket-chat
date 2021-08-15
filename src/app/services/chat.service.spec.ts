import * as uuid from 'uuid';
jest.spyOn(uuid, 'v4').mockReturnValue('test-guid');

import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { JoinCommandResponse } from '../models/join-command.model';
import { MessageChangedCommandResponse } from '../models/message-changed-command.model';
import { SendCommandResponse } from '../models/send-command.model';

import { ChatService } from './chat.service';
import { Command, WebSocketService } from './websocket.service';
import { UpdateCommandResponse } from '../models/edit-command.model';
import { DeleteCommandResponse } from '../models/delete-command.model';

describe('ChatService', () => {
  let service: ChatService;
  let webSocketService: WebSocketService;
  let connectedMock$: BehaviorSubject<boolean>;
  let commandMock$: Subject<Command<any>>;

  beforeEach(async () => {
    connectedMock$ = new BehaviorSubject<boolean>(false);
    commandMock$ = new Subject();

    await TestBed.configureTestingModule({
      providers: [
        ChatService,
        {
          provide: WebSocketService,
          useValue: {
            connected$: connectedMock$,
            command$: commandMock$,
            sendCommandAndWaitForResponse: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    service = TestBed.inject(ChatService);
    webSocketService = TestBed.inject(WebSocketService);
  });

  it('should successfully create service', () => {
    expect(service).toBeTruthy();
  });

  it('should set connectionSubscription to webSocketService connected$ on creation', () => {
    expect(service.connected$.getValue()).toBeFalsy();
    connectedMock$.next(true);
    expect(service.connected$.getValue()).toBeTruthy();
  });

  describe('Message changed command', () => {
    it('should set messageChangedCommandSubscription on creation', () => {
      expect(service.messageChangedCommandSubscription).toBeTruthy();
    });

    it('should next messages$ with new message on new changed message command', () => {
      service.messages$.next([
        {
          messageId: 'test-existed-messageId',
          text: 'test-original-text',
        },
      ]);

      commandMock$.next({
        commandId: 'test-commandId',
        type: 'MESSAGE_CHANGED_COMMAND',
        payload: {
          message: {
            messageId: 'test-new-messageId',
            text: 'test-new-text',
          },
        } as MessageChangedCommandResponse,
      });

      expect(service.messages$.getValue()).toEqual([
        {
          messageId: 'test-existed-messageId',
          text: 'test-original-text',
        },
        {
          messageId: 'test-new-messageId',
          text: 'test-new-text',
        },
      ]);
    });

    it('should next messages$ with updated message on existed changed message command', () => {
      service.messages$.next([
        {
          messageId: 'test-existed-messageId',
          text: 'test-original-text',
        },
      ]);

      commandMock$.next({
        commandId: 'test-commandId',
        type: 'MESSAGE_CHANGED_COMMAND',
        payload: {
          message: {
            messageId: 'test-existed-messageId',
            text: 'test-updated-text',
          },
        } as MessageChangedCommandResponse,
      });

      expect(service.messages$.getValue()).toEqual([
        {
          messageId: 'test-existed-messageId',
          text: 'test-updated-text',
        },
      ]);
    });
  });

  describe('join', () => {
    it('should send join command and wait for response', async () => {
      const testMessages = [
        {
          messageId: 'test-messageId-1',
          text: 'test-text-1',
        },
        {
          messageId: 'test-messageId-2',
          text: 'test-text-2',
        },
      ];

      const testParticipants = ['test-NickName-1', 'test-NickName-2'];

      jest
        .spyOn(webSocketService, 'sendCommandAndWaitForResponse')
        .mockResolvedValue({
          messages: testMessages,
          participants: testParticipants,
        } as JoinCommandResponse);

      expect(service.messages$.getValue()).toEqual([]);
      expect(service.participants$.getValue()).toEqual([]);
      expect(service.joined$.getValue()).toEqual(false);

      await service.join('test-NickName-new');

      expect(service.messages$.getValue()).toEqual(testMessages);
      expect(service.participants$.getValue()).toEqual(testParticipants);
      expect(service.joined$.getValue()).toEqual(true);
    });
  });

  describe('send', () => {
    it('should send send command and wait for response', async () => {
      const testMessageAfterLocalSend = {
        createdAt: 'test-ISOString',
        createdBy: 'test-currentUserId',
        messageId: 'test-guid',
        text: 'test-text-to-send',
      };

      const testMessageFromServer = {
        createdAt: 'test-ISOString-from-server',
        createdBy: 'test-currentUserId-from-server',
        messageId: 'test-guid',
        text: 'test-text-from-server',
      };

      service.currentUserId = 'test-currentUserId';

      jest.spyOn(window, 'Date').mockImplementation(
        () =>
          ({
            toISOString: () => 'test-ISOString',
          } as any)
      );

      jest
        .spyOn(webSocketService, 'sendCommandAndWaitForResponse')
        .mockResolvedValue({
          message: testMessageFromServer,
        } as SendCommandResponse);

      jest.spyOn(service.messages$, 'next');

      expect(service.messages$.getValue()).toEqual([]);

      await service.send('test-text-to-send');

      expect(
        webSocketService.sendCommandAndWaitForResponse
      ).toHaveBeenCalledWith('SEND_COMMAND', {
        userId: service.currentUserId,
        message: testMessageAfterLocalSend,
      });

      expect(service.messages$.next).toHaveBeenCalledTimes(2);

      expect(service.messages$.next).toHaveBeenNthCalledWith(1, [
        testMessageAfterLocalSend,
      ]);

      expect(service.messages$.next).toHaveBeenNthCalledWith(2, [
        testMessageFromServer,
      ]);
    });
  });

  describe('update', () => {
    it('should send update command and wait for response', async () => {
      const testMessageBeforeUpdate = {
        createdAt: 'test-ISOString',
        createdBy: 'test-currentUserId',
        messageId: 'test-guid',
        text: 'test-text',
      };

      const testMessageAfterLocalUpdate = {
        createdAt: 'test-ISOString',
        createdBy: 'test-currentUserId',
        messageId: 'test-guid',
        text: 'test-text-updated',
        updated: true,
        updatedAt: 'test-ISOString',
        updatedBy: 'test-currentUserId',
      };

      const testMessageFromServer = {
        createdAt: 'test-ISOString-from-server',
        createdBy: 'test-currentUserId-from-server',
        messageId: 'test-guid',
        text: 'test-text-from-server',
        updated: true,
        updatedAt: 'test-ISOString-from-server',
        updatedBy: 'test-currentUserId-from-server',
      };

      service.messages$.next([testMessageBeforeUpdate]);

      service.currentUserId = 'test-currentUserId';

      jest.spyOn(window, 'Date').mockImplementation(
        () =>
          ({
            toISOString: () => 'test-ISOString',
          } as any)
      );

      jest
        .spyOn(webSocketService, 'sendCommandAndWaitForResponse')
        .mockResolvedValue({
          message: testMessageFromServer,
        } as UpdateCommandResponse);

      jest.spyOn(service.messages$, 'next');

      expect(service.messages$.getValue()).toEqual([testMessageBeforeUpdate]);

      await service.update({
        createdAt: 'test-ISOString',
        createdBy: 'test-currentUserId',
        messageId: 'test-guid',
        text: 'test-text-updated',
      });

      expect(
        webSocketService.sendCommandAndWaitForResponse
      ).toHaveBeenCalledWith('UPDATE_COMMAND', {
        userId: service.currentUserId,
        message: testMessageAfterLocalUpdate,
      });

      expect(service.messages$.next).toHaveBeenCalledTimes(2);

      expect(service.messages$.next).toHaveBeenNthCalledWith(1, [
        testMessageAfterLocalUpdate,
      ]);

      expect(service.messages$.next).toHaveBeenNthCalledWith(2, [
        testMessageFromServer,
      ]);
    });
  });

  describe('delete', () => {
    it('should send delete command and wait for response', async () => {
      const testMessageBeforeDelete = {
        createdAt: 'test-ISOString',
        createdBy: 'test-currentUserId',
        messageId: 'test-guid',
        text: 'test-text',
      };

      const testMessageAfterLocalDelete = {
        createdAt: 'test-ISOString',
        createdBy: 'test-currentUserId',
        messageId: 'test-guid',
        text: 'test-text-updated',
        deleted: true,
        deletedAt: 'test-ISOString',
        deletedBy: 'test-currentUserId',
      };

      const testMessageFromServer = {
        createdAt: 'test-ISOString-from-server',
        createdBy: 'test-currentUserId-from-server',
        messageId: 'test-guid',
        text: 'test-text-from-server',
        deleted: true,
        deletedAt: 'test-ISOString-from-server',
        deletedBy: 'test-currentUserId-from-server',
      };

      service.messages$.next([testMessageBeforeDelete]);

      service.currentUserId = 'test-currentUserId';

      jest.spyOn(window, 'Date').mockImplementation(
        () =>
          ({
            toISOString: () => 'test-ISOString',
          } as any)
      );

      jest
        .spyOn(webSocketService, 'sendCommandAndWaitForResponse')
        .mockResolvedValue({
          message: testMessageFromServer,
        } as DeleteCommandResponse);

      jest.spyOn(service.messages$, 'next');

      expect(service.messages$.getValue()).toEqual([testMessageBeforeDelete]);

      await service.delete({
        createdAt: 'test-ISOString',
        createdBy: 'test-currentUserId',
        messageId: 'test-guid',
        text: 'test-text-updated',
      });

      expect(
        webSocketService.sendCommandAndWaitForResponse
      ).toHaveBeenCalledWith('DELETE_COMMAND', {
        userId: service.currentUserId,
        message: testMessageAfterLocalDelete,
      });

      expect(service.messages$.next).toHaveBeenCalledTimes(2);

      expect(service.messages$.next).toHaveBeenNthCalledWith(1, [
        testMessageAfterLocalDelete,
      ]);

      expect(service.messages$.next).toHaveBeenNthCalledWith(2, [
        testMessageFromServer,
      ]);
    });
  });

  describe('replaceMessage', () => {
    it('should replace message in array of message by message id', () => {
      const result = service['replaceMessage'](
        [
          {
            messageId: 'test-messageId-1',
            text: 'test-text-1',
          },
          {
            messageId: 'test-messageId-2',
            text: 'test-text-2',
          },
        ],
        {
          messageId: 'test-messageId-1',
          text: 'test-text-1-updated',
        }
      );

      expect(result).toEqual([
        {
          messageId: 'test-messageId-1',
          text: 'test-text-1-updated',
        },
        {
          messageId: 'test-messageId-2',
          text: 'test-text-2',
        },
      ]);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe', async () => {
      jest.spyOn(service.connectionSubscription, 'unsubscribe');
      jest.spyOn(service.messageChangedCommandSubscription, 'unsubscribe');

      service.ngOnDestroy();

      expect(service.connectionSubscription.unsubscribe).toHaveBeenCalled();
      expect(
        service.messageChangedCommandSubscription.unsubscribe
      ).toHaveBeenCalled();
    });
  });
});
