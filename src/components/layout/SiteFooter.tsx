import { Link } from 'react-router';
import { MORE_NAV, PRIMARY_NAV, SITE } from '@/data/site';
import { LogoMark } from './Logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#080b10]">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark size={22} />
            <span className="text-[14px] font-semibold tracking-tight text-white">Runtime Atlas</span>
          </div>
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/55">
            {SITE.tagline} An independent, open-source learning experience for the Java Virtual Machine, runtime architecture and execution internals.
          </p>
          <p className="mt-4 max-w-md text-[11px] leading-relaxed text-white/35">
            Independent educational project. Java and OpenJDK are trademarks of their respective owners. Not affiliated with or endorsed by Oracle or the OpenJDK project.
          </p>
          <p className="mt-4 text-[11px] text-white/35">MIT licensed · no accounts · no tracking · progress stays in your browser.</p>
        </div>
        <nav aria-label="Footer: explore">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Explore</p>
          <ul className="mt-4 space-y-2.5 text-[13px]">{PRIMARY_NAV.map((item) => <li key={item.to}><Link to={item.to} className="text-white/60 transition hover:text-white">{item.label}</Link></li>)}</ul>
        </nav>
        <nav aria-label="Footer: project">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Project</p>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            {MORE_NAV.map((item) => <li key={item.to}><Link to={item.to} className="text-white/60 transition hover:text-white">{item.label}</Link></li>)}
            <li><a href={SITE.repository} target="_blank" rel="noreferrer noopener" className="text-white/60 transition hover:text-white">GitHub repository<span className="sr-only"> (opens in a new tab)</span></a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/[0.07]"><div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-5 py-4 text-[10px] text-white/35 sm:px-8 sm:flex-row sm:items-center sm:justify-between"><span>Designed for understanding. Built for curiosity.</span><span>Specification baseline: {SITE.specVersion} · Implementation: {SITE.implementationVersion}</span></div></div>
    </footer>
  );
}
