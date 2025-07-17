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
    keywords: ['crm', 'customer', 'signup', 'registration', 'lead', 'google sheets', 'airtable'],
    name: 'Customer Registration Workflow',
    description: 'Captures new customer signups and adds them to CRM, Google Sheets, and sends welcome email',
    triggerType: 'Webhook',
    estimatedSetupTime: '8 minutes',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'customer-signup',
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
              { name: 'name', value: '={{$json["name"]}}' },
              { name: 'email', value: '={{$json["email"]}}' },
              { name: 'company', value: '={{$json["company"]}}' },
              { name: 'phone', value: '={{$json["phone"]}}' },
              { name: 'source', value: '={{$json["source"] || "Website"}}' }
            ]
          },
          options: {}
        },
        id: uuidv4(),
        name: 'Extract Customer Data',
        type: 'n8n-nodes-base.set',
        position: [460, 300],
        typeVersion: 1
      },
      {
        parameters: {
          spreadsheetId: 'your-google-sheet-id',
          range: 'A:E',
          values: [
            ['={{$json["name"]}}', '={{$json["email"]}}', '={{$json["company"]}}', '={{$json["phone"]}}', '={{$json["source"]}}']
          ]
        },
        id: uuidv4(),
        name: 'Add to Google Sheets',
        type: 'n8n-nodes-base.googleSheets',
        position: [680, 200],
        typeVersion: 1
      },
      {
        parameters: {
          fromEmail: 'welcome@yourcompany.com',
          toEmail: '={{$json["email"]}}',
          subject: 'Welcome to Our Platform!',
          text: 'Hi {{$json["name"]}},\n\nWelcome to our platform! We\'re excited to have you on board.\n\nBest regards,\nThe Team'
        },
        id: uuidv4(),
        name: 'Send Welcome Email',
        type: 'n8n-nodes-base.emailSend',
        position: [680, 400],
        typeVersion: 1
      },
      {
        parameters: {
          select: 'channel',
          channelId: 'general',
          text: '🎉 New customer signup: {{$json["name"]}} ({{$json["email"]}}) from {{$json["company"]}}'
        },
        id: uuidv4(),
        name: 'Notify Team',
        type: 'n8n-nodes-base.slack',
        position: [900, 300],
        typeVersion: 1
      }
    ],
    connections: {},
    setupInstructions: [
      'Set up Google Sheets integration with proper permissions',
      'Configure email service credentials',
      'Connect Slack workspace and choose notification channel',
      'Test with sample customer data',
      'Update email templates and sheet structure as needed'
    ]
  },
  {
    keywords: ['ecommerce', 'order', 'purchase', 'payment', 'stripe', 'shopify', 'woocommerce'],
    name: 'E-commerce Order Processing',
    description: 'Processes new orders, updates inventory, sends confirmation emails, and notifies fulfillment team',
    triggerType: 'Webhook',
    estimatedSetupTime: '12 minutes',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'new-order',
          options: {}
        },
        id: uuidv4(),
        name: 'Order Webhook',
        type: 'n8n-nodes-base.webhook',
        position: [240, 300],
        typeVersion: 1
      },
      {
        parameters: {
          values: {
            string: [
              { name: 'order_id', value: '={{$json["order_id"]}}' },
              { name: 'customer_email', value: '={{$json["customer"]["email"]}}' },
              { name: 'customer_name', value: '={{$json["customer"]["name"]}}' },
              { name: 'total_amount', value: '={{$json["total"]}}' },
              { name: 'items', value: '={{JSON.stringify($json["items"])}}' }
            ]
          },
          options: {}
        },
        id: uuidv4(),
        name: 'Process Order Data',
        type: 'n8n-nodes-base.set',
        position: [460, 300],
        typeVersion: 1
      },
      {
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{$json["total_amount"]}}',
                operation: 'larger',
                value2: 100
              }
            ]
          }
        },
        id: uuidv4(),
        name: 'Check Order Value',
        type: 'n8n-nodes-base.if',
        position: [680, 300],
        typeVersion: 1
      },
      {
        parameters: {
          fromEmail: 'orders@yourstore.com',
          toEmail: '={{$json["customer_email"]}}',
          subject: 'Order Confirmation #{{$json["order_id"]}}',
          text: 'Hi {{$json["customer_name"]}},\n\nThank you for your order! Your order #{{$json["order_id"]}} for ${{$json["total_amount"]}} has been confirmed.\n\nWe\'ll send you tracking information once your order ships.\n\nThanks for shopping with us!'
        },
        id: uuidv4(),
        name: 'Send Confirmation',
        type: 'n8n-nodes-base.emailSend',
        position: [900, 200],
        typeVersion: 1
      },
      {
        parameters: {
          select: 'channel',
          channelId: 'fulfillment',
          text: '📦 High-value order received: ${{$json["total_amount"]}} - Order #{{$json["order_id"]}} for {{$json["customer_name"]}}'
        },
        id: uuidv4(),
        name: 'Alert Fulfillment',
        type: 'n8n-nodes-base.slack',
        position: [900, 400],
        typeVersion: 1
      }
    ],
    connections: {},
    setupInstructions: [
      'Configure webhook URL in your e-commerce platform',
      'Set up email service for order confirmations',
      'Connect Slack for fulfillment notifications',
      'Adjust order value threshold as needed',
      'Test with sample orders to verify flow'
    ]
  },
  {
    keywords: ['github', 'deployment', 'ci/cd', 'release', 'build', 'testing'],
    name: 'CI/CD Pipeline Notification',
    description: 'Monitors GitHub releases and deployment status, sends notifications to team',
    triggerType: 'Webhook',
    estimatedSetupTime: '6 minutes',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'github-webhook',
          options: {}
        },
        id: uuidv4(),
        name: 'GitHub Webhook',
        type: 'n8n-nodes-base.webhook',
        position: [240, 300],
        typeVersion: 1
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{$json["action"]}}',
                operation: 'equal',
                value2: 'published'
              }
            ]
          }
        },
        id: uuidv4(),
        name: 'Check Release',
        type: 'n8n-nodes-base.if',
        position: [460, 300],
        typeVersion: 1
      },
      {
        parameters: {
          select: 'channel',
          channelId: 'deployments',
          text: '🚀 New release published: {{$json["release"]["name"]}} - {{$json["release"]["html_url"]}}\n\nChanges:\n{{$json["release"]["body"]}}'
        },
        id: uuidv4(),
        name: 'Notify Team',
        type: 'n8n-nodes-base.slack',
        position: [680, 300],
        typeVersion: 1
      },
      {
        parameters: {
          url: 'https://api.deployment-service.com/deploy',
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          sendBody: true,
          bodyContentType: 'json',
          jsonParameters: true,
          parametersJson: {
            'version': '={{$json["release"]["tag_name"]}}',
            'repository': '={{$json["repository"]["full_name"]}}'
          }
        },
        id: uuidv4(),
        name: 'Trigger Deployment',
        type: 'n8n-nodes-base.httpRequest',
        position: [680, 500],
        typeVersion: 1
      }
    ],
    connections: {},
    setupInstructions: [
      'Add webhook URL to GitHub repository settings',
      'Configure deployment service API credentials',
      'Set up Slack channel for deployment notifications',
      'Test with a sample release',
      'Monitor deployment status and adjust as needed'
    ]
  },
  {
    keywords: ['social media', 'twitter', 'facebook', 'instagram', 'linkedin', 'post', 'content'],
    name: 'Social Media Cross-Posting',
    description: 'Automatically posts content across multiple social media platforms',
    triggerType: 'Webhook',
    estimatedSetupTime: '15 minutes',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'social-post',
          options: {}
        },
        id: uuidv4(),
        name: 'Content Webhook',
        type: 'n8n-nodes-base.webhook',
        position: [240, 300],
        typeVersion: 1
      },
      {
        parameters: {
          values: {
            string: [
              { name: 'content', value: '={{$json["content"]}}' },
              { name: 'image_url', value: '={{$json["image_url"]}}' },
              { name: 'hashtags', value: '={{$json["hashtags"]}}' },
              { name: 'platforms', value: '={{JSON.stringify($json["platforms"])}}' }
            ]
          },
          options: {}
        },
        id: uuidv4(),
        name: 'Process Content',
        type: 'n8n-nodes-base.set',
        position: [460, 300],
        typeVersion: 1
      },
      {
        parameters: {
          text: '={{$json["content"]}} {{$json["hashtags"]}}',
          additionalFields: {
            mediaIds: '={{$json["image_url"] ? [$json["image_url"]] : []}}'
          }
        },
        id: uuidv4(),
        name: 'Post to Twitter',
        type: 'n8n-nodes-base.twitter',
        position: [680, 200],
        typeVersion: 1
      },
      {
        parameters: {
          pageId: 'your-facebook-page-id',
          message: '={{$json["content"]}}',
          additionalFields: {
            link: '={{$json["image_url"]}}'
          }
        },
        id: uuidv4(),
        name: 'Post to Facebook',
        type: 'n8n-nodes-base.facebook',
        position: [680, 400],
        typeVersion: 1
      },
      {
        parameters: {
          text: '={{$json["content"]}} {{$json["hashtags"]}}',
          additionalFields: {
            mediaUrl: '={{$json["image_url"]}}'
          }
        },
        id: uuidv4(),
        name: 'Post to LinkedIn',
        type: 'n8n-nodes-base.linkedIn',
        position: [680, 600],
        typeVersion: 1
      }
    ],
    connections: {},
    setupInstructions: [
      'Set up API credentials for each social media platform',
      'Configure page/profile IDs where applicable',
      'Test with sample content and images',
      'Set up content approval workflow if needed',
      'Monitor posting success and engagement'
    ]
  },
  {
    keywords: ['monitoring', 'uptime', 'website', 'server', 'health check', 'status', 'alert'],
    name: 'Website Monitoring & Alerts',
    description: 'Monitors website uptime and performance, sends alerts when issues are detected',
    triggerType: 'Schedule',
    estimatedSetupTime: '8 minutes',
    nodes: [
      {
        parameters: {
          rule: {
            interval: [
              {
                field: 'cronExpression',
                expression: '*/5 * * * *'
              }
            ]
          }
        },
        id: uuidv4(),
        name: 'Monitor Schedule',
        type: 'n8n-nodes-base.scheduleTrigger',
        position: [240, 300],
        typeVersion: 1
      },
      {
        parameters: {
          url: 'https://yourwebsite.com',
          timeout: 10000,
          options: {
            followRedirect: true,
            ignoreSSLIssues: false
          }
        },
        id: uuidv4(),
        name: 'Check Website',
        type: 'n8n-nodes-base.httpRequest',
        position: [460, 300],
        typeVersion: 1
      },
      {
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{$json["statusCode"]}}',
                operation: 'notEqual',
                value2: 200
              }
            ]
          }
        },
        id: uuidv4(),
        name: 'Check Status',
        type: 'n8n-nodes-base.if',
        position: [680, 300],
        typeVersion: 1
      },
      {
        parameters: {
          select: 'channel',
          channelId: 'alerts',
          text: '🚨 Website Down Alert!\n\nURL: {{$node["Check Website"].json["url"]}}\nStatus Code: {{$node["Check Website"].json["statusCode"]}}\nTime: {{$now.format("YYYY-MM-DD HH:mm:ss")}}'
        },
        id: uuidv4(),
        name: 'Send Alert',
        type: 'n8n-nodes-base.slack',
        position: [900, 300],
        typeVersion: 1
      },
      {
        parameters: {
          fromEmail: 'alerts@yourcompany.com',
          toEmail: 'admin@yourcompany.com',
          subject: 'Website Down Alert - {{$now.format("YYYY-MM-DD HH:mm")}}',
          text: 'Your website appears to be down.\n\nURL: {{$node["Check Website"].json["url"]}}\nStatus: {{$node["Check Website"].json["statusCode"]}}\nResponse Time: {{$node["Check Website"].json["responseTime"]}}ms'
        },
        id: uuidv4(),
        name: 'Email Alert',
        type: 'n8n-nodes-base.emailSend',
        position: [900, 500],
        typeVersion: 1
      }
    ],
    connections: {},
    setupInstructions: [
      'Configure the website URL to monitor',
      'Set up Slack channel for alerts',
      'Configure email settings for notifications',
      'Adjust monitoring frequency as needed',
      'Test with a temporary URL change to verify alerts work'
    ]
  },
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
  
  // Find the best matching template based on keywords with weighted scoring
  let bestMatch: WorkflowTemplate | null = null;
  let maxScore = 0;
  
  for (const template of workflowTemplates) {
    let score = 0;
    
    // Check for exact keyword matches (higher weight)
    template.keywords.forEach(keyword => {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        score += 2; // Higher weight for exact matches
      }
    });
    
    // Check for partial matches and related terms
    if (lowerPrompt.includes('form') && template.keywords.includes('contact form')) score += 1;
    if (lowerPrompt.includes('notify') && template.keywords.includes('notification')) score += 1;
    if (lowerPrompt.includes('database') && template.keywords.includes('backup')) score += 1;
    if (lowerPrompt.includes('customer') && template.keywords.includes('crm')) score += 1;
    if (lowerPrompt.includes('order') && template.keywords.includes('ecommerce')) score += 1;
    if (lowerPrompt.includes('deploy') && template.keywords.includes('deployment')) score += 1;
    if (lowerPrompt.includes('post') && template.keywords.includes('social media')) score += 1;
    if (lowerPrompt.includes('monitor') && template.keywords.includes('monitoring')) score += 1;
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = template;
    }
  }
  
  // If no good match, create a smart generic template based on prompt analysis
  if (!bestMatch || maxScore === 0) {
    // Analyze prompt for trigger type
    let triggerType = 'Webhook';
    let triggerNode;
    
    if (lowerPrompt.includes('daily') || lowerPrompt.includes('weekly') || lowerPrompt.includes('schedule') || lowerPrompt.includes('time')) {
      triggerType = 'Schedule';
      triggerNode = {
        parameters: {
          rule: {
            interval: [
              {
                field: 'cronExpression',
                expression: lowerPrompt.includes('daily') ? '0 9 * * *' : lowerPrompt.includes('weekly') ? '0 9 * * 1' : '0 */6 * * *'
              }
            ]
          }
        },
        id: uuidv4(),
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        position: [240, 300],
        typeVersion: 1
      };
    } else {
      triggerNode = {
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
      };
    }
    
    // Create additional nodes based on prompt content
    const nodes = [triggerNode];
    let yPosition = 300;
    
    // Add data processing if needed
    if (lowerPrompt.includes('data') || lowerPrompt.includes('process') || lowerPrompt.includes('transform')) {
      nodes.push({
        parameters: {
          values: {
            string: [
              {
                name: 'processed_data',
                value: '={{JSON.stringify($json)}}'
              },
              {
                name: 'timestamp',
                value: '={{$now.format("YYYY-MM-DD HH:mm:ss")}}'
              }
            ]
          },
          options: {}
        },
        id: uuidv4(),
        name: 'Process Data',
        type: 'n8n-nodes-base.set',
        position: [460, yPosition],
        typeVersion: 1
      });
    }
    
    // Add email if mentioned
    if (lowerPrompt.includes('email') || lowerPrompt.includes('mail') || lowerPrompt.includes('send')) {
      nodes.push({
        parameters: {
          fromEmail: 'noreply@yoursite.com',
          toEmail: 'admin@yoursite.com',
          subject: 'Automated Notification',
          text: 'This is an automated message from your workflow.\n\nData: {{JSON.stringify($json)}}'
        },
        id: uuidv4(),
        name: 'Send Email',
        type: 'n8n-nodes-base.emailSend',
        position: [680, yPosition],
        typeVersion: 1
      });
    }
    
    // Add HTTP request for API calls
    if (lowerPrompt.includes('api') || lowerPrompt.includes('http') || lowerPrompt.includes('request')) {
      nodes.push({
        parameters: {
          url: 'https://api.example.com/endpoint',
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          sendBody: true,
          bodyContentType: 'json'
        },
        id: uuidv4(),
        name: 'API Request',
        type: 'n8n-nodes-base.httpRequest',
        position: [680, yPosition + 200],
        typeVersion: 1
      });
    }
    
    bestMatch = {
      keywords: [],
      name: 'Custom Automation Workflow',
      description: `Custom workflow based on your description: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`,
      triggerType,
      estimatedSetupTime: '7 minutes',
      nodes,
      connections: {},
      setupInstructions: [
        'Review and customize the generated nodes for your specific use case',
        'Configure authentication and credentials where needed',
        'Update URLs, email addresses, and other parameters',
        'Test the workflow with sample data',
        'Add additional nodes or modify logic as required'
      ]
    };
  }
  
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