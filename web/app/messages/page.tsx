"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  MessageSquare, Send, Loader2, Bell, User, Inbox
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Msg = {
  id: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export default function MessagesPage() {
  const [unread, setUnread] = useState<Msg[]>([]);
  const [conversation, setConversation] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // compose form
  const [receiverId, setReceiverId] = useState("");
  const [listingId, setListingId] = useState("");
  const [content, setContent] = useState("");
  const [activeThreadKey, setActiveThreadKey] = useState<{ otherId: string; lid: string } | null>(null);

  const endRef = useRef<HTMLDivElement>(null);

  const myId = typeof window !== "undefined" ? localStorage.getItem("userId") ?? "" : "";

  useEffect(() => {
    loadUnread();
  }, []);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  async function loadUnread() {
    setIsLoading(true);
    try {
      const data = await apiFetch<Msg[]>("/api/messages/unread");
      setUnread(data || []);
    } catch { /* not logged in yet */ }
    finally { setIsLoading(false); }
  }

  async function openThread(otherId: string, lid: string) {
    setActiveThreadKey({ otherId: lid, lid });
    setReceiverId(otherId);
    setListingId(lid);
    try {
      const data = await apiFetch<Msg[]>(`/api/messages/conversation?otherUserId=${otherId}&listingId=${lid}`);
      setConversation(data || []);
      // mark as read
      const ids = (data || []).filter(m => !m.isRead && m.receiverId === myId).map(m => m.id);
      if (ids.length) {
        await apiFetch("/api/messages/read", { method: "POST", body: JSON.stringify(ids) });
        loadUnread();
      }
    } catch (err) { console.error(err); }
  }

  async function send() {
    if (!content.trim() || !receiverId || !listingId) return;
    setIsSending(true);
    try {
      const msg = await apiFetch<Msg>(
        `/api/messages/send?receiverId=${receiverId}&listingId=${listingId}`,
        { method: "POST", body: content.trim(), headers: { "Content-Type": "text/plain" } }
      );
      setConversation(c => [...c, msg]);
      setContent("");
    } catch (err) { console.error(err); }
    finally { setIsSending(false); }
  }

  // group unread by listing+sender for quick thread view
  const threads = unread.reduce<Record<string, Msg[]>>((acc, m) => {
    const key = `${m.listingId}:${m.senderId}`;
    acc[key] = [...(acc[key] || []), m];
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-6xl p-8 md:p-10 space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">
          <MessageSquare className="text-accent" size={30} />
          Messages
        </h1>
        <p className="mt-1 text-sm text-ink-muted">Direct communication with guests and vendors</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Inbox sidebar */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <Inbox size={15} className="text-accent" />
              Inbox
            </h2>
            {unread.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-canvas">
                {Object.keys(threads).length}
              </span>
            )}
          </div>

          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-mid" />
            ))
          ) : Object.keys(threads).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-ink-muted">
              <Bell size={24} className="mx-auto mb-3 opacity-30" />
              No unread messages
            </div>
          ) : (
            Object.entries(threads).map(([key, msgs]) => {
              const latest = msgs[msgs.length - 1];
              const isActive = activeThreadKey?.otherId === key;
              return (
                <motion.button
                  key={key}
                  layout
                  onClick={() => openThread(latest.senderId, latest.listingId)}
                  className={cn(
                    "w-full rounded-2xl border p-4 text-left transition-all",
                    isActive
                      ? "border-accent/30 bg-accent/10"
                      : "border-border bg-surface-low hover:border-accent/20"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-mid">
                        <User size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-bold truncate max-w-[120px]">{latest.senderId.slice(0, 8)}</div>
                        <div className="text-[10px] text-ink-muted truncate max-w-[120px]">
                          Listing: {latest.listingId.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
                      {msgs.length}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-ink-muted line-clamp-1">{latest.content}</p>
                  <div className="mt-1 text-[10px] text-ink-faint">{new Date(latest.createdAt).toLocaleString()}</div>
                </motion.button>
              );
            })
          )}
        </div>

        {/* Conversation panel */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface-low lg:col-span-2 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-semibold text-sm">
              {activeThreadKey ? `Thread · Listing ${activeThreadKey.lid.slice(0, 8)}` : "Select a thread"}
            </h2>
            {!activeThreadKey && (
              <span className="text-xs text-ink-muted">or compose a new message below</span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[300px] max-h-[400px]">
            <AnimatePresence initial={false}>
              {conversation.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-ink-muted">
                  {activeThreadKey ? "No messages yet." : "Open a thread from your inbox."}
                </div>
              ) : (
                conversation.map(m => {
                  const isMe = m.senderId === myId;
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex", isMe ? "justify-end" : "justify-start")}
                    >
                      <div className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-3 text-sm",
                        isMe
                          ? "rounded-br-sm bg-accent text-canvas"
                          : "rounded-bl-sm bg-surface-mid text-ink"
                      )}>
                        <p className="leading-relaxed">{m.content}</p>
                        <div className={cn("mt-1 text-[10px] opacity-60", isMe ? "text-right" : "")}>
                          {new Date(m.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          {/* Compose */}
          <div className="border-t border-border p-5 space-y-3">
            {!activeThreadKey && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Recipient ID</label>
                  <input
                    id="msg-receiver-id"
                    className="mt-1 w-full rounded-xl border border-border bg-surface-mid p-2.5 text-xs font-mono outline-none focus:border-accent/50"
                    placeholder="UUID of recipient"
                    value={receiverId}
                    onChange={e => setReceiverId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Listing ID</label>
                  <input
                    id="msg-listing-id"
                    className="mt-1 w-full rounded-xl border border-border bg-surface-mid p-2.5 text-xs font-mono outline-none focus:border-accent/50"
                    placeholder="UUID of listing"
                    value={listingId}
                    onChange={e => setListingId(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <textarea
                id="msg-content"
                rows={2}
                placeholder="Type a message..."
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                className="flex-1 resize-none rounded-xl border border-border bg-surface-mid p-3 text-sm outline-none transition-all focus:border-accent/50 focus:ring-4 focus:ring-accent/5"
              />
              <button
                onClick={send}
                disabled={isSending || !content.trim()}
                id="send-message-btn"
                aria-label="Send message"
                className="flex h-auto w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-canvas transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <p className="text-[10px] text-ink-muted">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </main>
  );
}
