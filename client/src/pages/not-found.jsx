import React from 'react';
import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { HomeIcon, ArrowLeftIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Page Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <HomeIcon className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}