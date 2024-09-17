import { launch, getStream, wss } from 'puppeteer-stream';
import fs from 'node:fs';
import { prepare, recordSpeakers } from './adapters/bbb/index.js';
import { randomUUID } from 'node:crypto';
import { projectDirname } from './utils/project-dirname.js';
import { processMeeting } from './process-meeting.js';
import { spinnerMessage, stopSpinner } from './spinner.js';
// import { getConfig, isWhisperLocal, compressRecording } from './config.js';

// console.log(compressRecording());
// console.log(isWhisperLocal());
// console.log(getLocalWhisperConfig());
// process.exit(0);

// await processMeeting('test3');
// process.exit(0);

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

  spinnerMessage(`Recording ${url}`);

  fs.mkdirSync(`${projectDirname()}/recordings/${id}`);

  const file = fs.createWriteStream(filePath);

  stream.pipe(file);
  const speakerManager = recordSpeakers(page);

  exitFn = async () => {
    const speakers = speakerManager();

    fs.writeFileSync(
      `${projectDirname()}/recordings/${id}/speakers.json`,
      JSON.stringify(speakers, null, 2)
    );

    await stream.destroy();
    file.close();

    await browser.close();
    (await wss).close();

    const pdfPath = await processMeeting(id);

    stopSpinner();
    console.log('');
    console.log('PDF file created at:', pdfPath);

    process.exit(0);
  };
}

main();
