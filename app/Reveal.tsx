'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/format';

type Props = {
  children: React.ReactNode;
  /** Затримка появи, мс — для «сходинки» в сітках. */
  delay?: number;
  /** Напрямок виїзду. */
  from?: 'up' | 'left' | 'right' | 'zoom';
  className?: string;
};

const HIDDEN: Record<NonNullable<Props['from']>, string> = {
  up: 'opacity-0 translate-y-8',
  left: 'opacity-0 -translate-x-8',
  right: 'opacity-0 translate-x-8',
  zoom: 'opacity-0 scale-95',
};

/** Плавна поява при скролі. Поважає prefers-reduced-motion. */
export function Reveal({ children, delay = 0, from = 'up', className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }

    const show = () => {
      setShown(true);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };

    // Різкий стрибок скролу (якір, Home/End, швидке колесо) може «перестрибнути»
    // елемент так, що observer не спрацює. Тоді показуємо все, що вже вище низу
    // екрана, — інакше в сторінці лишаються порожні дірки.
    const onScroll = () => {
      if (el.getBoundingClientRect().top < window.innerHeight) show();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) show();
      },
      { threshold: 0, rootMargin: '0px 0px -6% 0px' }
    );

    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700 [transition-timing-function:cubic-bezier(.16,1,.3,1)] will-change-transform',
        shown ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : HIDDEN[from],
        className
      )}
    >
      {children}
    </div>
  );
}
