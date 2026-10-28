import { CalendarDays, FlaskConical, Pill } from 'lucide-react';
import { LAB_RANGE } from './dashboardSample';

function Stat({ icon, label, value, unit, sub }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 px-5 py-[18px] transition-colors duration-150 hover:bg-[rgba(9,32,34,0.42)] max-[700px]:border-t max-[700px]:border-white/26 first:max-[700px]:border-t-0 min-[701px]:border-l min-[701px]:border-white/26 first:min-[701px]:border-l-0">
      <span className="flex items-center gap-1.5 text-[#dbe8e8]">
        {icon}
        {label}
      </span>
      <span className="text-[30px] leading-[1.1] font-bold tracking-[-0.02em] tabular-nums">
        {value}
        <small className="ml-[3px] text-base font-semibold text-[#dbe8e8]">
          {unit}
        </small>
      </span>
      <span className="leading-[1.45] text-[#dbe8e8] tabular-nums">{sub}</span>
    </div>
  );
}

export default function HealthSummary({ exam, lab, rx }) {
  return (
    <div className="grid grid-cols-3 max-[700px]:grid-cols-1">
      <Stat
        icon={<CalendarDays className="size-[18px]" aria-hidden="true" />}
        label="최근 검진"
        value={exam.dayCount}
        unit="일 전"
        sub={exam.text}
      />
      <Stat
        icon={<FlaskConical className="size-[18px]" aria-hidden="true" />}
        label="검사 수치 · CREA"
        value={lab.value}
        unit="mg/dL"
        sub={`참고범위 ${LAB_RANGE[0]}~${LAB_RANGE[1]}`}
      />
      <Stat
        icon={<Pill className="size-[18px]" aria-hidden="true" />}
        label="현재 처방"
        value={rx.count}
        unit="건"
        sub={rx.text}
      />
    </div>
  );
}
