import ollama from 'ollama';

export async function summarizeConversation(conversationText: string) {
  const prompt = `Summarize the following conversation in the same language it was written:

${conversationText}

Summary:`;

  const result = await ollama.generate({
    model: 'llama3.1',
    prompt: prompt,
  });

  return result.response;
}
