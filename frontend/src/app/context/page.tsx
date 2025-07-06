"use client";

import { useState, useEffect, useCallback } from 'react';
import { ContextEntry } from "@/types";
import ContextEntryForm from "@/components/ContextEntryForm";
import Link from 'next/link';

const sentimentStyles = {
  positive: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200',
  negative: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export default function ContextPage() {
  const [entries, setEntries] = useState<ContextEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getContextEntries = useCallback(async () => {
    // We don't want the loading state on every refresh
    // setIsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/context/');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error(error);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getContextEntries();
  }, [getContextEntries]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <p className="text-lg text-gray-500 dark:text-gray-400">Loading Context...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-4xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">Context Hub</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">Add notes, emails, and ideas for smarter AI suggestions.</p>
        </header>

        {/* --- Form for adding new context --- */}
        <ContextEntryForm onEntryAdded={getContextEntries} />

        {/* --- List of historical entries --- */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">Historical Context</h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
            {entries.length > 0 ? (
              entries.map(entry => (
                <div key={entry.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{entry.content}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                  {/* --- Display AI Insights --- */}
                  {entry.insights && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">AI Insights</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sentiment:</span>
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${sentimentStyles[entry.insights.sentiment] || sentimentStyles.neutral}`}>
                          {entry.insights.sentiment}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Keywords:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {entry.insights.keywords.map((keyword) => (
                            <span key={keyword} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900 dark:text-blue-200">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No context entries yet.</p>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}