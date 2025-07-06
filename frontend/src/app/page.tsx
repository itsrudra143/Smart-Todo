"use client";

import { useState, useEffect, useMemo } from 'react';
import AddTaskForm from "@/components/AddTaskForm";
import TaskList from "@/components/TaskList";
import FilterControls, { Filters } from "@/components/FilterControls";
import ThemeSwitcher from '@/components/ThemeSwitcher';
import Modal from '@/components/Modal';
import TaskListHeader from '@/components/TaskListHeader';
import { Task } from "@/types";
import Link from 'next/link';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    status: 'all',
    priority: 'all',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function getTasks() {
      setIsLoading(true);
      try {
        const res = await fetch('http://127.0.0.1:8000/api/tasks/', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        } else {
          console.error(`Failed to fetch tasks: ${res.statusText}`);
          setTasks([]);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    }
    getTasks();
  }, []);

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete the task.');
      }

      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const categoryMatch = filters.category === 'all' || task.categories.some(c => c.name === filters.category);
      const statusMatch = filters.status === 'all' || task.status === filters.status;
      const priorityMatch = filters.priority === 'all' || task.priority.toString() === filters.priority;
      return categoryMatch && statusMatch && priorityMatch;
    });
  }, [tasks, filters]);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="w-full max-w-4xl mb-8 text-center relative">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Smart Todo List</h1>
        <p className="text-md sm:text-lg text-gray-500 dark:text-gray-400 mt-2">Your intelligent task manager</p>

        <div className="absolute top-0 right-0 flex items-center gap-4">
          <Link href="/context" className="hidden sm:inline-block px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
            + Add Context
          </Link>
          <ThemeSwitcher />
        </div>
      </header>

      <div className="w-full max-w-4xl space-y-6">
        <FilterControls onFilterChange={setFilters} />

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <TaskListHeader tasks={tasks} onAddTask={() => setIsModalOpen(true)} />
          {isLoading ? (
            <p className="text-lg text-center text-gray-500 dark:text-gray-400 py-8">Loading tasks...</p>
          ) : (
            <TaskList tasks={filteredTasks} onDeleteTask={handleDeleteTask} />
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add or Import Tasks">
        <AddTaskForm />
      </Modal>
    </main>
  );
}