'use client';

import { useState } from 'react';
import { cn } from '@/lib/format';
import { normalizeUaPhone } from '@/lib/phone';
import { CONFIG } from '@/lib/config';
import { BATCH_OPTIONS, FLAVORS } from '@/lib/content';

const ENDPOINT = '/api/lead';

export function LeadForm() {
  const [flavors, setFlavors] = useState<string[]>([]);
  const [batch, setBatch] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [request, setRequest] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFlavor = (name: string) =>
    setFlavors((prev) => (prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError('Вкажіть імʼя');

    const normalizedPhone = normalizeUaPhone(phone);
    if (!normalizedPhone) return setError('Схоже, у номері помилка. Приклад: +380 63 111 22 33');

    setSubmitting(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: normalizedPhone,
          flavors,
          batch,
          request: request.trim(),
          company,
          page_url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Конверсія цієї версії сторінки — саме відправлена форма, а не клік.
      window.fbq?.('track', 'Lead', { content_name: 'buldak', source: 'form' });
      // Purchase шлемо навмисно: алгоритм Meta оптимізується під нього
      // агресивніше. Пам'ятайте, що це заявка, а не оплата, — звітам про
      // «виручку» в кабінеті вірити не можна.
      window.fbq?.('track', 'Purchase', {
        content_name: 'buldak',
        source: 'form',
        ...(CONFIG.leadValueUah > 0
          ? { value: CONFIG.leadValueUah, currency: 'UAH' }
          : {}),
      });
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
  const legend = 'text-[12px] font-extrabold uppercase tracking-wider text-bul-ink/45 mb-2';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative rounded-[28px] bg-white border-[3px] border-bul-ink shadow-pop-lg p-6 md:p-7"
    >
      <fieldset>
        <legend className={legend}>Які смаки цікавлять</legend>
        <div className="flex flex-wrap gap-2">
          {FLAVORS.map((f) => (
            <Chip
              key={f.name}
              label={f.name}
              emoji={f.emoji}
              checked={flavors.includes(f.name)}
              onChange={() => toggleFlavor(f.name)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className={legend}>Розмір партії</legend>
        <div className="flex flex-wrap gap-2">
          {BATCH_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              checked={batch === o.value}
              onChange={() => setBatch(batch === o.value ? '' : o.value)}
            />
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-2.5">
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
          rows={2} maxLength={800}
          placeholder="Коментар — необовʼязково"
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
        Обовʼязкові лише імʼя та телефон. Передзвонимо в робочий час.
      </p>
    </form>
  );
}

function Chip({
  label, emoji, checked, onChange,
}: {
  label: string;
  emoji?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        'cursor-pointer select-none rounded-full px-3.5 h-10 inline-flex items-center gap-1.5 text-[14px] font-bold border-[2.5px] transition-colors',
        checked
          ? 'bg-bul-ink border-bul-ink text-white'
          : 'bg-white border-bul-ink/15 text-bul-ink/70 hover:border-bul-ink/50 hover:text-bul-ink'
      )}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {emoji && <span aria-hidden>{emoji}</span>}
      {label}
    </label>
  );
}
