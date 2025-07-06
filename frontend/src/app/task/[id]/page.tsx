"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Task, AISuggestions } from '@/types';
import { parseAIDeadline, formatDateForInput } from '@/lib/dateUtils';

export default function TaskEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [task, setTask] = useState<Task | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchTask = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`http://127.0.0.1:8000/api/tasks/${id}/`);
          if (!res.ok) {
            throw new Error('Task not found or failed to fetch.');
          }
          const data = await res.json();
          setTask(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchTask();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (task) {
      const parsedValue = name === 'priority' ? parseInt(value, 10) : value;
      setTask({ ...task, [name]: parsedValue });
    }
  };

  const handleGetSuggestions = async () => {
    if (!task) return;
    setIsFetchingSuggestions(true);
    setSuggestions(null);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/ai/suggestions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task.title, description: task.description }),
      });
      if (!res.ok) throw new Error('Failed to get AI suggestions.');

      const aiData: AISuggestions = await res.json();
      setSuggestions(aiData);

      const newDeadline = parseAIDeadline(aiData.suggested_deadline);

      setTask(prevTask => ({
        ...prevTask!,
        description: aiData.enhanced_description || prevTask!.description,
        priority: aiData.priority_score || prevTask!.priority,
        categories: aiData.suggested_categories?.map((name: string) => ({ id: name, name, usage_count: 0 })) || prevTask!.categories,
        deadline: newDeadline ? newDeadline.toISOString() : prevTask!.deadline,
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!task) return;
    setError(null);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/tasks/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          category_names: task.categories.map(c => c.name),
          deadline: task.deadline,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(JSON.stringify(errorData) || 'Failed to update the task.');
      }
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/tasks/${id}/`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete the task.');
        router.push('/');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete task.');
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-700 dark:text-gray-300">Loading task details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!task) return <div className="p-8 text-center text-gray-700 dark:text-gray-300">No task data found.</div>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Edit Task</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              value={task.title}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              name="description"
              id="description"
              value={task.description || ''}
              onChange={handleInputChange}
              rows={5}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGetSuggestions}
              disabled={isFetchingSuggestions}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
            >
              {isFetchingSuggestions ? 'Getting Suggestions...' : '✨ Get AI Suggestions to Improve Task'}
            </button>
          </div>
          {suggestions && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
              <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">AI Suggestions have been applied:</h4>
              <div className="mt-2 space-y-2">
                {suggestions.scheduling_suggestion && (
                  <p className="text-sm text-indigo-600 dark:text-indigo-300 font-semibold">
                    <b>🗓️ When to do it:</b> {suggestions.scheduling_suggestion}
                  </p>
                )}
                {suggestions.suggested_deadline && <p className="text-sm text-gray-600 dark:text-gray-300"><b>Suggested Deadline:</b> {suggestions.suggested_deadline}</p>}
                {suggestions.suggested_categories && suggestions.suggested_categories.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <b>Suggested Tags:</b> {suggestions.suggested_categories.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categories</label>
            <div className="mt-2 flex flex-wrap items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/60 rounded-md border dark:border-gray-600 min-h-[40px]">
              {task.categories.length > 0 ? (
                task.categories.map(category => (
                  <span key={category.id} className="px-2.5 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full">
                    {category.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">No categories.</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                name="status"
                id="status"
                value={task.status}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
              <input
                type="number"
                name="priority"
                id="priority"
                value={task.priority}
                onChange={handleInputChange}
                min="1"
                max="5"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
            <input
              type="date"
              name="deadline"
              id="deadline"
              value={task.deadline ? formatDateForInput(new Date(task.deadline)) : ''}
              onChange={(e) => {
                if (task) {
                  setTask({
                    ...task,
                    deadline: e.target.value ? new Date(e.target.value).toISOString() : null,
                  });
                }
              }}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={handleDeleteTask}
              className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Task
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </div>
        <button onClick={() => router.push('/')} className="mt-6 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
          &larr; Back to Dashboard
        </button>
      </div>
    </main>
  );
} 