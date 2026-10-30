import { Link } from 'react-router';
import { PRIMARY_NAV, SECONDARY_NAV, SITE } from '@/data/site';
import { LogoMark } from './Logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-700 bg-ink-950">
      <div className="mx-auto grid max-w-[1680px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark size={22} />
            <span className="font-serif text-lg text-fg">Inside Java</span>
          </div>
          <p className="mt-2 max-w-md text-[13.5px] text-fg-muted">
            {SITE.tagline} An open-source atlas of the JVM. Specification baseline:{' '}
            {SITE.specVersion}. Implementation details: {SITE.implementationVersion}.
          </p>
          <p className="mt-3 text-[12.5px] text-fg-subtle">
            MIT licensed · no accounts, no tracking, no backend · your progress stays in your
            browser.
          </p>
        </div>
        <nav aria-label="Footer: explore">
          <p className="kicker">Explore</p>
          <ul className="mt-2 space-y-1.5 text-[13.5px]">
            {PRIMARY_NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-fg-muted hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Footer: project">
          <p className="kicker">Project</p>
          <ul className="mt-2 space-y-1.5 text-[13.5px]">
            {SECONDARY_NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-fg-muted hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={SITE.repository}
                target="_blank"
                rel="noreferrer noopener"
                className="text-fg-muted hover:text-fg"
              >
                GitHub repository<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
