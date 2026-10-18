import { spawnSync } from 'node:child_process';

const [command, ...args] = process.argv.slice(2);
const config =
  command === 'dev' ? ['--config', 'src-tauri/tauri.dev.conf.json'] : [];
const separator = args.indexOf('--');
const runnerArgs = separator < 0 ? [] : args.splice(separator);
const result = spawnSync(
  'pnpm',
  [
    'exec',
    'tauri',
    ...(command ? [command] : []),
    ...args,
    ...config,
    ...runnerArgs,
  ],
  { stdio: 'inherit' },
);
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
