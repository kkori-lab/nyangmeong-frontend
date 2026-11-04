import BarChart from '@/components/BarChart';
import CurveChart from '@/components/CurveChart';
import { formatDate } from '@/utils/formatDate';
import DashboardPanel from './DashboardPanel';
import DashboardTable from './DashboardTable';

const EMPTY_TEXT = '기간 안에 데이터가 없어요';

/** 일별 그래프 글자 간격: 점이 많으면 몇 칸 걸러 표시 */
const getLabelEvery = (count) => (count > 14 ? Math.ceil(count / 7) : 1);

/** 월-일 표기 */
const toMonthDay = (ymd) => formatDate(ymd, { hasYear: false, separator: '-' });

const PET_COLUMNS = [
  {
    key: 'petSeNm',
    label: '종',
    className: 'w-20 whitespace-nowrap',
    render: (row) => row.petSeNm,
  },
  { key: 'vrtyNm', label: '품종', render: (row) => row.vrtyNm },
  {
    key: 'cnt',
    label: '마리',
    className: 'w-20 text-right whitespace-nowrap tabular-nums',
    render: (row) => row.cnt.toLocaleString(),
  },
];

const PLACE_COLUMNS = [
  { key: 'plcNm', label: '장소', render: (row) => row.plcNm },
  {
    key: 'cnt',
    label: '즐겨찾기',
    className: 'w-24 text-right whitespace-nowrap tabular-nums',
    render: (row) => row.cnt.toLocaleString(),
  },
];

/** 일별 선 그래프 하나: 제목 + 합계 */
function DailyChart({ title, daily, field, labels }) {
  const values = daily.map((row) => row[field]);
  const total = values.reduce((sum, value) => sum + value, 0);
  return (
    <figure className="min-w-0">
      <figcaption className="mb-1 flex items-baseline justify-between text-sm text-subtle">
        <span className="font-semibold text-ink-2">{title}</span>
        <span className="tabular-nums">합계 {total.toLocaleString()}</span>
      </figcaption>
      <CurveChart
        values={values}
        labels={labels}
        label={`일별 ${title}`}
        labelEvery={getLabelEvery(values.length)}
      />
    </figure>
  );
}

/** 묶음 막대 그래프, 비면 안내 */
function GroupBarChart({ rows, nameKey, label }) {
  if (rows.every(({ cnt }) => cnt === 0)) {
    return (
      <p className="py-8 text-center text-base text-subtle">{EMPTY_TEXT}</p>
    );
  }
  return (
    <BarChart
      values={rows.map(({ cnt }) => cnt)}
      labels={rows.map((row) => row[nameKey])}
      label={label}
    />
  );
}

/**
 * [이용 통계]
 * - 선택 기간의 일별 가입·탈퇴, AI 대화·OCR 요청, 게시판·가계부 묶음 건수, 종·품종 분포, 즐겨찾기 상위 장소
 * - 건수만(내용 없음)
 */
export default function StatsSection({ stats, fromYmd, toYmd, picker }) {
  const labels = stats.daily.map(({ ymd }) => toMonthDay(ymd));
  const hasDaily = stats.daily.some(
    (row) => row.joinCnt || row.whdwlCnt || row.aiChatCnt || row.ocrRqstCnt,
  );

  return (
    <section aria-labelledby="dashboard-stats" className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2
          id="dashboard-stats"
          className="flex items-baseline gap-2 text-lg font-bold text-ink"
        >
          이용 통계
          <small className="text-sm font-medium text-subtle tabular-nums">
            {formatDate(fromYmd)} ~ {formatDate(toYmd)}
          </small>
        </h2>
        {picker}
      </div>
      <div className="grid gap-3 min-[1101px]:grid-cols-2">
        <DashboardPanel title="일별 가입·탈퇴">
          {hasDaily ? (
            <div className="space-y-4">
              <DailyChart
                title="가입"
                daily={stats.daily}
                field="joinCnt"
                labels={labels}
              />
              <DailyChart
                title="탈퇴"
                daily={stats.daily}
                field="whdwlCnt"
                labels={labels}
              />
            </div>
          ) : (
            <p className="py-8 text-center text-base text-subtle">
              {EMPTY_TEXT}
            </p>
          )}
        </DashboardPanel>
        <DashboardPanel title="AI 대화 · OCR 요청">
          {hasDaily ? (
            <div className="space-y-4">
              <DailyChart
                title="AI 대화"
                daily={stats.daily}
                field="aiChatCnt"
                labels={labels}
              />
              <DailyChart
                title="OCR 요청"
                daily={stats.daily}
                field="ocrRqstCnt"
                labels={labels}
              />
            </div>
          ) : (
            <p className="py-8 text-center text-base text-subtle">
              {EMPTY_TEXT}
            </p>
          )}
        </DashboardPanel>
        <DashboardPanel title="게시판별 게시글">
          <GroupBarChart
            rows={stats.pstCntByBbs}
            nameKey="bbsNm"
            label="게시판별 게시글 수"
          />
        </DashboardPanel>
        <DashboardPanel title="가계부 카테고리별 지출 건수">
          <GroupBarChart
            rows={stats.expnsCntByCtgry}
            nameKey="ctgryNm"
            label="가계부 카테고리별 지출 건수"
          />
        </DashboardPanel>
        <DashboardPanel title="종·품종 분포">
          <DashboardTable
            columns={PET_COLUMNS}
            rows={stats.petDstrb}
            rowKey="vrtyNm"
            emptyText={EMPTY_TEXT}
          />
        </DashboardPanel>
        <DashboardPanel title="즐겨찾기 상위 장소">
          <DashboardTable
            columns={PLACE_COLUMNS}
            rows={stats.fvrtPlcs}
            rowKey="plcSn"
            emptyText={EMPTY_TEXT}
          />
        </DashboardPanel>
      </div>
    </section>
  );
}
