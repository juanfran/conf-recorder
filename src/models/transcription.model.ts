import { TextTime } from './text-time.model.js';

export interface Transcription extends TextTime {
  user: string;
}