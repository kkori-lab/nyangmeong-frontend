import { PET_SE } from '@/utils/petCodes';

/**
 * [실종센터 코드·목록]
 * - 상태 코드 값은 공통코드가 정해지기 전의 가정. 연결 때 백엔드 값으로 교체
 */
export const LOST_STTS = {
  LOST: 'CMUC0030',
  FOUND: 'CMUC0031',
};

export const STATUS_TABS = [
  { value: '', label: '전체' },
  { value: 'lost', label: '실종' },
  { value: 'found', label: '찾았어요' },
];

/** URL ?stts= 값 → 서버에 보낼 상태 코드 */
export const STTS_BY_TAB = {
  lost: LOST_STTS.LOST,
  found: LOST_STTS.FOUND,
};

export const PET_FILTERS = [
  { value: '', label: '전체' },
  { value: 'dog', label: '강아지' },
  { value: 'cat', label: '고양이' },
];

export const PET_SE_BY_FILTER = {
  dog: PET_SE.DOG,
  cat: PET_SE.CAT,
};

/** 실종 기간: 마지막 목격 날짜 기준. 31은 1개월 이상 */
export const PERIOD_FILTERS = [
  { value: '', label: '전체' },
  { value: '0', label: '오늘' },
  { value: '7', label: '1주 이내' },
  { value: '30', label: '1개월 이내' },
  { value: '31', label: '1개월 이상' },
];

export const ALL_REGION = '';

/** 전북 시·군·구. 전주시 전체는 완산구·덕진구를 함께 묶음 */
export const REGION_OPTIONS = [
  { value: ALL_REGION, label: '전북 전체' },
  { value: '전주시', label: '전주시 전체' },
  { value: '전주시 완산구', label: '전주시 완산구' },
  { value: '전주시 덕진구', label: '전주시 덕진구' },
  ...[
    '군산시',
    '익산시',
    '정읍시',
    '남원시',
    '김제시',
    '완주군',
    '진안군',
    '무주군',
    '장수군',
    '임실군',
    '순창군',
    '고창군',
    '부안군',
  ].map((name) => ({ value: name, label: name })),
];

/** 읍·면·동 목록(가짜). 서버 행정동 코드 목록으로 교체 */
export const DONG_BY_REGION = {
  '전주시 완산구': [
    '서곡동',
    '효자동',
    '삼천동',
    '서신동',
    '중화산동',
    '평화동',
  ],
  '전주시 덕진구': ['인후동', '금암동', '송천동', '덕진동', '우아동'],
  군산시: ['나운동', '수송동', '조촌동'],
  익산시: ['영등동', '모현동', '부송동'],
  정읍시: ['수성동', '시기동'],
  남원시: ['왕정동', '동충동'],
  김제시: ['요촌동', '신풍동'],
  완주군: ['봉동읍', '삼례읍', '이서면'],
  진안군: ['진안읍', '용담면'],
  무주군: ['무주읍', '설천면'],
  장수군: ['장수읍', '계남면'],
  임실군: ['임실읍', '오수면'],
  순창군: ['순창읍', '복흥면'],
  고창군: ['고창읍', '흥덕면'],
  부안군: ['부안읍', '변산면'],
};

/** 전주시 전체와 전북 전체는 읍·면·동을 선택 불가 */
export const hasDong = (region) => Boolean(DONG_BY_REGION[region]);

/** 품종 목록(가짜). 품종 마스터 API로 교체 */
export const BREEDS = {
  [PET_SE.DOG]: [
    '골든 리트리버',
    '닥스훈트',
    '래브라도 리트리버',
    '몰티즈',
    '믹스견',
    '보더 콜리',
    '비글',
    '비숑 프리제',
    '시바',
    '시츄',
    '요크셔 테리어',
    '웰시 코기 펨브로크',
    '진돗개',
    '치와와',
    '퍼그',
    '포메라니안',
    '푸들',
    '프렌치 불독',
  ],
  [PET_SE.CAT]: [
    '노르웨이 숲',
    '랙돌',
    '러시안 블루',
    '먼치킨',
    '메인쿤',
    '벵갈',
    '브리티시 숏헤어',
    '샴',
    '스코티시 폴드',
    '아비시니안',
    '코리안 숏헤어',
    '터키시 앙고라',
    '페르시안',
  ],
};

export const getPetName = (petSeCd) =>
  petSeCd === PET_SE.CAT ? '고양이' : '강아지';

/** 품종 표시: 마스터 품종명이 있으면 그것, 없으면 직접 입력명 */
export const getBreedName = (post) => post.vrtyNm ?? post.vrtyDrctInptNm ?? '';

/** 「이름 (품종)」, 품종이 없으면 이름만 */
export const getPetLabel = (post) => {
  const breed = getBreedName(post);
  return breed ? `${post.petNm} (${breed})` : post.petNm;
};

export const isFound = (post) => post.lostTpofSttsCd === LOST_STTS.FOUND;

/** 게시 종료 7일 전부터 연장 가능 */
export const EXTEND_BEFORE_DAYS = 7;
export const EXTEND_DAYS = 30;

/** 찾았어요 처리 때 자동으로 만드는 댓글 문구. 사용자가 수정 불가 */
export const foundCommentText = (petNm) =>
  `여러분의 제보와 관심 덕분에 ${petNm}가 무사히 가족의 품으로 돌아갔어요. 감사합니다!`;
