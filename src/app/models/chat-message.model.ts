export interface ChatMessage {
  messageId: string;
  text: string;
  createdBy: string;
  createdAt: string;
  updated: boolean;
  updatedBy: string;
  updatedAt: string;
  deleted: boolean;
  deletedBy: string;
  deletedAt: string;
}
