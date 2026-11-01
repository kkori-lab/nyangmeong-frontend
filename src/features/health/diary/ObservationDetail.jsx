import Icon from '@/components/Icon';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate, formatMonthDayDot, getYmdOf } from '@/utils/formatDate';
import LineChart from './LineChart';
import ObservationPhoto from './ObservationPhoto';
import {
  formatDiff,
  formatPart,
  formatSize,
  getSizeDiff,
  isEndedItem,
} from './observationUtils';

/**
 * [관찰 항목 상세]
 * - 항목 헤더·회차별 사진 필름스트립·크기 변화 그래프·선택 회차 상세 (FN-HLT-002-16~19)
 * - 종료한 항목은 [관찰 기록 추가]·[관찰 종료]를 보이지 않음
 */
export default function ObservationDetail({
  petSn,
  item,
  cycles,
  selectedIndex,
  onSelectCycle,
  onEditCycle,
  onDeleteCycle,
  onAddCycle,
  onEnd,
  onViewPhoto,
}) {
  const cycle = cycles[selectedIndex];
  const isEnded = isEndedItem(item);
  const sizedCycles = cycles.filter((target) => target.obsrvSz != null);
  const sizeDiff = getSizeDiff(cycles, selectedIndex);

  return (
    <div aria-live="polite" className="min-w-0">
      <div className="mb-4 flex flex-wrap items-baseline gap-2 border-b border-line pb-3">
        <h3 className="text-lg/[1.6] font-semibold text-ink">
          {item.obsrvArtclNm}
        </h3>
        <span className="text-subtle tabular-nums">
          {formatPart(item)} · {cycles.length}회차
        </span>
      </div>

      <div
        role="group"
        aria-label="회차별 사진"
        className="mb-4 flex gap-2 overflow-x-auto pb-1"
      >
        {cycles.map((target, index) => (
          <button
            key={target.obsrvCyclSn}
            type="button"
            aria-pressed={index === selectedIndex}
            aria-label={`${target.cyclNo}회차 ${formatDate(getYmdOf(target.obsrvDt))}`}
            className="flex w-[88px] shrink-0 flex-col text-center"
            onClick={() => onSelectCycle(target.obsrvCyclSn)}
          >
            <span
              className={`relative grid aspect-square w-full place-content-center place-items-center gap-0 overflow-hidden rounded-[10px] border bg-surface-2 text-subtle ${
                index === selectedIndex
                  ? 'border-brand-500'
                  : 'border-dashed border-line-strong'
              }`}
            >
              <ObservationPhoto
                petSn={petSn}
                obsrvCyclSn={target.obsrvCyclSn}
                className="size-full object-cover"
                fallback={
                  <Icon
                    name="image"
                    className="text-[52px] text-line-strong [font-variation-settings:'FILL'_0,'wght'_500,'GRAD'_0,'opsz'_24]"
                  />
                }
              />
              <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1.5 text-[12px] leading-5 text-white">
                {target.cyclNo}회차
              </span>
            </span>
            <span className="mt-1 text-sm/[1.6] text-subtle tabular-nums">
              {formatMonthDayDot(getYmdOf(target.obsrvDt))}
            </span>
            {target.obsrvSz != null && (
              <span className="text-sm/[1.6] tabular-nums">
                {formatSize(target.obsrvSz)}
              </span>
            )}
          </button>
        ))}
      </div>

      {sizedCycles.length >= 2 && (
        <div className="mb-4">
          <LineChart
            points={sizedCycles.map((target) => ({
              label: formatMonthDayDot(getYmdOf(target.obsrvDt)),
              value: target.obsrvSz,
            }))}
            formatValue={formatSize}
            formatTag={(value) => value.toFixed(1)}
            height={200}
            ariaLabel={`크기 변화 선그래프 · ${sizedCycles
              .map((target) => formatSize(target.obsrvSz))
              .join(' → ')} (크기 없는 회차는 건너뜀)`}
          />
        </div>
      )}
      {cycles.length === 1 && (
        <p className="mb-4 text-sm/[1.6] text-subtle">
          회차가 2개 이상 쌓이면 크기 변화 그래프로 보여요
        </p>
      )}

      <div className="rounded-[10px] bg-surface-2 p-4">
        <p className="text-sm/[1.6] text-subtle tabular-nums">
          선택 회차 · {cycle.cyclNo}회차 {formatDate(getYmdOf(cycle.obsrvDt))}
        </p>
        <dl className="mt-2">
          {cycle.obsrvSz != null && (
            <DetailRow label="크기">
              <span className="tabular-nums">{formatSize(cycle.obsrvSz)}</span>
              {sizeDiff && (
                <span className="text-subtle tabular-nums">
                  {' '}
                  ({cycles[sizeDiff.prevIndex].cyclNo}회차{' '}
                  {formatSize(sizeDiff.prevSize)} 대비{' '}
                  {formatDiff(sizeDiff.diff) || '변화 없음'}
                  {formatDiff(sizeDiff.diff) && 'mm'})
                </span>
              )}
            </DetailRow>
          )}
          {cycle.obsrvChgCd && (
            <DetailRow label="변화">{cycle.obsrvChgCdNm}</DetailRow>
          )}
          {cycle.memoCn && <DetailRow label="메모">{cycle.memoCn}</DetailRow>}
        </dl>
        <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
          <button
            type="button"
            className={`${BTN_SECONDARY} h-8! px-3!`}
            onClick={() => onViewPhoto(cycle)}
          >
            사진 원본 보기
          </button>
          <button
            type="button"
            className={`${BTN_SECONDARY} h-8! px-3!`}
            onClick={() => onEditCycle(cycle)}
          >
            이 회차 수정
          </button>
          <button
            type="button"
            className={`${BTN_SECONDARY} h-8! px-3!`}
            onClick={() => onDeleteCycle(cycle)}
          >
            삭제
          </button>
        </div>
      </div>

      {!isEnded && (
        <>
          <button
            type="button"
            className={`${BTN_SECONDARY} mt-4 w-full`}
            onClick={onAddCycle}
          >
            관찰 기록 추가 · {cycles.length + 1}회차
          </button>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              className="min-h-9 px-1 font-semibold text-muted hover:text-ink hover:underline"
              onClick={onEnd}
            >
              관찰 종료
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="flex items-center gap-3 border-t border-dashed border-line py-2.5 first:border-t-0">
      <dt className="w-14 shrink-0 text-ink-2">{label}</dt>
      <dd className="min-w-0 flex-1 font-semibold text-ink-2">{children}</dd>
    </div>
  );
}
