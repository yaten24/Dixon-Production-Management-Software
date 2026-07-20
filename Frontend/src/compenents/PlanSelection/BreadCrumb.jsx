import { ChevronRight } from 'lucide-react';

const items = ['Dashboard', 'Production Planning', 'Create Plan'];

export default function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-1.5">
          <span className={i === items.length - 1 ? 'font-medium text-slate-900' : ''}>
            {item}
          </span>
          {i < items.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
        </span>
      ))}
    </nav>
  );
}