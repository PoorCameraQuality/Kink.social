#!/usr/bin/env node
/**
 * Arm or disarm C2K autonomous loop (.cursor/c2k-loop-active.json).
 * Usage: node .cursor/hooks/c2k-loop-arm.mjs --hours 2
 *        node .cursor/hooks/c2k-loop-arm.mjs --stop
 */
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const marker = join(root, '.cursor', 'c2k-loop-active.json');

const args = process.argv.slice(2);
if (args.includes('--stop')) {
  if (existsSync(marker)) unlinkSync(marker);
  console.log('C2K loop disarmed');
  process.exit(0);
}

const hoursIdx = args.indexOf('--hours');
const hours = hoursIdx >= 0 ? Number(args[hoursIdx + 1]) : 2;
const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

writeFileSync(
  marker,
  JSON.stringify({ armedAt: new Date().toISOString(), until, hours }, null, 2) + '\n',
  'utf8'
);
console.log(`C2K loop armed until ${until}`);
