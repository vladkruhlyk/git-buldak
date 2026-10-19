import type { Metadata } from 'next';
import { Landing } from '@/components/Landing';

// Друга версія для паралельного тесту: ті самі блоки, але кнопки ведуть
// не в канал, а до форми внизу сторінки.
export const metadata: Metadata = {
  title: 'Buldak оптом — залишити заявку',
  description:
    'Оптові поставки корейської локшини Buldak: від 5 ящиків, ціна від 69,95 ₴/пачка, склад у Києві, доставка Україною за 1–2 дні.',
};

export default function FormVariantPage() {
  return <Landing v="form" />;
}
