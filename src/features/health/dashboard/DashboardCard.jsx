import { ChevronRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadError from '@/components/LoadError';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import Skeleton from '@/components/Skeleton';
import { formatDate } from '@/utils/formatDate';
import { pickJosa } from '@/utils/josa';
import { useHealthReport, useRefreshHealthReport } from '../queries';
import NoticeInfo from '../shared/NoticeInfo';
import { CardTitle } from '../summary/SummaryParts';
import { getMovePath, getMoveState } from './widgetItems';

/**
 * [대시보드 카드 한 장] (※신규 정책)
 * - content가 null이면 빈 상태: 프로토타입 원문 문구
 * - 오른쪽 위 이동 링크(item.moveText, 「기록하기 ›」·「검진 기록 보기 ›」 등). 카드 빈 곳을 눌러도 이동하지 않음(사람 결정 2026-11-08)
 * - 가는 곳은 getMovePath: content.moveTo(처방·투약) → item.moveTo(함수면 petSn으로 만듦, 알레르기·기저질환 「수정하기 ›」)
 * - 매일 기록 5개(item.typeCd)의 「기록하기 ›」는 건강 일지 「오늘 기록하기」 모달을 그 항목으로 엶 (※신규 정책)
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
      title={<CardTitle icon={item.icon}>{item.nm}</CardTitle>}
      action={
        <Link
          to={getMovePath(item, content, petSn)}
          state={getMoveState(item)}
          aria-label={`${petNm}의 ${item.nm} ${item.moveText}`}
          className="inline-flex shrink-0 items-center rounded-sm text-sm font-semibold whitespace-nowrap text-brand-600 hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          {item.moveText}
          <ChevronRight className="size-4.5" aria-hidden="true" />
        </Link>
      }
      className={`h-[300px] ${className}`}
      bodyClassName="flex flex-col"
    >
      {content ? (
        <>
          {content.period &&
            (content.periodAside ? (
              <div className="mb-3 flex items-end justify-between gap-2">
                <p className="text-sm whitespace-nowrap text-subtle">
                  {content.period}
                </p>
                {content.periodAside}
              </div>
            ) : (
              <p className="mb-3 text-sm text-subtle">{content.period}</p>
            ))}
          <div className="flex grow flex-col">{content.body}</div>
        </>
      ) : (
        /** 빈 상태 글자는 본문 가로·세로 가운데, 줄바꿈돼도 줄마다 가운데(추가-2) */
        <div className="flex grow flex-col items-center justify-center gap-2 text-center">
          <p className="text-base text-muted">{item.emptyText}</p>
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
 * - 760px 이상 격자 한 줄 전체 폭 띠(민트 배경 띠, 팁마다 세로 막대), 760px 미만 두 칸 폭 한 줄 띠(민트 배경, 핀 없음) (※신규 정책)
 * - 내용은 AI 계약(ai docs/api/healthreport.md): 제목 줄 · 팁 1~3개(팁마다 앞에 세로 막대, 한 문단으로 이어 최대 2줄 말줄임). 760px 이상은 제목·팁을 흰 상자 하나에 · 고정 안내 · 만든 시각
 * - 고정 안내(notice)는 ⓘ에 마우스를 올리거나 ⓘ를 누르면 보임
 * - 14일 기록이 없으면(dataLackYn) 제목 줄 없이 고정 안내 팁만
 * - [새로고침]은 하루 1회(rfrshPsblYn). 못 하면(rfrshPsblYn false·409) 버튼 대신 안내 문구, 실패 문구는 띠 안에
 * - 반려동물을 바꾸면 부모가 key로 새로 그려 새로고침 실패 문구가 남지 않음
 */
export function AiReportCard({ pet }) {
  const report = useHealthReport(pet.petSn);
  const refresh = useRefreshHealthReport(pet.petSn);
  const data = report.data;
  const isLimitReached = refresh.error?.code === REFRESH_LIMIT_CODE;
  /** 오늘 새로고침을 못 함: 버튼 대신 안내 문구 */
  const isRefreshBlocked = data?.rfrshPsblYn !== true || isLimitReached;

  return (
    <>
      <AiReportBand pet={pet} report={report} />
      <section
        aria-labelledby="hlt011-ai-report"
        className="relative col-span-full flex min-w-0 flex-col gap-2 rounded-card border border-brand-50 bg-brand-50 px-5 py-4 max-[760px]:hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 id="hlt011-ai-report" className="text-lg font-bold text-ink">
              <CardTitle icon="auto_awesome">AI 건강분석 리포트</CardTitle>
            </h3>
            {data && (
              <NoticeInfo label="AI 건강분석 리포트 안내">
                {data.notice}
              </NoticeInfo>
            )}
            {data?.crtDt && (
              <span className="text-sm whitespace-nowrap text-subtle">
                <span aria-hidden="true" className="text-line-strong">
                  ·
                </span>{' '}
                {toCreatedAt(data.crtDt)} 분석
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 text-sm">
            {data &&
              (isRefreshBlocked ? (
                <span className="whitespace-nowrap text-subtle">
                  내일 다시 새로고침할 수 있어요
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => refresh.mutate()}
                  disabled={refresh.isPending}
                  aria-busy={refresh.isPending}
                  className="inline-flex items-center gap-1 rounded-sm font-semibold whitespace-nowrap text-brand-600 hover:enabled:underline hover:enabled:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:text-line-strong"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  새로고침
                </button>
              ))}
            <span
              role="img"
              title="항상 표시"
              aria-label="항상 표시"
              className="inline-flex shrink-0"
            >
              <Icon name="push_pin" className="text-lg text-subtle" />
            </span>
          </div>
        </div>
        <AiReportBody
          pet={pet}
          report={report}
          isRefreshing={refresh.isPending}
        />
        {refresh.error && (
          <p role="alert" className="text-sm text-danger">
            {refresh.error.message}
          </p>
        )}
      </section>
    </>
  );
}

/** 760px 이상 띠 본문: 불러오는 중 · 실패 · 데이터 부족 · 리포트 */
function AiReportBody({ pet, report, isRefreshing }) {
  if (report.isPending || isRefreshing) {
    return (
      <div aria-busy="true" className="flex flex-col gap-2">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-5 w-3/4" />
      </div>
    );
  }

  if (report.isError) {
    return (
      <LoadError
        message={report.error.message}
        onRetry={() => report.refetch()}
        className="py-2"
      />
    );
  }

  const { rptTtl, tips, dataLackYn, staleYn } = report.data;

  return (
    <div className="flex flex-col gap-1">
      {/** 리포트 제목·팁은 흰 상자 하나에: 카드 제목(h3)과 크기·굵기를 달리해 구별 */}
      <div className="flex flex-col gap-1 rounded-box bg-white px-4 py-3">
        {!dataLackYn && (
          <p className="text-base font-semibold text-ink">
            {toReportTitle(pet.petNm, rptTtl)}
          </p>
        )}
        {/** 팁은 한 문단으로 이어 붙여 최대 2줄, 넘치면 말줄임. 마우스를 올리면 전체 팁(title, 알레르기·기저질환과 같음) (※신규 정책, 2026-11-20) */}
        <p className="line-clamp-2 text-sm text-ink-2" title={tips.join(' ')}>
          {tips.map((tip, index) => (
            <span key={index} className="mr-6 last:mr-0">
              <span
                aria-hidden="true"
                className="mr-1.5 inline-block h-3.5 w-1 rounded-full bg-brand-500 align-middle"
              />
              {tip}
            </span>
          ))}
        </p>
      </div>
      {staleYn && (
        <p className="text-sm text-muted">최근 기록이 아직 반영되지 않았어요</p>
      )}
    </div>
  );
}

/** 760px 미만 AI 건강분석 리포트 띠: 제목 줄 한 줄(말줄임) */
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
      className="col-span-2 flex items-center gap-3 rounded-card border border-brand-50 bg-brand-50 px-4 py-3 min-[760px]:hidden"
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
