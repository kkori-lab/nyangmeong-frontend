import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/** 한눈에 보기 칸: 이름 › + 큰 숫자. 아이콘(왼쪽)·아래 덧붙임(진행률 바 등)은 선택 */
export default function StatLink({
  to,
  label,
  value,
  unit,
  icon,
  iconDesktopOnly = false,
  emphasis = false,
  note,
  footer,
}) {
  return (
    <Link
      to={to}
      className="group flex min-w-0 items-center gap-4 px-5 py-4 hover:bg-surface-2 min-[1100px]:p-6"
    >
      {icon && (
        <span
          className={`size-10 shrink-0 place-items-center rounded-box bg-warn-soft text-warn min-[1100px]:size-12 min-[1100px]:rounded-card ${
            iconDesktopOnly ? 'hidden min-[1100px]:grid' : 'grid'
          }`}
        >
          {icon}
        </span>
      )}
      <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 min-[1100px]:grid-cols-1 min-[1100px]:items-start">
        <span className="flex items-center gap-0.5 font-medium text-muted">
          {label}
          <ChevronRight className="size-[18px] text-line-strong group-hover:text-brand-500" />
        </span>
        <span className="font-semibold text-ink-2">
          <b
            className={`mr-0.5 text-2xl leading-tight font-bold tracking-[-0.02em] tabular-nums min-[1100px]:text-[28px] ${
              emphasis ? 'text-brand-600' : 'text-ink'
            }`}
          >
            {value ?? '-'}
          </b>
          {value != null && unit}
          {note && (
            <small className="block text-sm font-medium text-subtle">
              {note}
            </small>
          )}
        </span>
        {footer && <span className="col-span-full">{footer}</span>}
      </span>
    </Link>
  );
}
