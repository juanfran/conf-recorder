import { spawn } from 'node:child_process';
import { TextTime } from '../models/text-time.model.js';

export function runPython(filePath: string): Promise<TextTime[]> {
  return new Promise((resolve, reject) => {
    const pyProg = spawn('python', ['src/whisper.py', filePath]);
    const response: string[] = [];

    pyProg.stderr.on('data', (data) => {
      reject(data.toString());
    });

    pyProg.stdout.on('data', (data) => {
      response.push(data.toString());
    });

    pyProg.on('exit', () => {
      resolve(JSON.parse(response.join('')));
    });
  });
}
