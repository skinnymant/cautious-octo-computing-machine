'use client';

import { useState } from 'react';
import { Plus, Trash2, Send, CheckCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost/api';

interface Line {
  name: string;
  quantity: number;
  note: string;
}

export default function QuotePage() {
  const [contact, setContact] = useState({
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    company: '',
    note: '',
  });
  const [lines, setLines] = useState<Line[]>([{ name: '', quantity: 1, note: '' }]);
  const [done, setDone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateLine = (i: number, patch: Partial<Line>) =>
    setLines((arr) => arr.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/quotes`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...contact,
          items: lines.filter((l) => l.name.trim()),
        }),
      });
      const data = await res.json();
      setDone(data.code ?? 'OK');
    } catch {
      alert('Gửi yêu cầu thất bại, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="container-x py-20 text-center">
        <CheckCircle size={64} className="mx-auto text-green-500" />
        <h1 className="mt-4 text-2xl font-bold">Đã gửi yêu cầu báo giá!</h1>
        <p className="mt-2 text-gray-600">
          Mã yêu cầu: <b>{done}</b>. Nhân viên kinh doanh sẽ liên hệ trong 24h.
        </p>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold">Yêu cầu báo giá nhanh</h1>
      <p className="mt-1 text-gray-600">
        Chọn sản phẩm, nhập số lượng hoặc upload danh sách Excel. Chúng tôi báo giá tốt nhất cho đại lý & dự án.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Product lines */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-semibold">Danh sách sản phẩm</h2>
          <div className="space-y-3">
            {lines.map((line, i) => (
              <div key={i} className="flex gap-2">
                <input
                  required
                  placeholder="Tên sản phẩm / mã SKU"
                  value={line.name}
                  onChange={(e) => updateLine(i, { name: e.target.value })}
                  className="flex-1 rounded border px-3 py-2"
                />
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })}
                  className="w-20 rounded border px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => setLines((a) => a.filter((_, idx) => idx !== i))}
                  className="rounded border px-3 text-red-500"
                  aria-label="Xóa dòng"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setLines((a) => [...a, { name: '', quantity: 1, note: '' }])}
            className="mt-3 flex items-center gap-1 text-sm text-brand hover:underline"
          >
            <Plus size={16} /> Thêm sản phẩm
          </button>

          <div className="mt-4">
            <label className="block text-sm font-medium">Hoặc upload file Excel / ảnh báo giá</label>
            <input type="file" accept=".xlsx,.xls,.csv,image/*" className="mt-1 block w-full text-sm" />
            <p className="mt-1 text-xs text-gray-400">Hỗ trợ .xlsx, .csv, ảnh. Tối đa 25MB.</p>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 font-semibold">Thông tin liên hệ</h2>
          <div className="space-y-3">
            <input required placeholder="Họ tên *" value={contact.contactName}
              onChange={(e) => setContact({ ...contact, contactName: e.target.value })}
              className="w-full rounded border px-3 py-2" />
            <input required placeholder="Số điện thoại *" value={contact.contactPhone}
              onChange={(e) => setContact({ ...contact, contactPhone: e.target.value })}
              className="w-full rounded border px-3 py-2" />
            <input required type="email" placeholder="Email *" value={contact.contactEmail}
              onChange={(e) => setContact({ ...contact, contactEmail: e.target.value })}
              className="w-full rounded border px-3 py-2" />
            <input placeholder="Tên công ty" value={contact.company}
              onChange={(e) => setContact({ ...contact, company: e.target.value })}
              className="w-full rounded border px-3 py-2" />
            <textarea placeholder="Ghi chú" value={contact.note}
              onChange={(e) => setContact({ ...contact, note: e.target.value })}
              className="w-full rounded border px-3 py-2" rows={3} />
            <button disabled={submitting} className="btn-primary w-full">
              <Send size={18} /> {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
