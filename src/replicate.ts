import Replicate from 'replicate';

let replicate: Replicate;

export function getReplicate() {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN is required');
  }

  if (!replicate) {
    replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }

  return replicate;
}
