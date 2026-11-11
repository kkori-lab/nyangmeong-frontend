/** 번호 원 + 제목 + 설명이 이어지는 안내 목록(실종 체크 가이드 등) */
export default function CheckList({ items }) {
  return (
    <ol>
      {items.map(([title, description], index) => (
        <li
          key={title}
          className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-2.5 gap-y-0.5 border-t border-line py-3.5 first:border-t-0 first:pt-1"
        >
          <span
            aria-hidden="true"
            className="row-span-2 grid size-7 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-600"
          >
            {index + 1}
          </span>
          <b className="font-semibold text-ink">{title}</b>
          <p className="text-sm leading-[1.6] text-muted">{description}</p>
        </li>
      ))}
    </ol>
  );
}
