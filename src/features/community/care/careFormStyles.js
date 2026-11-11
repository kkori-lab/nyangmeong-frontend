export const TEXTAREA_BASE =
  'block w-full rounded-md border bg-white px-3 text-base placeholder:text-placeholder hover:border-line-strong focus:border-brand-500 focus:outline-none focus:ring-focus';
export const INPUT_CLASS = `${TEXTAREA_BASE} h-10`;
export const LABEL_CLASS =
  'flex items-center gap-0.5 text-base leading-[1.4] font-semibold text-ink';

export const borderOf = (error) =>
  error ? 'border-danger' : 'border-input-line';
