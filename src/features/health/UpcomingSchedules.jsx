import Card from '@/components/Card';
import Icon from '@/components/Icon';
import {
  formatTime,
  formatWeekdayLong,
  getDay,
  getHmOf,
  getMonth,
  getTodayYmd,
  getYmdOf,
} from '@/utils/formatDate';
import {
  compareSchedules,
  getScheduleTone,
  getScheduleIcon,
  getScheduleKindName,
  getScheduleTypeName,
  isHospital,
} from './scheduleTypes';

const MAX_UPCOMING = 3;

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
              <button
                type="button"
                className="group flex w-full items-center gap-3 border-b border-[#edf1f1] py-2 text-left last:border-b-0"
                onClick={() => onSelectSchedule(schedule)}
              >
                <span className="flex w-10 shrink-0 flex-col items-center rounded-[6px] bg-[#f4f6f6] py-1 leading-tight">
                  <span className="text-[13px] text-[#667374]">
                    {getMonth(getYmdOf(schedule.schdlDt))}월
                  </span>
                  <span className="text-lg font-semibold text-[#1a3234]">
                    {getDay(getYmdOf(schedule.schdlDt))}
                  </span>
                  <span className="text-[13px] text-[#667374]">
                    {formatWeekdayLong(getYmdOf(schedule.schdlDt))}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-[10px]"
                  style={{
                    backgroundColor: getScheduleTone(schedule).bg,
                    color: getScheduleTone(schedule).fg,
                  }}
                >
                  <Icon name={getScheduleIcon(schedule)} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-[#1a3234] group-hover:text-[#1e4a4c]">
                    {isHospital(schedule)
                      ? getScheduleKindName(schedule)
                      : schedule.schdlNm}
                  </span>
                  <span className="block truncate text-sm text-[#667374]">
                    {schedule.petNm} ·{' '}
                    {isHospital(schedule)
                      ? schedule.hsptlNm
                      : getScheduleTypeName(schedule)}
                    {schedule.hrInptYn &&
                      ` · ${formatTime(getHmOf(schedule.schdlDt))}`}
                  </span>
                </span>
                <Icon name="chevron_right" className="-mr-1 text-[#b9c4c4]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
