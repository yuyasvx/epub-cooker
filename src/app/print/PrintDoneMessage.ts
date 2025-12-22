import chalk from 'chalk';

/**
 * @internal
 */
export function printDoneMessage(text: string) {
  console.log(`${chalk.green('●')} ${text}`);
}
