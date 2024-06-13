# player.style

A fresh collection of media player themes for every use case!


# Local Development

This is a monorepo that uses NPM workspaces and Turbo. The root package is
also a published package which currently makes it impossible to have similar
named NPM scripts in the root package and the workspace packages. 

For this reason we use the `turbo` CLI directly in the root directory.

1. Install Turbo globally: `npm install -g turbo`
1. Clone the repository
1. Run `npm install`
1. Run `turbo build`
