'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/format';
import { Reveal } from './Reveal';

type Item = { q: string; a: string };

export function BuldakFaq({ items }: { items: readonly Item[] }) {
  const uid = useId();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="max-w-3xl grid gap-3">
      {items.map((it, i) => {
        const open = openIdx === i;
        const panelId = `${uid}-panel-${i}`;

        return (
          <Reveal key={it.q} delay={i * 60}>
            <div
              className={cn(
                'rounded-[22px] border-[3px] border-bul-ink transition-colors duration-300',
                open ? 'bg-bul-yellow' : 'bg-white hover:bg-bul-cream/70'
              )}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(open ? null : i)}
                aria-expanded={open}
                aria-controls={panelId}
                className="w-full flex items-center justify-between gap-4 p-5 text-left rounded-[19px] focus:outline-none focus-visible:ring-4 focus-visible:ring-bul-red/45"
              >
                <span className="text-[16px] md:text-[17px] font-extrabold text-bul-ink">{it.q}</span>
                <span
                  className={cn(
                    'shrink-0 w-8 h-8 rounded-full border-[2.5px] border-bul-ink grid place-items-center transition-all duration-300',
                    open ? 'rotate-[135deg] bg-bul-red text-white' : 'bg-bul-yellow text-bul-ink'
                  )}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </button>

              <div
                id={panelId}
                className={cn(
                  'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
                  open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-[15px] font-medium text-bul-ink/70 text-pretty">{it.a}</p>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
