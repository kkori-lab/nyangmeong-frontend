import { PATHS } from '@/routes/paths';

/**
 * 메인 반려동물 바로가기 종류 (공통코드 MANG02)
 * - MANC0008 종합 건강기록은 저장한 적 없는 반려동물에 서버가 기본으로 넣는다
 * - 추가할 수 있는 종류가 늘면 여기에 한 줄 더한다
 */
export const SHORTCUT_TYPES = [
  { cd: 'MANC0008', label: '종합 건강기록', path: PATHS.HEALTH },
  { cd: 'MANC0009', label: '건강 일지', path: PATHS.HEALTH_DIARY },
  { cd: 'MANC0010', label: '케어 캘린더', path: PATHS.HEALTH_CALENDAR },
];
