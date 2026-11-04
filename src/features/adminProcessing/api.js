import { api } from '@/api/axios';
import { IS_DEV } from '@/api/env';
import {
  CALL_RSLT,
  CHAR_JOB_STTS,
  CHAR_JOB_STTS_FAIL,
  OCR_SOURCES,
  OCR_STTS_FAIL,
  OCR_STTS_GROUP,
} from './processingLabels';

/**
 * [관리자 처리 현황 API]
 * - 영수증 상태 이름은 실제 공통코드 API, 나머지는 /api/admin/processing/* 나오기 전까지 메모리 가짜 -> 나오면 본문만 api 요청으로 교체
 * - 필드는 RECPT·CHAR_CRT_JOB·EXTL_API_CALL_LOG 컬럼 이름 가정, 건수 묶음(summary) 키도 가정. 결과 내용(건강기록·이미지 결과)은 받지 않음
 * - 개발 환경에서 ?fake=forbidden이면 403, ?fake=error면 조회 오류
 */

/** 영수증 처리 상태 목록: [{ comCd, comCdNm, sortSeq }] */
export const getOcrStatuses = () =>
  api.get('/common-codes', { params: { prntComCd: OCR_STTS_GROUP } });

/** 영수증 원본 이미지 주소(비공개, useFileImage용) */
export const getReceiptImageUrl = (recptSn) =>
  `/admin/processing/receipts/${recptSn}/image`;

const FAKE_NICKNAMES = ['초코맘', '나비집사', '보리아빠', '콩이네', '두부언니'];

/** 가짜 영수증 상태: 처리 중·성공 */
const FAKE_OCR_PROCESSING = 'AIMC0002';
const FAKE_OCR_SUCCESS = 'AIMC0003';

const pad = (value) => String(value).padStart(2, '0');

/** 기준 시각에서 시간 단위로 거슬러 간 일시 문자열 */
const toDateTime = (hoursAgo, minute = 0) => {
  const time = new Date(2026, 9, 30, 13, minute);
  time.setHours(time.getHours() - hoursAgo);
  return `${time.getFullYear()}-${pad(time.getMonth() + 1)}-${pad(time.getDate())}T${pad(time.getHours())}:${pad(time.getMinutes())}:00`;
};

/** 가짜 영수증 60건: 6건마다 인식 실패, 맨 앞 1건 처리 중 */
const fakeReceipts = Array.from({ length: 60 }, (_, index) => {
  const isFail = index % 6 === 0 && index > 0;
  return {
    recptSn: 60 - index,
    mbrSn: 100 + (index % FAKE_NICKNAMES.length),
    mbrNcnm: FAKE_NICKNAMES[index % FAKE_NICKNAMES.length],
    ocrRqstSrcCd: OCR_SOURCES[index % OCR_SOURCES.length].comCd,
    ocrPrcsSttsCd:
      index === 0
        ? FAKE_OCR_PROCESSING
        : isFail
          ? OCR_STTS_FAIL
          : FAKE_OCR_SUCCESS,
    frstRegDt: toDateTime(index * 3, (index * 7) % 60),
  };
});

const CHAR_FAIL_REASONS = [
  '이미지 생성 API 시간 초과',
  '원본 사진에서 반려동물을 찾지 못함',
  '이미지 생성 API 오류',
];

/** 가짜 캐릭터 생성 작업 32건: 5건마다 실패(그중 일부 1:1 문의 연결) */
const fakeCharacterJobs = Array.from({ length: 32 }, (_, index) => {
  const isFail = index % 5 === 2;
  const sttsCd = isFail
    ? CHAR_JOB_STTS_FAIL
    : index === 0
      ? CHAR_JOB_STTS[0].comCd
      : index === 1
        ? CHAR_JOB_STTS[1].comCd
        : CHAR_JOB_STTS[2].comCd;
  return {
    charCrtJobSn: 32 - index,
    mbrSn: 100 + (index % FAKE_NICKNAMES.length),
    mbrNcnm: FAKE_NICKNAMES[index % FAKE_NICKNAMES.length],
    jobSttsCd: sttsCd,
    failRsn: isFail
      ? CHAR_FAIL_REASONS[index % CHAR_FAIL_REASONS.length]
      : null,
    otoInqrySn: isFail && index % 2 === 0 ? 10 + index : null,
    frstRegDt: toDateTime(index * 5, (index * 11) % 60),
  };
});

const PDF_ERROR_MESSAGES = [
  'Upstream 500 Internal Server Error',
  'Invalid response format',
];

/** 가짜 검사결과지 분석 호출 40건: 7건마다 시간 초과, 9건마다 API 오류 */
const fakePdfCalls = Array.from({ length: 40 }, (_, index) => {
  const callRsltCd =
    index % 7 === 3
      ? CALL_RSLT.TIMEOUT
      : index % 9 === 4
        ? CALL_RSLT.FAIL
        : CALL_RSLT.SUCCESS;
  return {
    extlApiCallLogSn: 40 - index,
    callRsltCd,
    failRsn:
      callRsltCd === CALL_RSLT.FAIL
        ? PDF_ERROR_MESSAGES[index % PDF_ERROR_MESSAGES.length]
        : null,
    callDt: toDateTime(index * 4, (index * 13) % 60),
  };
});

const throwFakeError = () => {
  const fake = IS_DEV
    ? new URLSearchParams(window.location.search).get('fake')
    : null;
  if (fake === 'forbidden') {
    throw {
      code: 'ADMIN_ONLY',
      message: '관리자만 접근할 수 있습니다.',
      fields: null,
      data: null,
    };
  }
  if (fake === 'error') {
    throw {
      code: 'INTERNAL_ERROR',
      message: '서버 오류가 발생했습니다.',
      fields: null,
      data: null,
    };
  }
};

/** 기간 안(일시 앞 10자리 비교) */
const isInRange = (dateTime, fromYmd, toYmd) =>
  (!fromYmd || dateTime.slice(0, 10) >= fromYmd) &&
  (!toYmd || dateTime.slice(0, 10) <= toYmd);

/** 최신순 정렬 뒤 쪽 하나 */
const toPage = (rows, dateKey, page, size) => {
  const sorted = [...rows].sort((a, b) => b[dateKey].localeCompare(a[dateKey]));
  const totalPages = Math.max(1, Math.ceil(sorted.length / size));
  return {
    content: sorted
      .slice((page - 1) * size, page * size)
      .map((row) => ({ ...row })),
    page,
    size,
    totalElements: sorted.length,
    totalPages,
    hasNext: page < totalPages,
  };
};

/**
 * 영수증 OCR 현황: { summary: { totCnt, scsCnt, failCnt, prcsCnt }, ...쪽 }
 * - summary는 기간·출처 기준(상태 필터와 무관), 목록은 상태까지 건 것
 * - 미확정: 경로 GET /api/admin/processing/receipts, summary 키 이름
 */
export const getAdminReceipts = async ({
  page = 1,
  size = 20,
  fromYmd,
  toYmd,
  ocrRqstSrcCd,
  ocrPrcsSttsCd,
} = {}) => {
  throwFakeError();
  const scoped = fakeReceipts
    .filter(({ frstRegDt }) => isInRange(frstRegDt, fromYmd, toYmd))
    .filter((row) => !ocrRqstSrcCd || row.ocrRqstSrcCd === ocrRqstSrcCd);
  const countOf = (sttsCd) =>
    scoped.filter((row) => row.ocrPrcsSttsCd === sttsCd).length;
  const summary = {
    totCnt: scoped.length,
    scsCnt: countOf(FAKE_OCR_SUCCESS),
    failCnt: countOf(OCR_STTS_FAIL),
    prcsCnt: countOf(FAKE_OCR_PROCESSING),
  };
  const filtered = scoped.filter(
    (row) => !ocrPrcsSttsCd || row.ocrPrcsSttsCd === ocrPrcsSttsCd,
  );
  return { summary, ...toPage(filtered, 'frstRegDt', page, size) };
};

/**
 * 캐릭터 생성 현황: { sttsCnts: [{ jobSttsCd, cnt }], ...쪽 }
 * - sttsCnts는 전체 기준, 목록은 상태 필터를 건 것. 결과 이미지는 받지 않음
 * - 미확정: 경로 GET /api/admin/processing/character-jobs, 상태 코드, sttsCnts 모양
 */
export const getAdminCharacterJobs = async ({
  page = 1,
  size = 20,
  jobSttsCd,
} = {}) => {
  throwFakeError();
  const sttsCnts = CHAR_JOB_STTS.map(({ comCd }) => ({
    jobSttsCd: comCd,
    cnt: fakeCharacterJobs.filter((job) => job.jobSttsCd === comCd).length,
  }));
  const filtered = fakeCharacterJobs.filter(
    (job) => !jobSttsCd || job.jobSttsCd === jobSttsCd,
  );
  return { sttsCnts, ...toPage(filtered, 'frstRegDt', page, size) };
};

/**
 * 검사결과지 분석 현황: { summary: { totCnt, scsCnt, tmotCnt, errCnt }, ...실패 목록 쪽 }
 * - 검사결과지가 아닌 파일은 서버가 빼고 줌(가정). 분석 결과 내용은 받지 않음
 * - 미확정: 경로 GET /api/admin/processing/pdf-analyses, summary 키 이름
 */
export const getAdminPdfAnalyses = async ({
  page = 1,
  size = 20,
  fromYmd,
  toYmd,
} = {}) => {
  throwFakeError();
  const scoped = fakePdfCalls.filter(({ callDt }) =>
    isInRange(callDt, fromYmd, toYmd),
  );
  const countOf = (callRsltCd) =>
    scoped.filter((call) => call.callRsltCd === callRsltCd).length;
  const summary = {
    totCnt: scoped.length,
    scsCnt: countOf(CALL_RSLT.SUCCESS),
    tmotCnt: countOf(CALL_RSLT.TIMEOUT),
    errCnt: countOf(CALL_RSLT.FAIL),
  };
  const failures = scoped.filter(
    (call) => call.callRsltCd !== CALL_RSLT.SUCCESS,
  );
  return { summary, ...toPage(failures, 'callDt', page, size) };
};
