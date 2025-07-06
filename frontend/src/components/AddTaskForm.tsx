"use client";

import { useState } from 'react';
import { parseAIDeadline, formatDateForInput } from '@/lib/dateUtils';
import { AISuggestions } from '@/types';
import ImportTasks from './ImportTasks';

export default function AddTaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [priority, setPriority] = useState<number>(3);
  const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestions = async () => {
    if (!title) {
      setError("Please enter a title to get suggestions.");
      return;
    }
    setError(null);
    setIsFetchingSuggestions(true);
    setSuggestions(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/ai/suggestions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch AI suggestions.');
      }

      const data: AISuggestions = await res.json();
      setSuggestions(data);
      if (data.enhanced_description) {
        setDescription(data.enhanced_description);
      }
      if (data.suggested_deadline) {
        setDeadline(parseAIDeadline(data.suggested_deadline));
      }
      if (data.priority_score) {
        setPriority(data.priority_score);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError("Title is required to create a task.");
      return;
    }
    setError(null);
    setIsCreatingTask(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/tasks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          category_names: suggestions?.suggested_categories || [],
          deadline: deadline ? deadline.toISOString() : null,
        }),
      });

      if (!res.ok) throw new Error('Failed to create task.');

      setTitle('');
      setDescription('');
      setDeadline(null);
      setPriority(3);
      setSuggestions(null);

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsCreatingTask(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-4 border-b dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 sm:mb-0">Import or Add Manually</h3>
        <ImportTasks />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="e.g., Schedule team meeting for project update"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Add more details, or get AI suggestions..."
          />
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
          <input
            type="date"
            id="deadline"
            value={formatDateForInput(deadline)}
            onChange={(e) => setDeadline(e.target.value ? new Date(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority (1-5)</label>
          <input
            type="number"
            id="priority"
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value, 10))}
            min="1"
            max="5"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleGetSuggestions}
            disabled={isFetchingSuggestions || !title}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isFetchingSuggestions ? 'Getting Suggestions...' : '✨ Get AI Suggestions'}
          </button>
          <button
            type="submit"
            disabled={isCreatingTask || !title}
            className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCreatingTask ? 'Adding Task...' : 'Add Task'}
          </button>
        </div>

        {suggestions && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">AI Suggestions:</h4>
            <div className="mt-2 space-y-2">
              {suggestions.scheduling_suggestion && (
                <p className="text-sm text-indigo-600 dark:text-indigo-300 font-semibold">
                  <b>🗓️ When to do it:</b> {suggestions.scheduling_suggestion}
                </p>
              )}
              {suggestions.priority_score && <p className="text-sm text-gray-600 dark:text-gray-300"><b>Priority:</b> {suggestions.priority_score}</p>}
              {suggestions.suggested_deadline && <p className="text-sm text-gray-600 dark:text-gray-300"><b>Deadline:</b> {suggestions.suggested_deadline}</p>}
              {suggestions.suggested_categories && suggestions.suggested_categories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <b className="text-sm text-gray-600 dark:text-gray-300">Tags:</b>
                  {suggestions.suggested_categories.map(cat => (
                    <span key={cat} className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 rounded-full">{cat}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}