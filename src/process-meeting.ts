import fs from 'node:fs';
import { projectDirname } from './utils/project-dirname.js';
import { runPython } from './utils/run-python.js';
import { createFullTranscription } from './utils/create-full-transcription.js';
import { summarizeConversation } from './utils/summarize-conversation.js';
import { createPdf } from './utils/create-pdf.js';
import { compressFile } from './utils/compress-file.js';
import { spinnerMessage } from './spinner.js';
import { runWhisper } from './utils/run-whisper.js';
import { WhisperTranscription } from './models/whisper-transcripton.model.js';
import { Speaker } from './models/speaker.model.js';
import { createTranscriptionWithWhisperDiarise } from './utils/create-transcription-with-whisper-diarise.js';
import { Transcription } from './models/transcription.model.js';
import { flatTranscription } from './utils/flat-transcription.js';

export async function processMeeting(id: string) {
  spinnerMessage('Generating transcription...', 'yellow');

  let speakers = JSON.parse(
    fs.readFileSync(
      `${projectDirname()}/recordings/${id}/speakers.json`,
      'utf8'
    )
  ) as Speaker[];

  // TODO: Optional compression,. env
  spinnerMessage('Compressing file...');

  // await compressFile(
  //   `${projectDirname()}/recordings/${id}/record.webm`,
  //   `${projectDirname()}/recordings/${id}/record-compressed.webm`
  // );

  spinnerMessage('Transcribing...');

  // await runWhisper(
  //   `./recordings/${id}/record-compressed.webm`,
  //   `${projectDirname()}/recordings/${id}/whisper-transcription.json`,
  //   Array.from(new Set(speakers.map((speaker) => speaker.name))).length
  // );

  const resultWhisper = JSON.parse(
    fs.readFileSync(
      `${projectDirname()}/recordings/${id}/whisper-transcription.json`,
      'utf-8'
    )
  ) as WhisperTranscription;

  let transcription: Transcription[] = [];

  if (resultWhisper.speakers.length && false) {
    transcription = createTranscriptionWithWhisperDiarise(
      resultWhisper.speakers,
      speakers
    );
  } else {
    const result = resultWhisper.chunks.map((chunk) => {
      return {
        text: chunk.text,
        start: chunk.timestamp[0],
        end: chunk.timestamp[1],
      };
    });

    transcription = createFullTranscription(speakers, result);
  }

  transcription = flatTranscription(transcription);

  fs.writeFileSync(
    `${projectDirname()}/recordings/${id}/transcription.json`,
    JSON.stringify(transcription, null, 2)
  );

  const textConversation = transcription
    .map((segment) => {
      return `${segment.speaker}: ${segment.text}`;
    })
    .join('\n\n');

  spinnerMessage('Summarizing conversation...');

  const summary = await summarizeConversation(textConversation);
  return await createPdf(id, textConversation, summary);
}