import Badge from '@/components/Badge';
import Icon from '@/components/Icon';
import { formatMonthDayDot } from '@/utils/formatDate';
import CareItemMenu from './CareItemMenu';
import { toCareIcon } from './careIcons';
import { CARE_ZONE, getCareCycleName, getDueBadge } from './careDue';

const BADGE_TONES = { today: 'brand', upcoming: 'gray', late: 'amber' };

// 케어 항목 한 줄(FN-HLT-003-12·13). 본문 클릭 = 완료 체크, 완료는 배경으로 보여 준다
// isDone: 오늘 완료(목록 응답에 없어 CareList가 완료 기록으로 계산)
export default function CareTile({
  item,
  isDone,
  onCheck,
  onCancelLastDose,
  onEdit,
  onDelete,
  className = '',
}) {
  const isDose = item.prscSn != null;
  const isLinked = item.prscSn != null || item.reptPrvntMngSn != null;
  const isRegular = item.careZoneCd === CARE_ZONE.REGULAR;
  // 사용자 추가 항목은 수정·삭제, 기본 정기관리는 수정(주기만), 기본 일상관리·연동 항목은 메뉴 없음
  const canEdit = !isLinked && (!item.bscArtclYn || isRegular);
  const canDelete = !isLinked && !item.bscArtclYn;
  const badge =
    isRegular && item.nxtmPrnmntYmd ? getDueBadge(item.nxtmPrnmntYmd) : null;

  // 640px 미만은 항목마다 테두리 있는 둥근 칸이고, 완료하면 칸 전체를 초록으로 채운다
  // 투약 항목은 640px 미만에서 두 줄, 640px 이상에서 [마지막 1회 취소]를 ⋮ 메뉴 앞으로 올려 한 줄로 둔다
  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto] content-start items-center border-b [grid-template-areas:'b_s'_'a_a'] max-sm:rounded-[10px] max-sm:border ${
        isDose
          ? "sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:[grid-template-areas:'b_a_s']"
          : ''
      } ${
        isDone
          ? 'border-brand-100 bg-brand-50 max-sm:border-brand-500 max-sm:bg-brand-100'
          : 'border-line-soft max-sm:border-line max-sm:bg-white'
      } ${className}`}
    >
      <button
        type="button"
        aria-pressed={isDone}
        className={`flex w-full items-center gap-3 px-2 py-3 text-left [grid-area:b] ${
          isRegular
            ? 'max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:gap-y-0.5 sm:grid sm:grid-cols-[minmax(0,1fr)_--spacing(18)_--spacing(12)] sm:gap-x-2'
            : ''
        }`}
        onClick={() => onCheck(item)}
      >
        {/* 아이콘 / 첫 줄 이름(넘치면 말줄임), 둘째 줄 회색 처방약 연동 뱃지 + 주기(640px 미만은 예정일까지) */}
        <span
          className={`grid min-w-0 grid-cols-[--spacing(8)_minmax(0,1fr)] items-center gap-x-3 ${
            isRegular ? 'max-sm:col-start-1 max-sm:row-start-1' : 'flex-1'
          }`}
        >
          <span
            aria-hidden="true"
            className={`grid size-8 place-items-center ${
              isDone ? 'text-brand-600' : 'text-muted'
            }`}
          >
            <Icon name={toCareIcon(item.rprsIconId)} />
          </span>
          <span className="flex min-w-0 flex-col">
            <span
              className={`truncate ${isDone ? 'text-brand-600' : 'text-ink'}`}
            >
              {item.careArtclNm}
            </span>
            {(isLinked || isRegular) && (
              <span className="flex min-w-0 items-center gap-2 text-sm text-muted tabular-nums">
                {isLinked && (
                  <Badge tone={isDone ? 'white' : 'gray'}>처방약 연동</Badge>
                )}
                {isRegular && (
                  <span className="truncate">
                    {getCareCycleName(item)} 주기
                    <span className="sm:hidden">
                      {' '}
                      · {formatMonthDayDot(item.nxtmPrnmntYmd)} 예정
                    </span>
                  </span>
                )}
              </span>
            )}
          </span>
        </span>
        {isDose && item.mdcnEndYmd && (
          <span className="hidden text-sm whitespace-nowrap text-subtle tabular-nums sm:inline">
            ~{formatMonthDayDot(item.mdcnEndYmd)}
          </span>
        )}
        {isDose && (
          <span className="text-sm whitespace-nowrap text-ink-2 tabular-nums">
            {item.todayCmptnCnt}/{item.dayMdcnNmtm}회
          </span>
        )}
        {isRegular && (
          <>
            <span className="contents">
              <span className="flex items-center text-sm text-muted tabular-nums max-sm:hidden">
                {formatMonthDayDot(item.nxtmPrnmntYmd)} 예정
              </span>
              {badge && (
                <Badge
                  tone={
                    isDone && badge.tone === 'today'
                      ? 'white'
                      : BADGE_TONES[badge.tone]
                  }
                  className="justify-self-end tabular-nums max-sm:col-start-2 max-sm:row-start-1"
                >
                  {badge.label}
                </Badge>
              )}
            </span>
          </>
        )}
      </button>

      {/* ⋮ 메뉴: 완료 토글 버튼 밖에 둬서 눌러도 완료가 바뀌지 않는다. 메뉴가 없는 줄도 같은 폭을 비워 줄마다 오른쪽 끝을 맞춘다 */}
      <div className="mr-2 flex items-center [grid-area:s]">
        {canEdit ? (
          <CareItemMenu
            label={`${item.careArtclNm} 메뉴`}
            onEdit={() => onEdit(item)}
            onDelete={canDelete ? () => onDelete(item) : undefined}
          />
        ) : (
          <span aria-hidden="true" className="size-8" />
        )}
      </div>

      {/* 투약 항목: 640px 미만은 둘째 줄에 복용 종료일·마지막 1회 취소, 640px 이상은 종료일은 이름 줄에 두고 취소만 ⋮ 메뉴 앞에 */}
      {isDose && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pr-2 pb-3 pl-13 [grid-area:a] sm:p-0 sm:pr-3">
          {item.mdcnEndYmd && (
            <span className="text-sm text-subtle tabular-nums sm:hidden">
              ~{formatMonthDayDot(item.mdcnEndYmd)}
            </span>
          )}
          <button
            type="button"
            disabled={item.todayCmptnCnt === 0}
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
