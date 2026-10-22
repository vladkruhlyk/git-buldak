import { NextResponse } from 'next/server';
import { normalizeUaPhone } from '@/lib/phone';
import { BATCH_OPTIONS, FLAVORS } from '@/lib/content';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// Один або кілька отримувачів через кому: "-1001234567890,123456789"
const CHAT_IDS = (process.env.TELEGRAM_CHAT_ID ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);
// Можна підмінити на дзеркало/проксі Telegram API, якщо прямий доступ закритий.
const API_BASE = process.env.TELEGRAM_API_BASE ?? 'https://api.telegram.org';

// Веб-додаток Apps Script, що дописує заявку рядком у таблицю.
// Код скрипта — у scripts/google-sheet.gs, там же інструкція з підключення.
const SHEET_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL;
const SHEET_SECRET = process.env.GOOGLE_SHEET_SECRET ?? '';

const TELEGRAM_ON = Boolean(TOKEN && CHAT_IDS.length);
const SHEET_ON = Boolean(SHEET_URL);

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

/** utm-мітки зі сторінки. Потрібні лише таблиці — у повідомлення не йдуть. */
function utmOf(pageUrl = '') {
  try {
    const p = new URL(pageUrl).searchParams;
    return {
      utm_source: p.get('utm_source') ?? '',
      utm_medium: p.get('utm_medium') ?? '',
      utm_campaign: p.get('utm_campaign') ?? '',
    };
  } catch {
    return { utm_source: '', utm_medium: '', utm_campaign: '' };
  }
}

type Lead = {
  name?: string;
  phone?: string;
  flavors?: string[];
  batch?: string;
  request?: string;
  page_url?: string;
  company?: string; // honeypot — реальні люди його не бачать
};

/** Те, що пройшло перевірку і готове до відправки в обидва канали. */
type Clean = {
  name: string;
  phone: string;
  flavors: string[];
  batch: string;
  request: string;
  page_url: string;
};

function buildMessage(c: Clean) {
  const lines = [
    '🌶 <b>Заявка · Buldak опт</b>',
    '',
    `👤 <b>Імʼя:</b> ${esc(c.name)}`,
    `📞 <b>Телефон:</b> <code>${esc(c.phone)}</code>`,
  ];

  // Смаки й партія йдуть одним блоком, а не двома через порожній рядок.
  const order: string[] = [];
  if (c.flavors.length) order.push(`🍜 <b>Смаки:</b> ${esc(c.flavors.join(', '))}`);
  if (c.batch) order.push(`📦 <b>Партія:</b> ${esc(c.batch)}`);
  if (order.length) lines.push('', ...order);

  if (c.request) {
    lines.push('', '💬 <b>Запит:</b>', `<blockquote>${esc(c.request)}</blockquote>`);
  }

  lines.push('', '—————————————', `🕐 ${kyivTime()}`);
  return lines.join('\n');
}

/** true — доїхало хоча б в один чат. */
async function sendTelegram(text: string) {
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

  return results.some((r) => r.status === 'fulfilled');
}

async function saveToSheet(c: Clean) {
  try {
    const res = await fetch(SHEET_URL as string, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: SHEET_SECRET,
        date: kyivTime(),
        name: c.name,
        phone: c.phone,
        flavors: c.flavors.join(', '),
        batch: c.batch,
        request: c.request,
        page_url: c.page_url,
        ...utmOf(c.page_url),
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // Apps Script відповідає 200 навіть на власну помилку — дивимось у тіло.
    const body = await res.text();
    if (body.includes('"ok":false')) throw new Error(body.slice(0, 200));

    return true;
  } catch (err) {
    console.error('Google Sheet append failed', err);
    return false;
  }
}

export async function POST(req: Request) {
  if (!TELEGRAM_ON && !SHEET_ON) {
    console.error(
      'Lead endpoint is not configured: set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID and/or GOOGLE_SHEET_WEBHOOK_URL'
    );
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
  // Перевіряємо ще раз на сервері: у клієнт можна не вірити.
  const phone = normalizeUaPhone(lead.phone ?? '');
  if (!phone) {
    return NextResponse.json({ error: 'phone_invalid' }, { status: 400 });
  }

  // Приймаємо лише ті смаки, що справді є на сайті: ні в повідомлення, ні в
  // таблицю не має потрапляти довільний текст, надісланий в обхід форми.
  const known = new Set(FLAVORS.map((f) => f.name));
  // Ліміт повідомлення в Telegram — 4096 символів. Краще обрізати текст,
  // ніж втратити заявку через відмову API.
  const raw = lead.request?.trim() ?? '';

  const clean: Clean = {
    name: lead.name.trim(),
    phone,
    flavors: (lead.flavors ?? []).filter((f) => known.has(f)),
    batch: BATCH_OPTIONS.find((o) => o.value === lead.batch)?.label ?? '',
    request: raw.length > 800 ? `${raw.slice(0, 800)}…` : raw,
    page_url: lead.page_url ?? '',
  };

  // Канали незалежні: збій таблиці не має ламати сповіщення менеджеру, і навпаки.
  const [telegramOk, sheetOk] = await Promise.all([
    TELEGRAM_ON ? sendTelegram(buildMessage(clean)) : null,
    SHEET_ON ? saveToSheet(clean) : null,
  ]);

  // Помилку показуємо, лише якщо заявку не прийняв ЖОДЕН канал, — інакше
  // людина побачила б збій там, де лід насправді збережено.
  if (telegramOk !== true && sheetOk !== true) {
    return NextResponse.json({ error: 'delivery_failed' }, { status: 502 });
  }

  if (telegramOk === false) console.error('Lead saved to sheet only — Telegram is down');
  if (sheetOk === false) console.error('Lead sent to Telegram only — sheet append failed');

  return NextResponse.json({ ok: true });
}
