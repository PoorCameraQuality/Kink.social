import { Client } from 'ssh2';

const password = process.env.SSH_PASSWORD;
const cmd = process.argv.slice(2).join(' ');
if (!password || !cmd) process.exit(1);

const conn = new Client();
conn.on('ready', () => {
  conn.exec(cmd, (err, stream) => {
    if (err) process.exit(1);
    stream.on('close', (c) => { conn.end(); process.exit(c ?? 0); });
    stream.on('data', (d) => process.stdout.write(d));
    stream.stderr.on('data', (d) => process.stderr.write(d));
  });
});
conn.on('error', () => process.exit(1));
conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 20000 });
