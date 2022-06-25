import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

import { useSelector } from '../lib';
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

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
