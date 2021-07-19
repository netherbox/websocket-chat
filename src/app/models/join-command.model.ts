import { ChatMessage } from "./chat-message.model";

export interface JoinCommandRequest {
  nickName: string;
}

export interface JoinCommandResponse {
  messages: Array<ChatMessage>;
  participants: Array<string>;
}
