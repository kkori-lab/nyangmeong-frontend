import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import { CardTitle } from '../summary/SummaryParts';
import { getMoveState } from './widgetItems';

/** 빈 상태 문구가 길면 작은 글자 */
const LONG_EMPTY_TEXT = 12;

/**
 * [대시보드 카드 한 장] (※신규 정책)
 * - content가 null이면 빈 상태: 프로토타입 원문 문구 + 링크([더보기]와 다른 곳으로 갈 때만)
 * - 오른쪽 위 [더보기]만 이동 링크. 카드 빈 곳을 눌러도 이동하지 않음(사람 결정 2026-11-08)
 * - content.moveTo가 있으면 item.moveTo 대신 그 주소로(처방·투약)
 * - item.titleNote가 있으면 제목 바로 오른쪽에 작은 회색 글자(케어리스트 「보기 전용」)
 */
export default function DashboardCard({ item, content, petSn, petNm }) {
  return (
    <Card
      as="h3"
      title={
        <CardTitle icon={item.icon}>
          {item.nm}
          {item.titleNote && (
            <span className="text-sm font-normal text-subtle">
              {item.titleNote}
            </span>
          )}
        </CardTitle>
      }
      action={
        <Link
          to={content?.moveTo ?? item.moveTo}
          state={getMoveState(item, petSn)}
          aria-label={`${petNm}의 ${item.nm} 기록 화면으로 이동`}
          className="inline-flex shrink-0 items-center rounded-sm text-sm font-semibold whitespace-nowrap text-brand-600 hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          더보기
          <ChevronRight className="size-4.5" aria-hidden="true" />
        </Link>
      }
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
        /** 빈 상태 글자·링크 묶음은 본문 가로·세로 가운데, 줄바꿈돼도 줄마다 가운데(추가-2) */
        <div className="flex grow flex-col items-center justify-center gap-2 text-center">
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
      action={
        <span
          role="img"
          title="항상 표시"
          aria-label="항상 표시"
          className="inline-flex shrink-0"
        >
          <Icon name="push_pin" className="text-lg text-subtle" />
        </span>
      }
      className="min-h-[260px]"
      bodyClassName="flex flex-col items-center justify-center text-center"
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
