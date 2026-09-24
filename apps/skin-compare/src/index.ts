import { getParams, parseAspect } from './params';

const WIDTHS = [360, 640, 1024];
const PANES = [
  { id: 'original', label: 'Media Chrome original' },
  { id: 'html', label: 'Video.js 10 HTML' },
  { id: 'react', label: 'Video.js 10 React' },
];

const params = getParams();
const query = new URLSearchParams(location.search);
const width = WIDTHS.includes(params.width) ? params.width : 640;

document.getElementById('title')!.textContent = params.skin;

const widths = document.getElementById('widths')!;

for (const option of WIDTHS) {
  const button = document.createElement('button');

  button.type = 'button';
  button.textContent = `${option}`;
  button.setAttribute('aria-pressed', String(option === width));
  button.addEventListener('click', () => {
    query.set('w', String(option));
    location.search = query.toString();
  });
  widths.append(button);
}

const accent = document.getElementById('accent') as HTMLInputElement;

accent.checked = query.has('accent');
accent.addEventListener('change', () => {
  if (accent.checked) query.set('accent', 'f5c518');
  else query.delete('accent');
  location.search = query.toString();
});

const panes = document.getElementById('panes')!;

for (const pane of PANES) {
  const section = document.createElement('section');
  const heading = document.createElement('h2');
  const frame = document.createElement('iframe');

  section.className = 'pane';
  heading.textContent = pane.label;
  frame.title = pane.label;
  frame.width = String(width + 32);
  frame.height = String(Math.round(width / (parseAspect(params.aspect) ?? 16 / 9)) + 48);
  // Every stack in its own document: media-chrome and @videojs/html register the same custom element names.
  frame.src = `/${pane.id}.html?${query.toString()}`;
  section.append(heading, frame);
  panes.append(section);
}
