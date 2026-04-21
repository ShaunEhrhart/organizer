import { useState } from 'react';
import { useNotes } from '../hooks/useNotes';
import ProjectFilter, { PROJECTS } from '../components/ProjectFilter';

const PROJECT_OPTIONS = PROJECTS.filter((p) => p !== 'All');

export default function NotesPage() {
  const { notes, loading, addNote, updateNote, deleteNote } = useNotes();
  const [filter, setFilter] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', body: '', project: 'Personal' });

  const filtered = filter ? notes.filter((n) => n.project === filter) : notes;

  function startEdit(note) {
    setEditing(note.id);
    setForm({ title: note.title, body: note.body, project: note.project });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editing) {
      await updateNote(editing, form);
      setEditing(null);
    } else {
      await addNote(form);
    }
    setForm({ title: '', body: '', project: 'Personal' });
    setShowForm(false);
  }

  function handleCancel() {
    setShowForm(false);
    setEditing(null);
    setForm({ title: '', body: '', project: 'Personal' });
  }

  if (loading) {
    return <div className="text-center text-gray-400 mt-12">Loading notes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Notes</h1>
        <button
          onClick={() => (showForm ? handleCancel() : setShowForm(true))}
          className="bg-accent hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      <ProjectFilter value={filter} onChange={setFilter} />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-xl p-4 space-y-3">
          <input
            type="text"
            placeholder="Note title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full"
            required
          />
          <textarea
            placeholder="Write your note..."
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full min-h-[120px] resize-y"
            rows={4}
          />
          <select
            value={form.project}
            onChange={(e) => setForm({ ...form, project: e.target.value })}
            className="w-full"
          >
            {PROJECT_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full bg-accent hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {editing ? 'Update Note' : 'Add Note'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {filtered.map((note) => (
          <div key={note.id} className="bg-surface rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{note.title}</h3>
                <p className="text-gray-400 text-sm mt-1 whitespace-pre-wrap line-clamp-3">
                  {note.body}
                </p>
                <span className="inline-block bg-gray-700 px-1.5 rounded text-xs text-gray-400 mt-2">
                  {note.project}
                </span>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => startEdit(note)}
                  className="text-gray-500 hover:text-accent text-sm px-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-gray-500 hover:text-red-400 text-sm px-1"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-500 text-center mt-8">No notes yet</p>
      )}
    </div>
  );
}
