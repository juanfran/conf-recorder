export interface WhisperTranscription {
  speakers: {
    speaker: string;
    text: string;
    timestamp: [number, number];
  }[];
  chunks: {
    timestamp: [number, number];
    text: string;
  }[];
}
