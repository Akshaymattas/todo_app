const OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export default function FilterBar({ filter, onChange, completedCount, onClearCompleted }) {
  return (
    <div className="filter-bar">
      <div className="filters" role="tablist">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            role="tab"
            aria-selected={filter === opt.value}
            className={`filter-btn${filter === opt.value ? ' active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {completedCount > 0 && (
        <button className="link-btn" onClick={onClearCompleted}>
          Clear completed
        </button>
      )}
    </div>
  );
}
