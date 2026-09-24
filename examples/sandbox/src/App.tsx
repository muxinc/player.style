import { type CSSProperties, Suspense, useEffect, useState } from 'react';

import { getMedia, SOURCES, type SourceId } from './media';
import { EDITIONS } from './players';
import { SKINS } from './skins';
import { defaultSource, type Framework, getSkin, readState, type SandboxState, writeState } from './state';

const FRAMEWORKS: { id: Framework; label: string }[] = [
  { id: 'react', label: 'React edition' },
  { id: 'html', label: 'HTML edition' },
];

export function App() {
  const [state, setState] = useState(readState);
  const skin = getSkin(state.skin);
  const media = getMedia(state.source, { audio: skin.preset === 'audio', portrait: skin.portrait });
  const style = state.accent ? ({ '--media-accent-color': `#${state.accent}` } as CSSProperties) : undefined;
  const Edition = EDITIONS[state.framework];
  const update = (patch: Partial<SandboxState>) => setState((current) => ({ ...current, ...patch }));

  useEffect(() => writeState(state), [state]);

  return (
    <>
      <header className="controls">
        <label>
          Skin
          <select
            value={state.skin}
            onChange={(event) => {
              const next = getSkin(event.target.value);
              // Moving between live and on-demand skins moves to that kind's source.
              const source = defaultSource(next) === defaultSource(skin) ? state.source : defaultSource(next);

              update({ skin: next.name, source });
            }}
          >
            {SKINS.map(({ name, title }) => (
              <option key={name} value={name}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Framework
          <select value={state.framework} onChange={(event) => update({ framework: event.target.value as Framework })}>
            {FRAMEWORKS.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Source
          <select value={state.source} onChange={(event) => update({ source: event.target.value as SourceId })}>
            {SOURCES.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Accent
          <input
            type="color"
            value={`#${state.accent || 'ffffff'}`}
            onChange={(event) => update({ accent: event.target.value.slice(1) })}
          />
        </label>
        <button type="button" disabled={!state.accent} onClick={() => update({ accent: '' })}>
          Skin default
        </button>
        <code>
          @player.style/{skin.name}/{state.framework}
        </code>
      </header>

      <main className="stage">
        <Suspense fallback={<p>Loading {skin.title}…</p>}>
          <Edition key={`${skin.name}:${state.framework}:${state.source}`} skin={skin} media={media} style={style} />
        </Suspense>
      </main>
    </>
  );
}
