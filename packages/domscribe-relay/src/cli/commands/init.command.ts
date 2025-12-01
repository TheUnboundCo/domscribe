import { Command } from 'commander';

/**
 * Init command options
 */
interface InitCommandOptions {
  force: boolean;
  dryRun: boolean;
}

export const InitCommand = new Command('init')
  .description('Initialize Domscribe and configure your coding agent')
  .option('-f, --force', 'Overwrite existing configuration', false)
  .option('--dry-run', 'Show what would be done without making changes', false)
  .action((options: InitCommandOptions) => {
    init(options);
  });


function init(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options: InitCommandOptions
): void {
  console.error('[domscribe-cli] Not implemented');
}
