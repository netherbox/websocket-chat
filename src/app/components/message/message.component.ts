import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatMessage } from '../../models/chat-message.model';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessageComponent {
  @Input()
  message: ChatMessage = {
    messageId: '',
    text: '',
  };

  @Input()
  editable = false;

  showUpdateForm = false;

  @Output() update: EventEmitter<any> = new EventEmitter();

  @Output() delete: EventEmitter<any> = new EventEmitter();

  onUpdateClick() {
    this.showUpdateForm = true;
  }

  onUpdateMessageSubmit(messageInput: HTMLInputElement): boolean {
    this.update.emit({ ...this.message, text: messageInput.value });
    this.showUpdateForm = false;
    return false;
  }

  onUpdateMessageCancel() {
    this.showUpdateForm = false;
  }

  onDeleteClick() {
    this.delete.emit({ ...this.message });
  }
}
