import { LoaderCircle } from 'lucide-react';
import { BTN_SECONDARY } from '@/components/buttonStyles';

/** 상태별 앞 문구 */
const STATUS_TEXT = {
  running: '굽는 중',
  stopping: '멈추는 중 · 지금 묶음이 끝나면 멈춰요',
  done: '굽기를 마쳤어요',
  stopped: '굽기를 멈췄어요',
  error: '굽기를 멈췄어요',
};

/**
 * [전체 굽기 진행 줄]
 * - 굽는 중: "<아이템명> 굽는 중 · 구움 N · 실패 M" + [멈춤]
 * - 끝·멈춤·오류: 결과 건수(오류면 문구) + [닫기]
 */
export default function ItemBakeStatus({ bake, onStop, onDismiss }) {
  const isActive = bake.status === 'running' || bake.status === 'stopping';

  return (
    <div
      role="status"
      className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[14px] border border-line bg-white px-4 py-3"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {isActive && (
          <LoaderCircle
            className="size-4 shrink-0 animate-spin text-subtle"
            aria-hidden="true"
          />
        )}
        <p className="min-w-0 text-sm leading-[22px] text-ink-2">
          <span className="font-semibold text-ink">{bake.itemNm}</span>{' '}
          {STATUS_TEXT[bake.status]}
          <span className="tabular-nums">
            {' '}
            · 구움 {bake.bakedCnt.toLocaleString()} · 실패{' '}
            {bake.failedCnt.toLocaleString()}
          </span>
          {bake.status === 'error' && (
            <span className="block text-danger">{bake.errorMessage}</span>
          )}
        </p>
      </div>
      {isActive ? (
        <button
          type="button"
          className={BTN_SECONDARY}
          disabled={bake.status === 'stopping'}
          onClick={onStop}
        >
          멈춤
        </button>
      ) : (
        <button type="button" className={BTN_SECONDARY} onClick={onDismiss}>
          닫기
        </button>
      )}
    </div>
  );
}
