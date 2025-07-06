"use client";

import Papa from 'papaparse';
import { Task } from '@/types';

interface TaskListHeaderProps {
  tasks: Task[];
  onAddTask: () => void;
}

export default function TaskListHeader({ tasks, onAddTask }: TaskListHeaderProps) {
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
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-4 border-b dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 sm:mb-0">Your Tasks</h2>
      <div className="flex items-center gap-4">
        <button
          onClick={handleExport}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
          disabled={tasks.length === 0}
        >
          Export to CSV
        </button>
        <button
          onClick={onAddTask}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + Add New Task
        </button>
      </div>
    </div>
  );
} 