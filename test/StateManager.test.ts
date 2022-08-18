import { describe, expect, it, vi } from 'vitest';

import { StateManager } from '../src/StateManager.js';

interface TestState {
  prop1: {
    prop1a: string;
    prop1b: number | null;
  };
  prop2: {
    prop2a: string;
  };
  prop3: string[];
}

const initialState: TestState = {
  prop1: {
    prop1a: 'Value 1a',
    prop1b: null,
  },
  prop2: {
    prop2a: 'Value 2a',
  },
  prop3: [],
};

let testStore = new StateManager(initialState);

beforeAll(() => {
  vi.useFakeTimers();
});

beforeEach(() => {
  if (testStore) {
    testStore.DEBUG_destroy();
  }
  testStore = new StateManager(initialState);
});

afterAll(() => {
  vi.useRealTimers();
});

describe('StateManager.get', () => {
  it('returns the current state', () => {
    expect(testStore.state).toEqual(initialState);
  });

  it('returns the modified state', () => {
    testStore.mutate((state) => {
      state.prop1.prop1a = 'New Value 1a';
    });

    const expectedState = {
      ...initialState,
      prop1: {
        ...initialState.prop1,
        prop1a: 'New Value 1a',
      },
    };

    expect(testStore.state).not.toEqual(initialState);
    expect(testStore.state).toEqual(expectedState);
  });
});

describe('StateManager.mutate', () => {
  it('updates data', () => {
    testStore.mutate((state) => {
      state.prop1.prop1a = 'New Value 1a';
    });

    expect(testStore.state.prop1.prop1a).toEqual('New Value 1a');
  });

  it('keeps unchanged object references', () => {
    const initialState = testStore.state;

    testStore.mutate((state) => {
      state.prop1.prop1a = 'New Value 1a';
    });

    expect(testStore.state).not.toBe(initialState);
    expect(testStore.state.prop1).not.toBe(initialState.prop1);
    expect(testStore.state.prop2).toBe(initialState.prop2);
    expect(testStore.state.prop3).toBe(initialState.prop3);
  });

  it('calls publish, only once', () => {
    vi.spyOn(testStore, 'publish');

    testStore.mutate((state) => {
      state.prop1.prop1a = 'New Value 1a';
    });
    testStore.mutate((state) => {
      state.prop1.prop1a = 'New Value 1a copy';
    });
    testStore.mutate((state) => {
      state.prop1.prop1a = 'New Value 1a copy (2)';
    });
    vi.runAllTimers();

    expect(testStore.publish).toHaveBeenCalledTimes(1);
  });

  it('allows mutations as side effects of subscribes', () => {
    const oldPublish = testStore.publish;
    vi.spyOn(testStore, 'publish').mockImplementation(oldPublish);

    const callback = vi.fn().mockImplementation(() => {
      testStore.mutate((state) => {
        state.prop2.prop2a = 'New Value 2a';
      });
    });
    testStore.subscribe((state) => state.prop1.prop1a, callback);

    testStore.mutate((state) => {
      state.prop1.prop1a = 'New Value 1a';
    });
    vi.runOnlyPendingTimers();

    expect(testStore.publish).toHaveBeenCalledTimes(1);
  });
});

describe('StateManager.publish', () => {
  it('calls subscribers when property changes', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const callback3 = vi.fn();
    testStore.subscribe((state) => state, callback1);
    testStore.subscribe((state) => state.prop1, callback2);
    testStore.subscribe((state) => state.prop1.prop1a, callback3);

    testStore.mutate((state) => {
      state.prop1.prop1a = 'New Value 1a';
    });
    vi.runAllTimers();

    expect(callback1).toHaveBeenCalledWith(testStore.state);
    expect(callback2).toHaveBeenCalledWith(testStore.state.prop1);
    expect(callback3).toHaveBeenCalledWith(testStore.state.prop1.prop1a);
  });

  it("doesn't call subscribers when property doesn't change", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const callback3 = vi.fn();
    testStore.subscribe((state) => state, callback1);
    testStore.subscribe((state) => state.prop1, callback2);
    testStore.subscribe((state) => state.prop1.prop1a, callback3);

    testStore.mutate((state) => {
      state.prop2.prop2a = 'New Value 2a';
    });
    vi.runAllTimers();

    expect(callback1).toHaveBeenCalledWith(testStore.state);
    expect(callback2).not.toHaveBeenCalled();
    expect(callback3).not.toHaveBeenCalled();
  });

  it("doesn't call unsubscribed", () => {
    const callback1 = vi.fn();
    testStore.subscribe((state) => state, callback1);

    const callback2 = vi.fn();
    const unsubscribe2 = testStore.subscribe((state) => state.prop1, callback2);

    const callback3 = vi.fn();
    const unsubscribe3 = testStore.subscribe(
      (state) => state.prop1.prop1a,
      callback3,
    );

    unsubscribe2();
    unsubscribe3();

    testStore.mutate((state) => {
      state.prop1.prop1a = 'New Value 1a';
    });
    vi.runAllTimers();

    expect(callback1).toHaveBeenCalledWith(testStore.state);
    expect(callback2).not.toHaveBeenCalled();
    expect(callback3).not.toHaveBeenCalled();
  });

  it("doesn't call unsubscribed when unsubscribing inside callback", () => {
    const callback1 = vi.fn();
    testStore.subscribe((state) => state, callback1);

    const callback2 = vi.fn().mockImplementation(() => {
      unsubscribe3();
    });
    testStore.subscribe((state) => state.prop1, callback2);

    const callback3 = vi.fn();
    const unsubscribe3 = testStore.subscribe(
      (state) => state.prop1.prop1a,
      callback3,
    );

    testStore.mutate((state) => {
      state.prop1.prop1a = 'New Value 1a';
    });
    vi.runAllTimers();

    testStore.mutate((state) => {
      state.prop1.prop1a = 'New Value 1a copy';
    });
    vi.runAllTimers();

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(0);
  });
});

describe('StateManager.subscribe', () => {
  it('returns unsubscribe function', () => {
    const callback = vi.fn();
    const unsubscribe = testStore.subscribe((state) => state, callback);

    expect(typeof unsubscribe).toEqual('function');
  });

  it('returned unsubscribe function works', () => {
    const callback = vi.fn();
    const unsubscribe = testStore.subscribe((state) => state, callback);
    unsubscribe();

    testStore.mutate((state) => {
      state.prop1.prop1a = 'New Value 1a';
    });
    vi.runAllTimers();

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('StateManager.unsubscribe', () => {
  it('works', () => {
    const callback = vi.fn();
    testStore.subscribe((state) => state, callback);
    testStore.unsubscribe(callback);

    testStore.mutate((state) => {
      state.prop1.prop1a = 'New Value 1a';
    });
    vi.runAllTimers();

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('StateManager.DEBUG_destroy', () => {
  it('works', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const callback3 = vi.fn();
    testStore.subscribe((state) => state, callback1);
    testStore.subscribe((state) => state.prop1, callback2);
    testStore.subscribe((state) => state.prop1.prop1a, callback3);
    testStore.DEBUG_destroy();

    testStore.mutate((state) => {
      state.prop1.prop1a = 'New Value 1a';
    });
    vi.runAllTimers();

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
    expect(callback3).not.toHaveBeenCalled();
  });
});
