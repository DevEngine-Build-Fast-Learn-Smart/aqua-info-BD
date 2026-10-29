import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend =
  process.env.AQUA_BACKEND_PATH ||
  path.resolve(frontend, '../HAMIM WORKSPACE/aqua_info_bd_backned');
const python = path.join(
  backend,
  '.venv',
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python',
);
if (!existsSync(python) || !existsSync(path.join(backend, 'manage.py'))) {
  console.error(
    'Backend environment not found. Follow README.md to set up the backend, or set AQUA_BACKEND_PATH.',
  );
  process.exit(1);
}
const children = [
  spawn(python, ['manage.py', 'runserver', '127.0.0.1:8000', '--noreload'], {
    cwd: backend,
    stdio: 'inherit',
  }),
  spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
    cwd: frontend,
    stdio: 'inherit',
  }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  process.exitCode = code;
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
for (const child of children) {
  child.on('error', (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on('exit', (code) => stop(code || 0));
}
