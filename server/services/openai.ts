import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || "your-api-key-here",
  baseURL: process.env.OPENROUTER_API_KEY ? "https://openrouter.ai/api/v1" : undefined
});

export async function generateWorkflowFromPrompt(
  prompt: string,
  includeAuth: boolean = false,
  includeErrorHandling: boolean = false
): Promise<any> {
  try {
    const systemPrompt = `You are an expert n8n workflow generator. Given a plain English description of an automation need, generate a complete, working n8n workflow JSON.

Your response must be valid JSON with this structure:
{
  "name": "Workflow Name",
  "description": "Clear description of what this workflow does",
  "triggerType": "Type of trigger (e.g., Webhook, Schedule, Manual)",
  "nodeCount": number,
  "estimatedSetupTime": "X minutes",
  "setupInstructions": ["Step 1", "Step 2", "Step 3"],
  "workflowJson": {
    "name": "Workflow Name",
    "nodes": [...],
    "connections": {...},
    "active": true,
    "settings": {...},
    "versionId": "uuid",
    "meta": {...}
  }
}

Important n8n workflow structure rules:
1. Each node must have: parameters, id (uuid), name, type, position [x, y], typeVersion
2. Common node types:
   - n8n-nodes-base.webhook (for webhooks)
   - n8n-nodes-base.httpRequest (for API calls)
   - n8n-nodes-base.emailSend (for sending emails)
   - n8n-nodes-base.set (for data manipulation)
   - n8n-nodes-base.respondToWebhook (for webhook responses)
   - n8n-nodes-base.scheduleTrigger (for time-based triggers)
   - n8n-nodes-base.if (for conditional logic)
   - n8n-nodes-base.switch (for multiple conditions)
3. Connections format: { "NodeName": { "main": [[{ "node": "TargetNode", "type": "main", "index": 0 }]] } }
4. Position nodes logically: start at [240, 300] and move right by ~220px for each node
5. Use realistic parameter values and proper node configurations
6. Include proper UUIDs for ids and versionId
7. Set active: true and include proper settings and meta objects

${includeAuth ? "Include authentication setup where relevant." : ""}
${includeErrorHandling ? "Add error handling nodes and try/catch logic." : ""}

Generate a complete, functional n8n workflow based on the user's description.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_API_KEY ? "openai/gpt-4o" : "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate workflow: " + (error as Error).message);
  }
}
