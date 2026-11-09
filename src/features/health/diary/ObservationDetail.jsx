import Icon from '@/components/Icon';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate, formatMonthDayDot, getYmdOf } from '@/utils/formatDate';
import CareItemMenu from '../CareItemMenu';
import LineChart from './LineChart';
import ObservationPhoto from './ObservationPhoto';
import {
  CHART_COUNT,
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
 * - 글자 색·굵기는 중요도별: 이름·선택 회차 크기 ink 굵게, 변화량 brand-500 굵게, 값 ink-2, 라벨·지난 회차 크기 subtle,
 *   개수·날짜·보조 글 placeholder (추가 요청)
 * - 선택 회차 [사진 원본 보기]·[수정]·[삭제]는 선택 회차 줄 오른쪽 ⋮ 메뉴(CareItemMenu) (추가 요청)
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
  /** 그래프는 크기를 입력한 회차 중 최신 CHART_COUNT개만 (추가 요청) */
  const sizedCycles = cycles
    .filter((target) => target.obsrvSz != null)
    .slice(-CHART_COUNT);
  const sizeDiff = getSizeDiff(cycles, selectedIndex);
  /** 사진 줄은 전체 회차 중 최신 CHART_COUNT개, 앞의 나머지는 [+N] 칸 (추가 요청) */
  const hiddenCount = Math.max(0, cycles.length - CHART_COUNT);

  return (
    <div aria-live="polite" className="min-w-0">
      <div className="mb-4 flex flex-wrap items-baseline gap-2 border-b border-line pb-3">
        <h3 className="text-lg/[1.6] font-bold text-ink">
          {item.obsrvArtclNm}
        </h3>
        <span className="text-placeholder tabular-nums">
          {formatPart(item)} · {cycles.length}회차
        </span>
      </div>

      <div
        role="group"
        aria-label="회차별 사진"
        className="mb-4 flex gap-2 overflow-x-auto pb-1"
      >
        {hiddenCount > 0 && (
          <button
            type="button"
            aria-label={`이전 회차 ${hiddenCount}개 사진 보기`}
            aria-pressed={selectedIndex < hiddenCount}
            className="flex w-[88px] shrink-0 flex-col text-center"
            onClick={() => onViewPhoto(cycles[hiddenCount - 1])}
          >
            {/* 선택 회차가 사진 줄에 없는 이전 회차면 사진 칸과 같은 선택 테두리 (추가 요청) */}
            <span
              className={`grid aspect-square w-full place-content-center rounded-[10px] border bg-surface-2 ${
                selectedIndex < hiddenCount
                  ? 'border-brand-500'
                  : 'border-dashed border-line-strong hover:border-brand-500'
              }`}
            >
              <span className="text-lg/[1.6] font-bold text-brand-500 tabular-nums">
                +{hiddenCount}
              </span>
              <span className="text-sm/[1.6] text-subtle">이전 회차</span>
            </span>
          </button>
        )}
        {cycles.slice(hiddenCount).map((target, shownIndex) => {
          const index = hiddenCount + shownIndex;
          const isSelected = index === selectedIndex;
          return (
            <button
              key={target.obsrvCyclSn}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${target.cyclNo}회차 ${formatDate(getYmdOf(target.obsrvDt))}`}
              className="flex w-[88px] shrink-0 flex-col text-center"
              onClick={() => onSelectCycle(target.obsrvCyclSn)}
            >
              <span
                className={`relative grid aspect-square w-full place-content-center place-items-center gap-0 overflow-hidden rounded-[10px] border bg-surface-2 text-subtle ${
                  isSelected
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
                <span
                  className={`absolute bottom-1 left-1 rounded px-1.5 text-[12px] leading-5 ${
                    isSelected
                      ? 'bg-brand-500 text-white'
                      : 'bg-white text-subtle'
                  }`}
                >
                  {target.cyclNo}회차
                </span>
              </span>
              <span className="mt-1 text-sm/[1.6] text-placeholder tabular-nums">
                {formatMonthDayDot(getYmdOf(target.obsrvDt))}
              </span>
              {target.obsrvSz != null && (
                <span
                  className={`text-sm/[1.6] tabular-nums ${
                    isSelected ? 'font-bold text-ink' : 'text-subtle'
                  }`}
                >
                  {formatSize(target.obsrvSz)}
                </span>
              )}
            </button>
          );
        })}
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
            labelFill="var(--color-placeholder)"
            isEdgeToEdge
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
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm/[1.6] text-placeholder tabular-nums">
            선택 회차 · {cycle.cyclNo}회차 {formatDate(getYmdOf(cycle.obsrvDt))}
          </p>
          <CareItemMenu
            label={`${cycle.cyclNo}회차 메뉴`}
            leadingItems={[
              { label: '사진 원본 보기', onSelect: () => onViewPhoto(cycle) },
            ]}
            onEdit={() => onEditCycle(cycle)}
            onDelete={() => onDeleteCycle(cycle)}
          />
        </div>
        <dl className="mt-2">
          {cycle.obsrvSz != null && (
            <DetailRow label="크기">
              <span className="font-bold text-ink tabular-nums">
                {formatSize(cycle.obsrvSz)}
              </span>
              {/* 크기 + 증감만, 증감이 0이면 "변화 없음". 1회차는 크기만 (추가 요청) */}
              {sizeDiff && (
                <span className="font-bold text-brand-500 tabular-nums">
                  {' '}
                  {formatDiff(sizeDiff.diff)
                    ? `${formatDiff(sizeDiff.diff)}mm`
                    : '변화 없음'}
                </span>
              )}
            </DetailRow>
          )}
          {cycle.obsrvChgCd && (
            <DetailRow label="변화">{cycle.obsrvChgCdNm}</DetailRow>
          )}
          {cycle.memoCn && <DetailRow label="메모">{cycle.memoCn}</DetailRow>}
        </dl>
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
              className="min-h-9 px-1 text-placeholder hover:text-ink hover:underline"
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
      <dt className="w-14 shrink-0 text-subtle">{label}</dt>
      <dd className="min-w-0 flex-1 text-ink-2">{children}</dd>
    </div>
  );
}
