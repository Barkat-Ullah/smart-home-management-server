import prisma from '../utils/prisma';
import { chatModel } from './gemini';
import { findRelevantChunks } from './rag.service';

export async function chat(
  sessionId: string,
  userMessage: string,
): Promise<string> {
  // 1. RAG — find relevant CV chunks
  const relevantChunks = await findRelevantChunks(userMessage);
  const context = relevantChunks.join('\n\n---\n\n');

  // 2. Fetch previous conversation history
  const previousMessages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  // 3. Format history for Gemini
  const history = previousMessages.map(m => ({
    role: m.role === 'user' ? 'user' : ('model' as 'user' | 'model'),
    parts: [{ text: m.content }],
  }));

  // 4. Start Gemini chat session
  const geminiChat = chatModel.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
    // Fix: systemInstruction must be an object, not a plain string
    systemInstruction: {
      role: 'user',
      parts: [
        {
          text: `You are a helpful assistant. Answer questions strictly based on the CV information provided below.

Relevant CV context:
${context}

Instructions:
- Only answer based on the CV context provided above
- If the information is not found in the CV, respond with "This information is not available in the CV"
- Keep answers concise and clear
- Reply in the same language the user asks in (English or Bengali)`,
        },
      ],
    },
  });

  // 5. Send message to Gemini
  const result = await geminiChat.sendMessage(userMessage);
  const assistantReply = result.response.text();

  // 6. Save session and messages to MongoDB
  await prisma.chatSession.upsert({
    where: { sessionId },
    update: { updatedAt: new Date() },
    create: { sessionId },
  });

  await prisma.chatMessage.createMany({
    data: [
      { sessionId, role: 'user', content: userMessage },
      { sessionId, role: 'assistant', content: assistantReply },
    ],
  });

  return assistantReply;
}
