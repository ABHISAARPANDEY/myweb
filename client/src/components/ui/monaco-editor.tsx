import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
  className?: string;
}

export function MonacoEditor({ 
  value, 
  onChange, 
  language = 'json', 
  height = '400px', 
  readOnly = false,
  className 
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // For now, we'll use a simple pre element with syntax highlighting
    // In a real implementation, you would integrate Monaco Editor here
    if (editorRef.current) {
      editorRef.current.innerHTML = `<pre class="text-sm text-gray-100 overflow-auto p-4 bg-gray-900 rounded-lg" style="height: ${height}"><code>${JSON.stringify(JSON.parse(value || '{}'), null, 2)}</code></pre>`;
    }
  }, [value, height]);

  return (
    <div className={cn("w-full", className)}>
      <div ref={editorRef} />
    </div>
  );
}
