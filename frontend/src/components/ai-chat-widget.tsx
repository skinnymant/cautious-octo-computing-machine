'use client';

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Msg {
  role: 'user' | 'bot';
  text: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost/api';

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'bot', text: 'Xin chào! Tôi là trợ lý AI của TechMart. Bạn cần tư vấn sản phẩm gì?' },
  ]);
  const [loading, setLoading] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setMsgs((m) => [...m, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMsgs((m) => [...m, { role: 'bot', text: data.reply }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: 'bot', text: 'Xin lỗi, hệ thống đang bận. Vui lòng gọi 1900 1234.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition hover:scale-105"
        aria-label="Trợ lý AI"
      >
        {open ? <X /> : <MessageCircle />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-80 flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="bg-brand px-4 py-3 font-semibold text-white">
            Trợ lý AI TechMart
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === 'user'
                    ? 'ml-auto max-w-[80%] rounded-lg bg-brand px-3 py-2 text-white'
                    : 'mr-auto max-w-[80%] rounded-lg bg-gray-100 px-3 py-2'
                }
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="text-xs text-gray-400">Đang trả lời…</div>}
          </div>
          <div className="flex items-center gap-2 border-t p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Nhập câu hỏi…"
              className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <button onClick={send} className="rounded-md bg-brand p-2 text-white">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
