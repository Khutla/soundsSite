export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

export type ClientChatPayload = {
  messages: Pick<ChatMessage, "role" | "content">[];
};

export type ChatApiResponse = {
  message: Pick<ChatMessage, "role" | "content">;
};

export type ChatApiError = {
  error: string;
};
