"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppShell } from "@/components/shell/AppShell";
import { Card, Chip } from "@/components/primitives/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/lib/auth-context";
import { RefreshCw, Search, Send, Paperclip, Smile, MessageSquare, Sparkles, BookOpen, Users, CheckCheck, Plus } from "lucide-react";

type ChatMessage = {
  messageId: number;
  conversationId: number;
  senderEmail: string;
  senderName: string;
  content: string;
  sentAt: string;
};

type ChatConversation = {
  conversationId: number;
  type: string;
  referenceId: number | null;
  participants: string[];
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
};

function prettifyHandle(value: string) {
  const localPart = value.split("@")[0] || value;
  const cleaned = localPart.replace(/[._-]+/g, " ").trim();
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || value;
}

function initials(value: string) {
  return prettifyHandle(value)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function conversationTitle(conversation: ChatConversation, currentEmail?: string) {
  const others = conversation.participants.filter((participant) => participant !== currentEmail);
  if (others.length === 0) return "Study group";
  if (others.length === 1) return prettifyHandle(others[0]);
  return `${prettifyHandle(others[0])} +${others.length - 1}`;
}

function conversationSubtitle(conversation: ChatConversation) {
  if (conversation.type === "TeacherStudent") return "Teacher chat";
  if (conversation.participants.length > 2) return "Group chat";
  return "Friend chat";
}

function conversationDedupeKey(conversation: ChatConversation, currentEmail?: string) {
  if (conversation.type === "Friend" || conversation.type === "TeacherStudent") {
    const others = conversation.participants
      .filter((participant) => participant !== currentEmail)
      .map((participant) => participant.toLowerCase())
      .sort();
    return `${conversation.type}:${others.join("|")}`;
  }

  return `${conversation.type}:${conversation.referenceId ?? conversation.conversationId}`;
}

function conversationGroupLabel(conversation: ChatConversation, currentEmail?: string) {
  if (conversation.type === "Friend" || conversation.type === "TeacherStudent") {
    return `Messages from ${conversationTitle(conversation, currentEmail)}`;
  }

  if (conversation.type === "Lobby") return `Lobby messages`;
  if (conversation.type === "Match") return `Match messages`;
  return "Messages";
}

function formatTime(sentAt?: string) {
  if (!sentAt) return "Now";
  const date = new Date(sentAt);
  if (Number.isNaN(date.getTime())) return "Now";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const { user } = useAuth();
  const { conversations, messages, loading, joinConversation, leaveConversation, sendMessage, loadConversations } = useChat();
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const displayName = prettifyHandle(user?.email || "Student");

  const conversationGroups = useMemo(() => {
    const groups = new Map<string, { key: string; label: string; title: string; conversations: ChatConversation[] }>();

    (conversations as ChatConversation[]).forEach((conversation) => {
      const key = conversationDedupeKey(conversation, user?.email);
      const existing = groups.get(key);

      if (existing) {
        existing.conversations.push(conversation);
      } else {
        groups.set(key, {
          key,
          label: conversationGroupLabel(conversation, user?.email),
          title: conversationTitle(conversation, user?.email),
          conversations: [conversation],
        });
      }
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        conversations: group.conversations.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.conversations[0]?.updatedAt || 0).getTime() -
          new Date(a.conversations[0]?.updatedAt || 0).getTime(),
      );
  }, [conversations, user?.email]);

  useEffect(() => {
    if (conversationGroups.length === 0) {
      setActiveGroupKey(null);
      return;
    }

    if (!activeGroupKey || !conversationGroups.some((group) => group.key === activeGroupKey)) {
      setActiveGroupKey(conversationGroups[0].key);
    }
  }, [conversationGroups, activeGroupKey]);

  const activeGroup = useMemo(
    () => conversationGroups.find((group) => group.key === activeGroupKey) || null,
    [conversationGroups, activeGroupKey],
  );

  const activeConversationIds = useMemo(
    () => activeGroup?.conversations.map((conversation) => conversation.conversationId) ?? [],
    [activeGroup],
  );

  useEffect(() => {
    if (activeConversationIds.length === 0) return;
    activeConversationIds.forEach((conversationId) => joinConversation(conversationId));
    return () => activeConversationIds.forEach((conversationId) => leaveConversation(conversationId));
  }, [activeConversationIds, joinConversation, leaveConversation]);

  const filteredConversationGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversationGroups;

    return conversationGroups
      .map((group) => ({
        ...group,
        conversations: group.conversations.filter((conversation) => {
          const title = conversationTitle(conversation, user?.email).toLowerCase();
          const preview = (conversation.lastMessage?.content || "").toLowerCase();
          const participants = conversation.participants.join(" ").toLowerCase();
          return group.label.toLowerCase().includes(q) || title.includes(q) || preview.includes(q) || participants.includes(q);
        }),
      }))
      .filter((group) => group.conversations.length > 0);
  }, [conversationGroups, search, user?.email]);

  const activeConversation = activeGroup?.conversations[0] ?? null;

  const activeMessages = useMemo(
    () =>
      activeConversationIds
        .flatMap((conversationId) => (messages[conversationId] ?? []) as ChatMessage[])
        .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()),
    [messages, activeConversationIds],
  );
  const activeMessageGroups = useMemo(() => {
    return activeMessages.reduce<Array<{ senderEmail: string; senderName: string; messages: ChatMessage[] }>>((groups, message) => {
      const lastGroup = groups[groups.length - 1];

      if (lastGroup?.senderEmail === message.senderEmail) {
        lastGroup.messages.push(message);
        return groups;
      }

      groups.push({
        senderEmail: message.senderEmail,
        senderName: message.senderName,
        messages: [message],
      });
      return groups;
    }, []);
  }, [activeMessages]);

  const handleSend = async () => {
    if (!activeConversation || !draft.trim()) return;
    const next = draft.trim();
    setDraft("");
    await sendMessage(activeConversation.conversationId, next);
  };

  const quickPrompts = [
    "Can you review my approach?",
    "I’m stuck on the edge cases.",
    "Sharing my solution draft.",
    "Want to run a practice match?",
  ];

  return (
    <ProtectedRoute allowedRoles={["Student"]}>
      <AppShell role="student" current="chat">
        <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col overflow-hidden bg-[var(--surface)] text-foreground">
          <div className="border-b border-border bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">DIRECT MESSAGES</div>
                <h1 className="mt-1 flex items-center gap-2 font-display text-lg font-semibold sm:text-xl">
                  <MessageSquare className="size-5 text-primary" /> Messages
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">Keep in touch with friends, teammates, and teachers while you battle.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 bg-white"
                onClick={() => loadConversations().catch(() => {})}
              >
                <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_300px]">
            {/* Threads */}
            <aside className="flex min-h-0 flex-col overflow-hidden border-r border-border bg-white">
              <div className="border-b border-border p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search messages…"
                    className="h-9 bg-[var(--input-background)] pl-9"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredConversationGroups.length > 0 ? (
                  filteredConversationGroups.map((group) => {
                    const conversation = group.conversations[0];
                    const active = group.key === activeGroupKey;
                    const preview = conversation.lastMessage?.content || "No messages yet. Say hello.";
                    const stamp = formatTime(conversation.lastMessage?.sentAt || conversation.updatedAt);
                    const subtitle = group.conversations.length > 1
                      ? `${group.conversations.length} threads`
                      : conversationSubtitle(conversation);

                    return (
                      <button
                        key={group.key}
                        onClick={() => setActiveGroupKey(group.key)}
                        className={`flex w-full items-start gap-3 border-b border-border px-3 py-3 text-left transition ${active ? "bg-primary/[0.05]" : "hover:bg-muted/30"}`}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="size-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials(group.title)}</AvatarFallback>
                          </Avatar>
                          <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-white ${active ? "bg-success" : "bg-muted-foreground/40"}`} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="truncate text-sm font-medium">{group.title}</div>
                            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{stamp}</span>
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <div className="truncate text-xs text-muted-foreground">{preview}</div>
                            <Chip tone={group.conversations.length > 1 ? "warning" : "neutral"} className="shrink-0">{subtitle}</Chip>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-10 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <MessageSquare className="size-6" />
                    </div>
                    <h2 className="mt-4 font-display text-lg font-semibold">No conversations yet</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Once you start chatting with a friend or teacher, your threads will appear here.
                    </p>
                    <Button
                      size="sm"
                      className="mt-4 bg-primary hover:bg-[#C62828]"
                      onClick={() => setSearch("")}
                    >
                      <Plus className="size-4" />
                      Clear search
                    </Button>
                  </div>
                )}
              </div>
            </aside>

            {/* Conversation */}
            <section className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--surface)]">
              {activeConversation ? (
                <>
                  <header className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-white px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials(conversationTitle(activeConversation, user?.email))}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-display font-semibold leading-tight">{conversationTitle(activeConversation, user?.email)}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="outline" className="bg-white">
                        <Paperclip className="size-3.5" />
                      </Button>
                    </div>
                  </header>

                  <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    {activeMessages.length === 0 ? (
                      <div className="flex h-full min-h-[240px] items-center justify-center">
                        <div className="max-w-sm rounded-2xl border border-border bg-white p-6 text-center shadow-[0_1px_2px_rgba(30,27,26,0.04)]">
                          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <MessageSquare className="size-6" />
                          </div>
                          <h2 className="mt-4 font-display text-lg font-semibold">Start the conversation</h2>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Send a quick note, share a solution idea, or ask for a hint.
                          </p>
                        </div>
                      </div>
                    ) : (
                      activeMessageGroups.map((group) => {
                        const mine = group.senderEmail === user?.email;
                        const lastMessage = group.messages[group.messages.length - 1];
                        return (
                          <div key={`${group.senderEmail}-${group.messages[0].messageId}`} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                            {!mine && (
                              <Avatar className="size-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{initials(group.senderName || group.senderEmail)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                              {!mine && <div className="mb-1 px-1 text-xs font-medium text-muted-foreground">{prettifyHandle(group.senderName || group.senderEmail)}</div>}
                              <div className={`flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
                                {group.messages.map((message, index) => (
                                  <div
                                    key={message.messageId}
                                    className={`px-3.5 py-2 text-sm shadow-sm ${
                                      mine ? "bg-primary text-white" : "bg-white text-foreground"
                                    } ${
                                      group.messages.length === 1
                                        ? "rounded-2xl"
                                        : mine
                                          ? index === 0
                                            ? "rounded-2xl rounded-br-md"
                                            : index === group.messages.length - 1
                                              ? "rounded-2xl rounded-tr-md"
                                              : "rounded-2xl rounded-r-md"
                                          : index === 0
                                            ? "rounded-2xl rounded-bl-md"
                                            : index === group.messages.length - 1
                                              ? "rounded-2xl rounded-tl-md"
                                              : "rounded-2xl rounded-l-md"
                                    }`}
                                  >
                                    {message.content}
                                  </div>
                                ))}
                              </div>
                              <div className={`mt-1 flex items-center gap-1 font-mono text-[10px] text-muted-foreground ${mine ? "flex-row-reverse" : ""}`}>
                                {formatTime(lastMessage.sentAt)}
                                {mine && <CheckCheck className="size-3 text-primary" />}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <footer className="shrink-0 border-t border-border bg-white p-3">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => setDraft(prompt)}
                          className="rounded-full border border-border bg-white px-3 py-1 text-xs hover:border-primary/30 hover:text-primary"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-end gap-2 rounded-xl border border-border bg-white p-2">
                      <Button size="sm" variant="ghost" className="shrink-0">
                        <Paperclip className="size-4" />
                      </Button>
                      <Input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            void handleSend();
                          }
                        }}
                        placeholder="Reply here…"
                        className="h-9 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                      <Button size="sm" variant="ghost" className="shrink-0">
                        <Smile className="size-4" />
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-[#C62828]" onClick={() => void handleSend()}>
                        <Send className="size-4" />
                        Send
                      </Button>
                    </div>
                  </footer>
                </>
              ) : (
                <div className="flex h-full min-h-[320px] items-center justify-center px-6 text-center">
                  <Card className="max-w-md p-6">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <MessageSquare className="size-6" />
                    </div>
                    <h2 className="mt-4 font-display text-lg font-semibold">Messages</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Open a thread on the left to continue a conversation or start a new study chat.
                    </p>
                  </Card>
                </div>
              )}
            </section>

            {/* Sidebar */}
            <aside className="hidden flex-col border-l border-border bg-white p-4 xl:flex">
              <div className="text-center">
                <Avatar className="mx-auto size-16">
                  <AvatarFallback className="bg-primary text-white">{initials(user?.email || "Student")}</AvatarFallback>
                </Avatar>
                <div className="mt-2 font-display text-base font-semibold">{displayName}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{user?.email || "student@arena.local"}</div>
                <div className="mt-3 flex justify-center gap-1.5">
                  <Chip tone="primary">3 active chats</Chip>
                  <Chip tone="warning">Focus time</Chip>
                </div>
              </div>

              <Card className="mt-4 p-3">
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground">QUICK SUPPORT</div>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="rounded-lg bg-muted/30 p-2">
                    <div className="font-medium">Ask for help early</div>
                    <div className="text-muted-foreground">Share where your solution starts failing and what you’ve tried.</div>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2">
                    <div className="font-medium">Message a teammate</div>
                    <div className="text-muted-foreground">Use quick prompts to keep the conversation moving.</div>
                  </div>
                </div>
              </Card>

              <Card className="mt-3 p-3">
                <div className="flex items-center gap-2 font-display font-semibold">
                  <BookOpen className="size-4 text-primary" />
                  Study notes
                </div>
                <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><Users className="size-3.5 text-primary" /> Friends and teachers can both appear here.</div>
                  <div className="flex items-center gap-2"><Sparkles className="size-3.5 text-primary" /> Keep one thread for solution ideas.</div>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
