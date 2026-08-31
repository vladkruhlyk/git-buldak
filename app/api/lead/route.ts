import { NextResponse } from 'next/server';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// Один або кілька отримувачів через кому: "-1001234567890,123456789"
const CHAT_IDS = (process.env.TELEGRAM_CHAT_ID ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);
// Можна підмінити на дзеркало/проксі Telegram API, якщо прямий доступ закритий.
const API_BASE = process.env.TELEGRAM_API_BASE ?? 'https://api.telegram.org';

/** Мінімальний захист від спаму: не більше 5 заявок з IP за 10 хвилин. */
const RATE_LIMIT = { max: 5, windowMs: 10 * 60_000 };
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT.max;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function kyivTime() {
  return new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kyiv',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
    .format(new Date())
    .replace(', ', ' о ');
}

type Lead = {
  name?: string;
  phone?: string;
  request?: string;
  page_url?: string;
  company?: string; // honeypot — реальні люди його не бачать
};

function buildMessage(lead: Lead) {
  // Ліміт повідомлення в Telegram — 4096 символів. Краще обрізати текст,
  // ніж втратити заявку через відмову API.
  const raw = lead.request?.trim() ?? '';
  const request = raw.length > 800 ? `${raw.slice(0, 800)}…` : raw;

  const lines = [
    '🌶 <b>Заявка · Buldak опт</b>',
    '',
    `👤 <b>Імʼя:</b> ${esc(lead.name?.trim() ?? '')}`,
    `📞 <b>Телефон:</b> <code>${esc(lead.phone?.trim() ?? '')}</code>`,
  ];

  if (request) {
    lines.push('', '💬 <b>Запит:</b>', `<blockquote>${esc(request)}</blockquote>`);
  }

  lines.push('', '—————————————', `🕐 ${kyivTime()}`);
  return lines.join('\n');
}

export async function POST(req: Request) {
  if (!TOKEN || !CHAT_IDS.length) {
    console.error('Telegram is not configured: set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID');
    return NextResponse.json({ error: 'not_configured' }, { status: 500 });
  }

  // Якщо IP визначити не вдалося — краще пропустити заявку, ніж скласти всіх
  // відвідувачів в один кошик і заблокувати живих клієнтів.
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '';
  if (ip && rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let lead: Lead;
  try {
    lead = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  // Бот заповнив приховане поле — мовчки приймаємо і нікуди не шлемо.
  if (lead.company) return NextResponse.json({ ok: true });

  if (!lead.name?.trim()) {
    return NextResponse.json({ error: 'name_required' }, { status: 400 });
  }
  if ((lead.phone ?? '').replace(/\D/g, '').length < 10) {
    return NextResponse.json({ error: 'phone_invalid' }, { status: 400 });
  }

  const text = buildMessage(lead);

  const results = await Promise.allSettled(
    CHAT_IDS.map((chat_id) =>
      fetch(`${API_BASE}/bot${TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true }),
      }).then(async (res) => {
        if (!res.ok) throw new Error(`${chat_id}: ${res.status} ${await res.text()}`);
      })
    )
  );

  results
    .filter((r) => r.status === 'rejected')
    .forEach((r) => console.error('Telegram sendMessage failed', (r as PromiseRejectedResult).reason));

  if (!results.some((r) => r.status === 'fulfilled')) {
    return NextResponse.json({ error: 'telegram_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
