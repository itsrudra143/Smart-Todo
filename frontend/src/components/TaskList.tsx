import { Task } from "@/types";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
}

export default function TaskList({ tasks, onDeleteTask }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-8">No tasks found. Try adjusting your filters!</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
      ))}
    </ul>
  );
} 