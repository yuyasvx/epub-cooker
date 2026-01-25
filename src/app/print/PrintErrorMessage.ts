import chalk from 'chalk';

/**
 * @internal
 */
export function printErrorMessage(text: string) {
  console.log(chalk.hex('#ff0000')(`✖ ${text}`));
}
