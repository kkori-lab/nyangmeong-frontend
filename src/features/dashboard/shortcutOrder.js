/**
 * [메인 바로가기 순서] 웹에서 끌어 놓은 순서를 브라우저에 회원별로 보관한다 (※신규 정책, 사람 결정 2026-11-10 "일단 로컬스토리지로")
 * - 서버에는 보내지 않는다. 브라우저마다 순서가 따로이고, 저장값이 없으면 서버 순서(반려동물별)
 * - 값: 바로가기 키(`<petSn>-<cd>`) 배열 JSON
 */
const storageKey = (mbrSn) => `nyangmeong.main.shortcutOrder.${mbrSn}`;

/** 바로가기 하나의 키. 같은 반려동물에 같은 종류는 하나뿐이라 겹치지 않는다 */
export const shortcutKey = ({ pet, cd }) => `${pet.petSn}-${cd}`;

/** 저장된 순서를 읽는다. 저장소를 쓸 수 없거나 값이 없거나 깨졌으면 빈 배열(서버 순서) */
export const readShortcutOrder = (mbrSn) => {
  if (mbrSn == null) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(mbrSn)));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeShortcutOrder = (mbrSn, keys) => {
  if (mbrSn == null) return;
  try {
    localStorage.setItem(storageKey(mbrSn), JSON.stringify(keys));
  } catch {
    // 저장소를 못 써도 이번 화면 안의 순서는 그대로 바뀐다
  }
};

/**
 * 서버 바로가기를 저장된 순서로 맞춘다
 * - 저장 순서에 있는 것 → 그 순서, 없는 것(새로 더한 것) → 서버 순서로 맨 뒤
 * - 서버에 없는 키(지운 것)는 저장 순서에 있어도 나오지 않는다
 */
export const applyShortcutOrder = (tiles, order) => {
  const rank = new Map(order.map((key, index) => [key, index]));
  const known = tiles
    .filter((tile) => rank.has(shortcutKey(tile)))
    .sort((a, b) => rank.get(shortcutKey(a)) - rank.get(shortcutKey(b)));
  const added = tiles.filter((tile) => !rank.has(shortcutKey(tile)));
  return [...known, ...added];
};

/**
 * 서버에 없는 키(지운 바로가기)를 순서에서 뺀다
 * - 빼지 않으면 같은 바로가기를 다시 더했을 때 맨 뒤가 아니라 옛 자리로 돌아간다
 * - 바뀐 것이 없으면 받은 배열을 그대로 돌려준다(호출한 쪽이 다시 쓸지 정할 수 있게)
 */
export const pruneShortcutOrder = (order, liveKeys) => {
  const live = new Set(liveKeys);
  const kept = order.filter((key) => live.has(key));
  return kept.length === order.length ? order : kept;
};
