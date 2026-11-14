import { ChevronRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import Skeleton from '@/components/Skeleton';
import { formatDate } from '@/utils/formatDate';
import { pickJosa } from '@/utils/josa';
import { useHealthReport, useRefreshHealthReport } from '../queries';
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
export default function DashboardCard({
  item,
  content,
  petSn,
  petNm,
  className = '',
}) {
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
      className={`min-h-[260px] ${className}`}
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

/** 새로고침 하루 상한(이미 새로고침함) */
const REFRESH_LIMIT_CODE = 'HEALTH_REPORT_REFRESH_LIMIT';

/** 리포트 제목 줄: "{이름}은/는 지금 {rptTtl}" (rptTtl은 빈칸만 옴, 계약) */
const toReportTitle = (petNm, rptTtl) =>
  `${petNm}${pickJosa(petNm, '은/는')} 지금 ${rptTtl}`;

/** 만든 시각 '11.14 15:03' */
const toCreatedAt = (crtDt) =>
  `${formatDate(crtDt, { hasYear: false })} ${crtDt.slice(11, 16)}`;

/**
 * [AI 건강분석 리포트] 항상 맨 앞(D9)
 * - 640px 이상 카드, 640px 미만 두 칸 폭 한 줄 띠(핀 없음) (※신규 정책)
 * - 내용은 AI 계약(ai docs/api/healthreport.md): 제목 줄 · 팁 1~3개 · 고정 안내 · 만든 시각
 * - 14일 기록이 없으면(dataLackYn) 제목 줄 없이 고정 안내 팁만
 * - [새로고침]은 하루 1회(rfrshPsblYn). 실패 문구는 카드 안에, 409면 버튼을 끔
 * - 반려동물을 바꾸면 부모가 key로 새로 그려 새로고침 실패 문구가 남지 않음
 */
export function AiReportCard({ pet }) {
  const report = useHealthReport(pet.petSn);
  const refresh = useRefreshHealthReport(pet.petSn);
  const data = report.data;
  const isLimitReached = refresh.error?.code === REFRESH_LIMIT_CODE;
  const canRefresh =
    data?.rfrshPsblYn === true && !isLimitReached && !refresh.isPending;

  return (
    <>
      <AiReportBand pet={pet} report={report} />
      <Card
        as="h3"
        title={<CardTitle icon="auto_awesome">AI 건강분석 리포트</CardTitle>}
        action={
          <div className="flex shrink-0 items-center gap-2">
            {data && (
              <button
                type="button"
                onClick={() => refresh.mutate()}
                disabled={!canRefresh}
                aria-busy={refresh.isPending}
                className="inline-flex items-center gap-1 rounded-sm text-sm font-semibold whitespace-nowrap text-brand-600 hover:enabled:underline hover:enabled:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:text-line-strong"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                새로고침
              </button>
            )}
            <span
              role="img"
              title="항상 표시"
              aria-label="항상 표시"
              className="inline-flex shrink-0"
            >
              <Icon name="push_pin" className="text-lg text-subtle" />
            </span>
          </div>
        }
        className="min-h-[260px] max-sm:hidden"
        bodyClassName="flex flex-col"
      >
        <AiReportBody
          pet={pet}
          report={report}
          isRefreshing={refresh.isPending}
        />
        {refresh.error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {refresh.error.message}
          </p>
        )}
      </Card>
    </>
  );
}

/** 640px 이상 카드 본문: 불러오는 중 · 실패 · 데이터 부족 · 리포트 */
function AiReportBody({ pet, report, isRefreshing }) {
  if (report.isPending || isRefreshing) {
    return (
      <div aria-busy="true" className="flex grow flex-col gap-4">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton lines={3} />
      </div>
    );
  }

  if (report.isError) {
    return (
      <div className="flex grow flex-col items-center justify-center gap-3 text-center">
        <p role="alert" className="leading-[1.6] font-semibold text-ink-2">
          {report.error.message}
        </p>
        <button
          type="button"
          onClick={() => report.refetch()}
          className={BTN_SECONDARY}
        >
          다시 시도
        </button>
      </div>
    );
  }

  const { rptTtl, tips, notice, dataLackYn, staleYn, crtDt } = report.data;

  return (
    <div className="flex grow flex-col">
      {!dataLackYn && (
        <p className="text-[22px] leading-tight font-bold text-ink">
          {toReportTitle(pet.petNm, rptTtl)}
        </p>
      )}
      <ul
        className={`flex flex-col gap-2 text-ink-2 ${dataLackYn ? '' : 'mt-4'}`}
      >
        {tips.map((tip, index) => (
          <li key={`${index}-${tip}`} className="flex gap-2 leading-[1.6]">
            <span
              aria-hidden="true"
              className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-500"
            />
            {tip}
          </li>
        ))}
      </ul>
      {staleYn && (
        <p className="mt-3 text-sm text-muted">
          최근 기록이 아직 반영되지 않았어요
        </p>
      )}
      <div className="mt-auto pt-4 text-xs leading-[1.6] text-subtle">
        {crtDt && <p>{toCreatedAt(crtDt)} 분석</p>}
        <p>{notice}</p>
      </div>
    </div>
  );
}

/** 640px 미만 AI 건강분석 리포트 띠: 제목 줄 한 줄(말줄임) */
function AiReportBand({ pet, report }) {
  const data = report.data;
  let text = '건강 코멘트를 준비하고 있어요';
  if (report.isError) {
    text = '리포트를 불러오지 못했어요';
  } else if (data) {
    text = data.dataLackYn
      ? data.tips[0]
      : toReportTitle(pet.petNm, data.rptTtl);
  }

  return (
    <section
      aria-labelledby="hlt011-ai-band"
      aria-busy={report.isPending}
      className="col-span-2 flex items-center gap-3 rounded-card border border-line bg-white px-4 py-3 sm:hidden"
    >
      <Icon name="auto_awesome" className="shrink-0 text-brand-500" />
      <div className="min-w-0 grow">
        <h3 id="hlt011-ai-band" className="text-sm font-semibold text-ink">
          AI 건강분석 리포트
        </h3>
        {report.isPending ? (
          <Skeleton className="mt-1 h-4 w-4/5" />
        ) : (
          <p className="truncate text-sm text-subtle">{text}</p>
        )}
      </div>
    </section>
  );
}
