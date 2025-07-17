import { generateWorkflowFromPrompt } from './openai';
import { storage } from '../storage';
import type { GenerateWorkflowRequest, WorkflowResponse } from '@shared/schema';

export async function generateWorkflow(request: GenerateWorkflowRequest): Promise<WorkflowResponse> {
  try {
    // Generate workflow using OpenAI
    const generatedWorkflow = await generateWorkflowFromPrompt(
      request.prompt,
      request.includeAuth,
      request.includeErrorHandling
    );

    // Store the workflow in our database
    const storedWorkflow = await storage.createWorkflow({
      name: generatedWorkflow.name,
      description: generatedWorkflow.description,
      prompt: request.prompt,
      workflowJson: generatedWorkflow.workflowJson,
      nodeCount: generatedWorkflow.nodeCount,
    });

    // Return the complete workflow response
    return {
      name: generatedWorkflow.name,
      description: generatedWorkflow.description,
      nodeCount: generatedWorkflow.nodeCount,
      estimatedSetupTime: generatedWorkflow.estimatedSetupTime,
      triggerType: generatedWorkflow.triggerType,
      nodes: generatedWorkflow.workflowJson.nodes,
      connections: generatedWorkflow.workflowJson.connections,
      setupInstructions: generatedWorkflow.setupInstructions,
      workflowJson: generatedWorkflow.workflowJson,
    };
  } catch (error) {
    console.error("Workflow generation error:", error);
    throw new Error("Failed to generate workflow: " + (error as Error).message);
  }
}

export function getExamplePrompts(): string[] {
  return [
    "Send me an email when someone fills out my contact form",
    "Post to Slack when a new GitHub issue is created",
    "Save new Airtable records to Google Sheets every hour",
    "Send daily weather reports to my team via email",
    "Create Trello cards from new customer support tickets",
    "Sync new customers from Stripe to my CRM",
    "Monitor website uptime and send alerts when down",
    "Auto-generate invoices from completed projects",
    "Back up database to cloud storage daily",
    "Send welcome emails to new newsletter subscribers"
  ];
}

export function getPopularNodeTypes(): Array<{ name: string; type: string; category: string }> {
  return [
    { name: "Webhook Trigger", type: "n8n-nodes-base.webhook", category: "Trigger" },
    { name: "HTTP Request", type: "n8n-nodes-base.httpRequest", category: "Action" },
    { name: "Email Send", type: "n8n-nodes-base.emailSend", category: "Action" },
    { name: "Schedule Trigger", type: "n8n-nodes-base.scheduleTrigger", category: "Trigger" },
    { name: "Edit Fields", type: "n8n-nodes-base.set", category: "Utility" },
    { name: "If/Switch", type: "n8n-nodes-base.if", category: "Utility" },
    { name: "Code", type: "n8n-nodes-base.code", category: "Utility" },
    { name: "Slack", type: "n8n-nodes-base.slack", category: "Action" },
    { name: "Google Sheets", type: "n8n-nodes-base.googleSheets", category: "Action" },
    { name: "Airtable", type: "n8n-nodes-base.airtable", category: "Action" }
  ];
}
