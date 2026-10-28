import Badge from '@/components/Badge';
import Icon from '@/components/Icon';
import { formatMonthDayDot } from '@/utils/formatDate';
import { getCycleName, getDueBadge } from './careDue';

const BADGE_TONES = { today: 'brand', upcoming: 'gray', late: 'amber' };

// 케어 항목 한 줄(FN-HLT-003-12·13). 본문 클릭 = 완료 체크, ★ = 메인 표시. 완료는 배경, 메인은 ★로 따로 보여 준다
export default function CareTile({
  item,
  onCheck,
  onToggleMain,
  onCancelLastDose,
  className = '',
}) {
  const isDose = item.dayGoalCnt != null;
  const isRegular = item.rptTypeCd === 'REGULAR';
  const badge = isRegular ? getDueBadge(item.nextSchdYmd) : null;

  // 640px 미만은 항목마다 테두리 있는 둥근 칸이고, 완료하면 칸 전체를 초록으로 채운다
  // 투약 항목은 640px 미만에서 두 줄, 640px 이상에서 [마지막 1회 취소]를 ★ 앞으로 올려 한 줄로 둔다
  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto] content-start items-center border-b [grid-template-areas:'b_s'_'a_a'] max-sm:rounded-[10px] max-sm:border ${
        isDose
          ? "sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:[grid-template-areas:'b_a_s']"
          : ''
      } ${
        item.todayDoneYn
          ? 'border-brand-100 bg-brand-50 max-sm:border-brand-500 max-sm:bg-brand-100'
          : 'border-line-soft max-sm:border-line max-sm:bg-white'
      } ${className}`}
    >
      <button
        type="button"
        aria-pressed={item.todayDoneYn}
        className={`flex w-full items-center gap-3 px-2 py-3 text-left [grid-area:b] ${
          isRegular
            ? 'max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:gap-y-0.5 sm:grid sm:grid-cols-[minmax(0,1fr)_--spacing(18)_--spacing(18)_--spacing(12)] sm:gap-x-2'
            : ''
        }`}
        onClick={() => onCheck(item)}
      >
        {/* 아이콘 / 이름(고정 폭, 넘치면 말줄임) / 처방약 연동 뱃지. 이름 칸 폭이 같아 뱃지가 모든 줄에서 같은 위치에 온다 */}
        <span
          className={`grid min-w-0 grid-cols-[--spacing(8)_minmax(0,7.5em)_auto] items-center justify-items-start gap-x-3 ${
            isRegular ? 'max-sm:col-start-1 max-sm:row-start-1' : 'flex-1'
          }`}
        >
          <span
            aria-hidden="true"
            className={`grid size-8 place-items-center ${
              item.todayDoneYn ? 'text-brand-600' : 'text-muted'
            }`}
          >
            <Icon name={item.careIconCn} />
          </span>
          <span
            className={`truncate ${item.todayDoneYn ? 'text-brand-600' : 'text-ink'}`}
          >
            {item.careItemNm}
          </span>
          {item.lnkgTypeCd && (
            <Badge tone={item.todayDoneYn ? 'white' : 'brand'}>
              처방약 연동
            </Badge>
          )}
        </span>
        {isDose && item.dosEndYmd && (
          <span className="hidden text-sm whitespace-nowrap text-subtle tabular-nums sm:inline">
            ~{formatMonthDayDot(item.dosEndYmd)}
          </span>
        )}
        {isDose && (
          <span className="text-sm whitespace-nowrap text-ink-2 tabular-nums">
            {item.todayChckCnt}/{item.dayGoalCnt}회
          </span>
        )}
        {isRegular && (
          <>
            <span className="flex items-center text-sm text-muted max-sm:hidden">
              {getCycleName(item)} 주기
            </span>
            <span className="contents">
              <span className="flex items-center text-sm text-muted tabular-nums max-sm:hidden">
                {formatMonthDayDot(item.nextSchdYmd)} 예정
              </span>
              {badge && (
                <Badge
                  tone={
                    item.todayDoneYn && badge.tone === 'today'
                      ? 'white'
                      : BADGE_TONES[badge.tone]
                  }
                  className="justify-self-end tabular-nums max-sm:col-start-2 max-sm:row-span-2 max-sm:row-start-1"
                >
                  {badge.label}
                </Badge>
              )}
            </span>
            {/* 640px 미만: 이름 아래 부제 한 줄(아이콘 폭만큼 들여 이름과 맞춤) */}
            <span className="col-start-1 row-start-2 truncate pl-11 text-sm text-muted tabular-nums sm:hidden">
              {getCycleName(item)} 주기 · {formatMonthDayDot(item.nextSchdYmd)}{' '}
              예정
            </span>
          </>
        )}
      </button>

      <button
        type="button"
        aria-label={`${item.careItemNm} 메인 표시`}
        aria-pressed={item.mainExpsrYn}
        className="mr-2 grid size-8 place-items-center rounded-full [grid-area:s] hover:bg-surface-3"
        onClick={() => onToggleMain(item)}
      >
        <Icon
          name="star"
          filled={item.mainExpsrYn}
          className={item.mainExpsrYn ? 'text-ink' : 'text-line-strong'}
        />
      </button>

      {/* 투약 항목: 640px 미만은 둘째 줄에 복용 종료일·마지막 1회 취소, 640px 이상은 종료일은 이름 줄에 두고 취소만 ★ 앞에 */}
      {isDose && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pr-2 pb-3 pl-13 [grid-area:a] sm:p-0 sm:pr-3">
          {item.dosEndYmd && (
            <span className="text-sm text-subtle tabular-nums sm:hidden">
              ~{formatMonthDayDot(item.dosEndYmd)}
            </span>
          )}
          <button
            type="button"
            disabled={item.todayChckCnt === 0}
            className="text-sm text-brand-600 hover:underline hover:underline-offset-3 disabled:opacity-40 disabled:hover:no-underline"
            onClick={() => onCancelLastDose(item)}
          >
            마지막 1회 취소
          </button>
        </div>
      )}
    </div>
  );
}
