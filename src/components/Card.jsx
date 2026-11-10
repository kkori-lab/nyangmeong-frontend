import { createElement, useId } from 'react';

// 제목 줄(제목·보조 글·오른쪽 동작) + 본문으로 이뤄진 카드. 퍼블리싱 시안의 .card와 같은 모양이다
// leading은 제목 왼쪽에 두는 선택 요소(예: 반려동물 셀렉트)다
// isTitleHidden이면 제목을 화면에서만 숨긴다(카드 이름은 스크린리더에 남는다). 제목 자리는 leading이 쓴다
// 폭이 모자라면 제목은 줄이지 않고 sub를 제목 아래 줄로, 그래도 모자라면 action을 다음 줄로 내린다.
// 제목 칸을 basis-0 + 최소 폭(제목 글자 폭)으로 두어 줄바꿈 판단에 제목 폭만 쓰이게 한다. 카드보다 긴 제목만 말줄임한다
export default function Card({
  as: headingTag = 'h2',
  title,
  sub,
  leading,
  isTitleHidden = false,
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
        className={`flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-[#edf1f1] px-[18px] py-4 sm:px-[22px] sm:py-[18px] ${
          onHeaderClick ? 'cursor-pointer' : ''
        }`}
      >
        {leading}
        {createElement(
          headingTag,
          {
            className: isTitleHidden
              ? 'sr-only'
              : 'flex max-w-full flex-[1_1_0] flex-wrap items-baseline gap-x-2 text-lg/[1.6] font-bold tracking-[-0.01em] text-[#1a3234]',
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
