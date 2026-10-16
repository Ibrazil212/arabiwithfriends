import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { ChatMessage, sendChat, subscribeChat } from '../../services/multiplayer';

interface ChatPanelProps {
  gameId: string;
  myUid: string;
  myName: string;
}

/** Chat shown as a floating icon; clicking it opens a small chat window. */
export function ChatPanel({ gameId, myUid, myName }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeChat(gameId, setMessages), [gameId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const toSend = text;
    setText('');
    try {
      await sendChat(gameId, myUid, myName, toSend);
    } catch (err) {
      console.error('Chat send failed', err);
      setText(toSend);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Chat"
        className="fixed right-3 bottom-44 z-30 w-12 h-12 rounded-full bg-slate-900 text-teal-300 shadow-lg flex items-center justify-center"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        {!isOpen && messages.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </button>

      {isOpen && (
        <section className="fixed right-3 bottom-60 z-30 w-[300px] max-w-[calc(100vw-1.5rem)] bg-slate-900/95 rounded-2xl p-3 flex flex-col gap-2 text-white shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300">Chat</h3>
          <div ref={listRef} className="h-48 overflow-y-auto space-y-1.5 pr-1">
            {messages.length === 0 && <p className="text-xs text-slate-400">Say hello to your opponent.</p>}
            {messages.map((m) => (
              <div key={m.id} className="text-xs break-words">
                <span className={`font-bold ${m.uid === myUid ? 'text-teal-300' : 'text-amber-300'}`}>{m.name}: </span>
                <span>{m.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={300}
              placeholder="Type a message..."
              className="flex-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-white outline-none"
            />
            <button type="submit" className="px-3 rounded-lg bg-teal-600 text-xs font-bold">
              Send
            </button>
          </form>
        </section>
      )}
    </>
  );
}
