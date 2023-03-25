import { expect } from 'chai';
import { TestScheduler } from 'rxjs/internal/testing/TestScheduler';
import { drawMarbles, drawValueTable } from '../index';

describe('Drawing Test', () => {
  let scheduler: TestScheduler;
  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual, drawMarbles(actual, expected)).to.deep.equal(expected);
    });
  });

  it('Simple Drawing', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const obs1 = cold('a-b', { a: 10, b: 20 });

      expectObservable(obs1).toBe('a-a-a-a', { a: 10, b: 20 });
    });
  });
});
