import { useEffect, useRef } from 'react';
import Badge from '@/components/Badge';
import Icon from '@/components/Icon';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate, formatMonthDayDot, getYmdOf } from '@/utils/formatDate';
import { round2 } from '../numberFormat';
import LineChart from './LineChart';
import ObservationPhoto from './ObservationPhoto';
import {
  CHART_COUNT,
  formatDiff,
  formatPart,
  formatSize,
  getItemDiffText,
  getItemValueText,
  getSizeDiff,
  isEndedItem,
} from './observationUtils';

/**
 * [지속 관찰 모바일(760px 이하)] 목록 → 상세 화면
 * - 목록: 항목 한 줄 요약(사진·이름·위치 · 회차·최근 값/변화), 누르면 상세 화면
 * - 상세: 요약 → 회차 사진(오래된 회차부터 최신 5개 + 앞은 [+N], 처음엔 최근 회차가 보이게 오른쪽 끝) → 크기 변화 그래프(최신 5개) → 선택 회차 기록 → [관찰 기록 추가] → 관찰 종료
 * - ※ 최근 변화 배지와 회차 사진의 "최근" 표시는 화면설계서에 없는 신규 정책
 */

/** ※ 최근 변화 배지: 마지막 회차의 크기 증감, 크기가 없으면 변화 값. 둘 다 없으면 null */
const getLatestChangeText = (cycles) => {
  const lastIndex = cycles.length - 1;
  const sizeDiff = getSizeDiff(cycles, lastIndex);
  if (sizeDiff) {
    const diffText = formatDiff(sizeDiff.diff);
    return diffText ? `${diffText}mm` : '변화 없음';
  }
  return cycles[lastIndex].obsrvChgCdNm ?? null;
};

function ItemPhoto({ petSn, obsrvCyclSn, className }) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-md bg-surface-3 text-line-strong ${className}`}
    >
      <ObservationPhoto
        petSn={petSn}
        obsrvCyclSn={obsrvCyclSn}
        className="size-full object-cover"
        fallback={<Icon name="image" />}
      />
    </span>
  );
}

export function ObservationMobileList({ petSn, items, onOpen }) {
  return (
    <ul aria-label="관찰 항목 목록" className="flex flex-col">
      {items.map((item) => {
        const isEnded = isEndedItem(item);
        /** PC 목록과 같게 크기 뒤 증감(0이면 "변화 없음")을 따로 굵게 (추가 요청) */
        const hasSize = !isEnded && item.lastCycle.obsrvSz != null;
        const valueText = hasSize
          ? formatSize(item.lastCycle.obsrvSz)
          : getItemValueText(item);
        const diffText = getItemDiffText(item);
        return (
          <li
            key={item.obsrvArtclSn}
            className="border-b border-line-soft last:border-b-0"
          >
            <button
              type="button"
              className={`flex w-full items-center gap-3 py-3 text-left ${isEnded ? 'opacity-55' : ''}`}
              onClick={() => onOpen(item.obsrvArtclSn)}
            >
              <ItemPhoto
                petSn={petSn}
                obsrvCyclSn={item.lastCycle.obsrvCyclSn}
                className="size-12"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-ink">
                  {item.obsrvArtclNm}
                </span>
                <span className="block text-sm/[1.6] break-keep text-subtle tabular-nums">
                  {formatPart(item)} · {item.cyclCnt}회차
                </span>
              </span>
              {isEnded ? (
                <Badge tone="gray">종료</Badge>
              ) : (
                valueText && (
                  <span className="shrink-0 text-sm/[1.6] text-ink-2 tabular-nums">
                    {valueText}
                    {diffText && (
                      <span className="font-bold text-brand-500">
                        {' '}
                        {diffText}
                      </span>
                    )}
                  </span>
                )
              )}
              <Icon name="chevron_right" className="shrink-0 text-subtle" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function ObservationMobileDetail({
  petSn,
  item,
  cycles,
  selectedIndex,
  onBack,
  onSelectCycle,
  onEditCycle,
  onDeleteCycle,
  onAddCycle,
  onEnd,
  onViewPhoto,
}) {
  const cycle = cycles[selectedIndex];
  const lastIndex = cycles.length - 1;
  const isEnded = isEndedItem(item);
  /** 그래프는 PC와 같게 크기를 입력한 회차 중 최신 CHART_COUNT개만 (추가 요청) */
  const sizedCycles = cycles
    .filter((target) => target.obsrvSz != null)
    .slice(-CHART_COUNT);
  /** 사진 줄도 PC와 같게 최신 CHART_COUNT개, 앞의 나머지는 [+N] 칸 (추가 요청) */
  const hiddenCount = Math.max(0, cycles.length - CHART_COUNT);
  const activePoint = sizedCycles.findIndex(
    (target) => target.obsrvCyclSn === cycle.obsrvCyclSn,
  );
  const sizeDiff = getSizeDiff(cycles, selectedIndex);
  const latestChange = getLatestChangeText(cycles);
  /** 회차 사진은 PC와 같게 오래된 회차부터. 회차 수가 바뀌면 최근 회차가 보이게 오른쪽 끝으로 */
  const stripRef = useRef(null);
  useEffect(() => {
    const strip = stripRef.current;
    if (strip) strip.scrollLeft = strip.scrollWidth;
  }, [cycles.length]);

  return (
    <div aria-live="polite" className="min-w-0">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          aria-label="목록으로"
          className="grid size-9 shrink-0 place-items-center rounded-md text-ink hover:bg-surface-2"
          onClick={onBack}
        >
          <Icon name="chevron_left" />
        </button>
        <h3 className="min-w-0 flex-1 truncate text-lg/[1.6] font-semibold text-ink">
          {item.obsrvArtclNm}
        </h3>
        <Badge tone={isEnded ? 'gray' : 'ok'}>
          {isEnded ? '종료' : '관찰 중'}
        </Badge>
      </div>

      <div className="mb-5 flex items-center gap-3 rounded-lg bg-surface-2 p-3">
        <ItemPhoto
          petSn={petSn}
          obsrvCyclSn={item.lastCycle.obsrvCyclSn}
          className="size-14"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink">
            {item.obsrvArtclNm}
          </span>
          <span className="block text-sm/[1.6] text-subtle tabular-nums">
            {formatPart(item)} · {cycles.length}회차
          </span>
        </span>
        {latestChange && (
          <Badge tone="brand" className="tabular-nums">
            {latestChange}
          </Badge>
        )}
      </div>

      {/* 사진 폭 5/19: 간격(gap-2)을 빼고 3장 반이 보여 넘치면 끝 사진이 절반쯤 걸친다 */}
      <div
        ref={stripRef}
        role="group"
        aria-label="회차별 사진"
        className="mb-5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {hiddenCount > 0 && (
          <button
            type="button"
            aria-label={`이전 회차 ${hiddenCount}개 사진 보기`}
            aria-pressed={selectedIndex < hiddenCount}
            className="flex w-5/19 shrink-0 flex-col text-center"
            onClick={() => onViewPhoto(cycles[hiddenCount - 1])}
          >
            {/* 선택 회차가 사진 줄에 없는 이전 회차면 PC와 같은 선택 테두리 (추가 요청) */}
            <span
              className={`grid aspect-square w-full place-content-center rounded-lg border-2 bg-surface-2 ${
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
              aria-label={`${target.cyclNo}회차 ${formatDate(getYmdOf(target.obsrvDt))}${index === lastIndex ? ' 최근' : ''}`}
              className="flex w-5/19 shrink-0 flex-col text-center"
              onClick={() => onSelectCycle(target.obsrvCyclSn)}
            >
              <span
                className={`relative grid aspect-square w-full place-items-center overflow-hidden rounded-lg border-2 bg-surface-2 text-line-strong ${
                  isSelected ? 'border-brand-500' : 'border-line'
                }`}
              >
                <ObservationPhoto
                  petSn={petSn}
                  obsrvCyclSn={target.obsrvCyclSn}
                  className="size-full object-cover"
                  fallback={<Icon name="image" />}
                />
                {index === lastIndex && (
                  <span className="absolute top-1 left-1 rounded-sm bg-brand-500 px-1.5 text-sm text-white">
                    최근
                  </span>
                )}
                <span className="absolute bottom-1 left-1 rounded-sm bg-ink/60 px-1.5 text-sm text-white">
                  {target.cyclNo}회차
                </span>
              </span>
              <span className="mt-1 text-sm/[1.6] text-subtle tabular-nums">
                {formatMonthDayDot(getYmdOf(target.obsrvDt))}
              </span>
            </button>
          );
        })}
      </div>

      {sizedCycles.length >= 2 && (
        <div className="mb-5">
          {/* 그래프 높이는 건강기록 변화와 같은 기본값 (※신규 정책) */}
          <LineChart
            points={sizedCycles.map((target) => ({
              label: formatMonthDayDot(getYmdOf(target.obsrvDt)),
              value: target.obsrvSz,
            }))}
            formatValue={formatSize}
            formatTag={round2}
            activeIndex={activePoint >= 0 ? activePoint : null}
            ariaLabel={`크기 변화 선그래프 · ${sizedCycles
              .map((target) => formatSize(target.obsrvSz))
              .join(' → ')} (크기 없는 회차는 건너뜀)`}
          />
        </div>
      )}
      {cycles.length === 1 && (
        <p className="mb-5 text-sm/[1.6] text-subtle">
          회차가 2개 이상 쌓이면 크기 변화 그래프로 보여요
        </p>
      )}

      <div className="rounded-lg bg-surface-2 p-4">
        <p className="text-sm/[1.6] text-subtle tabular-nums">
          {cycle.cyclNo}회차 · {formatDate(getYmdOf(cycle.obsrvDt))}
        </p>
        {cycle.obsrvSz != null && (
          <>
            <p className="mt-1 text-xl font-semibold text-ink tabular-nums">
              {formatSize(cycle.obsrvSz)}
            </p>
            {sizeDiff && (
              <p className="text-sm/[1.6] text-subtle tabular-nums">
                {cycles[sizeDiff.prevIndex].cyclNo}회차{' '}
                {formatSize(sizeDiff.prevSize)} 대비{' '}
                {formatDiff(sizeDiff.diff)
                  ? `${formatDiff(sizeDiff.diff)}mm`
                  : '변화 없음'}
              </p>
            )}
          </>
        )}
        {cycle.obsrvChgCd && (
          <p className="mt-2 text-sm/[1.6] text-ink-2">
            변화 · {cycle.obsrvChgCdNm}
          </p>
        )}
        {cycle.memoCn && (
          <p className="mt-1 text-sm/[1.6] text-ink-2">메모 · {cycle.memoCn}</p>
        )}
        <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
          <button
            type="button"
            className={`${BTN_SECONDARY} h-8! px-3!`}
            onClick={() => onEditCycle(cycle)}
          >
            수정
          </button>
          <button
            type="button"
            className={`${BTN_SECONDARY} h-8! px-3!`}
            onClick={() => onDeleteCycle(cycle)}
          >
            삭제
          </button>
          <button
            type="button"
            className="ml-auto inline-flex min-h-8 items-center text-sm font-semibold text-brand-600"
            onClick={() => onViewPhoto(cycle)}
          >
            사진 원본
            <Icon name="chevron_right" />
          </button>
        </div>
      </div>

      {!isEnded && (
        <>
          <button
            type="button"
            className={`${BTN_PRIMARY} mt-4 w-full`}
            onClick={onAddCycle}
          >
            관찰 기록 추가 · {cycles.length + 1}회차
          </button>
          <div className="mt-2 flex justify-center">
            <button
              type="button"
              className="min-h-9 px-1 text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
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
