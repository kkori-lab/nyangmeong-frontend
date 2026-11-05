import Card from '@/components/Card';
import Icon from '@/components/Icon';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import { CardTitle, SummaryEmpty } from './SummaryParts';

const NO_SCHEDULE = '등록된 예정 일정 없음';

/**
 * [예방 · 정기검진 이력] (FN-HLT-011-04)
 * - 예방접종·정기검진 각각 완료 이력 + 다음 예정일
 * - 다음 예정일은 케어 캘린더의 같은 검진유형 병원 일정 중 오늘 이후 가장 가까운 날, 없으면 안내 문구
 */
export default function PreventionHistoryCard({ prevention }) {
  const { vaccinations, nextVaccinationYmd, latestRegularYmd, nextRegularYmd } =
    prevention;
  const isEmpty = vaccinations.length === 0 && latestRegularYmd === null;
  const nextYmd = nextVaccinationYmd ?? nextRegularYmd;

  return (
    <Card
      title={<CardTitle icon="verified_user">예방 · 정기검진 이력</CardTitle>}
      className="flex-1"
    >
      {isEmpty ? (
        <SummaryEmpty
          icon="verified_user"
          description={`다음 예정일: ${nextYmd ? formatDate(nextYmd) : NO_SCHEDULE}`}
          action="케어 캘린더에서 일정 등록하기"
          to={PATHS.HEALTH_CALENDAR}
        />
      ) : (
        // 태블릿은 타임라인 옆 반쪽 카드라 두 칸을 위아래로 (추가 요청)
        <div className="grid gap-3 sm:max-[760px]:grid-cols-2 min-[1101px]:grid-cols-2">
          <Box icon="vaccines" title="예방접종">
            {vaccinations.map((checkup) => (
              <Row key={checkup.ckupRcdSn} name={checkup.ckupTypeCdNm}>
                {formatDate(checkup.ckupYmd)}{' '}
                <span className="text-subtle">(완료)</span>
              </Row>
            ))}
            <Row name="다음 접종 예정">
              <Next ymd={nextVaccinationYmd} />
            </Row>
          </Box>
          <Box icon="calendar_month" title="정기검진">
            <Row name="최근 검진">
              {latestRegularYmd ? formatDate(latestRegularYmd) : '-'}
            </Row>
            <Row name="다음 검진 예정">
              <Next ymd={nextRegularYmd} />
            </Row>
          </Box>
        </div>
      )}
    </Card>
  );
}

function Box({ icon, title, children }) {
  return (
    <div className="rounded-xl bg-surface-2 p-4">
      <h3 className="mb-1 flex items-center gap-1 text-lg/[1.6] font-semibold">
        <Icon name={icon} className="text-xl text-brand-500" />
        {title}
      </h3>
      <dl>{children}</dl>
    </div>
  );
}

function Row({ name, children }) {
  return (
    <div className="flex flex-col border-t border-dashed border-line py-2.5 first:border-t-0">
      <dt className="text-base/[1.6] font-semibold text-ink">{name}</dt>
      <dd className="text-sm/[1.6] text-subtle">{children}</dd>
    </div>
  );
}

function Next({ ymd }) {
  if (!ymd) return <span className="text-placeholder">{NO_SCHEDULE}</span>;
  return (
    <>
      {formatDate(ymd)} <span className="text-subtle">(예정)</span>
    </>
  );
}
