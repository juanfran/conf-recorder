import { Speaker } from '../models/speaker.model.js';
import { Transcription } from '../models/transcription.model.js';
import { WhisperTranscription } from '../models/whisper-transcripton.model.js';

export function createTranscriptionWithWhisperDiarise(
  whisperSpeakers: WhisperTranscription['speakers'],
  meetingSpeakers: Speaker[]
): Transcription[] {
  const speakerMap = new Map<string, Speaker[]>();

  whisperSpeakers.forEach((whisperSpeaker) => {
    if (!speakerMap.has(whisperSpeaker.speaker)) {
      speakerMap.set(whisperSpeaker.speaker, []);
    }

    speakerMap.get(whisperSpeaker.speaker)?.push({
      name: whisperSpeaker.speaker,
      start: whisperSpeaker.timestamp[0],
      end: whisperSpeaker.timestamp[1],
    });
  });

  const speakersData = [] as {
    speaker: string;
    options: {
      speaker: string;
      count: number;
    }[];
  }[];

  speakerMap.forEach((whisperSpeaker, whisperSpeakerName) => {
    let maxOverlap = 0;
    let probableSpeaker = null;
    const speakerNameGuesses: Record<string, Record<string, number>> = {};

    meetingSpeakers.forEach((meetingSpeaker) => {
      const overlapStart = Math.max(
        meetingSpeaker.start,
        whisperSpeaker[0].start
      );
      const overlapEnd = Math.min(
        meetingSpeaker.end,
        whisperSpeaker[whisperSpeaker.length - 1].end
      );
      const overlap = Math.max(0, overlapEnd - overlapStart);

      if (overlap > maxOverlap) {
        maxOverlap = overlap;
        probableSpeaker = meetingSpeaker.name;

        if (!speakerNameGuesses[whisperSpeakerName]) {
          speakerNameGuesses[whisperSpeakerName] = {};
        }

        if (!speakerNameGuesses[whisperSpeakerName][probableSpeaker]) {
          speakerNameGuesses[whisperSpeakerName][probableSpeaker] = 0;
        }

        speakerNameGuesses[whisperSpeakerName][probableSpeaker]++;
      }
    });

    Object.entries(speakerNameGuesses).forEach(
      ([whisperSpeakerName, guesses]) => {
        const options = Object.entries(guesses).map(([speaker, count]) => {
          return { speaker, count };
        });

        options.sort((a, b) => b.count - a.count);

        speakersData.push({ speaker: whisperSpeakerName, options });
      }
    );
  });

  const speakerFinalMap = new Map<string, string>();

  speakersData.forEach((speakerData) => {
    let name = '';

    const findName = speakerData.options.find((option) => {
      return !Array.from(speakerFinalMap.values()).includes(option.speaker);
    });

    if (findName) {
      name = findName.speaker;
    } else {
      name = speakerData.options[0].speaker;
    }

    speakerFinalMap.set(speakerData.speaker, name);
  });

  return whisperSpeakers.map((whisperSpeaker) => {
    return {
      speaker:
        speakerFinalMap.get(whisperSpeaker.speaker) ?? whisperSpeaker.speaker,
      text: whisperSpeaker.text,
      start: whisperSpeaker.timestamp[0],
      end: whisperSpeaker.timestamp[1],
    };
  });
}
