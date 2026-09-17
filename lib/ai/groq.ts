import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('GROQ_API_KEY environment variable is not configured.');
  }

  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }

  return groqClient;
}

export const GROQ_MODEL = 'openai/gpt-oss-20b';
