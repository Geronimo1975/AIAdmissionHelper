import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { evaluateInterview } from './openai';
import { logInterview } from './salesforce';
import { db } from '@db';
import { interviews } from '@db/schema';

interface VideoSession {
  id: string;
  participants: Set<WebSocket>;
  recording: Buffer[];
}

const sessions = new Map<string, VideoSession>();

export function setupVideoServer(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    let sessionId: string;

    ws.on('message', async (message) => {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'join':
          sessionId = data.sessionId;
          if (!sessions.has(sessionId)) {
            sessions.set(sessionId, {
              id: sessionId,
              participants: new Set(),
              recording: []
            });
          }
          sessions.get(sessionId)!.participants.add(ws);
          break;

        case 'offer':
        case 'answer':
        case 'ice-candidate':
          const session = sessions.get(sessionId);
          if (session) {
            session.participants.forEach((participant) => {
              if (participant !== ws) {
                participant.send(JSON.stringify(data));
              }
            });
          }
          break;

        case 'recording-chunk':
          const recordingSession = sessions.get(sessionId);
          if (recordingSession) {
            recordingSession.recording.push(Buffer.from(data.chunk));
          }
          break;

        case 'end-interview':
          const completedSession = sessions.get(sessionId);
          if (completedSession) {
            const recording = Buffer.concat(completedSession.recording);
            
            // Save recording to cloud storage (implementation omitted)
            const recordingUrl = `https://storage.example.com/${sessionId}.webm`;
            
            // Evaluate interview
            const feedback = await evaluateInterview(data.transcript);
            
            // Save to database
            const [interview] = await db.insert(interviews).values({
              applicationId: data.applicationId,
              recording: recordingUrl,
              feedback
            }).returning();

            // Log to Salesforce
            await logInterview(interview);

            sessions.delete(sessionId);
          }
          break;
      }
    });

    ws.on('close', () => {
      if (sessionId) {
        const session = sessions.get(sessionId);
        if (session) {
          session.participants.delete(ws);
          if (session.participants.size === 0) {
            sessions.delete(sessionId);
          }
        }
      }
    });
  });
}
