import { Client } from 'ssh2';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const password = process.env.SSH_PASSWORD;
const local = process.argv[2];
const remoteCmd = process.argv[3] ?? 'bash';
if (!password || !local) process.exit(1);

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const remote = `/tmp/${local.split(/[/\\]/).pop()}`;
    const ws = sftp.createWriteStream(remote);
    ws.on('close', () => {
      conn.exec(`chmod +x ${remote} 2>/dev/null; ${remoteCmd} ${remote}`, (e, stream) => {
        stream.on('close', (code) => { conn.end(); process.exit(code ?? 0); });
        stream.on('data', (d) => process.stdout.write(d));
        stream.stderr.on('data', (d) => process.stderr.write(d));
      });
    });
    ws.write(readFileSync(join(process.cwd(), local)));
    ws.end();
  });
});
conn.connect({ host: '2.25.196.84', username: 'root', password, readyTimeout: 30000 });
