import { addDays, getYmdOf } from '@/utils/formatDate';
import {
  STOOL,
  STOOL_STATES,
  WEIGHT,
  findRecordType,
  findStoolState,
} from '../diaryTypes';
import { round2 } from '../numberFormat';

/**
 * [일상 기록 계산]
 * - 서버 응답(일상 기록 배열)에서 그래프·오늘의 기록·날짜별 표에 쓸 값을 뽑음
 */

/** 건강기록 변화 그래프에 쓰는 최근 기록 수 */
export const RECENT_RECORD_COUNT = 5;

const compareRecords = (a, b) => {
  const aKey = a.rcdDt;
  const bKey = b.rcdDt;
  if (aKey !== bKey) return aKey < bKey ? -1 : 1;
  return a.dailyHlthRcdSn - b.dailyHlthRcdSn;
};

/** 날짜·시각 오름차순 */
export const pickType = (records, typeCd) =>
  records
    .filter((record) => record.dailyRcdIdctCd === typeCd)
    .sort(compareRecords);

const sumValues = (records) =>
  round2(records.reduce((sum, record) => sum + record.rcdNvl, 0));

export const formatAmount = (typeCd, value) =>
  `${round2(value)}${findRecordType(typeCd).unit}`;

/** 기록 한 건의 표시 값. 배변상태는 상태 이름 */
export const formatRecordValue = (record) =>
  record.dailyRcdIdctCd === STOOL
    ? findStoolState(record.crsdSttsCd).nm
    : formatAmount(record.dailyRcdIdctCd, record.rcdNvl);

/** 종류별 하루 요약: 기록 목록·횟수·합계·가장 늦은 기록 */
export const summarizeType = (dayRecords, typeCd) => {
  const items = pickType(dayRecords, typeCd);
  return {
    items,
    count: items.length,
    sum: typeCd === STOOL ? null : sumValues(items),
    latest: items[items.length - 1] ?? null,
  };
};

/** 그래프 점. 체중은 기록마다, 식사량·음수량·산책은 최근 5개 기록이 걸친 날의 하루 합계(첫 날도 그날 기록 전부) */
export const getTrendPoints = (records, typeCd) => {
  const all = pickType(records, typeCd);
  const recent = all.slice(-RECENT_RECORD_COUNT);
  if (typeCd === WEIGHT) {
    return {
      recordCount: recent.length,
      points: recent.map((record) => ({
        ymd: getYmdOf(record.rcdDt),
        value: round2(record.rcdNvl),
      })),
    };
  }
  const sumsByYmd = new Map();
  const firstYmd = getYmdOf(recent[0]?.rcdDt ?? '');
  all
    .filter((record) => getYmdOf(record.rcdDt) >= firstYmd)
    .forEach((record) => {
      sumsByYmd.set(
        getYmdOf(record.rcdDt),
        (sumsByYmd.get(getYmdOf(record.rcdDt)) ?? 0) + record.rcdNvl,
      );
    });
  return {
    recordCount: recent.length,
    points: [...sumsByYmd].map(([ymd, value]) => ({
      ymd,
      value: round2(value),
    })),
  };
};

/** 배변 상태별 횟수. 5종을 고정 순서로 0회도 포함 */
export const getStoolCounts = (records) => {
  const recent = pickType(records, STOOL).slice(-RECENT_RECORD_COUNT);
  return {
    recordCount: recent.length,
    counts: STOOL_STATES.map((state) => ({
      ...state,
      count: recent.filter((record) => record.crsdSttsCd === state.cd).length,
    })),
  };
};

/** 기록이 있는 날짜를 최근 순으로. periodDays는 오늘을 포함한 조회 일수 */
export const getRecordedYmds = (records, todayYmd, periodDays) => {
  const startYmd = addDays(todayYmd, -(periodDays - 1));
  return [
    ...new Set(
      records
        .map((record) => getYmdOf(record.rcdDt))
        .filter((ymd) => ymd >= startYmd && ymd <= todayYmd),
    ),
  ].sort((a, b) => (a < b ? 1 : -1));
};
