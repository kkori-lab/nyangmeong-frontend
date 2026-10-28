import Badge from '@/components/Badge';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import {
  formatMonthDayWeekday,
  formatTime,
  getHmOf,
  getTodayYmd,
  getYmdOf,
} from '@/utils/formatDate';
import {
  compareSchedules,
  getScheduleTone,
  getScheduleKindName,
  isHospital,
} from './scheduleTypes';

// 날짜 인라인 상세 카드(FN-HLT-003-31). petLabel은 제목 옆에 붙는 "전체 반려동물" 또는 고른 반려동물 이름이다
export default function ScheduleDayDetail({
  ymd,
  schedules,
  petLabel,
  onSelectSchedule,
  onCreate,
  className = '',
  bodyClassName = '',
}) {
  const todayYmd = getTodayYmd();
  const isPast = ymd < todayYmd;
  const sorted = schedules
    .filter((schedule) => getYmdOf(schedule.schdlDt) === ymd)
    .sort(compareSchedules);

  return (
    <Card
      as="h3"
      title={formatMonthDayWeekday(ymd)}
      sub={`${sorted.length}건 · ${petLabel}`}
      className={className}
      bodyClassName={bodyClassName}
      action={
        // 좁은 화면에서는 제목·부제가 잘리지 않게 ＋ 아이콘만 남긴다
        <button
          type="button"
          aria-label="새 일정 등록"
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-[6px] bg-brand-500 px-3 text-base font-semibold text-white hover:bg-brand-600 max-[760px]:w-8 max-[760px]:px-0"
          onClick={onCreate}
        >
          <Icon name="add" className="text-xl min-[761px]:hidden" />
          <span className="max-[760px]:hidden">새 일정 등록</span>
        </button>
      }
    >
      {sorted.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-[#b9c4c4]">
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <span className="grid size-10 place-items-center rounded-full bg-[#f4f6f6] text-[#667374]">
              <Icon name="calendar_month" />
            </span>
            <p className="text-sm text-[#566465]">등록된 일정이 없습니다</p>
            <button
              type="button"
              className="inline-flex h-8 items-center rounded-[6px] bg-brand-500 px-3 text-sm font-semibold text-white hover:bg-brand-600"
              onClick={onCreate}
            >
              새 일정 등록
            </button>
          </div>
        </div>
      ) : (
        <>
          <ul>
            {sorted.map((schedule) => (
              <li key={schedule.schdlSn}>
                <button
                  type="button"
                  className="group flex w-full items-start gap-3 border-b border-[#edf1f1] py-3 text-left"
                  onClick={() => onSelectSchedule(schedule)}
                >
                  <span
                    aria-hidden="true"
                    className="w-1 shrink-0 self-stretch rounded-full"
                    style={{
                      backgroundColor: getScheduleTone(schedule).fg,
                    }}
                  />
                  {schedule.hrInptYn && (
                    <span className="shrink-0 whitespace-nowrap text-[#667374]">
                      {formatTime(getHmOf(schedule.schdlDt))}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span
                      className={`group-hover:text-[#1e4a4c] ${
                        isPast ? 'text-[#667374]' : 'text-[#1a3234]'
                      }`}
                    >
                      {schedule.petNm} · {getScheduleKindName(schedule)} ·{' '}
                      {isHospital(schedule)
                        ? schedule.hsptlNm
                        : schedule.schdlNm}
                    </span>
                    {isPast && isHospital(schedule) && (
                      <>
                        {' '}
                        <Badge
                          tone={schedule.ckupRcdCnt > 0 ? 'ok' : 'outline'}
                        >
                          {schedule.ckupRcdCnt > 0
                            ? '검진기록 있음'
                            : '검진기록 없음'}
                        </Badge>
                      </>
                    )}
                    {schedule.memoCn && (
                      <span className="block text-sm text-[#667374]">
                        {schedule.memoCn}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
