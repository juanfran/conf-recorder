// Import necessary modules
import { describe, it, expect } from 'vitest';
import { createTranscriptionWithWhisperDiarise } from './create-transcription-with-whisper-diarise.js';
import { WhisperTranscription } from '../models/whisper-transcripton.model.js';
import { Speaker } from '../models/speaker.model.js';
import { Transcription } from '../models/transcription.model.js';

const whisperSpeakers: WhisperTranscription['speakers'] = [
  {
    speaker: 'SPEAKER_1',
    text: 'Hello, how are you?',
    timestamp: [0, 5],
  },
  {
    speaker: 'SPEAKER_2',
    text: 'I am fine, thank you!',
    timestamp: [5, 10],
  },
  {
    speaker: 'SPEAKER_1',
    text: 'Glad to hear that.',
    timestamp: [10, 15],
  },
];

const meetingSpeakers: Speaker[] = [
  {
    name: 'Alice',
    start: 0,
    end: 7,
  },
  {
    name: 'Bob',
    start: 5,
    end: 12,
  },
  {
    name: 'Alice',
    start: 9,
    end: 16,
  },
];

const expectedTranscription: Transcription[] = [
  {
    speaker: 'Alice',
    text: 'Hello, how are you?',
    start: 0,
    end: 5,
  },
  {
    speaker: 'Bob',
    text: 'I am fine, thank you!',
    start: 5,
    end: 10,
  },
  {
    speaker: 'Alice',
    text: 'Glad to hear that.',
    start: 10,
    end: 15,
  },
];

describe('createTranscriptionWithWhisperDiarise', () => {
  it('should correctly map whisper speakers to meeting speakers based on overlap duration', () => {
    const result = createTranscriptionWithWhisperDiarise(
      whisperSpeakers,
      meetingSpeakers
    );

    expect(result).toEqual(expectedTranscription);
  });

  it('should handle cases where there is no overlap', () => {
    const whisperSpeakersNoOverlap: WhisperTranscription['speakers'] = [
      {
        speaker: 'SPEAKER_1',
        text: 'This is a test.',
        timestamp: [20, 25],
      },
    ];

    const meetingSpeakersNoOverlap: Speaker[] = [
      {
        name: 'Charlie',
        start: 0,
        end: 5,
      },
    ];

    const expectedTranscriptionNoOverlap: Transcription[] = [
      {
        speaker: 'SPEAKER_1', // Default to original speaker label
        text: 'This is a test.',
        start: 20,
        end: 25,
      },
    ];

    const result = createTranscriptionWithWhisperDiarise(
      whisperSpeakersNoOverlap,
      meetingSpeakersNoOverlap
    );

    expect(result).toEqual(expectedTranscriptionNoOverlap);
  });

  it.only('should assign remaining speakers even if meeting speakers are already assigned', () => {
    const whisperSpeakersExtra: WhisperTranscription['speakers'] = [
      ...whisperSpeakers,
      {
        speaker: 'SPEAKER_3',
        text: 'Any updates?',
        timestamp: [15, 20],
      },
    ];

    const expectedTranscriptionExtra: Transcription[] = [
      {
        speaker: 'Alice',
        text: 'Hello, how are you?',
        start: 0,
        end: 5,
      },
      {
        speaker: 'Bob',
        text: 'I am fine, thank you!',
        start: 5,
        end: 10,
      },
      {
        speaker: 'Alice',
        text: 'Glad to hear that.',
        start: 10,
        end: 15,
      },
      {
        speaker: 'Alice', // Reassigning since all meeting speakers are already assigned
        text: 'Any updates?',
        start: 15,
        end: 20,
      },
    ];

    const result = createTranscriptionWithWhisperDiarise(
      whisperSpeakersExtra,
      meetingSpeakers
    );

    expect(result).toEqual(expectedTranscriptionExtra);
  });
});
