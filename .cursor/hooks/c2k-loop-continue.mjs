#!/usr/bin/env node
/**
 * Cursor stop hook: chain C2K feature loop while armed and backlog has pending work.
 * stdin: stop hook JSON (ignored except for future status fields)
 * stdout: { "followup_message": "..." } or {}
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const marker = join(root, '.cursor', 'c2k-loop-active.json');
const queuePath = join(root, 'docs', 'BACKLOG_QUEUE.md');

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolve(data));
  });
}

function loopArmed() {
  if (!existsSync(marker)) return false;
  try {
    const { until } = JSON.parse(readFileSync(marker, 'utf8'));
    if (until && Date.now() > new Date(until).getTime()) return false;
  } catch {
    return false;
  }
  return true;
}

function countPending() {
  if (!existsSync(queuePath)) return 0;
  const text = readFileSync(queuePath, 'utf8');
  const lines = text.split('\n');
  let n = 0;
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    if (line.includes('----')) continue;
    if (/\|\s*pending\s*\|/i.test(line)) n++;
  }
  return n;
}

await readStdin();

if (!loopArmed()) {
  process.stdout.write('{}\n');
  process.exit(0);
}

const pending = countPending();
if (pending === 0) {
  process.stdout.write('{}\n');
  process.exit(0);
}

const msg =
  'Continue the C2K autonomous feature loop. Follow .cursor/skills/c2k-feature-loop/SKILL.md exactly. ' +
  'Do not ask the user questions. Pick the first pending row in docs/BACKLOG_QUEUE.md, set in_progress, ' +
  'run audit → plan → implement → test → UX pass → docs, mark done, then start the next pending item in the same session.';

process.stdout.write(
  JSON.stringify({ followup_message: msg, loop_limit: 40 }) + '\n'
);
