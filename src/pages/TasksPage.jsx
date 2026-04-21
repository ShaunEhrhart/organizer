import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import ProjectFilter, { PROJECTS } from '../components/ProjectFilter';
import { requestNotificationPermission } from '../lib/notifications';

const PRIORITIES = ['high', 'medium', 'low'];
const PROJECT_OPTIONS = PROJECTS.filter((p) => p !== 'All');

export default function TasksPage() {
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks();
  const { signOut } = useAuth();
  const [filter, setFilter] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', due_date: '', priority: 'medium', project: 'Personal' });

  const filtered = filter ? tasks.filter((t) => t.project === filter) : tasks;
  const incomplete = filtered.filter((t) => !t.completed);
  const completed = filtered.filter((t) => t.completed);

  async function handleAdd(e) {
    e.preventDefault();
    await addTask(form);
    setForm({ title: '', due_date: '', priority: 'medium', project: 'Personal' });
    setShowForm(false);
    requestNotificationPermission();
  }

  if (loading) {
    return <div className="text-center text-gray-400 mt-12">Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Tasks</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-accent hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add'}
          </button>
          <button
            onClick={signOut}
            className="text-gray-400 hover:text-gray-200 px-2 py-1 text-sm"
          >
            Sign out
          </button>
        </div>
      </div>

      <ProjectFilter value={filter} onChange={setFilter} />

      {showForm && (
        <form onSubmit={handleAdd} className="bg-surface rounded-xl p-4 space-y-3">
          <input
            type="text"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full"
            required
          />
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            className="w-full"
          />
          <div className="flex gap-3">
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="flex-1"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <select
              value={form.project}
              onChange={(e) => setForm({ ...form, project: e.target.value })}
              className="flex-1"
            >
              {PROJECT_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-accent hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add Task
          </button>
        </form>
      )}

      <div className="space-y-2">
        {incomplete.map((task) => (
          <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
        ))}
      </div>

      {completed.length > 0 && (
        <details className="mt-4">
          <summary className="text-gray-400 text-sm cursor-pointer">
            Completed ({completed.length})
          </summary>
          <div className="space-y-2 mt-2">
            {completed.map((task) => (
              <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        </details>
      )}

      {incomplete.length === 0 && completed.length === 0 && (
        <p className="text-gray-500 text-center mt-8">No tasks yet</p>
      )}
    </div>
  );
}

const priorityColors = {
  high: 'border-red-500',
  medium: 'border-yellow-500',
  low: 'border-green-500',
};

function TaskCard({ task, onToggle, onDelete }) {
  return (
    <div className={`bg-surface rounded-xl p-3 flex items-start gap-3 border-l-4 ${priorityColors[task.priority] || 'border-gray-600'}`}>
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
          task.completed ? 'bg-accent border-accent' : 'border-gray-500 hover:border-accent'
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </p>
        <div className="flex gap-2 mt-1 text-xs text-gray-400">
          {task.due_date && <span>{task.due_date}</span>}
          <span className="bg-gray-700 px-1.5 rounded">{task.project}</span>
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-gray-500 hover:text-red-400 text-sm flex-shrink-0"
      >
        ×
      </button>
    </div>
  );
}
