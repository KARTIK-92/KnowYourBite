import React from 'react';
import { Key, ShieldCheck, ExternalLink } from 'lucide-react';

interface ApiKeyInputProps {
  onConfigured: () => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onConfigured }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl mb-4">
            <Key className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Setup Gemini API</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            To power the AI features, this app requires a Google Gemini API Key.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 mb-6">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Please configure <code>process.env.API_KEY</code> in your environment variables. 
            Manual entry is disabled for security reasons.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center">
            <ShieldCheck className="h-4 w-4 mr-2 text-emerald-500" />
            Safe & Secure
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The API key must be managed securely via environment variables.
          </p>
          
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Get a free API Key from Google <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};