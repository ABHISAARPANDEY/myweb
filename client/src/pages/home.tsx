import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MonacoEditor } from '@/components/ui/monaco-editor';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
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
  Loader2Icon
} from 'lucide-react';
import type { WorkflowResponse } from '@shared/schema';

export default function Home() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [includeAuth, setIncludeAuth] = useState(false);
  const [includeErrorHandling, setIncludeErrorHandling] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<WorkflowResponse | null>(null);

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
    mutationFn: async (data: { prompt: string; includeAuth: boolean; includeErrorHandling: boolean }) => {
      const response = await apiRequest('POST', '/api/workflows/generate', data);
      return response.json();
    },
    onSuccess: (data: WorkflowResponse) => {
      setGeneratedWorkflow(data);
      toast({
        title: "Workflow Generated Successfully",
        description: `Generated "${data.name}" with ${data.nodeCount} nodes`,
      });
    },
    onError: (error: any) => {
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

  const handleCopyJson = () => {
    if (generatedWorkflow) {
      navigator.clipboard.writeText(JSON.stringify(generatedWorkflow.workflowJson, null, 2));
      toast({
        title: "JSON Copied",
        description: "Workflow JSON has been copied to clipboard",
      });
    }
  };

  const handleDownload = () => {
    if (generatedWorkflow) {
      const blob = new Blob([JSON.stringify(generatedWorkflow.workflowJson, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedWorkflow.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getNodeIcon = (nodeType: string) => {
    if (nodeType.includes('webhook')) return <PlayIcon className="w-5 h-5 text-green-600" />;
    if (nodeType.includes('set') || nodeType.includes('edit')) return <FilterIcon className="w-5 h-5 text-purple-600" />;
    if (nodeType.includes('email')) return <MailIcon className="w-5 h-5 text-blue-600" />;
    if (nodeType.includes('respond')) return <ReplyIcon className="w-5 h-5 text-gray-600" />;
    return <NetworkIcon className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <NetworkIcon className="text-orange-500 w-8 h-8" />
                <span className="text-xl font-bold text-gray-900">n8n Workflow Generator</span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-orange-500 font-medium">Home</a>
              <a href="#" className="text-gray-700 hover:text-orange-500 font-medium">Examples</a>
              <a href="#" className="text-gray-700 hover:text-orange-500 font-medium">Documentation</a>
              <a href="#" className="text-gray-700 hover:text-orange-500 font-medium">Support</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Examples */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Lightbulb className="w-5 h-5 text-purple-600 mr-2" />
                  Quick Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {examples.slice(0, 5).map((example: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                        {example.split(' ').slice(0, 4).join(' ')}...
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {example.includes('email') && 'Email notification'}
                        {example.includes('Slack') && 'Slack integration'}
                        {example.includes('Airtable') && 'Data sync'}
                        {example.includes('weather') && 'API integration'}
                        {example.includes('Trello') && 'Task management'}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Node Types Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <PuzzleIcon className="w-5 h-5 text-purple-600 mr-2" />
                  Popular Node Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {nodeTypes.slice(0, 6).map((nodeType: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{nodeType.name}</span>
                      <Badge variant={nodeType.category === 'Trigger' ? 'default' : nodeType.category === 'Action' ? 'secondary' : 'outline'}>
                        {nodeType.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-500 to-purple-600 rounded-xl p-8 mb-8 text-white">
              <h1 className="text-3xl font-bold mb-3">Generate n8n Workflows with AI</h1>
              <p className="text-lg opacity-90 mb-6">
                Describe your automation needs in plain English, and we'll create a complete n8n workflow JSON for you to import directly.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="text-sm">No technical knowledge required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DownloadIcon className="w-5 h-5" />
                  <span className="text-sm">One-click download</span>
                </div>
              </div>
            </div>

            {/* Prompt Input Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <WandSparkles className="w-6 h-6 text-orange-500 mr-2" />
                  Describe Your Automation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Example: Send me an email when someone fills out my contact form on my website..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includeAuth" 
                          checked={includeAuth}
                          onCheckedChange={setIncludeAuth}
                        />
                        <label htmlFor="includeAuth" className="text-sm text-gray-600">
                          Include authentication setup
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includeErrorHandling" 
                          checked={includeErrorHandling}
                          onCheckedChange={setIncludeErrorHandling}
                        />
                        <label htmlFor="includeErrorHandling" className="text-sm text-gray-600">
                          Add error handling
                        </label>
                      </div>
                    </div>
                    <Button 
                      onClick={handleGenerate}
                      disabled={generateMutation.isPending}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <WrenchIcon className="w-4 h-4 mr-2" />
                          Generate Workflow
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generated Workflow Output */}
            {generatedWorkflow && (
              <div className="space-y-6">
                {/* Workflow Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <InfoIcon className="w-5 h-5 text-blue-500 mr-2" />
                      Generated Workflow Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-blue-900 mb-2">{generatedWorkflow.name}</h4>
                      <p className="text-blue-800 text-sm">{generatedWorkflow.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Trigger Type</div>
                        <div className="font-medium text-gray-900">{generatedWorkflow.triggerType}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Total Nodes</div>
                        <div className="font-medium text-gray-900">{generatedWorkflow.nodeCount}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Estimated Setup Time</div>
                        <div className="font-medium text-gray-900">{generatedWorkflow.estimatedSetupTime}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Workflow Visualization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <NetworkIcon className="w-5 h-5 text-purple-600 mr-2" />
                      Workflow Flow
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center space-x-4 overflow-x-auto pb-4">
                      {generatedWorkflow.nodes.map((node: any, index: number) => (
                        <div key={node.id} className="flex items-center space-x-4 min-w-max">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              {getNodeIcon(node.type)}
                            </div>
                            <span className="text-sm font-medium text-gray-900 text-center max-w-20">
                              {node.name}
                            </span>
                            <span className="text-xs text-gray-500 text-center">
                              {node.type.split('.').pop()}
                            </span>
                          </div>
                          {index < generatedWorkflow.nodes.length - 1 && (
                            <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* JSON Output */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-lg">
                        <CodeIcon className="w-5 h-5 text-purple-600 mr-2" />
                        Generated Workflow JSON
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyJson}
                        >
                          <CopyIcon className="w-4 h-4 mr-2" />
                          Copy JSON
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleDownload}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <DownloadIcon className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <MonacoEditor
                      value={JSON.stringify(generatedWorkflow.workflowJson, null, 2)}
                      readOnly
                      height="400px"
                    />
                  </CardContent>
                </Card>

                {/* Setup Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <WrenchIcon className="w-5 h-5 text-amber-500 mr-2" />
                      Setup Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {generatedWorkflow.setupInstructions.map((instruction: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{instruction}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">n8n Workflow Generator</h4>
              <p className="text-gray-600 text-sm">
                Create powerful automation workflows using simple English descriptions. No technical knowledge required.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Resources</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-orange-500">Documentation</a></li>
                <li><a href="#" className="hover:text-orange-500">API Reference</a></li>
                <li><a href="#" className="hover:text-orange-500">Examples</a></li>
                <li><a href="#" className="hover:text-orange-500">Templates</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Support</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-orange-500">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-500">Community</a></li>
                <li><a href="#" className="hover:text-orange-500">Contact</a></li>
                <li><a href="#" className="hover:text-orange-500">Bug Report</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-orange-500">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-orange-500">Terms of Service</a></li>
                <li><a href="#" className="hover:text-orange-500">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2025 n8n Workflow Generator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
