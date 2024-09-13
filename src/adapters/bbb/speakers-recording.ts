import type { Page } from 'puppeteer-core';
import { Speaker } from '../../models/speaker.model.js';
import { SetOptional } from 'type-fest';

const bbbSelectors = {
  isTalking: '[data-test="isTalking"] span',
};

type RecordingSpeaker = SetOptional<Speaker, 'end'>;

export function recordSpeakers(page: Page, initialDate = Date.now()) {
  const speakers: RecordingSpeaker[] = [];
  const currentTalking: RecordingSpeaker[] = [];

  const interval = setInterval(async () => {
    const talkingNodes = await page.$$(bbbSelectors.isTalking);

    const talking: string[] = await Promise.all(
      talkingNodes.map(async (el) => {
        return await page.evaluate(
          (el) => el.childNodes[0].nodeValue.trim(),
          el
        );
      })
    );

    talking.forEach(async (name) => {
      const speaker = currentTalking.find((s) => s.name === name);

      if (!speaker) {
        currentTalking.push({
          name,
          start: (Date.now() - initialDate) / 1000,
        });
      }
    });

    currentTalking.forEach((s, index) => {
      if (!talking.find((name) => name === s.name)) {
        s.end = (Date.now() - initialDate) / 1000 - 1;
        speakers.push(s);
        currentTalking.splice(index, 1);
      }
    });
  }, 100);

  return function () {
    clearInterval(interval);

    currentTalking.forEach((s) => {
      s.end = (Date.now() - initialDate) / 1000 - 1;
      speakers.push(s);
    });

    return (speakers as Speaker[]).filter((s) => {
      return s.end < s.start;
    });
  };
}
