/**
 * [오늘 할 케어에 남겨 둘 정기관리 항목] 브라우저 localStorage 보관 (※신규 정책)
 * - 정기관리 항목은 체크하면 서버가 다음 예정일(nxtmPrnmntYmd)을 바꾸고, 완료 기록에는 원래 예정일이 없다.
 *   그래서 체크하는 순간 「오늘 할 케어」에 있던 항목의 careArtclSn을 기억해 오늘 하루는 체크된 채 그 자리에 둔다
 * - 키에 반려동물과 오늘 날짜를 넣는다(`careTodayKept:{petSn}:{todayYmd}`). 오늘이 아닌 같은 반려동물의 이전 키는 읽을 때 지운다
 * - 저장소를 쓸 수 없으면 기억 없이 지금 동작대로(읽기는 빈 목록, 쓰기는 무시)
 * - 다른 기기·브라우저에서는 기억이 없어 「다가오는 정기관리」에 보인다(허용)
 */
const PREFIX = 'careTodayKept:';

const storageKey = (petSn, todayYmd) => `${PREFIX}${petSn}:${todayYmd}`;

export const readTodayKept = (petSn, todayYmd) => {
  try {
    const current = storageKey(petSn, todayYmd);
    const staleKeys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${PREFIX}${petSn}:`) && key !== current)
        staleKeys.push(key);
    }
    staleKeys.forEach((key) => localStorage.removeItem(key));
    const parsed = JSON.parse(localStorage.getItem(current));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeTodayKept = (petSn, todayYmd, careArtclSns) => {
  try {
    localStorage.setItem(
      storageKey(petSn, todayYmd),
      JSON.stringify(careArtclSns),
    );
  } catch {
    // 저장소를 못 써도 화면은 기억 없이 동작한다
  }
};
