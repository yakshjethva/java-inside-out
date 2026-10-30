import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { PRIMARY_NAV, SECONDARY_NAV, SITE } from '@/data/site';
import { cn } from '@/lib/cn';
import { LogoMark } from './Logo';
import { SettingsMenu } from './SettingsMenu';

export function SiteHeader() {
  const location = useLocation();
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const menuOpen = openOnPath === location.pathname;
  const setMenuOpen = (update: (open: boolean) => boolean) =>
    setOpenOnPath(update(menuOpen) ? location.pathname : null);

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
            Inside <span className="italic text-rt-300">Java</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 md:flex">
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-[13.5px] transition-colors',
                  isActive ? 'bg-ink-750 text-fg' : 'text-fg-muted hover:bg-ink-800 hover:text-fg',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <SettingsMenu />
          <a
            href={SITE.repository}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden h-9 items-center rounded-md px-2.5 text-[13px] text-fg-muted hover:bg-ink-750 hover:text-fg sm:inline-flex"
          >
            Source<span className="sr-only"> code on GitHub (opens in a new tab)</span>
          </a>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted hover:bg-ink-750 hover:text-fg md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-ink-700 bg-ink-950 px-4 pb-4 md:hidden"
        >
          <ul className="divide-y divide-ink-700">
            {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn('block py-3', isActive ? 'text-fg' : 'text-fg-muted')
                  }
                >
                  <span className="block text-[15px]">{item.label}</span>
                  <span className="block text-[12.5px] text-fg-subtle">{item.description}</span>
                </NavLink>
              </li>
            ))}
            <li>
              <a
                href={SITE.repository}
                target="_blank"
                rel="noreferrer noopener"
                className="block py-3 text-fg-muted"
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
