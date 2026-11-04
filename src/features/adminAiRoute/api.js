import { MVMN_MTHD } from './routeLabels';

/**
 * [관리자 AI 라우팅 매핑표 API]
 * - 백엔드 `/api/admin/ai/routes` 없음 -> 가짜 응답
 *   - 연결 때: GET /api/admin/ai/routes?q=, POST /api/admin/ai/routes,
 *     PATCH·DELETE /api/admin/ai/routes/{aiRoutMpngSn}
 * - 우선순위(prrtSeq)는 등록·수정 본문에 넣는다(가정). 그 자리에 넣고 나머지를 한 칸씩 밀어 1부터 빈틈없이
 * - 필드 이름은 백엔드 DDL v0.12 `AI_ROUT_MPNG` 그대로, 처음 값은 AI 서버 data/routing.yaml(부록 A v0.9)
 * - 바꾼 값은 이 탭의 sessionStorage에 두어 새로고침해도 남음(연결 때 지움)
 */

const STORAGE_KEY = 'fakeAdminAiRoutes';

const { PAGE, MODAL, NOT_ROUTABLE, EXCLUDED } = MVMN_MTHD;

/** [대상 화면명, 화면 ID, 파라미터, 이동 방식, 대표 칩, 지시어] (부록 A No 순) */
const SEED = [
  [
    '종합 건강기록',
    'SCR-HLT-011',
    null,
    PAGE,
    'Y',
    '건강기록, 종합 건강기록, 건강 종합, 건강 이력, 우리 애 상태',
  ],
  [
    '플레이스 병원 화면',
    'SCR-HOS-001',
    '?cat=hospital',
    PAGE,
    'Y',
    '병원, 동물병원, 진료, 아파, 병원 찾아줘',
  ],
  ['플레이스', 'SCR-HOS-001', null, PAGE, 'Y', '플레이스'],
  [
    '펫이야기 목록',
    'SCR-CMU-001-01',
    null,
    PAGE,
    'Y',
    '커뮤니티, 게시판, 펫이야기, 글 보고 싶어',
  ],
  [
    '마이페이지 홈',
    'SCR-MYP-001',
    null,
    PAGE,
    'Y',
    '마이페이지, 내 정보, 내 페이지',
  ],
  [
    '픽셀 캐릭터 관리',
    'SCR-MYP-010',
    null,
    PAGE,
    'Y',
    '캐릭터, 픽셀, 꾸미기, 아이템',
  ],
  [
    '공지사항 목록',
    'SCR-CSC-001',
    null,
    PAGE,
    'Y',
    '고객센터, 문의, 공지, 공지사항',
  ],
  [
    '메인',
    'SCR-MAN-001',
    null,
    PAGE,
    'N',
    '메인, 홈, 처음으로, 대시보드, 통합대시보드, 건강 대시보드',
  ],
  [
    '설정',
    'SCR-COM-008',
    null,
    PAGE,
    'N',
    '설정, 알림 설정, 알림 꺼줘, 알림 켜줘, 수신 해제',
  ],
  ['채팅', 'SCR-COM-009', null, MODAL, 'N', '채팅, 메시지, 쪽지, 대화 확인'],
  [
    '케어 캘린더',
    'SCR-HLT-003',
    null,
    PAGE,
    'N',
    '케어 캘린더, 캘린더, 일정 보여줘, 일정 등록, 접종 일정, 다음 접종, 예방접종 예정, 정기검진 일정, 병원 예약',
  ],
  [
    '케어 캘린더 토탈 케어리스트',
    'SCR-HLT-003',
    null,
    PAGE,
    'N',
    '케어리스트, 토탈 케어리스트, 데일리케어, 일상관리, 정기관리, 투약 체크, 심장사상충, 구충',
  ],
  [
    '건강 일지',
    'SCR-HLT-002',
    null,
    PAGE,
    'N',
    '건강 일지, 일상 기록, 오늘 기록, 체중, 식사량, 음수량, 배변, 산책 기록, 검진기록, 검진 이력, 진료 내역, 지속 관찰, 관찰 기록',
  ],
  [
    '건강 일지 검진기록',
    'SCR-HLT-002',
    null,
    PAGE,
    'N',
    '병원 영수증, 약봉투, 진료비 영수증, 영수증으로 검진 등록',
  ],
  [
    '종합 건강기록 처방 및 투약 이력',
    'SCR-HLT-011',
    null,
    PAGE,
    'N',
    '처방약, 약, 복용 중인 약, 투약 이력',
  ],
  [
    '종합 건강기록 검사 결과',
    'SCR-HLT-011',
    null,
    PAGE,
    'N',
    '검사 결과, 혈액검사 결과, 검사 수치, 수치 추이, 검사지',
  ],
  [
    '플레이스 미용 화면',
    'SCR-HOS-001',
    '?cat=beauty',
    PAGE,
    'N',
    '미용, 애견미용, 미용실, 털 깎',
  ],
  [
    '플레이스 용품 화면',
    'SCR-HOS-001',
    '?cat=goods',
    PAGE,
    'N',
    '용품, 사료 파는 곳, 펫샵',
  ],
  [
    '플레이스 동반 화면',
    'SCR-HOS-001',
    '?cat=pet-friendly',
    PAGE,
    'N',
    '동반, 같이 갈 수 있는, 애견동반 카페',
  ],
  [
    '플레이스 호텔 화면',
    'SCR-HOS-001',
    '?cat=hotel',
    PAGE,
    'N',
    '호텔, 맡길 곳, 펫호텔',
  ],
  ['동물병원 요약 카드', 'SCR-HOS-002', null, NOT_ROUTABLE, 'N', null],
  ['펫이야기 글 상세', 'SCR-CMU-001-02', null, NOT_ROUTABLE, 'N', null],
  [
    '실종센터',
    'SCR-CMU-002',
    null,
    PAGE,
    'N',
    '실종, 잃어버렸어, 실종센터, 찾아주세요, 제보',
  ],
  ['펫뉴스', 'SCR-CMU-003-01', null, PAGE, 'N', '뉴스, 펫뉴스, 소식'],
  [
    '우리동네 펫돌봄',
    'SCR-CMU-004',
    null,
    PAGE,
    'N',
    '펫돌봄, 돌봄, 펫시터, 산책 도우미, 맡아주실 분',
  ],
  [
    '반려동물 등록·수정',
    'SCR-MYP-002',
    null,
    PAGE,
    'N',
    '반려동물 등록, 프로필 등록, 우리 애 정보',
  ],
  [
    '공동양육 관리',
    'SCR-MYP-004',
    null,
    PAGE,
    'N',
    '공동양육, 같이 키우, 초대',
  ],
  ['픽셀 캐릭터 상세', 'SCR-MYP-011', null, NOT_ROUTABLE, 'N', null],
  [
    '케어미션 · 포인트',
    'SCR-MYP-020',
    null,
    PAGE,
    'N',
    '포인트, 케어미션, 미션',
  ],
  [
    '가계부',
    'SCR-MYP-030',
    null,
    PAGE,
    'N',
    '가계부, 지출, 얼마 썼, 병원비, 한도, 가계부 영수증',
  ],
  [
    '가계부 전체 내역',
    'SCR-MYP-031',
    null,
    PAGE,
    'N',
    '전체 내역, 지출 내역 다 보여줘',
  ],
  [
    '회원정보 수정',
    'SCR-MYP-040',
    null,
    PAGE,
    'N',
    '회원정보, 비밀번호 변경, 닉네임 변경, 탈퇴',
  ],
  ['FAQ 목록', 'SCR-CSC-002-01', null, PAGE, 'N', '자주하는 질문, FAQ, 도움말'],
  ['공지 상세', 'SCR-CSC-001-02', null, NOT_ROUTABLE, 'N', null],
  ['랜딩페이지', 'SCR-MAN-002', null, EXCLUDED, 'N', null],
  ['로그인 · 회원가입', 'SCR-ACC-001 / 002', null, EXCLUDED, 'N', null],
  [
    '기본 레이아웃 · 드롭다운 3종',
    'SCR-COM-002·004·005·006',
    null,
    EXCLUDED,
    'N',
    null,
  ],
  ['AI 매니저 새 창 런처', 'SCR-COM-007', null, EXCLUDED, 'N', null],
  ['대화창 자신', 'SCR-AIM-0xx', null, EXCLUDED, 'N', null],
  [
    'OCR 촬영 · 결과 확인 · 실패',
    'SCR-AIM-008 / 009 / 010',
    null,
    EXCLUDED,
    'N',
    null,
  ],
  ['검진상세', 'SCR-HLT-005', null, EXCLUDED, 'N', null],
  ['검사 수치 입력', 'SCR-HLT-007', null, EXCLUDED, 'N', null],
  ['결번', 'SCR-HLT-000·001·004·006·008·009', null, EXCLUDED, 'N', null],
  ['플레이스 (보류)', 'SCR-PLC-001 / 002', null, EXCLUDED, 'N', null],
  ['관리자 도메인 전체', null, null, EXCLUDED, 'N', null],
];

/** 도메인명(가정): 화면 ID 가운데 세 글자, 없으면 ETC */
const toDomnNm = (scrnId) => /^SCR-([A-Z]{3})/.exec(scrnId ?? '')?.[1] ?? 'ETC';

const seedRoutes = () =>
  SEED.map(
    (
      [trgtScrnNm, scrnId, scrnParamCn, mvmnMthdCd, rprsChipYn, instKwrdCn],
      index,
    ) => ({
      aiRoutMpngSn: index + 1,
      domnNm: toDomnNm(scrnId),
      trgtScrnNm,
      scrnId,
      scrnParamCn,
      instKwrdCn,
      mvmnMthdCd,
      rprsChipYn,
      prrtSeq: index + 1,
      rmrkCn: null,
      useYn: 'Y',
    }),
  );

/** 저장된 가짜 값: 없거나 읽지 못하면 처음 값 */
const loadRoutes = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // 저장소를 못 쓰면 처음 값
  }
  return seedRoutes();
};

let fakeRoutes = loadRoutes();

const saveRoutes = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fakeRoutes));
  } catch {
    // 저장소를 못 쓰면 이 탭 메모리에만 남음
  }
};

const delay = () => new Promise((resolve) => setTimeout(resolve, 300));

/** 서버 오류 모양 */
const fakeError = (code, message) => ({
  code,
  message,
  fields: null,
  data: null,
});

const removeSpaces = (value) => (value ?? '').replace(/\s/g, '');

const findRoute = (aiRoutMpngSn) => {
  const target = fakeRoutes.find(
    (route) => route.aiRoutMpngSn === aiRoutMpngSn,
  );
  if (!target) {
    throw fakeError('AI_ROUTE_NOT_FOUND', '매핑을 찾을 수 없어요.');
  }
  return target;
};

/** 매핑표: 우선순위 순, q가 있으면 지시어에 공백을 빼고 들어 있는 행만 */
export const getAdminAiRoutes = async ({ q } = {}) => {
  await delay();
  const keyword = removeSpaces(q);
  return fakeRoutes
    .filter(
      (route) => !keyword || removeSpaces(route.instKwrdCn).includes(keyword),
    )
    .sort((a, b) => a.prrtSeq - b.prrtSeq)
    .map((route) => ({ ...route }));
};

/** 행들을 우선순위 순으로 1부터 다시 매긴다 */
const renumber = (routes) =>
  routes.map((route, index) => ({ ...route, prrtSeq: index + 1 }));

/** route를 prrtSeq 자리(1~행 수로 맞춤)에 넣고 나머지를 한 칸씩 민다 */
const placeAt = (route, prrtSeq) => {
  const others = fakeRoutes
    .filter((other) => other.aiRoutMpngSn !== route.aiRoutMpngSn)
    .sort((a, b) => a.prrtSeq - b.prrtSeq);
  const index = Math.min(Math.max(prrtSeq, 1), others.length + 1) - 1;
  return renumber([...others.slice(0, index), route, ...others.slice(index)]);
};

/** 매핑 등록: prrtSeq가 없으면 맨 아래 */
export const createAdminAiRoute = async ({ prrtSeq, ...body }) => {
  await delay();
  const nextSn =
    Math.max(0, ...fakeRoutes.map((route) => route.aiRoutMpngSn)) + 1;
  const route = {
    ...body,
    aiRoutMpngSn: nextSn,
    domnNm: toDomnNm(body.scrnId),
  };
  fakeRoutes = placeAt(route, prrtSeq ?? fakeRoutes.length + 1);
  saveRoutes();
  return { aiRoutMpngSn: nextSn };
};

/** 매핑 수정: prrtSeq를 바꾸면 그 자리로 옮긴다 */
export const updateAdminAiRoute = async ({
  aiRoutMpngSn,
  prrtSeq,
  ...body
}) => {
  await delay();
  const target = findRoute(aiRoutMpngSn);
  const route = { ...target, ...body, domnNm: toDomnNm(body.scrnId) };
  fakeRoutes = placeAt(route, prrtSeq ?? target.prrtSeq);
  saveRoutes();
  return null;
};

/** 매핑 삭제: 뒤 순위를 한 칸씩 당긴다 */
export const deleteAdminAiRoute = async (aiRoutMpngSn) => {
  await delay();
  findRoute(aiRoutMpngSn);
  fakeRoutes = renumber(
    fakeRoutes
      .filter((route) => route.aiRoutMpngSn !== aiRoutMpngSn)
      .sort((a, b) => a.prrtSeq - b.prrtSeq),
  );
  saveRoutes();
  return null;
};
