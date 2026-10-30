# Inside Java - Project Instructions

## Project Mission
Build Inside Java, an open-source interactive educational platform explaining Java, JVM internals, memory management, garbage collection, concurrency and execution.

The goal is to teach absolute beginners through advanced developers using technically accurate explanations, custom diagrams and interactive simulations.

## Technology
- React
- TypeScript
- Vite
- Tailwind CSS
- Custom SVG visualization engine
- Playwright for browser testing
- GitHub Actions and GitHub Pages
- No backend, database, paid APIs or paid hosting.

## Engineering Rules
1. Inspect existing code before modifying it.
2. Follow test-driven development.
3. Use systematic debugging rather than guessing.
4. Verify changes before declaring completion.
5. Keep components modular and maintainable.
6. Follow accessibility and responsive design practices.
7. Avoid unnecessary dependencies.
8. Never introduce paid services or infrastructure.

## Java/JVM Accuracy
1. Distinguish JVM specifications from HotSpot implementation details.
2. Never confuse the logical Method Area with HotSpot Metaspace.
3. Never represent Java references as guaranteed physical memory addresses.
4. Explain class loading, linking and initialization separately.
5. Distinguish unreachable objects from objects actually collected.
6. Clearly label simulations as conceptual models, not real JVM execution.
7. Prefer official OpenJDK, Java Language Specification and JVM Specification references.

## Visualization Standards
- Use custom SVG as the primary visualization renderer.
- Every diagram component must represent a meaningful technical component.
- Every arrow must represent an actual relationship or flow.
- Provide selectable components and contextual explanations.
- Support zoom, pan, reset and layer visibility where appropriate.
- Support anatomy, exploded, internal and execution views when relevant.
- Avoid decorative or technically misleading diagrams.

## Development Workflow
- Work in small, independently verifiable increments.
- Write tests for important behavior.
- Run relevant tests after changes.
- Check responsive behavior and accessibility.
- Never claim a test passed unless it was actually executed.
- Explain architectural trade-offs before making significant changes.

## Deployment
- The repository is the source of truth.
- Use GitHub Actions for deployment.
- Deploy the static website through GitHub Pages.
- Never commit secrets, credentials or browser session data.