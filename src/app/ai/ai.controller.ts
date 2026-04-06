import { Request, Response } from 'express';
import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function askGroq(req: Request, res: Response) {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'text field is required',
    });
  }

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: text,
        },
      ],
    });

    const answer = response.choices[0].message.content;
    const models = await groq.models.list();

    return res.status(200).json({
      success: true,
      question: text,
      answer,
      // models,
    });
  } catch (err: any) {
    console.error('Groq error:', err);
    return res.status(500).json({
      success: false,
      message: 'Groq API error',
      detail: err.message,
    });
  }
}
