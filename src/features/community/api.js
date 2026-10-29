import { toYmd } from '@/utils/formatDate';
import { BBS_DAILY, BBS_INFO, PST_STTS_OPEN } from './postCodes';

/**
 * [펫이야기 가짜 응답]
 * - 게시글·댓글·좋아요·신고 API(KSJ 백엔드) 연결 전: api.get()·post()로 교체
 * - 키는 ERD(PST·CMNT) 컬럼을 camelCase로 바꾼 것이다. ERD에 없는 값은 서버가 계산해 줄 것으로 가정하고 가짜 응답에만 붙인다:
 *   wrtrNcknm(작성자 닉네임), cmntCnt, popYn(인기글), thmbUrlPath, atchFiles, likeYn(내가 좋아요), mineYn(내 글·내 댓글)
 * - 로그인 전이라 내 회원번호는 MY_MBR_SN으로 고정
 */
const MY_MBR_SN = 1;
const MY_NICKNAME = '토리맘';
const POPULAR_DAYS = 7;
const POPULAR_COUNT = 5;

const pad = (value) => String(value).padStart(2, '0');

/** 지금부터 minutes분 전 시각 'YYYY-MM-DD HH:mm:00' */
const ago = (minutes) => {
  const date = new Date(Date.now() - minutes * 60000);
  return `${toYmd(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

const now = () => ago(0);

/** 사진 자리 표시: 단색 SVG */
const photo = (name, color) => ({
  id: name,
  name: `${name}.svg`,
  url: `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="${color}"/></svg>`,
  )}`,
});

const post = (
  bbsCd,
  pstTtl,
  pstCn,
  wrtrNcknm,
  mbrSn,
  minutes,
  rcmdtnCnt,
  cmntCnt,
  inqCnt,
  images = [],
) => ({
  mbrSn,
  bbsCd,
  pstSttsCd: PST_STTS_OPEN,
  pstTtl,
  pstCn,
  inqCnt,
  rcmdtnCnt,
  regDt: ago(minutes),
  mdfcnDt: ago(minutes),
  mdfrId: null,
  hlthInfoExpsrSeq: null,
  wrtrNcknm,
  cmntCnt,
  atchFiles: images,
});

const tipOrder = (seq, row) => ({ ...row, hlthInfoExpsrSeq: seq });

let posts = [
  post(
    BBS_DAILY,
    '퇴근하고 왔더니 이 표정... ㅋㅋㅋ',
    '하루 종일 집 지키느라 고생한 우리 강아지, 문 열자마자 이 표정으로 반겨주는데 피로가 싹 풀리네요. 역시 최고의 힐링은 반려동물입니다.',
    '말랑이집사',
    11,
    60,
    91,
    15,
    74,
    [photo('quiet-1', '#dfe9e9')],
  ),
  post(
    BBS_DAILY,
    '토리 - 첫 캠핑 다녀왔어요!',
    '드디어 토리랑 첫 캠핑을 다녀왔어요! 처음엔 낯설어서 계속 짖었는데 금방 적응해서 신나게 뛰어놀았습니다.\n다음엔 더 넓은 캠핑장으로 가보려고요 :)\n\n다음 캠핑 장소 추천도 받아요. 강아지 동반 가능한 곳이면 어디든 좋아요!',
    MY_NICKNAME,
    MY_MBR_SN,
    180,
    248,
    4,
    132,
    [photo('camping-1', '#cfe2d4'), photo('camping-2', '#e7dcc4')],
  ),
  post(
    BBS_INFO,
    '사료 바꿨는데 잘 안 먹어요 ㅠㅠ',
    '이번에 사료를 바꿨는데 냄새만 맡고 안 먹네요. 원래 먹던 사료랑 섞어서 줘봐야 할까요? 비슷한 경험 있으신 분들 팁 좀 알려주세요.',
    '초코맘',
    12,
    240,
    6,
    3,
    41,
  ),
  tipOrder(
    1,
    post(
      BBS_INFO,
      '고양이 발톱 깎기 꿀팁 공유',
      '고양이 발톱 깎을 때마다 전쟁이었는데, 이 방법으로 하니까 훨씬 수월해졌어요. 간식 먼저 주고 천천히 발을 만지는 것부터 시작하는 게 포인트입니다.',
      '냥집사',
      13,
      300,
      192,
      21,
      160,
      [photo('nail-1', '#e6e0ef')],
    ),
  ),
  post(
    BBS_INFO,
    '비 오는 날 산책 어떻게 하세요?',
    '장마철이라 며칠째 산책을 못 나갔더니 에너지가 넘쳐요. 실내에서 할 수 있는 놀이나 비 오는 날 산책 용품 추천 부탁드려요.',
    '뭉치아빠',
    14,
    420,
    34,
    18,
    88,
  ),
  post(
    BBS_DAILY,
    '신상 강아지 옷 개봉기',
    '가을맞이로 니트 조끼를 하나 샀는데 생각보다 너무 잘 어울려서 자랑하러 왔어요. 사이즈는 평소보다 한 치수 크게 고르는 걸 추천해요.',
    '복실이맘',
    15,
    540,
    57,
    9,
    63,
    [photo('knit-1', '#f0dcd0')],
  ),
  post(
    BBS_INFO,
    '노견 관절 영양제 6개월 먹여본 후기',
    '13살 말티즈 하루가 계단 오르기를 힘들어해서 수의사 상담 후 관절 영양제를 시작했어요. 6개월 동안 느낀 변화와 주의할 점을 정리해 봤어요.',
    '하루언니',
    16,
    1500,
    163,
    40,
    211,
    [photo('joint-1', '#d8e4ee')],
  ),
  post(
    BBS_DAILY,
    '고양이 숨숨집 DIY 성공했어요',
    '택배 상자랑 담요로 숨숨집을 만들어 줬더니 하루 종일 안에서 안 나와요. 만드는 데 30분이면 충분하니 한번 도전해 보세요!',
    '냥냥펀치',
    17,
    1620,
    88,
    12,
    95,
    [photo('box-1', '#e9e2d3')],
  ),
  post(
    BBS_INFO,
    '강아지 치석 관리 어떻게 하시나요?',
    '양치를 너무 싫어해서 매일은 못 하고 있어요. 덴탈껌이나 손가락 칫솔 같은 대안이 효과가 있는지 궁금합니다.',
    '콩이네',
    18,
    1700,
    22,
    14,
    52,
  ),
  post(
    BBS_DAILY,
    '산책하다 만난 동네 친구들',
    '매일 같은 시간에 공원에 가니까 이제 얼굴 아는 친구들이 생겼어요. 오늘은 다섯 마리가 모여서 한참 뛰어놀았답니다.',
    '별이누나',
    19,
    2900,
    75,
    6,
    70,
    [photo('park-1', '#d6e6dc')],
  ),
  tipOrder(
    2,
    post(
      BBS_INFO,
      '여름철 산책, 이 시간은 피하세요',
      '한낮 아스팔트 온도는 체감보다 훨씬 뜨거워요. 이른 아침·늦은 저녁을 추천해요.\n\n발바닥이 뜨거운지 손등으로 먼저 확인해 보세요.',
      '산책왕',
      20,
      3200,
      52,
      7,
      98,
    ),
  ),
  tipOrder(
    3,
    post(
      BBS_INFO,
      '사료 바꿀 때 급여량 조절법',
      '기존 사료와 7~10일에 걸쳐 서서히 섞어주면 장 트러블을 줄일 수 있어요.\n\n첫날은 새 사료 25%부터 시작해 보세요.',
      '영양사집사',
      21,
      3500,
      47,
      5,
      84,
    ),
  ),
  ...Array.from({ length: 20 }, (_, index) =>
    post(
      index % 2 === 0 ? BBS_DAILY : BBS_INFO,
      `펫이야기 이전 글 ${index + 1}`,
      `지난 이야기 ${index + 1}번의 내용이에요. 반려동물과 함께한 일상과 정보를 나눠요.`,
      `보호자${index + 1}`,
      30 + index,
      4000 + index * 900,
      3 + ((index * 7) % 40),
      index % 6,
      10 + index * 3,
    ),
  ),
]
  .sort((a, b) => a.regDt.localeCompare(b.regDt))
  .map((row, index) => ({ ...row, pstSn: index + 1 }));

const campingSn = posts.find(
  (row) => row.pstTtl === '토리 - 첫 캠핑 다녀왔어요!',
).pstSn;

let nextCmntSn = 1;
const cmnt = (pstSn, prntCmntSn, mbrSn, wrtrNcknm, cmntCn, minutes, delYn) => ({
  cmntSn: nextCmntSn++,
  prntCmntSn,
  pstSn,
  mbrSn,
  wrtrNcknm,
  cmntCn,
  sysAutoCrtYn: 'N',
  delYn,
  regDt: ago(minutes),
  mdfcnDt: ago(minutes),
});

let comments = [
  cmnt(
    campingSn,
    null,
    15,
    '복실이맘',
    '완전 부럽네요! 저희도 다음에 가보려고요',
    60,
    'N',
  ),
  cmnt(
    campingSn,
    1,
    MY_MBR_SN,
    MY_NICKNAME,
    '네 완전 추천해요 ㅎㅎ 다음엔 같이 가요!',
    50,
    'N',
  ),
  cmnt(
    campingSn,
    null,
    22,
    '멍멍아빠',
    '어느 캠핑장인지 알 수 있을까요?',
    40,
    'N',
  ),
  cmnt(campingSn, null, 23, '지나가던집사', '잘못 달았어요', 30, 'Y'),
  cmnt(campingSn, 4, 24, '캠핑러버', '삭제된 댓글에도 답글은 남아요', 20, 'N'),
];

const likedSns = new Set();
const reportedCmntSns = new Set();
const viewedSns = new Set();

const todayStories = [
  '오늘은 날씨가 선선해요. 반려동물과 산책하기 좋은 하루, 오늘 다녀온 산책길을 자랑해 보는 건 어떨까요?',
  '오늘은 우리 아이와 눈을 맞추고 천천히 쓰다듬어 주는 시간을 가져 보세요.',
  '요즘 우리 아이가 가장 좋아하는 간식은 뭔가요? 다른 보호자와 나눠 보세요.',
];

const findPost = (pstSn) => posts.find((row) => row.pstSn === pstSn);

const toSummary = (row, popularSns) => ({
  ...row,
  popYn: popularSns.has(row.pstSn) ? 'Y' : 'N',
  likeYn: likedSns.has(row.pstSn) ? 'Y' : 'N',
  mineYn: row.mbrSn === MY_MBR_SN ? 'Y' : 'N',
  thmbUrlPath: row.atchFiles[0]?.url ?? null,
});

/** 최근 7일 글 중 좋아요 높은 순 5개 */
const getPopularSns = () => {
  const limit = ago(POPULAR_DAYS * 24 * 60);
  return new Set(
    posts
      .filter((row) => row.regDt >= limit)
      .toSorted((a, b) => b.rcmdtnCnt - a.rcmdtnCnt)
      .slice(0, POPULAR_COUNT)
      .map((row) => row.pstSn),
  );
};

const normalize = (text) => text.replace(/\s/g, '').toLowerCase();

const paged = (matched, page, size) => {
  const totalPages = Math.ceil(matched.length / size);
  return {
    content: matched.slice((page - 1) * size, page * size),
    page,
    size,
    totalElements: matched.length,
    totalPages,
    hasNext: page < totalPages,
  };
};

/**
 * 목록: 게시판(bbsCd)·정렬(sort: 'new' | 'hot')·키워드. 키워드가 있으면 제목 일치를 먼저, 같은 조건 안에서는 최신순
 */
export const getPostList = ({
  page = 1,
  size = 10,
  bbsCd = '',
  sort = 'new',
  keyword = '',
} = {}) => {
  const word = normalize(keyword);
  const popularSns = getPopularSns();
  const byNew = (a, b) => b.regDt.localeCompare(a.regDt) || b.pstSn - a.pstSn;
  const byHot = (a, b) => b.rcmdtnCnt - a.rcmdtnCnt || byNew(a, b);
  const matched = posts
    .filter(
      (row) =>
        (!bbsCd || row.bbsCd === bbsCd) &&
        (!word || normalize(row.pstTtl + row.pstCn).includes(word)),
    )
    .toSorted((a, b) => {
      if (word) {
        const titleA = normalize(a.pstTtl).includes(word) ? 0 : 1;
        const titleB = normalize(b.pstTtl).includes(word) ? 0 : 1;
        if (titleA !== titleB) return titleA - titleB;
      }
      return sort === 'hot' ? byHot(a, b) : byNew(a, b);
    })
    .map((row) => toSummary(row, popularSns));
  return Promise.resolve(paged(matched, page, size));
};

/** 상세: 같은 사용자의 조회수는 한 번만 올린다(가짜는 새로고침 전까지) */
export const getPost = (pstSn) => {
  const target = findPost(pstSn);
  if (!target) return Promise.reject(new Error('게시글을 찾지 못했어요'));
  if (!viewedSns.has(pstSn)) {
    viewedSns.add(pstSn);
    target.inqCnt += 1;
  }
  return Promise.resolve(toSummary(target, getPopularSns()));
};

export const createPost = ({ bbsCd, pstTtl, pstCn, atchFiles }) => {
  const pstSn = Math.max(0, ...posts.map((row) => row.pstSn)) + 1;
  posts = [
    ...posts,
    {
      ...post(
        bbsCd,
        pstTtl,
        pstCn,
        MY_NICKNAME,
        MY_MBR_SN,
        0,
        0,
        0,
        0,
        atchFiles,
      ),
      pstSn,
    },
  ];
  return Promise.resolve({ pstSn });
};

export const updatePost = ({ pstSn, bbsCd, pstTtl, pstCn, atchFiles }) => {
  const target = findPost(pstSn);
  if (!target || target.mbrSn !== MY_MBR_SN) {
    return Promise.reject(new Error('수정 권한이 없어요'));
  }
  Object.assign(target, {
    bbsCd,
    pstTtl,
    pstCn,
    atchFiles,
    mdfcnDt: now(),
    mdfrId: String(MY_MBR_SN),
  });
  return Promise.resolve({ pstSn });
};

export const deletePost = (pstSn) => {
  const target = findPost(pstSn);
  if (!target || target.mbrSn !== MY_MBR_SN) {
    return Promise.reject(new Error('삭제 권한이 없어요'));
  }
  posts = posts.filter((row) => row.pstSn !== pstSn);
  return Promise.resolve();
};

/** 좋아요 토글: 바뀐 상태와 수 반환 */
export const togglePostLike = (pstSn) => {
  const target = findPost(pstSn);
  if (!target) return Promise.reject(new Error('게시글을 찾지 못했어요'));
  if (likedSns.has(pstSn)) {
    likedSns.delete(pstSn);
    target.rcmdtnCnt -= 1;
  } else {
    likedSns.add(pstSn);
    target.rcmdtnCnt += 1;
  }
  return Promise.resolve({
    likeYn: likedSns.has(pstSn) ? 'Y' : 'N',
    rcmdtnCnt: target.rcmdtnCnt,
  });
};

/** 게시글 신고: 접수만 한다(누적 5회 삭제는 서버 처리) */
export const reportPost = () => Promise.resolve();

export const getComments = (pstSn) => {
  const postAuthorSn = findPost(pstSn)?.mbrSn;
  return Promise.resolve(
    comments
      .filter((row) => row.pstSn === pstSn)
      .map((row) => ({
        ...row,
        mineYn: row.mbrSn === MY_MBR_SN ? 'Y' : 'N',
        authorYn: row.mbrSn === postAuthorSn ? 'Y' : 'N',
      })),
  );
};

/** 댓글 수는 삭제된 댓글 제외 */
const countComments = (pstSn) =>
  comments.filter((row) => row.pstSn === pstSn && row.delYn !== 'Y').length;

export const createComment = ({ pstSn, prntCmntSn, cmntCn }) => {
  const target = findPost(pstSn);
  if (!target) return Promise.reject(new Error('게시글을 찾지 못했어요'));
  comments = [
    ...comments,
    cmnt(pstSn, prntCmntSn ?? null, MY_MBR_SN, MY_NICKNAME, cmntCn, 0, 'N'),
  ];
  target.cmntCnt = Math.max(target.cmntCnt + 1, countComments(pstSn));
  return Promise.resolve();
};

export const deleteComment = ({ pstSn, cmntSn }) => {
  const target = comments.find((row) => row.cmntSn === cmntSn);
  if (!target || target.mbrSn !== MY_MBR_SN) {
    return Promise.reject(new Error('삭제 권한이 없어요'));
  }
  target.delYn = 'Y';
  const row = findPost(pstSn);
  if (row) row.cmntCnt = Math.max(0, row.cmntCnt - 1);
  return Promise.resolve();
};

/** 댓글 신고: 같은 회원이 같은 댓글을 두 번 신고하면 차단 */
export const reportComment = ({ cmntSn }) => {
  if (reportedCmntSns.has(cmntSn)) {
    return Promise.reject(new Error('이미 신고한 댓글입니다'));
  }
  reportedCmntSns.add(cmntSn);
  return Promise.resolve();
};

/** 오른쪽 레일 */
export const getTodayStory = () => {
  const today = new Date();
  const text = todayStories[today.getDate() % todayStories.length];
  return Promise.resolve({ text, date: toYmd(today) });
};

/** 인기 포토: 사진이 있는 최근 7일 펫일상 글 중 좋아요 1위 → 30일 → 전체 → 없음(null) */
export const getPopularPhoto = () => {
  const daily = posts.filter(
    (row) => row.bbsCd === BBS_DAILY && row.atchFiles.length > 0,
  );
  const top = (rows) => rows.toSorted((a, b) => b.rcmdtnCnt - a.rcmdtnCnt)[0];
  const found =
    top(daily.filter((row) => row.regDt >= ago(7 * 24 * 60))) ??
    top(daily.filter((row) => row.regDt >= ago(30 * 24 * 60))) ??
    top(daily);
  return Promise.resolve(
    found
      ? {
          pstSn: found.pstSn,
          pstTtl: found.pstTtl,
          wrtrNcknm: found.wrtrNcknm,
          rcmdtnCnt: found.rcmdtnCnt,
          thmbUrlPath: found.atchFiles[0].url,
        }
      : null,
  );
};

/** 오늘의 건강 팁: 관리자가 노출순서(hlthInfoExpsrSeq)를 준 펫정보 글 3건 */
export const getHealthTips = () =>
  Promise.resolve(
    posts
      .filter((row) => row.bbsCd === BBS_INFO && row.hlthInfoExpsrSeq)
      .toSorted((a, b) => a.hlthInfoExpsrSeq - b.hlthInfoExpsrSeq)
      .slice(0, 3)
      .map((row) => ({
        pstSn: row.pstSn,
        pstTtl: row.pstTtl,
        summary: row.pstCn.split('\n')[0],
      })),
  );
