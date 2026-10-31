import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { MORE_NAV, PRIMARY_NAV, SITE } from '@/data/site';
import { cn } from '@/lib/cn';
import { LogoMark } from './Logo';
import { SettingsMenu } from './SettingsMenu';

export function SiteHeader() {
  const location = useLocation();
  // Menus belong to the page they were opened on, so navigating closes them.
  const here = location.pathname + location.hash;
  const [openOn, setOpenOn] = useState<{ menu: 'mobile' | 'more'; at: string } | null>(null);
  const menuOpen = openOn?.menu === 'mobile' && openOn.at === here;
  const moreOpen = openOn?.menu === 'more' && openOn.at === here;
  const toggle = (menu: 'mobile' | 'more') =>
    setOpenOn((current) =>
      current?.menu === menu && current.at === here ? null : { menu, at: here },
    );
  const moreActive = MORE_NAV.some((item) => item.to.split('#')[0] === location.pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/80 bg-ink-950/85 backdrop-blur supports-[backdrop-filter]:bg-ink-950/70">
      <div className="mx-auto flex h-14 max-w-[1680px] items-center gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-md text-fg"
          aria-label={`${SITE.name}, home`}
        >
          <LogoMark />
          <span className="font-serif text-[19px] leading-none tracking-tight">
            Inside <span className="text-rt-300 italic">Java</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 lg:flex">
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-[14px] transition-colors',
                  isActive ? 'bg-ink-750 text-fg' : 'text-fg-muted hover:bg-ink-800 hover:text-fg',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <MoreMenu
            open={moreOpen}
            active={moreActive}
            onToggle={() => toggle('more')}
            onClose={() => setOpenOn(null)}
          />
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <SettingsMenu />
          <a
            href={SITE.repository}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden h-9 items-center rounded-md px-2.5 text-[13px] text-fg-muted hover:bg-ink-750 hover:text-fg xl:inline-flex"
          >
            Source<span className="sr-only"> code on GitHub (opens in a new tab)</span>
          </a>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted hover:bg-ink-750 hover:text-fg lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => toggle('mobile')}
          >
            {menuOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="max-h-[calc(100dvh-56px)] overflow-y-auto overscroll-contain border-t border-ink-700 bg-ink-950 px-4 pb-4 lg:hidden"
        >
          <ul className="divide-y divide-ink-700">
            {PRIMARY_NAV.map((item) => (
              <li key={item.to}>
                <MobileLink to={item.to} label={item.label} description={item.description} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12.5px] text-fg-subtle">More</p>
          <ul className="divide-y divide-ink-700">
            {MORE_NAV.map((item) => (
              <li key={item.to}>
                <MobileLink to={item.to} label={item.label} />
              </li>
            ))}
            <li>
              <a
                href={SITE.repository}
                target="_blank"
                rel="noreferrer noopener"
                className="block py-3 text-[15px] text-fg-muted hover:text-fg"
              >
                Source code on GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

function MobileLink({
  to,
  label,
  description,
}: {
  to: string;
  label: string;
  description?: string;
}) {
  return (
    <NavLink
      to={to}
      end={to.includes('#')}
      className={({ isActive }) =>
        cn('block py-3 hover:text-fg', isActive && !to.includes('#') ? 'text-fg' : 'text-fg-muted')
      }
    >
      <span className="block text-[15px]">{label}</span>
      {description && <span className="block text-[12.5px] text-fg-subtle">{description}</span>}
    </NavLink>
  );
}

/** "More" disclosure: a button that shows and hides a list of links. */
function MoreMenu({
  open,
  active,
  onToggle,
  onClose,
}: {
  open: boolean;
  active: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
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
      if (event.key === 'Escape') {
        onClose();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={onToggle}
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[14px] transition-colors',
          active || open ? 'bg-ink-750 text-fg' : 'text-fg-muted hover:bg-ink-800 hover:text-fg',
        )}
      >
        More
        <ChevronDown
          size={14}
          aria-hidden
          className={cn('transition-transform', open && 'rotate-180')}
        />
      </button>
      <div
        ref={panelRef}
        id={listId}
        hidden={!open}
        className="absolute top-full left-0 z-50 mt-2 w-[300px] rounded-lg border border-ink-600 bg-ink-900 p-1.5 shadow-2xl"
      >
        <ul>
          {MORE_NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onClose}
                className="block rounded-md px-3 py-2 hover:bg-ink-800"
              >
                <span className="block text-[14px] text-fg">{item.label}</span>
                <span className="block text-[12.5px] text-fg-subtle">{item.description}</span>
              </Link>
            </li>
          ))}
          <li className="mt-1 border-t border-ink-700 pt-1">
            <a
              href={SITE.repository}
              target="_blank"
              rel="noreferrer noopener"
              className="block rounded-md px-3 py-2 text-[14px] text-fg-muted hover:bg-ink-800 hover:text-fg"
            >
              Source code on GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
