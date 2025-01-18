import { pgTable, text, serial, timestamp, boolean, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  role: varchar("role", { length: 50 }).notNull().default("candidate"),
  gdprConsent: boolean("gdpr_consent").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const universities = pgTable("universities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  requirements: jsonb("requirements").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  universityId: serial("university_id").references(() => universities.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  documents: jsonb("documents"),
  interviewDate: timestamp("interview_date"),
  createdAt: timestamp("created_at").defaultNow()
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  content: text("content").notNull(),
  channel: varchar("channel", { length: 50 }).notNull(), // web, whatsapp, voice
  direction: varchar("direction", { length: 50 }).notNull(), // inbound, outbound
  createdAt: timestamp("created_at").defaultNow()
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: serial("application_id").references(() => applications.id),
  recording: text("recording_url"),
  feedback: jsonb("feedback"),
  createdAt: timestamp("created_at").defaultNow()
});

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  university: one(universities, {
    fields: [applications.universityId],
    references: [universities.id],
  }),
}));

export const interviewsRelations = relations(interviews, ({ one }) => ({
  application: one(applications, {
    fields: [interviews.applicationId],
    references: [applications.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type University = typeof universities.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Interview = typeof interviews.$inferSelect;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
