import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is missing in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chatModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
});

export const embeddingModel = genAI.getGenerativeModel({
  model: 'text-embedding-004',
});
