import { api } from '@/api/axios';
import { IS_DEV } from '@/api/env';

/**
 * [관리자 게시글·댓글 API]
 * - 게시글 목록·상세, 블라인드·복구, 댓글 목록·삭제
 */

/** 게시글 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminPosts = (params) => api.get('/admin/posts', { params });

/** 게시글 상세 */
export const getAdminPost = (pstSn) => api.get(`/admin/posts/${pstSn}`);

/** 게시글 블라인드 */
export const blindPost = ({ pstSn, chgRsn }) =>
  api.post(`/admin/posts/${pstSn}/blind`, { chgRsn });

/** 블라인드 복구 */
export const restorePost = ({ pstSn, chgRsn }) =>
  api.post(`/admin/posts/${pstSn}/restore`, { chgRsn });

/** 댓글 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminComments = (params) =>
  api.get('/admin/comments', { params });

/** 댓글 삭제: DELETE 본문 금지라 POST */
export const deleteComment = ({ cmntSn, delRsn }) =>
  api.post(`/admin/comments/${cmntSn}/deletion`, { delRsn });

/**
 * [관리자 실종제보 API]
 * - 정상 게시글만, 블라인드·삭제 글은 나오지 않는다
 * - 찾았어요 제보 상세는 제목·상태·처리 시각(dscvSwtcDt)·pstSn만 온다(결정 13)
 */

/**
 * 실종제보 목록(최신순): { content, page, size, totalElements, totalPages, hasNext }
 * - params: page(1부터)·size·lostTpofSttsCd
 * - 목록 행: lostTpofSn·pstSn·pstTtl·lostTpofSttsCd·mbrSn·mbrNcnm·expryCrtrDt·regDt
 */
export const getAdminLostReports = (params) =>
  api.get('/admin/lost-reports', { params });

/**
 * 실종제보 상세: lostTpofSn·pstSn·pstTtl·lostTpofSttsCd·dscvSwtcDt·mbrSn·mbrNcnm·regDt·pstCn·expryCrtrDt·imgs[]
 * - 찾았어요면 mbrSn부터 null, 없으면 404 LOST_REPORT_NOT_FOUND
 */
export const getAdminLostReport = (lostTpofSn) =>
  api.get(`/admin/lost-reports/${lostTpofSn}`);

/**
 * [관리자 펫돌봄 거래 API]
 * - 채팅 메시지는 응답에 없다(결정 14·26)
 */

/**
 * 펫돌봄 모집글 목록(정상 게시글만, 최신순): { content, page, size, totalElements, totalPages, hasNext }
 * - params: page(1부터)·size·rcrtSttsCd
 * - 목록 행: petPrtcRcrtSn·pstSn·pstTtl·rcrtSttsCd·mbrSn·mbrNcnm·cstAmt·cstUnitCd·regDt
 */
export const getAdminCareRecruits = (params) =>
  api.get('/admin/care-matches', { params });

/**
 * 펫돌봄 매칭 상세: 목록 행 + mtchs[](최신순, 없으면 빈 배열)
 * - 매칭: petPrtcMtchSn·ctptMbrSn·ctptNcnm·mtchDlngSttsCd·rcvYn·rcvIdntyDt·regDt·cndVers[]·sttsHstry[]·cmptnDmnds[]
 */
export const getAdminCareRecruit = (petPrtcRcrtSn) =>
  api.get(`/admin/care-matches/${petPrtcRcrtSn}`);

/** 완료 사진 경로(관리자 로그인, 이미지 바이트) -> useFileImage url */
export const adminCareImageUrl = (petPrtcRcrtSn, atchFileSn) =>
  `/admin/care-matches/${petPrtcRcrtSn}/images/${atchFileSn}`;

/**
 * [관리자 노출 콘텐츠 API]
 * - /api/admin/community/exposure 나오기 전까지 메모리 가짜 -> 나오면 본문만 api 요청으로 교체
 * - 건강팁은 PST.HLTH_INFO_EXPSR_SEQ(값이 있으면 관리자 지정), AI 코멘트는 CMNTY_AI_CMTRY 이름 그대로, 후보 문구(todayPhrsSn·phrsCn)는 테이블 미정이라 가정
 * - 개발 환경에서 ?fake=forbidden이면 403, ?fake=error면 조회 오류
 */

const throwFakeExposureError = () => {
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

/** 건강팁 노출 자리 수 */
const HEALTH_TIP_SLOTS = 3;

/** 자동 선정 후보: 서버는 최근 펫정보 글에서 고른다 */
const fakeAutoHealthTips = [
  { pstSn: 1012, pstTtl: '고양이 구토 원인' },
  { pstSn: 1009, pstTtl: '산책 후 진드기 확인' },
  { pstSn: 1004, pstTtl: '강아지 슬개골 탈구 초기 증상' },
  { pstSn: 998, pstTtl: '노령견 관절 영양제 고르는 법' },
];

/** 관리자 지정 글: { [hlthInfoExpsrSeq]: { pstSn, pstTtl } } */
const fakeAssignedHealthTips = {
  1: { pstSn: 1015, pstTtl: '겨울철 발바닥 관리' },
};

/** 노출 순서대로 자리 채우기: 지정 글 먼저, 빈 자리는 자동 선정 글 */
const buildFakeHealthTips = () => {
  const assignedSns = Object.values(fakeAssignedHealthTips).map(
    (post) => post.pstSn,
  );
  const autoQueue = fakeAutoHealthTips.filter(
    (post) => !assignedSns.includes(post.pstSn),
  );
  return Array.from({ length: HEALTH_TIP_SLOTS }, (_, index) => {
    const assigned = fakeAssignedHealthTips[index + 1];
    if (assigned) return { ...assigned, hlthInfoExpsrSeq: index + 1 };
    return { ...autoQueue.shift(), hlthInfoExpsrSeq: null };
  });
};

/** 오늘의 건강팁 3건: [{ pstSn, pstTtl, hlthInfoExpsrSeq }], 자리 순서대로 */
export const getAdminHealthTips = async () => {
  throwFakeExposureError();
  return buildFakeHealthTips();
};

/** 건강팁 지정: 같은 순서의 기존 지정 글과 같은 글의 다른 순서 지정은 풀림 */
export const assignHealthTip = async ({ pstSn, pstTtl, hlthInfoExpsrSeq }) => {
  Object.entries(fakeAssignedHealthTips).forEach(([seq, post]) => {
    if (post.pstSn === pstSn) delete fakeAssignedHealthTips[seq];
  });
  fakeAssignedHealthTips[hlthInfoExpsrSeq] = { pstSn, pstTtl };
  return null;
};

/** 건강팁 지정 해제 */
export const unassignHealthTip = async (pstSn) => {
  const entry = Object.entries(fakeAssignedHealthTips).find(
    ([, post]) => post.pstSn === pstSn,
  );
  if (!entry) {
    throw {
      code: 'NOT_FOUND',
      message: '지정된 건강팁이 아닙니다.',
      fields: null,
      data: null,
    };
  }
  delete fakeAssignedHealthTips[entry[0]];
  return null;
};

/** 오늘의 한마디 후보 문구 */
const fakePhrases = [
  {
    todayPhrsSn: 4,
    phrsCn: '오늘은 반려동물과 산책 한 바퀴 어떠세요?',
    useYn: true,
  },
  { todayPhrsSn: 3, phrsCn: '물그릇을 한 번 더 채워 주세요.', useYn: true },
  { todayPhrsSn: 2, phrsCn: '작은 칭찬이 큰 힘이 돼요.', useYn: false },
  {
    todayPhrsSn: 1,
    phrsCn: '오늘도 반려동물과 행복한 하루 보내세요.',
    useYn: true,
  },
];
/** 오늘 노출 문구 일련번호: 서버 00:00 배치가 고른 값 */
const FAKE_TODAY_PHRS_SN = 3;

/** 후보 문구 목록: { todayPhrs: { todayPhrsSn, phrsCn } | null, content: [{ todayPhrsSn, phrsCn, useYn }] } */
export const getAdminTodayPhrases = async () => {
  throwFakeExposureError();
  const today = fakePhrases.find(
    (phrase) => phrase.todayPhrsSn === FAKE_TODAY_PHRS_SN,
  );
  return {
    todayPhrs: today
      ? { todayPhrsSn: today.todayPhrsSn, phrsCn: today.phrsCn }
      : null,
    content: structuredClone(fakePhrases),
  };
};

/** 후보 문구 등록: { todayPhrsSn } */
export const createAdminTodayPhrase = async ({ phrsCn, useYn }) => {
  const todayPhrsSn =
    Math.max(0, ...fakePhrases.map((phrase) => phrase.todayPhrsSn)) + 1;
  fakePhrases.unshift({ todayPhrsSn, phrsCn, useYn });
  return { todayPhrsSn };
};

/** 후보 문구 수정: phrsCn·useYn 덮어씀 */
export const updateAdminTodayPhrase = async ({
  todayPhrsSn,
  phrsCn,
  useYn,
}) => {
  const phrase = fakePhrases.find((item) => item.todayPhrsSn === todayPhrsSn);
  if (!phrase) {
    throw {
      code: 'NOT_FOUND',
      message: '후보 문구를 찾을 수 없습니다.',
      fields: null,
      data: null,
    };
  }
  Object.assign(phrase, { phrsCn, useYn });
  return null;
};

const pad = (value) => String(value).padStart(2, '0');

const FAKE_COMMENTARY_TEXTS = [
  '이번 주는 산책 인증 글이 많았어요. 쌀쌀해진 날씨에 발바닥 보습도 챙겨 주세요.',
  '고양이 구토 질문이 늘었어요. 헤어볼 시기라 빗질을 자주 해 주세요.',
  '실종 제보가 이틀 연속 해결됐어요. 이웃의 관심이 큰 힘이 됩니다.',
  '건강검진 후기가 많이 올라왔어요. 노령 반려동물은 반년마다 검진을 권해요.',
  '펫돌봄 매칭이 활발했어요. 맡기기 전 생활 습관을 꼭 공유해 주세요.',
];

/** 가짜 AI 코멘트 35일치: 2026-11-03부터 하루씩 거슬러 */
const fakeCommentaries = Array.from({ length: 35 }, (_, index) => {
  const date = new Date(2026, 10, 3 - index);
  return {
    cmntyAiCmtrySn: 35 - index,
    cmtryCrtrYmd: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    cmtryCn: FAKE_COMMENTARY_TEXTS[index % FAKE_COMMENTARY_TEXTS.length],
    useYn: index % 6 !== 4,
  };
});

/** AI 코멘트 목록(최근 일자순): { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminCommentaries = async ({ page = 1, size = 20 } = {}) => {
  throwFakeExposureError();
  const totalPages = Math.max(1, Math.ceil(fakeCommentaries.length / size));
  return {
    content: structuredClone(
      fakeCommentaries.slice((page - 1) * size, page * size),
    ),
    page,
    size,
    totalElements: fakeCommentaries.length,
    totalPages,
    hasNext: page < totalPages,
  };
};

/** AI 코멘트 사용 여부 전환 */
export const updateAdminCommentary = async ({ cmntyAiCmtrySn, useYn }) => {
  const commentary = fakeCommentaries.find(
    (item) => item.cmntyAiCmtrySn === cmntyAiCmtrySn,
  );
  if (!commentary) {
    throw {
      code: 'NOT_FOUND',
      message: 'AI 코멘트를 찾을 수 없습니다.',
      fields: null,
      data: null,
    };
  }
  commentary.useYn = useYn;
  return null;
};
