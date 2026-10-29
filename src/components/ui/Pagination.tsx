import { ArrowLeft, ArrowRight } from 'lucide-react';
export function Pagination({
  page,
  count,
  pageSize = 24,
  onChange,
}: {
  page: number;
  count: number;
  pageSize?: number;
  onChange: (page: number) => void;
}) {
  const total = Math.max(1, Math.ceil(count / pageSize));
  if (total < 2) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="button button-outline"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <ArrowLeft size={16} />
        Previous
      </button>
      <span>
        Page {page} of {total}
      </span>
      <button
        className="button button-outline"
        disabled={page >= total}
        onClick={() => onChange(page + 1)}
      >
        Next
        <ArrowRight size={16} />
      </button>
    </nav>
  );
}
