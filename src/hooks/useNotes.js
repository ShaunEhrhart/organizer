import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getCachedNotes, cacheNotes } from '../lib/offline';

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data);
      cacheNotes(data);
    } catch {
      setNotes(getCachedNotes());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  async function addNote({ title, body, project }) {
    const newNote = {
      user_id: user.id,
      title,
      body,
      project,
    };

    const { data, error } = await supabase.from('notes').insert(newNote).select().single();
    if (error) throw error;
    setNotes((prev) => [data, ...prev]);
    return data;
  }

  async function updateNote(id, updates) {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setNotes((prev) => prev.map((n) => (n.id === id ? data : n)));
    return data;
  }

  async function deleteNote(id) {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return { notes, loading, addNote, updateNote, deleteNote, refetch: fetchNotes };
}
