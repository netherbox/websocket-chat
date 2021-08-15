import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { AppComponent } from './app.component';
import { ChatService } from './services/chat.service';
import { ParticipantsListComponent } from './components/participants-list/participants-list.component';
import { ChatComponent } from './containers/chat/chat.component';
import { ChatMessageComponent } from './components/message/message.component';

describe('AppComponent', () => {
  let connectedMock$: BehaviorSubject<boolean>;

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
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  describe('connected', () => {
    it('should show message if not connected', () => {
      const fixture = TestBed.createComponent(AppComponent);
      connectedMock$.next(false);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Connecting...');
    });

    it('should not show message if connected', () => {
      const fixture = TestBed.createComponent(AppComponent);
      connectedMock$.next(true);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).not.toContain('Connecting...');
    });
  });
});
