import { CircleAlert } from 'lucide-react';

export function Required() {
  return (
    <span aria-hidden="true" className="ml-0.5 font-bold text-danger">
      *
    </span>
  );
}

export function FieldError({ message, id }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="flex items-center gap-1 text-sm text-danger"
    >
      <CircleAlert size={14} aria-hidden="true" />
      {message}
    </p>
  );
}

export function Counter({ value, max }) {
  return (
    <span className="text-xs text-muted">
      {value.length.toLocaleString()} / {max.toLocaleString()}
    </span>
  );
}

export function Section({ number, title, children }) {
  return (
    <div className="flex flex-col gap-9 border-t border-line py-7 first:border-t-0 first:pt-5">
      <h3 className="flex items-center gap-2.5 text-lg font-bold text-ink">
        <span
          aria-hidden="true"
          className="grid size-[26px] place-items-center rounded-full bg-brand-500 text-sm text-white"
        >
          {number}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}
