import { useState } from 'react';
import DropdownSelect from '@/components/DropdownSelect';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import useMediaQuery from '@/hooks/useMediaQuery';
import { formatDate, getYmdOf } from '@/utils/formatDate';
import { RECORD_TYPES, STOOL, WEIGHT } from '../diaryTypes';
import DayRecordEditModal from './DayRecordEditModal';
import EmptyResult from '@/components/EmptyResult';
import {
  formatAmount,
  formatRecordValue,
  getRecordedYmds,
  summarizeType,
} from './recordUtils';

const PERIOD_OPTIONS = [3, 7, 14];
const DEFAULT_PERIOD = 3;

const TABLE_COLUMNS = ['날짜', ...RECORD_TYPES.map((type) => type.nm)];

/** 표 칸의 하루 값: 체중·배변 상태는 최신 값, 나머지는 합계와 횟수 */
const formatDayCell = (summary, typeCd) => {
  if (summary.count === 0) return '-';
  if (typeCd === WEIGHT || typeCd === STOOL)
    return formatRecordValue(summary.latest);
  return `${formatAmount(typeCd, summary.sum)} (${summary.count}회)`;
};

/** 값이 최신 한 건인 종류(체중·배변 상태). 나머지는 합계와 횟수 */
const LATEST_ONLY_TYPES = [WEIGHT, STOOL];

/** 760px 미만 목록의 한 줄 요약: 기록이 있는 종류만 "체중 3.8kg · 식사량 709g"처럼 연결 (※신규 정책) */
const formatDaySummary = (dayRecords) => {
  const parts = RECORD_TYPES.map((type) => {
    const summary = summarizeType(dayRecords, type.cd);
    if (summary.count === 0) return null;
    const value = LATEST_ONLY_TYPES.includes(type.cd)
      ? formatRecordValue(summary.latest)
      : formatAmount(type.cd, summary.sum);
    return `${type.nm} ${value}`;
  }).filter(Boolean);
  return parts.length === 0 ? '기록이 없어요' : parts.join(' · ');
};

/**
 * [최근 건강기록 날짜별 표]
 * - 하루치를 종류별 합계(횟수)로 한 줄 (FN-HLT-002-13)
 * - 행을 누르면 그날 기록 수정 모달(오늘의 기록 카드 [오늘 기록 수정하기]와 같은 모달). 상세 표 모달 대신 (※신규 정책)
 * - 760px 미만: 표 대신 "날짜 줄 + 한 줄 요약" 목록 (※신규 정책)
 */
export default function RecentRecordTable({
  petSn,
  petBdwg,
  records,
  todayYmd,
}) {
  const [periodDays, setPeriodDays] = useState(DEFAULT_PERIOD);
  const [detailYmd, setDetailYmd] = useState(null);
  const isPc = useMediaQuery('(width >= 760px)');

  const ymds = getRecordedYmds(records, todayYmd, periodDays);

  return (
    <Card
      title="최근 건강기록"
      className="min-w-0"
      action={
        <DropdownSelect
          label="조회기간"
          value={periodDays}
          options={PERIOD_OPTIONS.map((days) => ({
            value: days,
            label: `최근 ${days}일`,
          }))}
          className="w-32"
          onChange={setPeriodDays}
        />
      }
    >
      {ymds.length === 0 ? (
        <EmptyResult
          isCompact
          icon={
            <Icon name="edit_note" className="text-[28px] text-line-strong" />
          }
          title={`최근 ${periodDays}일 동안 기록이 없어요`}
          description="위의 [오늘 기록 추가]로 첫 기록을 남겨 보세요"
        />
      ) : !isPc ? (
        <ul className="flex flex-col">
          {ymds.map((ymd) => (
            <DayListRow
              key={ymd}
              ymd={ymd}
              isToday={ymd === todayYmd}
              dayRecords={records.filter(
                (record) => getYmdOf(record.rcdDt) === ymd,
              )}
              onOpen={() => setDetailYmd(ymd)}
            />
          ))}
        </ul>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm/[1.6]">
            <thead>
              <tr>
                {TABLE_COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="h-10 border-b border-line-strong bg-surface-3 px-3 font-normal text-ink-2"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ymds.map((ymd) => (
                <DayRows
                  key={ymd}
                  ymd={ymd}
                  isToday={ymd === todayYmd}
                  dayRecords={records.filter(
                    (record) => getYmdOf(record.rcdDt) === ymd,
                  )}
                  onOpen={() => setDetailYmd(ymd)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailYmd !== null && (
        <DayRecordEditModal
          petSn={petSn}
          petBdwg={petBdwg}
          ymd={detailYmd}
          isToday={detailYmd === todayYmd}
          dayRecords={records.filter(
            (record) => getYmdOf(record.rcdDt) === detailYmd,
          )}
          onClose={() => setDetailYmd(null)}
        />
      )}
    </Card>
  );
}

/**
 * 오늘이면 「날짜 [오늘]」. 오늘 줄은 바탕·글자색을 다른 줄과 같게 두고 배지로만 표시 (※신규 정책, 2026-11-23 / 2026-11-27 배지를 날짜 뒤로)
 */
function DayDate({ dateText, isToday }) {
  if (!isToday) return dateText;
  return (
    <span className="inline-flex items-center gap-1.5">
      {dateText}
      <Badge tone="brand">오늘</Badge>
    </span>
  );
}

/** 760px 미만 목록의 하루: 날짜 줄 + 한 줄 요약 (※신규 정책). 오른쪽 › 아이콘은 뺌 (※신규 정책, 2026-11-23) */
function DayListRow({ ymd, isToday, dayRecords, onOpen }) {
  const dateText = formatDate(ymd, { hasYear: false, weekday: true });

  return (
    <li className="border-b border-line-soft last:border-b-0">
      <button
        type="button"
        aria-haspopup="dialog"
        className="flex w-full items-center gap-3 py-3 text-left"
        onClick={onOpen}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-semibold text-ink tabular-nums">
            <DayDate dateText={dateText} isToday={isToday} />
          </span>
          <span className="truncate text-sm/[1.6] text-subtle tabular-nums">
            {formatDaySummary(dayRecords)}
          </span>
        </span>
      </button>
    </li>
  );
}

/**
 * PC 표의 하루 한 줄: 줄 아무 곳이나 누르면 그날 기록 수정 모달
 * - 맨 오른쪽 › 칸은 뺌. 키보드는 첫 칸 날짜 버튼으로 엶(검진상세 항목명 버튼과 같은 방식) (※신규 정책, 2026-11-23)
 */
function DayRows({ ymd, isToday, dayRecords, onOpen }) {
  const dateText = formatDate(ymd, { hasYear: false, weekday: true });
  const cellClass = 'h-12 px-3 text-ink tabular-nums';

  return (
    <tr className="cursor-pointer hover:[&>td]:bg-surface-2" onClick={onOpen}>
      <td className={cellClass}>
        <button
          type="button"
          aria-haspopup="dialog"
          className="text-left hover:text-brand-600"
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
        >
          <DayDate
            dateText={
              <span className="underline underline-offset-4">{dateText}</span>
            }
            isToday={isToday}
          />
        </button>
      </td>
      {RECORD_TYPES.map((type) => (
        <td key={type.cd} className={cellClass}>
          {formatDayCell(summarizeType(dayRecords, type.cd), type.cd)}
        </td>
      ))}
    </tr>
  );
}
