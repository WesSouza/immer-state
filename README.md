# immer-state

This is a proof of concept of a state manager class that combines
[React Hooks](https://reactjs.org/docs/hooks-reference.html),
[immer](https://github.com/immerjs/immer) and an adapted
[publish-subscribe pattern](https://en.wikipedia.org/wiki/Publish–subscribe_pattern).

See the [example files](./example/) for an idea of how this works.

This is a work in progress.

## Installation

```sh
yarn add immer-state
```

```js
import { StateManager, useSelector } from 'https://cdn.pika.dev/immer-state@^0.3.0';
```

## Example

```sh
cd example
yarn install
yarn run start
```

Then open [localhost:1234](http://localhost:1234/).

## Development

This library uses `wes-cli`, which simplifies configuration setup. Instead of
using `yarn install`, you should use `npx wes-cli install`, which will create
all configuration files and run `yarn install`.

[Read more about `wes-cli`.](https://github.com/WesSouza/wes-cli/#wes-install)

## LICENSE

MIT, https://wes.dev/LICENSE.txt
