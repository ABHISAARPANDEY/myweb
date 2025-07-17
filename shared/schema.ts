import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  prompt: text("prompt").notNull(),
  workflowJson: jsonb("workflow_json").notNull(),
  nodeCount: integer("node_count").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkflowSchema = createInsertSchema(workflows).pick({
  name: true,
  description: true,
  prompt: true,
  workflowJson: true,
  nodeCount: true,
});

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

// Schema for workflow generation request
export const generateWorkflowSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  includeAuth: z.boolean().default(false),
  includeErrorHandling: z.boolean().default(false),
});

export type GenerateWorkflowRequest = z.infer<typeof generateWorkflowSchema>;

// Schema for generated workflow response
export const workflowResponseSchema = z.object({
  name: z.string(),
  description: z.string(),
  nodeCount: z.number(),
  estimatedSetupTime: z.string(),
  triggerType: z.string(),
  nodes: z.array(z.any()),
  connections: z.record(z.any()),
  setupInstructions: z.array(z.string()),
  workflowJson: z.any(),
});

export type WorkflowResponse = z.infer<typeof workflowResponseSchema>;
