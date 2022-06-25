import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { useSelector } from '../src/hooks/useSelector';
import { StateManager } from '../src/StateManager';

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
  jest.useFakeTimers();
});

beforeEach(() => {
  if (testStore) {
    testStore.DEBUG_destroy();
  }
  testStore = new StateManager(initialState);
});

afterAll(() => {
  jest.useRealTimers();
});

describe('useSelector', () => {
  it('should listen to the state changes and update the components', () => {
    const FakeComponentA = () => {
      const hasText = useSelector(testStore, (state) =>
        Boolean(state.prop2.prop2a),
      );
      return (hasText && <div data-testid="fakeA">Hello</div>) || null;
    };
    const FakeComponentB = () => {
      const prop2 = useSelector(testStore, (state) => state.prop2);
      return <div data-testid="fakeB">{prop2.prop2a}</div>;
    };
    const FakeComponentC = () => {
      const [p1, p2] = useSelector(testStore, (state) => [
        state.prop1.prop1a,
        state.prop2.prop2a,
      ]);
      return (
        <>
          <div data-testid="fakeC">
            {p1} - {p2}
          </div>
        </>
      );
    };
    const FakeComponentD = () => {
      const hasText = useSelector(testStore, (state) =>
        Boolean(state.prop2.prop2a),
      );
      return (hasText && <div data-testid="fakeD">Hello</div>) || null;
    };

    const { getByTestId } = render(
      <>
        <FakeComponentA />
        <FakeComponentB />
        <FakeComponentC />
        <FakeComponentD />
      </>,
    );

    act(() => {
      testStore.mutate((state) => {
        state.prop1.prop1a = 'P1a';
        state.prop2.prop2a = 'P2a';
      });
      jest.runAllTimers();
    });

    expect(getByTestId('fakeA')?.innerHTML).toEqual('Hello');
    expect(getByTestId('fakeB')?.innerHTML).toEqual('P2a');
    expect(getByTestId('fakeC')?.innerHTML).toEqual('P1a - P2a');
    expect(getByTestId('fakeD')?.innerHTML).toEqual('Hello');

    act(() => {
      testStore.mutate((state) => {
        state.prop2.prop2a = 'P2b';
      });
      jest.runAllTimers();
    });

    expect(getByTestId('fakeA')?.innerHTML).toEqual('Hello');
    expect(getByTestId('fakeB')?.innerHTML).toEqual('P2b');
    expect(getByTestId('fakeC')?.innerHTML).toEqual('P1a - P2b');
    expect(getByTestId('fakeD')?.innerHTML).toEqual('Hello');
  });
});

describe('StateManager.DEBUG_destroy', () => {
  it('works', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    testStore.subscribe((state) => state, callback1);
    testStore.subscribe((state) => state.prop1, callback2);
    testStore.subscribe((state) => state.prop1.prop1a, callback3);
    testStore.DEBUG_destroy();

    testStore.mutate((state) => {
      state.prop1.prop1a = 'New Value 1a';
    });
    jest.runAllTimers();

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
    expect(callback3).not.toHaveBeenCalled();
  });
});
