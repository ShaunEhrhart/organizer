const PROJECTS = ['All', 'SoonerSites', 'Vigil', 'Research', 'School', 'Personal'];

export default function ProjectFilter({ value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {PROJECTS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p === 'All' ? null : p)}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
            (p === 'All' && !value) || value === p
              ? 'bg-accent text-white'
              : 'bg-surface text-gray-400 hover:text-gray-200'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

export { PROJECTS };
