"use client";

import { Task } from '@/types';
import Papa from 'papaparse';
import ImportTasks from './ImportTasks';

interface DataControlsProps {
  tasks: Task[];
}

export default function DataControls({ tasks }: DataControlsProps) {
  const handleExport = () => {
    if (tasks.length === 0) {
      alert("No tasks to export.");
      return;
    }

    const tasksToExport = tasks.map(task => ({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      categories: task.categories.map(c => c.name).join(','),
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
    }));

    const csv = Papa.unparse(tasksToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-4xl mb-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-end items-center gap-4">
        <ImportTasks />
        <button
          onClick={handleExport}
          className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
          disabled={tasks.length === 0}
        >
          Export to CSV
        </button>
      </div>
    </div>
  );
} 