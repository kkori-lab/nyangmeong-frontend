/**
 * [대시보드 작은 표]
 * - columns: [{ key, label, className, render(row) }], onSelect가 있으면 행을 눌러 이동
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function DashboardTable({
  columns,
  rows,
  rowKey,
  onSelect,
  emptyText,
}) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-base text-subtle">{emptyText}</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-base">
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {columns.map(({ key, label, className = '' }) => (
              <th
                key={key}
                scope="col"
                className={`px-3 py-2 font-semibold ${className}`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              tabIndex={onSelect ? 0 : undefined}
              className={`border-b border-line text-ink-2 last:border-b-0 ${
                onSelect ? 'cursor-pointer hover:bg-surface-2' : ''
              }`}
              onClick={onSelect && (() => onSelect(row))}
              onKeyDown={
                onSelect &&
                ((event) => {
                  if (event.key === 'Enter') onSelect(row);
                })
              }
            >
              {columns.map(({ key, className = '', render }) => (
                <td key={key} className={`px-3 py-2.5 ${className}`}>
                  {render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
