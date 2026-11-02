import Card from '@/components/Card';
import Icon from '@/components/Icon';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import { formatDate, getHmOf, getYmdOf } from '@/utils/formatDate';
import {
  MEAL,
  STOOL,
  TODAY_RECORD_ORDER,
  WALK,
  WATER,
  WEIGHT,
  findRecordType,
} from '../diaryTypes';
import { formatAmount, formatRecordValue, summarizeType } from './recordUtils';

/** 줄에 나열하는 개별 값 최대 수 */
const MAX_VALUE_COUNT = 5;

const LATEST_ONLY_TYPES = [WEIGHT, STOOL];

/**
 * [오늘의 기록 카드]
 * - 종류별 한 줄: 종류·횟수 | 합계(체중·배변상태는 최신 값), 아래 줄에 개별 값 (FN-HLT-002-12)
 * - 시간별 상세·수정·삭제는 최근 건강기록 오늘 행에서 처리
 */
export default function TodayRecordCard({
  records,
  todayYmd,
  isFormOpen,
  onToggleForm,
}) {
  const todayRecords = records.filter(
    (record) => getYmdOf(record.rcdDt) === todayYmd,
  );

  return (
    <Card
      title="오늘의 기록"
      sub={
        <span className="text-sm">
          {formatDate(todayYmd, { weekday: true })}
        </span>
      }
      className="min-w-0"
      bodyClassName="pt-2!"
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
      <ul className="flex flex-col">
        {TODAY_RECORD_ORDER.map((typeCd) => (
          <TodayRow
            key={typeCd}
            typeCd={typeCd}
            summary={summarizeType(todayRecords, typeCd)}
          />
        ))}
      </ul>
    </Card>
  );
}

/** 종류를 구별하는 Material Symbols 아이콘 이름 */
const TYPE_ICONS = {
  [WEIGHT]: 'monitor_weight',
  [MEAL]: 'restaurant',
  [WATER]: 'water_drop',
  [STOOL]: 'wc',
  [WALK]: 'directions_walk',
};

function TodayRow({ typeCd, summary }) {
  const type = findRecordType(typeCd);
  const isLatestOnly = LATEST_ONLY_TYPES.includes(typeCd);
  const { items, count, sum, latest } = summary;

  const valueText = () =>
    isLatestOnly ? formatRecordValue(latest) : formatAmount(typeCd, sum);

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-b border-line-soft py-3 last:border-b-0">
      <p className="flex items-baseline gap-2 text-ink">
        <Icon name={TYPE_ICONS[typeCd]} className="self-center text-muted" />
        {type.nm}
        <span className="text-sm leading-none text-subtle tabular-nums">
          {count}회
        </span>
      </p>
      <p className="min-w-0 text-sm/[1.6] text-subtle tabular-nums">
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
      <div className="col-start-2 row-span-2 row-start-1 flex flex-col items-end justify-center text-right tabular-nums">
        {count === 0 ? (
          <span className="text-sm/[1.6] text-muted">
            {typeCd === STOOL ? '기록 없음' : '-'}
          </span>
        ) : (
          <>
            {!isLatestOnly && (
              <span className="text-sm/[1.6] text-muted">합계</span>
            )}
            <b className="text-lg/[1.6] font-semibold text-ink">
              {valueText()}
            </b>
          </>
        )}
      </div>
    </li>
  );
}
