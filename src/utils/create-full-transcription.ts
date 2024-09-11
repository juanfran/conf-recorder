import { Speaker } from '../models/speaker.model.js';
import { TextTime } from '../models/text-time.model.js';
import { Transcription } from '../models/transcription.model.js';

export function createFullTranscription(
  speakers: Speaker[],
  textSegments: TextTime[]
) {
  return textSegments.map((segment) => {
    let closestSpeaker = speakers.reduce((prev, curr) => {
      const prevDiff =
        Math.abs(segment.start - prev.start) + Math.abs(segment.end - prev.end);
      const currDiff =
        Math.abs(segment.start - curr.start) + Math.abs(segment.end - curr.end);
      return currDiff < prevDiff ? curr : prev;
    });

    return {
      speaker: closestSpeaker.name,
      text: segment.text,
      start: segment.start,
      end: segment.end,
    };
  });
}
