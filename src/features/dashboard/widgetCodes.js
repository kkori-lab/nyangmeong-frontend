// 메인 위젯 코드(공통코드 MANG01)
export const WIDGET = {
  WEIGHT: 'MANC0001',
  MEAL: 'MANC0002',
  WATER: 'MANC0003',
  WALK: 'MANC0004',
  LAB: 'MANC0005',
  CARE: 'MANC0006',
  AI_REPORT: 'MANC0007',
};

/** 위젯 영역 밖 섹션(토탈 케어리스트). 순서 편집에서 빼고 저장할 때는 자기 자리 그대로 보낸다 */
export const isGridWidget = (code) => code !== WIDGET.CARE;

/** 전체 7개 순서에서 위젯 영역 칸 자리만 새 순서로 바꾼다 */
export const applyGridOrder = (allCodes, gridCodes) => {
  let index = 0;
  return allCodes.map((code) =>
    isGridWidget(code) ? gridCodes[index++] : code,
  );
};
