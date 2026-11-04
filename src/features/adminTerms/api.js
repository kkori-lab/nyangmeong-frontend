import { getTodayYmd } from '@/utils/formatDate';
import { TERMS_KINDS } from './termsKinds';

/**
 * [관리자 약관 API]
 * - 백엔드 /api/admin/terms 없음 -> 메모리 배열 가짜 응답, 새로고침하면 처음 값
 * - 필드 이름은 공용 TermsResponse·TRMS 컬럼 그대로 + useYn, 등록일 regDt(가정)
 * - 연결할 API: GET /api/admin/terms, GET /api/admin/terms/history?trmsFixIdntfKey=,
 *   GET /api/admin/terms/{trmsSn}, POST /api/admin/terms
 */

/** 버전 최대 글자 수(가정) */
export const TRMS_VER_ID_MAX = 20;
/** 제목 최대 글자 수(가정) */
export const TRMS_TTL_MAX = 100;
/** 내용 최대 글자 수(가정) */
export const TRMS_CN_MAX = 20000;

/** 서버 오류 모양 */
const fakeError = (code, message) => ({
  code,
  message,
  fields: null,
  data: null,
});

/** 종류별 가짜 버전(오래된 순). 마지막이 사용 중 */
const FAKE_VERSIONS = {
  SERVICE: {
    esntlAgreYn: true,
    trmsTtl: '냥멍케어 이용약관',
    versions: [
      ['v1.0', '2026-03-02T10:00:00'],
      ['v1.1', '2026-06-15T10:00:00'],
      ['v1.2', '2026-09-01T10:00:00'],
    ],
  },
  PRIVACY: {
    esntlAgreYn: true,
    trmsTtl: '개인정보 수집 및 이용 동의',
    versions: [
      ['v1.0', '2026-03-02T10:00:00'],
      ['v1.1', '2026-08-20T10:00:00'],
    ],
  },
  AGE: {
    esntlAgreYn: true,
    trmsTtl: '만 14세 이상입니다',
    versions: [['v1.0', '2026-03-02T10:00:00']],
  },
  MARKETING: {
    esntlAgreYn: false,
    trmsTtl: '마케팅 정보 수신',
    versions: [['v1.0', '2026-03-02T10:00:00']],
  },
  CARE_RULE: {
    esntlAgreYn: true,
    trmsTtl: '우리동네 펫돌봄 이용수칙',
    versions: [['v1.0', '2026-07-10T10:00:00']],
  },
  LOST_PRIVACY: {
    esntlAgreYn: true,
    trmsTtl: '실종 제보 개인정보 공개 동의',
    versions: [['v1.0', '2026-07-10T10:00:00']],
  },
};

let nextTrmsSn = 1;

const fakeTerms = TERMS_KINDS.flatMap(({ trmsFixIdntfKey, name }) => {
  const { esntlAgreYn, trmsTtl, versions } = FAKE_VERSIONS[trmsFixIdntfKey];
  return versions.map(([trmsVerId, regDt], index) => ({
    trmsSn: nextTrmsSn++,
    trmsFixIdntfKey,
    trmsVerId,
    trmsTtl,
    trmsCn: `제1조(목적)\n이 문서는 ${name} ${trmsVerId} 내용입니다.\n\n제2조(시행일)\n이 약관은 ${regDt.slice(0, 10)}부터 시행합니다.`,
    esntlAgreYn,
    useYn: index === versions.length - 1,
    regDt,
  }));
});

const delay = () => new Promise((resolve) => setTimeout(resolve, 200));

/** 목록·이력 행: 내용 제외 */
const toSummary = (terms) => {
  const summary = { ...terms };
  delete summary.trmsCn;
  return summary;
};

const byNewest = (a, b) => b.trmsSn - a.trmsSn;

/** 종류별 사용 중인 버전: [{ trmsSn, trmsFixIdntfKey, trmsVerId, trmsTtl, esntlAgreYn, useYn, regDt }] */
export const getAdminTerms = async () => {
  await delay();
  return fakeTerms.filter((terms) => terms.useYn).map(toSummary);
};

/** 한 종류의 모든 버전(최신순, 내용 제외) */
export const getAdminTermsHistory = async ({ trmsFixIdntfKey }) => {
  await delay();
  return fakeTerms
    .filter((terms) => terms.trmsFixIdntfKey === trmsFixIdntfKey)
    .sort(byNewest)
    .map(toSummary);
};

/** 버전 하나(내용 포함) */
export const getAdminTerm = async (trmsSn) => {
  await delay();
  const terms = fakeTerms.find((item) => item.trmsSn === trmsSn);
  if (!terms) throw fakeError('TERMS_NOT_FOUND', '약관을 찾을 수 없습니다.');
  return { ...terms };
};

/**
 * 새 버전 등록: body { trmsFixIdntfKey, trmsVerId, trmsTtl, trmsCn, esntlAgreYn }
 * - 같은 종류에 같은 버전(대소문자·공백 무시)이 있으면 409
 * - 등록하면 같은 종류 이전 버전은 useYn false
 */
export const createAdminTerm = async ({
  trmsFixIdntfKey,
  trmsVerId,
  trmsTtl,
  trmsCn,
  esntlAgreYn,
}) => {
  await delay();
  const normalize = (value) => value.replace(/\s/g, '').toLowerCase();
  const duplicated = fakeTerms.some(
    (terms) =>
      terms.trmsFixIdntfKey === trmsFixIdntfKey &&
      normalize(terms.trmsVerId) === normalize(trmsVerId),
  );
  if (duplicated) {
    throw fakeError('DUPLICATE_TRMS_VER', '이미 있는 버전이에요.');
  }
  fakeTerms.forEach((terms) => {
    if (terms.trmsFixIdntfKey === trmsFixIdntfKey) terms.useYn = false;
  });
  const terms = {
    trmsSn: nextTrmsSn++,
    trmsFixIdntfKey,
    trmsVerId,
    trmsTtl,
    trmsCn,
    esntlAgreYn,
    useYn: true,
    regDt: `${getTodayYmd()}T${new Date().toTimeString().slice(0, 8)}`,
  };
  fakeTerms.push(terms);
  return toSummary(terms);
};
