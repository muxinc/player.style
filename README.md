# player.style

Video and audio player themes built with [Media Chrome](https://media-chrome.org), for every web player and framework.

Visit [player.style](https://player.style).

# Local Development

This is a monorepo that uses NPM workspaces and Turbo. The root package is
also a published package which currently makes it impossible to have similar
named NPM scripts in the root package and the workspace packages. 

For this reason we use the `turbo` CLI directly in the root directory.

1. Install Turbo globally: `npm install -g turbo`
1. Clone the repository
1. Run `npm install`
1. Run `turbo build`
