import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <h1 className="text-6xl font-extrabold text-brand">404</h1>
      <p className="mt-4 text-lg text-gray-600">Không tìm thấy trang bạn yêu cầu.</p>
      <Link href="/" className="btn-primary mt-6">Về trang chủ</Link>
    </div>
  );
}
