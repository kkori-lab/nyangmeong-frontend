import { Clock } from 'lucide-react';
import { useState } from 'react';
import DatePicker from '@/components/DatePicker';
import Select from '@/components/Select';
import { addDays } from '@/utils/formatDate';
import {
  periodOf,
  scheduleSummary,
  TIME_12,
  to12Label,
  to24Time,
} from './careUtils';

const PERIODS = [
  { value: 'AM', label: '오전' },
  { value: 'PM', label: '오후' },
];

/** 오전·오후 두 칸 버튼(한쪽만 눌림). 고른 쪽은 필터 칩처럼 연한 청록 */
function PeriodToggle({ label, value, onChange, invalid, disabled }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={`inline-flex h-10 shrink-0 overflow-hidden rounded-md border bg-white ${invalid ? 'border-danger' : 'border-line'}`}
    >
      {PERIODS.map((item) => {
        const selected = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(item.value)}
            className={`min-w-12 cursor-pointer px-3 text-sm transition-colors disabled:cursor-not-allowed ${selected ? 'bg-brand-50 font-semibold text-brand-600' : 'font-medium text-ink-2 hover:enabled:bg-surface-2'}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/** 「시작」 또는 「종료」 한 덩어리: 제목 아래에 날짜 · 오전/오후 · 시각. 760px 미만은 카드 한 장(날짜 한 줄, 아래 오전/오후 + 시각) */
function WhenBlock({
  title,
  date,
  time,
  min,
  max,
  invalid,
  disabled,
  isTimeDisabled,
  onDateChange,
  onTimeChange,
}) {
  /** 시각을 아직 안 골랐을 때 눌러 둔 오전·오후 */
  const [pickedPeriod, setPickedPeriod] = useState('AM');
  const period = periodOf(time) || pickedPeriod;

  const handlePeriod = (next) => {
    setPickedPeriod(next);
    if (time) onTimeChange(to24Time(next, to12Label(time)));
  };

  const options = [
    { value: '', label: '시각' },
    ...TIME_12.map((label) => ({
      value: label,
      label,
      disabled: isTimeDisabled?.(to24Time(period, label)) ?? false,
    })),
  ];

  return (
    <div className="flex min-w-0 flex-col gap-2 max-[760px]:rounded-[10px] max-[760px]:border max-[760px]:border-line max-[760px]:p-3">
      <span className="text-sm font-semibold text-ink-2">{title}</span>
      <div
        className={`flex items-center gap-2 max-[760px]:flex-wrap ${disabled ? 'opacity-50' : ''}`}
      >
        <DatePicker
          label={`${title}일`}
          value={date}
          min={min}
          max={max}
          disabled={disabled}
          onChange={onDateChange}
          invalid={invalid}
          className="max-w-[190px] min-w-0 flex-1 max-[760px]:max-w-none max-[760px]:min-w-full"
        />
        <div className="flex items-center gap-2 max-[760px]:w-full">
          <PeriodToggle
            label={`${title} 오전·오후`}
            value={period}
            onChange={handlePeriod}
            invalid={invalid}
            disabled={disabled}
          />
          <Select
            label={`${title} 시각`}
            value={to12Label(time)}
            options={options}
            disabled={disabled}
            onChange={(label) =>
              onTimeChange(label ? to24Time(period, label) : '')
            }
            className="w-[96px] shrink-0 max-[760px]:min-w-0 max-[760px]:flex-1"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * 돌봄 일정 입력: 「시작」과 「종료」를 한 줄에 나란히(이 영역 너비가 720px 이상일 때, 아니면 위아래. 컨테이너 쿼리) 두고, 아래에 요약 한 줄
 * - values: { fromDate, fromTime, toDate, toTime }(시간은 "HH:mm" 24시간), onChange(바뀐 값만)
 * - disabled: 「일정은 채팅으로 협의할게요」를 체크하면 칸은 그대로 두고 누를 수 없게 한다
 * - 종료가 시작과 같은 날이면 시작 시각 이전·같은 시각은 고를 수 없다
 */
export default function CareSchedule({
  values,
  today,
  startLimitDays,
  periodLimitDays,
  invalid,
  disabled = false,
  onChange,
}) {
  const { fromDate, fromTime, toDate, toTime } = values;
  const sameDay = !fromDate || !toDate || fromDate === toDate;
  const summary = scheduleSummary(values);

  return (
    <div className="@container flex min-w-0 flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 @min-[720px]:grid-cols-2 @min-[720px]:gap-6">
        <WhenBlock
          title="시작"
          date={fromDate}
          time={fromTime}
          min={today}
          max={toDate || addDays(today, startLimitDays)}
          invalid={invalid}
          disabled={disabled}
          onDateChange={(value) => onChange({ fromDate: value })}
          onTimeChange={(value) => onChange({ fromTime: value })}
        />
        <WhenBlock
          title="종료"
          date={toDate}
          time={toTime}
          min={fromDate || today}
          max={
            fromDate
              ? addDays(fromDate, periodLimitDays)
              : addDays(today, startLimitDays + periodLimitDays)
          }
          invalid={invalid}
          disabled={disabled}
          isTimeDisabled={(time) =>
            sameDay && Boolean(fromTime) && time <= fromTime
          }
          onDateChange={(value) => onChange({ toDate: value })}
          onTimeChange={(value) => onChange({ toTime: value })}
        />
      </div>
      {summary && !disabled && (
        <p className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2.5 text-sm font-medium text-ink-2">
          <Clock size={16} aria-hidden="true" className="shrink-0" />
          {summary}
        </p>
      )}
    </div>
  );
}
