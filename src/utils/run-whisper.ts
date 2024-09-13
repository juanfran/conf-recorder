import { execSync } from 'node:child_process';

export function runWhisper(
  filePath: string,
  outputPath: string,
  numSpeakers?: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    // TODO: configurable model & batch size
    const params = [
      '--model',
      'openai/whisper-large',
      '--timestamp',
      'chunk',
      '--file-name',
      filePath,
      '--transcript-path',
      outputPath,
      '--batch-size',
      4,
    ];

    if (process.env.HUGGINGFACE_TOKEN) {
      params.push('--hf-token', process.env.HUGGINGFACE_TOKEN);
      params.push('--num-speakers', String(numSpeakers));
    }

    execSync('insanely-fast-whisper ' + params.join(' '), { stdio: 'inherit' });

    resolve();
  });
}
