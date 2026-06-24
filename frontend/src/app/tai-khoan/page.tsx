'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost/api';

export default function AccountPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API}/auth/${mode}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Lỗi');
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setMessage(`Xin chào ${data.user.fullName}! Đăng nhập thành công.`);
    } catch (err: any) {
      setMessage(
        Array.isArray(err.message) ? err.message.join(', ') : String(err.message),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-x max-w-md py-12">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex border-b">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 pb-2 font-semibold ${
                mode === m ? 'border-b-2 border-brand text-brand' : 'text-gray-400'
              }`}
            >
              {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <>
              <input
                required
                placeholder="Họ tên"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
              <input
                placeholder="Tên công ty (nếu là đại lý B2B)"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
            </>
          )}
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded border px-3 py-2"
          />
          <input
            required
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded border px-3 py-2"
          />
          <button disabled={loading} className="btn-primary w-full">
            {loading ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

        {message && (
          <p className="mt-3 rounded bg-brand-light p-2 text-sm text-brand">{message}</p>
        )}
      </div>
    </div>
  );
}
