export const isWhisperLocal = (): boolean => {
  const whisper = process.env.WHISPER ?? 'LOCAL';
  return whisper.toUpperCase() === 'LOCAL';
};

export const getLocalWhisperConfig = () => {
  return {
    bachSize: Number(process.env.WHISPER_BATCH_SIZE) || 12,
    model: process.env.WHISPER_MODEL || 'openai/whisper-large-v3',
    hf_token: process.env.HUGGINGFACE_TOKEN,
  };
};

export const compressRecording = () => {
  const compressRecording = process.env?.COMPRESS_RECORDING ?? 'False';

  return compressRecording === 'True';
};
