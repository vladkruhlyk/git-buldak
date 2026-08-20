import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import { Tracking } from '@/components/Tracking';

const sans = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans', display: 'swap' });
const display = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Buldak оптом — прайс, наявність, умови',
  description:
    'Оптові поставки корейської локшини Buldak: від 5 ящиків, ціна від 72 ₴/пачка, склад у Києві, доставка Україною за 1–2 дні.',
  openGraph: { title: 'Buldak оптом', description: 'Опт корейської локшини Buldak', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Tracking />
        {children}
      </body>
    </html>
  );
}
