/**
 * [라우팅 매핑표 코드·선택지]
 * - 이동 방식은 공통코드 AIMG09(백엔드 db 기준 데이터 v0.12)
 * - 화면 ID 선택지는 docs/routes.md 1장의 AI 대상(✓) 화면을 복사, 화면 ID 모양은 AI 서버 data/routing.yaml 그대로
 *   - 연결 때 서버 목록으로 바꾼다
 */

export const MVMN_MTHD = {
  PAGE: 'AIMC0032',
  MODAL: 'AIMC0033',
  NOT_ROUTABLE: 'AIMC0034',
  EXCLUDED: 'AIMC0035',
};

export const MVMN_MTHD_OPTIONS = [
  { value: MVMN_MTHD.PAGE, label: '화면 이동' },
  { value: MVMN_MTHD.MODAL, label: '모달 열기' },
  { value: MVMN_MTHD.NOT_ROUTABLE, label: '라우팅 대상 아님' },
  { value: MVMN_MTHD.EXCLUDED, label: '제외' },
];

export const MVMN_MTHD_LABELS = Object.fromEntries(
  MVMN_MTHD_OPTIONS.map(({ value, label }) => [value, label]),
);

/** 이동하는 행(화면 ID·지시어 필수): 화면 이동·모달 열기 */
export const isRoutable = (mvmnMthdCd) =>
  mvmnMthdCd === MVMN_MTHD.PAGE || mvmnMthdCd === MVMN_MTHD.MODAL;

/** AI 대상 화면: [화면 ID, 화면] */
export const SCREEN_OPTIONS = [
  ['SCR-MAN-001', '메인'],
  ['SCR-COM-008', '알림 설정'],
  ['SCR-COM-009', '채팅'],
  ['SCR-HLT-011', '종합 건강기록'],
  ['SCR-HLT-002', '건강 일지'],
  ['SCR-HLT-003', '케어 캘린더'],
  ['SCR-HOS-001', '플레이스'],
  ['SCR-CMU-001-01', '펫이야기 목록'],
  ['SCR-CMU-002', '실종센터'],
  ['SCR-CMU-003-01', '펫뉴스'],
  ['SCR-CMU-004', '우리동네 펫돌봄'],
  ['SCR-CSC-001', '공지사항 목록'],
  ['SCR-CSC-002-01', 'FAQ 목록'],
  ['SCR-MYP-001', '마이페이지 홈'],
  ['SCR-MYP-002', '반려동물 목록'],
  ['SCR-MYP-004', '공동양육자'],
  ['SCR-MYP-010', '픽셀 캐릭터'],
  ['SCR-MYP-020', '포인트·케어미션'],
  ['SCR-MYP-030', '가계부'],
  ['SCR-MYP-031', '가계부 전체 내역'],
  ['SCR-MYP-040', '회원정보 수정'],
].map(([value, name]) => ({ value, label: `${value} ${name}` }));

/** 칸 글자 수: 백엔드 DDL AI_ROUT_MPNG 컬럼 길이 */
export const TRGT_SCRN_NM_MAX = 100;
export const SCRN_ID_MAX = 100;
export const SCRN_PARAM_CN_MAX = 200;
export const INST_KWRD_CN_MAX = 1000;
export const RMRK_CN_MAX = 1000;

/** 지시어 저장 형식(가정): 쉼표로 나눈 한 줄 */
export const splitKeywords = (instKwrdCn) =>
  (instKwrdCn ?? '')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);
