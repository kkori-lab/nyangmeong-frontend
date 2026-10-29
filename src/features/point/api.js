import { getCurrentYm } from '@/utils/yearMonth';
import { toYmd } from '@/utils/formatDate';
import { PNT_HST_TY } from './shared/pointCodes';

/**
 * [포인트·케어미션 가짜 API]
 * - SJM 백엔드 API 나오기 전까지 사용 -> 나오면 본문만 api 요청으로 교체
 * - 미확정 키: pntBal·earnTotAmt·earnCnt·useTotAmt·useCnt·items·pntHstSn·pntHstTyCd·pntHstNm·pntAmt·pntHstYmd
 *   pets·msnSn·msnNm·msnPnt·cmplYn
 */
const BALANCE = 8450;

const { MISSION, CHECKUP, USE } = PNT_HST_TY;

/** [구분, 내용, 포인트] 최신순 템플릿 */
const HISTORY_TEMPLATE = [
  [MISSION, '케어미션 달성', 120],
  [USE, '아이템 구매 — 밀짚모자', -600],
  [CHECKUP, '검진기록 등록', 20],
  [MISSION, '케어미션 달성', 95],
  [MISSION, '케어미션 달성', 80],
  [USE, '아이템 구매 — 선글라스', -700],
  [MISSION, '케어미션 달성', 75],
  [MISSION, '케어미션 달성', 60],
  [CHECKUP, '검진기록 등록', 20],
  [MISSION, '케어미션 달성', 55],
  [MISSION, '케어미션 달성', 120],
  [MISSION, '케어미션 달성', 45],
];

/** HISTORY_TEMPLATE와 같은 순서의 일(최신순) */
const HISTORY_DAYS = [13, 12, 12, 11, 10, 9, 9, 8, 6, 5, 3, 2];

/** 이 달수 이전의 내역은 빈 것으로 처리 */
const EMPTY_AFTER_MONTHS = 6;

const monthsBefore = (ym) => {
  const [curYear, curMonth] = getCurrentYm().split('-').map(Number);
  const [year, month] = ym.split('-').map(Number);
  return (curYear - year) * 12 + (curMonth - month);
};

export const getPointBalance = async () => ({ pntBal: BALANCE });

export const getPointHistory = async (ym) => {
  const diff = monthsBefore(ym);
  const count =
    diff >= EMPTY_AFTER_MONTHS ? 0 : HISTORY_TEMPLATE.length - 2 * (diff % 5);
  const items = HISTORY_TEMPLATE.slice(0, count).map(
    ([pntHstTyCd, pntHstNm, pntAmt], index) => ({
      pntHstSn: Number(`${ym.replace('-', '')}${index}`),
      pntHstTyCd,
      pntHstNm,
      pntAmt,
      pntHstYmd: `${ym}-${String(HISTORY_DAYS[index]).padStart(2, '0')}`,
    }),
  );
  const earns = items.filter((item) => item.pntAmt > 0);
  const uses = items.filter((item) => item.pntAmt < 0);
  return {
    earnTotAmt: earns.reduce((sum, item) => sum + item.pntAmt, 0),
    earnCnt: earns.length,
    useTotAmt: uses.reduce((sum, item) => sum + item.pntAmt, 0),
    useCnt: uses.length,
    items,
  };
};

/** 주소에 ?fake=empty 가 있으면 주양육 동물이 없는 상태로 간주 */
const isFakeEmpty = () =>
  new URLSearchParams(window.location.search).get('fake') === 'empty';

/** [petSn, 이름, 오늘 완료 수, 미션 [이름, 배점]] */
const FAKE_PETS = [
  [
    1,
    '뭉치',
    5,
    [
      ['양치하기', 5],
      ['산책 기록하기', 10],
      ['체중 기록하기', 10],
      ['펫이야기 글 등록하기', 20],
      ['귀 청소하기', 10],
      ['식사량 기록하기', 10],
      ['가계부 지출 등록하기', 5],
      ['케어 캘린더 일정 등록하기', 5],
    ],
  ],
  [
    2,
    '나비',
    3,
    [
      ['체중 기록하기', 10],
      ['음수량 기록하기', 10],
      ['배변 기록하기', 5],
      ['발톱 정리하기', 10],
      ['식사량 기록하기', 10],
      ['관찰 기록 추가하기', 5],
      ['가계부 지출 등록하기', 5],
      ['케어 캘린더 일정 등록하기', 5],
    ],
  ],
  [
    3,
    '두부',
    3,
    [
      ['식사량 기록하기', 10],
      ['체중 기록하기', 10],
      ['양치하기', 5],
      ['음수량 기록하기', 10],
      ['배변 기록하기', 5],
      ['빗질하기', 10],
      ['가계부 지출 등록하기', 5],
      ['케어 캘린더 일정 등록하기', 5],
    ],
  ],
];

/** 지난 날짜는 날짜 글자로 정한 값으로 완료 수를 나눠 같은 날은 같은 결과가 보장 */
const getPastDoneCount = (ymd, petSn) =>
  [...ymd].reduce((sum, ch) => sum + ch.charCodeAt(0), petSn * 3) % 9;

export const getCareMissions = async (ymd) => {
  if (isFakeEmpty()) return { pets: [] };
  const isToday = ymd === toYmd(new Date());
  return {
    pets: FAKE_PETS.map(([petSn, petNm, todayDone, missions]) => {
      const doneCount = isToday ? todayDone : getPastDoneCount(ymd, petSn);
      return {
        petSn,
        petNm,
        missions: missions.map(([msnNm, msnPnt], index) => ({
          msnSn: petSn * 10 + index,
          msnNm,
          msnPnt,
          cmplYn: index < doneCount ? 'Y' : 'N',
        })),
      };
    }),
  };
};
