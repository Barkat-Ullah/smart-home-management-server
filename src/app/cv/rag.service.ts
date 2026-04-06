import prisma from '../utils/prisma';
import { createEmbedding } from './embedding.service';

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

export async function findRelevantChunks(
  query: string,
  topK = 5,
): Promise<string[]> {
  const queryEmbedding = await createEmbedding(query);

  const allChunks = await prisma.cvChunk.findMany({
    select: { content: true, embedding: true },
  });

  if (allChunks.length === 0) {
    throw new Error('Cv not uploaded please upload cv');
  }

  const scored = allChunks.map(chunk => ({
    content: chunk.content,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(c => c.score > 0.3)
    .map(c => c.content);
}
