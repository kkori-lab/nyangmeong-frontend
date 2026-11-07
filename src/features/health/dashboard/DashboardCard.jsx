import { Link } from 'react-router-dom';
import Card from '@/components/Card';
import { CardTitle } from '../summary/SummaryParts';

/** 빈 상태 문구가 길면 작은 글자 */
const LONG_EMPTY_TEXT = 12;

/**
 * [대시보드 카드 한 장] (※신규 정책)
 * - content가 null이면 빈 상태: 프로토타입 원문 문구 + 기록하러 가는 링크(있을 때)
 * - 오른쪽 위 [더보기]·카드 전체 클릭 이동은 다음 마일스톤
 */
export default function DashboardCard({ item, content }) {
  return (
    <Card
      as="h3"
      title={<CardTitle icon={item.icon}>{item.nm}</CardTitle>}
      className="min-h-[260px]"
      bodyClassName="flex flex-col"
    >
      {content ? (
        <>
          {content.period && (
            <p className="mb-3 text-sm text-subtle">{content.period}</p>
          )}
          <div className="flex grow flex-col">{content.body}</div>
        </>
      ) : (
        <div className="flex grow flex-col items-start gap-2">
          <p
            className={
              item.emptyText.length > LONG_EMPTY_TEXT
                ? 'leading-[1.6] font-semibold text-ink-2'
                : 'text-[22px] leading-tight font-bold text-ink'
            }
          >
            {item.emptyText}
          </p>
          {item.linkText && (
            <Link
              to={item.to}
              className="text-sm font-semibold text-brand-600 underline underline-offset-3"
            >
              {item.linkText}
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}

/** AI 건강분석 리포트: 항상 맨 앞(D9), 준비 중 */
export function AiReportCard() {
  return (
    <Card
      as="h3"
      title={<CardTitle icon="auto_awesome">AI 건강분석 리포트</CardTitle>}
      action={<span className="shrink-0 text-sm text-subtle">항상 표시</span>}
      className="min-h-[260px]"
    >
      <p className="text-[22px] leading-tight font-bold text-ink">
        준비 중이에요
      </p>
      <p className="mt-2 text-sm text-muted">
        최근 기록을 바탕으로 한 건강 코멘트를 곧 보여 드릴게요
      </p>
    </Card>
  );
}
