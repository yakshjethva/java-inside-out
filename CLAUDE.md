# Inside Java

**Understand Java from the inside out.**

Inside Java is an open-source, interactive learning site about Java and JVM internals. It teaches
one machine at several depths: a beginner follows a single line of Java from source code to the
CPU, and an engineer opens the same machine as a 66-component technical plate with HotSpot
structures, verified bytecode and primary sources.

> **One machine. One source of truth. Multiple levels of understanding.**

These instructions describe the project as it is built. Read them before changing anything, and
keep them, `README.md`, `docs/IMPLEMENTATION_PLAN.md` and `docs/LEARNING_EXPERIENCE.md` in step
with the code.

## Hard constraints

- **Static site only.** No backend, database, account system, API, paid service, analytics or
  tracking. No fonts, scripts or images from other hosts; technical images are original SVG.
- **GitHub Pages subpath.** The site is served from `/jvm-inside-out/`. Never write
  root-relative asset paths; use `import.meta.env.BASE_URL` or router links (the router's
  basename is the base path).
- **Visualizations are custom SVG.** Do not add a diagram library, and do not add large
  dependencies without a reason recorded in the pull request and in `THIRD_PARTY_NOTICES.md`.
- **No dead ends.** Link only to pages that exist. Planned work is plain text with its milestone.
- **Never reset learner data.** Stored data changes go through a migration (see Persistence).
- **Do not delete capabilities to simplify the interface.** Move them behind progressive
  disclosure instead.
- **Do not fabricate.** No invented bytecode, flags, log lines, numbers, quotes or sources.

## Stack

| Concern          | Implementation                                                                        |
| ---------------- | ------------------------------------------------------------------------------------- |
| UI               | React 19.3, React Router 8.5 (`createBrowserRouter`, lazy routes)                     |
| Language         | TypeScript 6, strict                                                                  |
| Build            | Vite 8; a build plugin in `vite.config.ts` writes the GitHub Pages output             |
| Styling          | Tailwind CSS 4: tokens in `src/styles/index.css` (`@theme static`), container queries |
| Motion and icons | Motion 14, Lucide                                                                     |
| Code             | Shiki 4 (Java and shell grammars only, JavaScript regex engine), loaded lazily        |
| Fonts            | Self-hosted via Fontsource: Source Serif 4, Inter, JetBrains Mono                     |
| Diagrams         | Hand-written SVG components (no diagram library)                                      |
| Unit tests       | Vitest 5, Testing Library, jsdom                                                      |
| Browser tests    | Playwright 1.63 (desktop Chrome 1440 × 900 and Pixel 7)                               |
| CI and hosting   | GitHub Actions and GitHub Pages                                                       |
| Offline          | A dependency-free service worker (`src/sw/service-worker.js`)                         |

Node.js 22 or newer (`.nvmrc`). The `@` import alias points to `src/`.

## Commands

| Command                                    | What it does                                                               |
| ------------------------------------------ | -------------------------------------------------------------------------- |
| `npm ci`                                   | Install exact dependencies                                                 |
| `npm run dev`                              | Development server (Vite, <http://localhost:5173/>)                        |
| `npm run typecheck`                        | `tsc` for the app, tests and tooling                                       |
| `npm run lint`                             | ESLint (with jsx-a11y, react-hooks) and `prettier --check`                 |
| `npm run format`                           | Prettier, writing changes                                                  |
| `npm test`                                 | Vitest: unit, component and content-integrity tests                        |
| `npm run build`                            | Production build into `dist/`                                              |
| `npm run check`                            | typecheck, lint, test and build: run before every pull request             |
| `npm run test:e2e`                         | Playwright against a production build served on `/jvm-inside-out/`         |
| `BASE_PATH=/jvm-inside-out/ npm run build` | Build exactly as GitHub Pages serves it                                    |
| `npm run preview:pages`                    | Serve `dist/` like GitHub Pages at <http://localhost:4173/jvm-inside-out/> |

`npm run test:e2e` builds with `BASE_PATH=/jvm-inside-out/` and serves `dist/` through
`scripts/serve-pages.mjs`, which reproduces GitHub Pages: files under the base path, trailing-slash
redirects, and `404.html` with status 404. Set `E2E_SKIP_BUILD=1` to test an existing `dist/`.
Install the browser once with `npx playwright install chromium`.

## Architecture

Four layers, kept apart so each can change without the others:

| Layer         | Where                                                           | Rule                                              |
| ------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| Content       | `src/content`, `src/glossary`, `src/data`                       | Typed data only: no JSX, no layout coordinates    |
| Simulation    | `src/simulators`                                                | Pure functions with unit tests; no React, no DOM  |
| Visualization | `src/components/anatomy`, `src/modules/*`                       | Reads content by id; owns coordinates and drawing |
| UI            | `src/app`, `src/pages`, `src/components/{layout,ui,learning,…}` | Composition, routing, persistence                 |

```text
src/
  app/              router (routes.tsx), route table (routePaths.ts), root layout, service worker registration
  pages/            one component per route
  components/
    anatomy/        AnatomyCanvas (pan and zoom), ArchitectureNode, RelationshipConnector, ComponentSearch, tree, legend
    inspector/      ComponentInspector: the progressive-disclosure explanation panel
    learning/       RichText, GlossaryTerm, KnowledgeCheck, LevelSwitch, LevelText, AccuracyNote, SourceReference
    layout/ ui/ code/ timeline/ diagrams/
  modules/
    jvm/            the explorer: AnatomyExplorer, AnatomyPlate, layout.ts (coordinates), scene, camera, tour, internals/ (12 dissections)
    lesson/         the Start here lesson: ExhibitFrame, StepControls, useStepper, Prediction, TermCard, TeachBack, ReferenceArrows, exhibits/
    journey/        JourneyMachine: the homepage's line-of-Java journey
  simulators/       journey (class-file size, bytecode), tiering, reachability, playback
  content/
    jvm/            components/ (66 docs), teaching.ts (core-concept layer), regions.ts, relationships, scenarios, quiz
    lesson/         firstRun.ts: the first lesson, its listings and its quiz
    paths.ts, questions.ts, status.ts
  glossary/         84 terms
  data/             references.ts (123 primary sources), site.ts (navigation)
  hooks/, lib/      learning state, storage, levels, rich text, geometry, media queries
  types/            content.ts, lesson.ts
  styles/           index.css: design tokens and shared classes
  sw/               service worker (the build prepends its precache list)
tests/unit/         Vitest
tests/e2e/          Playwright
scripts/            serve-pages.mjs (local GitHub Pages emulator)
docs/               IMPLEMENTATION_PLAN.md, LEARNING_EXPERIENCE.md
```

### Routes and URL state

| Route           | Page            | URL state                                                               |
| --------------- | --------------- | ----------------------------------------------------------------------- |
| `/`             | Home            |                                                                         |
| `/start`        | Start here      | `chapter=program\|compiler\|jvm\|loading\|memory\|execution\|gc\|recap` |
| `/paths`        | Learn           |                                                                         |
| `/anatomy`      | Explore the JVM | `c` component, `mode`, `view=overview\|full`, `s` walkthrough, `step`   |
| `/glossary`     | Glossary        | `#term-id`                                                              |
| `/references`   | References      | `#ref-<reference-id>`                                                   |
| `/about`        | About           | `#project-status`                                                       |
| `/contributing` | Contributing    |                                                                         |

Routes are registered in two places. The router (`src/app/routes.tsx`) declares the pages, and
`STATIC_ROUTES` in `src/app/routePaths.ts` drives the build, which writes an `index.html` (with the
page title) for each route plus `404.html`, so deep links answer HTTP 200 on GitHub Pages. Add a
page to both, and only once it exists. Explorer `mode` values stay
`anatomy|exploded|internal|execution` in URLs even though the interface calls them Overview, Show
the parts, Look inside and Watch it run. Existing deep links must keep working.

### Bundles

Routes are lazy. Keep the shell (header, footer, settings) free of content: the header imports
`LevelSwitch`, never `LevelText` or `RichText`, which pull in the glossary and all component docs.
Interactive models that appear only on request (such as the inspector's "Try the interactive
model") are loaded with `React.lazy`, and the homepage's map preview mounts only when it comes
near the viewport. After the first page is idle, the remaining routes are prefetched.

### Persistence

`src/lib/storage.ts` provides `createPersistentStore(key, validate, defaults, migrate?)`; keys are
prefixed `inside-java:v1:`. `src/hooks/useLearningState.ts` owns the two stores:

- `preferences`: `level` (`simple|developer|deep`), `motion`, `mapView` (`overview|full`),
  `dismissed` (for example the explorer tour).
- `progress`: explored and understood components, bookmarks, recent pages, quiz answers,
  walkthroughs, lesson chapters.

When a stored shape changes, extend `migratePreferences` / `migrateProgress` so old data is
repaired field by field (the release that introduced three levels maps `beginner` to `simple` and
`technical` to `deep`). Never bump the prefix or clear storage to avoid a migration. Add a test to
`tests/unit/learning-state.test.ts` for every migration.

## Beginner-first learning philosophy

- **Start from a question the learner already has** ("What happens when I run my program?"), not
  from a subsystem name. The homepage is, in order: hero with _Start learning_ and _I already
  know Java. Explore the JVM._, the journey machine, what you'll discover, the beginner path, a
  route for experienced developers, a short accuracy section. It does not open on the full map.
- **Start here** (`/start`) is the entry point: seven chapters (program, compiler, JVM, loading
  classes, memory, execution, garbage collection) and a recap with a diagram, a teach-back and a
  five-question check.
- **Teaching cycle** for each chapter: question → prediction → what happens (the exhibit) → why
  (explanation at the chosen level) → the technical term → try it → check. The explanation stays
  hidden until the learner predicts or chooses to skip.
- **Introduce one term at a time**, after the learner has seen the thing it names.
- **Analogies** (`Analogy` in `src/types/content.ts`) must map each part of the picture to the
  real concept and state where the picture stops being accurate (`limits`). An analogy without
  limits is not accepted.
- **Experts are never slowed down.** Every chapter links to its component on the JVM map, the
  full map is one click from the overview, and deep links bypass the tour.

## Progressive disclosure rules

1. **Three explanation levels** describe the same machine: _Simple_ (no programming needed),
   _Developer_ (code, APIs, what you observe) and _Deep dive_ (JVMS/JLS sections, HotSpot
   structures, bytecode, flags). Leveled content uses `LeveledText { simple, developer?, deep }`
   from `src/lib/levels.ts`; render it with `components/learning/LevelText.tsx`.
2. **A missing level is not a missing explanation.** `textAtLevel` falls back from Developer to
   Deep dive and marks the result `fallback: true`; the UI says the level is not written yet.
3. **Default views stay small.** The inspector shows: What is this? · Picture it · What actually
   happens? · See it working · Where does it fit? · Check your understanding. Everything else
   (developer and deep-dive text, specification vs HotSpot, internals, inputs and outputs, all
   connections, verified example, practice, misconceptions, accuracy note, sources) is inside
   _Explore the technical details_, which opens by default at Deep dive.
4. **The explorer opens on six regions** (Class loading, Memory, Execution engine, Garbage
   collection, Native interface, Platform, from `src/content/jvm/regions.ts`). Selecting a region
   opens it; _Show the full JVM map_ shows all 66 components (remembered as `mapView`). Default
   controls are the view, _Find a component_ and _Guided tour_; layers, the diagram key, the
   component tree, collapse/expand and keyboard help live in _Advanced options_.
5. **Disclose, never delete.** A new field or capability must stay reachable from the default view
   in at most one or two steps.
6. **Core concepts get the full teaching layer** in `src/content/jvm/teaching.ts` (developer text,
   analogy, check question and, for all but JNI, an interactive demo from the lesson): JVM, class
   loader subsystem, class file, runtime data areas, heap, JVM stack, stack frame, method area,
   interpreter, JIT compiler, garbage collector, JNI. Other components fall back gracefully.

## Visualizations teach cause and effect

- Every interactive visual changes **because the learner did something**, and says in words what
  changed and why (the `ExhibitFrame` caption is an `aria-live` region).
- Sequences are steppable: restart, previous, play/pause, next, "Step n of N" (`useStepper`,
  `StepControls`). Nothing important happens only in an animation.
- Simulations are pure functions in `src/simulators` with unit tests written first. A visual may
  simplify, but it must not show something false; every simplified visual carries an accuracy
  note that says what was left out.
- Motion explains a change (a token travelling, a frame appearing, a reference breaking). It is
  never decorative, uses `transform`/`opacity`, and with reduced motion (`prefers-reduced-motion`
  or the motion preference) every state is still reachable, without movement.
- Colour never carries meaning alone: blue is execution and control flow, purple runtime
  components, green success and live state, orange warnings and exceptional paths, grey inactive.
  Each is paired with a line style, glyph or word. Provenance uses line style: solid for
  specification concepts, dashed with an `HS` tag for HotSpot structures, dotted for platform and
  build-time parts.

## Technical accuracy rules

- **Specification vs implementation.** Every component has a `provenance` of `spec`, `hotspot`
  or `platform`. Anything HotSpot-specific names the version it describes (OpenJDK HotSpot, JDK
  25, checked against the `jdk-25-ga` source tag).
- **Keep these distinctions:** JVM specification vs HotSpot; method area vs Metaspace; loading vs
  linking vs initialization; Java heap vs native memory; references vs memory addresses;
  reachability vs eligibility vs reclamation (and none of these says when a collection runs);
  JDK vs JRE vs JVM; bytecode vs machine code; interpreter vs JIT; conceptual model vs real
  implementation.
- **Primary sources.** Cite by id from `src/data/references.ts`: JVMS and JLS for Java SE 25, the
  Java SE 25 API documentation, JEPs, the JNI specification, OpenJDK source at a release tag. The
  type check fails on an unknown id.
- **Verified output only.** Bytecode, class-file sizes, flag values and log lines are produced with
  OpenJDK 25.0.4 (`javac`, `javap -c -v`, `-XX:+PrintFlagsFinal`, `-Xlog`, `-XX:+PrintCompilation`)
  and record how in `verifiedWith`. Never write them by hand. Simulators that derive values (for
  example the class-file size in `src/simulators/journey.ts`) are tested against verified values.
- **Simple is short, never false.** Do not say "primitives live on the stack", "objects are freed
  when they go out of scope", "the JIT compiles everything" and similar shortcuts.

## Testing

Add tests for new functionality; write simulator and migration tests before the code.

- `tests/unit/content-integrity.test.tsx` checks ids, the component tree, plate layout (inside
  parents, no overlaps), relationship routes, citations, scenario listings, quizzes, the teaching
  layer, the first lesson (including that its listings were verified with OpenJDK 25.0.4) and
  links to routes. It sweeps every piece of rich text for unknown glossary terms and non-HTTPS
  links.
- Component tests (`components.test.tsx`, `learning-experience.test.tsx`) cover the inspector,
  explorer overview and full map, tour, header, lesson gating and the journey machine.
- `learning-state.test.ts`, `storage.test.ts` and `simulators.test.ts` cover migration, persistence
  and the pure models.
- Browser tests (`tests/e2e/`) run desktop and mobile against the subpath build: direct links,
  back and forward, navigation, keyboard use, reduced motion, storage migration, offline reload,
  the whole first lesson, the explorer modes, console errors and internal links.

Do not claim something works in a browser unless a browser test or a real browser run showed it.

## Design system

- "Science museum after dark": a calm reading surface with lit exhibit cases (`.exhibit`) on the
  dark blueprint canvas; one dominant visual per screen.
- Source Serif 4 for questions and titles, Inter for reading (`.reading`: 17 px, at most about 70
  characters per line), JetBrains Mono only for code and technical identifiers. Sentence case for
  headings and labels. No text or label smaller than 11 px (glyphs inside icons excepted).
- Tokens (`ink`, `fg`, `exec`, `rt`, `ok`, `warn`, `plat`) are CSS custom properties shared by HTML
  and SVG.
- Layouts work from 360 px to wide desktops without horizontal scrolling. Every control is
  keyboard operable, has a visible focus ring and an accessible name, and meets the WCAG 2.2
  minimum target size (24 × 24 px); primary actions are larger.

## Deployment

`.github/workflows/deploy.yml` runs on pushes to `main`, pull requests and manual dispatch: `npm ci`,
typecheck, lint, unit tests, build with `BASE_PATH`, Playwright against that build, then (on
`main` only) uploads `dist/` and deploys to GitHub Pages. `BASE_PATH` is `/<repository>/`, `/` for
a `<owner>.github.io` repository, or the `PAGES_BASE_PATH` repository variable. One-time setup:
**Settings → Pages → Source: GitHub Actions**.

The service worker precaches the app shell, the favicon, every JavaScript and CSS bundle and the
Latin font subsets, and caches other same-origin files (not pages) the first time they are fetched.
Page navigations are never cached: they go to the network and fall back to the cached shell, which
renders the requested route. Hashed assets are cache-first, so after the first visit the site works
offline.

## Contributing

1. Follow this architecture and the rules above; read `CONTRIBUTING.md`.
2. Maintain technical accuracy and cite sources.
3. Add tests for new functionality.
4. Run `npm run check` (and `npm run test:e2e` for anything interactive).
5. Submit changes through pull requests.

## License

MIT; see [LICENSE](LICENSE). Bundled fonts and libraries keep their own licences
(`THIRD_PARTY_NOTICES.md`).
