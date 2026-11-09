// 서버의 옛 대문자 아이콘 코드는 화면에서 Material 이름으로 바꿔 그린다 (※신규 정책)
const LEGACY_ICONS = {
  NAIL: 'content_cut',
  HEART: 'medication',
  PILL: 'medication',
  TOOTH: 'dentistry',
  VACCINE: 'vaccines',
  BRUSH: 'brush',
  EAR: 'hearing',
};

// CareItemModal의 아이콘 목록과 같은 이름. 이 밖의 값은 글꼴에 없어 글자로 깨진다
const MATERIAL_ICONS = new Set([
  'brush',
  'cleaning_services',
  'dentistry',
  'bathtub',
  'hearing',
  'content_cut',
  'medication',
  'vaccines',
  'sentiment_satisfied',
  'task_alt',
]);

const DEFAULT_CARE_ICON = 'task_alt';

export function toCareIcon(id) {
  if (MATERIAL_ICONS.has(id)) return id;
  return LEGACY_ICONS[id] ?? DEFAULT_CARE_ICON;
}
