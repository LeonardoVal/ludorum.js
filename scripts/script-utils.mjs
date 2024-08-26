import { spawn } from 'node:child_process';

export async function exec(cwd, ...cmd) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(cmd[0], cmd.slice(1), {
      cwd,
      stdio: 'inherit',
    });
    childProcess.once('exit', (code, _signal) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(new Error(`Exit with error code: ${code}`));
      };
    });
    childProcess.once('error', (err) => {
      reject(err);
    });
  });
} // function exec
