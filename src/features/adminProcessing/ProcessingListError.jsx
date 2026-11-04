import { BTN_SECONDARY } from '@/components/buttonStyles';

/** [처리 현황 조회 오류 안내] */
export default function ProcessingListError({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-16">
      <p className="text-base text-subtle">{message}</p>
      <button type="button" className={BTN_SECONDARY} onClick={onRetry}>
        다시 시도
      </button>
    </div>
  );
}
