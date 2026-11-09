import Icon from '@/components/Icon';
import {
  RECOMMENDED_IDS,
  WIDGET_GROUPS,
  findWidgetItem,
  keepWidgetOrder,
  orderWidgetIds,
} from './widgetItems';

/** 빈 상태 문구가 이보다 길면 상태 칩은 「기록이 없어요」 */
const LONG_EMPTY_TEXT = 12;

/**
 * [기록 고르기] 튜토리얼 2단계·[기록 항목 편집] 본문 (D4·D5·D7)
 * - 한 줄 배치: 제목·설명 → 대시보드 미리보기(760px 이하 숨김) → 추천 안내 → 4묶음 칩 → 안내 (추가-3)
 * - 미리보기: AI 건강분석 리포트 한 줄 전체, 나머지 3열 카드(아이콘 + 이름 + 상태 칩), 순서는 4묶음 순서(D8)
 * - 미리보기 상태 칩은 항목의 빈 상태 문구(길면 「기록이 없어요」)
 */
export default function WidgetPicker({
  petNm,
  isEdit,
  draftIds,
  lastPickedId,
  onToggle,
  onRecommend,
}) {
  /** 편집은 저장 순서 + 새로 켠 항목 맨 뒤, 튜토리얼은 4묶음 순서 */
  const orderedIds = isEdit
    ? keepWidgetOrder(draftIds)
    : orderWidgetIds(draftIds);

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div>
        <h3 className="text-lg/[1.4] font-bold text-ink">
          {isEdit
            ? '기록할 항목을 바꿔요'
            : `${petNm}에게 어떤 기록을 남길까요?`}
        </h3>
        <p className="mt-1 text-muted">
          고르는 대로 위 대시보드가 바로 바뀌어요
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-[14px] bg-surface-2 p-4 max-[760px]:hidden">
        <div className="flex items-center justify-between gap-2">
          <b className="text-sm text-ink">{petNm}의 대시보드 미리보기</b>
          <span className="text-xs font-semibold text-brand-600">
            실시간 반영
          </span>
        </div>
        <ul className="grid grid-cols-3 gap-2">
          <PreviewCard
            icon="auto_awesome"
            name="AI 건강분석 리포트"
            status="준비 중이에요"
            className="col-span-3"
          />
          {orderedIds.map((id) => {
            const item = findWidgetItem(id);
            return (
              <PreviewCard
                key={id}
                icon={item.icon}
                name={item.nm}
                status={
                  item.emptyText.length > LONG_EMPTY_TEXT
                    ? '기록이 없어요'
                    : item.emptyText
                }
                isNew={id === lastPickedId}
              />
            );
          })}
          <li className="grid min-h-[72px] place-items-center rounded-[10px] border border-dashed border-line-strong px-3 py-2.5 text-center text-sm text-subtle">
            {orderedIds.length > 0
              ? '하나 더 고르면 여기에 카드가 생겨요'
              : '아래에서 고르면 여기에 카드가 생겨요'}
          </li>
        </ul>
        <p className="text-xs/[1.5] text-subtle">
          고른 기록은 건강기록 대시보드에 이 모양으로 놓여요 · 나중에 [기록 항목
          편집]에서 바꿀 수 있어요
        </p>
      </div>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-[10px] bg-surface-2 px-3.5 py-3 text-muted">
        <Icon name="tips_and_updates" className="text-subtle" />
        <span className="min-w-0 flex-1">
          처음이라면 체중·식사량·검진기록부터 시작해 보세요
        </span>
        <button
          type="button"
          className="inline-flex h-8 items-center rounded-md bg-brand-50 px-3 font-semibold whitespace-nowrap text-brand-600 hover:bg-brand-100"
          onClick={() => onRecommend(RECOMMENDED_IDS)}
        >
          추천대로 고르기
        </button>
      </p>

      {WIDGET_GROUPS.map((group) => (
        <div key={group.name}>
          <h4 className="font-semibold text-ink">
            {group.name}{' '}
            <small className="text-sm font-medium text-subtle">
              {group.sub}
            </small>
          </h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.items.map((item) => {
              const isOn = draftIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isOn}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 whitespace-nowrap ${
                    isOn
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-line bg-white text-ink-2 hover:border-line-strong hover:text-ink'
                  }`}
                  onClick={() => onToggle(item.id)}
                >
                  <Icon name={item.icon} className="text-lg" />
                  {item.nm}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {isEdit && (
        <p className="flex gap-2 text-sm text-muted">
          <Icon name="info" className="mt-0.5 text-subtle" />
          빼도 지금까지 남긴 기록은 지워지지 않아요. 대시보드 카드만 숨겨져요.
        </p>
      )}
    </div>
  );
}

/** 미리보기 카드 한 장: 아이콘 + 이름 + 상태 칩. 방금 고른 카드는 진한 테두리 + 브랜드색 칩 */
function PreviewCard({ icon, name, status, isNew = false, className = '' }) {
  return (
    <li
      className={`flex min-w-0 flex-col items-start gap-2 rounded-[10px] border bg-white px-3 py-2.5 ${
        isNew ? 'border-brand-500' : 'border-line'
      } ${className}`}
    >
      <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-ink">
        <Icon name={icon} className="text-lg text-brand-500" />
        <span className="truncate">{name}</span>
      </span>
      <span
        className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap ${
          isNew ? 'bg-brand-500 text-white' : 'bg-surface-3 text-muted'
        }`}
      >
        {status}
      </span>
    </li>
  );
}
