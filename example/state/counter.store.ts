import { StateManager } from '../../dist';

export interface CounterState {
  current: number;
}

export const counterStore = new StateManager({
  current: 0,
} as CounterState);
