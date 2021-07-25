import { ChatMessage } from "./chat-message.model";

export interface SendCommandRequest {
  userId: string;
  message: ChatMessage;
}

export interface SendCommandResponse {
  message: ChatMessage;
}
