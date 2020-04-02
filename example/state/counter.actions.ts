import { counterStore } from './counter.store';

export function counterIncrement() {
  counterStore.mutate((state) => {
    state.current += 1;
  });
}
