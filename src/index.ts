import chalk from 'chalk';
import { cli, type CliOptions, type Command } from 'gunshi';
import mitt from 'mitt';
import packageJson from '../package.json';
import { cookCommandConfig } from './command/cook';
import type { EpubCookerEventPayload } from './feature/event-emitter/EpubCookerEventPayload';
import { _initEventEmitter } from './feature/event-emitter/InitEvent';

// Define the main command
const mainCommand: Command = {
  name: 'main',
  run: () => {
    console.log(`Usage:
  epub-cooker <command> [options]

Commands:
  cook 本の作成

Options:
  -d, --dir: 指定したディレクトリに対してEPUB作成を実行
  -o --output: EPUB出力先を指定`);
  },
};

const subCommands = new Map<string, Command>();
subCommands.set(cookCommandConfig.commandName!, cookCommandConfig);

async function main() {
  await cli(process.argv.slice(2), mainCommand, {
    // name: 'epub-cooker',
    version: packageJson.version,
    subCommands,
  } satisfies CliOptions);
}

_initEventEmitter(mitt<EpubCookerEventPayload>());
main();

console.log(chalk.hex('#FFB200')(`📙 epub cooker v${packageJson.version}`));
console.log(chalk.hex('#505050')('─'.repeat(process.stdout.columns || 80)));
