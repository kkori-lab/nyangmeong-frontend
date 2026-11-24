import DatePicker from '@/components/DatePicker';
import Icon from '@/components/Icon';
import { formatYmdWeekday, getTodayYmd } from '@/utils/formatDate';
import {
  CARE_CYCLES,
  CARE_ZONE,
  CUSTOM_CYCLE,
  CYCLE_DAYS_ERROR,
  DEFAULT_CARE_ICON,
  MAX_CYCLE_DAYS,
  addCycle,
  isValidCycleDays,
} from './careDue';
import SegmentSwitch from './SegmentSwitch';
import FieldError, { Required } from '@/components/FieldError';
import { HELP, INPUT, LABEL } from '@/components/formStyles';
import FieldFoot from '@/components/FieldFoot';

/** 아이콘 목록과 이름: 퍼블리싱 html/hlt-calendar.html의 관리 항목 추가 모달과 같음. "기타"는 기본 아이콘 */
const ICONS = [
  { name: 'brush', label: '빗질' },
  { name: 'cleaning_services', label: '청소' },
  { name: 'dentistry', label: '양치' },
  { name: 'bathtub', label: '목욕' },
  { name: 'hearing', label: '귀' },
  { name: 'content_cut', label: '발톱' },
  { name: 'medication', label: '투약' },
  { name: 'vaccines', label: '주사' },
  { name: 'sentiment_satisfied', label: '구강' },
  { name: DEFAULT_CARE_ICON, label: '기타 (기본 아이콘)' },
];
const MAX_NAME_LENGTH = 40;

const ZONES = [
  { cd: CARE_ZONE.DAILY, nm: '일상관리' },
  { cd: CARE_ZONE.REGULAR, nm: '정기관리' },
];

/** 두 칸 줄: 760px 미만도 두 칸(① 항목명·반복 유형 줄만 위아래) */
const PAIR_ROW = 'grid grid-cols-2 gap-4';

function Optional() {
  return <span className="ml-1 text-[13px] font-medium text-subtle">선택</span>;
}

/**
 * 다음 예정일: 정기관리이고 주기가 맞을 때만. 마지막으로 한 날을 비우면 오늘(등록일)부터 계산
 * - lastCmptnYmd: 수정할 항목의 마지막 완료일
 */
const getNextDueYmd = (fields, lastCmptnYmd) => {
  if (fields.careZoneCd !== CARE_ZONE.REGULAR || !fields.careCycleCd)
    return null;
  if (
    fields.careCycleCd === CUSTOM_CYCLE &&
    !isValidCycleDays(fields.cycleDrctInptDayCnt)
  )
    return null;
  return addCycle(
    fields.lastCmptnYmd || lastCmptnYmd || getTodayYmd(),
    fields.careCycleCd,
    fields.cycleDrctInptDayCnt,
  );
};

/**
 * [다음 예정일 한 줄] 「다음 예정일 YYYY-MM-DD(요일)」 (※신규 정책, 2026-11-20: NoticeBox 대신 한 줄)
 * - 760px 이상은 모달 버튼 줄 왼쪽, 760px 미만은 입력칸 맨 아래. 계산할 수 없으면 그리지 않음
 */
export function NextDueText({ fields, lastCmptnYmd = null, className = '' }) {
  const nextDueYmd = getNextDueYmd(fields, lastCmptnYmd);
  if (!nextDueYmd) return null;
  return (
    <p className={`text-sm text-muted tabular-nums ${className}`}>
      다음 예정일{' '}
      <span className="font-semibold text-ink">
        {formatYmdWeekday(nextDueYmd)}
      </span>
    </p>
  );
}

/**
 * [관리 항목 입력칸] (FN-HLT-003-21~24·38)
 * - fields·onChange: careDue.js의 입력칸 값과 바뀐 칸
 * - isBasic: 기본 항목 -> 주기만 수정. isEdit: 마지막으로 한 날은 수정 Body에 없어 숨김
 * - isCycleOnly: 항목명·아이콘·반복 유형 칸을 숨기고 주기·반복 일수만(「케어 항목 관리」 모달의 기본 정기관리 주기 수정, ※신규 정책)
 * - 순서 (※신규 정책, 2026-11-20): ① 항목명 | 반복 유형 ② 아이콘 10개 한 줄(760px 미만 5열 2줄) ③ 주기 한 줄
 *   ④ 반복 일수 | 마지막으로 한 날. 간격 gap-4
 *   - 주기는 반복 유형을 고르기 전·일상관리일 때도 잠근 채 보이고 안내 문구
 *   - 반복 일수는 직접입력일 때만 입력(아니면 잠금·빈 값·「-」). 마지막으로 한 날은 정기관리일 때만(일상관리면 잠금·빈 값·「-」)
 *   - 반복 유형을 고르기 전엔 ④를 그리지 않음
 *   - 수정할 때는 마지막으로 한 날이 없어 반복 일수만 왼쪽 칸
 * - 다음 예정일은 NextDueText로 모달이 그림
 */
export default function CareItemFields({
  fields,
  onChange,
  isBasic = false,
  isEdit = false,
  isCycleOnly = false,
  nameRef = null,
}) {
  const todayYmd = getTodayYmd();
  const isRegular = fields.careZoneCd === CARE_ZONE.REGULAR;
  const hasZone = fields.careZoneCd != null;
  const isCustomCycle = isRegular && fields.careCycleCd === CUSTOM_CYCLE;
  const hasValidDays = isValidCycleDays(fields.cycleDrctInptDayCnt);
  /** 빈 칸은 버튼만 끄고, 값이 있는데 범위 밖일 때만 안내 */
  const showDaysError =
    isCustomCycle && fields.cycleDrctInptDayCnt !== '' && !hasValidDays;

  return (
    <div className="flex flex-col gap-4">
      {!isCycleOnly && (
        <>
          <div className={`${PAIR_ROW} max-[760px]:grid-cols-1`}>
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className={LABEL}>
                항목명
                <Required />
              </span>
              <input
                ref={nameRef}
                value={fields.careArtclNm}
                maxLength={MAX_NAME_LENGTH}
                placeholder="예: 영양제"
                disabled={isBasic}
                className={INPUT}
                onChange={(event) =>
                  onChange({ careArtclNm: event.target.value })
                }
              />
              {/** 글자 수는 칸 아래 오른쪽(공용 FieldFoot, 사람 피드백 2026-11-23) */}
              {!isBasic && (
                <FieldFoot value={fields.careArtclNm} max={MAX_NAME_LENGTH} />
              )}
            </label>

            <fieldset className="flex min-w-0 flex-col gap-1.5">
              <legend className={`${LABEL} mb-1.5`}>
                반복 유형
                <Required />
              </legend>
              <SegmentSwitch
                options={ZONES}
                selected={fields.careZoneCd}
                isLocked={isBasic}
                onSelect={(careZoneCd) => onChange({ careZoneCd })}
              />
            </fieldset>
          </div>

          <fieldset className="flex flex-col gap-1.5">
            <legend className={`${LABEL} mb-1.5`}>
              카테고리 대표 아이콘
              <Optional />
            </legend>
            <div className="grid grid-cols-10 gap-2 max-[760px]:grid-cols-5">
              {ICONS.map((icon) => {
                const isSelected = fields.rprsIconId === icon.name;
                const isEtc = icon.name === DEFAULT_CARE_ICON;
                return (
                  <button
                    key={icon.name}
                    type="button"
                    title={icon.label}
                    aria-label={icon.label}
                    aria-pressed={isSelected}
                    disabled={isBasic}
                    className={`grid h-10 place-items-center rounded-[6px] border disabled:opacity-40 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 text-brand-600'
                        : `bg-white hover:border-line-strong ${
                            isEtc
                              ? 'border-dashed border-line text-subtle'
                              : 'border-line text-ink-2'
                          }`
                    }`}
                    onClick={() =>
                      onChange({ rprsIconId: isSelected ? null : icon.name })
                    }
                  >
                    <Icon name={icon.name} />
                  </button>
                );
              })}
            </div>
            <p className={HELP}>고르지 않으면 기본 아이콘으로 추가돼요</p>
          </fieldset>
        </>
      )}

      {/** 주기: 정기관리가 아니면 잠근 채 보임 (※신규 정책, 2026-11-20) */}
      <fieldset className="flex flex-col gap-1.5">
        <legend className={`${LABEL} mb-1.5`}>
          주기
          {isRegular && <Required />}
        </legend>
        <div className={isRegular ? '' : 'opacity-40'}>
          <SegmentSwitch
            options={CARE_CYCLES}
            selected={isRegular ? fields.careCycleCd : null}
            isLocked={!isRegular}
            onSelect={(careCycleCd) => onChange({ careCycleCd })}
          />
        </div>
        {!isRegular && (
          <p className={HELP}>
            정기관리를 고르면 정할 수 있어요. 일상관리는 매일이에요
          </p>
        )}
      </fieldset>

      {(hasZone || isCycleOnly) && (
        <div className={PAIR_ROW}>
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className={LABEL}>
              반복 일수
              {isCustomCycle && <Required />}
            </span>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={MAX_CYCLE_DAYS}
                value={isCustomCycle ? fields.cycleDrctInptDayCnt : ''}
                placeholder={isCustomCycle ? '예: 10' : '-'}
                disabled={!isCustomCycle}
                aria-invalid={showDaysError}
                className={`${INPUT} pr-16 tabular-nums`}
                onChange={(event) =>
                  onChange({ cycleDrctInptDayCnt: event.target.value })
                }
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-subtle">
                일마다
              </span>
            </div>
            {showDaysError && <FieldError>{CYCLE_DAYS_ERROR}</FieldError>}
          </label>

          {!isEdit && (
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className={LABEL}>
                마지막으로 한 날
                <Optional />
              </span>
              {/** 일상관리는 마지막으로 한 날을 보내지 않음(toCareCreateBody) -> 잠금·빈 값·「-」 (※신규 정책, 2026-11-20) */}
              <DatePicker
                value={isRegular ? fields.lastCmptnYmd : ''}
                max={todayYmd}
                placeholder={isRegular ? undefined : '-'}
                disabled={!isRegular}
                onChange={(lastYmd) => onChange({ lastCmptnYmd: lastYmd })}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
