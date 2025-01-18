import twilio from 'twilio';
import type { Message } from '@db/schema';
import { getAIResponse, transcribeAudio } from './openai';
import { logMessage } from './salesforce';
import { db } from '@db';
import { messages } from '@db/schema';
import { eq } from 'drizzle-orm';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function handleIncomingMessage(
  body: string,
  from: string,
  mediaUrl?: string
): Promise<string> {
  let content = body;

  // Handle voice messages
  if (mediaUrl) {
    const response = await fetch(mediaUrl);
    const audioBuffer = await response.arrayBuffer();
    const transcript = await transcribeAudio(Buffer.from(audioBuffer));
    content = transcript;
  }

  // Get AI response
  const aiResponse = await getAIResponse(content);

  // Log to database
  const [message] = await db.insert(messages).values({
    content,
    channel: 'whatsapp',
    direction: 'inbound'
  }).returning();

  // Log to Salesforce
  await logMessage(message);

  // Send response via WhatsApp
  await client.messages.create({
    body: aiResponse.content,
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: from
  });

  return aiResponse.content;
}

export async function sendWhatsAppMessage(
  to: string,
  content: string
): Promise<void> {
  await client.messages.create({
    body: content,
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: `whatsapp:${to}`
  });

  const [message] = await db.insert(messages).values({
    content,
    channel: 'whatsapp',
    direction: 'outbound'
  }).returning();

  await logMessage(message);
}