# 냥멍케어 프론트엔드 컨벤션: 화면 디자인

`AGENTS.md`에서 이어지는 문서다. 화면 UI와 스타일을 쓸 때, 디자인 파일(`html/`)을 만들거나 받을 때 읽는다.

## 디자인 기준

화면은 아래 순서로 처음 있는 것을 기준으로 만든다. 기준에 없는 것을 보기 좋게 하려고 덧붙이지 않는다.

1. Figma 프레임(`node scripts/figma.mjs`)
2. `html/<SCR-ID>.html` 디자인 파일
3. DMS 화면설계서

## AI 슬롭을 넣지 않는다

AI 도구가 기준 없이 채우면 어느 서비스에서나 본 듯한 화면이 된다. 디자인 기준에 없으면 아래를 쓰지 않는다.

- 보라·인디고 계열 그라데이션, 글래스모피즘(반투명 흐림), 배경의 장식용 원·블롭
- 모든 카드에 `rounded-2xl`·`shadow-xl`을 붙이는 식의 과한 둥글림·그림자. 같은 역할의 요소는 같은 값을 쓴다
- 이모지 아이콘과 장식용 이모지(✨🚀). 아이콘은 `lucide-react`만 쓴다
- 지어낸 문구: "Welcome back!" 같은 영문 마케팅 문구, 가짜 통계·후기, 기획에 없는 안내 문장. 문구는 화면설계서 그대로 쓰고, 없으면 짧은 한국어로 쓴다
- 기준에 없는 애니메이션·hover 효과, 섹션마다 가운데 정렬 hero를 두는 배치
- 화면마다 제각각인 색·간격·글자 크기. 이미 있는 화면이나 `components/`에 같은 역할이 있으면 그 값을 따른다

## 로딩 표시

데이터를 기다리는 동안 "불러오는 중이에요" 같은 문구나 `return null`을 쓰지 않고 스켈레톤을 쓴다. 문구는 한 프레임 깜빡이고, `null`은 내용이 튀어나오며 아래를 민다.

- **첫 진입: 겉틀만 남기고 본문은 통째로 스켈레톤이다.** 겉틀은 헤더·푸터·사이드 메뉴·페이지 제목(레이아웃이 그리는 것)이다. 본문 안의 탭·칩·검색창은 서버 데이터든 고정값이든 같이 스켈레톤이 된다. 화면마다 무엇을 남길지 따지지 않는다.
- **화면 안에서 다시 불러올 때: 이전 내용을 둔다.** 탭·검색·쪽 번호처럼 화면 안 조작으로 조회 조건이 바뀌는 목록 조회는 `queries.js`에 `placeholderData: keepPreviousData`를 넣는다. 그러지 않으면 방금 누른 탭까지 스켈레톤으로 사라진다.
- **첫 진입은 첫 화면에 필요한 조회가 모두 올 때까지다.** 한 화면이 조회 여러 개(반려동물 + 일정 등)를 쓰면 하나만 보고 판단하지 않는다. 캐시된 조회가 먼저 오면 나머지가 비어 "등록된 기록이 없어요" 같은 빈 상태가 잘못 보인다. **로딩 중에 빈 상태 문구를 보이지 않는다.** `data`가 없는 것으로 판단하면 실패한 조회도 영원히 기다리므로 `isError`인 조회는 기다리지 않는다.
- 스켈레톤은 줄이 아니라 **카드 단위**로 그린다. 컴포넌트는 `components/`의 셋만 조합하고 새로 만들지 않는다.
  - `PageSkeleton`: 본문 전체. `top`(칩·탭 위에 놓을 카드, 예: 히어로), `chips`·`tabs`(칩·탭 줄의 개수), 카드 배치(`children`)를 받는다. 카드를 넘기지 않으면 큰 카드 1장이다.
  - `SkeletonCard`: 카드 한 장(제목 막대 + 본문 블록). 높이와 칸은 `className`으로 실제 카드에 맞춘다.
  - `Skeleton`: 카드가 아닌 작은 요소(검색창·버튼·탭 글자·쪽 번호·구역 제목)나 카드 안 한 구역. `className`으로 크기·모양, `lines`로 여러 줄이다.
- **모든 페이지는 실제 배치대로 만든다.** 큰 카드 1장(`<PageSkeleton />`)은 배치를 정하기 전 임시값이다.
  1. 다 불러온 화면을 1440px·390px로 띄워 카드마다 개수·칸·높이를 잰다(Playwright로 `getBoundingClientRect`).
  2. 같은 그리드 클래스(`min-[1101px]:grid-cols-…`)에 `SkeletonCard`를 같은 순서로 놓고, 높이는 잰 값을 `h-[…px]`로 쓴다. 모바일에서 높이가 크게 다르면 `max-[760px]:h-[…px]`을 더한다.
  3. 카드 밖 요소(검색 줄·작성 버튼·쪽 번호·구역 제목)도 같은 자리에 `Skeleton`으로 둔다.
  4. 배치는 그 페이지 파일 안의 작은 함수(`XxxSkeleton`)로 둔다. 로딩 분기가 둘이면 같은 함수를 쓴다. 한 페이지에서만 쓰므로 `components/`로 올리지 않는다.
  5. 확인: 1440px·390px에서 로딩 중 본문 높이가 다 불러온 화면의 ±20% 안이고, 가로 스크롤이 없다. 가짜 API는 바로 응답하므로 확인할 때만 `queryFn`에 지연을 넣었다가 커밋 전에 지운다.
- 페이지 안 컴포넌트가 따로 조회하면(목록 카드 등), 그 컴포넌트의 로딩도 그 카드와 같은 크기의 `SkeletonCard`다.
- 색·애니메이션을 새로 정하지 않는다(진한 색 카드도 흰 `SkeletonCard`). `PageSkeleton`을 쓰지 않고 감쌀 때는 감싸는 요소에 `aria-busy="true"`를 붙인다.
- 쪽 번호(`BoardPagination`·`Pagination`)는 누르면 화면 맨 위로 간다. 경로 이동은 `UserLayout`의 `ScrollToTop`이 맨 위로 올리고, 뒤로가기는 브라우저가 위치를 되살린다. 화면 코드에서 스크롤을 따로 올리지 않는다.

```jsx
/** queries.js: 화면 안 조작으로 조건이 바뀌는 목록 */
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const useFaqs = (params) =>
  useQuery({
    queryKey: faqKeys.list(params),
    queryFn: () => getFaqs(params),
    placeholderData: keepPreviousData,
  });

/** 페이지: 첫 화면에 필요한 조회가 모두 올 때까지(실패한 조회는 기다리지 않음) */
if (
  isPetsPending ||
  (!monthData && !isMonthError) ||
  (!upcomingData && !isUpcomingError)
)
  return <CalendarSkeleton />;

/** 같은 페이지 파일 안: 잰 높이로 실제 배치 */
function CalendarSkeleton() {
  return (
    <PageSkeleton>
      <div className="grid gap-5 min-[1101px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <SkeletonCard className="h-[624px]" />
        <div className="flex flex-col gap-5">
          <SkeletonCard className="h-[262px]" />
          <SkeletonCard className="h-[342px]" />
        </div>
      </div>
      <SkeletonCard className="h-[1538px] max-[760px]:h-[2400px]" />
    </PageSkeleton>
  );
}

/** 히어로가 탭보다 위: top */
<PageSkeleton top={<SkeletonCard className="h-[290px]" />} tabs={4}>
  …
</PageSkeleton>;
```

## 모바일 바텀 네비

760px 미만에서 메인(랜딩 포함)·플레이스를 뺀 사용자 화면은 푸터를 두지 않고 하단에 바텀 네비를 둔다.

- 항목은 그 화면이 속한 메뉴의 서브 메뉴다. 글자만 쓴다.
- AI 플로팅 버튼은 바텀 네비 위에 둔다.
- `layouts/bottomNavMenus.js`의 `paths`는 하위 경로까지 포함한다(`/mypage`면 `/mypage/pets`도). 새 메뉴 영역을 만들면 `{ label, paths, items }`를 추가한다. `UserLayout`이 이 목록으로 푸터를 숨기고 바텀 네비를 둔다.
- 관리자 화면에는 공통 바텀 네비가 없다. 예외로 운영 설정(`features/setting/admin/SettingForm.jsx`)은 760px 이하에서 묶음을 하단 버튼으로 나눠 고른 묶음만 보인다.

## html/ 디자인 파일

`html/`은 git에서 제외되어 각자 PC에만 있다. 팀원과 나누려면 디스코드로 보낸다.

- 파일 이름은 `html/<SCR-ID>.html`(예: `html/SCR-COM-003.html`)이다. HTML이 상대 경로로 읽는 이미지·CSS는 `html/<SCR-ID>/` 아래에 둔다.
- 폴더가 없으면 만든다.
- 사람이 경로를 알려 주면 원본은 두고 복사한다. 경로가 없거나 `.html`이 아니면 복사하지 않고 다시 묻는다. 같은 이름의 파일이 있으면 덮어쓸지 먼저 묻는다.
- 복사할 때 HTML이 상대 경로로 읽는 파일도 `html/<SCR-ID>/`로 같이 복사하고, HTML 안의 경로를 그 위치로 고친다.
- AI 도구가 초안을 만들 때는 화면설계서를 기준으로 위 "AI 슬롭을 넣지 않는다"를 지킨다. 한 파일에 Tailwind CDN과 인라인 스타일만 쓰고 외부 이미지를 불러오지 않는다.
