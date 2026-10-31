import { generatePath } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { FUNCTION_TAGS, findName } from '../checkup/checkupTypes';
import { CHECKUP_TYPES, TONES } from '../scheduleTypes';

/**
 * [종합 건강기록 표시 계산]
 * - 서버 값(프로필·검진기록·검사 항목)을 화면 문구로 바꾸는 함수
 */

/** 쉼표로 나눈 항목 수. 비어 있으면 0 */
export const countItems = (text) =>
  text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean).length;

/** 검진유형 이름·아이콘·톤(연한 바탕 bg + 진한 글자 fg) */
export const getCheckupType = (ckupTypeCd) => {
  const type = CHECKUP_TYPES.find((item) => item.cd === ckupTypeCd);
  return { ...type, tone: TONES[type.color] };
};

/** 검사 항목 기능 태그 이름(검진상세와 같은 규칙) */
export const getFunctionTagName = (fnctTagCd) =>
  findName(FUNCTION_TAGS, fnctTagCd);

/** 참고범위 "0.5 ~ 1.6". 한쪽이 없으면 있는 쪽만 */
export const formatRange = (refMinVal, refMaxVal, separator = ' ~ ') => {
  if (refMinVal == null && refMaxVal == null) return '-';
  if (refMinVal == null) return `${refMaxVal} 이하`;
  if (refMaxVal == null) return `${refMinVal} 이상`;
  return `${refMinVal}${separator}${refMaxVal}`;
};

export const getCheckupDetailPath = ({ petSn, ckupRcdSn }, tab) => {
  const path = generatePath(PATHS.HEALTH_CHECKUP_DETAIL, { petSn, ckupRcdSn });
  return tab ? `${path}?tab=${tab}` : path;
};

/** 건강 일지의 검진기록·지속 관찰 영역 */
export const DIARY_EXAM_PATH = `${PATHS.HEALTH_DIARY}#hlt002-exam`;
export const DIARY_OBS_PATH = `${PATHS.HEALTH_DIARY}#hlt002-obs`;

/** 타임라인 반복 예방 항목의 모양(시안의 기타 회색 톤) */
export const PREVENTION_TIMELINE = {
  nm: '반복 예방',
  icon: 'event_repeat',
  tone: TONES['#8a9596'],
};
