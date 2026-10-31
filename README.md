# JVM Atlas

**Understand Java from the inside out.**

JVM Atlas is an open-source, interactive way to learn what happens inside the Java Virtual Machine. Beginners start
with one question, "What happens when you run a Java program?", and follow a single line of Java
from source code to the processor. Experienced developers open the same machine as a technical
plate of the JVM, where every part is a real component they can select, inspect, take apart and
watch at work.

**One machine. One source of truth. Multiple levels of understanding.**

It is a static site. There is no backend, database, account, analytics or paid service, and
after the first visit it keeps working offline. Once the deployment workflow has run on `main`,
the site is served from GitHub Pages at <https://yakshjethva.github.io/jvm-inside-out/>.

## What is in this release

This release completes milestones M1 (foundation and deployment) and M2 (the JVM anatomy) and
reshapes them into a beginner-first learning experience. See
[`docs/LEARNING_EXPERIENCE.md`](docs/LEARNING_EXPERIENCE.md) for how the site teaches and
[`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) for the architecture and roadmap.

- **Homepage:** the journey machine. Edit the message in `System.out.println("…")`, press
  _Run it_ and follow the program through the compiler, the class file, the class loader,
  memory, the execution engine and the CPU to the output. The bytecode is real `javac` 25.0.4
  output for this program, in which your message changes only the string constant; the
  class-file size is 404 bytes plus the message's length in modified UTF-8, which matches
  `javac` 25.0.4.
- **Start here** (`/start`): the guided first lesson, "What happens when you run a Java
  program?", in seven short chapters (your first program, the compiler, the JVM, loading
  classes, memory, execution, garbage collection) and a recap.
  - Each chapter asks for a prediction, shows what really happens in an interactive exhibit,
    explains it at your level, introduces one term, checks your understanding and links to the
    same part on the JVM map.
  - The exhibits can be stepped, paused and replayed: compiling `Hello.java`, loading a class,
    `new Person("Mia")` on the stack and heap, a method becoming machine code, and an object
    graph you can break and collect.
  - The recap has a diagram, a teach-back in your own words and a five-question check.
- **Explore the JVM** (`/anatomy`): 66 components (36 defined by the JVM Specification, 19
  HotSpot implementation structures and 11 platform parts) on one plate, with 39 relationships.
  - It opens on the six main parts (class loading, memory, execution engine, garbage
    collection, native interface, platform). _Show the full JVM map_ reveals everything, and
    the choice is remembered.
  - Four views: **Overview** (the map), **Show the parts** (subsystems pulled apart with
    numbered parts), **Look inside** (12 hand-drawn dissections, such as the heap, a stack
    frame, the template interpreter and the code cache) and **Watch it run** (5 step-by-step
    walkthroughs, including JVM launch and `new Person("Alex")`).
  - _Find a component_, a first-visit guided tour and _Center selected part_; pan, zoom,
    relationship highlighting, breadcrumbs and full keyboard operation. _Advanced options_
    hold the component tree, layer visibility, the diagram key, collapse and expand, and
    keyboard help.
  - The inspector answers _What is this?_, _Picture it_, _What actually happens?_, _See it
    working_, _Where does it fit?_ and _Check your understanding_. _Explore the technical
    details_ keeps everything else: specification vs HotSpot, internal structure, inputs and
    outputs, all connections, a verified example, practice, misconceptions, accuracy notes and
    sources.
- **Three explanation levels:** Simple, Developer and Deep dive, chosen once and used
  everywhere. Twelve core concepts have all three, with an analogy that says where it stops
  being accurate; elsewhere the Developer level falls back to the Deep dive and says so.
- **Learn** (`/paths`): learning organised around questions, starting with the first lesson,
  then seven more questions that link to what exists now and name the labs still to come,
  followed by your progress, bookmarks and the full curriculum by subject.
- A **glossary** of 84 terms explained simply and in depth (every term in the text opens in
  place), **references** (123 primary sources, with "cited by" links), and **About** (accuracy
  policy and project status) and **Contributing** pages.
- Progress, bookmarks, quiz answers and preferences are stored in your browser only.
  Preferences and progress saved by the previous release are migrated, never reset.

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

Found a mistake? Please [open an issue](https://github.com/yakshjethva/jvm-inside-out/issues)
with a source.

## Local development

You need Node.js 22 or newer (see `.nvmrc`) and npm.

```bash
git clone https://github.com/yakshjethva/jvm-inside-out.git
```

```bash
cd jvm-inside-out
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

`npm run test:e2e` builds the site with the base path `/jvm-inside-out/` and serves it with
`scripts/serve-pages.mjs`, which mimics GitHub Pages: files under the base path, a redirect for
directories without a trailing slash, and `404.html` with status 404 for unknown paths. To look
at that build yourself:

```bash
BASE_PATH=/jvm-inside-out/ npm run build
```

```bash
npm run preview:pages
```

Then open <http://localhost:4173/jvm-inside-out/>.

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

- `/<repository>/` for a project site (here `/jvm-inside-out/`);
- `/` for a user or organisation site (a repository named `<owner>.github.io`);
- the value of the `PAGES_BASE_PATH` repository variable, if you set one. Use `/` with a custom
  domain.

The base path is applied by Vite to every asset URL and used as the router's basename; nothing in
the code assumes the site lives at `/`. Because GitHub Pages has no rewrite rules, the build also
writes `404.html` and a copy of `index.html` for each top-level page, so deep links such as
`/jvm-inside-out/anatomy?c=heap` load with HTTP 200 (after GitHub Pages adds the trailing
slash) and unknown paths still load the app, with status 404.

### Offline use

A small service worker (`src/sw/service-worker.js`, registered in production builds only)
precaches the app shell, scripts, styles and Latin fonts after the first visit, and caches other
files (not pages) the first time they are fetched. Pages always come from the network, so a new
deployment shows up immediately; when you are offline, the cached app shell loads instead and
opens the page you asked for.

## Project structure

```
src/
  app/            router, route table, root layout, service worker registration
  pages/          one component per route
  components/     anatomy canvas and nodes, inspector, code, timeline, learning, layout, ui
  modules/
    jvm/          the JVM explorer: layout, scene, views, tour, dissections
    lesson/       the Start here lesson: exhibits, step controls, predictions, teach-back
    journey/      the homepage journey machine
  simulators/     pure models: class-file size and bytecode, tiering, reachability, playback
  content/        JVM components and their teaching layer, regions, relationships,
                  walkthroughs, quizzes, the first lesson, learning paths
  glossary/       glossary terms
  data/           source registry and site navigation
  hooks/, lib/    learning state and migration, explanation levels, rich text, geometry, storage
  sw/             service worker
tests/
  unit/           Vitest
  e2e/            Playwright
scripts/          GitHub Pages emulator used by the browser tests
docs/             implementation plan and learning-experience design
```

## Contributing

Contributions of every size are welcome, from a corrected sentence to a new laboratory. Read
[`CONTRIBUTING.md`](CONTRIBUTING.md) first: it explains the accuracy rules, how content is
structured and what a pull request needs.

## License

The code and content are released under the [MIT License](LICENSE). Bundled fonts and libraries
keep their own licences; see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

JVM Atlas is an independent educational project and is not affiliated with or endorsed by Oracle.
Java and OpenJDK are trademarks or registered trademarks of Oracle and/or its affiliates.
