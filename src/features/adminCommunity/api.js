import { api } from '@/api/axios';
import { IS_DEV } from '@/api/env';
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
