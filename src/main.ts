import { drawMarbles } from './index';
import { TestMessage } from 'rxjs/internal/testing/TestMessage';

const actValues: ReadonlyArray<TestMessage> = [
  { frame: 0, notification: { kind: 'N', value: 'foo' } },
  { frame: 1, notification: { kind: 'N', value: 'foo' } },
  { frame: 2, notification: { kind: 'N', value: 'bar' } },
  { frame: 4, notification: { kind: 'N', value: 'foo' } },
  { frame: 10, notification: { kind: 'N', value: 'cux' } },
  { frame: 11, notification: { kind: 'N', value: 'buz' } },
];

const expValues: ReadonlyArray<TestMessage> = [
  { frame: 0, notification: { kind: 'N', value: 'foo' } },
  { frame: 1, notification: { kind: 'N', value: 'foo' } },
  { frame: 2, notification: { kind: 'N', value: 'foo' } },
  { frame: 5, notification: { kind: 'N', value: 'bar' } },
  { frame: 9, notification: { kind: 'N', value: 'caz' } },
  { frame: 10, notification: { kind: 'N', value: 'cax' } },
  { frame: 11, notification: { kind: 'N', value: 'buz' } },
];

console.log(drawMarbles(actValues, expValues));
