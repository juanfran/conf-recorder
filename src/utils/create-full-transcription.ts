import { Speaker } from '../models/speaker.model.js';
import { TextTime } from '../models/text-time.model.js';
import { Transcription } from '../models/transcription.model.js';

export function createFullTranscription(
  speakerSegments: Speaker[],
  textSegments: TextTime[]
): Transcription[] {
  return textSegments.map((segment) => {
    const textStart = segment.start;
    const textEnd = segment.end;
    let maxOverlap = 0;
    let probableSpeaker = null;

    speakerSegments.forEach((speaker) => {
      const speakerStart = speaker.start;
      const speakerEnd = speaker.end;

      const overlapStart = Math.max(textStart, speakerStart);
      const overlapEnd = Math.min(textEnd, speakerEnd);
      const overlap = Math.max(0, overlapEnd - overlapStart);

      if (overlap > maxOverlap) {
        maxOverlap = overlap;
        probableSpeaker = speaker.name;
      }
    });

    const speaker = probableSpeaker ? probableSpeaker : 'Unknown';

    return {
      speaker,
      text: segment.text,
      start: segment.start,
      end: segment.end,
    };
  });
}
