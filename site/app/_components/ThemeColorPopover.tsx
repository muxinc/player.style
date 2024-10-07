'use client';
import * as Popover from '@radix-ui/react-popover';
import LinkWithUnderline from './LinkWithUnderline';

function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" role="img" className="w-0.5 h-0.5">
      <title>Info</title>
      <circle
        cx="8"
        cy="8"
        r="7.5"
        className="stroke-gray group-hover:stroke-current group-focus:stroke-current group-data-[state=open]:stroke-current"
        vectorEffect="non-scaling-stroke"
      />
      <path
        className="fill-gray group-hover:fill-current group-focus:fill-current group-data-[state=open]:fill-current"
        d="M8.5 5V3.5H7V5zm0 1.25v5H10v1H6v-1h1.5v-4h-1v-1z"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function ThemeColorPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button aria-label="Update dimensions" className="group">
          <InfoIcon />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          collisionPadding={7}
          sideOffset={7}
          className="bg-black text-white px-0.5 pb-0.5 pt-1 text-sm max-w-12"
        >
          <p className="mb-0.5">
            You can usually customize a theme with{' '}
            <LinkWithUnderline href="https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties">
              CSS custom properties
            </LinkWithUnderline>
            . Use this panel to configure the following:
          </p>
          <ul className="list-disc ml-1 mb-0.5">
            <li>
              <code className="text-xs font-mono whitespace-nowrap bg-charcoal px-0.25 py-2px">
                --media-primary-color
              </code>
            </li>
            <li>
              <code className="text-xs font-mono whitespace-nowrap bg-charcoal px-0.25 py-2px">
                --media-secondary-color
              </code>
            </li>
            <li>
              <code className="text-xs font-mono whitespace-nowrap bg-charcoal px-0.25 py-2px">
                --media-accent-color
              </code>
            </li>
          </ul>
          <p className="mb-0.5">
            You can read more about customizing themes by visiting the{' '}
            <LinkWithUnderline href="https://www.media-chrome.org/docs/en/reference/styling">
              Media Chrome Styling Reference
            </LinkWithUnderline>
            .
          </p>
          <Popover.Close
            aria-label="Close"
            className="absolute top-0 right-0 flex items-center justify-center w-1 h-1 hover:bg-charcoal focus:bg-charcoal"
          >
            &times;
          </Popover.Close>
          <Popover.Arrow className="fill-black stroke-gray" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
