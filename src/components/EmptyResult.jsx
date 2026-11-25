/**
 * 결과 없음 박스: 문구, 보조 문구, 아래 버튼(children)을 가운데 쌓기(실선 카드, UI 체크리스트 27)
 * isCompact: 카드 안 작은 자리용. 높이를 내용에 맞추고(기본은 안쪽 320px) 위아래 여백·간격을 줄인다
 * isUnified: 통일 디자인(커뮤니티·고객센터에서 먼저 쓴다)
 *   - 아이콘(#b9c4c4) → 16px → 제목(18px medium) → 8px → 설명(16px) → 32px → 버튼
 *   - 아이콘·설명·버튼이 모두 없으면 제목을 가운데 한 줄(16px regular)로만 보인다(버튼 없는 경우)
 *   - 버튼은 호출부의 기존 스타일을 그대로 쓰고, 버튼 아래에는 글자를 두지 않는다
 */
export default function EmptyResult({
  icon,
  title,
  description,
  isCompact = false,
  isUnified = false,
  children,
}) {
  const boxClass = `rounded-[14px] border border-line bg-white px-6 ${isCompact ? 'py-10' : 'py-14'}`;

  if (isUnified) {
    const hasMore = Boolean(icon || description || children);
    return (
      <div className={boxClass}>
        <div
          className={`flex flex-col items-center justify-center text-center ${isCompact ? '' : 'h-[320px]'}`}
        >
          {hasMore ? (
            <>
              {icon && <div className="mb-4 text-line-strong">{icon}</div>}
              <p className="text-lg font-medium text-ink">{title}</p>
              {description && (
                <p className="mt-2 text-base text-muted">{description}</p>
              )}
              {children && <div className="mt-8">{children}</div>}
            </>
          ) : (
            <p className="text-base text-muted">{title}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={boxClass}>
      <div
        className={`flex flex-col items-center justify-center text-center ${isCompact ? 'gap-4' : 'h-[320px] gap-8'}`}
      >
        <div className="flex flex-col items-center gap-2 text-muted">
          {icon}
          <p className="text-lg">{title}</p>
          {description && <p className="text-base">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
