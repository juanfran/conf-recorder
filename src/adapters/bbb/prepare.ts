import type { Page } from 'puppeteer-core';

const bbbSelectors = {
  joinFormName: '#joinFormName',
  consentCheck: '#consentCheck',
  submitButton: 'button[type="submit"]',
  audioButton: '[data-test="listenOnlyBtn"]',
  msgInput: '#message-input',
  submitMsg: '[data-test="sendMessageButton"]',
};

export async function prepare(page: Page, url: string) {
  // login
  await page.goto(url);
  await page.waitForSelector(bbbSelectors.joinFormName);
  await page.type(bbbSelectors.joinFormName, 'Recording bot');
  await page.click(bbbSelectors.consentCheck);
  await page.click(bbbSelectors.submitButton);

  // connect only audio
  await page.waitForSelector(bbbSelectors.audioButton);
  await page.click(bbbSelectors.audioButton);
  await page.waitForSelector(bbbSelectors.audioButton, { hidden: true });

  // send message
  // await page.waitForSelector(bbbSelectors.msgInput);
  // await page.type(bbbSelectors.msgInput, 'Recording started');
  // await page.click(bbbSelectors.submitMsg);
}
