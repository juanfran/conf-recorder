import puppeteer from 'puppeteer';
import { launch, getStream, wss } from 'puppeteer-stream';
import fs from 'node:fs';

const bbbSelectors = {
  joinFormName: '#joinFormName',
  consentCheck: '#consentCheck',
  submitButton: 'button[type="submit"]',
  audioButton: '[data-test="listenOnlyBtn"]',
};

async function main() {
  const browserPath = await puppeteer.executablePath();

  const browser = await launch({
    executablePath: browserPath,
    headless: 'new',
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });
  const page = await browser.newPage();

  // login
  await page.goto('https://video.kaleidos.net/rooms/jua-jws-pok-cye/join');
  await page.waitForSelector(bbbSelectors.joinFormName);
  await page.type(bbbSelectors.joinFormName, 'Recording bot');
  await page.click(bbbSelectors.consentCheck);
  await page.click(bbbSelectors.submitButton);

  // connect only audio
  await page.waitForSelector(bbbSelectors.audioButton);
  await page.click(bbbSelectors.audioButton);
  await page.waitForSelector(bbbSelectors.audioButton, { hidden: true });

  const stream = await getStream(page, { audio: true, video: false });

  const file = fs.createWriteStream(
    import.meta.dirname + '../recordings/test.webm'
  );

  stream.pipe(file);

  setTimeout(async () => {
    await stream.destroy();
    file.close();
    console.log('finished');

    await browser.close();
    (await wss).close();
  }, 1000 * 10);
}

main();
