import { Sparkle } from 'lucide-react';

/**
 * [분석 중 표시]
 * - 문구 앞 별 아이콘이 천천히 돌고, 밝은 빛이 문구 왼쪽 바깥에서 들어와 끝의 "…"까지 지나간다(배경을 문구 폭 3배로 깔아 빛이 글자 밖에서 출발)
 * - 문구는 "…" 없이 넘긴다
 * - 동작 줄이기 설정이면 멈춘 아이콘과 보통 글자
 * - 말풍선 안에 넣고, role="status"는 감싸는 쪽이 단다
 */
export default function AnalyzingStatus({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Sparkle
        aria-hidden="true"
        data-analyzing-icon
        className="size-4 shrink-0 animate-sparkle-spin text-brand-500 motion-reduce:animate-none"
      />
      <span
        data-analyzing-text
        className="animate-text-shimmer bg-[linear-gradient(90deg,var(--color-ink)_0%,var(--color-ink)_40%,var(--color-line-strong)_50%,var(--color-ink)_60%,var(--color-ink)_100%)] bg-size-[300%_100%] bg-clip-text text-transparent motion-reduce:animate-none motion-reduce:bg-none motion-reduce:text-ink"
      >
        {children}…
      </span>
    </span>
  );
}
