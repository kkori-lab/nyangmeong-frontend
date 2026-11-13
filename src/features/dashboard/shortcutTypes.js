import { PATHS } from '@/routes/paths';

/**
 * 메인 반려동물 바로가기 종류 (공통코드 MANG02)
 * - group: 편집 모달 트리의 묶음 이름. parentCd가 있으면 그 종류의 세부 메뉴(트리에서 들여 씀)
 * - hash: 그 화면의 탭·칸. param: 반려동물 번호를 넘길 파라미터 이름(기본 petSn)
 * - 서버는 저장할 때 MANG02에 사용 중으로 등록된 코드만 받는다. 여기에 새 종류를 더하면 서버 공통코드도 같이 넣는다
 * - 추가할 수 있는 종류가 늘면 여기에 한 줄 더한다. 순서가 트리 순서다
 */
const HEALTH = '건강기록';
const MYPAGE = '마이페이지';

export const SHORTCUT_TYPES = [
  {
    cd: 'MANC0008',
    label: '종합 건강기록',
    path: PATHS.HEALTH,
    group: HEALTH,
  },
  {
    cd: 'MANC0009',
    label: '건강 일지',
    path: PATHS.HEALTH_DIARY,
    group: HEALTH,
  },
  {
    cd: 'MANC0011',
    label: '건강기록 변화',
    path: PATHS.HEALTH_DIARY,
    hash: 'hlt002-graph',
    group: HEALTH,
    parentCd: 'MANC0009',
  },
  {
    cd: 'MANC0012',
    label: '지속 관찰',
    path: PATHS.HEALTH_DIARY,
    hash: 'hlt002-obs',
    group: HEALTH,
    parentCd: 'MANC0009',
  },
  {
    cd: 'MANC0013',
    label: '검진기록',
    path: PATHS.HEALTH_DIARY,
    hash: 'hlt002-exam',
    group: HEALTH,
    parentCd: 'MANC0009',
  },
  {
    cd: 'MANC0010',
    label: '케어 캘린더',
    path: PATHS.HEALTH_CALENDAR,
    group: HEALTH,
  },
  {
    cd: 'MANC0014',
    label: '캘린더',
    path: PATHS.HEALTH_CALENDAR,
    hash: 'hlt003-calendar',
    group: HEALTH,
    parentCd: 'MANC0010',
  },
  {
    cd: 'MANC0015',
    label: '케어리스트',
    path: PATHS.HEALTH_CALENDAR,
    hash: 'hlt003-care',
    group: HEALTH,
    parentCd: 'MANC0010',
  },
  {
    cd: 'MANC0018',
    label: '반려동물 정보 수정',
    /** 메인 타일에서만 쓰는 줄바꿈 이름(사람 요청 2026-11-13). 없으면 label */
    tileLabel: '반려동물\n정보 수정',
    path: PATHS.MYPAGE_PETS,
    param: 'edit',
    group: MYPAGE,
  },
  {
    cd: 'MANC0017',
    label: '캐릭터 꾸미기',
    path: PATHS.MYPAGE_CHARACTERS,
    group: MYPAGE,
  },
  {
    cd: 'MANC0016',
    label: '케어미션',
    path: PATHS.MYPAGE_POINTS,
    hash: 'care-mission',
    group: MYPAGE,
  },
];

/** 트리 묶음 이름(처음 나온 순서) */
export const SHORTCUT_GROUPS = [
  ...new Set(SHORTCUT_TYPES.map((type) => type.group)),
];

/** 바로가기 주소: 경로?petSn=…#탭 (param이 있으면 그 이름으로) */
export const shortcutHref = (type, petSn) =>
  `${type.path}?${new URLSearchParams({ [type.param ?? 'petSn']: petSn })}${
    type.hash ? `#${type.hash}` : ''
  }`;
