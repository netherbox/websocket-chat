import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { AppComponent } from './app.component';
import { ChatService } from './services/chat.service';
import { ParticipantsListComponent } from './components/participants-list/participants-list.component';
import { ChatComponent } from './containers/chat/chat.component';
import { ChatMessageComponent } from './components/message/message.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let connectedMock$: BehaviorSubject<boolean>;
  let chatService: ChatService;

  beforeEach(async () => {
    connectedMock$ = new BehaviorSubject<boolean>(false);

    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        ParticipantsListComponent,
        ChatComponent,
        ChatMessageComponent,
      ],
      providers: [
        {
          provide: ChatService,
          useValue: {
            connected$: connectedMock$,
            join: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    chatService = TestBed.inject(ChatService);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('connected', () => {
    it('should show message if not connected', () => {
      connectedMock$.next(false);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Connecting...');
    });

    it('should not show message if connected', () => {
      connectedMock$.next(true);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).not.toContain('Connecting...');
    });
  });

  describe('onJoinSubmit', () => {
    it('should call join', () => {
      jest.spyOn(component, 'join').mockImplementation();

      component.onJoinSubmit('test-nickName');

      expect(component.join).toHaveBeenCalledWith('test-nickName');
    });
  });

  describe('join', () => {
    it('should call join', async () => {
      jest.spyOn(chatService, 'join').mockImplementation();

      const joinPromise = component.join('test-nickName');

      expect(component.joining).toBeTruthy();

      await joinPromise;

      expect(chatService.join).toHaveBeenCalledWith('test-nickName');

      expect(component.joining).toBeFalsy();
    });
  });
});
