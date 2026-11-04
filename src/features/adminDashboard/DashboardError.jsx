import { BTN_SECONDARY } from '@/components/buttonStyles';

/** [대시보드 조회 오류 안내] */
export default function DashboardError({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-[14px] border border-line bg-white py-16"
    >
      <p className="text-base text-subtle">{message}</p>
      <button type="button" className={BTN_SECONDARY} onClick={onRetry}>
        다시 시도
      </button>
    </div>
  );
}
