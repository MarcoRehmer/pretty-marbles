import { TestMessage } from 'rxjs/internal/testing/TestMessage';
import { drawValueTable } from './draw-table';

export function draw(
  actual: ReadonlyArray<TestMessage>,
  expected: ReadonlyArray<TestMessage>,
): string {
  const valueTable = drawValueTable(actual, expected);
  return `\n${valueTable}`;
}

