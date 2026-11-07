import { ArrowDown, ArrowUp } from 'lucide-react';
import { useState } from 'react';
import BarChart from '@/components/BarChart';
import CurveChart from '@/components/CurveChart';
import Icon from '@/components/Icon';
import {
  diffDays,
  formatDate,
  formatMonthDayDot,
  getHmOf,
  getTodayYmd,
  getYmdOf,
} from '@/utils/formatDate';
import { showToast } from '@/components/toastStore';
import { CARE_ZONE } from '../careDue';
import { DOSING, FILE_EXT_PDF } from '../checkup/checkupTypes';
import { getAttachmentFile } from '../checkupApi';
import ObservationPhoto from '../diary/ObservationPhoto';
import { SELECT_ARROW_STYLE, SELECT_CLASS } from '../diary/formStyles';
import { formatDiff, formatPart, formatSize } from '../diary/observationUtils';
import { STOOL_STATES } from '../diaryTypes';
import AttachmentImage from '../summary/AttachmentImage';
import PhotoModal from '../summary/PhotoModal';
import {
  getCheckupDetailPath,
  getCheckupType,
  getFunctionTagName,
} from '../summary/summaryUtils';
import DashboardCard from './DashboardCard';

/**
 * [대시보드 고른 항목 카드] (※신규 정책)
 * - 항목마다 본문 { period, title?, body } 계산. 기록이 없으면 null(빈 상태)
 * - 문구·배치는 프로토타입 원문, 값은 실제 API
 */

const toNumber = (value) => (value == null ? null : Number(value));

const joinSeries = (values, labels, unit) =>
  values.map((v, i) => `${labels[i]} ${v}${unit}`).join(', ');

/** 식사량·음수량·산책 지표 키·단위 */
const DAILY_SUM = {
  meal: { key: 'meal', unit: 'g', chartName: '식사량' },
  water: { key: 'water', unit: 'ml', chartName: '음수량' },
  walk: { key: 'walk', unit: '분', chartName: '산책 시간' },
};

/** 케어리스트 카드 최대 줄 수 */
const CARE_ROW_COUNT = 4;
/** 처방·투약 카드 최대 줄 수 */
const PRESCRIPTION_ROW_COUNT = 3;

function Delta({ label, delta, unit }) {
  if (delta == null) return null;
  const Arrow = delta > 0 ? ArrowUp : ArrowDown;
  const amount = Math.abs(Math.round(delta * 10) / 10);

  return (
    <p className="flex items-center gap-2 text-sm">
      <span className="text-subtle">{label}</span>
      <b className="inline-flex h-[26px] items-center gap-0.5 rounded-full bg-surface-2 px-2.5 font-semibold text-ink-2">
        {amount === 0 ? (
          '변화 없음'
        ) : (
          <>
            <Arrow className="size-4" aria-hidden="true" />
            <span className="sr-only">{delta > 0 ? '증가 ' : '감소 '}</span>
            {amount}
            {unit}
          </>
        )}
      </b>
    </p>
  );
}

function BigValue({ value, unit }) {
  return (
    <p className="flex items-baseline gap-1">
      <b
        className={`leading-none font-bold tracking-[-0.02em] text-ink ${
          typeof value === 'number' ? 'text-[34px]' : 'text-[22px]'
        }`}
      >
        {value}
      </b>
      {unit && <span className="text-muted">{unit}</span>}
    </p>
  );
}

function ValueRow({ value, unit, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
      <BigValue value={value} unit={unit} />
      {children}
    </div>
  );
}

function Note({ children }) {
  return <p className="mt-1 text-sm text-subtle">{children}</p>;
}

function Rows({ children }) {
  return <ul className="flex flex-col">{children}</ul>;
}

function Row({ children }) {
  return (
    <li className="flex min-w-0 items-center gap-2 border-b border-line-soft py-2.5 first:pt-0 last:border-b-0 last:pb-0">
      {children}
    </li>
  );
}

function KeyValue({ label, value }) {
  return (
    <Row>
      <span className="shrink-0 text-ink-2">{label}</span>
      <b
        className={`ml-auto min-w-0 text-right font-semibold ${
          value ? 'text-ink' : 'font-normal text-muted'
        }`}
      >
        {value || '등록된 내용 없음'}
      </b>
    </Row>
  );
}

function Chip({ className, children }) {
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-[13px] font-semibold whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}

const weightBody = ({ indicators }) => {
  const weight = indicators?.weight;
  if (!weight) return null;
  const values = weight.points.map((point) => toNumber(point.rcdNvl));
  const labels = weight.points.map((point) => formatMonthDayDot(point.rcdDt));
  return {
    period: '최근 5건',
    body: (
      <>
        <ValueRow value={toNumber(weight.latestNvl)} unit="kg">
          <Delta
            label="직전 기록 대비"
            delta={toNumber(weight.prevDiff)}
            unit="kg"
          />
        </ValueRow>
        {values.length > 0 && (
          <div className="mt-auto pt-3">
            <CurveChart
              values={values}
              labels={labels}
              formatValue={(v) => `${v}kg`}
              label={`체중 꺾은선 그래프 · ${joinSeries(values, labels, 'kg')}`}
            />
          </div>
        )}
      </>
    ),
  };
};

const dailySumBody =
  (id) =>
  ({ indicators }) => {
    const { key, unit, chartName } = DAILY_SUM[id];
    const indicator = indicators?.[key];
    if (!indicator) return null;
    const todaySum = toNumber(indicator.todaySum);
    const values = indicator.points.map((point) => toNumber(point.sumNvl));
    const labels = indicator.points.map((point) =>
      formatMonthDayDot(point.rcdYmd),
    );
    return {
      period: '최근 5일',
      body: (
        <>
          <ValueRow
            value={todaySum ?? '오늘 기록 없음'}
            unit={todaySum == null ? null : `${unit} / 오늘 합계`}
          >
            <Delta
              label="직전 기록일 대비"
              delta={toNumber(indicator.prevDiff)}
              unit={unit}
            />
          </ValueRow>
          {values.length > 0 && (
            <div className="mt-auto pt-3">
              <BarChart
                values={values}
                labels={labels}
                label={`${chartName} 일 합계 막대그래프 · ${joinSeries(values, labels, unit)} · 점선은 평균`}
              />
              <Note>점선은 평균</Note>
            </div>
          )}
        </>
      ),
    };
  };

/** 검사 수치 카드 처음 항목 */
const DEFAULT_INSPECTION = 'CREA';

/**
 * [검사 수치 카드 본문] (※신규 정책, 추가-4)
 * - 맨 위 한 줄: 왼쪽 "최근 n회", 오른쪽 항목 선택창([기능 태그] 항목명)
 * - 처음 항목: ?inspection= 값이 등록된 항목이면 그 항목 → CREA → 첫 항목
 */
function InspectionTrend({ trends, initialInspection }) {
  const itemNames = Object.keys(trends);
  const [selectedNm, setSelectedNm] = useState(
    () =>
      [initialInspection, DEFAULT_INSPECTION].find((nm) =>
        itemNames.includes(nm),
      ) ?? itemNames[0],
  );
  const trend = trends[selectedNm] ?? trends[itemNames[0]];
  const { points, unitNm = '' } = trend;
  const values = points.map((point) => toNumber(point.rsltNvl));
  const labels = points.map((point) => formatMonthDayDot(point.ckupYmd));
  const low = toNumber(trend.refLlmtNvl);
  const high = toNumber(trend.refUplmtNvl);
  const band = low != null && high != null ? [low, high] : undefined;
  const latest = values[values.length - 1];
  const delta = values.length >= 2 ? latest - values[values.length - 2] : null;

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="shrink-0 text-sm text-subtle">최근 {points.length}회</p>
        <select
          aria-label="검사 항목 선택"
          value={trend.inspNm}
          className={`${SELECT_CLASS} w-auto! min-w-0 max-w-[60%]`}
          style={SELECT_ARROW_STYLE}
          onChange={(event) => setSelectedNm(event.target.value)}
        >
          {itemNames.map((name) => (
            <option key={name} value={name}>
              [{getFunctionTagName(trends[name].fnctTagCd)}] {name}
            </option>
          ))}
        </select>
      </div>
      <ValueRow value={latest} unit={unitNm}>
        <Delta label="지난 검사 대비" delta={delta} unit="" />
      </ValueRow>
      {values.length >= 2 && (
        <div className="mt-auto pt-3">
          <CurveChart
            key={trend.inspNm}
            values={values}
            labels={labels}
            band={band}
            label={`${trend.inspNm} 수치 꺾은선 그래프 · ${joinSeries(values, labels, '')} ${unitNm}`}
          />
          {band && (
            <Note>
              점선은 참고범위 {low}~{high}
            </Note>
          )}
        </div>
      )}
    </>
  );
}

const inspectionBody = ({ summary, initialInspection }) => {
  if (Object.keys(summary.trends).length === 0) return null;
  return {
    body: (
      <InspectionTrend
        trends={summary.trends}
        initialInspection={initialInspection}
      />
    ),
  };
};

/** 첨부 자료 한 줄 수 */
const ATTACHMENT_ROW_COUNT = 4;

const isImageAttachment = (attachment) =>
  attachment.fileExtnCd !== FILE_EXT_PDF;

/**
 * [첨부 자료 카드 본문] (※신규 정책, 추가-2)
 * - 이미지는 누르면 미리보기, PDF는 내려받기(비공개 파일이라 받은 Blob을 임시 주소로 바꿔 내려받음)
 */
function AttachmentRows({ petSn, attachments }) {
  const [photo, setPhoto] = useState(null);

  const handleOpen = async (attachment) => {
    if (isImageAttachment(attachment)) {
      setPhoto(attachment);
      return;
    }
    try {
      const blob = await getAttachmentFile({
        petSn,
        ckupRcdAtchSn: attachment.ckupRcdAtchSn,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.orgnlFileNm;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast('파일을 내려받지 못했어요. 잠시 뒤 다시 시도해 주세요');
    }
  };

  return (
    <>
      <Rows>
        {attachments.slice(0, ATTACHMENT_ROW_COUNT).map((attachment) => {
          const isImage = isImageAttachment(attachment);
          return (
            <Row key={attachment.ckupRcdAtchSn}>
              <button
                type="button"
                aria-label={`${attachment.orgnlFileNm} ${isImage ? '미리보기' : '다운로드'}`}
                className="flex min-w-0 flex-1 items-center gap-2 text-left hover:text-brand-600"
                onClick={() => handleOpen(attachment)}
              >
                <Chip className="bg-surface-3 text-muted">
                  {isImage ? 'IMG' : 'PDF'}
                </Chip>
                <b className="min-w-0 truncate font-semibold">
                  {attachment.orgnlFileNm}
                </b>
                <span className="ml-auto shrink-0 text-sm text-subtle tabular-nums">
                  {formatDate(getYmdOf(attachment.regDt))}
                </span>
              </button>
            </Row>
          );
        })}
      </Rows>
      {photo && (
        <PhotoModal onClose={() => setPhoto(null)}>
          <AttachmentImage
            petSn={petSn}
            attachment={photo}
            className="w-full rounded-[10px]"
          />
        </PhotoModal>
      )}
    </>
  );
}

const attachmentBody = ({ summary, petSn }) => {
  if (summary.attachments.length === 0) return null;
  return {
    period: '최근 4건',
    body: <AttachmentRows petSn={petSn} attachments={summary.attachments} />,
  };
};

const stoolBody = ({ stools }) => {
  if (!stools || stools.length === 0) return null;
  const latest = stools[stools.length - 1];
  const latestYmd = getYmdOf(latest.rcdDt);
  const counts = STOOL_STATES.map((state) => ({
    ...state,
    count: stools.filter((record) => record.crsdSttsCd === state.cd).length,
  }));
  const max = Math.max(1, ...counts.map((state) => state.count));
  const latestName =
    STOOL_STATES.find((state) => state.cd === latest.crsdSttsCd)?.nm ?? '-';
  return {
    period: `최근 ${stools.length}개 기록`,
    body: (
      <>
        <BigValue
          value={latestName}
          unit={`${latestYmd === getTodayYmd() ? '오늘' : formatMonthDayDot(latestYmd)} ${getHmOf(latest.rcdDt)}`}
        />
        <ul
          aria-label="배변 상태별 횟수"
          className="mt-auto grid grid-cols-5 gap-2 pt-4 text-center"
        >
          {counts.map((state, index) => (
            <li key={state.cd} className="flex flex-col items-center gap-1">
              <span className="flex h-16 w-full items-end justify-center">
                <i
                  aria-hidden="true"
                  className={`block w-6 rounded-t-[4px] ${index === 0 ? 'bg-brand-500' : 'bg-line-strong'}`}
                  style={{
                    height: `${Math.max(4, (state.count / max) * 100)}%`,
                  }}
                />
              </span>
              <b className="text-sm text-ink">{state.count}회</b>
              <span className="text-xs text-subtle">{state.nm}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  };
};

const checkupBody = ({ checkups }) => {
  const today = getTodayYmd();
  const past = (checkups ?? []).filter((checkup) => checkup.ckupYmd <= today);
  if (past.length === 0) return null;
  return {
    period: '최근 5건',
    body: (
      <Rows>
        {past.map((checkup) => {
          const type = getCheckupType(checkup.ckupTypeCd);
          const detail = [checkup.hsptlNm, checkup.ckupCn?.split('\n')[0]]
            .filter(Boolean)
            .join(' · ');
          return (
            <Row key={checkup.ckupRcdSn}>
              <b className="shrink-0 font-semibold text-ink tabular-nums">
                {formatDate(checkup.ckupYmd)}
              </b>
              <Chip className={type.tone.chip}>{type.nm}</Chip>
              <span className="min-w-0 truncate text-muted">{detail}</span>
            </Row>
          );
        })}
      </Rows>
    ),
  };
};

const prescriptionBody = ({ summary }) => {
  const prescriptions = [...summary.prescriptions].sort(
    (a, b) => Number(b.prscSttsCd === DOSING) - Number(a.prscSttsCd === DOSING),
  );
  if (prescriptions.length === 0) return null;
  /** [더보기]: 맨 위 처방의 검진상세 처방약 탭. 검진기록 번호가 없으면 item.moveTo(건강 일지 검진기록 탭) */
  const top = prescriptions[0];
  return {
    moveTo:
      top.ckupRcdSn != null
        ? getCheckupDetailPath(top, 'prescription')
        : undefined,
    period: `복용 중 ${summary.dosingCount}건`,
    body: (
      <Rows>
        {prescriptions.slice(0, PRESCRIPTION_ROW_COUNT).map((prescription) => {
          const isDosing = prescription.prscSttsCd === DOSING;
          return (
            <Row key={prescription.prscSn}>
              <Chip
                className={
                  isDosing
                    ? 'bg-brand-50 text-brand-600'
                    : 'bg-surface-3 text-muted'
                }
              >
                {isDosing ? '복용 중' : '복용 종료'}
              </Chip>
              <b className="min-w-0 truncate font-semibold text-ink">
                {prescription.mdcnNm}
              </b>
              {prescription.dayMdcnNmtm != null && (
                <span className="ml-auto shrink-0 text-muted">
                  1일 {prescription.dayMdcnNmtm}회
                </span>
              )}
            </Row>
          );
        })}
      </Rows>
    ),
  };
};

function ObservationFigure({ petSn, label, cycle, cycleNo, diffText }) {
  return (
    <figure className="min-w-0">
      <div className="grid h-24 place-items-center overflow-hidden rounded-[10px] border border-dashed border-line-strong bg-surface-2 text-subtle">
        <ObservationPhoto
          petSn={petSn}
          obsrvCyclSn={cycle.obsrvCyclSn}
          className="size-full object-cover"
          fallback={<Icon name="photo_camera" className="text-[32px]" />}
        />
      </div>
      <figcaption className="mt-1.5 text-center text-xs/[1.5] text-subtle">
        {label}
        <br />
        {formatMonthDayDot(getYmdOf(cycle.obsrvDt))} · {cycleNo}회차
        {cycle.obsrvSz != null && ` · ${formatSize(cycle.obsrvSz)}`}
        {diffText && ` (${diffText})`}
      </figcaption>
    </figure>
  );
}

const observationBody = ({ summary, petSn }) => {
  const item = summary.observations[0];
  if (!item) return null;
  const { firstCycle: first, lastCycle: last, cyclCnt } = item;
  const hasCompare = cyclCnt > 1;
  const sizeDiff =
    hasCompare && first.obsrvSz != null && last.obsrvSz != null
      ? last.obsrvSz - first.obsrvSz
      : null;
  const days = hasCompare
    ? diffDays(getYmdOf(first.obsrvDt), getYmdOf(last.obsrvDt))
    : 0;
  const summaryText =
    sizeDiff == null
      ? hasCompare && last.obsrvChgCdNm
        ? `${days}일 동안 ${last.obsrvChgCdNm}`
        : ''
      : formatDiff(sizeDiff)
        ? `${days}일 동안 ${Math.abs(Math.round(sizeDiff * 10) / 10)}mm ${sizeDiff > 0 ? '커짐' : '작아짐'}`
        : `${days}일 동안 변화 없음`;
  return {
    period: `관찰중 ${summary.observations.length}건`,
    body: (
      <>
        <p className="font-semibold text-ink">
          {item.obsrvArtclNm} · {formatPart(item)}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <ObservationFigure
            petSn={petSn}
            label="첫 기록 사진"
            cycle={first}
            cycleNo={1}
          />
          {hasCompare && (
            <ObservationFigure
              petSn={petSn}
              label="최근 사진"
              cycle={last}
              cycleNo={cyclCnt}
              diffText={sizeDiff == null ? '' : formatDiff(sizeDiff)}
            />
          )}
        </div>
        {summaryText && <Note>{summaryText}</Note>}
      </>
    ),
  };
};

const allergyBody = ({ summary }) => {
  const { algyCn, dssCn } = summary.pet;
  if (!algyCn?.trim() && !dssCn?.trim()) return null;
  return {
    period: '진료 시 반드시 확인',
    body: (
      <>
        <Rows>
          <KeyValue label="알레르기" value={algyCn?.trim()} />
          <KeyValue label="기저질환" value={dssCn?.trim()} />
        </Rows>
      </>
    ),
  };
};

const preventionBody = ({ summary }) => {
  const { vaccinations, nextVaccinationYmd, latestRegularYmd, nextRegularYmd } =
    summary.prevention;
  const latestVaccination = vaccinations[0];
  if (
    !latestVaccination &&
    !nextVaccinationYmd &&
    !latestRegularYmd &&
    !nextRegularYmd
  )
    return null;
  const vaccinationText =
    latestVaccination &&
    [
      formatDate(latestVaccination.ckupYmd),
      latestVaccination.ckupCn?.split('\n')[0],
      '(완료)',
    ]
      .filter(Boolean)
      .join(' ');
  return {
    period: '예방 · 정기검진',
    body: (
      <Rows>
        <KeyValue label="예방접종" value={vaccinationText} />
        <KeyValue
          label="다음 접종 예정"
          value={
            nextVaccinationYmd
              ? `${formatDate(nextVaccinationYmd)} (예정)`
              : '등록된 예정 일정 없음'
          }
        />
        <KeyValue
          label="최근 검진"
          value={
            latestRegularYmd &&
            `${formatDate(latestRegularYmd)} 정기검진 (완료)`
          }
        />
        <KeyValue
          label="다음 검진 예정"
          value={
            nextRegularYmd
              ? `${formatDate(nextRegularYmd)} (예정)`
              : '등록된 예정 일정 없음'
          }
        />
      </Rows>
    ),
  };
};

const careBody = ({ care }) => {
  if (!care) return null;
  const { careItems, careRecords } = care;
  const todayYmd = getTodayYmd();
  const dailyItems = careItems.filter(
    (item) => item.careZoneCd === CARE_ZONE.DAILY,
  );
  if (dailyItems.length === 0) return null;
  /** 케어 캘린더 토탈 케어리스트와 같은 오늘 완료 기준 */
  const isDoneToday = (item) =>
    item.prscSn != null
      ? item.todayCmptnCnt >= item.dayMdcnNmtm
      : careRecords.some(
          (record) =>
            record.careArtclSn === item.careArtclSn &&
            record.cmptnYmd === todayYmd,
        );
  return {
    period: '보기 전용 · 체크는 케어 캘린더에서',
    body: (
      <Rows>
        {dailyItems.slice(0, CARE_ROW_COUNT).map((item) => {
          const isDone = isDoneToday(item);
          /** 보기 전용이라 체크 칸처럼 보이는 동그라미를 두지 않음(추가-1). 글자는 카드 머리와 같은 왼쪽 선 */
          return (
            <Row key={item.careArtclSn}>
              <b className="min-w-0 truncate font-semibold text-ink">
                {item.careArtclNm}
              </b>
              <span className="ml-auto shrink-0 text-muted">
                {isDone ? '오늘 완료' : '오늘 미완료'}
              </span>
            </Row>
          );
        })}
      </Rows>
    ),
  };
};

/** 항목 키 → 본문 만들기 */
const WIDGET_BODIES = {
  weight: weightBody,
  meal: dailySumBody('meal'),
  water: dailySumBody('water'),
  walk: dailySumBody('walk'),
  poop: stoolBody,
  ckup: checkupBody,
  insp: inspectionBody,
  presc: prescriptionBody,
  atch: attachmentBody,
  obsv: observationBody,
  allergy: allergyBody,
  vacc: preventionBody,
  care: careBody,
};

/** 고른 항목 카드 한 장: 기록이 있으면 본문, 없으면 빈 상태 */
export default function WidgetCard({ item, sources }) {
  return (
    <DashboardCard
      item={item}
      content={WIDGET_BODIES[item.id](sources)}
      petSn={sources.petSn}
      petNm={sources.petNm}
    />
  );
}
