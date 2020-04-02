import * as React from 'react';
import 'react-app-polyfill/ie11';
import * as ReactDOM from 'react-dom';

import { useSelector } from '../dist';

import { counterIncrement } from './state/counter.actions';
import { getCounterCurrent } from './state/counter.selectors';
import { counterStore } from './state/counter.store';

function App() {
  const current = useSelector(counterStore, getCounterCurrent);

  return (
    <main>
      <h1>immer-state Example</h1>
      <p>Counter: {current}</p>
      <p>
        <button onClick={counterIncrement}>Increment</button>
      </p>
    </main>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
