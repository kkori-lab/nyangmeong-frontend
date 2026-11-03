import { api } from '@/api/axios';
import { IS_DEV } from '@/api/env';
import { RCRT_STATUS } from './careMatchLabels';
import { LOST_STATUS } from './lostReportLabels';

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
 * - /api/admin/lost-reports 나오기 전까지 메모리 가짜 -> 나오면 본문만 api 요청으로 교체
 * - 필드는 회원용 실종제보 응답(LostReportSummary·LostReportResponse) 이름 그대로, 관리자 목록의 mbrNcnm·expryCrtrDt는 가정
 * - 찾았어요 제보 상세는 제목·상태·처리 시각(dscvSwtcDt)·pstSn만 온다(결정 13)
 * - 개발 환경에서 ?fake=forbidden이면 403, ?fake=error면 조회 오류
 */

const FAKE_LOST_TITLES = [
  '푸들 초코를 찾습니다',
  '고양이 나비 찾았어요',
  '말티즈 보리를 찾아요',
  '코리안숏헤어 두부 실종',
  '시바견 콩이를 봤다면 연락 주세요',
  '페르시안 구름이를 찾습니다',
];
const FAKE_LOST_NICKNAMES = [
  '초코맘',
  '나비집사',
  '보리아빠',
  '두부언니',
  '콩이네',
];
const FAKE_LOST_STATUSES = [
  LOST_STATUS.LOST,
  LOST_STATUS.FOUND,
  LOST_STATUS.LOST,
  LOST_STATUS.EXPIRED,
];

const pad = (value) => String(value).padStart(2, '0');
const toFakeDateTime = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;

/** 가짜 제보 42건: 2026-10-29부터 하루씩 거슬러, 만료 기준일은 작성일 + 30일 */
const fakeLostReports = Array.from({ length: 42 }, (_, index) => {
  const regDate = new Date(2026, 9, 29 - index, 10, 30);
  const expiryDate = new Date(2026, 9, 29 - index + 30, 23, 59);
  const lostTpofSttsCd = FAKE_LOST_STATUSES[index % FAKE_LOST_STATUSES.length];
  const isFound = lostTpofSttsCd === LOST_STATUS.FOUND;
  return {
    lostTpofSn: 42 - index,
    pstSn: 900 + 42 - index,
    pstTtl: FAKE_LOST_TITLES[index % FAKE_LOST_TITLES.length],
    lostTpofSttsCd,
    mbrSn: 100 + (index % FAKE_LOST_NICKNAMES.length),
    mbrNcnm: FAKE_LOST_NICKNAMES[index % FAKE_LOST_NICKNAMES.length],
    expryCrtrDt: toFakeDateTime(expiryDate),
    dscvSwtcDt: isFound
      ? toFakeDateTime(new Date(2026, 9, 29 - index + 3, 15, 10))
      : null,
    regDt: toFakeDateTime(regDate),
    pstCn: `${FAKE_LOST_TITLES[index % FAKE_LOST_TITLES.length]}.\n마지막으로 본 곳은 집 앞 공원 산책로입니다.\n갈색 목줄을 하고 있어요. 보신 분은 연락 부탁드립니다.`,
    imgs:
      index % 3 === 2
        ? []
        : [
            { atchFileSn: 5000 + index * 2, sortSeq: 1 },
            { atchFileSn: 5001 + index * 2, sortSeq: 2 },
          ],
  };
});

const throwFakeLostError = () => {
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

/**
 * 실종제보 목록(최신순): { content, page, size, totalElements, totalPages, hasNext }
 * - params: page(1부터)·size·lostTpofSttsCd
 * - 목록 행: lostTpofSn·pstSn·pstTtl·lostTpofSttsCd·mbrSn·mbrNcnm·expryCrtrDt·regDt
 */
export const getAdminLostReports = async ({
  page = 1,
  size = 20,
  lostTpofSttsCd,
} = {}) => {
  throwFakeLostError();
  const filtered = fakeLostReports.filter(
    (report) => !lostTpofSttsCd || report.lostTpofSttsCd === lostTpofSttsCd,
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const content = filtered
    .slice((page - 1) * size, page * size)
    .map(
      ({
        lostTpofSn,
        pstSn,
        pstTtl,
        lostTpofSttsCd: code,
        mbrSn,
        mbrNcnm,
        expryCrtrDt,
        regDt,
      }) => ({
        lostTpofSn,
        pstSn,
        pstTtl,
        lostTpofSttsCd: code,
        mbrSn,
        mbrNcnm,
        expryCrtrDt,
        regDt,
      }),
    );
  return {
    content,
    page,
    size,
    totalElements: filtered.length,
    totalPages,
    hasNext: page < totalPages,
  };
};

/** 실종제보 상세: 찾았어요면 lostTpofSn·pstSn·pstTtl·lostTpofSttsCd·dscvSwtcDt만 */
export const getAdminLostReport = async (lostTpofSn) => {
  throwFakeLostError();
  const report = fakeLostReports.find(
    (item) => item.lostTpofSn === Number(lostTpofSn),
  );
  if (!report) {
    throw {
      code: 'NOT_FOUND',
      message: '실종제보를 찾을 수 없습니다.',
      fields: null,
      data: null,
    };
  }
  if (report.lostTpofSttsCd === LOST_STATUS.FOUND) {
    const { pstSn, pstTtl, lostTpofSttsCd, dscvSwtcDt } = report;
    return {
      lostTpofSn: report.lostTpofSn,
      pstSn,
      pstTtl,
      lostTpofSttsCd,
      dscvSwtcDt,
    };
  }
  return { ...report, imgs: report.imgs.map((img) => ({ ...img })) };
};

/**
 * [관리자 펫돌봄 거래 API]
 * - /api/admin/care-matches 나오기 전까지 메모리 가짜 -> 나오면 본문만 api 요청으로 교체
 * - 모집글 필드는 백엔드 PET_PRTC_RCRT 매퍼 이름 그대로(petPrtcRcrtSn·rcrtSttsCd·cstAmt·cstUnitCd·mbrNcnm)
 * - 매칭 필드 중 petPrtcMtchSn·mtchDlngSttsCd·ctptMbrSn, 이력 bfrSttsCd·aftrSttsCd·chgRsn·regDt는 매퍼 이름,
 *   나머지(ctptNcnm·agreVerNo·agreDt·agreCn·cmplReqDt·cmplImgs·ownerCfmtnRsltCd·ownerCfmtnDt)는 가정
 * - 채팅 메시지는 응답에 없다(결정 14·26)
 * - 개발 환경에서 ?fake=forbidden이면 403, ?fake=error면 조회 오류
 */

const FAKE_CARE_TITLES = [
  '주말 산책 부탁드려요',
  '3일 고양이 돌봄',
  '출장 동안 강아지 맡아 주실 분',
  '저녁 산책 1시간',
  '고양이 밥·화장실 챙겨 주세요',
  '놀이 위주로 두 시간 봐 주세요',
];
const FAKE_CARE_NICKNAMES = [
  '초코맘',
  '나비집사',
  '보리아빠',
  '두부언니',
  '콩이네',
];
const FAKE_CARETAKERS = ['산책왕', '냥이돌보미', '멍멍케어', '동네펫시터'];
const FAKE_CARE_STATUSES = [
  RCRT_STATUS.MATCHED,
  RCRT_STATUS.DONE,
  RCRT_STATUS.OPEN,
  RCRT_STATUS.OPEN,
  RCRT_STATUS.MATCHED,
];
const FAKE_CST_UNITS = ['PCAC0004', 'PCAC0005'];

/** 매칭 한 건: 마지막 상태까지 이력을 쌓는다 */
const makeFakeMatch = ({ sn, index, regDate, flow, ctptOffset = 0 }) => {
  const at = (days, hour) =>
    toFakeDateTime(
      new Date(
        regDate.getFullYear(),
        regDate.getMonth(),
        regDate.getDate() + days,
        hour,
        0,
      ),
    );
  const steps = [
    { aftrSttsCd: 'REQUESTED', chgRsn: null, regDt: at(1, 11) },
    { aftrSttsCd: 'MATCHED', chgRsn: null, regDt: at(1, 18) },
    { aftrSttsCd: 'DONE_REQ', chgRsn: null, regDt: at(3, 20) },
    { aftrSttsCd: 'COMPLETE', chgRsn: null, regDt: at(4, 9) },
  ];
  const canceled = {
    aftrSttsCd: 'CANCELED',
    chgRsn: '일정이 맞지 않아 보호자가 취소',
    regDt: at(1, 15),
  };
  const path =
    flow === 'canceled'
      ? [steps[0], canceled]
      : steps.slice(0, { requested: 1, matched: 2, complete: 4 }[flow]);
  const sttsHstry = path.map((step, stepIndex) => ({
    bfrSttsCd: stepIndex === 0 ? null : path[stepIndex - 1].aftrSttsCd,
    ...step,
  }));
  const isAgreed = flow === 'matched' || flow === 'complete';
  const isComplete = flow === 'complete';
  const ctptIndex = (index + ctptOffset) % FAKE_CARETAKERS.length;
  return {
    petPrtcMtchSn: sn,
    ctptMbrSn: 300 + ctptIndex,
    ctptNcnm: FAKE_CARETAKERS[ctptIndex],
    mtchDlngSttsCd: path.at(-1).aftrSttsCd,
    agreVerNo: isAgreed ? 2 : null,
    agreDt: isAgreed ? at(1, 18) : null,
    agreCn: isAgreed ? '시간 2시간 → 3시간, 비용 15,000원 → 20,000원' : null,
    sttsHstry,
    cmplReqDt: isComplete ? at(3, 20) : null,
    cmplImgs: isComplete
      ? [{ atchFileSn: 7000 + index * 2 }, { atchFileSn: 7001 + index * 2 }]
      : [],
    ownerCfmtnRsltCd: isComplete ? 'CONFIRMED' : null,
    ownerCfmtnDt: isComplete ? at(4, 9) : null,
  };
};

/** 모집 상태별 매칭: 모집중은 없음·요청 1건, 매칭완료는 1~2건(취소 1건 포함), 거래완료는 완료 1건 */
const makeFakeMatches = (rcrtSttsCd, index, regDate) => {
  const sn = 600 + index * 2;
  if (rcrtSttsCd === RCRT_STATUS.OPEN) {
    return index % 2 === 0
      ? []
      : [makeFakeMatch({ sn, index, regDate, flow: 'requested' })];
  }
  if (rcrtSttsCd === RCRT_STATUS.DONE) {
    return [makeFakeMatch({ sn, index, regDate, flow: 'complete' })];
  }
  const matched = makeFakeMatch({ sn, index, regDate, flow: 'matched' });
  return index % 2 === 0
    ? [
        matched,
        makeFakeMatch({
          sn: sn + 1,
          index,
          regDate,
          flow: 'canceled',
          ctptOffset: 1,
        }),
      ]
    : [matched];
};

/** 가짜 모집글 37건: 2026-10-28부터 하루씩 거슬러 */
const fakeCareRecruits = Array.from({ length: 37 }, (_, index) => {
  const regDate = new Date(2026, 9, 28 - index, 9, 40);
  const rcrtSttsCd = FAKE_CARE_STATUSES[index % FAKE_CARE_STATUSES.length];
  return {
    petPrtcRcrtSn: 37 - index,
    pstSn: 1300 + 37 - index,
    pstTtl: FAKE_CARE_TITLES[index % FAKE_CARE_TITLES.length],
    rcrtSttsCd,
    mbrSn: 100 + (index % FAKE_CARE_NICKNAMES.length),
    mbrNcnm: FAKE_CARE_NICKNAMES[index % FAKE_CARE_NICKNAMES.length],
    cstAmt: 15000 + (index % 4) * 5000,
    cstUnitCd: FAKE_CST_UNITS[index % FAKE_CST_UNITS.length],
    regDt: toFakeDateTime(regDate),
    mtchs: makeFakeMatches(rcrtSttsCd, index, regDate),
  };
});

/**
 * 펫돌봄 모집글 목록(최신순): { content, page, size, totalElements, totalPages, hasNext }
 * - params: page(1부터)·size·rcrtSttsCd
 * - 목록 행: petPrtcRcrtSn·pstSn·pstTtl·rcrtSttsCd·mbrSn·mbrNcnm·cstAmt·cstUnitCd·regDt
 */
export const getAdminCareRecruits = async ({
  page = 1,
  size = 20,
  rcrtSttsCd,
} = {}) => {
  throwFakeLostError();
  const filtered = fakeCareRecruits.filter(
    (recruit) => !rcrtSttsCd || recruit.rcrtSttsCd === rcrtSttsCd,
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const content = filtered
    .slice((page - 1) * size, page * size)
    .map((recruit) => {
      const row = { ...recruit };
      delete row.mtchs;
      return row;
    });
  return {
    content,
    page,
    size,
    totalElements: filtered.length,
    totalPages,
    hasNext: page < totalPages,
  };
};

/** 펫돌봄 매칭 상세: 모집글 정보 + mtchs[](매칭이 없으면 빈 배열) */
export const getAdminCareRecruit = async (petPrtcRcrtSn) => {
  throwFakeLostError();
  const recruit = fakeCareRecruits.find(
    (item) => item.petPrtcRcrtSn === Number(petPrtcRcrtSn),
  );
  if (!recruit) {
    throw {
      code: 'NOT_FOUND',
      message: '펫돌봄 모집글을 찾을 수 없습니다.',
      fields: null,
      data: null,
    };
  }
  return structuredClone(recruit);
};
