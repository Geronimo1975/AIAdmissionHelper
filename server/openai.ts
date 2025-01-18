import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. 
// do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AIResponse {
  content: string;
  confidence: number;
}

export async function getAIResponse(
  userInput: string,
  context: string = "admission"
): Promise<AIResponse> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a medical university admission counselor. Context: ${context}. 
        Provide helpful and accurate information. Return response in JSON format.`
      },
      { role: "user", content: userInput }
    ],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content);
  return {
    content: result.content,
    confidence: result.confidence || 1.0
  };
}

export async function evaluateInterview(videoTranscript: string): Promise<{
  score: number;
  feedback: string;
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Evaluate this medical school interview transcript. Score from 1-100 and provide feedback."
      },
      { role: "user", content: videoTranscript }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const transcription = await openai.audio.transcriptions.create({
    file: audioBuffer,
    model: "whisper-1",
  });

  return transcription.text;
}
