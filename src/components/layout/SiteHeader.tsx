import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { MORE_NAV, PRIMARY_NAV, SITE } from '@/data/site';
import { cn } from '@/lib/cn';
import { LogoMark } from './Logo';
import { SettingsMenu } from './SettingsMenu';

export function SiteHeader() {
  const location = useLocation();
  const here = location.pathname + location.hash;
  const [openOn, setOpenOn] = useState<{ menu: 'mobile' | 'more'; at: string } | null>(null);
  const menuOpen = openOn?.menu === 'mobile' && openOn.at === here;
  const moreOpen = openOn?.menu === 'more' && openOn.at === here;
  const toggle = (menu: 'mobile' | 'more') =>
    setOpenOn((current) => current?.menu === menu && current.at === here ? null : { menu, at: here });
  const moreActive = MORE_NAV.some((item) => item.to.split('#')[0] === location.pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080b10]/85 backdrop-blur-xl supports-[backdrop-filter]:bg-[#080b10]/75">
      <div className="mx-auto flex h-[68px] max-w-[1500px] items-center gap-5 px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-3 rounded-md text-fg" aria-label={`${SITE.name}, home`}>
          <LogoMark />
          <span className="font-sans text-[15px] font-semibold tracking-[-0.035em] text-white">
            Runtime <span className="text-[#9bb8ad]">Atlas</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-8 hidden items-center gap-1 lg:flex">
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) =>
              cn('rounded-full px-4 py-2 text-[13px] font-medium transition-colors',
                isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/[0.06] hover:text-white')
            }>{item.label}</NavLink>
          ))}
          <MoreMenu open={moreOpen} active={moreActive} onToggle={() => toggle('more')} onClose={() => setOpenOn(null)} />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SettingsMenu />
          <a href={SITE.repository} target="_blank" rel="noreferrer noopener"
            className="hidden h-9 items-center rounded-full border border-white/15 px-4 text-[12px] font-medium text-white/70 transition hover:border-white/30 hover:text-white xl:inline-flex">
            GitHub <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/75 hover:bg-white/10 lg:hidden"
            aria-expanded={menuOpen} aria-controls="mobile-nav" aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => toggle('mobile')}>
            {menuOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="max-h-[calc(100dvh-68px)] overflow-y-auto overscroll-contain border-t border-white/10 bg-[#080b10] px-5 pb-5 lg:hidden">
          <ul className="divide-y divide-white/10">
            {PRIMARY_NAV.map((item) => <li key={item.to}><MobileLink to={item.to} label={item.label} description={item.description} /></li>)}
          </ul>
          <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-white/40">More</p>
          <ul className="divide-y divide-white/10">
            {MORE_NAV.map((item) => <li key={item.to}><MobileLink to={item.to} label={item.label} /></li>)}
            <li><a href={SITE.repository} target="_blank" rel="noreferrer noopener" className="block py-3 text-[14px] text-white/65 hover:text-white">Source code on GitHub<span className="sr-only"> (opens in a new tab)</span></a></li>
          </ul>
        </nav>
      )}
    </header>
  );
}

function MobileLink({ to, label, description }: { to: string; label: string; description?: string }) {
  return (
    <NavLink to={to} end={to.includes('#')} className={({ isActive }) =>
      cn('block py-3 hover:text-white', isActive && !to.includes('#') ? 'text-white' : 'text-white/65')}>
      <span className="block text-[14px]">{label}</span>
      {description && <span className="block text-[12px] text-white/40">{description}</span>}
    </NavLink>
  );
}

function MoreMenu({ open, active, onToggle, onClose }: { open: boolean; active: boolean; onToggle: () => void; onClose: () => void }) {
  const listId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); buttonRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKeyDown); };
  }, [open, onClose]);

  return (
    <div className="relative">
      <button ref={buttonRef} type="button" aria-expanded={open} aria-controls={listId} onClick={onToggle}
        className={cn('inline-flex items-center gap-1 rounded-full px-4 py-2 text-[13px] font-medium transition-colors',
          active || open ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/[0.06] hover:text-white')}>
        More <ChevronDown size={14} aria-hidden className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      <div ref={panelRef} id={listId} hidden={!open} className="absolute top-full left-0 z-50 mt-3 w-[300px] rounded-2xl border border-white/10 bg-[#111820] p-2 shadow-2xl">
        <ul>
          {MORE_NAV.map((item) => <li key={item.to}><Link to={item.to} onClick={onClose} className="block rounded-xl px-3 py-2.5 transition hover:bg-white/[0.06]">
            <span className="block text-[13px] text-white">{item.label}</span><span className="block text-[11px] text-white/45">{item.description}</span>
          </Link></li>)}
          <li className="mt-1 border-t border-white/10 pt-1"><a href={SITE.repository} target="_blank" rel="noreferrer noopener" className="block rounded-xl px-3 py-2.5 text-[12px] text-white/60 hover:bg-white/[0.06] hover:text-white">Source code on GitHub<span className="sr-only"> (opens in a new tab)</span></a></li>
        </ul>
      </div>
    </div>
  );
}
