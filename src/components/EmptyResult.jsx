/**
 * 결과 없음 박스(실선 카드, UI 체크리스트 27)
 * - 아래 버튼(children)이 있으면: 아이콘 → 16 → 제목 → 8 → 설명 → 32 → 버튼 (※신규 정책)
 * - 버튼이 없으면: 아이콘·설명 없이 제목만 한 줄(보조 글자색) (※신규 정책)
 * isCompact: 카드 안 작은 자리용. 높이를 내용에 맞추고(기본은 안쪽 320px) 위아래 여백을 줄인다
 */
export default function EmptyResult({
  icon,
  title,
  description,
  isCompact = false,
  children,
}) {
  const hasAction = children != null && children !== false;
  return (
    <div
      className={`rounded-[14px] border border-line bg-white px-6 ${isCompact ? 'py-10' : 'py-14'}`}
    >
      <div
        className={`flex flex-col items-center justify-center text-center ${isCompact ? '' : 'h-[320px]'}`}
      >
        {hasAction ? (
          <>
            {icon && <div className="mb-4 flex text-line-strong">{icon}</div>}
            <p className="text-lg font-medium text-heading">{title}</p>
            {description && (
              <p className="mt-2 text-base text-muted">{description}</p>
            )}
            <div className="mt-8">{children}</div>
          </>
        ) : (
          <p className="text-base text-muted">{title}</p>
        )}
      </div>
    </div>
  );
}
