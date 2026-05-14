import { execSync, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(__dirname, '..', 'server');
const testDbPath = path.join(serverDir, 'e2e_test_dogshelter.db');
const python = process.env.PYTHON || (process.platform === 'win32' ? 'py' : 'python3');

execSync(`${python} utils/seed_test_database.py`, {
  cwd: serverDir,
  stdio: 'inherit',
});

const server = spawn(python, ['app.py'], {
  cwd: serverDir,
  env: { ...process.env, DATABASE_PATH: testDbPath },
  stdio: 'inherit',
});

server.on('close', (code) => process.exit(code ?? 1));