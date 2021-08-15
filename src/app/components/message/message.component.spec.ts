import { ComponentFixture, TestBed } from '@angular/core/testing';
import { runOnPushChangeDetection } from '../../utils/run-on-push-change-detection';

import { ChatMessage } from '../../models/chat-message.model';
import { ChatMessageComponent } from './message.component';

describe('ChatMessageComponent', () => {
  let component: ChatMessageComponent;
  let fixture: ComponentFixture<ChatMessageComponent>;
  let testMessage: ChatMessage;

  beforeEach(async () => {
    testMessage = {
      messageId: 'test-messageId',
      text: 'test-text',
    };

    await TestBed.configureTestingModule({
      declarations: [ChatMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatMessageComponent);
    component = fixture.componentInstance;

    component.message = { ...testMessage };

    fixture.detectChanges();
  });

  it('should successfully create component with expected html', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement).toMatchSnapshot();
  });

  describe('editable', () => {
    it('should render tools bar if editable true', () => {
      component.editable = true;
      runOnPushChangeDetection(fixture);

      expect(fixture.nativeElement.querySelector('.tools')).toBeTruthy();
      expect(fixture.nativeElement).toMatchSnapshot();
    });

    it('should render tools bar if editable false', () => {
      component.editable = false;
      runOnPushChangeDetection(fixture);

      expect(fixture.nativeElement.querySelector('.tools')).toBeFalsy();
      expect(fixture.nativeElement).toMatchSnapshot();
    });
  });

  describe('onUpdateClick', () => {
    it('should show update form', () => {
      component.onUpdateClick();
      runOnPushChangeDetection(fixture);

      expect(component.showUpdateForm).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.update')).toBeTruthy();
      expect(fixture.nativeElement).toMatchSnapshot();
    });
  });

  describe('onUpdateMessageCancel', () => {
    it('should hide update form', () => {
      component.onUpdateMessageCancel();
      runOnPushChangeDetection(fixture);

      expect(component.showUpdateForm).toBeFalsy();
      expect(fixture.nativeElement.querySelector('.update')).toBeFalsy();
      expect(fixture.nativeElement).toMatchSnapshot();
    });
  });

  describe('onUpdateMessageSubmit', () => {
    it('should emit update event', () => {
      jest.spyOn(component.update, 'emit');

      component.onUpdateMessageSubmit({
        value: 'test-input-value',
      } as unknown as HTMLInputElement);
      runOnPushChangeDetection(fixture);

      expect(component.update.emit).toBeCalledWith({
        ...testMessage,
        text: 'test-input-value',
      });
      expect(component.showUpdateForm).toBeFalsy();
      expect(fixture.nativeElement.querySelector('.update')).toBeFalsy();
      expect(fixture.nativeElement).toMatchSnapshot();
    });
  });

  describe('onDeleteClick', () => {
    it('should emit delete event', () => {
      jest.spyOn(component.delete, 'emit');

      component.onDeleteClick();
      runOnPushChangeDetection(fixture);

      expect(component.delete.emit).toBeCalledWith(testMessage);
    });
  });
});
