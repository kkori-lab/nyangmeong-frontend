/**
 * 메인 반려동물 바로가기 조회·저장 (LJS 백엔드, 아직 없음)
 * - 가짜 응답. 필드 이름은 가정: [{ petSn, shrtcCds }] (반려동물별 바로가기 코드, 보일 순서대로)
 * - 저장한 값은 이 탭의 sessionStorage에 두어 새로고침해도 남음(연결 때 지움)
 * - 저장한 적 없는 반려동물은 화면이 기본 바로가기(종합 건강기록)를 그린다
 */
const STORAGE_KEY = 'fake-main-shortcuts';

const delay = () => new Promise((resolve) => setTimeout(resolve, 300));

/** 저장된 가짜 값: 없거나 읽지 못하면 빈 목록 */
const loadShortcuts = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // 저장소를 못 쓰면 빈 목록
  }
  return [];
};

let fakeShortcuts = loadShortcuts();

/** 메인 바로가기 GET (가짜) */
export const getMainShortcuts = async () => {
  await delay();
  return structuredClone(fakeShortcuts);
};

/** 메인 바로가기 저장 PUT (가짜). 반려동물별 목록 전체를 보낸다 */
export const saveMainShortcuts = async (shortcuts) => {
  await delay();
  fakeShortcuts = structuredClone(shortcuts);
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fakeShortcuts));
  } catch {
    // 저장소를 못 쓰면 이 탭 메모리에만 남음
  }
  return structuredClone(fakeShortcuts);
};
