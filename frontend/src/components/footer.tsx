import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

const columns = [
  {
    title: 'Về TechMart',
    links: [
      { label: 'Giới thiệu', href: '/gioi-thieu' },
      { label: 'Tuyển dụng', href: '/tuyen-dung' },
      { label: 'Tin tức', href: '/tin-tuc' },
      { label: 'Liên hệ', href: '/lien-he' },
    ],
  },
  {
    title: 'Hỗ trợ khách hàng',
    links: [
      { label: 'Chính sách bảo hành', href: '/chinh-sach-bao-hanh' },
      { label: 'Chính sách đổi trả', href: '/chinh-sach-doi-tra' },
      { label: 'Hướng dẫn mua hàng', href: '/huong-dan-mua-hang' },
      { label: 'Câu hỏi thường gặp', href: '/faq' },
    ],
  },
  {
    title: 'Khách hàng B2B',
    links: [
      { label: 'Đăng ký đại lý', href: '/dai-ly' },
      { label: 'Báo giá nhanh', href: '/bao-gia' },
      { label: 'Chính sách công nợ', href: '/chinh-sach-cong-no' },
      { label: 'Đấu thầu dự án', href: '/dau-thau' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-12 bg-gray-900 text-gray-300">
      <div className="container-x grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-2xl font-extrabold text-white">
            Tech<span className="text-accent">Mart</span>
          </div>
          <p className="mt-3 text-sm">
            Nhà phân phối thiết bị & dụng cụ công nghiệp chính hãng hàng đầu Việt Nam.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2"><MapPin size={16} /> 123 Đường Công Nghiệp, Q.1, TP.HCM</li>
            <li className="flex items-center gap-2"><Phone size={16} /> 1900 1234</li>
            <li className="flex items-center gap-2"><Mail size={16} /> info@techmart.vn</li>
          </ul>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 font-semibold text-white">{col.title}</h3>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-accent">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} TechMart. Giấy CNĐKKD số 0312345678 do Sở KH&ĐT TP.HCM cấp.
      </div>
    </footer>
  );
}
