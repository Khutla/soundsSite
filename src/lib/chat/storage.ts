import type { ChatMessage } from "@/lib/chat/types";

export const CHAT_STORAGE_KEY = "mkhsounds-support-chat-v1";

export function loadChatMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is ChatMessage =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        typeof item.createdAt === "number",
    );
  } catch {
    return [];
  }
}

export function saveChatMessages(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Quota exceeded or private browsing — ignore silently.
  }
}

export function clearChatMessages() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CHAT_STORAGE_KEY);
}
