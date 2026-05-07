import React from 'react';
import { Shield } from 'lucide-react';

const License = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">License</h1>
      </div>

      <div className="bg-card text-card-foreground p-8 rounded-xl border border-border shadow-sm">
        <div className="prose dark:prose-invert max-w-none">
          <h2 className="text-xl font-bold mb-4">MIT License</h2>
          <p className="text-muted-foreground mb-4">Copyright (c) 2026 Natapradja Project</p>
          
          <div className="bg-muted p-6 rounded-lg font-mono text-sm leading-relaxed border border-border whitespace-pre-wrap">
{`Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
          </div>
        </div>
      </div>

      <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 text-sm text-blue-800 dark:text-blue-300">
        <p className="font-semibold mb-2">About this license:</p>
        <p>
          The MIT License is a permissive free software license originating at the Massachusetts Institute of Technology (MIT). 
          As a permissive license, it puts only very limited restriction on reuse and has, therefore, high license compatibility.
        </p>
      </div>
    </div>
  );
};

export default License;
