import prisma from '../utils/prisma';
import { embeddingModel } from './gemini';

export async function createEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

export function chunkText(text: string, chunkSize = 500): string[] {
  const sentences = text
    .split(/[।.!?\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if (current.length + sentence.length > chunkSize && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += ' ' + sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export async function saveChunks(chunks: string[]): Promise<number> {
  await prisma.cvChunk.deleteMany({});
  const chunkData: { content: string; embedding: number[] }[] = [];
  for (const content of chunks) {
    const embedding = await createEmbedding(content);
    chunkData.push({ content, embedding });
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  await prisma.cvChunk.createMany({ data: chunkData });
  return chunkData.length;
}
