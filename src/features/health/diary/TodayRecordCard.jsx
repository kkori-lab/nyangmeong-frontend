import { useState } from 'react';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import { formatDate, getHmOf, getYmdOf } from '@/utils/formatDate';
import {
  STOOL,
  TODAY_RECORD_ORDER,
  TYPE_ICONS,
  WEIGHT,
  findRecordType,
} from '../diaryTypes';
import DayRecordEditModal from './DayRecordEditModal';
import { formatAmount, formatRecordValue, summarizeType } from './recordUtils';

/** 줄에 나열하는 개별 값 최대 수 */
const MAX_VALUE_COUNT = 5;

const LATEST_ONLY_TYPES = [WEIGHT, STOOL];

/**
 * [오늘의 기록 카드]
 * - 종류별 한 줄: 종류·횟수 | 합계(체중·배변상태는 최신 값), 아래 줄에 개별 값 (FN-HLT-002-12)
 * - 맨 밑 [오늘 기록 수정하기]: 오늘 기록 수정 모달(최근 건강기록 날짜 행과 같은 모달). 오늘 기록이 없으면 숨김 (※신규 정책)
 * - 버튼이 있을 때 종류 줄 위아래·본문 아래 여백을 줄여 카드 높이를 버튼이 없던 때와 같게 둔다.
 *   버튼 줄이 카드 폭 전체를 쓰도록 본문 좌우 여백은 목록(ul)으로 옮기고(Card 본문과 같은 18·22px), 카드 overflow-hidden으로 아래 모서리를 카드 둥글기에 맞춘다
 * - 태블릿(640~1100px)은 가로 5칸 (※신규 정책): 칸마다 종류·횟수 / 큰 값 / 보조 줄(측정 시각·마지막 시각).
 *   1100px은 HealthDiaryPage가 두 카드를 위아래로 쌓는 기준이라 이 폭에서 카드가 넓어진다
 */
export default function TodayRecordCard({
  petSn,
  records,
  todayYmd,
  isFormOpen,
  onToggleForm,
}) {
  const todayRecords = records.filter(
    (record) => getYmdOf(record.rcdDt) === todayYmd,
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const hasRecords = todayRecords.length > 0;

  return (
    <Card
      title="오늘의 기록"
      sub={
        <span className="text-sm">
          {formatDate(todayYmd, { weekday: true })}
        </span>
      }
      className={hasRecords ? 'min-w-0 overflow-hidden' : 'min-w-0'}
      bodyClassName={hasRecords ? 'pt-2! px-0! pb-0!' : 'pt-2!'}
      action={
        <button
          type="button"
          aria-expanded={isFormOpen}
          aria-controls="hlt002-record-form"
          className={`${BTN_PRIMARY} h-8! px-3!`}
          onClick={onToggleForm}
        >
          오늘 기록추가
        </button>
      }
    >
      <ul
        className={`flex flex-col sm:max-[1100px]:grid sm:max-[1100px]:grid-cols-5 ${hasRecords ? 'px-4.5 sm:px-5.5' : ''}`}
      >
        {TODAY_RECORD_ORDER.map((typeCd) => (
          <TodayRow
            key={typeCd}
            typeCd={typeCd}
            summary={summarizeType(todayRecords, typeCd)}
            isCompact={hasRecords}
          />
        ))}
      </ul>

      {hasRecords && (
        <button
          type="button"
          aria-haspopup="dialog"
          className="flex h-11 w-full items-center justify-center gap-1 border-t border-line text-sm font-semibold text-brand-600 hover:bg-surface-2"
          onClick={() => setIsEditOpen(true)}
        >
          <Icon name="edit" className="text-lg text-brand-600" />
          오늘 기록 수정하기
        </button>
      )}

      {isEditOpen && hasRecords && (
        <DayRecordEditModal
          petSn={petSn}
          ymd={todayYmd}
          isToday
          dayRecords={todayRecords}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </Card>
  );
}

function TodayRow({ typeCd, summary, isCompact }) {
  const type = findRecordType(typeCd);
  const isLatestOnly = LATEST_ONLY_TYPES.includes(typeCd);
  const { items, count, sum, latest } = summary;

  const valueText = () =>
    isLatestOnly ? formatRecordValue(latest) : formatAmount(typeCd, sum);

  /** 태블릿 칸의 보조 줄. 0건이면 배변상태만 "기록 없음" */
  const tabletSubText = () => {
    if (count === 0) return typeCd === STOOL ? '기록 없음' : '';
    const hm = getHmOf(latest.rcdDt);
    if (isLatestOnly) return `${hm} 측정`;
    return count === 1 ? hm : `마지막 ${hm}`;
  };

  return (
    <li
      className={`grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-b border-line-soft last:border-b-0 sm:max-[1100px]:flex sm:max-[1100px]:flex-col sm:max-[1100px]:border-b-0 sm:max-[1100px]:px-3 sm:max-[1100px]:not-first:border-l sm:max-[1100px]:first:pl-0 sm:max-[1100px]:last:pr-0 ${isCompact ? 'py-2.5' : 'py-3'}`}
    >
      <p className="flex items-baseline gap-2 text-ink">
        <Icon name={TYPE_ICONS[typeCd]} className="self-center text-muted" />
        {type.nm}
        <span className="text-sm leading-none text-subtle tabular-nums">
          {count}회
        </span>
      </p>
      <p className="min-w-0 text-sm/[1.6] text-subtle tabular-nums sm:max-[1100px]:hidden">
        {count === 0 ? (
          <span className="text-line-strong">-</span>
        ) : isLatestOnly ? (
          `${getHmOf(latest.rcdDt)} 측정`
        ) : (
          items
            .slice(0, MAX_VALUE_COUNT)
            .map((record) => formatAmount(typeCd, record.rcdNvl))
            .join(' · ')
        )}
      </p>
      <div className="col-start-2 row-span-2 row-start-1 flex flex-col items-end justify-center text-right tabular-nums sm:max-[1100px]:items-start sm:max-[1100px]:text-left">
        {count === 0 ? (
          <>
            <span className="text-sm/[1.6] text-muted sm:max-[1100px]:hidden">
              {typeCd === STOOL ? '기록 없음' : '-'}
            </span>
            <b className="hidden text-lg/[1.6] font-semibold text-line-strong sm:max-[1100px]:block">
              -
            </b>
          </>
        ) : (
          <>
            {!isLatestOnly && (
              <span className="text-sm/[1.6] text-muted sm:max-[1100px]:hidden">
                합계
              </span>
            )}
            <b className="text-lg/[1.6] font-semibold text-ink">
              {valueText()}
            </b>
          </>
        )}
      </div>
      <p className="hidden text-badge text-subtle tabular-nums sm:max-[1100px]:block">
        {tabletSubText()}
      </p>
    </li>
  );
}
