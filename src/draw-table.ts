import { TestMessage } from 'rxjs/internal/testing/TestMessage';

const FRAMES_COL_HEADER = 'Frames';
const RESULT_TYPE_COL_HEADER = 'act/exp';
const NOTIFY_KIND_COL_HEADER = 'Kind';
const VALUE_COL_HEADER = 'Value';
const DEFAULT_MARGIN = 1;

interface TestMessageBase {
  frame: TestMessage['frame'];
  notification: TestMessage['notification'] | { kind: 'NONE' };
}

type TestMessageExtended = TestMessageBase & {
  resultType: 'actual' | 'expected';
  status: 'success' | 'error' | 'default';
};

export function drawValueTable(
  actual: ReadonlyArray<TestMessage>,
  expected: ReadonlyArray<TestMessage>,
): string {
  const maxFrame = Math.max(
    ...actual.map(v => v.frame),
    ...expected.map(v => v.frame),
  );

  const header = `|${createFrameHeader(
    FRAMES_COL_HEADER,
    Math.max(maxFrame.toString().length, FRAMES_COL_HEADER.length),
  )}| ${RESULT_TYPE_COL_HEADER}  | ${NOTIFY_KIND_COL_HEADER} | ${VALUE_COL_HEADER}`;

  const zippedResults = zipResults(actual, expected);
  const diffedResults = diffResults(zippedResults);

  const rows = diffedResults
    .map(message => {
      const status = message.status;
      const row = [
        '',
        createFrameCol(
          message.frame,
          Math.max(maxFrame.toString().length, FRAMES_COL_HEADER.length),
        ),
        createResultTypeCol(message.resultType),
        createKindCol(message.notification),
        serializeValue(message.notification),
      ].join('|');

      return { status, row };
    })
    .map(({ status, row }) => colorizeRow(row, status))
    .join('\n');

  return `${colorizeRow(header, 'default')}\n${colorizeRow(
    drawHorizontalBorder(header),
    'default',
  )}\n${rows}\n${colorizeRow(drawHorizontalBorder(header), 'default')}`;
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

  // TODO: fix performance issue, if MANY frames (for example: 200.000.000)
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
      diffedResults.push({ ...exp });
      diffedResults.push({ ...act, status: 'error' });
    } else if (
      exp.notification.kind === 'N' &&
      act.notification.kind === 'N' &&
      JSON.stringify(exp.notification.value) !==
        JSON.stringify(act.notification.value)
    ) {
      diffedResults.push({ ...exp });
      diffedResults.push({ ...act, status: 'error' });
    } else if (
      exp.notification.kind === 'E' &&
      act.notification.kind === 'E' &&
      JSON.stringify(exp.notification.error) !==
        JSON.stringify(act.notification.error)
    ) {
      diffedResults.push({ ...exp });
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

  // TODO: fix performance issue, if MANY frames (for example: 200.000.000)
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

function calcMargin(
  value: string,
  valueWidth: number,
  alignment: 'left' | 'right' | 'center' = 'center',
) {
  let marginLeft = 0;
  let marginRight = 0;

  if (valueWidth > value.length) {
    const extraMargin = valueWidth - value.length;
    const even = extraMargin % 2 === 0;

    switch (alignment) {
      case 'left':
        marginRight = extraMargin;
        break;
      case 'right':
        marginLeft = extraMargin;
        break;
      case 'center':
        if (even) {
          marginLeft = extraMargin / 2;
          marginRight = extraMargin / 2;
        } else {
          marginLeft = Math.floor(extraMargin / 2);
          marginRight = Math.ceil(extraMargin / 2);
        }
        break;
    }
  }

  marginLeft = marginLeft + DEFAULT_MARGIN;
  marginRight = marginRight + DEFAULT_MARGIN;

  return `${drawSpace(marginLeft)}${value}${drawSpace(marginRight)}`;
}

function createFrameHeader(headerText: string, valueWidth: number): string {
  return `${calcMargin(headerText, valueWidth)}`;
}

function createFrameCol(
  frame: TestMessageBase['frame'],
  valueWidth: number,
): string {
  return `${calcMargin(frame.toString(), valueWidth, 'right')}`;
}

function createKindCol(notification: TestMessageBase['notification']): string {
  return `${drawSpace(2)}${
    notification.kind !== 'NONE' ? notification.kind : '-'
  }${drawSpace(3)}`;
}

function createResultTypeCol(
  resultType: TestMessageExtended['resultType'],
): string {
  return `${drawSpace(DEFAULT_MARGIN)}${resultType.padEnd(8, ' ')}${drawSpace(
    DEFAULT_MARGIN,
  )}`;
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
      ansiColor = '\x1b[38;5;9m';
      ansiColorEnd = '\x1b[m';
      break;
    case 'default':
      ansiColor = '\x1b[38;5;231m';
      ansiColorEnd = '\x1b[m';
      break;
  }
  return `${ansiColor}${row}${ansiColorEnd}`;
}

function drawHorizontalBorder(headerRow: string): string {
  const splitHeader = headerRow.split('|');

  return splitHeader
    .map(col => `${''.padEnd(Math.ceil(col.length - DEFAULT_MARGIN * 2), '-')}`)
    .map(v =>
      v !== ''
        ? `${drawSpace(DEFAULT_MARGIN)}${v}${drawSpace(DEFAULT_MARGIN)}`
        : '',
    )
    .join('|');
}

function drawSpace(space: number): string {
  return ''.padEnd(space, ' ');
}
