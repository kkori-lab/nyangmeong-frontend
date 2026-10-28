import { getYmdOf } from '@/utils/formatDate';

// 코드값은 백엔드 공통코드(일정 종류 HLTG19, 검진유형 HLTG01)
// 기본 색상은 디자인 가이드 톤 규칙(FN-HLT-003-36): 병원은 검진유형 톤, 그 외 일정은 회색
// icon은 Material Symbols 이름이고 퍼블리싱 html/hlt-calendar.html의 ICON 표와 같다
export const SCHEDULE_TYPES = [
  { cd: 'HLTC0057', nm: '병원', icon: 'local_hospital' },
  { cd: 'HLTC0058', nm: '미용·목욕', icon: 'content_cut' },
  { cd: 'HLTC0059', nm: '케어·투약', icon: 'medication' },
  { cd: 'HLTC0060', nm: '기타', icon: 'event' },
];

export const CHECKUP_TYPES = [
  { cd: 'HLTC0001', nm: '정기검진', icon: 'calendar_month', color: '#8b5cf6' },
  { cd: 'HLTC0002', nm: '예방접종', icon: 'vaccines', color: '#22a06b' },
  { cd: 'HLTC0003', nm: '질병진료', icon: 'local_hospital', color: '#e05a8c' },
  { cd: 'HLTC0004', nm: '검사', icon: 'monitor_heart', color: '#3b82f6' },
  { cd: 'HLTC0005', nm: '기타 진료', icon: 'local_hospital', color: '#8a9596' },
];

export const DEFAULT_SCHEDULE_COLOR = '#8a9596';

// 일정 모달에서 고를 수 있는 뱃지 색상
export const BADGE_COLORS = [
  '#3b82f6',
  '#22a06b',
  '#e05a8c',
  '#8b5cf6',
  '#f59e0b',
  '#8a9596',
];

// 뱃지 색상은 hex로 저장하고, 화면에는 시안의 톤 색(연한 바탕 bg + 진한 글자·막대 fg)으로 그린다
export const TONES = {
  '#3b82f6': { bg: '#eaf1fc', fg: '#2d5fb8' },
  '#22a06b': { bg: '#e6f4ec', fg: '#22744a' },
  '#e05a8c': { bg: '#fcebea', fg: '#b8463f' },
  '#8b5cf6': { bg: '#efecfa', fg: '#5f49b0' },
  '#f59e0b': { bg: '#fcf1df', fg: '#9a5c0c' },
  '#8a9596': { bg: '#eef1f4', fg: '#59636e' },
};

export const HOSPITAL = 'HLTC0057';

const findScheduleType = (cd) => SCHEDULE_TYPES.find((type) => type.cd === cd);

const findCheckupType = (cd) => CHECKUP_TYPES.find((type) => type.cd === cd);

export const isHospital = (schedule) => schedule.schdlKndCd === HOSPITAL;

// 태그·인라인 상세에 쓰는 종류 이름. 병원 일정은 검진유형을 쓴다(FN-HLT-003-30)
export const getScheduleKindName = (schedule) =>
  isHospital(schedule)
    ? findCheckupType(schedule.ckupTypeCd)?.nm
    : findScheduleType(schedule.schdlKndCd)?.nm;

export const getScheduleIcon = (schedule) =>
  isHospital(schedule)
    ? findCheckupType(schedule.ckupTypeCd)?.icon
    : findScheduleType(schedule.schdlKndCd)?.icon;

export const getDefaultScheduleColor = (schedule) =>
  isHospital(schedule)
    ? (findCheckupType(schedule.ckupTypeCd)?.color ?? DEFAULT_SCHEDULE_COLOR)
    : DEFAULT_SCHEDULE_COLOR;

export const getScheduleColor = (schedule) =>
  schedule.cldrBadgeColrCd || getDefaultScheduleColor(schedule);

export const getScheduleTone = (schedule) =>
  TONES[getScheduleColor(schedule)] ?? TONES[DEFAULT_SCHEDULE_COLOR];

export const getScheduleTypeName = (schedule) =>
  findScheduleType(schedule.schdlKndCd)?.nm;

// 같은 날짜는 시간 입력 건을 먼저 시간 순으로, 미입력 건은 그 뒤에 등록 순으로 둔다(FN-HLT-003-32)
export const compareSchedules = (a, b) => {
  const aYmd = getYmdOf(a.schdlDt);
  const bYmd = getYmdOf(b.schdlDt);
  if (aYmd !== bYmd) return aYmd < bYmd ? -1 : 1;
  if (a.hrInptYn && b.hrInptYn && a.schdlDt !== b.schdlDt) {
    return a.schdlDt < b.schdlDt ? -1 : 1;
  }
  if (a.hrInptYn && !b.hrInptYn) return -1;
  if (!a.hrInptYn && b.hrInptYn) return 1;
  return a.schdlSn - b.schdlSn;
};
