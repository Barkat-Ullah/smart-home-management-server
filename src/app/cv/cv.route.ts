import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { chat } from './chat.service';
import prisma from '../utils/prisma';
import multer from 'multer';
import { chunkText, saveChunks } from './embedding.service';
// import pdfParse from 'pdf-parse';

// const pdf = pdfParse as unknown as (
//   buffer: Buffer,
// ) => Promise<{ text: string }>;
import pdfParse from '@cedrugs/pdf-parse';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
});

// POST /cv/upload — upload and process PDF
router.post(
  '/upload',
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file || req.file.mimetype !== 'application/pdf') {
        res.status(400).json({ error: 'Please upload a valid PDF file' });
        return;
      }
      const parsed = await pdfParse(req.file.buffer);
      // console.log(parsed)
      const text = parsed.text;

      if (!text.trim()) {
        res.status(400).json({ error: 'No text found in the PDF' });
        return;
      }

      const chunks = chunkText(text);
      const saved = await saveChunks(chunks);

      res.json({
        success: true,
        message: `${saved} chunks saved successfully`,
        chunks: saved,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to process PDF' });
    }
  },
);

// POST /cv/chat — send a message
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    if (!message?.trim()) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const session = sessionId || uuidv4();
    const reply = await chat(session, message);

    res.json({ reply, sessionId: session });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

// GET /cv/history/:sessionId — fetch chat history
router.get('/history/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ sessionId, messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

export const cvRoute = router;
