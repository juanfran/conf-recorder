import { Transcription } from '../models/transcription.model.js';

export function flatTranscription(trascription: Transcription[]) {
  return trascription.reduce((acc, segment) => {
    const lastSegment = acc.at(-1);

    if (lastSegment && lastSegment.speaker === segment.speaker) {
      lastSegment.text += ' ' + segment.text;
      lastSegment.end = segment.end;

      return acc;
    } else {
      acc.push(segment);
    }

    return acc;
  }, [] as Transcription[]);
}
