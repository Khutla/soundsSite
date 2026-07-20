"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  clearChatMessages,
  loadChatMessages,
  saveChatMessages,
} from "@/lib/chat/storage";
import type { ChatApiError, ChatApiResponse, ChatMessage } from "@/lib/chat/types";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey — I'm your MkhSounds install assistant. Ask me about cable runs, amp sizing, troubleshooting, or building a system that actually performs.",
  createdAt: 0,
};

let messageSeq = 0;
function nextMessageId(prefix: string) {
  messageSeq += 1;
  return `${prefix}-${messageSeq}`;
}

function TypingIndicator() {
  return (
    <div className="flex animate-chat-fade-in items-end gap-2.5">
      <BotAvatar />
      <div className="rounded-2xl rounded-tl-md border border-zinc-800 bg-zinc-900/90 px-4 py-3">
        <span className="flex gap-1" aria-label="Assistant is typing">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400/80"
              style={{ animationDelay: `${i * 140}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

function BotAvatar() {
  return (
    <div
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-[0_0_12px_rgba(245,158,11,0.12)]"
    >
      <svg
        className="h-4 w-4 text-amber-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z"
        />
      </svg>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex animate-chat-fade-in gap-2.5 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && <BotAvatar />}
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-md bg-amber-500 text-zinc-950"
            : "rounded-tl-md border border-zinc-800 bg-zinc-900/90 text-zinc-100"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = loadChatMessages();
    return stored.length > 0 ? stored : [WELCOME_MESSAGE];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    saveChatMessages(messages);
  }, [messages, hydrated]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  const handleClear = useCallback(() => {
    clearChatMessages();
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    setInput("");
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      id: nextMessageId("user"),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await res.json()) as ChatApiResponse | ChatApiError;

      if (!res.ok) {
        const errText = "error" in data ? data.error : "Something went wrong.";
        throw new Error(errText);
      }

      if (!("message" in data)) {
        throw new Error("Unexpected response from assistant.");
      }

      const assistantMessage: ChatMessage = {
        id: nextMessageId("assistant"),
        role: "assistant",
        content: data.message.content,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message.");
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage();
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-labelledby="chat-widget-title"
          aria-modal="true"
          className="animate-chat-panel-in fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-[60] flex h-[min(500px,calc(100dvh-6rem))] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:bottom-6 sm:right-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 px-4 py-3">
            <div className="min-w-0">
              <p
                id="chat-widget-title"
                className="truncate text-sm font-semibold tracking-wide text-white"
              >
                MkhSounds Assistant
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                AI install support
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 transition hover:bg-zinc-800 hover:text-amber-300 disabled:opacity-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {loading && <TypingIndicator />}
          </div>

          {/* Error */}
          {error && (
            <p className="border-t border-red-900/40 bg-red-950/30 px-4 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          {/* Input */}
          <form
            onSubmit={onSubmit}
            className="border-t border-zinc-800/80 p-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onInputKeyDown}
                rows={1}
                disabled={loading}
                placeholder="Ask about gear, installs, cable runs…"
                className="max-h-24 min-h-[42px] flex-1 resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-amber-500/40 placeholder:text-zinc-500 focus:ring-2 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex h-[42px] shrink-0 items-center justify-center rounded-xl bg-amber-500 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-zinc-600">
              Enter to send · Shift+Enter for new line
            </p>
          </form>
        </div>
      )}

      {!open && (
        <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-4 z-[60] flex flex-col items-end gap-2.5 sm:bottom-6 sm:right-6">
          <div
            className="animate-chat-fade-in animate-chat-tooltip-float relative rounded-2xl rounded-br-md border border-zinc-700/90 bg-zinc-900/95 px-3.5 py-2 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm"
            aria-hidden
          >
            Coming Soon
            <span
              className="absolute -bottom-[6px] right-5 h-3 w-3 rotate-45 border-r border-b border-zinc-700/90 bg-zinc-900/95"
              aria-hidden
            />
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open support chat — coming soon"
            aria-expanded={open}
            className="animate-chat-fab-pulse flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/40 bg-gradient-to-br from-zinc-900 to-zinc-950 text-amber-400 shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition hover:scale-105 hover:border-amber-400/70 hover:text-amber-300"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z"
              />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
