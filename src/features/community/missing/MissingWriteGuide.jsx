const ITEMS = [
  [
    '얼굴과 전신이 보이는 사진',
    '최근에 찍은 선명한 사진을 여러 장 올려 주세요. 첫 번째 사진이 목록 대표 사진이 돼요',
  ],
  [
    '눈에 띄는 특징',
    '목줄 · 옷 색깔, 무늬, 상처처럼 한눈에 알아볼 수 있는 점을 적어 주세요',
  ],
  [
    '정확한 실종 장소와 시간',
    '마지막으로 본 곳을 지도에서 최대한 가깝게 골라 주세요',
  ],
  [
    '바로 받을 수 있는 연락처',
    '제보 전화를 놓치지 않도록 자주 쓰는 번호를 적어 주세요',
  ],
];

/** 글쓰기·글수정 오른쪽 「이렇게 쓰면 찾을 확률이 높아져요」 */
export default function MissingWriteGuide() {
  return (
    <aside aria-label="글쓰기 안내" className="min-w-0 max-[1100px]:mt-6">
      <section aria-labelledby="missing-guide-title">
        <h2
          id="missing-guide-title"
          className="pb-2 text-lg font-bold text-ink"
        >
          이렇게 쓰면 찾을 확률이 높아져요
        </h2>
        <ul>
          {ITEMS.map(([title, description]) => (
            <li
              key={title}
              className="flex flex-col gap-1 border-t border-line py-4 first:border-t-0 first:pt-2"
            >
              <b className="font-semibold text-ink">{title}</b>
              <p className="text-sm leading-[1.6] text-muted">{description}</p>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
