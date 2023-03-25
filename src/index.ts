import { TestMessage } from 'rxjs/internal/testing/TestMessage';

interface TestMessageBase {
  frame: TestMessage['frame'];
  notification: TestMessage['notification'] | { kind: 'NONE' };
}

type TestMessageExtended = TestMessageBase & {
  resultType: 'actual' | 'expected';
  status: 'success' | 'error' | 'default';
};

export function drawMarbles(
  actual: ReadonlyArray<TestMessage>,
  expected: ReadonlyArray<TestMessage>,
): string {
  const valueTable = drawValueTable(actual, expected);
  return `\n${valueTable}`;
}

function drawValueTable(
  actual: ReadonlyArray<TestMessage>,
  expected: ReadonlyArray<TestMessage>,
): string {
  const maxFrame = Math.max(
    ...actual.map(v => v.frame),
    ...expected.map(v => v.frame),
  );

  const header = colorizeRow(
    `|${createFrameHeader(maxFrame)}| act/exp  | Kind | Value`,
    'default',
  );

  const zippedResults = zipResults(actual, expected);
  const diffedResults = diffResults(zippedResults);

  const rows = diffedResults
    .map(message => {
      const status = message.status;
      const row = [
        '',
        createFrameCol(message, maxFrame),
        createResultTypeCol(message.resultType),
        createKindCol(message.notification),
        serializeValue(message.notification),
      ].join('|');

      return { status, row };
    })
    .map(({ status, row }) => colorizeRow(row, status))
    .join('\n');

  return `${header}\n${rows}`;
}

/**
 * remove rows, where actual equals expected
 * @param results
 */
function diffResults(
  results: ReadonlyArray<TestMessageExtended>,
): ReadonlyArray<TestMessageExtended> {
  const maxFrame = Math.max(...results.map(v => v.frame));
  const diffedResults: Array<TestMessageExtended> = [];

  for (let i = 0; i <= maxFrame; i++) {
    const messages = results.filter(v => v.frame === i);

    // skip, if no values at this frame
    if (messages.length === 0) {
      continue;
    }

    // diffedResults.push({ ...messages[0], status: 'error' });
    // TODO: refactor to tuple, not array
    const exp = messages[0];
    const act = messages[1];

    // TODO: use custom equal func here, if provided
    if (exp.notification.kind !== act.notification.kind) {
      diffedResults.push({ ...exp, status: 'error' });
      diffedResults.push({ ...act, status: 'error' });
    } else if (
      exp.notification.kind === 'N' &&
      act.notification.kind === 'N' &&
      JSON.stringify(exp.notification.value) !==
        JSON.stringify(act.notification.value)
    ) {
      diffedResults.push({ ...exp, status: 'error' });
      diffedResults.push({ ...act, status: 'error' });
    } else if (
      exp.notification.kind === 'E' &&
      act.notification.kind === 'E' &&
      JSON.stringify(exp.notification.error) !==
        JSON.stringify(act.notification.error)
    ) {
      diffedResults.push({ ...exp, status: 'error' });
      diffedResults.push({ ...act, status: 'error' });
    } else {
      diffedResults.push({ ...exp, status: 'success' });
    }
  }

  return diffedResults;
}

function zipResults(
  actual: ReadonlyArray<TestMessage>,
  expected: ReadonlyArray<TestMessage>,
): ReadonlyArray<TestMessageExtended> {
  const maxFrame = Math.max(
    ...actual.map(v => v.frame),
    ...expected.map(v => v.frame),
  );

  const zippedMessages: Array<TestMessageExtended> = [];

  for (let i = 0; i <= maxFrame; i++) {
    const exp = expected.find(v => v.frame === i);
    const act = actual.find(v => v.frame === i);

    if (exp === undefined && act === undefined) {
      continue;
    }

    const emptyFrame: TestMessageBase = {
      notification: { kind: 'NONE' },
      frame: i,
    };

    exp
      ? zippedMessages.push({
          ...exp,
          resultType: 'expected',
          status: 'default',
        })
      : zippedMessages.push({
          ...emptyFrame,
          resultType: 'expected',
          status: 'default',
        });
    act
      ? zippedMessages.push({ ...act, resultType: 'actual', status: 'default' })
      : zippedMessages.push({
          ...emptyFrame,
          resultType: 'actual',
          status: 'default',
        });
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

function createFrameCol(message: TestMessageBase, maxFrames: number): string {
  return `   ${message.frame
    .toString()
    .padStart(maxFrames.toString().length, ' ')}   `;
}

function createKindCol(notification: TestMessageBase['notification']): string {
  return `  ${notification.kind !== 'NONE' ? notification.kind : '-'}   `;
}

function createResultTypeCol(
  resultType: TestMessageExtended['resultType'],
): string {
  return ` ${resultType.padEnd(8, ' ')} `;
}

function serializeValue(notification: TestMessageBase['notification']): string {
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
    case 'NONE':
      serialized = '-';
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
      ansiColor = '\x1b[38;5;231m';
      ansiColorEnd = '\x1b[m';
      break;
  }
  return `${ansiColor}${row}${ansiColorEnd}`;
}
