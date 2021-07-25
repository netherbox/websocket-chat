import { ChatMessage } from './chat-message.model';

export interface DeleteCommandRequest {
  userId: string;
  message: ChatMessage;
}

export interface DeleteCommandResponse {
  message: ChatMessage;
}
