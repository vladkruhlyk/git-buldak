'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { track } from '@vercel/analytics';
import { CONFIG } from '@/lib/config';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Аналітика сторінки: перегляди + кліки в Telegram.
 *
 * Форми на сайті немає, тож конверсія — це перехід у канал. Рахуємо його
 * двома лічильниками одразу:
 *   • Vercel — свій дашборд і подія telegram_click з назвою кнопки;
 *   • Meta Pixel — подія Lead, щоб реклама вміла оптимізуватись.
 *
 * Обидва рахують у браузері, тож блокувальники частину кліків зʼїдять.
 */
export function Tracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      // closest — бо клікають і по іконці всередині кнопки, не лише по тексту
      const link = target?.closest?.('a[href*="t.me/"]') as HTMLAnchorElement | null;
      if (!link) return;

      // Назва кнопки показує, який блок сторінки реально працює.
      // innerText, а не textContent: у шапці два написи — для десктопа й для
      // мобільного, — і textContent склеїв би обидва в «Наш TelegramTelegram».
      const label = (link.innerText || link.textContent || '').trim().replace(/\s+/g, ' ');
      const button = label.slice(0, 60) || 'без назви';

      track('telegram_click', { button });
      window.fbq?.('track', 'Lead', { content_name: 'buldak', source: 'telegram_button' });
    };

    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return (
    <>
      <Analytics />

      {CONFIG.metaPixelId && (
        <>
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${CONFIG.metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${CONFIG.metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </>
  );
}
