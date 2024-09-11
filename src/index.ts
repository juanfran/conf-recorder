import { launch, getStream, wss } from 'puppeteer-stream';
import fs from 'node:fs';
import { prepare, recordSpeakers } from './adapters/bbb/index.js';
import { runPython } from './utils/run-python.js';
import { createFullTranscription } from './utils/create-full-transcription.js';
import { randomUUID } from 'node:crypto';
import ora from 'ora';
import { summarizeConversation } from './utils/summarize-conversation.js';
import { createPdf } from './utils/create-pdf.js';
import { projectDirname } from './utils/project-dirname.js';

const url = process.argv[2];

if (!url) {
  console.error('URL is required');
  process.exit(1);
}

let exitFn: () => void;

process.on('SIGINT', () => {
  if (exitFn) {
    exitFn();
  } else {
    process.exit(0);
  }
});

async function main() {
  const browser = await launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: 'new',
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });

  const page = await browser.newPage();

  await prepare(page, url);

  const stream = await getStream(page, { audio: true, video: false });
  const id = randomUUID();
  const filePath = `${projectDirname()}/recordings/${id}/record.webm`;

  console.log(`File path: ./recordings/${id}/record.webm`);
  console.log('Press Ctrl+C to stop recording');
  console.log('');

  const spinner = ora(`Recording ${url}`).start();

  fs.mkdirSync(`${projectDirname()}/recordings/${id}`);

  const file = fs.createWriteStream(filePath);

  stream.pipe(file);
  const speakerManager = recordSpeakers(page);

  exitFn = async () => {
    spinner.text = 'Generating transcription...';
    spinner.color = 'yellow';

    const speakers = speakerManager();

    fs.writeFileSync(
      `${projectDirname()}/recordings/${id}/speakers.json`,
      JSON.stringify(speakers, null, 2)
    );

    await stream.destroy();
    file.close();

    await browser.close();
    (await wss).close();

    const result = await runPython(`./recordings/${id}/record.webm`);
    const transcription = createFullTranscription(speakers, result);

    fs.writeFileSync(
      `${projectDirname()}/recordings/${id}/transcription.json`,
      JSON.stringify(result, null, 2)
    );

    const textConversation = transcription
      .map((segment) => {
        return `${segment.speaker}: ${segment.text}`;
      })
      .join('\n');

    const summary = await summarizeConversation(textConversation);
    const pdfPath = await createPdf(id, textConversation, summary);

    spinner.stop();
    console.log('');
    console.log(textConversation);
    console.log('');
    console.log(summary);
    console.log('');
    console.log('PDF file created at:', pdfPath);

    process.exit(0);
  };
}

main();
