# Inside Java

**Understand Java from the inside out.**

Inside Java is an open-source, interactive atlas of Java and JVM internals. Instead of
memorising diagrams, you explore one: a technical plate of the JVM where every part is a real
component you can select, inspect, take apart and watch at work.

It is a static site. There is no backend, database, account, analytics or paid service, and
after the first visit it keeps working offline. Once the deployment workflow has run on `main`,
the site is served from GitHub Pages at <https://yakshjethva.github.io/java-inside-out/>.

## What is in this release

This release completes milestones M1 (foundation and deployment) and M2 (the JVM anatomy). See
[`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) for the architecture and the full
roadmap.

- **JVM Anatomy explorer** (`/anatomy`): 66 components (36 defined by the JVM Specification, 19
  HotSpot implementation structures and 11 platform parts) on one plate, with 39 relationships.
  - Four modes: **Anatomy** (the complete map), **Exploded** (subsystems pulled apart with
    numbered parts), **Internal** (12 hand-drawn dissections, such as the heap, a stack frame,
    the template interpreter and the code cache) and **Execution** (5 step-by-step scenarios,
    including JVM launch and `new Person("Alex")`).
  - Pan and zoom, selection, hover labels, relationship highlighting, breadcrumbs, a searchable
    component tree, layer visibility, collapse and expand, legend, and full keyboard operation.
  - The inspector explains each component at a beginner and a technical level, with its purpose,
    inputs and outputs, a verified example, real-world practice, misconceptions and sources.
- **Learning paths**, a **glossary** of 82 terms at two levels (every term in the text opens in
  place), **references** (122 primary sources, with "cited by" links), **About** and
  **Contributing** pages.
- Progress, bookmarks, quiz answers and preferences are stored in your browser only.

Later milestones add the Class Loader Explorer, Runtime Memory Explorer, Execution Engine and
Bytecode Explorers, GC Lab, Concurrency Lab and Collections Explorer. They are not linked from
the site until they exist.

## Accuracy

- Specifications: JVMS and JLS for Java SE 25, Java SE 25 API documentation.
- Implementation: OpenJDK HotSpot, JDK 25, checked against the `jdk-25-ga` source tag.
- Every bytecode listing, flag value and log line was produced with OpenJDK 25.0.4 (`javac`,
  `javap -c -v`, `java -XX:+PrintFlagsFinal`, `-Xlog`) and records how it was produced.
- The plate marks provenance with line style as well as colour: solid outlines for JVM
  Specification concepts, dashed outlines with an `HS` tag for HotSpot structures, dotted
  outlines for parts outside the JVM. Every simplified visualization carries an accuracy note.

Found a mistake? Please [open an issue](https://github.com/yakshjethva/java-inside-out/issues)
with a source.

## Local development

You need Node.js 22 or newer (see `.nvmrc`) and npm.

```bash
git clone https://github.com/yakshjethva/java-inside-out.git
```

```bash
cd java-inside-out
```

```bash
npm ci
```

```bash
npm run dev
```

The development server prints its local URL (by default <http://localhost:5173/>).

| Command                 | What it does                                                       |
| ----------------------- | ------------------------------------------------------------------ |
| `npm run dev`           | Development server with hot reload                                 |
| `npm run typecheck`     | TypeScript in strict mode (application, tests and tooling)         |
| `npm run lint`          | ESLint (including accessibility rules) and Prettier                |
| `npm test`              | Unit, component and content-integrity tests (Vitest)               |
| `npm run build`         | Production build into `dist/`                                      |
| `npm run check`         | All of the above: run it before opening a pull request             |
| `npm run test:e2e`      | Browser tests (Playwright) against a production build on a subpath |
| `npm run preview:pages` | Serve `dist/` the way GitHub Pages does (base path, 404 page)      |
| `npm run format`        | Format every file with Prettier                                    |

Browser tests need a Playwright browser once:

```bash
npx playwright install chromium
```

`npm run test:e2e` builds the site with the base path `/java-inside-out/` and serves it with
`scripts/serve-pages.mjs`, which mimics GitHub Pages: files under the base path, a redirect for
directories without a trailing slash, and `404.html` with status 404 for unknown paths. To look
at that build yourself:

```bash
BASE_PATH=/java-inside-out/ npm run build
```

```bash
npm run preview:pages
```

Then open <http://localhost:4173/java-inside-out/>.

## Deployment to GitHub Pages

Deployment is fully automated by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**. This is
   a one-time step.
2. Push to `main` (or run the workflow by hand from the **Actions** tab).

The workflow checks out the code, installs dependencies with `npm ci`, type-checks, lints, runs
the unit tests, builds, runs the browser tests against that build on its Pages subpath, and then
deploys it. Pull requests run every step except the deployment.

### Base path

GitHub Pages serves a project site from `/<repository>/`, so the build needs that base path.
The workflow sets `BASE_PATH` automatically:

- `/<repository>/` for a project site (here `/java-inside-out/`);
- `/` for a user or organisation site (a repository named `<owner>.github.io`);
- the value of the `PAGES_BASE_PATH` repository variable, if you set one. Use `/` with a custom
  domain.

The base path is applied by Vite to every asset URL and used as the router's basename; nothing in
the code assumes the site lives at `/`. Because GitHub Pages has no rewrite rules, the build also
writes `404.html` and a copy of `index.html` for each top-level page, so deep links such as
`/java-inside-out/anatomy?c=heap` load with HTTP 200 (after GitHub Pages adds the trailing
slash) and unknown paths still load the app, with status 404.

### Offline use

A small service worker (`src/sw/service-worker.js`, registered in production builds only)
precaches the built files after the first visit. Pages are fetched from the network first, so a
new deployment shows up immediately, and fall back to the cached copy when you are offline.

## Project structure

```
src/
  app/          router, root layout, service worker registration
  pages/        one component per route
  components/   anatomy canvas and nodes, inspector, code, timeline, learning, layout, ui
  modules/jvm/  the anatomy explorer: layout, scene, modes, dissections
  content/      JVM components, relationships, scenarios, quiz, learning paths
  glossary/     glossary terms
  data/         source registry and site navigation
  simulators/   scenario playback state machine
  hooks/, lib/  persistence, media queries, rich text, geometry, storage
  sw/           service worker
tests/
  unit/         Vitest
  e2e/          Playwright
scripts/        GitHub Pages emulator used by the browser tests
```

## Contributing

Contributions of every size are welcome, from a corrected sentence to a new laboratory. Read
[`CONTRIBUTING.md`](CONTRIBUTING.md) first: it explains the accuracy rules, how content is
structured and what a pull request needs.

## License

The code and content are released under the [MIT License](LICENSE). Bundled fonts and libraries
keep their own licences; see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

Java and OpenJDK are trademarks or registered trademarks of Oracle and/or its affiliates. Inside
Java is an independent educational project and is not affiliated with or endorsed by Oracle.
