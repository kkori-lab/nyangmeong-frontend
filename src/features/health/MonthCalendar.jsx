import Card from '@/components/Card';
import Icon from '@/components/Icon';
import {
  getDay,
  getDaysInMonth,
  getTodayYmd,
  getWeekdayIndex,
  getYmdOf,
  makeYmd,
} from '@/utils/formatDate';
import {
  compareSchedules,
  getScheduleTone,
  getScheduleKindName,
} from './scheduleTypes';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const DAYS_PER_WEEK = 7;
// 761px 이상: 날짜 칸은 88px로 고정한다(시안·명세는 80px, 오늘·+n 칸 태그 아래가 잘려 늘림). 일정은 두 줄 태그 1건만 보여 주고 나머지는 날짜 옆 +n으로 줄인다
const MAX_DAY_TAGS = 1;

// 760px 이하는 마이페이지 가계부 달력과 같은 앱 모양: 칸 세로선 없이 주 사이 얇은 선만, 숫자는 가운데, 일정은 숫자 아래 점
const CELL_CLASS =
  'border-r border-b border-line max-[760px]:border-r-0 max-[760px]:border-line-soft';

const navButtonClass =
  'grid size-9 place-items-center rounded-full text-[#566465] hover:bg-[#ebf0f0] hover:text-[#1a3234] disabled:opacity-40 disabled:hover:bg-transparent';

// 월간 캘린더 카드(FN-HLT-003-29·30). schedules는 이미 표시 반려동물 필터를 거친 그 달 일정이다
// children은 달력 위에 놓는 표시 반려동물 필터다
export default function MonthCalendar({
  year,
  month,
  schedules,
  selectedYmd,
  canMoveMonth,
  onMoveMonth,
  onSelectDate,
  children,
}) {
  const todayYmd = getTodayYmd();
  const daysInMonth = getDaysInMonth(year, month);
  const leadingBlanks = getWeekdayIndex(makeYmd(year, month, 1));
  const trailingBlanks =
    (DAYS_PER_WEEK - ((leadingBlanks + daysInMonth) % DAYS_PER_WEEK)) %
    DAYS_PER_WEEK;
  const days = Array.from({ length: daysInMonth }, (_, index) =>
    makeYmd(year, month, index + 1),
  );
  const sorted = [...schedules].sort(compareSchedules);

  // 마지막 주 뒤 빈 칸은 760px 이하에서 숨긴다
  const renderBlanks = (count, keyPrefix) =>
    Array.from({ length: count }, (_, index) => (
      <div
        key={`${keyPrefix}-${index}`}
        aria-hidden="true"
        className={`${CELL_CLASS} bg-surface-2 max-[760px]:bg-transparent ${
          keyPrefix === 'trail' ? 'max-[760px]:hidden' : ''
        }`}
      />
    ));

  return (
    <Card
      title="통합 케어 캘린더"
      action={
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="이전 달"
            disabled={!canMoveMonth}
            className={navButtonClass}
            onClick={() => onMoveMonth(-1)}
          >
            <Icon name="chevron_left" />
          </button>
          <span className="min-w-28 text-center text-lg font-semibold text-[#1a3234]">
            {year}년 {month}월
          </span>
          <button
            type="button"
            aria-label="다음 달"
            disabled={!canMoveMonth}
            className={navButtonClass}
            onClick={() => onMoveMonth(1)}
          >
            <Icon name="chevron_right" />
          </button>
        </div>
      }
    >
      {children}
      <div
        role="grid"
        aria-label={`${year}년 ${month}월`}
        className="grid grid-cols-7 overflow-hidden rounded-[10px] border-t border-l border-line max-[760px]:rounded-none max-[760px]:border-0"
      >
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="min-w-0 border-r border-b border-line bg-surface-2 py-2 text-center text-sm font-semibold text-subtle max-[760px]:border-0 max-[760px]:bg-transparent max-[760px]:py-1.5 max-[760px]:font-medium"
          >
            {label}
          </div>
        ))}
        {renderBlanks(leadingBlanks, 'lead')}
        {days.map((ymd) => {
          const daySchedules = sorted.filter(
            (schedule) => getYmdOf(schedule.schdlDt) === ymd,
          );
          const isSelected = ymd === selectedYmd;
          const isToday = ymd === todayYmd;
          const isPast = ymd < todayYmd;
          const weekdayIndex = getWeekdayIndex(ymd);
          const isWeekend =
            weekdayIndex === 0 || weekdayIndex === DAYS_PER_WEEK - 1;
          // 760px 이하 숫자: 선택은 초록 원, 오늘은 초록 글자, 주말은 흐린 색
          let mobileDayClass = isWeekend
            ? 'max-[760px]:font-semibold max-[760px]:text-subtle'
            : 'max-[760px]:font-semibold max-[760px]:text-ink';
          if (isToday) {
            mobileDayClass =
              'max-[760px]:bg-transparent max-[760px]:font-bold max-[760px]:text-brand-600';
          }
          if (isSelected) {
            mobileDayClass =
              'max-[760px]:bg-brand-600 max-[760px]:font-semibold max-[760px]:text-white';
          }
          return (
            <button
              key={ymd}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${month}월 ${getDay(ymd)}일, 일정 ${daySchedules.length}건`}
              className={`flex h-22 min-w-0 flex-col items-stretch gap-1 overflow-hidden p-2 text-left max-[760px]:h-auto max-[760px]:items-center max-[760px]:bg-transparent max-[760px]:px-0 max-[760px]:pt-1.5 max-[760px]:pb-2 max-[760px]:shadow-none ${CELL_CLASS} ${
                isSelected
                  ? 'bg-brand-50 shadow-[inset_0_0_0_2px_var(--color-brand-500)]'
                  : 'bg-white hover:bg-surface-2'
              }`}
              onClick={() => onSelectDate(ymd)}
            >
              <span className="flex items-start justify-between max-[760px]:justify-center">
                <span
                  className={`text-sm max-[760px]:grid max-[760px]:size-8 max-[760px]:place-items-center max-[760px]:rounded-full max-[760px]:text-[15px] ${
                    isToday
                      ? 'inline-grid h-6 min-w-6 place-items-center self-start rounded-full bg-brand-500 text-white'
                      : isSelected
                        ? 'font-bold text-brand-600'
                        : 'text-subtle'
                  } ${mobileDayClass}`}
                >
                  {getDay(ymd)}
                </span>
                {daySchedules.length > MAX_DAY_TAGS && (
                  <span
                    aria-label={`일정 ${daySchedules.length - MAX_DAY_TAGS}건 더 있어요`}
                    className="pt-1 max-[760px]:hidden"
                  >
                    <span className="text-[13px] leading-4 font-semibold text-subtle">
                      +{daySchedules.length - MAX_DAY_TAGS}
                    </span>
                  </span>
                )}
              </span>
              {/* 761px 이상: 두 줄 태그 1건, 나머지는 날짜 옆 +n */}
              {daySchedules.slice(0, MAX_DAY_TAGS).map((schedule) => (
                <span
                  key={schedule.schdlSn}
                  title={`${schedule.petNm} · ${getScheduleKindName(schedule)}`}
                  className={`block truncate rounded-[4px] px-1 text-[13px] leading-tight font-semibold max-[760px]:hidden ${
                    isPast ? 'opacity-60' : ''
                  }`}
                  style={{
                    backgroundColor: getScheduleTone(schedule).bg,
                    color: getScheduleTone(schedule).fg,
                  }}
                >
                  <span className="block truncate">{schedule.petNm}</span>
                  <span className="block truncate">
                    {getScheduleKindName(schedule)}
                  </span>
                </span>
              ))}
              {/* 760px 이하: 1건은 점, 2건 이상은 짧은 막대. 색은 그날 첫 일정의 종류 색 */}
              {daySchedules.length > 0 && (
                <span
                  aria-hidden="true"
                  className={`hidden h-[5px] rounded-[3px] max-[760px]:block ${
                    daySchedules.length > 1 ? 'w-3.5' : 'w-[5px]'
                  } ${isPast ? 'opacity-60' : ''}`}
                  style={{
                    backgroundColor: getScheduleTone(daySchedules[0]).fg,
                  }}
                />
              )}
            </button>
          );
        })}
        {renderBlanks(trailingBlanks, 'trail')}
      </div>
    </Card>
  );
}
