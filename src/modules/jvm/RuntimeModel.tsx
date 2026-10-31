import { useState } from 'react';

const LAYERS = [
  {
    id: 'loading',
    name: 'Class loading',
    short: '01 · LOAD',
    description: 'Finds class definitions, verifies bytecode, prepares runtime structures and links symbolic references before initialization.',
    detail: 'Follow a class from its binary representation through loading, linking and initialization.',
    input: 'Class files · module path · class path',
    output: 'Runtime class metadata',
    color: '#c5d7cb',
  },
  {
    id: 'memory',
    name: 'Runtime memory',
    short: '02 · STORE',
    description: 'Holds the heap, per-thread stacks, method-area data and the execution state needed while a program runs.',
    detail: 'Separate shared runtime areas from per-thread state, then inspect objects, frames and references.',
    input: 'Objects · frames · class metadata',
    output: 'Runtime data areas',
    color: '#a9c4b6',
  },
  {
    id: 'execution',
    name: 'Execution engine',
    short: '03 · EXECUTE',
    description: 'Interprets bytecode, profiles hot paths and may compile frequently executed code into native machine instructions.',
    detail: 'Trace bytecode through interpretation, profiling, compilation and optimized execution.',
    input: 'Bytecode · runtime profiles',
    output: 'Machine instructions',
    color: '#91b0a1',
  },
  {
    id: 'native',
    name: 'Native interface',
    short: '04 · CONNECT',
    description: 'Provides the JNI boundary through which managed code can interact with native libraries and platform services.',
    detail: 'Inspect the boundary between managed execution and native code, including the costs and constraints.',
    input: 'JNI calls · native libraries',
    output: 'Native calls and results',
    color: '#7e9c8d',
  },
  {
    id: 'platform',
    name: 'Host platform',
    short: '05 · HOST',
    description: 'The operating system, processor, memory and native libraries that host a particular runtime implementation.',
    detail: 'Understand which responsibilities belong to the runtime and which belong to the machine beneath it.',
    input: 'OS · CPU · native libraries',
    output: 'Hardware and OS services',
    color: '#6e897c',
  },
] as const;

type LayerId = (typeof LAYERS)[number]['id'];

export function RuntimeModel() {
  const [selected, setSelected] = useState<LayerId>('memory');
  const [exploded, setExploded] = useState(true);
  const active = LAYERS.find((layer) => layer.id === selected) ?? LAYERS[1];

  return (
    <section aria-labelledby="runtime-model-title" className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
      <div className="relative min-h-[380px] overflow-hidden rounded-[24px] border border-white/10 bg-[#0c1417] p-4 sm:p-7">
        <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 42%, rgba(137,177,157,.13), transparent 58%), linear-gradient(rgba(170,200,185,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(170,200,185,.035) 1px, transparent 1px)', backgroundSize: 'auto, 32px 32px, 32px 32px' }} />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9bb8ad]/70">System model · Interactive</p>
            <h3 id="runtime-model-title" className="mt-1 text-[15px] font-medium text-white">A runtime, in layers</h3>
          </div>
          <button type="button" aria-pressed={exploded} onClick={() => setExploded((value) => !value)}
            className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-[11px] font-medium text-white/75 transition hover:border-[#9bb8ad]/60 hover:text-white">
            {exploded ? 'Reassemble layers' : 'Explode layers'}
          </button>
        </div>

        <div className="relative z-10 mx-auto mt-3 max-w-[720px]">
          <svg viewBox="0 0 680 470" role="img" aria-labelledby="model-svg-title model-svg-desc" className="h-auto w-full overflow-visible">
            <title id="model-svg-title">Exploded conceptual model of a JVM-based runtime</title>
            <desc id="model-svg-desc">Five isometric layers represent class loading, runtime memory, the execution engine, the native interface and the host platform. Select a layer below to inspect its role.</desc>
            <defs>
              <filter id="model-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {LAYERS.map((layer, index) => {
              const y = -8 + index * 68 + (exploded ? index * 13 : 0);
              const isActive = layer.id === selected;
              return (
                <g key={layer.id} transform={`translate(0 ${y})`} opacity={isActive ? 1 : 0.66}
                  style={{ transition: 'transform 520ms cubic-bezier(.2,.8,.2,1), opacity 280ms ease' }}>
                  <polygon points="112,54 330,0 548,54 330,110" fill={layer.color} fillOpacity={isActive ? 0.2 : 0.09}
                    stroke={layer.color} strokeOpacity={isActive ? 1 : 0.5} strokeWidth={isActive ? 2 : 1.2}
                    filter={isActive ? 'url(#model-glow)' : undefined} />
                  <polygon points="112,54 330,110 330,137 112,81" fill="#192521" stroke={layer.color} strokeOpacity={isActive ? 0.72 : 0.22} strokeWidth="1" />
                  <polygon points="330,110 548,54 548,81 330,137" fill="#101b18" stroke={layer.color} strokeOpacity={isActive ? 0.72 : 0.22} strokeWidth="1" />
                  <path d="M146 54 L330 101 L514 54" fill="none" stroke={layer.color} strokeOpacity={isActive ? 0.38 : 0.16} strokeWidth="1" />
                  <circle cx="330" cy="53" r={isActive ? 5 : 3} fill={layer.color} fillOpacity={isActive ? 1 : 0.62} />
                  <text x="330" y="61" textAnchor="middle" fill="#f0f4ef" fontSize="14" fontWeight="600" letterSpacing="1.4">{layer.name.toUpperCase()}</text>
                  <text x="330" y="83" textAnchor="middle" fill="#d1ddd6" fillOpacity="0.72" fontSize="9" letterSpacing="2">{layer.short}</text>
                  {isActive && <path d="M548 54 H590" fill="none" stroke={layer.color} strokeWidth="1.5" strokeDasharray="3 5" />}
                  {isActive && <circle cx="594" cy="54" r="4" fill={layer.color} />}
                </g>
              );
            })}
            <path d="M80 44 V432 M74 44 H86 M74 432 H86" stroke="#91a79b" strokeOpacity=".22" strokeDasharray="2 6" fill="none" />
            <text x="58" y="241" fill="#9bb8ad" fillOpacity=".55" fontSize="9" letterSpacing="2" transform="rotate(-90 58 241)" textAnchor="middle">CONCEPTUAL STACK</text>
          </svg>
        </div>
        <div className="relative z-10 mt-1 flex items-center justify-between gap-4 text-[10px] text-white/35">
          <span>Conceptual view · not to scale</span>
          <span>Specification concepts + implementation detail</span>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex flex-wrap gap-2" aria-label="Choose a runtime layer">
          {LAYERS.map((layer, index) => (
            <button key={layer.id} type="button" aria-pressed={selected === layer.id} onClick={() => setSelected(layer.id)}
              className={`rounded-full border px-3 py-2 text-[11px] transition ${selected === layer.id ? 'border-[#9bb8ad]/65 bg-[#9bb8ad]/10 text-[#dcebe3]' : 'border-white/10 bg-white/[0.025] text-white/55 hover:border-white/25 hover:text-white'}`}>
              <span className="mr-1.5 text-white/35">{String(index + 1).padStart(2, '0')}</span>{layer.name}
            </button>
          ))}
        </div>
        <div className="mt-5 flex-1 rounded-[20px] border border-white/10 bg-white/[0.025] p-5 sm:p-6" aria-live="polite">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9bb8ad]">Selected layer</p>
          <h4 className="mt-3 font-serif text-[27px] leading-tight text-white">{active.name}</h4>
          <p className="mt-3 text-[13px] leading-relaxed text-white/60">{active.description}</p>
          <p className="mt-4 text-[12px] leading-relaxed text-white/75">{active.detail}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
            <div><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">Receives</p><p className="mt-1 text-[11px] leading-relaxed text-white/65">{active.input}</p></div>
            <div><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">Produces</p><p className="mt-1 text-[11px] leading-relaxed text-white/65">{active.output}</p></div>
          </div>
          <a href="/anatomy" className="mt-6 inline-flex items-center gap-2 text-[12px] font-medium text-[#bdd4c9] transition hover:text-white">
            Open the full interactive atlas <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
