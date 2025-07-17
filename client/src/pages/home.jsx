import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { MonacoEditor } from '../components/ui/monaco-editor';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { 
  PlayIcon, 
  Lightbulb, 
  PuzzleIcon, 
  WandSparkles, 
  CodeIcon, 
  WrenchIcon, 
  DownloadIcon, 
  CopyIcon, 
  InfoIcon,
  NetworkIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  FilterIcon,
  MailIcon,
  ReplyIcon,
  Loader2Icon,
  AlertCircleIcon,
  TrendingUpIcon,
  ZapIcon,
  ShieldIcon
} from 'lucide-react';

export default function Home() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [includeAuth, setIncludeAuth] = useState(false);
  const [includeErrorHandling, setIncludeErrorHandling] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);

  // Get example prompts
  const { data: examples = [] } = useQuery({
    queryKey: ['/api/examples'],
  });

  // Get popular node types
  const { data: nodeTypes = [] } = useQuery({
    queryKey: ['/api/node-types'],
  });

  // Generate workflow mutation
  const generateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/workflows/generate', data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedWorkflow(data);
      toast({
        title: "Workflow Generated Successfully",
        description: `Generated "${data.name}" with ${data.nodeCount} nodes`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate workflow",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a description",
        description: "Describe what you want your workflow to do",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      prompt: prompt.trim(),
      includeAuth,
      includeErrorHandling,
    });
  };

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  const handleCopyWorkflow = async () => {
    if (!generatedWorkflow?.workflowJson) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(generatedWorkflow.workflowJson, null, 2));
      toast({
        title: "Workflow Copied",
        description: "The workflow JSON has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy workflow to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownloadWorkflow = () => {
    if (!generatedWorkflow?.workflowJson) return;
    
    const blob = new Blob([JSON.stringify(generatedWorkflow.workflowJson, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedWorkflow.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Workflow Downloaded",
      description: "The workflow file has been downloaded",
    });
  };

  const getComplexityIcon = (nodeCount) => {
    if (nodeCount >= 8) return <TrendingUpIcon className="h-4 w-4 text-red-500" />;
    if (nodeCount >= 5) return <ZapIcon className="h-4 w-4 text-orange-500" />;
    return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
  };

  const getComplexityLabel = (nodeCount) => {
    if (nodeCount >= 8) return "Enterprise";
    if (nodeCount >= 5) return "Advanced";
    return "Simple";
  };

  const productionExamples = [
    "When a high-value lead submits our form, score them, add to Salesforce, send personalized email, create Asana task, and alert sales team",
    "Process e-commerce orders: validate payment, check inventory, generate shipping labels, send confirmations, and update analytics",
    "Monitor website uptime every 5 minutes, send Slack alerts for downtime, create incident tickets, and notify on-call team",
    "Automate social media posting: cross-post to Twitter, LinkedIn, Facebook with platform-specific formatting and optimal timing",
    "Financial data pipeline: collect from multiple sources, validate, reconcile, generate reports, and alert for anomalies",
    "Customer onboarding: send welcome series, create accounts in all systems, schedule follow-ups, and track engagement",
    "IoT sensor monitoring: collect temperature data, detect anomalies, trigger maintenance alerts, and generate daily reports",
    "Content workflow: when blog published, optimize SEO, distribute to social media, update newsletter, and track performance"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <NetworkIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              n8n Workflow Generator
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your automation ideas into production-ready n8n workflows using AI and enterprise templates
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Production Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <ZapIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">AI Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Enterprise Scale</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <WandSparkles className="h-5 w-5 text-blue-600" />
                  Describe Your Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe your automation needs in plain English... 
                  
Examples:
• When a customer submits a form, add to CRM and send welcome email
• Process orders, update inventory, and notify fulfillment team  
• Monitor API health and alert on failures
• Cross-post content to all social media platforms"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none border-gray-200 dark:border-gray-700"
                />
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="auth"
                      checked={includeAuth}
                      onCheckedChange={setIncludeAuth}
                      className="border-gray-300"
                    />
                    <label htmlFor="auth" className="text-sm text-gray-700 dark:text-gray-300">
                      Include authentication setup
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="error"
                      checked={includeErrorHandling}
                      onCheckedChange={setIncludeErrorHandling}
                      className="border-gray-300"
                    />
                    <label htmlFor="error" className="text-sm text-gray-700 dark:text-gray-300">
                      Include advanced error handling
                    </label>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending || !prompt.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                  size="lg"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                      Generating Workflow...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Generate Workflow
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Production Examples */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Production Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {productionExamples.slice(0, 6).map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      <div className="flex items-start gap-2">
                        <ArrowRightIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{example}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            {generatedWorkflow && (
              <>
                {/* Workflow Overview */}
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      Generated Workflow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        {generatedWorkflow.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {generatedWorkflow.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getComplexityIcon(generatedWorkflow.nodeCount)}
                        {getComplexityLabel(generatedWorkflow.nodeCount)}
                      </Badge>
                      <Badge variant="outline">
                        <PuzzleIcon className="h-3 w-3 mr-1" />
                        {generatedWorkflow.nodeCount} Nodes
                      </Badge>
                      <Badge variant="outline">
                        <WrenchIcon className="h-3 w-3 mr-1" />
                        {generatedWorkflow.estimatedSetupTime}
                      </Badge>
                      <Badge variant="outline">
                        <FilterIcon className="h-3 w-3 mr-1" />
                        {generatedWorkflow.triggerType}
                      </Badge>
                    </div>

                    {generatedWorkflow.setupInstructions && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <InfoIcon className="h-4 w-4" />
                          Setup Instructions
                        </h4>
                        <ul className="space-y-1">
                          {generatedWorkflow.setupInstructions.map((instruction, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              {instruction}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleCopyWorkflow}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <CopyIcon className="h-4 w-4 mr-1" />
                        Copy JSON
                      </Button>
                      <Button
                        onClick={handleDownloadWorkflow}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <DownloadIcon className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Workflow JSON */}
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <CodeIcon className="h-5 w-5 text-purple-600" />
                      Workflow JSON
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <MonacoEditor
                        value={JSON.stringify(generatedWorkflow.workflowJson, null, 2)}
                        language="json"
                        height="400px"
                        readOnly
                        className="border-0"
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!generatedWorkflow && (
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardContent className="py-12">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <NetworkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter a description above to generate your n8n workflow</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Popular Node Types */}
        {nodeTypes.length > 0 && (
          <Card className="mt-8 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PuzzleIcon className="h-5 w-5 text-blue-600" />
                Popular Node Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {nodeTypes.map((nodeType, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {nodeType.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}