import { createElement, useId } from 'react';

// 제목 줄(제목·보조 글·오른쪽 동작) + 본문으로 이뤄진 카드. 퍼블리싱 시안의 .card와 같은 모양이다
// leading은 제목 왼쪽에 두는 선택 요소(예: 반려동물 셀렉트)다
export default function Card({
  as: headingTag = 'h2',
  title,
  sub,
  leading,
  action,
  onHeaderClick,
  className = '',
  bodyClassName = '',
  children,
}) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={`flex min-w-0 flex-col rounded-[14px] border border-[#e2e7e7] bg-white shadow-[0_1px_2px_rgba(26,50,52,0.04)] ${className}`}
    >
      {/* onHeaderClick은 마우스용 보조. 키보드는 action 안의 버튼으로 같은 동작을 한다 */}
      <div
        onClick={onHeaderClick}
        className={`flex min-w-0 items-center justify-between gap-3 border-b border-[#edf1f1] px-[18px] py-4 sm:px-[22px] sm:py-[18px] ${
          onHeaderClick ? 'cursor-pointer' : ''
        } ${leading ? 'flex-wrap' : ''}`}
      >
        {leading}
        {createElement(
          headingTag,
          {
            className:
              'flex min-w-0 flex-1 items-baseline gap-2 text-lg/[1.6] font-bold tracking-[-0.01em] text-[#1a3234]',
          },
          <span id={titleId} className="truncate">
            {title}
          </span>,
          sub && (
            <small className="text-base/[1.6] font-medium text-[#667374]">
              {sub}
            </small>
          ),
        )}
        {action}
      </div>
      <div
        className={`flex-1 px-[18px] pt-4 pb-[18px] sm:px-[22px] sm:pt-5 sm:pb-[22px] ${bodyClassName}`}
      >
        {children}
      </div>
    </section>
  );
}
