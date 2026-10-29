import CheckList from '../missing/CheckList';

const CHECK_ITEMS = [
  ['성격과 주의사항', '낯가림, 입질 이력, 피해야 할 상황'],
  ['일정과 비용', '돌봄 시간, 추가 비용, 지급 방법'],
  ['만남과 인계', '만날 장소와 반려동물을 데려갈 사람'],
  ['준비물과 연락', '필요한 용품과 비상 연락 방법'],
];

/** 「돌봄 전, 꼭 확인해요」: 목록·상세 오른쪽 공통 안내 */
export function CareCheckGuide() {
  return (
    <section aria-labelledby="care-check-title">
      <h2
        id="care-check-title"
        className="pb-3 text-lg leading-[1.4] font-bold text-ink"
      >
        돌봄 전, 꼭 확인해요
      </h2>
      <CheckList items={CHECK_ITEMS} />
    </section>
  );
}

/** 목록 오른쪽 레일: 돌봄 전 확인 안내 + 안전 안내. 검색·필터·쪽과 관계없이 항상 동일 */
export default function CareGuideRail() {
  return (
    <aside
      aria-label="돌봄 전 확인 안내"
      className="flex min-w-0 flex-col gap-8"
    >
      <CareCheckGuide />
      <div className="rounded-[14px] bg-brand-50 px-5 py-4 text-sm leading-[1.6] text-brand-600">
        <p className="font-bold">안전하게 만나요</p>
        <p className="mt-1">
          목록에는 대략적인 동네만 보여요. 상세 주소와 연락처는 채팅에서 서로
          확인한 뒤 나눠 주세요.
        </p>
      </div>
    </aside>
  );
}
