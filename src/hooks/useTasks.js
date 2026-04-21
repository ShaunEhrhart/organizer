import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getCachedTasks, cacheTasks } from '../lib/offline';
import { scheduleDueNotifications } from '../lib/notifications';

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setTasks(data);
      cacheTasks(data);
      scheduleDueNotifications(data);
    } catch {
      setTasks(getCachedTasks());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function addTask({ title, due_date, priority, project }) {
    const newTask = {
      user_id: user.id,
      title,
      due_date: due_date || null,
      priority,
      project,
      completed: false,
    };

    const { data, error } = await supabase.from('tasks').insert(newTask).select().single();
    if (error) throw error;
    setTasks((prev) => [...prev, data]);
    cacheTasks([...tasks, data]);
    return data;
  }

  async function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', id);

    if (error) throw error;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  async function deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return { tasks, loading, addTask, toggleTask, deleteTask, refetch: fetchTasks };
}
