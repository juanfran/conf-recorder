import ollama from 'ollama';
import {
  getLocalSummarizeConfig,
  getRemoteSummarizeConfig,
  isSummarizeLocal,
} from '../config.js';
import { getReplicate } from '../replicate.js';

export async function summarizeConversationLocal(prompt: string) {
  const config = getLocalSummarizeConfig();

  const result = await ollama.generate({
    model: config.model,
    prompt,
  });

  return result.response;
}

export async function summarizeConversationRemote(prompt: string) {
  const config = getRemoteSummarizeConfig();
  const replicate = getReplicate();

  const input = {
    top_k: 0,
    top_p: 0.9,
    prompt,
    max_tokens: 512,
    min_tokens: 0,
    temperature: 0.6,
    system_prompt: 'You are a helpful assistant',
    length_penalty: 1,
    stop_sequences: '<|end_of_text|>,<|eot_id|>',
    prompt_template:
      '<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nYou are a helpful assistant<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n',
    presence_penalty: 1.15,
    log_performance_metrics: false,
  };

  const result: string[] = [];

  for await (const event of replicate.stream(config.model, {
    input,
  })) {
    result.push(event.toString());
  }

  return result.join('');
}

export async function summarizeConversation(conversationText: string) {
  const prompt = `Summarize the following conversation in the same language it was written:
${conversationText}
`;

  if (isSummarizeLocal()) {
    return summarizeConversationLocal(prompt);
  } else {
    const result = await summarizeConversationRemote(prompt);

    return result;
  }

  return '';
}
