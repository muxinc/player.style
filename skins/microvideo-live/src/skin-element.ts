/*
 * The shadow-DOM host of the Microvideo live edition, a copy of `@player.style/microvideo`'s `src/skin-element.ts` so
 * each package stands alone. `<microvideo-live-skin>` subclasses it with its template; the base owns the shadow root,
 * the stylesheet (the on-demand package's, imported from the sibling directory and copied to `dist/skin.css` by the
 * build), and the host variants the Media Chrome theme exposed as attributes.
 */
import styles from '../../microvideo/src/skin.css?inline';

/* The host is a plain box; everything visual lives on `.ps-microvideo` inside. */
const HOST_STYLES = ':host{display:block;width:100%}:host([hidden]){display:none}';

/**
 * The theme's host attributes: `controlbarplace` takes a `place-self` value (`<align> <justify>` with `start`, `center`
 * and `end`, as the original did) or one of the shorthands `top`, `center`, `bottom`; `controlbarvertical` is a boolean.
 * Both are mirrored onto the inner container as `data-controlbar-place` / `data-controlbar-vertical`, which is what
 * the stylesheet keys on, so the open edition can set the data attributes directly.
 */
export const HOST_ATTRIBUTES = ['controlbarplace', 'controlbarvertical'] as const;

const isBrowser = typeof HTMLElement !== 'undefined';

/* Server runtimes import this module for its types and `customElements.define` guard; they never construct it. */
const BaseElement = (isBrowser ? HTMLElement : class {}) as typeof HTMLElement;

const templates = new Map<string, HTMLTemplateElement>();
let sheets: CSSStyleSheet[] | undefined;

function getTemplate(markup: string): HTMLTemplateElement {
  let template = templates.get(markup);

  if (!template) {
    template = document.createElement('template');
    template.innerHTML = markup;
    templates.set(markup, template);
  }

  return template;
}

/** One stylesheet for every instance, parsed once. */
function getSheets(): CSSStyleSheet[] {
  if (!sheets) {
    sheets = [HOST_STYLES, styles].map((text) => {
      const sheet = new CSSStyleSheet();

      sheet.replaceSync(text);
      return sheet;
    });
  }

  return sheets;
}

function supportsAdoptedStyleSheets(): boolean {
  return 'adoptedStyleSheets' in Document.prototype && 'replaceSync' in CSSStyleSheet.prototype;
}

export class MicrovideoSkinBaseElement extends BaseElement {
  /** The shadow-root markup; each edition sets its own template. */
  static markup = '';

  static readonly observedAttributes: readonly string[] = HOST_ATTRIBUTES;

  readonly #container: HTMLElement;
  readonly #volumeSlider: HTMLElement | null;

  constructor() {
    super();

    const root = this.shadowRoot ?? this.#createRoot();
    const container = root.querySelector<HTMLElement>('.ps-microvideo');
    if (!container) throw new Error('Microvideo template has no .ps-microvideo container.');

    this.#container = container;
    this.#volumeSlider = root.querySelector<HTMLElement>('.ps-volume-slider');
  }

  /** Where the control cluster sits: a `place-self` value, or `top` / `center` / `bottom`. Unset means `end center`. */
  get controlBarPlace(): string | null {
    return this.getAttribute('controlbarplace');
  }

  set controlBarPlace(value: string | null) {
    if (value == null) this.removeAttribute('controlbarplace');
    else this.setAttribute('controlbarplace', value);
  }

  /** Stack the controls in a 40px column, with the volume slider opening vertically. */
  get controlBarVertical(): boolean {
    return this.hasAttribute('controlbarvertical');
  }

  set controlBarVertical(value: boolean) {
    this.toggleAttribute('controlbarvertical', value);
  }

  attributeChangedCallback(name: string, _oldValue: string | null, value: string | null): void {
    if (name === 'controlbarplace') {
      if (value == null) this.#container.removeAttribute('data-controlbar-place');
      else this.#container.setAttribute('data-controlbar-place', value);
    }

    if (name === 'controlbarvertical') {
      const vertical = value != null;

      this.#container.toggleAttribute('data-controlbar-vertical', vertical);
      // A CSS-rotated Video.js slider keeps mapping the pointer horizontally, so the slider itself turns vertical.
      this.#volumeSlider?.setAttribute('orientation', vertical ? 'vertical' : 'horizontal');
    }
  }

  #createRoot(): ShadowRoot {
    const root = this.attachShadow({ mode: 'open' });
    const { markup } = this.constructor as typeof MicrovideoSkinBaseElement;

    if (supportsAdoptedStyleSheets()) {
      root.adoptedStyleSheets = getSheets();
    } else {
      const style = document.createElement('style');

      style.textContent = `${HOST_STYLES}\n${styles}`;
      root.append(style);
    }

    root.append(getTemplate(markup).content.cloneNode(true));
    return root;
  }
}
