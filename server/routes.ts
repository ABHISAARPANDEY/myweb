import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateWorkflow, getExamplePrompts, getPopularNodeTypes } from "./services/workflowGenerator";
import { generateWorkflowSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate workflow endpoint
  app.post("/api/workflows/generate", async (req, res) => {
    try {
      const validatedData = generateWorkflowSchema.parse(req.body);
      const workflow = await generateWorkflow(validatedData);
      res.json(workflow);
    } catch (error: any) {
      console.error("Generate workflow error:", error);
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: error.message || "Failed to generate workflow" });
      }
    }
  });

  // Get example prompts
  app.get("/api/examples", async (req, res) => {
    try {
      const examples = getExamplePrompts();
      res.json(examples);
    } catch (error: any) {
      console.error("Get examples error:", error);
      res.status(500).json({ message: error.message || "Failed to get examples" });
    }
  });

  // Get popular node types
  app.get("/api/node-types", async (req, res) => {
    try {
      const nodeTypes = getPopularNodeTypes();
      res.json(nodeTypes);
    } catch (error: any) {
      console.error("Get node types error:", error);
      res.status(500).json({ message: error.message || "Failed to get node types" });
    }
  });

  // Get all workflows
  app.get("/api/workflows", async (req, res) => {
    try {
      const workflows = await storage.getAllWorkflows();
      res.json(workflows);
    } catch (error: any) {
      console.error("Get workflows error:", error);
      res.status(500).json({ message: error.message || "Failed to get workflows" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
