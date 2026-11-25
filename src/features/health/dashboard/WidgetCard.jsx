import { ArrowDown, ArrowUp } from 'lucide-react';
import { useState } from 'react';
import DropdownSelect from '@/components/DropdownSelect';
import BarChart from '@/components/BarChart';
import LineChart from '@/components/LineChart';
import Badge from '@/components/Badge';
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
import { DOSING, FILE_EXT_PDF } from '../checkup/checkupTypes';
import { getAttachmentFile } from '../checkupApi';
import ObservationPhoto from '../diary/ObservationPhoto';
import { formatDiff, formatPart, formatSize } from '../diary/observationUtils';
import { STOOL_STATES } from '../diaryTypes';
import AttachmentImage from '../summary/AttachmentImage';
import { round2 } from '../numberFormat';
import PhotoModal from '../summary/PhotoModal';
import {
  getCheckupDetailPath,
  getCheckupType,
  getFunctionTagName,
} from '../summary/summaryUtils';
import DashboardCard from './DashboardCard';
import WidgetTile from './WidgetTile';
import { MOBILE_HIDDEN_IDS } from './widgetItems';

/**
 * [대시보드 고른 항목 카드] (※신규 정책)
 * - 항목마다 본문 { period, body, tile } 계산. 기록이 없으면 null(빈 상태). tile은 760px 미만 요약 타일 값
 * - 문구·배치는 프로토타입 원문, 값은 실제 API
 */

/** 서버 수치를 숫자로. 소수 둘째 자리 반올림 */
const toNumber = (value) => (value == null ? null : round2(value));

const joinSeries = (values, labels, unit) =>
  values.map((v, i) => `${labels[i]} ${v}${unit}`).join(', ');

/** 식사량·음수량·산책 지표 키·단위 */
const DAILY_SUM = {
  meal: { key: 'meal', unit: 'g', chartName: '식사량' },
  water: { key: 'water', unit: 'ml', chartName: '음수량' },
  walk: { key: 'walk', unit: '분', chartName: '산책 시간' },
};

/** 타일 증감 칩 */
const deltaChip = (delta, unit) => {
  if (delta == null) return null;
  const amount = Math.abs(round2(delta));
  if (amount === 0) return { tone: 'gray', text: '변화 없음' };
  return {
    tone: 'gray',
    text: `${delta > 0 ? '증가' : '감소'} ${amount}${unit}`,
  };
};

/** 처방·투약 카드 최대 줄 수 */
const PRESCRIPTION_ROW_COUNT = 3;

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

/**
 * 마우스를 올리면 전체 값(title)
 * - isTruncate: 값을 한 줄 말줄임(예방·정기검진)
 * - isTwoLine: 값을 최대 2줄, 글자 단위 줄바꿈 후 말줄임(알레르기·기저질환, 추가-5)
 */
function KeyValue({ label, value, isTruncate = false, isTwoLine = false }) {
  const clampClass = isTruncate
    ? 'truncate'
    : isTwoLine
      ? 'line-clamp-2 break-all'
      : '';
  return (
    <Row>
      <span className="shrink-0 text-ink-2">{label}</span>
      <b
        className={`ml-auto min-w-0 text-right font-semibold ${
          value ? 'text-ink' : 'font-normal text-muted'
        } ${clampClass}`}
        title={(isTruncate || isTwoLine) && value ? value : undefined}
      >
        {value || '등록된 내용 없음'}
      </b>
    </Row>
  );
}

/** 공용 차트 입력: 값·날짜 배열 → [{ label, value }] */
const toPoints = (values, labels) =>
  values.map((value, i) => ({ label: labels[i], value }));

const weightBody = ({ indicators }) => {
  const weight = indicators?.weight;
  if (!weight) return null;
  const values = weight.points.map((point) => toNumber(point.rcdNvl));
  const labels = weight.points.map((point) => formatMonthDayDot(point.rcdDt));
  const prevPoint = weight.points[weight.points.length - 2];
  return {
    tile: {
      value: `${toNumber(weight.latestNvl)}kg`,
      chip: deltaChip(toNumber(weight.prevDiff), 'kg'),
      sub: prevPoint
        ? `${formatMonthDayDot(prevPoint.rcdDt)} 기록 대비`
        : '최근 기록',
    },
    period: '최근 5건',
    body: (
      <>
        {/* 최근 체중은 말풍선(마지막 점)으로만 보임 */}
        {values.length > 0 && (
          <div className="mt-auto pt-2">
            <LineChart
              points={toPoints(values, labels)}
              formatValue={(v) => `${v}kg`}
              ariaLabel={`체중 꺾은선 그래프 · ${joinSeries(values, labels, 'kg')}`}
              height={146}
            />
          </div>
        )}
      </>
    ),
  };
};

/**
 * 식사량·음수량·산책 카드: points는 기록이 있는 최근 5일의 하루 합계(날짜 오름차순)
 * - 오늘 기록이 있으면 오늘 합계와 직전 기록일 대비(prevDiff, 서버 값)
 * - 오늘 기록이 없으면 마지막 기록일 합계와 그 앞 기록일과의 차이(서버 prevDiff가 null이라 화면에서 계산, 점 1개면 없음)
 */
const dailySumBody =
  (id) =>
  ({ indicators }) => {
    const { key, unit, chartName } = DAILY_SUM[id];
    const indicator = indicators?.[key];
    if (!indicator || indicator.points.length === 0) return null;
    const todaySum = toNumber(indicator.todaySum);
    const values = indicator.points.map((point) => toNumber(point.sumNvl));
    const labels = indicator.points.map((point) =>
      formatMonthDayDot(point.rcdYmd),
    );
    const sums = values.filter((value) => value != null);
    const isToday = todaySum != null;
    const shownSum = isToday ? todaySum : values.at(-1);
    const prevSum = values.length > 1 ? values.at(-2) : null;
    const delta = isToday
      ? toNumber(indicator.prevDiff)
      : shownSum != null && prevSum != null
        ? round2(shownSum - prevSum)
        : null;
    const average =
      sums.length > 0
        ? round2(sums.reduce((a, b) => a + b, 0) / sums.length)
        : null;
    return {
      tile: {
        value: `${shownSum}${unit}`,
        chip: deltaChip(delta, unit),
        sub: average != null ? `최근 5개 기록 평균 ${average}${unit}` : '',
      },
      period: '최근 5개 기록',
      periodAside: (
        <p className="flex shrink-0 items-baseline gap-1 text-sm text-subtle">
          {isToday ? '오늘' : labels.at(-1)} 합계
          <b className="text-2xl leading-none font-bold text-ink">{shownSum}</b>
          {unit}
        </p>
      ),
      body: (
        <>
          {average != null && (
            <p className="flex items-center gap-1.5 text-sm text-ink-2">
              <svg width="16" height="2" aria-hidden="true">
                <path
                  d="M0 1H16"
                  stroke="var(--color-brand-500)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              </svg>
              평균 {average}
              {unit}
            </p>
          )}
          {values.length > 0 && (
            <div className="mt-auto pt-2">
              <BarChart
                points={toPoints(values, labels)}
                formatValue={(v) => `${v}${unit}`}
                ariaLabel={`${chartName} 일 합계 막대그래프 · ${joinSeries(values, labels, unit)} · 점선은 평균`}
                showAverageLabel={false}
              />
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
 * - 처음 항목: CREA → 첫 항목 (?inspection= 처음 항목은 검진상세 [추이 보기]와 함께 취소, 2026-11-23)
 */
function InspectionTrend({ trends }) {
  const itemNames = Object.keys(trends);
  const [selectedNm, setSelectedNm] = useState(() =>
    itemNames.includes(DEFAULT_INSPECTION) ? DEFAULT_INSPECTION : itemNames[0],
  );
  const trend = trends[selectedNm] ?? trends[itemNames[0]];
  const { points, unitNm = '' } = trend;
  const values = points.map((point) => toNumber(point.rsltNvl));
  const labels = points.map((point) => formatMonthDayDot(point.ckupYmd));
  const low = toNumber(trend.refLlmtNvl);
  const high = toNumber(trend.refUplmtNvl);
  const band = low != null && high != null ? [low, high] : undefined;

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="shrink-0 text-sm text-subtle">최근 {points.length}회</p>
        <DropdownSelect
          label="검사 항목 선택"
          value={trend.inspNm}
          options={itemNames.map((name) => ({
            value: name,
            label: `[${getFunctionTagName(trends[name].fnctTagCd)}] ${name}`,
          }))}
          className="max-w-[60%]"
          onChange={setSelectedNm}
        />
      </div>
      {/* 최근 값은 말풍선(마지막 점)으로만 보임. 기록 1회면 점 하나 + 말풍선(추가-4) */}
      {values.length >= 1 && (
        <div className="mt-auto pt-2">
          <LineChart
            key={trend.inspNm}
            points={toPoints(values, labels)}
            band={band}
            formatValue={(v) => `${v}${unitNm}`}
            ariaLabel={`${trend.inspNm} 수치 꺾은선 그래프 · ${joinSeries(values, labels, '')} ${unitNm}`}
            height={126}
            labelEvery={values.length >= 5 ? 2 : 1}
          />
        </div>
      )}
    </>
  );
}

const inspectionBody = ({ summary }) => {
  if (Object.keys(summary.trends).length === 0) return null;
  return { body: <InspectionTrend trends={summary.trends} /> };
};

/** 첨부 자료 한 줄 수 */
const ATTACHMENT_ROW_COUNT = 3;

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
      showToast('파일을 내려받지 못했어요. 잠시 뒤 다시 시도해 주세요', {
        type: 'error',
      });
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
                <Badge tone="muted">{isImage ? 'IMG' : 'PDF'}</Badge>
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
  const latest = summary.attachments[0];
  return {
    tile: {
      value: latest.orgnlFileNm,
      sub: formatDate(getYmdOf(latest.regDt)),
    },
    period: '최근 3건',
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
  const latestTime = `${latestYmd === getTodayYmd() ? '오늘' : formatMonthDayDot(latestYmd)} ${getHmOf(latest.rcdDt)}`;
  return {
    tile: { value: latestName, sub: latestTime },
    period: `최근 ${stools.length}건`,
    /** 기록 시간은 기간 줄 오른쪽 끝(「기록하기 ›」 아래 줄), 값 옆에는 두지 않음 */
    periodAside: (
      <p className="shrink-0 text-sm whitespace-nowrap text-subtle">
        마지막 기록 {latestTime}
      </p>
    ),
    body: (
      <>
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

/** 검진기록 카드 줄 수(조회 개수 CHECKUP_COUNT와 따로) */
const CHECKUP_ROW_COUNT = 3;

const checkupBody = ({ checkups }) => {
  const today = getTodayYmd();
  const past = (checkups ?? []).filter((checkup) => checkup.ckupYmd <= today);
  if (past.length === 0) return null;
  return {
    period: '최근 3건',
    body: (
      <Rows>
        {past.slice(0, CHECKUP_ROW_COUNT).map((checkup) => {
          const type = getCheckupType(checkup.ckupTypeCd);
          const detail = [checkup.hsptlNm, checkup.ckupCn?.split('\n')[0]]
            .filter(Boolean)
            .join(' · ');
          return (
            <Row key={checkup.ckupRcdSn}>
              <b className="shrink-0 font-semibold text-ink tabular-nums">
                {formatDate(checkup.ckupYmd)}
              </b>
              <Badge tone={type.toneKey} className="shrink-0">
                {type.nm}
              </Badge>
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
  /** 「처방 보기 ›」: 맨 위 처방의 검진상세 처방·투약 탭. 검진기록 번호가 없으면 item.moveTo(건강 일지 검진기록 탭) */
  const top = prescriptions[0];
  return {
    tile: { value: top.mdcnNm, sub: `복용 중 ${summary.dosingCount}건` },
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
              <Badge tone={isDosing ? 'brand' : 'muted'} className="shrink-0">
                {isDosing ? '복용 중' : '복용 종료'}
              </Badge>
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
      <div className="grid h-16 place-items-center overflow-hidden rounded-[10px] border border-dashed border-line-strong bg-surface-2 text-subtle">
        <ObservationPhoto
          petSn={petSn}
          obsrvCyclSn={cycle.obsrvCyclSn}
          className="size-full object-cover"
          fallback={<Icon name="photo_camera" className="text-[28px]" />}
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

/** 관찰 타일 칩: 첫 회차 대비 크기, 크기가 없으면 변화 단계 */
const observationChip = (hasCompare, sizeDiff, obsrvChgCdNm) => {
  if (!hasCompare) return null;
  if (sizeDiff == null)
    return obsrvChgCdNm ? { tone: 'gray', text: obsrvChgCdNm } : null;
  const amount = Math.abs(round2(sizeDiff));
  if (!formatDiff(sizeDiff)) return { tone: 'gray', text: '변화 없음' };
  return sizeDiff < 0
    ? { tone: 'green', text: `▼ ${amount}mm 작아짐` }
    : { tone: 'rose', text: `▲ ${amount}mm 커짐` };
};

/** 관찰 항목 한 개의 첫·최근 비교 값 */
const getObservationCompare = (item) => {
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
        ? `${days}일 동안 ${Math.abs(round2(sizeDiff))}mm ${sizeDiff > 0 ? '커짐' : '작아짐'}`
        : `${days}일 동안 변화 없음`;
  return { first, last, cyclCnt, hasCompare, sizeDiff, days, summaryText };
};

/**
 * [지속 관찰 카드 본문] 맨 위 한 줄: 왼쪽 관찰 중 n건, 오른쪽 항목 선택창([부위] 항목명). 처음 항목은 가장 최근 관찰, 고른 항목은 저장 안 함 (※신규 정책, 2026-11-25)
 * - 그 아래 첫 기록 사진·최근 사진, 변화 문구
 */
function ObservationCompare({ items, petSn }) {
  const [selectedSn, setSelectedSn] = useState(items[0].obsrvArtclSn);
  const item =
    items.find((entry) => entry.obsrvArtclSn === selectedSn) ?? items[0];
  const { first, last, cyclCnt, hasCompare, sizeDiff, summaryText } =
    getObservationCompare(item);

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="shrink-0 text-sm text-subtle">관찰 중 {items.length}건</p>
        <DropdownSelect
          label="관찰 항목 선택"
          value={item.obsrvArtclSn}
          options={items.map((entry) => ({
            value: entry.obsrvArtclSn,
            label: `[${formatPart(entry)}] ${entry.obsrvArtclNm}`,
          }))}
          className="max-w-[60%]"
          onChange={setSelectedSn}
        />
      </div>
      {/* 항목명·부위는 선택창에 보이므로 따로 줄을 두지 않음: 카드 높이(300px) 안에 변화 문구까지 들어가게 (※신규 정책, 2026-11-25 사람 결정) */}
      <div className="grid grid-cols-2 gap-3">
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
  );
}

const observationBody = ({ summary, petSn }) => {
  const item = summary.observations[0];
  if (!item) return null;
  const { last, hasCompare, sizeDiff, days } = getObservationCompare(item);
  return {
    tile: {
      value: `관찰 중 ${summary.observations.length}건`,
      chip: observationChip(hasCompare, sizeDiff, last.obsrvChgCdNm),
      sub: hasCompare
        ? `${item.obsrvArtclNm} · ${days}일 동안`
        : item.obsrvArtclNm,
    },
    body: (
      <ObservationCompare
        key={petSn}
        items={summary.observations}
        petSn={petSn}
      />
    ),
  };
};

const allergyBody = ({ summary }) => {
  const { algyCn, dssCn } = summary.pet;
  if (!algyCn?.trim() && !dssCn?.trim()) return null;
  return {
    tile: algyCn?.trim()
      ? { value: algyCn.trim(), sub: `기저질환 ${dssCn?.trim() || '없음'}` }
      : { value: dssCn.trim(), sub: '알레르기 없음' },
    period: '진료 시 반드시 확인',
    body: (
      <>
        <Rows>
          <KeyValue isTwoLine label="알레르기" value={algyCn?.trim()} />
          <KeyValue isTwoLine label="기저질환" value={dssCn?.trim()} />
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
  const tileYmd = latestVaccination?.ckupYmd ?? nextVaccinationYmd;
  return {
    tile: {
      value: tileYmd ? formatDate(tileYmd) : '접종 기록이 없어요',
      sub: nextVaccinationYmd
        ? `다음 접종 ${formatMonthDayDot(nextVaccinationYmd)} 예정`
        : '예정 없음',
    },
    body: (
      <Rows>
        {/* 값은 날짜만(추가-7) */}
        <KeyValue
          isTruncate
          label="예방접종"
          value={latestVaccination && formatDate(latestVaccination.ckupYmd)}
        />
        <KeyValue
          isTruncate
          label="다음 접종 예정"
          value={
            nextVaccinationYmd
              ? formatDate(nextVaccinationYmd)
              : '등록된 예정 일정 없음'
          }
        />
        <KeyValue
          isTruncate
          label="최근 검진"
          value={latestRegularYmd && formatDate(latestRegularYmd)}
        />
        <KeyValue
          isTruncate
          label="다음 검진 예정"
          value={
            nextRegularYmd
              ? formatDate(nextRegularYmd)
              : '등록된 예정 일정 없음'
          }
        />
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
};

/** 고른 항목 카드 한 장(760px 이상)과 요약 타일(760px 미만) */
export default function WidgetCard({ item, sources }) {
  const content = WIDGET_BODIES[item.id](sources);
  return (
    <>
      <DashboardCard
        item={item}
        content={content}
        petSn={sources.petSn}
        petNm={sources.petNm}
        className="max-[760px]:hidden"
      />
      {!MOBILE_HIDDEN_IDS.includes(item.id) && (
        <WidgetTile
          item={item}
          content={content}
          petSn={sources.petSn}
          petNm={sources.petNm}
        />
      )}
    </>
  );
}
