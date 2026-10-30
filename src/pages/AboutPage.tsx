import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader';
import { SITE } from '@/data/site';
import { usePageTitle } from '@/hooks/usePageTitle';

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink-700 py-8 first:border-t-0">
      <h2 className="font-serif text-[26px] text-fg">{title}</h2>
      <div className="prose-ij mt-3 max-w-3xl text-[15.5px]">{children}</div>
    </section>
  );
}

export function AboutPage() {
  usePageTitle('About');
  return (
    <>
      <PageHeader kicker="About" title="Don't memorize the JVM. Explore it.">
        <p>
          Inside Java is an open-source, interactive atlas of Java and JVM internals. It is built
          for people who want an accurate mental model of how Java actually runs, from absolute
          beginners to engineers preparing for JVM interviews.
        </p>
      </PageHeader>
      <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6">
        <Block title="Why it exists">
          <p>
            Most explanations of the JVM are a rectangle with six smaller rectangles inside. That
            picture hides what matters: how the parts depend on each other, which parts the
            specification requires and which are one implementation's choices, and what actually
            happens when a line of Java runs.
          </p>
          <p>
            Inside Java draws the machine as an anatomy plate you can take apart. Every part is
            selectable, connected, dissected and explained at two levels, and every walkthrough uses
            real output from a real JDK.
          </p>
        </Block>
        <Block title="Versions">
          <ul>
            <li>
              <strong>Specification baseline:</strong> {SITE.specVersion} (Java Virtual Machine
              Specification and Java Language Specification).
            </li>
            <li>
              <strong>Implementation details:</strong> {SITE.implementationVersion}, checked against
              the OpenJDK source tag <code>jdk-25-ga</code>.
            </li>
            <li>
              <strong>Verified examples:</strong> compiled and run with OpenJDK 25.0.4 on Linux x64
              (4 CPUs). Flag defaults come from <code>-XX:+PrintFlagsFinal</code> on that machine;
              some are chosen ergonomically and differ on yours.
            </li>
          </ul>
        </Block>
        <Block title="Accuracy policy">
          <ul>
            <li>
              Specification concepts and HotSpot implementation structures are always distinguished
              (solid versus dashed outlines, and labels).
            </li>
            <li>
              Bytecode is real <code>javap</code> output; it is never written by hand.
            </li>
            <li>
              Every diagram, dissection and walkthrough carries a visible accuracy note saying what
              it simplifies.
            </li>
            <li>
              Simulations and walkthroughs are educational models of JVM behaviour, not the JVM
              itself, and say so.
            </li>
            <li>
              Technically important claims cite primary sources: see the{' '}
              <Link to="/references">references</Link>.
            </li>
          </ul>
          <p>
            Found an error? Please <a href={`${SITE.repository}/issues`}>open an issue</a> with a
            source. Corrections are the most valuable contribution.
          </p>
        </Block>
        <Block title="Privacy and hosting">
          <p>
            The site is static files on GitHub Pages: no backend, no accounts, no analytics, no
            cookies, no third-party requests. Progress, bookmarks and preferences live in your
            browser's localStorage and never leave your device. You can clear them from the learning
            preferences menu in the header.
          </p>
        </Block>
        <Block title="Open source">
          <p>
            The code and content are MIT licensed. Fonts (Inter, JetBrains Mono, Source Serif 4) are
            bundled under the SIL Open Font License. Third-party licenses are listed in{' '}
            <code>THIRD_PARTY_NOTICES.md</code> in the <a href={SITE.repository}>repository</a>.
            Java and OpenJDK are trademarks or registered trademarks of Oracle and/or its
            affiliates; this project is independent and not affiliated with Oracle or the OpenJDK
            project.
          </p>
        </Block>
      </div>
    </>
  );
}
