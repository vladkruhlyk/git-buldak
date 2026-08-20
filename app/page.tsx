import Image from 'next/image';
import { CONFIG } from '@/lib/config';
import {
  FAQ, FLAVORS, PRICE_APPLIES_TO, PRICE_TIERS, PROOF, STOCK,
  TELEGRAM_CHANNEL, TERMS, WHY, type Flavor,
} from '@/lib/content';
import { TelegramIcon } from '@/components/TelegramIcon';
import { cn } from '@/lib/format';
import { BuldakFaq } from './BuldakFaq';
import { Reveal } from './Reveal';

// Вирізані пачки. ar — співвідношення сторін, щоб next/image не смикав layout.
const PACKS = {
  carbonara: { src: '/carbonara.webp', ar: 1.278 },
  original:  { src: '/original.webp',  ar: 1.386 },
  cheese:    { src: '/cheese.webp',    ar: 1.264 },
  spicy2x:   { src: '/spicy2x.webp',   ar: 1.331 },
} as const;

type PackName = keyof typeof PACKS;

export default function HomePage() {
  return (
    <div className="bg-bul-cream text-bul-ink overflow-x-clip">
      <TopBar />
      <Hero />
      <Why />
      <Flavors />
      <Stock />
      <Prices />
      <TelegramBlock />
      <Terms />
      <Proof />
      <Faq />
      <FinalCta />
      <Foot />
      <MobileBar />
    </div>
  );
}

/* ------------------------------ helpers ------------------------------ */

/** Пачка, що «літає» фоном. Суто декор. */
function FlyingPack({
  pack, className, rotate = -12, duration = 6, delay = 0, w = 220,
}: {
  pack: PackName;
  className: string;
  rotate?: number;
  duration?: number;
  delay?: number;
  w?: number;
}) {
  const { src, ar } = PACKS[pack];
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute select-none animate-float motion-reduce:animate-none', className)}
      style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
    >
      <Image
        src={src}
        alt=""
        width={w}
        height={Math.round(w / ar)}
        sizes={`${w}px`}
        className="w-full h-auto drop-shadow-[6px_10px_0_rgba(18,18,18,.18)]"
        style={{ transform: `rotate(${rotate}deg)` }}
      />
    </div>
  );
}

function TgButton({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <a
      href={TELEGRAM_CHANNEL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex items-center justify-center gap-2.5 rounded-full border-[3px] border-bul-ink shadow-pop hover:shadow-none hover:translate-x-[5px] hover:translate-y-[5px] active:scale-[.98] font-extrabold tracking-tight transition-all duration-200',
        className
      )}
    >
      <TelegramIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      {children}
    </a>
  );
}

function Logo() {
  return (
    <span className="group inline-flex items-center gap-1.5 shrink-0">
      {/* Офіційний логотип бренду. Він червоно-білий, тому лишаємо темну
          плашку — на кремовому фоні шапки біла частина зникла б. */}
      <span className="h-display -rotate-3 group-hover:rotate-0 rounded-xl bg-bul-ink border-[2.5px] border-bul-ink px-3 py-1.5 transition-transform duration-300">
        <Image
          src="/logo.svg"
          alt="Buldak"
          width={259}
          height={109}
          priority
          unoptimized
          className="h-6 md:h-7 w-auto"
        />
      </span>
      <span className="h-display rotate-2 group-hover:rotate-0 rounded-xl bg-bul-red text-white border-[2.5px] border-bul-ink shadow-[2px_2px_0_0_#121212] px-2 py-0.5 text-[17px] md:text-xl font-extrabold tracking-tight transition-transform duration-300">
        ОПТ
      </span>
      <span aria-hidden className="text-lg md:text-xl -rotate-12 transition-transform duration-300 group-hover:rotate-12">🌶</span>
    </span>
  );
}

/* ------------------------------ sections ------------------------------ */

function TopBar() {
  return (
    <div className="sticky top-0 z-40 bg-bul-cream/90 backdrop-blur border-b-[3px] border-bul-ink">
      <div className="container-narrow h-16 flex items-center justify-between gap-3">
        <Logo />
        <TgButton className="h-11 px-4 sm:px-5 bg-bul-yellow text-bul-ink text-[14px] sm:text-[15px]">
          <span className="hidden sm:inline">Наш Telegram</span>
          <span className="sm:hidden">Telegram</span>
        </TgButton>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative bg-bul-red text-white overflow-hidden">
      <div className="container-narrow relative pt-12 md:pt-16 pb-28 md:pb-36">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-8 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full bg-bul-yellow border-[3px] border-bul-ink text-bul-ink px-4 py-1.5 text-[13px] font-extrabold uppercase tracking-wide -rotate-2 animate-fade-up"
              style={{ animationDelay: '.05s' }}
            >
              <span aria-hidden>🔥</span> опт від 5 ящиків
            </div>

            <h1
              className="mt-6 h-display text-[38px] md:text-[64px] font-extrabold uppercase tracking-[-0.035em] leading-[.98] text-balance animate-fade-up"
              style={{ animationDelay: '.15s' }}
            >
              Buldak оптом
              <br />
              <span className="text-bul-yellow">за суперціною</span>
            </h1>

            <p
              className="mt-6 text-lg md:text-2xl font-semibold text-white/90 max-w-[520px] text-pretty animate-fade-up"
              style={{ animationDelay: '.25s' }}
            >
              Найгостріша локшина, яку покупці шукають самі. Прямий імпорт,
              склад у Києві, відправка за 1–2 дні 🚚
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: '.35s' }}>
              <TgButton className="h-16 px-8 bg-bul-yellow text-bul-ink text-[19px]">
                Асортимент і ціни
              </TgButton>
              <a
                href="#prices"
                className="inline-flex items-center justify-center h-16 px-8 rounded-full border-[3px] border-bul-ink bg-white text-bul-ink text-[19px] font-extrabold shadow-pop hover:shadow-none hover:translate-x-[5px] hover:translate-y-[5px] active:scale-[.98] transition-all duration-200"
              >
                Подивитись ціни
              </a>
            </div>

            <p className="mt-5 text-[15px] font-semibold text-white/75 animate-fade-up" style={{ animationDelay: '.45s' }}>
              <span aria-hidden className="mr-1.5">👉</span>
              Уся лінійка, наявність і нові завози — у Telegram-каналі
            </p>
          </div>

          {/* Головне фото — пачка «висить» у повітрі */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: '.2s' }}>
            <div className="relative w-[86%] max-w-[520px] animate-float motion-reduce:animate-none" style={{ animationDuration: '7s' }}>
              <Image
                src={PACKS.carbonara.src}
                alt="Buldak Carbonara, пачка 130 г"
                width={1200}
                height={939}
                priority
                sizes="(max-width: 1024px) 86vw, 520px"
                className="w-full h-auto -rotate-6 drop-shadow-[10px_16px_0_rgba(18,18,18,.25)]"
              />
            </div>
            <span className="absolute -top-1 right-2 md:right-6 rotate-12 rounded-full bg-bul-yellow border-[3px] border-bul-ink text-bul-ink px-3.5 py-1.5 text-[13px] font-extrabold shadow-pop">
              130 г
            </span>
          </div>
        </div>
      </div>

      <Blob />
    </section>
  );
}

/** Жовта «клякса»: перетікає прямо в жовту секцію нижче. */
function Blob() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className="absolute -bottom-px left-0 w-full h-[70px] md:h-[110px] text-bul-yellow"
    >
      <path
        fill="currentColor"
        d="M0 62c96-38 192-38 288 0s192 44 288 6 192-52 288-14 192 46 288 8 192-40 288-14v72H0z"
      />
    </svg>
  );
}

/** Жовта смуга + горизонтальні картки. */
function Why() {
  return (
    <Block tone="yellow" emoji="💥" title="Чому це змітають з полиці">
      <FlyingPack pack="original" className="hidden md:block -top-6 right-[-70px] w-[210px]" w={210} rotate={14} duration={8} />
      <div className="relative grid sm:grid-cols-2 gap-4">
        {WHY.map((w, i) => (
          <Reveal key={w.title} delay={i * 90} from={i % 2 ? 'right' : 'left'} className="h-full">
            <div className="h-full flex items-start gap-4 rounded-[24px] bg-white border-[3px] border-bul-ink p-5 transition-transform duration-300 hover:-translate-y-1">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-bul-cream border-[2.5px] border-bul-ink grid place-items-center text-3xl">
                <span aria-hidden>{w.emoji}</span>
              </div>
              <div>
                <h3 className="h-display text-lg md:text-xl font-extrabold leading-tight">{w.title}</h3>
                <p className="mt-1.5 text-[14px] font-medium text-bul-ink/65 text-pretty">{w.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Block>
  );
}

/** Чорна смуга + високі товарні картки. */
function Flavors() {
  return (
    <Block
      tone="ink"
      emoji="🌶"
      title="Асортимент"
      subtitle="Що є на складі зараз. Актуальні залишки й нові завози — у Telegram."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-5">
        {FLAVORS.map((f, i) => (
          <Reveal key={f.name} delay={(i % 4) * 80} from="zoom" className="h-full">
            <FlavorCard f={f} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={120} className="mt-10 text-center">
        <TgButton className="h-14 px-8 bg-bul-yellow text-bul-ink text-[17px]">
          Дивитись увесь асортимент
        </TgButton>
      </Reveal>
    </Block>
  );
}

function FlavorCard({ f }: { f: Flavor }) {
  return (
    <article className="group relative h-full flex flex-col items-center text-center rounded-[26px] bg-white text-bul-ink border-[3px] border-bul-ink shadow-pop p-4 md:p-5 transition-transform duration-300 hover:-translate-y-2">
      {f.tag && (
        <span className="absolute -top-3 -right-2 z-10 rotate-6 rounded-full bg-bul-yellow border-[2.5px] border-bul-ink px-2.5 py-0.5 text-[11px] font-extrabold">
          {f.tag}
        </span>
      )}

      {/* overflow-hidden: збільшені фото не мають налазити на плашку нижче */}
      <div className="relative w-full aspect-[5/4] grid place-items-center overflow-hidden">
        {f.image ? (
          // зовнішній div вирівнює масштаб пачки, внутрішній — ефект наведення
          <div className="absolute inset-0" style={{ transform: `scale(${f.zoom ?? 1})` }}>
            <Image
              src={f.image}
              alt={`Buldak ${f.name}`}
              fill
              sizes="(max-width: 640px) 45vw, 260px"
              className="object-contain transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3"
            />
          </div>
        ) : (
          <div
            aria-hidden
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-bul-cream border-[2.5px] border-dashed border-bul-ink/30 grid place-items-center text-4xl md:text-5xl transition-transform duration-500 group-hover:scale-110"
          >
            {f.emoji}
          </div>
        )}
      </div>

      <span className="mt-3 rounded-full bg-bul-red text-white text-[11px] md:text-[12px] font-extrabold px-3 py-1">
        {f.pack}
      </span>

      <h3 className="mt-2.5 h-display text-[17px] md:text-xl font-extrabold leading-tight">{f.name}</h3>
      <p className="mt-1 text-[12.5px] md:text-[13px] font-medium text-bul-ink/55 text-pretty">{f.note}</p>
    </article>
  );
}

/** Фото складу — доказ, що товар фізично є. */
function Stock() {
  return (
    <Block
      tone="yellow"
      emoji="📷"
      title="Так це виглядає на складі"
      subtitle="Не рендери й не фото з каталогу постачальника — наш склад у Києві. Звідси товар і їде до вас."
    >
      <div className="grid sm:grid-cols-2 gap-5 md:gap-7 max-w-4xl">
        {STOCK.map((p, i) => (
          <Reveal key={p.src} delay={i * 110} from={i ? 'right' : 'left'}>
            <figure
              className={cn(
                'rounded-[26px] border-[3px] border-bul-ink bg-white p-3 shadow-pop-lg transition-transform duration-300 hover:rotate-0 hover:-translate-y-1',
                p.tilt
              )}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] border-2 border-bul-ink/10">
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 640px) 90vw, 420px"
                  className="object-cover"
                />
              </div>
              <figcaption className="pt-3 pb-1 text-center text-[14px] font-extrabold text-bul-ink">
                {p.caption}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Block>
  );
}

/** Сходинки опту: чим більший обʼєм, тим нижча ціна за пачку. */
function Prices() {
  const base = PRICE_TIERS[0].price;
  return (
    <Block
      id="prices"
      tone="cream"
      emoji="💸"
      title="Чим більший обʼєм — тим нижча ціна"
      subtitle={`Ціни за пачку на ${PRICE_APPLIES_TO}. Решта смаків — прайс за запитом.`}
    >
      <div className="grid sm:grid-cols-3 gap-4 md:gap-5">
        {PRICE_TIERS.map((t, i) => {
          const best = i === PRICE_TIERS.length - 1;
          const save = base - t.price;
          return (
            <Reveal key={t.qty} delay={i * 90} from="zoom" className="h-full">
              <div
                className={cn(
                  'relative h-full rounded-[26px] border-[3px] border-bul-ink shadow-pop p-6 pt-8 text-center transition-transform duration-300 hover:-translate-y-1.5',
                  best ? 'bg-bul-red text-white' : 'bg-white text-bul-ink'
                )}
              >
                {best && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 -rotate-3 whitespace-nowrap rounded-full bg-bul-yellow border-[2.5px] border-bul-ink px-3 py-0.5 text-[11px] font-extrabold text-bul-ink">
                    НАЙВИГІДНІШЕ
                  </span>
                )}

                <div className={cn('text-[12px] font-extrabold uppercase tracking-wider', best ? 'text-white/65' : 'text-bul-ink/40')}>
                  {t.note}
                </div>

                <div className="mt-2 h-display text-[52px] font-extrabold leading-none tracking-tight">
                  {t.price}<span className="text-[26px]"> ₴</span>
                </div>
                <div className={cn('text-[13px] font-bold', best ? 'text-white/65' : 'text-bul-ink/45')}>за пачку</div>

                <div
                  className={cn(
                    'mt-5 inline-block rounded-full border-[2.5px] px-4 py-1.5 text-[14px] font-extrabold',
                    best ? 'border-white/40 bg-white/10' : 'border-bul-ink/15 bg-bul-cream'
                  )}
                >
                  {t.qty}
                </div>

                <div className={cn('mt-3 text-[13px] font-extrabold', best ? 'text-bul-yellow' : save ? 'text-bul-red' : 'text-transparent')}>
                  {save ? `економія ${save} ₴/шт` : '—'}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={160}>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <TgButton className="h-14 px-8 bg-bul-ink text-bul-yellow text-[17px]">
            Порахувати мою партію
          </TgButton>
          <p className="text-[13px] font-semibold text-bul-ink/50">
            Ціни можуть змінюватись — актуальні підтверджує менеджер
          </p>
        </div>
      </Reveal>
    </Block>
  );
}

/** Жовта картка — головна ціль трафіку. */
function TelegramBlock() {
  return (
    <section className="py-14 md:py-20">
      <div className="container-narrow">
        <Reveal from="zoom">
          <div className="relative overflow-hidden rounded-[32px] bg-bul-yellow text-bul-ink border-[3px] border-bul-ink shadow-pop-lg px-7 py-12 md:px-14 md:py-16 text-center">
            <FlyingPack pack="cheese" className="hidden md:block -bottom-12 -left-14 w-[200px]" w={200} rotate={16} duration={7} />
            <FlyingPack pack="carbonara" className="hidden md:block -top-14 -right-12 w-[180px]" w={180} rotate={-20} duration={8} delay={1.5} />
            <div className="relative">
              <div className="text-6xl md:text-7xl leading-none animate-float motion-reduce:animate-none" aria-hidden>📲</div>
              <h2 className="mt-5 h-display text-3xl md:text-[52px] font-extrabold leading-[1.02] text-balance">
                Весь асортимент — <span className="text-bul-red">у Telegram</span>
              </h2>
              <p className="mt-5 text-[16px] md:text-xl font-semibold text-bul-ink/70 max-w-xl mx-auto text-pretty">
                Прайс, наявність, нові завози й акційні партії. Підписуйтесь — і бачитимете
                залишки першими, без дзвінків і очікувань.
              </p>
              <div className="mt-9">
                <TgButton className="h-16 px-10 bg-bul-red text-white text-[19px]">
                  Відкрити канал
                </TgButton>
              </div>
              <p className="mt-5 text-[14px] font-semibold text-bul-ink/50">
                Наявність оновлюємо щодня — нові завози побачите першими
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Червона смуга + прості рядки. */
function Terms() {
  return (
    <Block tone="red" emoji="🤝" title="Умови">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TERMS.map((t, i) => (
          <Reveal key={t.label} delay={i * 70} className="h-full">
            <div className="h-full flex items-center gap-3.5 rounded-2xl bg-white/10 border-2 border-white/25 px-4 py-3.5 transition-colors hover:bg-white/20">
              <span className="text-2xl leading-none" aria-hidden>{t.emoji}</span>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/60">{t.label}</div>
                <div className="text-[16px] font-bold text-white">{t.value}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Block>
  );
}

/** Похилені «стікери». */
function Proof() {
  const tilt = ['-rotate-2', 'rotate-1', '-rotate-1'];
  return (
    <Block tone="cream" emoji="💬" title="Що кажуть клієнти">
      <div className="grid md:grid-cols-3 gap-5">
        {PROOF.map((p, i) => (
          <Reveal key={p.who} delay={i * 110} from="zoom" className="h-full">
            <figure
              className={cn(
                'h-full rounded-[24px] border-[3px] border-bul-ink shadow-pop-lg p-6 transition-transform duration-300 hover:rotate-0 hover:-translate-y-1',
                tilt[i],
                i === 1 ? 'bg-bul-yellow' : 'bg-white'
              )}
            >
              <div className="text-2xl leading-none" aria-hidden>⭐️⭐️⭐️⭐️⭐️</div>
              <blockquote className="mt-3 text-[15px] font-semibold text-bul-ink/85 text-pretty">{p.text}</blockquote>
              <figcaption className="mt-4 text-[13px] font-bold text-bul-ink/50">{p.who}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Block>
  );
}

function Faq() {
  return (
    <Block tone="cream" emoji="🤔" title="Питання">
      <FlyingPack pack="spicy2x" className="hidden lg:block top-10 right-[-120px] w-[200px]" w={200} rotate={20} duration={10} delay={.5} />
      <div className="relative">
        <BuldakFaq items={FAQ} />
      </div>
    </Block>
  );
}

/** Фінальний заклик: уся конверсія веде в Telegram-канал. */
function FinalCta() {
  return (
    <section id="cta" className="relative scroll-mt-20 overflow-hidden py-16 md:py-24 bg-bul-ink text-white">
      <div className="container-narrow relative">
        {/* Яскрава пачка заповнює порожнечу під текстом (форма вища за колонку).
            Чорна Original тут зливалася б із фоном, тому беремо жовту. */}
        {/* Текст у цій секції по центру, тож пачки розводимо по бокових полях.
            Показуємо лише від xl — на вужчих екранах вони налізали б на текст.
            Різний нахил і ритм гойдання, щоб не рухались синхронно. */}
        <FlyingPack
          pack="cheese"
          className="hidden xl:block bottom-0 left-0 w-[220px]"
          w={220}
          rotate={-12}
          duration={8}
        />
        <FlyingPack
          pack="carbonara"
          className="hidden xl:block bottom-8 right-0 w-[190px]"
          w={190}
          rotate={13}
          duration={6.5}
          delay={1.2}
        />
        <div className="relative text-center max-w-2xl mx-auto">
          <Reveal>
            <div className="text-6xl leading-none animate-float motion-reduce:animate-none" aria-hidden>🔥</div>
            <h2 className="mt-4 h-display text-3xl md:text-[52px] font-extrabold leading-[1.02] text-balance">
              Готові порахувати <span className="text-bul-yellow">вашу партію?</span>
            </h2>
            <p className="mt-5 text-[16px] md:text-xl font-semibold text-white/75 text-pretty">
              Напишіть у Telegram — надішлемо прайс, підтвердимо залишок
              і порахуємо суму під ваш обʼєм.
            </p>

            <ul className="mt-8 flex flex-wrap justify-center gap-2.5">
              {['📦 від 5 ящиків', '🚚 Нова Пошта 1–2 дні', '🧾 ФОП, договір, ТТН'].map((t) => (
                <li
                  key={t}
                  className="rounded-full border-2 border-white/20 bg-white/[.06] px-4 py-2 text-[14px] font-bold text-white/85"
                >
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-9">
              <TgButton className="h-16 px-10 bg-bul-yellow text-bul-ink text-[19px]">
                Написати в Telegram
              </TgButton>
            </div>

            <p className="mt-6 text-[15px] font-semibold text-white/60">
              або зателефонуйте{' '}
              <a href={CONFIG.phoneHref} className="underline underline-offset-4 font-extrabold text-bul-yellow">
                {CONFIG.phone}
              </a>
              {' '}· відповідаємо 9:00–20:00
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Foot() {
  return (
    <footer className="py-8">
      <div className="container-narrow flex flex-wrap items-center justify-between gap-4 text-[13px] font-semibold text-bul-ink/45">
        <span>Оптові поставки азійських продуктів · {CONFIG.city}</span>
        <a href={CONFIG.phoneHref} className="hover:text-bul-ink transition-colors">{CONFIG.phone}</a>
      </div>
    </footer>
  );
}

function MobileBar() {
  return (
    <div className="lg:hidden sticky bottom-0 z-40 bg-bul-cream/95 backdrop-blur border-t-[3px] border-bul-ink px-4 py-3 flex gap-2.5">
      <a
        href="#prices"
        className="shrink-0 grid place-items-center h-12 px-5 rounded-full border-[3px] border-bul-ink bg-white text-[15px] font-extrabold active:scale-95 transition-transform"
      >
        Ціни
      </a>
      <TgButton className="flex-1 h-12 bg-bul-yellow text-bul-ink text-[16px]">
        Telegram
      </TgButton>
    </div>
  );
}

/* ------------------------------ layout ------------------------------ */

const TONES = {
  cream: { section: 'bg-bul-cream text-bul-ink', sub: 'text-bul-ink/60' },
  // без верхнього бордера — зверху в неї втікає жовта хвиля з героя
  yellow: { section: 'bg-bul-yellow text-bul-ink border-b-[3px] border-bul-ink', sub: 'text-bul-ink/65' },
  red: { section: 'bg-bul-red text-white border-y-[3px] border-bul-ink', sub: 'text-white/80' },
  ink: { section: 'bg-bul-ink text-white', sub: 'text-white/60' },
} as const;

function Block({
  id, tone, emoji, title, subtitle, children,
}: {
  id?: string;
  tone: keyof typeof TONES;
  emoji: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <section id={id} className={cn('relative scroll-mt-20 overflow-hidden py-14 md:py-20', t.section)}>
      <div className="container-narrow relative">
        <Reveal>
          <header className="mb-8 md:mb-11 max-w-3xl">
            <h2 className="h-display text-3xl md:text-[46px] font-extrabold tracking-tight text-balance">
              <span className="mr-2" aria-hidden>{emoji}</span>
              {title}
            </h2>
            {subtitle && <p className={cn('mt-4 text-base md:text-lg font-semibold text-pretty', t.sub)}>{subtitle}</p>}
          </header>
        </Reveal>
        {children}
      </div>
    </section>
  );
}
