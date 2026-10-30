import type { ReactNode } from 'react';

export function PageHeader({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-ink-700">
      <div className="blueprint absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-[1240px] px-4 py-12 sm:px-6 sm:py-16">
        <p className="kicker">{kicker}</p>
        <h1 className="mt-2 font-serif text-[40px] leading-tight text-fg sm:text-[52px]">
          {title}
        </h1>
        {children && (
          <div className="mt-4 max-w-3xl text-[16.5px] leading-relaxed text-fg-muted">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
