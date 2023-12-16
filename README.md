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
import { StateManager, useSelector } from 'https://cdn.skypack.dev/immer-state@%5E0.8.0';
```

## Example

```sh
cd example
yarn install
yarn run start
```

Then open [localhost:1234](http://localhost:1234/).

## LICENSE

MIT, https://wes.dev/LICENSE.txt
