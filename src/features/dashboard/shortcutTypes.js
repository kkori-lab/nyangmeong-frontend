import { PATHS } from '@/routes/paths';

/**
 * 메인 반려동물 바로가기 종류 (코드는 가정, 백엔드 연결 때 맞춘다)
 * - HEALTH는 반려동물마다 기본으로 들어가는 종합 건강기록
 * - 추가할 수 있는 종류가 늘면 여기에 한 줄 더한다
 */
export const SHORTCUT_TYPES = [
  { cd: 'HEALTH', label: '종합 건강기록', path: PATHS.HEALTH },
  { cd: 'DIARY', label: '건강 일지', path: PATHS.HEALTH_DIARY },
  { cd: 'CALENDAR', label: '케어 캘린더', path: PATHS.HEALTH_CALENDAR },
];

export const DEFAULT_SHORTCUT_CDS = ['HEALTH'];
