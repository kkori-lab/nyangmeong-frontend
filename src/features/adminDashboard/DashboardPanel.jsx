/** [대시보드 카드]: 제목 줄 + 본문 */
export default function DashboardPanel({
  title,
  sub,
  className = '',
  children,
}) {
  return (
    <section
      className={`flex min-w-0 flex-col rounded-[14px] border border-line bg-white ${className}`}
    >
      <h3 className="flex items-baseline gap-2 border-b border-line px-5 py-3 text-base font-bold text-ink">
        {title}
        {sub && (
          <small className="text-sm font-medium text-subtle">{sub}</small>
        )}
      </h3>
      <div className="flex-1 px-5 py-4">{children}</div>
    </section>
  );
}
