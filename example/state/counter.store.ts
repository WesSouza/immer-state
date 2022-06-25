import { StateManager } from '../../lib';

export interface CounterState {
  current: number;
}

export const counterStore = new StateManager({
  current: 0,
} as CounterState);
