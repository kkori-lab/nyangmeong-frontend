import { ROW_BTN } from '../shared/profileStyles';

/**
 * 항목명 | 값 | 오른쪽 끝 버튼 한 줄. isEditing이면 값과 버튼 자리에 children(입력 영역)이 펼쳐짐.
 * actionLabel이 없으면 조회 전용 줄
 */
export default function AccountRow({
  label,
  value,
  actionLabel,
  isEditing = false,
  onEdit,
  children,
}) {
  return (
    <div
      className={`grid min-h-16 grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 border-t border-line-soft px-5 py-3 first:border-t-0 sm:grid-cols-[140px_minmax(0,1fr)_auto] sm:px-8 max-[760px]:min-h-14 max-[760px]:grid-cols-[84px_minmax(0,1fr)_auto] max-[760px]:gap-x-3 max-[760px]:py-2.5 ${
        isEditing ? 'items-start' : 'items-center'
      }`}
    >
      <span
        className={`col-span-full text-sm text-muted sm:col-span-1 sm:text-base ${
          isEditing
            ? 'max-[760px]:col-span-full sm:pt-[18px] max-[760px]:sm:pt-0'
            : 'max-[760px]:col-span-1'
        }`}
      >
        {label}
      </span>
      {isEditing ? (
        <div className="col-span-full flex max-w-[440px] flex-col gap-3 py-2 sm:col-span-2 sm:col-start-2 max-[760px]:col-span-full max-[760px]:col-start-1">
          {children}
        </div>
      ) : (
        <>
          <span className="min-w-0 font-medium">{value}</span>
          {actionLabel && (
            <button type="button" onClick={onEdit} className={ROW_BTN}>
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}
