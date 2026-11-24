import { useEffect, useRef } from 'react';

/**
 * 작은 원 3개 로딩 표시: 왼쪽 원부터 차례로 0%에서 100%까지 진해졌다가 같은 순서로 옅어지며 계속 반복한다
 * - 진할 때(100%) 색은 가이드 회색(placeholder)이다. 검정에 가깝게 보이지 않게 한다
 * - 동작 줄이기 설정이면 멈춘 채 왼쪽이 옅고 오른쪽이 진한 모양(40%·70%·100%)으로 보인다
 */
const DOTS = [
  { delay: 0, still: 'motion-reduce:opacity-40' },
  { delay: 200, still: 'motion-reduce:opacity-70' },
  { delay: 400, still: 'motion-reduce:opacity-100' },
];

function LoadingDots() {
  return (
    <span
      role="status"
      aria-label="불러오는 중"
      className="inline-flex items-center gap-1.5"
    >
      {DOTS.map(({ delay, still }) => (
        <span
          key={delay}
          aria-hidden="true"
          style={{ animationDelay: `${delay}ms` }}
          className={`size-2 animate-dot-fade rounded-full bg-placeholder opacity-0 motion-reduce:animate-none ${still}`}
        />
      ))}
    </span>
  );
}

/**
 * 무한 스크롤 끝 표시: 화면 아래 200px 안으로 들어오면 onLoad로 다음 쪽을 받는다
 * - hasNext: 다음 쪽이 있는지, isFetching: 받는 중(중복 요청 막음, 작은 원 3개 표시)
 * - 받는 중이 끝나도 아직 화면 안이면 다시 감시해서 이어 받는다
 */
export default function LoadMore({ hasNext, isFetching, onLoad }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !hasNext || isFetching) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoad();
      },
      { rootMargin: '0px 0px 200px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNext, isFetching, onLoad]);

  return (
    <div
      ref={ref}
      className="flex min-h-14 items-center justify-center py-6 text-sm text-muted"
    >
      {isFetching && hasNext !== false ? <LoadingDots /> : null}
    </div>
  );
}
