import { Task } from "@/types";
import Link from 'next/link';

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
}

export default function TaskCard({ task, onDelete }: TaskCardProps) {
  const statusText = task.status.replace('_', ' ').toLowerCase();

  const formattedDeadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
    : null;

  return (
    <li className="p-3 rounded-lg transition-colors bg-gray-50 dark:bg-gray-700/50">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{task.title}</h3>
          {task.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{task.description}</p>
          )}

          {task.categories && task.categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {task.categories.map(category => (
                <span key={category.id} className="px-2.5 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full">
                  {category.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 gap-2">
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${task.priority > 3
                ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                }`}>
                Priority: {task.priority}
              </span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{statusText}</span>
            </div>
            {formattedDeadline && (
              <div className="text-sm text-right font-semibold text-gray-600 dark:text-gray-300">
                Due: {formattedDeadline}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 -mr-1">
          <Link href={`/task/${task.id}`} className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Edit task">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
            </svg>
          </Link>
          <button onClick={() => onDelete(task.id)} className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Delete task">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
}