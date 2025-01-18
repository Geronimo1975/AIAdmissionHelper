import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupVideoServer } from "./video";
import { handleIncomingMessage, sendWhatsAppMessage } from "./whatsapp";
import { getAIResponse } from "./openai";
import { db } from "@db";
import { applications, universities, messages } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);
  
  const httpServer = createServer(app);
  setupVideoServer(httpServer);

  // Chat endpoints
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, userId } = req.body;
      const response = await getAIResponse(message);
      
      await db.insert(messages).values({
        userId,
        content: message,
        channel: "web",
        direction: "inbound"
      });

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // University endpoints
  app.get("/api/universities", async (req, res) => {
    try {
      const allUniversities = await db.select().from(universities);
      res.json(allUniversities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Application endpoints
  app.post("/api/applications", async (req, res) => {
    try {
      const { userId, universityId, documents } = req.body;
      const [application] = await db.insert(applications).values({
        userId,
        universityId,
        documents
      }).returning();
      res.json(application);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/applications/:userId", async (req, res) => {
    try {
      const userApplications = await db.select()
        .from(applications)
        .where(eq(applications.userId, parseInt(req.params.userId)));
      res.json(userApplications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // WhatsApp webhook
  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      const { Body, From, MediaUrl0 } = req.body;
      const response = await handleIncomingMessage(Body, From, MediaUrl0);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
