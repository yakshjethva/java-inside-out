# Third-party notices

Inside Java's own code and content are released under the [MIT License](LICENSE). The published
site is built from the third-party fonts and runtime packages below (the bundler leaves out code
that is not used). Each package ships its full licence text, which you will find in
`node_modules` after `npm ci`.

## Fonts

All fonts are bundled with the site through Fontsource and served from the same origin; no font
is loaded from another host.

| Font           | Package                               | Licence                                                   | Copyright                          |
| -------------- | ------------------------------------- | --------------------------------------------------------- | ---------------------------------- |
| Inter          | `@fontsource-variable/inter`          | [SIL Open Font License 1.1](https://openfontlicense.org/) | The Inter Project Authors          |
| JetBrains Mono | `@fontsource-variable/jetbrains-mono` | [SIL Open Font License 1.1](https://openfontlicense.org/) | The JetBrains Mono Project Authors |
| Source Serif 4 | `@fontsource-variable/source-serif-4` | [SIL Open Font License 1.1](https://openfontlicense.org/) | Adobe                              |

## Runtime libraries

| Package                                                                                              | Licence | Copyright                           |
| ---------------------------------------------------------------------------------------------------- | ------- | ----------------------------------- |
| `react`, `react-dom`, `scheduler`                                                                    | MIT     | Meta Platforms, Inc. and affiliates |
| `react-router`, `@remix-run/route-pattern`                                                           | MIT     | React Training LLC; Shopify Inc.    |
| `motion`, `motion-dom`, `motion-utils`, `framer-motion`                                              | MIT     | Motion B.V. (formerly Framer B.V.)  |
| `lucide-react`                                                                                       | ISC     | Lucide Icons and Contributors       |
| `shiki`, `@shikijs/*`                                                                                | MIT     | Pine Wu; Anthony Fu                 |
| `@shikijs/vscode-textmate`                                                                           | MIT     | Microsoft Corporation               |
| `oniguruma-to-es`, `oniguruma-parser`, `regex`, `regex-recursion`, `regex-utilities`                 | MIT     | Steven Levithan                     |
| `hast-util-to-html`, `mdast-util-to-hast` and related `unist`, `vfile`, `micromark-util-*` utilities | MIT     | Titus Wormer                        |
| `@ungap/structured-clone`                                                                            | ISC     | Andrea Giammarchi                   |
| `cookie-es`                                                                                          | MIT     | Pooya Parsa                         |
| `dequal`                                                                                             | MIT     | Luke Edwards                        |
| `tslib`                                                                                              | 0BSD    | Microsoft Corporation               |

The Java, shell and C syntax-highlighting grammars come from `@shikijs/langs` (MIT). See that
package for the upstream source of each grammar.

The exact versions are pinned in `package.json` and `package-lock.json`. Development tools
(Vite, TypeScript, ESLint, Prettier, Vitest, Testing Library, Playwright, Tailwind CSS) are used
to build and test the site; Tailwind CSS (MIT, Tailwind Labs, Inc.) generates part of the
published stylesheet.

## Specifications and sources

Inside Java quotes and paraphrases short passages of the Java Language Specification, the Java
Virtual Machine Specification, the Java SE API documentation, JDK Enhancement Proposals and the
OpenJDK source code for the purpose of explanation, always with a link to the source. These
documents remain the property of their owners. Java and OpenJDK are trademarks or registered
trademarks of Oracle and/or its affiliates.
