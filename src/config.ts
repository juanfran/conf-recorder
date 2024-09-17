import { b } from 'vitest/dist/chunks/suite.CcK46U-P.js';

export const compressRecording = () => {
  const compressRecording = process.env?.COMPRESS_RECORDING ?? 'False';

  return compressRecording === 'True';
};

export const isWhisperLocal = (): boolean => {
  const whisper = process.env.WHISPER ?? 'LOCAL';
  return whisper.toUpperCase() === 'LOCAL';
};

export const getLocalWhisperConfig = () => {
  return {
    bachSize: Number(process.env.LOCAL_WHISPER_BATCH_SIZE) || 12,
    model: process.env.LOCAL_WHISPER_MODEL || 'openai/whisper-large-v3',
    hfToken: process.env.HUGGINGFACE_TOKEN,
  };
};

export const getRemoteWhisperConfig = () => {
  const model =
    process.env.REMOTE_WHISPER_MODEL ||
    'vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c';

  return {
    model: model as `${string}/${string}` | `${string}/${string}:${string}`,
    bachSize: Number(process.env.REMOTE_WHISPER_BATCH_SIZE) || 64,
    hfToken: process.env.HUGGINGFACE_TOKEN,
  };
};
