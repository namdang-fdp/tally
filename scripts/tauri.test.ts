// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('Tauri CLI profile boundary', () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'tally-cli-test-'));
    writeFileSync(
      join(directory, 'pnpm'),
      '#!/usr/bin/env node\nprocess.stdout.write(JSON.stringify(process.argv.slice(2)));\nprocess.exit(Number(process.env.TALLY_TEST_EXIT_CODE ?? 0));\n',
      { mode: 0o755 },
    );
  });

  afterEach(() => rmSync(directory, { recursive: true, force: true }));

  function run(args: string[], exitCode = 0) {
    return spawnSync(
      process.execPath,
      [resolve('scripts/tauri.mjs'), ...args],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: `${directory}${delimiter}${process.env.PATH ?? ''}`,
          TALLY_TEST_EXIT_CODE: String(exitCode),
        },
      },
    );
  }

  it('uses the development identity even for a release-mode dev run', () => {
    const result = run(['dev', '--release']);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual([
      'exec',
      'tauri',
      'dev',
      '--release',
      '--config',
      'src-tauri/tauri.dev.conf.json',
    ]);
  });

  it('keeps profile configuration before the runner argument boundary', () => {
    const result = run(['dev', '--', '--example']);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual([
      'exec',
      'tauri',
      'dev',
      '--config',
      'src-tauri/tauri.dev.conf.json',
      '--',
      '--example',
    ]);
  });

  it('builds with the release identity and preserves locked Cargo arguments', () => {
    const result = run(['build', '--no-bundle', '--', '--locked']);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual([
      'exec',
      'tauri',
      'build',
      '--no-bundle',
      '--',
      '--locked',
    ]);
  });

  it('propagates command failure instead of reporting success', () => {
    expect(run(['build'], 7).status).toBe(7);
  });
});
