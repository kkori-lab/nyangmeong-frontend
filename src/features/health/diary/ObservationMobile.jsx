import Badge from '@/components/Badge';
import Icon from '@/components/Icon';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate, formatMonthDayDot } from '@/utils/formatDate';
import { findObservationChange } from '../diaryTypes';
import LineChart from './LineChart';
import {
  formatDiff,
  formatPart,
  formatSize,
  getItemValueText,
  getSizeDiff,
} from './observationUtils';

/**
 * [지속 관찰 모바일(760px 이하)] 목록 → 상세 화면
 * - 목록: 항목 한 줄 요약(사진·이름·위치 · 회차·최근 값/변화), 누르면 상세 화면
 * - 상세: 요약 → 회차 사진(최근부터) → 크기 변화 그래프 → 선택 회차 기록 → [관찰 기록 추가] → 관찰 종료
 * - ※ 최근 변화 배지와 회차 사진의 "최근" 표시는 화면설계서에 없는 신규 정책
 */

/** 항목 대표 사진: PC 목록과 같게 사진이 있는 첫 회차 */
const findItemPhoto = (item) =>
  item.rounds.find((round) => round.photoPath)?.photoPath;

/** ※ 최근 변화 배지: 마지막 회차의 크기 증감, 크기가 없으면 변화 값. 둘 다 없으면 null */
const getLatestChangeText = (item) => {
  const lastIndex = item.rounds.length - 1;
  const last = item.rounds[lastIndex];
  const sizeDiff = getSizeDiff(item.rounds, lastIndex);
  if (sizeDiff) {
    const diffText = formatDiff(sizeDiff.diff);
    return diffText ? `${diffText}mm` : '변화 없음';
  }
  return last.obsvChgCd ? findObservationChange(last.obsvChgCd).nm : null;
};

function ItemPhoto({ photo, className }) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-md bg-surface-3 text-line-strong ${className}`}
    >
      {photo ? (
        <img src={photo} alt="" className="size-full object-cover" />
      ) : (
        <Icon name="image" />
      )}
    </span>
  );
}

export function ObservationMobileList({ items, onOpen }) {
  return (
    <ul aria-label="관찰 항목 목록" className="flex flex-col">
      {items.map((item) => {
        const isEnded = item.obsvEndYmd !== null;
        const valueText = getItemValueText(item);
        return (
          <li
            key={item.obsvItmSn}
            className="border-b border-line-soft last:border-b-0"
          >
            <button
              type="button"
              className={`flex w-full items-center gap-3 py-3 text-left ${isEnded ? 'opacity-55' : ''}`}
              onClick={() => onOpen(item.obsvItmSn)}
            >
              <ItemPhoto photo={findItemPhoto(item)} className="size-12" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-ink">
                  {item.obsvItmNm}
                </span>
                <span className="block text-sm/[1.6] break-keep text-subtle tabular-nums">
                  {formatPart(item)} · {item.rounds.length}회차
                </span>
              </span>
              {isEnded ? (
                <Badge tone="gray">종료</Badge>
              ) : (
                valueText && (
                  <span className="shrink-0 text-sm/[1.6] text-ink-2 tabular-nums">
                    {valueText}
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
  item,
  selectedIndex,
  onBack,
  onSelectRound,
  onEditRound,
  onDeleteRound,
  onAddRound,
  onEnd,
  onViewPhoto,
}) {
  const { rounds } = item;
  const round = rounds[selectedIndex];
  const lastIndex = rounds.length - 1;
  const isEnded = item.obsvEndYmd !== null;
  const sizedRounds = rounds.filter((target) => target.obsvSizeMm !== null);
  const activePoint = sizedRounds.findIndex(
    (target) => target.obsvRndSn === round.obsvRndSn,
  );
  const sizeDiff = getSizeDiff(rounds, selectedIndex);
  const latestChange = getLatestChangeText(item);
  /** 회차 사진은 최근 회차부터 */
  const newestFirst = rounds.map((_, index) => lastIndex - index);

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
          {item.obsvItmNm}
        </h3>
        <Badge tone={isEnded ? 'gray' : 'ok'}>
          {isEnded ? '종료' : '관찰중'}
        </Badge>
      </div>

      <div className="mb-5 flex items-center gap-3 rounded-lg bg-surface-2 p-3">
        <ItemPhoto photo={findItemPhoto(item)} className="size-14" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink">
            {item.obsvItmNm}
          </span>
          <span className="block text-sm/[1.6] text-subtle tabular-nums">
            {formatPart(item)} · {rounds.length}회차
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
        role="group"
        aria-label="회차별 사진"
        className="mb-5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {newestFirst.map((index) => {
          const target = rounds[index];
          const isSelected = index === selectedIndex;
          return (
            <button
              key={target.obsvRndSn}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${index + 1}회차 ${formatDate(target.obsvYmd)}${index === lastIndex ? ' 최근' : ''}`}
              className="flex w-5/19 shrink-0 flex-col text-center"
              onClick={() => onSelectRound(target.obsvRndSn)}
            >
              <span
                className={`relative grid aspect-square w-full place-items-center overflow-hidden rounded-lg border-2 bg-surface-2 text-line-strong ${
                  isSelected ? 'border-brand-500' : 'border-line'
                }`}
              >
                {target.photoPath ? (
                  <img
                    src={target.photoPath}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <Icon name="image" />
                )}
                {index === lastIndex && (
                  <span className="absolute top-1 left-1 rounded-sm bg-brand-500 px-1.5 text-sm text-white">
                    최근
                  </span>
                )}
                <span className="absolute bottom-1 left-1 rounded-sm bg-ink/60 px-1.5 text-sm text-white">
                  {index + 1}회차
                </span>
              </span>
              <span className="mt-1 text-sm/[1.6] text-subtle tabular-nums">
                {formatMonthDayDot(target.obsvYmd)}
              </span>
            </button>
          );
        })}
      </div>

      {sizedRounds.length >= 2 && (
        <div className="mb-5">
          <LineChart
            points={sizedRounds.map((target) => ({
              label: formatMonthDayDot(target.obsvYmd),
              value: target.obsvSizeMm,
            }))}
            formatValue={formatSize}
            formatTag={(value) => value.toFixed(1)}
            activeIndex={activePoint >= 0 ? activePoint : null}
            height={200}
            ariaLabel={`크기 변화 선그래프 · ${sizedRounds
              .map((target) => formatSize(target.obsvSizeMm))
              .join(' → ')} (크기 없는 회차는 건너뜀)`}
          />
        </div>
      )}
      {rounds.length === 1 && (
        <p className="mb-5 text-sm/[1.6] text-subtle">
          회차가 2개 이상 쌓이면 크기 변화 그래프로 보여요
        </p>
      )}

      <div className="rounded-lg bg-surface-2 p-4">
        <p className="text-sm/[1.6] text-subtle tabular-nums">
          {selectedIndex + 1}회차 · {formatDate(round.obsvYmd)}
        </p>
        {round.obsvSizeMm !== null && (
          <>
            <p className="mt-1 text-xl font-semibold text-ink tabular-nums">
              {formatSize(round.obsvSizeMm)}
            </p>
            {sizeDiff && (
              <p className="text-sm/[1.6] text-subtle tabular-nums">
                {sizeDiff.prevIndex + 1}회차 {formatSize(sizeDiff.prevSizeMm)}{' '}
                대비{' '}
                {formatDiff(sizeDiff.diff)
                  ? `${formatDiff(sizeDiff.diff)}mm`
                  : '변화 없음'}
              </p>
            )}
          </>
        )}
        {round.obsvChgCd && (
          <p className="mt-2 text-sm/[1.6] text-ink-2">
            변화 · {findObservationChange(round.obsvChgCd).nm}
          </p>
        )}
        {round.obsvMemoCn && (
          <p className="mt-1 text-sm/[1.6] text-ink-2">
            메모 · {round.obsvMemoCn}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
          <button
            type="button"
            className={`${BTN_SECONDARY} h-8! px-3!`}
            onClick={() => onEditRound(round)}
          >
            수정
          </button>
          <button
            type="button"
            className={`${BTN_SECONDARY} h-8! px-3!`}
            onClick={() => onDeleteRound(round)}
          >
            삭제
          </button>
          <button
            type="button"
            disabled={!round.photoPath}
            className="ml-auto inline-flex min-h-8 items-center text-sm font-semibold text-brand-600 disabled:text-line-strong"
            onClick={() => onViewPhoto(round.photoPath)}
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
            onClick={onAddRound}
          >
            관찰 기록 추가 · {rounds.length + 1}회차
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
