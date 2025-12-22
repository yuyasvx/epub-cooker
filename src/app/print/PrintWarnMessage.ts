import chalk from 'chalk';

/**
 * @internal
 */
export function printWarnMessage(text: string) {
  console.log(chalk.hex('#ff8c00')(`⚠ ${text}`));
}
