import chalk from 'chalk';
import CliProgress from 'cli-progress';
import type { InputFileDetail } from '../../value/InputFileDetail';

const bar = new CliProgress.SingleBar({
  format: `[${chalk.cyan('{bar}')}] {percentage}% [{value}/{total}] {filePath}`,
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
  clearOnComplete: true,
  barsize: 20,
});

const context = {
  value: 0,
  max: 0,
  filePath: '',
};

/** @internal */
export function reset(totalFiles: unknown[], startValue = 0) {
  context.value = startValue;
  context.max = totalFiles.length;
  const currentValue = context.value < 0 ? 0 : context.value;
  bar.start(context.max, currentValue, {
    filePath: context.filePath,
  });
}

/** @internal */
export function update(delta = 0, nextFile: InputFileDetail) {
  context.value += delta;
  context.filePath = nextFile.filePath;
  const currentValue = context.value < 0 ? 0 : context.value;

  bar.update(currentValue, {
    filePath: chalk.gray(context.filePath),
  });
}

/** @internal */
export function stop() {
  bar.stop();
}

/** @internal */
export function instance() {
  return bar;
}

/** @internal */
export function resume() {
  bar.start(context.max, context.value);
}
