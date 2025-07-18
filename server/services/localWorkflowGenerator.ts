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
  // Advanced Enterprise Lead Processing Workflow  
  {
    keywords: ['lead scoring', 'salesforce', 'high-value', 'enterprise', 'asana', 'sms alert', 'analytics dashboard', 'sales team', 'lead qualification', 'personalized email', 'calendar event', 'crm integration', 'sales automation', 'lead management'],
    name: 'Enterprise Lead Processing Workflow',
    description: 'Complete enterprise lead processing with AI scoring, CRM integration, multi-channel notifications, and automated sales workflows',
    triggerType: 'Webhook',
    estimatedSetupTime: '25 minutes',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'enterprise-lead',
          options: {}
        },
        id: uuidv4(),
        name: 'Lead Webhook',
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
              { name: 'company_size', value: '={{$json["company_size"]}}' },
              { name: 'budget', value: '={{$json["budget"]}}' },
              { name: 'industry', value: '={{$json["industry"]}}' },
              { name: 'phone', value: '={{$json["phone"]}}' }
            ]
          },
          options: {}
        },
        id: uuidv4(),
        name: 'Extract Lead Data',
        type: 'n8n-nodes-base.set',
        position: [460, 300],
        typeVersion: 1
      },
      {
        parameters: {
          jsCode: `
// Lead scoring algorithm
let score = 0;
const companySize = $input.item.json.company_size;
const budget = parseInt($input.item.json.budget) || 0;

// Company size scoring
if (companySize === 'enterprise' || companySize === 'large') score += 40;
else if (companySize === 'medium') score += 25;
else if (companySize === 'small') score += 10;

// Budget scoring
if (budget >= 100000) score += 40;
else if (budget >= 50000) score += 30;
else if (budget >= 10000) score += 20;
else if (budget >= 5000) score += 10;

// Industry scoring (add premium industries)
const premiumIndustries = ['finance', 'healthcare', 'technology', 'manufacturing'];
if (premiumIndustries.includes($input.item.json.industry?.toLowerCase())) score += 20;

return [{ json: { ...$input.item.json, lead_score: score, priority: score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low' } }];
`
        },
        id: uuidv4(),
        name: 'Calculate Lead Score',
        type: 'n8n-nodes-base.code',
        position: [680, 300],
        typeVersion: 1
      },
      {
        parameters: {
          objectId: 'Lead',
          fieldsToCreate: {
            FirstName: '={{$json["name"].split(" ")[0]}}',
            LastName: '={{$json["name"].split(" ").slice(1).join(" ")}}',
            Email: '={{$json["email"]}}',
            Company: '={{$json["company"]}}',
            Phone: '={{$json["phone"]}}',
            Industry: '={{$json["industry"]}}',
            LeadSource: 'Website',
            Budget__c: '={{$json["budget"]}}',
            Lead_Score__c: '={{$json["lead_score"]}}',
            Priority__c: '={{$json["priority"]}}'
          }
        },
        id: uuidv4(),
        name: 'Add to Salesforce',
        type: 'n8n-nodes-base.salesforce',
        position: [900, 200],
        typeVersion: 1
      },
      {
        parameters: {
          spreadsheetId: 'your-lead-tracking-sheet-id',
          range: 'A:I',
          values: [
            ['={{$json["name"]}}', '={{$json["email"]}}', '={{$json["company"]}}', '={{$json["industry"]}}', '={{$json["budget"]}}', '={{$json["lead_score"]}}', '={{$json["priority"]}}', '={{$now.format("YYYY-MM-DD HH:mm")}}', 'New']
          ]
        },
        id: uuidv4(),
        name: 'Track in Google Sheets',
        type: 'n8n-nodes-base.googleSheets',
        position: [900, 400],
        typeVersion: 1
      },
      {
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{$json["lead_score"]}}',
                operation: 'largerEqual',
                value2: 80
              }
            ]
          }
        },
        id: uuidv4(),
        name: 'Check High Priority',
        type: 'n8n-nodes-base.if',
        position: [1120, 300],
        typeVersion: 1
      },
      {
        parameters: {
          accountSid: '={{$credentials.twilioAccountSid}}',
          from: '={{$credentials.twilioFromNumber}}',
          to: '+1234567890',
          body: '🚨 HIGH PRIORITY LEAD ALERT\n\nLead: {{$json["name"]}}\nCompany: {{$json["company"]}}\nScore: {{$json["lead_score"]}}\nBudget: ${{$json["budget"]}}\n\nReview immediately!'
        },
        id: uuidv4(),
        name: 'SMS Alert to Sales Director',
        type: 'n8n-nodes-base.twilio',
        position: [1340, 200],
        typeVersion: 1
      },
      {
        parameters: {
          projectId: 'your-asana-project-id',
          name: 'HIGH PRIORITY: {{$json["name"]}} - {{$json["company"]}}',
          notes: 'Lead Score: {{$json["lead_score"]}}\nCompany: {{$json["company"]}}\nIndustry: {{$json["industry"]}}\nBudget: ${{$json["budget"]}}\nEmail: {{$json["email"]}}\nPhone: {{$json["phone"]}}\n\nNext Steps:\n- Schedule discovery call within 24 hours\n- Prepare industry-specific proposal\n- Review company background',
          priority: 'high',
          assignee: 'sales-manager@company.com',
          due_on: '={{$now.plus({days: 1}).format("YYYY-MM-DD")}}'
        },
        id: uuidv4(),
        name: 'Create Asana Task',
        type: 'n8n-nodes-base.asana',
        position: [1340, 400],
        typeVersion: 1
      },
      {
        parameters: {
          select: 'channel',
          channelId: 'sales-leads',
          text: '🎯 New {{$json["priority"]}} Priority Lead!\n\n👤 *{{$json["name"]}}* from *{{$json["company"]}}*\n📊 Score: {{$json["lead_score"]}}/100\n💰 Budget: ${{$json["budget"]}}\n🏢 Industry: {{$json["industry"]}}\n📧 {{$json["email"]}}\n\n{{$json["priority"] === "high" ? "⚡ HIGH PRIORITY - Immediate action required!" : "Standard follow-up process initiated"}}'
        },
        id: uuidv4(),
        name: 'Notify Sales Team',
        type: 'n8n-nodes-base.slack',
        position: [900, 600],
        typeVersion: 1
      },
      {
        parameters: {
          url: 'https://your-analytics-dashboard.com/webhook',
          method: 'POST',
          body: {
            event: 'new_lead',
            lead_id: '={{$json["email"]}}',
            score: '={{$json["lead_score"]}}',
            company: '={{$json["company"]}}',
            budget: '={{$json["budget"]}}',
            timestamp: '={{$now.format()}}'
          },
          headers: {
            'Authorization': 'Bearer your-analytics-api-key',
            'Content-Type': 'application/json'
          }
        },
        id: uuidv4(),
        name: 'Update Analytics Dashboard',
        type: 'n8n-nodes-base.httpRequest',
        position: [1120, 600],
        typeVersion: 1
      }
    ],
    connections: {
      'Lead Webhook': { main: [['Extract Lead Data']] },
      'Extract Lead Data': { main: [['Calculate Lead Score']] },
      'Calculate Lead Score': { main: [['Add to Salesforce'], ['Track in Google Sheets'], ['Notify Sales Team'], ['Check High Priority']] },
      'Check High Priority': { main: [['SMS Alert to Sales Director', 'Create Asana Task']] },
      'Notify Sales Team': { main: [['Update Analytics Dashboard']] }
    },
    setupInstructions: [
      'Set up Salesforce API credentials and custom fields for lead scoring',
      'Configure Google Sheets with proper column headers for lead tracking',
      'Set up Twilio account for SMS alerts to sales director',
      'Create Asana project for high-priority lead tasks',
      'Configure Slack #sales-leads channel for team notifications',
      'Set up analytics dashboard webhook endpoint',
      'Test lead scoring algorithm with sample data',
      'Train sales team on priority lead handling procedures',
      'Set up email templates for different industries',
      'Configure calendar integration for automatic meeting scheduling'
    ]
  },
  // Advanced E-commerce Order Processing
  {
    keywords: ['order processing', 'ecommerce', 'shopify', 'inventory', 'payment', 'fulfillment', 'shipping', 'confirmation email', 'analytics', 'customer notification', 'order management', 'payment validation', 'fraud detection'],
    name: 'Advanced E-commerce Order Processing',
    description: 'Complete order processing pipeline with payment validation, inventory management, fulfillment automation, and customer communications',
    triggerType: 'Webhook',
    estimatedSetupTime: '20 minutes',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'ecommerce-order',
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
          jsCode: `
// Order validation and fraud detection
const order = $input.item.json;
let riskScore = 0;

// Basic fraud checks
if (order.billing_address?.country !== order.shipping_address?.country) riskScore += 20;
if (parseFloat(order.total) > 1000) riskScore += 10;
if (order.payment_method === 'credit_card' && !order.cvv_verified) riskScore += 30;

// Inventory check simulation
const inventoryStatus = order.items.map(item => ({
  ...item,
  in_stock: Math.random() > 0.1, // 90% in stock simulation
  warehouse: item.quantity > 10 ? 'main' : 'secondary'
}));

return [{
  json: {
    ...order,
    risk_score: riskScore,
    fraud_risk: riskScore > 50 ? 'high' : riskScore > 25 ? 'medium' : 'low',
    inventory_status: inventoryStatus,
    needs_manual_review: riskScore > 50,
    estimated_ship_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  }
}];
`
        },
        id: uuidv4(),
        name: 'Validate Order & Check Inventory',
        type: 'n8n-nodes-base.code',
        position: [460, 300],
        typeVersion: 1
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{$json["fraud_risk"]}}',
                operation: 'notEqual',
                value2: 'high'
              }
            ]
          }
        },
        id: uuidv4(),
        name: 'Check Fraud Risk',
        type: 'n8n-nodes-base.if',
        position: [680, 300],
        typeVersion: 1
      },
      {
        parameters: {
          url: 'https://api.inventory-system.com/update',
          method: 'POST',
          body: {
            order_id: '={{$json["order_id"]}}',
            items: '={{$json["inventory_status"]}}',
            action: 'reserve'
          },
          headers: {
            'Authorization': 'Bearer {{process.env.INVENTORY_API_KEY}}',
            'Content-Type': 'application/json'
          }
        },
        id: uuidv4(),
        name: 'Update Inventory',
        type: 'n8n-nodes-base.httpRequest',
        position: [900, 200],
        typeVersion: 1
      },
      {
        parameters: {
          fromEmail: 'orders@store.com',
          toEmail: '={{$json["customer"]["email"]}}',
          subject: 'Order Confirmation #{{$json["order_id"]}}',
          html: 'Thank you for your order! Order #{{$json["order_id"]}} for ${{$json["total"]}} has been confirmed.'
        },
        id: uuidv4(),
        name: 'Send Order Confirmation',
        type: 'n8n-nodes-base.emailSend',
        position: [900, 400],
        typeVersion: 1
      },
      {
        parameters: {
          select: 'channel',
          channelId: 'fulfillment',
          text: '🛒 New Order #{{$json["order_id"]}} from {{$json["customer"]["name"]}} - ${{$json["total"]}} - Risk: {{$json["fraud_risk"]}}'
        },
        id: uuidv4(),
        name: 'Notify Fulfillment Team',
        type: 'n8n-nodes-base.slack',
        position: [900, 600],
        typeVersion: 1
      },
      {
        parameters: {
          url: 'https://analytics.yourstore.com/events',
          method: 'POST',
          body: {
            event: 'order_processed',
            order_id: '={{$json["order_id"]}}',
            total: '={{$json["total"]}}',
            customer_id: '={{$json["customer"]["id"]}}',
            fraud_risk: '={{$json["fraud_risk"]}}',
            timestamp: '={{$now.format()}}'
          }
        },
        id: uuidv4(),
        name: 'Track Analytics',
        type: 'n8n-nodes-base.httpRequest',
        position: [1120, 400],
        typeVersion: 1
      }
    ],
    connections: {
      'Order Webhook': { main: [['Validate Order & Check Inventory']] },
      'Validate Order & Check Inventory': { main: [['Check Fraud Risk']] },
      'Check Fraud Risk': { main: [['Update Inventory'], ['Send Order Confirmation'], ['Notify Fulfillment Team']] },
      'Send Order Confirmation': { main: [['Track Analytics']] }
    },
    setupInstructions: [
      'Configure webhook URL in your e-commerce platform (Shopify, WooCommerce, etc.)',
      'Set up inventory management API credentials',
      'Configure email service for order confirmations',
      'Set up Slack workspace for fulfillment notifications',
      'Configure analytics tracking endpoint',
      'Set up fraud detection rules and thresholds',
      'Test with sample orders to verify all integrations',
      'Set up automated shipping label generation',
      'Configure customer notification sequences',
      'Set up return and refund automation workflows'
    ]
  },
  // Multi-Platform Content Distribution
  {
    keywords: ['content distribution', 'social media', 'cross-posting', 'blog', 'podcast', 'youtube', 'newsletter', 'seo optimization', 'content marketing', 'multi-platform', 'scheduling', 'analytics'],
    name: 'Multi-Platform Content Distribution',
    description: 'Automated content distribution across social media, blogs, newsletters with SEO optimization and performance tracking',
    triggerType: 'Webhook', 
    estimatedSetupTime: '30 minutes',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'content-publish',
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
          jsCode: `
// AI-powered content optimization
const content = $input.item.json;

// Generate platform-specific content
const platforms = {
  twitter: {
    text: content.title.length > 240 ? content.title.substring(0, 237) + '...' : content.title,
    hashtags: content.tags?.slice(0, 3).map(tag => '#' + tag.replace(/\s/g, '')).join(' ') || '',
    max_length: 280
  },
  linkedin: {
    text: content.description || content.title,
    tone: 'professional',
    cta: 'Read more about this topic',
    hashtags: content.tags?.slice(0, 5).map(tag => '#' + tag.replace(/\s/g, '')).join(' ') || ''
  },
  facebook: {
    text: content.description || content.title,
    tone: 'engaging',
    call_to_action: 'Learn More',
    optimal_time: '2PM EST'
  },
  instagram: {
    text: content.title,
    hashtags: content.tags?.slice(0, 10).map(tag => '#' + tag.replace(/\s/g, '')).join(' ') || '',
    story_text: content.title.substring(0, 100)
  }
};

// SEO optimization
const seo = {
  meta_title: content.title.length > 60 ? content.title.substring(0, 57) + '...' : content.title,
  meta_description: content.description?.substring(0, 155) || content.title,
  keywords: content.tags?.join(', ') || '',
  canonical_url: content.url
};

return [{
  json: {
    ...content,
    platforms,
    seo_data: seo,
    publish_time: new Date().toISOString(),
    content_type: content.type || 'article'
  }
}];
`
        },
        id: uuidv4(),
        name: 'Optimize Content for Platforms',
        type: 'n8n-nodes-base.code',
        position: [460, 300],
        typeVersion: 1
      },
      {
        parameters: {
          text: '={{$json["platforms"]["twitter"]["text"]}} {{$json["platforms"]["twitter"]["hashtags"]}}',
          additionalFields: {
            mediaUrls: '={{$json["featured_image"] ? [$json["featured_image"]] : []}}'
          }
        },
        id: uuidv4(),
        name: 'Post to Twitter',
        type: 'n8n-nodes-base.twitter',
        position: [680, 100],
        typeVersion: 1
      },
      {
        parameters: {
          text: '={{$json["platforms"]["linkedin"]["text"]}}\n\n{{$json["platforms"]["linkedin"]["cta"]}}\n\n{{$json["platforms"]["linkedin"]["hashtags"]}}',
          additionalFields: {
            mediaUrl: '={{$json["featured_image"]}}'
          }
        },
        id: uuidv4(),
        name: 'Post to LinkedIn',
        type: 'n8n-nodes-base.linkedIn',
        position: [680, 300],
        typeVersion: 1
      },
      {
        parameters: {
          pageId: 'your-facebook-page',
          message: '={{$json["platforms"]["facebook"]["text"]}}',
          additionalFields: {
            link: '={{$json["url"]}}',
            mediaUrl: '={{$json["featured_image"]}}'
          }
        },
        id: uuidv4(),
        name: 'Post to Facebook',
        type: 'n8n-nodes-base.facebook',
        position: [680, 500],
        typeVersion: 1
      },
      {
        parameters: {
          listId: 'newsletter-list-id',
          subject: '={{$json["title"]}}',
          htmlContent: 'New content: {{$json["title"]}} - {{$json["description"]}} Read more: {{$json["url"]}}'
        },
        id: uuidv4(),
        name: 'Send Newsletter',
        type: 'n8n-nodes-base.mailgun',
        position: [900, 200],
        typeVersion: 1
      },
      {
        parameters: {
          url: 'https://api.analytics.com/content-tracking',
          method: 'POST',
          body: {
            content_id: '={{$json["id"]}}',
            title: '={{$json["title"]}}',
            platforms: ['twitter', 'linkedin', 'facebook', 'newsletter'],
            publish_time: '={{$json["publish_time"]}}',
            tags: '={{JSON.stringify($json["tags"])}}'
          }
        },
        id: uuidv4(),
        name: 'Track Performance',
        type: 'n8n-nodes-base.httpRequest',
        position: [1120, 300],
        typeVersion: 1
      }
    ],
    connections: {
      'Content Webhook': { main: [['Optimize Content for Platforms']] },
      'Optimize Content for Platforms': { main: [['Post to Twitter'], ['Post to LinkedIn'], ['Post to Facebook'], ['Send Newsletter']] },
      'Send Newsletter': { main: [['Track Performance']] }
    },
    setupInstructions: [
      'Configure social media API credentials for all platforms',
      'Set up newsletter service (Mailgun, SendGrid, etc.)',
      'Configure content optimization rules and templates',
      'Set up analytics tracking for performance monitoring',
      'Configure scheduling for optimal posting times',
      'Set up content approval workflows if needed',
      'Configure SEO optimization rules',
      'Set up cross-platform hashtag strategies',
      'Configure automated content archiving',
      'Set up performance reporting dashboards'
    ]
  },
  // IoT Data Processing & Monitoring
  {
    keywords: ['iot', 'sensor', 'temperature', 'monitoring', 'time-series', 'data collection', 'analytics', 'alerts', 'manufacturing', 'industrial', 'dashboard', 'predictive maintenance', 'anomaly detection'],
    name: 'IoT Data Processing & Analytics Platform',
    description: 'Enterprise IoT data collection, processing, anomaly detection, and automated maintenance scheduling',
    triggerType: 'Webhook',
    estimatedSetupTime: '35 minutes',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'iot-data',
          options: {}
        },
        id: uuidv4(),
        name: 'IoT Data Webhook',
        type: 'n8n-nodes-base.webhook',
        position: [240, 300],
        typeVersion: 1
      },
      {
        parameters: {
          jsCode: `
// IoT data processing and anomaly detection
const data = $input.item.json;

// Process sensor readings
const processedData = {
  sensor_id: data.sensor_id,
  timestamp: new Date().toISOString(),
  temperature: parseFloat(data.temperature),
  humidity: parseFloat(data.humidity || 0),
  pressure: parseFloat(data.pressure || 0),
  location: data.location || 'unknown',
  facility: data.facility || 'main'
};

// Anomaly detection
const thresholds = {
  temperature: { min: 18, max: 25, critical: 30 },
  humidity: { min: 30, max: 70, critical: 80 },
  pressure: { min: 990, max: 1050, critical: 1060 }
};

let alerts = [];
let severity = 'normal';

// Temperature checks
if (processedData.temperature > thresholds.temperature.critical) {
  alerts.push({ type: 'temperature', level: 'critical', value: processedData.temperature });
  severity = 'critical';
} else if (processedData.temperature > thresholds.temperature.max || processedData.temperature < thresholds.temperature.min) {
  alerts.push({ type: 'temperature', level: 'warning', value: processedData.temperature });
  if (severity === 'normal') severity = 'warning';
}

// Calculate moving average (simulate)
const movingAverage = processedData.temperature; // In real implementation, use historical data

return [{
  json: {
    ...processedData,
    alerts,
    severity,
    moving_average: movingAverage,
    maintenance_required: severity === 'critical',
    processed_time: new Date().toISOString()
  }
}];
`
        },
        id: uuidv4(),
        name: 'Process & Analyze Data',
        type: 'n8n-nodes-base.code',
        position: [460, 300],
        typeVersion: 1
      },
      {
        parameters: {
          url: 'https://timeseries-db.company.com/api/data',
          method: 'POST',
          body: {
            sensor_id: '={{$json["sensor_id"]}}',
            timestamp: '={{$json["timestamp"]}}',
            metrics: {
              temperature: '={{$json["temperature"]}}',
              humidity: '={{$json["humidity"]}}',
              pressure: '={{$json["pressure"]}}'
            },
            location: '={{$json["location"]}}',
            severity: '={{$json["severity"]}}'
          },
          headers: {
            'Authorization': 'Bearer {{process.env.TIMESERIES_API_KEY}}',
            'Content-Type': 'application/json'
          }
        },
        id: uuidv4(),
        name: 'Store in Time-Series DB',
        type: 'n8n-nodes-base.httpRequest',
        position: [680, 200],
        typeVersion: 1
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{$json["severity"]}}',
                operation: 'notEqual',
                value2: 'normal'
              }
            ]
          }
        },
        id: uuidv4(),
        name: 'Check Alert Level',
        type: 'n8n-nodes-base.if',
        position: [680, 400],
        typeVersion: 1
      },
      {
        parameters: {
          select: 'channel',
          channelId: 'iot-alerts',
          text: '🌡️ IoT Alert - {{$json["severity"]}} level\nSensor: {{$json["sensor_id"]}}\nLocation: {{$json["location"]}}\nTemperature: {{$json["temperature"]}}°C\nTime: {{$json["timestamp"]}}'
        },
        id: uuidv4(),
        name: 'Send Slack Alert',
        type: 'n8n-nodes-base.slack',
        position: [900, 300],
        typeVersion: 1
      },
      {
        parameters: {
          fromEmail: 'iot-system@company.com',
          toEmail: 'facilities@company.com',
          subject: 'IoT {{$json["severity"]}} Alert - Sensor {{$json["sensor_id"]}}',
          text: 'Alert detected on sensor {{$json["sensor_id"]}} at {{$json["location"]}}. Temperature: {{$json["temperature"]}}°C. Please investigate immediately.'
        },
        id: uuidv4(),
        name: 'Send Email Alert',
        type: 'n8n-nodes-base.emailSend',
        position: [900, 500],
        typeVersion: 1
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{$json["maintenance_required"]}}',
                operation: 'equal',
                value2: 'true'
              }
            ]
          }
        },
        id: uuidv4(),
        name: 'Check Maintenance Need',
        type: 'n8n-nodes-base.if',
        position: [1120, 400],
        typeVersion: 1
      },
      {
        parameters: {
          url: 'https://maintenance-system.company.com/api/tickets',
          method: 'POST',
          body: {
            title: 'Critical IoT Sensor Maintenance Required',
            description: 'Sensor {{$json["sensor_id"]}} at {{$json["location"]}} requires immediate maintenance due to critical alert.',
            priority: 'high',
            location: '={{$json["location"]}}',
            sensor_id: '={{$json["sensor_id"]}}',
            created_by: 'iot-system'
          }
        },
        id: uuidv4(),
        name: 'Create Maintenance Ticket',
        type: 'n8n-nodes-base.httpRequest',
        position: [1340, 400],
        typeVersion: 1
      }
    ],
    connections: {
      'IoT Data Webhook': { main: [['Process & Analyze Data']] },
      'Process & Analyze Data': { main: [['Store in Time-Series DB'], ['Check Alert Level']] },
      'Check Alert Level': { main: [['Send Slack Alert'], ['Send Email Alert']] },
      'Send Email Alert': { main: [['Check Maintenance Need']] },
      'Check Maintenance Need': { main: [['Create Maintenance Ticket']] }
    },
    setupInstructions: [
      'Configure IoT sensors to send data to webhook endpoint',
      'Set up time-series database (InfluxDB, TimescaleDB) for data storage',
      'Configure Slack workspace for real-time alerts',
      'Set up email service for critical notifications',
      'Configure maintenance management system integration',
      'Set up alerting thresholds for different sensor types',
      'Configure dashboard for real-time monitoring',
      'Set up historical data analysis and reporting',
      'Configure predictive maintenance algorithms',
      'Set up automated calibration workflows'
    ]
  },
  // Financial Data Pipeline
  {
    keywords: ['financial', 'reporting', 'reconciliation', 'accounting', 'transactions', 'bank', 'payments', 'audit', 'compliance', 'tax', 'revenue', 'expense', 'budget'],
    name: 'Financial Data Pipeline & Reporting',
    description: 'Automated financial data processing, reconciliation, compliance reporting, and anomaly detection',
    triggerType: 'Schedule',
    estimatedSetupTime: '40 minutes',
    nodes: [
      {
        parameters: {
          rule: {
            interval: [
              {
                field: 'hours',
                hoursInterval: 6
              }
            ]
          }
        },
        id: uuidv4(),
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.cron',
        position: [240, 300],
        typeVersion: 1
      },
      {
        parameters: {
          url: 'https://api.bank.com/accounts/transactions',
          method: 'GET',
          headers: {
            'Authorization': 'Bearer {{process.env.BANK_API_KEY}}',
            'Content-Type': 'application/json'
          },
          qs: {
            start_date: '={{$now.minus({days: 1}).format("YYYY-MM-DD")}}',
            end_date: '={{$now.format("YYYY-MM-DD")}}'
          }
        },
        id: uuidv4(),
        name: 'Fetch Bank Transactions',
        type: 'n8n-nodes-base.httpRequest',
        position: [460, 200],
        typeVersion: 1
      },
      {
        parameters: {
          url: 'https://api.paymentprocessor.com/transactions',
          method: 'GET',
          headers: {
            'Authorization': 'Bearer {{process.env.PAYMENT_API_KEY}}'
          },
          qs: {
            date: '={{$now.minus({days: 1}).format("YYYY-MM-DD")}}'
          }
        },
        id: uuidv4(),
        name: 'Fetch Payment Data',
        type: 'n8n-nodes-base.httpRequest',
        position: [460, 400],
        typeVersion: 1
      },
      {
        parameters: {
          jsCode: `
// Financial data reconciliation and analysis
const bankData = $input.item.json.bank_transactions || [];
const paymentData = $input.item.json.payment_transactions || [];

// Reconcile transactions
let reconciled = [];
let discrepancies = [];
let totalRevenue = 0;
let totalExpenses = 0;

bankData.forEach(bankTx => {
  const matchingPayment = paymentData.find(p => 
    Math.abs(parseFloat(p.amount) - parseFloat(bankTx.amount)) < 0.01 &&
    new Date(p.date).toDateString() === new Date(bankTx.date).toDateString()
  );
  
  if (matchingPayment) {
    reconciled.push({
      bank_id: bankTx.id,
      payment_id: matchingPayment.id,
      amount: bankTx.amount,
      date: bankTx.date,
      status: 'reconciled'
    });
  } else {
    discrepancies.push({
      transaction_id: bankTx.id,
      amount: bankTx.amount,
      date: bankTx.date,
      type: 'unmatched_bank_transaction'
    });
  }
  
  if (parseFloat(bankTx.amount) > 0) {
    totalRevenue += parseFloat(bankTx.amount);
  } else {
    totalExpenses += Math.abs(parseFloat(bankTx.amount));
  }
});

// Detect anomalies
const anomalies = [];
bankData.forEach(tx => {
  if (Math.abs(parseFloat(tx.amount)) > 10000) {
    anomalies.push({
      transaction_id: tx.id,
      amount: tx.amount,
      type: 'large_transaction',
      requires_review: true
    });
  }
});

return [{
  json: {
    reconciliation_summary: {
      total_reconciled: reconciled.length,
      total_discrepancies: discrepancies.length,
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_position: totalRevenue - totalExpenses
    },
    reconciled_transactions: reconciled,
    discrepancies,
    anomalies,
    report_date: new Date().toISOString()
  }
}];
`
        },
        id: uuidv4(),
        name: 'Reconcile & Analyze',
        type: 'n8n-nodes-base.code',
        position: [680, 300],
        typeVersion: 1
      },
      {
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{$json["discrepancies"].length}}',
                operation: 'larger',
                value2: 0
              }
            ]
          }
        },
        id: uuidv4(),
        name: 'Check Discrepancies',
        type: 'n8n-nodes-base.if',
        position: [900, 300],
        typeVersion: 1
      },
      {
        parameters: {
          fromEmail: 'finance-system@company.com',
          toEmail: 'finance-team@company.com',
          subject: 'Daily Financial Reconciliation Report',
          text: 'Reconciliation completed. Reconciled: {{$json["reconciliation_summary"]["total_reconciled"]}} transactions. Discrepancies: {{$json["reconciliation_summary"]["total_discrepancies"]}}. Net Position: ${{$json["reconciliation_summary"]["net_position"]}}'
        },
        id: uuidv4(),
        name: 'Send Finance Report',
        type: 'n8n-nodes-base.emailSend',
        position: [1120, 200],
        typeVersion: 1
      },
      {
        parameters: {
          fromEmail: 'finance-system@company.com',
          toEmail: 'audit@company.com',
          subject: 'URGENT: Financial Discrepancies Detected',
          text: 'Discrepancies detected in daily reconciliation. Count: {{$json["reconciliation_summary"]["total_discrepancies"]}}. Please review immediately.'
        },
        id: uuidv4(),
        name: 'Alert on Discrepancies',
        type: 'n8n-nodes-base.emailSend',
        position: [1120, 400],
        typeVersion: 1
      }
    ],
    connections: {
      'Schedule Trigger': { main: [['Fetch Bank Transactions'], ['Fetch Payment Data']] },
      'Fetch Payment Data': { main: [['Reconcile & Analyze']] },
      'Reconcile & Analyze': { main: [['Check Discrepancies'], ['Send Finance Report']] },
      'Check Discrepancies': { main: [['Alert on Discrepancies']] }
    },
    setupInstructions: [
      'Configure bank API integration for transaction data',
      'Set up payment processor API connections',
      'Configure reconciliation rules and thresholds',
      'Set up compliance reporting templates',
      'Configure audit trail and logging',
      'Set up automated backup and archiving',
      'Configure tax reporting automation',
      'Set up budget variance analysis',
      'Configure fraud detection algorithms',
      'Set up regulatory compliance monitoring'
    ]
  },
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
  
  // Find the best matching template based on keywords with enhanced weighted scoring
  let bestMatch: WorkflowTemplate | null = null;
  let maxScore = 0;
  
  for (const template of workflowTemplates) {
    let score = 0;
    let keywordMatches = 0;
    
    // Check for exact keyword matches with progressive scoring
    template.keywords.forEach(keyword => {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        keywordMatches++;
        // Higher weight for exact matches, bonus for multiple matches
        score += 3 + (keywordMatches * 0.5);
      }
    });
    
    // Enhanced semantic matching for complex prompts
    const complexityBonus = calculateComplexityBonus(lowerPrompt, template);
    score += complexityBonus;
    
    // Check for partial matches and related terms with better scoring
    if (lowerPrompt.includes('form') && template.keywords.includes('contact form')) score += 2;
    if (lowerPrompt.includes('notify') && template.keywords.includes('notification')) score += 2;
    if (lowerPrompt.includes('database') && template.keywords.includes('backup')) score += 2;
    if (lowerPrompt.includes('customer') && template.keywords.includes('crm')) score += 2;
    if (lowerPrompt.includes('order') && template.keywords.includes('ecommerce')) score += 2;
    if (lowerPrompt.includes('deploy') && template.keywords.includes('deployment')) score += 2;
    if (lowerPrompt.includes('post') && template.keywords.includes('social media')) score += 2;
    if (lowerPrompt.includes('monitor') && template.keywords.includes('monitoring')) score += 2;
    
    // Bonus for enterprise-specific terms
    if (template.name.includes('Enterprise')) {
      if (lowerPrompt.includes('enterprise') || lowerPrompt.includes('complex') || 
          lowerPrompt.includes('advanced') || lowerPrompt.includes('multiple') ||
          lowerPrompt.includes('integration') || lowerPrompt.includes('workflow')) {
        score += 5;
      }
    }
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = template;
    }
  }

  function calculateComplexityBonus(prompt: string, template: WorkflowTemplate): number {
    let bonus = 0;
    
    // Count workflow complexity indicators
    const complexityTerms = ['score', 'scoring', 'salesforce', 'asana', 'sms', 'alert', 'dashboard', 'analytics', 'calendar', 'priority', 'high-value', 'personalized', 'sequence', 'multi', 'multiple', 'integration', 'webhook', 'trigger', 'automation'];
    const enterpriseTerms = ['enterprise', 'lead', 'crm', 'sales team', 'budget', 'company size', 'industry'];
    
    let complexityCount = 0;
    let enterpriseCount = 0;
    
    complexityTerms.forEach(term => {
      if (prompt.includes(term)) complexityCount++;
    });
    
    enterpriseTerms.forEach(term => {
      if (prompt.includes(term)) enterpriseCount++;
    });
    
    // Heavy bonus for enterprise lead processing template when dealing with complex enterprise prompts
    if (template.name.includes('Enterprise Lead Processing')) {
      bonus += enterpriseCount * 4; // High bonus for enterprise terms
      bonus += complexityCount * 2; // Bonus for complexity
      
      // Extra bonus for specific enterprise workflow indicators
      if (prompt.includes('lead') && prompt.includes('score')) bonus += 10;
      if (prompt.includes('salesforce') && prompt.includes('crm')) bonus += 8;
      if (prompt.includes('sms') && prompt.includes('alert')) bonus += 6;
      if (prompt.includes('asana') && prompt.includes('task')) bonus += 6;
      if (prompt.includes('analytics') && prompt.includes('dashboard')) bonus += 5;
    }
    
    return bonus;
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