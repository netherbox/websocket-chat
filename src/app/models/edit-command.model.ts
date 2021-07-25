import { ChatMessage } from './chat-message.model';

export interface UpdateCommandRequest {
  userId: string;
  message: ChatMessage;
}

export interface UpdateCommandResponse {
  message: ChatMessage;
}
