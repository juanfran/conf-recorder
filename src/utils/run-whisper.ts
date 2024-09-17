import { execSync } from 'node:child_process';
import { getLocalWhisperConfig } from '../config.js';

export function runWhisper(
  filePath: string,
  outputPath: string,
  numSpeakers?: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const localWhisperConfig = getLocalWhisperConfig();
    const params = [
      '--model',
      localWhisperConfig.model,
      '--timestamp',
      'chunk',
      '--file-name',
      filePath,
      '--transcript-path',
      outputPath,
      '--batch-size',
      localWhisperConfig.bachSize,
    ];

    if (localWhisperConfig.hf_token) {
      params.push('--hf-token', localWhisperConfig.hf_token);
      // params.push('--num-speakers', String(numSpeakers));
    }

    execSync('insanely-fast-whisper ' + params.join(' '), { stdio: 'inherit' });

    resolve();
  });
}
