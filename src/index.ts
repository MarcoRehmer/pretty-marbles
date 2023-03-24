import { TestMessage } from 'rxjs/internal/testing/TestMessage';
import { ObservableNotification } from 'rxjs';

export function drawMarbles(
  actual: ReadonlyArray<TestMessage>,
  expected: ReadonlyArray<TestMessage>,
): string {
  const valueTable = drawValueTable(actual, expected);
  return `${valueTable}`;
}

function drawValueTable(
  actual: ReadonlyArray<TestMessage>,
  expected: ReadonlyArray<TestMessage>,
): string {
  const maxFrame = Math.max(
    ...actual.map(v => v.frame),
    ...expected.map(v => v.frame),
  );

  const header = `|${createFrameHeader(maxFrame)}| Kind | a/e | Value`;

  const rows = zipResults(actual, expected)
    .map(message =>
      [
        '',
        createFrameCol(message, maxFrame),
        createKindCol(message),
        createResultTypeCol(message.resultType),
        serializeValue(message.notification),
      ].join('|'),
    )
    .map(row => colorizeRow(row, 'default'))
    .join('\n');

  return `${header}\n${rows}`;
}

/**
 * remove rows, where actual equals expected
 * @param results
 */
function diffResults(
  results: ReadonlyArray<TestMessage>,
): ReadonlyArray<TestMessage> {
  return results;
}

function zipResults(
  actual: ReadonlyArray<TestMessage>,
  expected: ReadonlyArray<TestMessage>,
): ReadonlyArray<TestMessage & { resultType: 'actual' | 'expected' }> {
  const maxFrame = Math.max(
    ...actual.map(v => v.frame),
    ...expected.map(v => v.frame),
  );

  const zippedMessages: Array<
    TestMessage & { resultType: 'actual' | 'expected' }
  > = [];

  for (let i = 0; i <= maxFrame; i++) {
    const exp = expected.find(v => v.frame === i);
    const act = actual.find(v => v.frame === i);

    if (exp === undefined && act === undefined) {
      continue;
    }

    exp && zippedMessages.push({ ...exp, resultType: 'expected' });
    act && zippedMessages.push({ ...act, resultType: 'actual' });
  }

  return zippedMessages;
}

function createFrameHeader(maxFrames: number): string {
  const maxMargin = 2;
  const margin = Math.ceil(maxMargin / 2);
  return `${''.padStart(Math.max(1, margin), ' ')}Frame ${''.padEnd(
    Math.max(1, margin),
    ' ',
  )}`;
}

function createFrameCol(message: TestMessage, maxFrames: number): string {
  return `   ${message.frame
    .toString()
    .padStart(maxFrames.toString().length, ' ')}   `;
}

function createKindCol(message: TestMessage): string {
  return `  ${message.notification.kind}   `;
}

function createResultTypeCol(resultType: 'actual' | 'expected'): string {
  return ` ${resultType === 'actual' ? 'act' : 'exp'} `;
}

function serializeValue(notification: ObservableNotification<any>): string {
  let serialized = '';
  switch (notification.kind) {
    case 'C':
      serialized = '-';
      break;
    case 'N':
      serialized = JSON.stringify(notification.value);
      break;
    case 'E':
      serialized = JSON.stringify(notification.error);
      break;
  }

  return ` ${serialized}`;
}

function colorizeRow(
  row: string,
  color: 'success' | 'error' | 'default',
): string {
  let ansiColor = '';
  let ansiColorEnd = '';

  switch (color) {
    case 'success':
      ansiColor = '\x1b[38;5;34m';
      ansiColorEnd = '\x1b[m';
      break;
    case 'error':
      ansiColor = '\x1b[38;5;208m';
      ansiColorEnd = '\x1b[m';
      break;
    case 'default':
      ansiColor = '';
      ansiColorEnd = '';
      break;
  }
  return `${ansiColor}${row}${ansiColorEnd}`;
}
