# Learning experience architecture

**One machine. One source of truth. Multiple levels of understanding.**

This document describes how Inside Java teaches: the navigation, the first lesson, how the JVM
explorer is entered, how the inspector discloses depth, and the three explanation levels. It
complements [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md), which covers the technical
architecture and milestones.

## 1. Problems this redesign solves

An audit of the M2 release (desktop 1440 × 900 and mobile 390 × 844) found that the site showed
too much too early:

- The homepage opened on the complete 66-component plate, then stacked statistics, a bytecode
  walkthrough, progress, a laboratory status table, 13 learning paths and the accuracy policy. A
  visitor saw the machine before knowing what problem it solves.
- The navigation named technical areas (JVM Anatomy, Learning Paths, References) and did not
  make the first step obvious. The explanation level was a bare "Beginner" button.
- "Start Learning" led to a curriculum organised by subject and milestone codes (M3, M4).
- The explorer showed four modes and four tools before anything was selected, and the inspector
  opened every section (purpose, structure, inputs, outputs, connections, example,
  misconceptions, accuracy, sources) at once.

## 2. Principles

1. **Begin with a question the learner already has.** "What happens when I run my program?",
   not "Runtime data areas".
2. **The same model at every depth.** Simple, Developer and Deep dive explain the same
   components, connected to the same diagrams. Nothing is simplified into something false.
3. **Disclose depth, never delete it.** Every existing field, citation and dissection remains
   one step away.
4. **Teach cause and effect.** Each interactive visual changes because the learner did
   something, and says what changed and why.
5. **Analogies open doors.** Each analogy maps its parts to the real concept and says where it
   stops being accurate.

## 3. Navigation

```text
Inside Java   [Start here] [Learn] [Explore the JVM] [Glossary] [More ▾]      (level) (menu)
                                                               └ References
                                                                 About
                                                                 Contributing
                                                                 Project status
```

- **Start here** (`/start`): the guided first lesson.
- **Learn** (`/paths`): learning paths, each beginning with a question.
- **Explore the JVM** (`/anatomy`): the explorer. Existing deep links keep working.
- **More** groups reference and project pages. Mobile shows the same items in the same order.
- The level control in the header reads "Simple", "Developer" or "Deep dive".

## 4. Homepage

1. **Hero:** "Ever wondered what happens when you run Java code?", one supporting sentence,
   _Start learning_ (→ `/start`) and _I already know Java. Explore the JVM._ (→ `/anatomy`).
   A returning learner also sees "Continue with chapter n".
2. **The visual journey** (beside the hero on wide screens, below it on phones): the **journey
   machine**, an editable line of Java and a _Run it_ button. Running it follows the line through
   seven stations: compiler, class file, class loader, memory, execution engine, CPU and
   operating system, output. The three JVM stations are bracketed. Each station can be paused,
   stepped and revisited, shows its evidence (a command, bytes, a log line, bytecode) and links
   to the chapter that explains it. The bytecode and class-file size are real `javac` 25.0.4
   output for that class; only the string constant changes.
3. **What you'll discover:** four questions, each linked to the chapter that answers it.
4. **Start with one question:** the seven chapters of Start here, with progress.
5. **Already write Java?** Direct routes to the full map, a dissection, a verified walkthrough
   and the sources, beside a live preview of the full plate. The statistics live here, not in
   the hero.
6. **How we keep it accurate:** three short paragraphs with links to the policy and the
   references.

The laboratory status table moves to About → Project status. The curriculum moves to Learn.

## 5. Start here: "What happens when you run a Java program?"

Seven short chapters and an ending. Each chapter follows the teaching cycle where it fits:
question → prediction → what happens → why → the technical term → try it → check.

| #   | Chapter                 | The learner does                                                   | Deep dive covers                                             |
| --- | ----------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ |
| 1   | Your first Java program | Reads `Hello.java`, predicts what happens next                     | Source-file launch mode (JEP 330/458) still compiles         |
| 2   | The compiler            | Runs `javac`, opens `Hello.class`, sees magic number and size      | Real `javap -c` listing, class-file version 69               |
| 3   | The JVM                 | Selects each of the five main parts                                | JVMS run-time model; HotSpot is one implementation           |
| 4   | Loading classes         | Steps through find → load → link → initialize                      | JVMS ch. 5: lazy resolution, initialization triggers         |
| 5   | Memory                  | Steps through `new Person("Mia")`, selects frame, variable, object | Real bytecode; references are not addresses; escape analysis |
| 6   | Execution               | Calls a method repeatedly and watches tiers change                 | Tiered compilation thresholds from HotSpot JDK 25            |
| 7   | Garbage collection      | Creates objects and references, removes them, runs a collection    | Reachability vs eligibility vs reclamation                   |
| —   | What you now know       | Recap diagram, teach-back in own words, five-question check        | Next topic and the full map                                  |

Each chapter links to its component on the JVM map (for example Memory → Runtime data areas),
so the lesson and the explorer stay one machine. Interactive state can be paused, stepped backwards and restarted. Animation is never the only
carrier of information; with reduced motion, steps change without movement. Chapter progress is
stored locally. The chapter is reflected in the URL (`/start?chapter=memory`).

## 6. Explorer entry

- **Default view: the six main parts.** The same plate, with each subsystem collapsed into a
  large region labelled in plain words (Class loading, Memory, Execution engine, Garbage
  collection, Native interface, Platform) and a one-line description. Selecting a region expands
  it and opens its explanation; selecting a part inside keeps it expanded.
- **"Show the full JVM map"** reveals all 66 components and their connections. The choice is
  remembered in this browser and reflected in the URL (`view=full`). Deep links such as
  `/anatomy?c=eden` open the region that contains the component.
- **Friendly mode names** (technical names remain in descriptions): Overview (anatomy), Show the
  parts (exploded), Look inside (internal), Watch it run (execution). URL values are unchanged.
  On narrow phones the selected view shows its name and the others show their icons.
- **Default controls:** mode, _Find a component_ (search), _Guided tour_, _Advanced options_.
  Advanced options hold the full component tree, layer visibility (specification vs HotSpot,
  platform, connectors, part numbers), the diagram key, collapse/expand and keyboard help.
  _Center selected part_ sits with the zoom controls.
- **Guided tour:** five short steps on first visit (what the diagram is, the main regions, how to
  select, where explanations appear, how to open technical details). On wide screens it sits in
  the lower-left corner of the map; on phones it sits above the map instead of over it. It can be
  closed at any step, the dismissal is remembered in this browser, and it never appears for a deep
  link.

## 7. Inspector

Default view, top to bottom:

1. **What is this?** One sentence.
2. **Picture it.** An analogy with its mapping and its limits (core concepts).
3. **What actually happens?** The explanation at the chosen level.
4. **See it working.** The matching interactive from the lesson (core concepts), or a link to the
   component's dissection or a walkthrough step where it is active.
5. **Where does it fit?** Its parent and up to three connections in plain sentences.
6. **Check your understanding.** One question with explained answers, or a teach-back prompt.

**Explore the technical details** (open by default at Deep dive) holds the developer
explanation, specification vs HotSpot, internal structure, inputs and outputs, all connections,
the verified example, practical use and errors, misconceptions, the accuracy note and sources.

## 8. Explanation levels

| Level     | For                   | Content                                                         |
| --------- | --------------------- | --------------------------------------------------------------- |
| Simple    | No programming needed | Short sentences, familiar examples, one term at a time          |
| Developer | People who write Java | Real code and APIs, what a developer observes, before and after |
| Deep dive | Engineers             | JVMS/JLS sections, HotSpot structures, bytecode, flags, limits  |

- Content fields are `simple`, `developer` (optional) and `deep`. The core concepts have all three;
  elsewhere the developer level falls back to the deep dive and says so ("not written yet"),
  which is different from a missing explanation.
- Stored preferences migrate in place: `beginner` → `simple`, `technical` → `deep`. Unknown or
  missing fields are repaired one by one; progress, bookmarks and quiz results are never reset.

## 9. Visual direction

A science museum after dark: the reading surface is calm and uncluttered; each visualization is a
lit exhibit case on the dark blueprint canvas, and only moves when the learner acts.

- **Type:** Source Serif 4 for questions and titles; Inter at 17–18 px for reading (≤ 70
  characters per line); JetBrains Mono only for code, bytecode and technical identifiers.
- **Colour:** unchanged semantics (blue control flow, purple runtime components, green success,
  orange warnings, grey inactive), always paired with a second cue.
- **Structure:** numbers only for real sequences (journey steps, chapters, loading phases); no
  decorative eyebrows; few borders; one dominant visual per screen.
- **Motion:** answers the learner's action (a token travelling, a frame appearing, a reference
  breaking). Reduced motion keeps every state, without movement.
