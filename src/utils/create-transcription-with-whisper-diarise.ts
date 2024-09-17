import { Speaker } from '../models/speaker.model.js';
import { Transcription } from '../models/transcription.model.js';
import { WhisperTranscription } from '../models/whisper-transcripton.model.js';

export function createTranscriptionWithWhisperDiarise(
  whisperSpeakers: WhisperTranscription['speakers'],
  meetingSpeakers: Speaker[]
): Transcription[] {
  // Map to group whisper speakers by their speaker label (e.g., 'SPEAKER_1')
  const speakerMap = new Map<string, { start: number; end: number }[]>();

  whisperSpeakers.forEach((whisperSpeaker) => {
    if (!speakerMap.has(whisperSpeaker.speaker)) {
      speakerMap.set(whisperSpeaker.speaker, []);
    }

    speakerMap.get(whisperSpeaker.speaker)?.push({
      start: whisperSpeaker.timestamp[0],
      end: whisperSpeaker.timestamp[1],
    });
  });

  // Map to store total overlapping durations between whisper speakers and meeting speakers
  const speakerOverlapDurations = new Map<string, Map<string, number>>();

  speakerMap.forEach((whisperIntervals, whisperSpeakerName) => {
    const overlapDurations = new Map<string, number>();

    // Calculate overlaps for each interval of the whisper speaker
    whisperIntervals.forEach((whisperInterval) => {
      const whisperStart = whisperInterval.start;
      const whisperEnd = whisperInterval.end;

      // Compare with each meeting speaker
      meetingSpeakers.forEach((meetingSpeaker) => {
        const meetingStart = meetingSpeaker.start;
        const meetingEnd = meetingSpeaker.end;

        // Calculate overlap duration
        const overlapStart = Math.max(whisperStart, meetingStart);
        const overlapEnd = Math.min(whisperEnd, meetingEnd);
        const overlapDuration = Math.max(0, overlapEnd - overlapStart);

        if (overlapDuration > 0) {
          const existingDuration =
            overlapDurations.get(meetingSpeaker.name) || 0;
          overlapDurations.set(
            meetingSpeaker.name,
            existingDuration + overlapDuration
          );
        }
      });
    });

    speakerOverlapDurations.set(whisperSpeakerName, overlapDurations);
  });

  // Prepare assignments based on total overlapping durations
  const assignments: {
    whisperSpeakerName: string;
    meetingSpeakerName: string;
    totalOverlapDuration: number;
  }[] = [];

  speakerOverlapDurations.forEach((overlapDurations, whisperSpeakerName) => {
    overlapDurations.forEach((totalOverlapDuration, meetingSpeakerName) => {
      assignments.push({
        whisperSpeakerName,
        meetingSpeakerName,
        totalOverlapDuration,
      });
    });
  });

  // Sort assignments in descending order of total overlapping duration
  assignments.sort((a, b) => b.totalOverlapDuration - a.totalOverlapDuration);

  const assignedMeetingSpeakers = new Set<string>();
  const speakerFinalMap = new Map<string, string>();

  // First pass: Assign speakers ensuring each meeting speaker is assigned only once
  assignments.forEach((assignment) => {
    const { whisperSpeakerName, meetingSpeakerName } = assignment;

    if (speakerFinalMap.has(whisperSpeakerName)) {
      return; // Skip if whisper speaker is already assigned
    }

    if (!assignedMeetingSpeakers.has(meetingSpeakerName)) {
      speakerFinalMap.set(whisperSpeakerName, meetingSpeakerName);
      assignedMeetingSpeakers.add(meetingSpeakerName);
    }
  });

  // Second pass: Assign remaining whisper speakers to their best match, even if already assigned
  assignments.forEach((assignment) => {
    const { whisperSpeakerName, meetingSpeakerName } = assignment;

    if (!speakerFinalMap.has(whisperSpeakerName)) {
      speakerFinalMap.set(whisperSpeakerName, meetingSpeakerName);
    }
  });

  // Create the final transcription with assigned speaker names
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
