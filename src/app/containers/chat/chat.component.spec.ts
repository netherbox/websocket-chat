import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { ChatComponent } from './chat.component';
import { ChatService } from '../../services/chat.service';
import { ChatMessageComponent } from '../../components/message/message.component';
import { ChatMessage } from 'src/app/models/chat-message.model';

describe('ChatComponent', () => {
  let testMessage: ChatMessage;
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let messagesMock$: BehaviorSubject<boolean>;
  let chatService: ChatService;

  beforeEach(async () => {
    testMessage = {
      messageId: 'test-messageId',
      text: 'test-text',
    };

    messagesMock$ = new BehaviorSubject<boolean>(false);

    await TestBed.configureTestingModule({
      declarations: [ChatComponent, ChatMessageComponent],
      providers: [
        {
          provide: ChatService,
          useValue: {
            messages$: messagesMock$,
            send: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    chatService = TestBed.inject(ChatService);
  });

  it('should successfully create component with empty list', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement).toMatchSnapshot();
  });

  it('should set messagesSubcription on creation', () => {
    expect(component.messagesSubcription).toBeTruthy();
  });

  it('should call scroll down after view initialized', () => {
    jest.spyOn(component, 'scrollDown').mockImplementation();

    component.ngAfterViewInit();

    expect(component.scrollDown).toHaveBeenCalled();
  });

  describe('scrollDown', () => {
    it('should call scroll down after view initialized', () => {
      jest.useFakeTimers();

      component.messagesContainer = {
        nativeElement: {
          scrollTop: 0,
          scrollHeight: 1000,
        },
      };

      component.scrollDown();

      jest.runAllTimers();

      expect(component.messagesContainer.nativeElement.scrollTop).toEqual(1000);
    });

    it('should do nothing if messagesContainer is not initialized', () => {
      jest.useFakeTimers();

      component.messagesContainer = undefined;

      component.scrollDown();

      jest.runAllTimers();

      expect(component.messagesContainer).toBeUndefined();
    });
  });

  describe('onSendMessageSubmit', () => {
    it('should   view initialized', () => {
      jest.spyOn(component, 'sendMessage');

      const mockInput = {
        value: 'test-input-value',
      } as unknown as HTMLInputElement;

      component.onSendMessageSubmit(mockInput);

      expect(component.sendMessage).toHaveBeenCalledWith('test-input-value');
      expect(mockInput.value).toEqual('');
    });
  });

  describe('messageById', () => {
    it('should return message id to be used by ngFor trackBy', () => {
      const result = component.messageById(0, testMessage);

      expect(result).toEqual(testMessage.messageId);
    });
  });

  describe('sendMessage', () => {
    it('should call send method of chatService', async () => {
      jest.spyOn(chatService, 'send').mockResolvedValue();

      await component.sendMessage('test-text');

      expect(chatService.send).toHaveBeenCalledWith('test-text');
    });
  });

  describe('onUpdateMessage', () => {
    it('should call update method of chatService', async () => {
      jest.spyOn(chatService, 'update').mockResolvedValue();

      await component.onUpdateMessage(testMessage);

      expect(chatService.update).toHaveBeenCalledWith(testMessage);
    });
  });

  describe('onDeleteMessage', () => {
    it('should call delete method of chatService', async () => {
      jest.spyOn(chatService, 'delete');

      component.onDeleteMessage(testMessage);

      expect(chatService.delete).toHaveBeenCalledWith(testMessage);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from messagesSubcription', async () => {
      jest.spyOn(component.messagesSubcription, 'unsubscribe');

      component.ngOnDestroy();

      expect(component.messagesSubcription.unsubscribe).toHaveBeenCalled();
    });
  });
});
