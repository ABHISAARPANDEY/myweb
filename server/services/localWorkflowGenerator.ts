import { v4 as uuidv4 } from 'uuid';

interface WorkflowTemplate {
  keywords: string[];
  name: string;
  description: string;
  triggerType: string;
  estimatedSetupTime: string;
  nodes: any[];
  connections: any;
  setupInstructions: string[];
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    keywords: ['email', 'contact form', 'form submission', 'notification'],
    name: 'Contact Form Email Notification',
    description: 'Receives form submissions via webhook and sends email notifications',
    triggerType: 'Webhook',
    estimatedSetupTime: '5 minutes',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'contact-form',
          options: {}
        },
        id: uuidv4(),
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        position: [240, 300],
        typeVersion: 1
      },
      {
        parameters: {
          values: {
            string: [
              {
                name: 'name',
                value: '={{$json["name"]}}'
              },
              {
                name: 'email',
                value: '={{$json["email"]}}'
              },
              {
                name: 'message',
                value: '={{$json["message"]}}'
              }
            ]
          },
          options: {}
        },
        id: uuidv4(),
        name: 'Extract Form Data',
        type: 'n8n-nodes-base.set',
        position: [460, 300],
        typeVersion: 1
      },
      {
        parameters: {
          fromEmail: 'noreply@yoursite.com',
          toEmail: 'admin@yoursite.com',
          subject: 'New Contact Form Submission',
          text: 'Name: {{$json["name"]}}\nEmail: {{$json["email"]}}\nMessage: {{$json["message"]}}'
        },
        id: uuidv4(),
        name: 'Send Email',
        type: 'n8n-nodes-base.emailSend',
        position: [680, 300],
        typeVersion: 1
      },
      {
        parameters: {
          respondWith: 'text',
          responseBody: 'Thank you for your message!'
        },
        id: uuidv4(),
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        position: [900, 300],
        typeVersion: 1
      }
    ],
    connections: {},
    setupInstructions: [
      'Copy the webhook URL from the Webhook node',
      'Configure your contact form to POST to this URL',
      'Update email addresses in the Send Email node',
      'Test by submitting your contact form'
    ]
  },
  {
    keywords: ['slack', 'notification', 'alert', 'message'],
    name: 'Slack Notification Workflow',
    description: 'Sends notifications to Slack channel when triggered',
    triggerType: 'Webhook',
    estimatedSetupTime: '3 minutes',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'slack-notify',
          options: {}
        },
        id: uuidv4(),
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        position: [240, 300],
        typeVersion: 1
      },
      {
        parameters: {
          select: 'channel',
          channelId: 'general',
          text: 'New alert: {{$json["message"]}}'
        },
        id: uuidv4(),
        name: 'Slack',
        type: 'n8n-nodes-base.slack',
        position: [460, 300],
        typeVersion: 1
      }
    ],
    connections: {},
    setupInstructions: [
      'Connect your Slack account in the Slack node',
      'Choose the target channel',
      'Copy the webhook URL',
      'Configure your application to send alerts to this URL'
    ]
  },
  {
    keywords: ['schedule', 'daily', 'weekly', 'backup', 'report'],
    name: 'Scheduled Data Backup',
    description: 'Runs daily to backup data to cloud storage',
    triggerType: 'Schedule',
    estimatedSetupTime: '10 minutes',
    nodes: [
      {
        parameters: {
          rule: {
            interval: [
              {
                field: 'cronExpression',
                expression: '0 2 * * *'
              }
            ]
          }
        },
        id: uuidv4(),
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        position: [240, 300],
        typeVersion: 1
      },
      {
        parameters: {
          url: 'https://api.yourapp.com/backup',
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth'
        },
        id: uuidv4(),
        name: 'Fetch Data',
        type: 'n8n-nodes-base.httpRequest',
        position: [460, 300],
        typeVersion: 1
      },
      {
        parameters: {
          bucketName: 'your-backup-bucket',
          fileName: 'backup-{{$now.format("YYYY-MM-DD")}}.json'
        },
        id: uuidv4(),
        name: 'Save to Cloud',
        type: 'n8n-nodes-base.awsS3',
        position: [680, 300],
        typeVersion: 1
      }
    ],
    connections: {},
    setupInstructions: [
      'Set up your API endpoint for data export',
      'Configure cloud storage credentials',
      'Adjust the schedule as needed',
      'Test the backup process manually first'
    ]
  },
  {
    keywords: ['api', 'http', 'integration', 'webhook'],
    name: 'API Integration Workflow',
    description: 'Receives data via webhook and processes it through external APIs',
    triggerType: 'Webhook',
    estimatedSetupTime: '7 minutes',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'api-integration',
          options: {}
        },
        id: uuidv4(),
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        position: [240, 300],
        typeVersion: 1
      },
      {
        parameters: {
          url: 'https://api.external-service.com/process',
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          sendBody: true,
          bodyContentType: 'json'
        },
        id: uuidv4(),
        name: 'Process via API',
        type: 'n8n-nodes-base.httpRequest',
        position: [460, 300],
        typeVersion: 1
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{$json["status"]}}',
                operation: 'equal',
                value2: 'success'
              }
            ]
          }
        },
        id: uuidv4(),
        name: 'Check Success',
        type: 'n8n-nodes-base.if',
        position: [680, 300],
        typeVersion: 1
      }
    ],
    connections: {},
    setupInstructions: [
      'Configure the external API endpoint and authentication',
      'Set up proper error handling',
      'Test with sample data',
      'Monitor for successful processing'
    ]
  }
];

export function generateWorkflowFromPrompt(prompt: string): any {
  const lowerPrompt = prompt.toLowerCase();
  
  // Find the best matching template based on keywords
  let bestMatch: WorkflowTemplate | null = null;
  let maxScore = 0;
  
  for (const template of workflowTemplates) {
    const score = template.keywords.reduce((acc, keyword) => {
      return acc + (lowerPrompt.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = template;
    }
  }
  
  // If no good match, use a generic template
  if (!bestMatch || maxScore === 0) {
    bestMatch = {
      keywords: [],
      name: 'Custom Webhook Workflow',
      description: 'A generic workflow that receives data via webhook and processes it',
      triggerType: 'Webhook',
      estimatedSetupTime: '5 minutes',
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'custom-webhook',
            options: {}
          },
          id: uuidv4(),
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          position: [240, 300],
          typeVersion: 1
        },
        {
          parameters: {
            values: {
              string: [
                {
                  name: 'processed_data',
                  value: '={{JSON.stringify($json)}}'
                }
              ]
            }
          },
          options: {}
        },
        id: uuidv4(),
        name: 'Process Data',
        type: 'n8n-nodes-base.set',
        position: [460, 300],
        typeVersion: 1
      }
    ],
    connections: {},
    setupInstructions: [
      'Copy the webhook URL and configure your source application',
      'Customize the data processing in the Process Data node',
      'Add additional nodes as needed for your specific use case',
      'Test with sample data to ensure proper processing'
    ]
  };
  
  // Generate connections based on nodes
  const connections: any = {};
  for (let i = 0; i < bestMatch.nodes.length - 1; i++) {
    const currentNode = bestMatch.nodes[i];
    const nextNode = bestMatch.nodes[i + 1];
    connections[currentNode.name] = {
      main: [[{
        node: nextNode.name,
        type: 'main',
        index: 0
      }]]
    };
  }
  
  // Create the complete workflow JSON
  const workflowJson = {
    name: bestMatch.name,
    nodes: bestMatch.nodes,
    connections,
    active: true,
    settings: {},
    versionId: uuidv4(),
    meta: {
      templateCredsSetupCompleted: false
    }
  };
  
  return {
    name: bestMatch.name,
    description: bestMatch.description,
    triggerType: bestMatch.triggerType,
    nodeCount: bestMatch.nodes.length,
    estimatedSetupTime: bestMatch.estimatedSetupTime,
    setupInstructions: bestMatch.setupInstructions,
    workflowJson
  };
}