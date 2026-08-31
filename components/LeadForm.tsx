'use client';

import { useState } from 'react';
import { cn } from '@/lib/format';

const ENDPOINT = '/api/lead';

export function LeadForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [request, setRequest] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError('Вкажіть імʼя');
    if (phone.replace(/\D/g, '').length < 10) return setError('Вкажіть коректний телефон');

    setSubmitting(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          request: request.trim(),
          company,
          page_url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Конверсія цієї версії сторінки — саме відправлена форма, а не клік.
      window.fbq?.('track', 'Lead', { content_name: 'buldak', source: 'form' });
      setSubmitted(true);
    } catch (err) {
      console.error('Lead submit failed', err);
      setError('Не вдалося надіслати 😕 Спробуйте ще раз або зателефонуйте.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[28px] bg-bul-yellow border-[3px] border-bul-ink shadow-pop-lg p-8 text-center animate-fade-up">
        <div className="text-6xl leading-none" aria-hidden>🎉</div>
        <h3 className="mt-4 h-display text-3xl font-extrabold text-bul-ink">Прийняли!</h3>
        <p className="mt-3 text-[15px] font-medium text-bul-ink/75 text-pretty">
          Менеджер звʼяжеться найближчим часом у робочий час і надішле прайс
          із цінами під ваш обʼєм.
        </p>
      </div>
    );
  }

  const field =
    'w-full h-14 px-4 rounded-2xl bg-bul-cream border-[2.5px] border-bul-ink/15 text-[16px] font-medium text-bul-ink placeholder:text-bul-ink/35 focus:outline-none focus:border-bul-red transition-colors';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative rounded-[28px] bg-white border-[3px] border-bul-ink shadow-pop-lg p-6 md:p-7"
    >
      <div className="grid gap-2.5">
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Імʼя" autoComplete="name" className={field}
        />
        <input
          type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
          placeholder="Номер телефону" autoComplete="tel" className={field}
        />
        <textarea
          value={request} onChange={(e) => setRequest(e.target.value)}
          rows={3} maxLength={800}
          placeholder="Запит — які смаки й скільки ящиків"
          className={cn(field, 'h-auto py-3.5 resize-none')}
        />
      </div>

      {/* Пастка для ботів — прихована від людей і скрінрідерів */}
      <input
        type="text" name="company" value={company} onChange={(e) => setCompany(e.target.value)}
        tabIndex={-1} autoComplete="off" aria-hidden="true"
        className="absolute -left-[9999px] w-px h-px opacity-0"
      />

      {error && (
        <p className="mt-4 text-sm font-semibold text-bul-red" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full inline-flex items-center justify-center h-14 rounded-2xl bg-bul-red hover:bg-bul-red2 disabled:opacity-60 disabled:cursor-not-allowed border-[3px] border-bul-ink shadow-pop hover:shadow-none hover:translate-x-[5px] hover:translate-y-[5px] text-white text-[18px] font-extrabold tracking-tight transition-all"
      >
        {submitting ? 'Відправляємо…' : 'Отримати прайс 🔥'}
      </button>

      <p className="mt-3.5 text-[12px] font-medium text-bul-ink/50 text-center text-pretty">
        Передзвонимо в робочий час. Без спаму й дзвінків «просто так».
      </p>
    </form>
  );
}
