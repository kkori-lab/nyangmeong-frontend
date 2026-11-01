import { useEffect, useRef, useState } from 'react';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import { diffDays, formatDate } from '@/utils/formatDate';
import { findObservationChange, findObservationPart } from '../diaryTypes';
import { formatDiff, formatSize } from '../diary/observationUtils';
import PhotoModal from './PhotoModal';
import { CardTitle, MoreLink, SummaryEmpty } from './SummaryParts';
import { DIARY_OBS_PATH } from './summaryUtils';

/** 가짜 항목의 "등 · 오른쪽 어깨": 종합 건강기록을 실제 API로 바꿀 때 서버 이름 필드로 바꾼다 */
const formatFakePart = (item) => {
  const partNm = findObservationPart(item.obsvPrtCd).nm;
  return item.obsvPrtDtlNm ? `${partNm} · ${item.obsvPrtDtlNm}` : partNm;
};

/**
 * [관찰 기록] (FN-HLT-011-10)
 * - 관찰중 항목을 탭으로(1개면 탭 없음), 선택 항목의 첫 기록 사진과 최근 사진을 나란히 비교
 * - 사진 아래는 관찰일·회차 1줄, 크기(증감) 1줄. 요약 줄은 크기 변화량 → 변화 단계 → 없음 순
 * - 조회 전용: 등록·사진 추가·종료는 건강 일지에서만
 * - 모바일(640px 미만): 칩은 한 줄 가로 스크롤, 사진은 정사각형 2장 좌우, 요약 링크는 "회차별" (추가 요청)
 */
export default function ObservationSummaryCard({ observations }) {
  const [selectedSn, setSelectedSn] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const item =
    observations.find((candidate) => candidate.obsvItmSn === selectedSn) ??
    observations[0];
  const chipsRef = useRef(null);

  // 선택한 칩이 가로로 가려져 있으면 칩 줄만 스크롤해 보이게 함 (모바일 추가 요청)
  useEffect(() => {
    const list = chipsRef.current;
    const chip = list?.querySelector('[aria-checked="true"]');
    if (!chip) return;
    const left =
      chip.getBoundingClientRect().left -
      list.getBoundingClientRect().left +
      list.scrollLeft;
    const right = left + chip.offsetWidth;
    if (left < list.scrollLeft) {
      list.scrollTo({ left, behavior: 'smooth' });
    } else if (right > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: right - list.clientWidth, behavior: 'smooth' });
    }
  }, [item?.obsvItmSn]);

  return (
    <Card
      title={<CardTitle icon="favorite">관찰 기록</CardTitle>}
      sub={observations.length > 0 && `관찰중 ${observations.length}건`}
      action={observations.length > 0 && <MoreLink to={DIARY_OBS_PATH} />}
    >
      {!item ? (
        <SummaryEmpty
          icon="favorite"
          description="계속 지켜볼 곳을 사진으로 남기면 처음과 최근을 비교해 보여요"
          action="건강 일지 지속 관찰로 가기"
          to={DIARY_OBS_PATH}
        />
      ) : (
        <>
          {observations.length > 1 && (
            <div
              ref={chipsRef}
              role="radiogroup"
              aria-label="관찰 항목 선택"
              className="mb-4 flex flex-wrap gap-2 [scrollbar-width:none] max-sm:flex-nowrap max-sm:overflow-x-auto"
            >
              {observations.map((candidate) => {
                const isSelected = candidate.obsvItmSn === item.obsvItmSn;
                return (
                  <button
                    key={candidate.obsvItmSn}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 whitespace-nowrap ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-line bg-white text-ink hover:bg-surface-2'
                    }`}
                    onClick={() => setSelectedSn(candidate.obsvItmSn)}
                  >
                    {candidate.obsvItmNm}
                    <span className="opacity-80">
                      {formatFakePart(candidate)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <Compare key={item.obsvItmSn} item={item} onView={setPhotoUrl} />
        </>
      )}
      {photoUrl && (
        <PhotoModal src={photoUrl} onClose={() => setPhotoUrl(null)} />
      )}
    </Card>
  );
}

function Compare({ item, onView }) {
  const { rounds } = item;
  const first = rounds[0];
  const lastIndex = rounds.length - 1;
  const last = rounds[lastIndex];
  const hasCompare = rounds.length > 1;
  const summaryText = hasCompare ? getSummaryText(rounds) : '';

  return (
    <>
      <div
        className={`grid gap-4 max-sm:grid-cols-2 max-sm:gap-5 ${hasCompare ? 'sm:grid-cols-2' : 'sm:grid-cols-[minmax(0,1fr)]'}`}
      >
        <Photo label="첫 기록 사진" round={first} roundNo={1} onView={onView} />
        {hasCompare && (
          <Photo
            label="최근 사진"
            round={last}
            roundNo={lastIndex + 1}
            diffFrom={first}
            isRecent
            onView={onView}
          />
        )}
      </div>
      {summaryText && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-[10px] bg-surface-2 px-4 py-3 max-sm:px-3">
          <p className="min-w-0 truncate">{summaryText}</p>
          <MoreLink to={DIARY_OBS_PATH}>
            <span className="max-sm:hidden">회차별 기록 보기</span>
            <span className="sm:hidden">회차별</span>
          </MoreLink>
        </div>
      )}
    </>
  );
}

function Photo({ label, round, roundNo, diffFrom, isRecent = false, onView }) {
  const diff =
    diffFrom && round.obsvSizeMm !== null && diffFrom.obsvSizeMm !== null
      ? formatDiff(round.obsvSizeMm - diffFrom.obsvSizeMm)
      : '';

  return (
    <div>
      <div className="relative">
        {isRecent && (
          <span
            aria-hidden="true"
            className="absolute top-1/2 right-full grid w-5 -translate-y-1/2 place-items-center text-subtle sm:hidden"
          >
            <Icon name="chevron_right" className="text-lg" />
          </span>
        )}
        <button
          type="button"
          disabled={!round.photoPath}
          aria-label={`${label} 원본 보기`}
          className={`grid h-48 w-full cursor-zoom-in max-sm:aspect-square max-sm:h-auto place-items-center overflow-hidden rounded-[10px] border border-dashed bg-surface-2 text-subtle disabled:cursor-default ${
            isRecent ? 'border-solid border-brand-500' : 'border-line-strong'
          }`}
          onClick={() => onView(round.photoPath)}
        >
          {round.photoPath ? (
            <img
              src={round.photoPath}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <span className="flex flex-col items-center gap-1.5">
              <Icon name="image" className="text-[52px] text-line-strong" />
              {label}
            </span>
          )}
        </button>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm/[1.6] whitespace-nowrap text-subtle">
          <span className="max-sm:hidden">{formatDate(round.obsvYmd)}</span>
          <span className="sm:hidden">
            {formatDate(round.obsvYmd, { hasYear: false })}
          </span>{' '}
          · {roundNo}회차
        </p>
        {round.obsvSizeMm !== null && (
          <p className="text-lg/[1.6] font-semibold whitespace-nowrap max-sm:text-base/[1.6]">
            {formatSize(round.obsvSizeMm)}
            {diff && (
              <span className="ml-1 text-sm/[1.6] font-normal text-muted">
                {diff}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

/** "16일 동안 ▲0.5mm 커짐" / 크기가 없으면 "16일 동안 커짐" / 둘 다 없으면 빈 문자열 */
function getSummaryText(rounds) {
  const first = rounds[0];
  const last = rounds[rounds.length - 1];
  const days = diffDays(first.obsvYmd, last.obsvYmd);
  if (first.obsvSizeMm !== null && last.obsvSizeMm !== null) {
    const diff = last.obsvSizeMm - first.obsvSizeMm;
    const diffText = formatDiff(diff);
    if (!diffText) return `${days}일 동안 변화 없음`;
    return `${days}일 동안 ${diffText}mm ${diff > 0 ? '커짐' : '작아짐'}`;
  }
  const changeRound = [...rounds].reverse().find((round) => round.obsvChgCd);
  return changeRound
    ? `${days}일 동안 ${findObservationChange(changeRound.obsvChgCd).nm}`
    : '';
}
