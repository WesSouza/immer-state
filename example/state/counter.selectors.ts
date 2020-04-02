import { CounterState } from './counter.store';

export function getCounterCurrent(state: CounterState) {
  return state.current;
}
