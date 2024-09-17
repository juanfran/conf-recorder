import { execSync } from 'node:child_process';
import fs from 'node:fs';
import {
  getLocalWhisperConfig,
  getRemoteWhisperConfig,
  isWhisperLocal,
} from '../config.js';
import { getReplicate } from '../replicate.js';

export function runWhisperLocal(
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

    if (localWhisperConfig.hfToken) {
      params.push('--hf-token', localWhisperConfig.hfToken);
      // params.push('--num-speakers', String(numSpeakers));
    }

    execSync('insanely-fast-whisper ' + params.join(' '), { stdio: 'inherit' });

    resolve();
  });
}

export async function runWhisperRemote(
  filePath: string,
  outputPath: string,
  numSpeakers?: number
): Promise<void> {
  const replicate = getReplicate();
  const remoteWhisperConfig = getRemoteWhisperConfig();

  const dataFile = fs.readFileSync(filePath, 'base64');
  const mimeType = 'audio/webm';
  const dataURI = `data:${mimeType};base64,${dataFile}`;

  const output = await replicate.run(remoteWhisperConfig.model, {
    input: {
      task: 'transcribe',
      audio: dataURI,
      language: 'None',
      timestamp: 'chunk',
      batch_size: remoteWhisperConfig.bachSize,
      diarise_audio: !!remoteWhisperConfig.hfToken,
      hf_token: remoteWhisperConfig.hfToken,
    },
  });

  let outputData = output;

  if (Array.isArray(output)) {
    outputData = {
      speakers: output.slice(0, -1),
      chunks: output.at(-1).chunks,
      text: output.at(-1).text,
    };
  }

  await fs.writeFileSync(outputPath, JSON.stringify(outputData));
}

export async function runWhisper(
  filePath: string,
  outputPath: string,
  numSpeakers?: number
): Promise<void> {
  if (isWhisperLocal()) {
    await runWhisperLocal(filePath, outputPath, numSpeakers);
  } else {
    await runWhisperRemote(filePath, outputPath, numSpeakers);
  }
}
