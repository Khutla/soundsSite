import { NextResponse } from "next/server";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat/system-prompt";
import type { ChatApiError, ChatApiResponse, ClientChatPayload } from "@/lib/chat/types";

const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 4000;
const MAX_TOTAL_CHARS = 24000;

type OpenAiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message } satisfies ChatApiError, { status });
}

function validatePayload(body: unknown): ClientChatPayload | null {
  if (typeof body !== "object" || body === null) return null;

  const messages = (body as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const sanitized: ClientChatPayload["messages"] = [];

  for (const item of messages) {
    if (typeof item !== "object" || item === null) return null;

    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;

    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;

    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_MESSAGE_CHARS) return null;

    sanitized.push({ role, content: trimmed });
  }

  if (sanitized.length > MAX_MESSAGES) return null;
  if (sanitized.at(-1)?.role !== "user") return null;

  const totalChars = sanitized.reduce((sum, m) => sum + m.content.length, 0);
  if (totalChars > MAX_TOTAL_CHARS) return null;

  return { messages: sanitized };
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return jsonError("Chat assistant is not configured.", 503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const payload = validatePayload(body);
  if (!payload) {
    return jsonError("Invalid message history.", 400);
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const openAiMessages: OpenAiMessage[] = [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
    ...payload.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: openAiMessages,
        temperature: 0.6,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("OpenAI chat error:", response.status, detail);
      return jsonError("The assistant is temporarily unavailable.", 502);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string | null } }[];
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return jsonError("Empty response from assistant.", 502);
    }

    return NextResponse.json({
      message: { role: "assistant", content },
    } satisfies ChatApiResponse);
  } catch (error) {
    console.error("Chat route failure:", error);
    return jsonError("Could not reach the assistant.", 500);
  }
}
