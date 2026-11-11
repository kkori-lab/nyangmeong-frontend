import { splitKeywords } from './routeLabels';

/**
 * [지시어 겹침 셈]
 * - 겹침: 공백을 뺀 지시어가 같은 행끼리
 * - 같은 지시어 안의 순서: prrtSeq 오름차순(같은 길이로 일치하면 위쪽 행이 먼저, FN-ADM-080-03)
 */

const removeSpaces = (value) => value.replace(/\s/g, '');

/** 공백 뺀 지시어 목록(중복 없음) */
const getKeywordKeys = (instKwrdCn) => [
  ...new Set(splitKeywords(instKwrdCn).map(removeSpaces)),
];

/** 이 행의 지시어 중 다른 행에도 있는 것(공백 무시): [{ keyword, route }] */
export const findDuplicates = (instKwrdCn, routes, aiRoutMpngSn) =>
  getKeywordKeys(instKwrdCn).flatMap((keyword) =>
    routes
      .filter(
        (other) =>
          other.aiRoutMpngSn !== aiRoutMpngSn &&
          getKeywordKeys(other.instKwrdCn).includes(keyword),
      )
      .map((other) => ({ keyword, route: other })),
  );

/** 사용 중인 행마다 겹치는 지시어: Map(aiRoutMpngSn -> [{ keyword, count, order }]) */
export const buildOverlapMap = (routes) => {
  const usedRoutes = routes
    .filter((route) => route.useYn)
    .sort((a, b) => a.prrtSeq - b.prrtSeq);

  /** 지시어별 그 지시어를 가진 행(순서대로) */
  const routesByKeyword = new Map();
  usedRoutes.forEach((route) => {
    getKeywordKeys(route.instKwrdCn).forEach((keyword) => {
      const group = routesByKeyword.get(keyword) ?? [];
      group.push(route.aiRoutMpngSn);
      routesByKeyword.set(keyword, group);
    });
  });

  const overlapMap = new Map();
  routesByKeyword.forEach((group, keyword) => {
    if (group.length < 2) return;
    group.forEach((aiRoutMpngSn, index) => {
      const overlaps = overlapMap.get(aiRoutMpngSn) ?? [];
      overlaps.push({ keyword, count: group.length, order: index + 1 });
      overlapMap.set(aiRoutMpngSn, overlaps);
    });
  });
  return overlapMap;
};
