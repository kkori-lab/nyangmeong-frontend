import Card from '@/components/Card';
import Icon from '@/components/Icon';
import {
  WEEKDAYS,
  formatMonthDayDot,
  getTodayYmd,
  getWeekdayIndex,
  getYmdOf,
} from '@/utils/formatDate';
import {
  compareSchedules,
  getScheduleKindName,
  isHospital,
} from './scheduleTypes';

const MAX_UPCOMING = 3;

/** "11.12 목" */
const formatShortDay = (ymd) =>
  `${formatMonthDayDot(ymd)} ${WEEKDAYS[getWeekdayIndex(ymd)]}`;

// 다가오는 케어 일정 카드(FN-HLT-003-40). 캘린더에 등록한 일정만 쓰고 케어리스트 정기관리 예정일은 넣지 않는다
// className은 오른쪽 열에서 이 카드를 내용 높이로 두는 데 쓴다
export default function UpcomingSchedules({
  schedules,
  onSelectSchedule,
  className = '',
  bodyClassName = '',
}) {
  const todayYmd = getTodayYmd();
  const upcoming = schedules
    .filter((schedule) => getYmdOf(schedule.schdlDt) >= todayYmd)
    .sort(compareSchedules)
    .slice(0, MAX_UPCOMING);

  return (
    <Card
      as="h3"
      title="다가오는 케어 일정"
      className={className}
      bodyClassName={bodyClassName}
    >
      {upcoming.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-[#b9c4c4]">
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <span className="grid size-10 place-items-center rounded-full bg-[#f4f6f6] text-[#667374]">
              <Icon name="event_upcoming" />
            </span>
            <p className="text-sm text-[#566465]">다가오는 일정이 없어요</p>
          </div>
        </div>
      ) : (
        <ul>
          {upcoming.map((schedule) => (
            <li key={schedule.schdlSn}>
              {/* 한 줄: 「11.12 목 · 이름 · 반려동물」. 이름만 길면 말줄임 */}
              <button
                type="button"
                className="group flex w-full items-center gap-1.5 border-b border-line-soft py-2 text-left last:border-b-0"
                onClick={() => onSelectSchedule(schedule)}
              >
                <span className="shrink-0 text-sm text-subtle tabular-nums">
                  {formatShortDay(getYmdOf(schedule.schdlDt))}
                </span>
                <span aria-hidden="true" className="text-subtle">
                  ·
                </span>
                <span className="min-w-0 truncate font-semibold text-ink group-hover:text-brand-600">
                  {isHospital(schedule)
                    ? getScheduleKindName(schedule)
                    : schedule.schdlNm}
                </span>
                <span aria-hidden="true" className="text-subtle">
                  ·
                </span>
                <span className="shrink-0 text-sm text-subtle">
                  {schedule.petNm}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
