# JAJ 마일스톤

기준: 건강기록_기능명세서_v1.4_20261110 (DMS, 2026-11-10)

## SCR-HLT-005·007 검진상세·검사 수치 입력 · 검사 수치 0 이상·정수 7자리 — 끝

- 기능: FN-HLT-005(검진상세 [＋ 검사 수치 추가])·FN-HLT-007-01·02·03(검사 수치 입력 수정·직접 입력)·FN-HLT-007-05(PDF 분석 결과 검수 표)의 결과값·참고범위 숫자 검사를 `numberFormat.js` `getLabNumberError`·`getLabRangeError`로 통일(※신규 정책: 0 이상·정수 7자리·소수 둘째 자리, 순서 숫자 아님 → 0 미만 → 소수 셋째 자리 → 정수 8자리). 검수 표는 문구별로 항목 이름을 묶어 표 아래에 표시·저장 막음. 결과값·참고범위 입력칸 `maxLength` 10
- 기다리는 것: 없음(백엔드 `@Digits(integer = 7, fraction = 2)`·`@DecimalMin("0")`은 별도 작업)
- 완료 조건: 명령: lint·build 0 / 화면: 검진상세 [＋ 검사 수치 추가] 결과값 -5·1.234·12345678·abc → 각 문구·요청 없음, 11자 붙여 넣기 → 10자, 9999999.99 저장 201 / 검사 수치 입력 수정 -5 → 문구·요청 없음 / 검수 표 문구 묶음 표시
- 추가-1: 위와 같음(사람 작업 지시를 그대로 기획으로 봄)
- 결과: 2026-11-11 Playwright 확인 통과(커밋 ad52dbc). 검진상세 -5·1.234·12345678·abc 문구·요청 없음, 11자 → 10자, 9999999.99(참고범위 0~9999999.99) 201 뒤 삭제 200. 검사 수치 입력 수정(검진 6 CREA) -5 문구·요청 없음. 검수 표는 PDF가 없어 첨부 파일·AI 분석 응답을 Playwright route 가짜로 띄워 문구 4묶음·요청 없음 확인. 사람 확인 끝(2026-11-11)
- 추가-2: PDF 분석 참고범위가 규칙(0 이상·소수 둘째 자리 반올림 뒤·정수 7자리·한쪽만 안 됨·최소 ≤ 최대)에 어긋나면 최소·최대 둘 다 null로 보냄(※신규 정책), 참고범위 정수 문구 「참고범위는 정수 7자리까지 입력할 수 있어요」. 2026-11-11 Playwright 확인 통과(가짜 분석 응답으로 실제 저장 201 뒤 삭제 200). 분석 참고범위 소수 셋째 자리는 반올림해 둠
- 연결 남음: 없음(백엔드 `@Digits`·`@DecimalMin`은 사람이 별도 작업)

## SCR-HLT-003·005 케어 캘린더·검진상세 · 주기 직접입력 일수 1~365 — 끝

- 기능: FN-HLT-003-24 관리 항목 추가·수정 직접입력 일수 1~365 정수 검사(범위 밖이면 버튼 비활성·도움말 아래 「1~365 사이 정수로 입력해 주세요」·다음 예정일 숨김, 빈 칸은 문구 없음), FN-HLT-005-05 검진상세 반복 예방 직접입력 365 이하 검사·문구 통일(※신규 정책, 공용 검사 `careDue.js` `isValidCycleDays`)
- 기다리는 것: 없음(백엔드 `@Max(365)`는 사람이 별도 작업)
- 완료 조건: 명령: lint·build 0 / 화면: 0·-3·1.5·366·10000 → 문구·버튼 비활성, 365·10 → 문구 없음·버튼 활성, 365 추가 201·「365일 주기」, 사용자 항목 수정 같음 / 반복 예방 366 → 문구·요청 없음, 365 저장 201
- 추가-1: 위와 같음(사람 작업 지시를 그대로 기획으로 봄)
- 결과: 2026-11-11 Playwright 검증 모두 통과(커밋 11d6e50), 테스트 관리 항목·반복 예방 삭제·해지. 사람 확인 끝
- 연결 남음: 없음

## SCR-HLT-003 케어 캘린더 · 관리 항목 이름 40자·FormModal — 끝

- 기능: FN-HLT-003-21 항목명 40자 한도와 글자 수(n / 40) 표시(※신규 정책, DDL v0.14 CARE_ARTCL_NM varchar(40), 백엔드 `@Size(max = 40)` 이미 같음), 관리 항목 추가·수정 모달 틀을 `diary/FormModal`로 통일
- 기다리는 것: 없음
- 완료 조건: 명령: lint·build 0 / 화면: 41자 붙여 넣기 → 40자 "40 / 40", 40자·매일 저장 201, 기본 항목 수정 때 이름 비활성·글자 수 없음, ✕·취소·ESC 닫힘, 저장 중 잠금, 폭 440px·390 여백 안
- 결정: FormModal 기본 모양을 따름(배경 흐림 없음, 제목 아이콘과 세로 가운데, 비활성 저장 버튼 회색)
- 결과: 2026-11-11 Playwright 검증 모두 통과(추가-1), 테스트 항목 삭제. 사람 확인 끝
- 연결 남음: 없음

## SCR-HLT-002 건강 일지 · 체중 200kg 상한 안내 — 끝

- 기능: FN-HLT-002-11 체중 200kg 초과 입력 막고 안내(※신규 정책, 백엔드도 200kg 초과를 400으로 막음)
- 기다리는 것: 없음
- 완료 조건: 명령: lint·build 0 / 화면: 오늘 기록하기·기록 수정 모달 체중 999 → 「체중은 200kg 이하로 입력해 주세요」, 저장 요청 없음 / 200은 저장 / 식사량 999는 지금처럼 저장
- 결정(사람, 2026-11-11): 오늘 기록하기는 입력하는 동안 바로 안내. 추가-1: 안내는 입력칸 아래에 겹쳐 띄워(`absolute`) 종류·시간·무게 줄 높이를 그대로 두고, 뜨는 동안만 아래 간격을 넓힘
- 결과: 2026-11-11 검증 1회차 통과, 추가-1 반영 뒤 2회차 통과. 사람 확인 끝
- 연결 남음: 없음

## SCR-HLT-005·007 건강기록 상세 화면 · 반려동물 표시 — 끝

- 기능: FN-HLT-005-16 · 007-07 이 기록의 아이(보기 전용, ※신규 정책, v1.4에 없음)
- 기다리는 것: 없음
- 완료 조건: 명령: lint·build 0 / 화면: 검진상세·검사 수치 입력에 주소 petSn 아이 카드(1101px 이상)·알약(1100px 이하), 눌러도 반응 없음, 공통 선택값 그대로, 공동양육 아이도 표시, 로딩·오류에서는 없음
- 결정(사람, 2026-11-10): `shared/PetSwitcher.jsx`에 `export function PetBadge({ pet, variant })`(`<div>`, 포커스·팝오버 없음, `useStickBelowMenu` 재사용). 카드·알약 모두 `bg-surface-3`·`border-transparent`. `useMyPets()` 목록에서 주소 petSn으로 찾고 없으면 안 그림
- 결과: 2026-11-10 검증 2회차 통과(1회차는 카드 `max-[1100px]:hidden`이라 정확히 1100px에서 카드·알약이 같이 보여 실패 → `max-[1101px]:hidden`). 화면은 user0006(까미 공동양육)으로 확인, 사람 확인 끝
- 연결 남음: 없음

## SCR-HLT-011 종합 건강기록 · 휴대폰 요약 띠와 2열 요약 타일 — 끝

- 기능: FN-HLT-011-17 휴대폰 요약 타일(v1.4 신설, 만들 때는 ID 없음), 640px 미만(`max-sm`)에서만 바꾼다(640px 이상은 그대로). 바꿀 파일 `summary/SummaryBanner.jsx`·`dashboard/HealthDashboard.jsx`·`dashboard/DashboardCard.jsx`(AiReportCard)·`dashboard/WidgetCard.jsx`, 필요하면 새 `dashboard/WidgetTile.jsx`. 공용 `Card.jsx` 등은 건드리지 않음
  - 요약 띠: `bg-brand-50` 테두리 없음, 둘째 줄 "종 · 나이 · 날짜 기준"(`formatDate`·`petFormat`), 요약 3칸(최근 검진·검사 수치·현재 처방)을 `grid-cols-3 gap-2` 흰 상자로(아이콘·항목명 / 큰 값 / 보조 줄 말줄임). 최근 검진은 상대 날짜 + 병원명만. 대시보드 제목과 간격 `mt-8`
  - 대시보드 부제는 "고른 기록만 보여요"만(기준일 뺌)
  - AI 리포트: 260px 카드 → 한 줄 띠(아이콘·제목·"건강 코멘트를 준비하고 있어요"), `min-h`·핀 없음
  - 위젯: `grid-cols-2 gap-3` 요약 타일(아이콘·이름·› / 큰 값 `text-xl font-bold` / 칩 0~1개 / 보조 줄), 타일 전체가 [더보기]와 같은 곳으로 가는 링크. ckup·insp는 화면에만 그리지 않음(선택·저장값 그대로, ※신규 정책). 위젯별 문구: weight·obsv·care·meal·water·walk는 요청대로, poop·presc·atch·allergy·vacc는 기존 첫 값 + 날짜·개수, 칩 없음. 기록 없으면 "기록 없음" + 기존 emptyText/desc. 홀수 마지막 타일은 한 칸
  - 칩 색 `tone-green`·`tone-amber`·`tone-rose`, 회색 `bg-surface-2 text-ink-2`. 새 HEX·px 임의값 금지
  - 추천 안내(`widgetItems.js`·`WidgetPicker.jsx`): `RECOMMENDED_IDS` 체중·식사량·음수량(D4 수정, ※신규 정책), 문구는 `joinWidgetNames`로, 640px 미만은 문장 두 줄 + 버튼 아래 줄 오른쪽. 저장된 선택은 그대로
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 375px 누리 기준 요약 띠 약 185px, AI 띠 아래 타일 3개(체중·지속 관찰·케어리스트), 대시보드 구역 1,963px → 약 450px, 검진기록·검사 수치 타일 없음. 기록 없는 반려동물(라떼)은 요약 띠 "-·기록 없음", 타일 "기록 없음"으로 깨지지 않음. 744px·1280px는 바뀌기 전과 같음
- 결과: 2026-11-09 검증 2회차 통과(1회차는 요약 띠 229px로 실패 → 휴대폰 캐릭터 56/44px), 사람 확인 끝. 띠 189px, AI 띠 66px, 누리 타일 3개일 때 대시보드 444px
- 결정: 디자인은 요청문 기준(사람). 앞서 대화로 받은 1열 기준 760px → 640px도 이 커밋에 함께
- 추가 요청: 추가-1 640px 미만 캐릭터 자리 64px·캐릭터 56px, [캐릭터 만들기]는 + 와 "캐릭터"만, 링크 aria-label "캐릭터 만들기" (2026-11-09 검증 1회차 통과, 띠 197px)
- 연결 남음: 없음

## SCR-HLT-003 케어 캘린더 — 끝

- 기능: FN-HLT-003-29 월간 캘린더, 003-30 일정 종류 태그, 003-31 날짜 클릭 → 인라인 상세, 003-39 표시 반려동물 필터, 003-40 다가오는 케어 일정, 003-01 반려동물 선택 탭, 003-12 토탈 케어리스트, 003-13 메인 표시 ★ 토글(추가-9로 제거, v1.4 결번), 003-37 반려동물 선택, 003-34 일정 종류, 003-32 날짜 · 시간, 003-35 종류별 추가 필드, 003-36 일정 메모 · 뱃지 색상, 003-33 하단 버튼, 003-21 항목명, 003-22 카테고리 대표 아이콘, 003-23 반복 유형, 003-24 주기, 003-38 마지막으로 한 날
- 기다리는 것: 없음
- 완료 조건: 날짜를 누르면 그날 일정이 인라인 상세에 나오고 [＋ 새 일정 등록]으로 모달이 열린다 / 케어 타일을 누르면 완료 토글되고 정기관리 다음 예정일이 다시 계산된다
- 연결 남음: 없음 (반려동물 목록·일정·케어 API는 「일정 API 연결」·「반려동물 목록 연결」·「토탈 케어리스트 API 연결」에서 연결, 캐릭터 이미지는 「PetFace 올리기」, 케어미션은 백엔드가 저장 때 반영)

## SCR-HLT-002 건강 일지 — 끝

- 기능: FN-HLT-002-01 반려동물 선택 탭, 002-09 건강기록 변화, 002-10 그래프 원칙 · 조회기간, 002-12 오늘의 기록, 002-11 오늘 기록하기, 002-13 최근 건강기록 (날짜별 표), 002-15 관찰 항목 목록, 002-16 선택 항목 헤더, 002-17 회차별 사진 필름스트립, 002-18 크기 변화 그래프, 002-19 선택 회차 상세, 002-05 검진기록 리스트, 002-14 조회 연도 선택, 002-06 검진 건수 필터 칩, 002-20 관찰 항목, 002-21 관찰 부위, 002-32 관찰일, 002-22 사진 촬영, 002-23 크기 · 변화, 002-24 메모, 002-25 취소 / 저장하기, 002-33 등록 방법 선택, 002-26 반려동물 선택, 002-27 검진일, 002-28 병원명 · 검진 종류, 002-29 검진 내용 · 검진 메모, 002-30 캘린더 연결 안내, 002-31 취소 / 저장하기
- 기다리는 것: 없음
- 완료 조건: 오늘 기록을 추가하면 오늘의 기록 타일·그래프·최근 건강기록 표가 함께 갱신된다 / 검진기록을 직접 입력해 저장하면 새 검진기록의 검진상세로 이동한다
- 연결 남음: 없음 (「검진기록 API 연결」·「일상 기록 API 연결」·「지속 관찰 API 연결」에서 연결)

## SCR-HLT-002 건강 일지 · 영수증 등록 — 끝

- 기능: FN-HLT-002-34 원본 이미지, 002-35 검진일 · 병원명, 002-36 반려동물별 기록 탭, 002-37 검진 종류, 002-38 검진 내용 · 검진 메모, 002-39 금액, 002-40 처방 약품, 002-41 가계부에도 기록, 002-42 영수증 금액 · 할인 배분, 002-45 다시 촬영하기 · 저장하기, 002-43 배정 필요 목록, 002-44 가계부 중복 확인, 002-46 가까운 예정 일정 확인
- API가 남의 것: 002-34~46 영수증 결과 확인 (YAY), 002-41·44 가계부 지출 생성·중복 확인 (SJM)
- 기다리는 것: 없음
- 완료 조건: 영수증으로 등록한 검진기록이 병원 일정에 자동 연결되고 검진상세로 이동한다 / 여러 마리 탭에서 하나라도 실패하면 모두 되돌리고 입력값이 유지된다
- 연결 남음: 없음 (「영수증 일괄 저장 연결」·「영수증 원본 이미지 연결」에서 연결)

## SCR-HLT-005 검진상세 — 끝

- 기능: FN-HLT-005-01 기본정보 · 첨부 자료, 005-04 PDF 분석, 005-02 검사 결과 탭 · 검사 종류 칩, 005-03 처방약, 005-05 반복 예방 관리, 005-15 상세 탭, 005-11 검사명, 005-12 검사 결과, 005-13 메모, 005-14 취소 / 저장하기
- 기다리는 것: 없음
- 완료 조건: 탭 4개가 건수와 함께 나오고 처음 열면 검사 결과 탭이 선택된다 / 처방약을 주기 체크 ON으로 저장하면 케어 캘린더 일상관리에 투약 항목이 생긴다
- 연결 남음: 없음 (「검진상세 · API 연결」·「PDF 분석 연결」에서 연결)

## SCR-HLT-007 검사 수치 입력 — 끝

- 기능: FN-HLT-007-04 분석 결과 검수, 007-05 검사 종류 표시, 007-06 다시 분석 · 직접 입력하기, 007-01 검사 종류, 007-02 검사 항목, 007-03 취소 · 저장하기
- 기다리는 것: 없음
- 완료 조건: 참고범위를 한쪽만 입력하면 [저장하기]가 막힌다 / 수정 진입 시 기존 값이 채워지고 저장하면 해당 행이 갱신된다
- 연결 남음: 없음 (「검사 수치 입력 · API 연결」·「PDF 분석 연결」에서 연결)

## SCR-HLT-011 종합 건강기록 — 끝

- 기능: FN-HLT-011-01 반려동물 선택 탭, 011-02 요약 바, 011-03 건강 이력 타임라인, 011-04 예방 · 정기검진 이력, 011-05 알레르기 · 기저질환, 011-06 검사 결과(v1.4 결번, 검사 수치 카드로 합침), 011-07 검사 수치 추이, 011-08 처방 및 투약 이력, 011-09 첨부 자료, 011-10 관찰 기록
- 기다리는 것: 없음
- 완료 조건: 검사 결과 행을 누르면 옆 검사 수치 추이 그래프가 그 항목으로 바뀐다 / 예정 일정이 없으면 "등록된 예정 일정 없음"이 나온다
- 연결 남음: 없음 (「종합 건강기록 · API 연결」·「캐릭터 상태 연결」에서 연결)

## SCR-HLT-002 건강 일지 · 검진 칩 해제 — 끝

- 기능: FN-HLT-002-06 검진 건수 필터 칩 (재클릭 해제를 [올해 검진]에도 적용)
- 기다리는 것: 없음
- 완료 조건: [올해 검진]·[예방접종] 모두 켜진 칩을 다시 누르면 꺼지고, 둘 다 꺼지면 그해 전체가 나온다
- 연결 남음: 없음

## 공용 · PetFace 올리기 — 끝

- 기능: `features/pet/shared/PetFace.jsx` → `components/PetFace.jsx`, `useCharacterImage` → `hooks/useCharacterImage.js`. props는 `petSn`·`petSeCd`·`chrcSttsCd`와 기존 `className`·`iconClassName`·`alt`·`fallback`
- 기다리는 것: 없음 (담당자 답변으로 확정: 이미지 키는 맞출 필요 없음, PetFace는 `petSn`으로 이미지 자체를 받는다)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 통과 / `features/pet` 밖에서 `PetFace`를 쓸 수 있고 `features/pet`의 네 곳(PetMiniCard·PetSlide·PetProfileCard·InvitationAccept) 표시가 그대로다
- 연결 남음: 없음 (`hooks/useCharacterImage.js`가 실제 `GET /pets/{petSn}/character-image`를 쓴다. 캐릭터 있는 아이 404는 핸드오프 "참고")

## 공용 · 영수증 사용처 키 — 끝

- 기능: 건강 일지 영수증의 "가계부에도 기록"(FN-HLT-002-41)이 병원명을 `dtlMttr`(내용)이 아니라 사용처에 넣는다. 가계부 사용처 키를 `expndPlcNm` → `expndPlcusNm`으로 바꾼다. 내용(`dtlMttr`)은 빈칸
- 기다리는 것: 없음 (담당자 답변으로 확정)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 통과 / 화면: 영수증으로 검진기록을 저장하면 가계부 가짜 목록에 사용처=병원명, 내용=빈칸으로 들어간다
- 연결 남음: 없음 (「영수증 일괄 저장 연결」에서 가계부 지출까지 실제 저장)
- 추가 요청: 건강 일지(SCR-HLT-002) 추가-1~20을 이 작업에서 함께 처리(핸드오프 기록, 추가-9·11은 추가-13으로 되돌림)

## SCR-HLT-002 건강 일지 · 결함 정리와 모달 다듬기 — 끝

- 기능: 건강 일지 핸드오프 "참고(실패 아님)" 4건과 결정 필요 1건, 상세 기록 모달 높이·✕ (명세 기능 ID 추가 없음, FN-HLT-002-11·13·15·16·18·14에 걸침)
- 기다리는 것: 없음 (공용 `Modal.jsx`·`Card.jsx`는 선택 속성 추가·접근성만 고치고 알린다)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 통과 / 화면: 아래 기획의 항목별 확인
- 연결 남음: 없음 (실제 API 연결은 기존 항목 그대로)
- 추가 요청: 추가-1 반려동물 칩 → 셀렉트, 추가-2 알약형·히어로 색(`DropdownSelect` `isPill`), 추가-3 이름 칸 세 글자 폭·말줄임, 추가-4 검진상세 [건강 일지로 돌아가기] 삭제

## SCR-HLT-003 케어 캘린더 · 결함 정리 — 끝

- 기능: 케어 캘린더 핸드오프 "참고" 2건 (명세 기능 ID 추가 없음, FN-HLT-003-31·01에 걸침)
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 통과 / 화면: 390px에서 날짜 상세 카드 제목이 잘리지 않고 부제가 한 줄 / `#hlt003-care`로 들어오면 케어리스트 탭으로 시작
- 연결 남음: 없음 (실제 API 연결은 기존 항목 그대로)
- 추가 요청: 추가-1~18. 달력 칸 88px·760px 이하 점 달력(5·12, 1·11 대체), [출처 보기] 삭제(4), 케어리스트 셀렉트를 카드 제목 왼쪽으로(13, 2·7 대체), 두 열 줄 높이(9, 3 대체), 처방약 연동 배지 정렬·투약 한 줄(10·17, 8 대체), 모바일 카드 머리·둥근 칸·더보기(14·15), 스켈레톤 높이(6·16·18)

## SCR-HLT-003 케어 캘린더 · 일정 API 연결 — 끝

- 기능: 케어 캘린더 절의 일정 가짜 응답을 실제 API로 교체 (명세 기능 ID 추가 없음, FN-HLT-003-29~37·40에 걸침). `features/health/api.js`의 일정 조회·등록·수정·삭제 → `/pets/{petSn}/care-schedules`(반려동물마다 조회 후 합침), 필드를 서버 이름(`schdlKndCd`·`schdlKndCdNm`·`ckupTypeCdNm`·`hsptlNm`·`schdlDt`·`hrInptYn`·`memoCn`·`ckupRcdCnt`)과 일정·검진 코드 HLTC 값으로 맞춤
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `http://localhost:5173/health/calendar`에서 API로 등록한 일정이 월간 캘린더·날짜 상세에 코드명·시간 순으로 나오고, 모달의 등록·수정·삭제가 서버에 반영된다
- 연결 남음: 없음 (반려동물 목록은 "케어 캘린더 · 반려동물 목록 연결"에서 끝)

## SCR-HLT-003 케어 캘린더 · 반려동물 목록 연결 — 끝

- 기능: 케어 캘린더의 가짜 반려동물 목록을 실제 `GET /pets`(SJM `PetSummary`)로 교체 (명세 기능 ID 추가 없음, FN-HLT-003-01·29·31·37·39·40에 걸침). 건강 일지·검진상세·종합 건강기록의 가짜 목록은 그대로 둔다(「종합 건강기록 · API 연결」에서 지움)
- 기다리는 것: 없음 (백엔드 develop에 있음)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `http://localhost:5173/health/calendar`의 필터 칩·날짜 상세·다가오는 일정·일정 모달·케어리스트 셀렉트 이름이 DB 이름으로 나온다
- 연결 남음: 없음

## SCR-HLT-002 건강 일지 · 검진기록 API 연결 — 끝

- 기능: 건강 일지 검진기록 탭의 가짜 응답을 실제 API로 교체 (명세 기능 ID 추가 없음, FN-HLT-002-05·06·14·26~31·46에 걸침). 목록 `GET /pets/{petSn}/checkups?year=&ckupTypeCd=&page=&size=`(`year` 생략 시 전체 연도, 건수는 `totalElements`), 등록 `POST`(선택 `schdlSn` = 옮겨 연결하기), 수정 `PATCH`, 삭제 `DELETE`. 46 확인 창 후보는 `GET /pets/{petSn}/care-schedules`를 검진일 앞뒤 7일·`schdlKndCd=HLTC0057`로 불러 `ckupRcdCnt == 0`인 행 중 가장 가까운 1건을 고른다
- 기다리는 것: 없음. 상위 키 상세 주소는 경로 방식으로 정해짐(2026-10-31)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 검진기록 탭에서 API로 등록한 검진기록이 연도·종류 칩에 맞게 최신순으로 나오고, 등록·수정·삭제가 서버에 반영되며 삭제 뒤 캘린더 일정은 남는다
- 연결 남음: 없음

## SCR-HLT-003 케어 캘린더 · 토탈 케어리스트 API 연결 — 끝

- 기능: 케어리스트 탭의 가짜 응답을 실제 API로 교체 (명세 기능 ID 추가 없음, FN-HLT-003-01·12·13·21~24·38에 걸침). 목록 `GET /pets/{petSn}/care-items`(정기관리 먼저, 상태 배지는 `nxtmPrnmntYmd`로 화면이 계산, 투약 n/N은 `todayCmptnCnt`/`dayMdcnNmtm`), 기록 내용 `GET /pets/{petSn}/care-completions?fromYmd=&toYmd=`(완료일 내림차순), 완료 체크 `POST /pets/{petSn}/care-completions`(처음 201, 같은 날 다시 200), 기록 내용 항목 아이콘 취소 `DELETE /pets/{petSn}/care-completions/{careCmptnHstrySn}`(투약도 그날 체크 전부 취소, 한 번만 보낸다), 투약 [마지막 1회 취소] `DELETE /pets/{petSn}/care-items/{careArtclSn}/today-completion/last`(목록 행의 `careArtclSn`만 쓴다, 투약 아니면 400 `INVALID_INPUT_VALUE`, 오늘 기록 없으면 404 `CARE_COMPLETION_NOT_FOUND`). 기록 내용 `GET care-completions`는 투약을 하루 N회 채운 날만 주므로 화면에서 따로 숨기지 않는다. 취소 뒤 목록·기록 내용을 다시 부른다. ★ `PUT /pets/{petSn}/care-item-exposures`(최대 6, 7개면 400 `CARE_ITEM_MAIN_LIMIT_EXCEEDED`)(추가-9로 제거), 항목 추가 `POST /pets/{petSn}/care-items`(구역 HLTC0036 일상·HLTC0037 정기, 주기 HLTC0038~0042, 직접입력 일수 `cycleDrctInptDayCnt`), 수정 `PATCH`·삭제 `DELETE /pets/{petSn}/care-items/{careArtclSn}`(기본 항목·처방약 연동 항목은 400)은 `updateCareItem`·`deleteCareItem` API 연결만 하고 UI는 "케어 항목 수정·삭제 UI" 절에서 한다. 아이콘은 Material Symbols 이름(`task_alt` 기본)
- 기다리는 것: 없음 (백엔드 develop에 있음)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `http://localhost:5173/health/calendar` 케어리스트 탭에서 새 반려동물에 기본 항목 11개(양치·빗질·발톱 관리 ★, 추가-9로 제거)가 나오고, 완료 토글·기록 내용 취소·★ 토글(추가-9로 제거)·항목 추가가 서버에 반영되며 정기관리 예정일이 완료일 + 주기로 바뀐다. 하루 2회 투약 항목을 1회 누르면 1/2회이고 기록 내용에 없으며, 2회 누르면 기록 내용에 1줄 생긴다. [마지막 1회 취소]는 1회씩 내려가고, 기록 내용 아이콘 취소는 요청 1번으로 그날 기록이 사라지며 0/2회가 된다
- 확인할 것: 해결됨. 투약 [마지막 1회 취소]는 완료 기록 번호 없이 새 API `DELETE /pets/{petSn}/care-items/{careArtclSn}/today-completion/last`(성공 200 data 없음, 투약 아니면 400, 오늘 기록 없으면 404)를 쓴다(백엔드 develop `b3389a0`)
- 연결 남음: 없음

## SCR-HLT-005 검진상세 · API 연결 — 끝

- 기능: 검진상세 페이지의 가짜 응답을 실제 API로 교체 (명세 기능 ID 추가 없음, FN-HLT-005-01~05·11~15에 걸침). 기본정보 `GET /pets/{petSn}/checkups/{ckupRcdSn}`(인라인 수정은 `PATCH` 그대로), 첨부 `GET /pets/{petSn}/checkup-attachments?ckupRcdSn=&atchTypeCd=&page=&size=`(Page, 영상검사 칩은 `atchTypeCd=HLTC0064`)·`POST`(multipart `ckupRcdSn`·`file`·`atchTypeCd`·영상 사진이면 `imgKndCd`·`shtRegnCd` 필수)·`PATCH`(multipart 교체)·`DELETE`·파일 `GET …/{ckupRcdAtchSn}`, PDF 분석은 Java API 없이 화면이 검사결과지 PDF를 Python `POST /ai/checkups/lab-results`로 직접 보낸다(백엔드 `143956f`에서 Java `…/analyses` 삭제, 응답 모양은 AI 서버 쪽에서 확인), 혈액검사 `GET /pets/{petSn}/inspection-values?ckupRcdSn=`·선택 삭제 `DELETE ?inspNvlSn=&inspNvlSn=`, 기타검사 `GET/POST/PATCH/DELETE /pets/{petSn}/etc-inspections`, 처방약 `GET/POST/PATCH/DELETE /pets/{petSn}/prescriptions`(복용중 우선, `careRfltYn` 미전송은 OFF), 반복 예방 `GET/POST/DELETE /pets/{petSn}/repeat-preventions`. 목록 API는 모두 `ckupRcdSn` 필수. 탭 건수는 각 목록 길이로 센다
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 검진상세에서 탭 4개 건수가 API 결과와 맞고, 첨부 등록·교체·삭제와 기타검사·처방약·반복 예방 저장이 서버에 반영되며, 주기 체크 ON 처방약 저장 뒤 케어 캘린더 일상관리에 투약 항목이 생긴다
- 이미지 표시: 첨부·영상 결과(`checkup/ImagingResultList.jsx`)는 비공개 파일이라 `publicFileUrl`이 아니라 `@/hooks/useFileImage` + `@/components/FileImage`로 `GET /pets/{petSn}/checkup-attachments/{ckupRcdAtchSn}`을 그린다. 등록 전 로컬 미리보기(`createObjectURL`)는 그대로 둔다
- 추가 요청: 추가-1 첨부 목록 요청 `page=1&size=50`(서버 페이지는 1부터, 최대 50)
- 연결 남음: 없음 (검사 수치 저장·수정·PDF 분석은 SCR-HLT-007 · API 연결)

## SCR-HLT-007 검사 수치 입력 · API 연결 — 끝

- 기능: 검사 수치 입력 페이지와 검진상세 [＋ 검사 수치 추가]의 가짜 저장을 실제 API로 교체 (명세 기능 ID 추가 없음, FN-HLT-007-01~06에 걸침). 저장 `POST /pets/{petSn}/inspection-values`(본문 `ckupRcdSn`·`values[]`: `inspArtclCd`(HLTG12) 또는 `inspArtclDrctInptNm`(직접입력), `rsltNvl`·`unitNm` 필수, 참고범위 하한·상한은 둘 다 또는 둘 다 비움, 201, `data`는 실제 저장·복구된 행만 — 보낸 항목 중 빠진 것으로 "이미 등록된 항목입니다: …" 안내), 수정 `PATCH /pets/{petSn}/inspection-values/{inspNvlSn}`(보낸 필드만, 항목 변경 불가). 분석 검수는 Python `POST /ai/checkups/lab-results` 결과로 하고, 이미 등록된 항목 표시는 화면이 `GET /pets/{petSn}/inspection-values?ckupRcdSn=`와 비교한다(Java `…/analyses`의 `registered`·`excludedArtclNms`는 없어짐, 저장 때도 서버가 중복을 빼고 응답 `data`에 남은 행만 준다). SDMA는 공통코드 `HLTC0078`(HLTG12)로 보낸다
- 기다리는 것: 없음 (백엔드 검사 수치 저장·수정 API는 develop에 머지됨, PR #83)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 검사 수치 입력에서 저장하면 검진상세 혈액검사 탭에 반영되고, 이미 있는 항목은 안내 후 빠지며, 항목명 클릭 수정 진입 시 저장하면 새 행 없이 그 행이 바뀐다
- 결정: 수정 화면에서 기존 참고범위를 둘 다 비우면 "참고범위는 수정에서 지울 수 없어요"로 막는다(「참고범위 비우기 연결」에서 바뀜)(서버 PATCH가 `null`을 "안 바꿈"으로 받음). SDMA는 `HLTC0078`
- 연결 남음: 없음 (참고범위 비우기는 「참고범위 비우기 연결」, PDF 분석은 「PDF 분석 연결」에서 연결)

## SCR-HLT-002 건강 일지 · 일상 기록 API 연결 — 끝

- 기능: 건강기록 변화 탭의 반려동물 드롭다운·그래프·오늘의 기록 카드·[오늘 기록추가] 입력 영역·최근 건강기록 표·상세 기록 모달 인라인 수정·삭제를 실제 API로 연결 (명세 기능 ID 추가 없음, FN-HLT-002-01·09~13에 걸침). 목록 `GET /pets/{petSn}/daily-health-records?dailyRcdIdctCd=&fromYmd=&toYmd=&size=`(size 1~100이면 최신 N건, 결과는 항상 `rcdDt` 오름차순, 서버는 날짜별로 묶지 않음 — 그래프는 `size=14`로 받은 뒤 가장 이른 날짜를 `fromYmd`로 한 번 더 불러 하루 합계를 맞춘다), 등록 `POST`(배변상태 HLTC0017은 `crsdSttsCd`(HLTG10)만, 그 밖은 `rcdNvl`만, 201), 수정 `PATCH …/{dailyHlthRcdSn}`(보낸 값만, 지표와 안 맞는 필드는 400), 삭제 `DELETE …/{dailyHlthRcdSn}`. 반려동물 목록은 `GET /pets`
- 기다리는 것: 없음 (백엔드 일상 건강기록 API는 develop에 머지됨, `2294375`)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 오늘 기록추가로 저장하면 오늘의 기록 카드·그래프·최근 건강기록 표에 바로 반영되고, 상세 기록 모달에서 한 줄을 고치거나 지우면 세 곳이 함께 바뀐다
- 결정: 반려동물 목록은 이미 실제 `useMyPets`였다. 일상 기록 가짜는 `getFakeDailyRecords`로 종합 건강기록 전용으로 남김(「종합 건강기록 · API 연결」에서 지움), `?fakeDaily=`는 다른 가짜가 써서 남김
- 연결 남음: 없음

## SCR-HLT-002 건강 일지 · 지속 관찰 API 연결 — 끝

- 기능: 지속 관찰 탭의 관찰 항목 목록·선택 항목 헤더·[관찰 종료]·회차별 사진 필름스트립·크기 변화 그래프·선택 회차 상세(수정·삭제)·관찰 기록 등록 모달 A(새 항목)/B(회차 추가)를 실제 API로 연결 (명세 기능 ID 추가 없음, FN-HLT-002-15~25·32에 걸침). 목록 `GET /pets/{petSn}/observation-items?obsrvSttsCd=`(firstCycle·lastCycle·cyclCnt·lastSzDiff, 관찰중 먼저), 종료 `POST …/observation-items/{obsrvArtclSn}/end`, 회차 `GET /pets/{petSn}/observation-cycles?obsrvArtclSn=`(관찰일 오름차순, cyclNo는 서버가 매김), 사진 `GET …/observation-cycles/{obsrvCyclSn}/photo`(원본, 썸네일 없음), 모달 A `POST /pets/{petSn}/observation-items`(multipart, 201), 모달 B `POST /pets/{petSn}/observation-cycles`(multipart, 종료 항목은 400 OBSERVATION_ITEM_ENDED), 수정 `PATCH …/observation-cycles/{obsrvCyclSn}`(multipart, 보낸 값만), 삭제 `DELETE …/observation-cycles/{obsrvCyclSn}`(마지막 회차를 지우면 항목도 사라짐). 그래프·증감은 화면이 계산
- 기다리는 것: 없음
- 이미지 표시: 회차 사진(`diary/ObservationCard.jsx`·`ObservationDetail.jsx`·`ObservationMobile.jsx`)은 비공개 파일이라 `@/hooks/useFileImage` + `@/components/FileImage`로 `GET …/observation-cycles/{obsrvCyclSn}/photo`를 그린다. 모달의 로컬 미리보기(`ObservationModal.jsx` `createObjectURL`)는 그대로 둔다
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 모달 A로 항목을 등록하면 목록과 필름스트립에 1회차가 나오고, 모달 B로 회차를 추가·삭제하면 필름스트립·그래프·회차 번호가 함께 바뀌며, [관찰 종료] 뒤 항목이 목록 끝으로 가고 회차 추가가 막힌다
- 결정: 백엔드 API는 develop에 머지돼 있었다. 반려동물 목록은 이미 실제 `useMyPets`. 부위·변화·상태는 공통코드 HLTC0043~0056. 관찰 가짜는 `getFakeObservations`로 종합 건강기록 전용으로 남김(「종합 건강기록 · API 연결」에서 지움). 추가-1 모바일 회차 사진도 오래된 회차부터 왼→오른쪽(처음엔 오른쪽 끝), 추가-2 삭제·등록·종료 때 사진은 다시 받지 않고 사진을 바꾼 수정만 다시 받음(지운 직후 404 없앰)
- 연결 남음: 없음 (「지속 관찰 회차 수정 비우기 연결」에서 연결)

## SCR-HLT-011 종합 건강기록 · API 연결 — 끝

- 기능: 종합 건강기록 화면 전체를 실제 API로 연결 (명세 기능 ID 추가 없음, FN-HLT-011-01~10에 걸침). 반려동물 탭 `GET /pets`, 요약 바·알레르기·기저질환 `GET /pets/{petSn}`(`petBdwg`·`algyCn`·`dssCn`) + 최신 체중 `GET /pets/{petSn}/daily-health-records?dailyRcdIdctCd=<체중>&size=1`(없으면 `petBdwg`) + 최근 검진 `GET /pets/{petSn}/checkups?size=1`, 타임라인 `GET /pets/{petSn}/checkups?size=5` + `GET /pets/{petSn}/repeat-preventions`(`ckupRcdSn` 생략 → 반려동물 전체, 시작일 최신순, `hsptlNm` 포함. 시작일이 오늘 이후인 것 제외·5건 병합·같은 날짜면 검진기록 먼저는 화면), 예방·정기검진 `GET …/checkups?ckupTypeCd=` + `GET …/care-schedules?fromYmd=<오늘>&schdlKndCd=<병원>&ckupTypeCd=&size=1`, 검사 결과·추이 `GET /pets/{petSn}/inspection-values`(`ckupRcdSn` 생략 → 전체, 검진일 오름차순·`schdlDt` 채움. 최근 1회차·기본 항목은 화면), 처방 `GET /pets/{petSn}/prescriptions`(`ckupRcdSn` 생략 → 전체, 복용중 우선·최신순), 첨부 `GET /pets/{petSn}/checkup-attachments?size=4`(`ckupRcdSn` 생략 → 전체, 최신순), 관찰 `GET …/observation-items?obsrvSttsCd=<관찰중>` + 사진 `GET …/observation-cycles/{obsrvCyclSn}/photo`
- 기다리는 것: 없음
- 이미지 표시: 첨부(`summary/AttachmentStrip.jsx`·`PhotoModal.jsx`)와 관찰 사진(`summary/ObservationSummaryCard.jsx`)은 비공개 파일이라 `@/hooks/useFileImage` + `@/components/FileImage`로 그린다. 캐릭터 이미지(`summary/SummaryHero.jsx`(「SummaryHero 지우기」에서 삭제) `chrctrImgPath`)는 공개 파일이면 `@/utils/fileUrl`의 `publicFileUrl(atchFileSn)`을 쓴다 — 응답이 경로를 주는지 `atchFileSn`을 주는지 연결 때 확인한다
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 요약 바 몸무게가 최신 일상기록 체중이고 없으면 프로필 체중, 다음 예정일이 오늘 이후 가장 가까운 같은 유형 병원 일정, 타임라인 반복 예방에 출처 병원명이 나오고, 검사 수치 추이가 검진일 순서로 그려진다
- 결정: 백엔드 API는 develop에 머지돼 있었다. 디자인은 `html/hlt-summary.html` 그대로(모양은 바꾸지 않고 서버 키로만 바꿈). `GET /pets`에 캐릭터 상태가 없어 "캐릭터 만들기" 점선 카드를 빼고(「캐릭터 상태 연결」에서 되살림) `PetFace`로 둠(사람 결정). 건강기록 가짜 반려동물·일상기록·관찰·검진기록·일정·연동 케어 항목 저장소를 지움(PDF 분석·영수증 가짜는 남김, 「PDF 분석 연결」·「영수증 일괄 저장 연결」에서 지움)
- 연결 남음: 없음 (「캐릭터 상태 연결」에서 연결)

## SCR-HLT-003 케어 캘린더 · 케어 항목 수정·삭제 UI — 끝

- 기능: 토탈 케어리스트에서 사용자가 추가한 항목을 수정·삭제하는 UI (명세 기능 ID 추가 없음, FN-HLT-003-12 "사용자가 추가한 항목만 직접 수정·삭제"·"정기관리 기본 항목은 주기만 변경"에 걸침). API는 "토탈 케어리스트 API 연결" 절에서 연결한 `updateCareItem`(`PATCH /pets/{petSn}/care-items/{careArtclSn}`)·`deleteCareItem`(`DELETE …`)을 쓴다. 지금 화면·시안(`html/hlt-calendar.html`)에 수정·삭제 버튼과 모달이 없다
- 기다리는 것: 없음
- 결정: 화면설계서에 진입 근거가 없어 사람이 정함(2026-11-03). 줄 끝 ⋯ 메뉴(마이페이지 가계부 `ExpenseMenu`의 여는 방식·모양을 복사해 `features/health/CareItemMenu.jsx`로 새로 만듦, LJS 파일은 건드리지 않음), 사용자 추가 [수정]·[삭제], 기본 정기관리 [수정]만, 기본 일상관리·연동 항목 ⋯ 없음, 삭제는 메뉴 → `ConfirmModal`, 수정 모달은 [취소]·[수정하기]만
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 사용자가 추가한 항목은 이름·아이콘·구역·주기를 고치고 지울 수 있고, 기본 정기관리 항목은 주기만 고칠 수 있으며, 기본 항목·처방약 연동 항목에는 삭제가 없다

## SCR-HLT-011 종합 건강기록 · 캐릭터 상태 연결 — 끝

- 기능: FN-HLT-011-02 요약 바 캐릭터 자리 (FN-HLT-011-01 칩은 그대로). `GET /pixel-characters`(LJS)의 `pixelCharSn`으로 캐릭터 유무를 판정해 주양육·미생성이면 "캐릭터 만들기" 카드
- 기다리는 것: 없음 (`GET /api/pixel-characters`가 백엔드 develop에 있음)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 캐릭터 없는 주양육 반려동물은 히어로에 "캐릭터 만들기" 카드가 나오고 `/mypage/characters`로 가며, 캐릭터 있음·공동양육·조회 실패는 `PetFace`
- 결정: "캐릭터 만들기" 카드를 되살림(디자인 기준), 생성 중·실패는 백엔드 기본 캐릭터 그대로(사람 결정)
- 연결 남음: 없음

## SCR-HLT-007 검사 수치 입력 · 참고범위 비우기 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-007-02·03(참고범위 최소·최대는 둘 다 입력하거나 둘 다 비움)에 걸침. 백엔드 검사 수치 PATCH `PATCH /pets/{petSn}/inspection-values/{inspNvlSn}`가 참고범위를 `refRange` 묶음(`{refLlmtNvl, refUplmtNvl}`)으로 받는다: 안 보내면 유지, 보내면 덮어씀, `{null, null}`이면 비움, 한쪽만 null이거나 최소 > 최대면 400(`data[0].field` `refRange.paired`·`refRange.ordered`). 등록 POST는 평평한 필드 그대로이고 최소 > 최대도 400(필드 목록 없음)
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `LabInput.jsx`·`BloodResultForm.jsx` 수정 저장 때 하한·상한을 `refRange`로 묶어 보내고(빈 칸은 null) "참고범위는 수정에서 지울 수 없어요" 막기를 지워, 저장된 참고범위를 둘 다 비우면 검진상세에서 "참고범위 …" 줄이 사라지고 ▲▼ 표시도 없다. 한쪽만 입력하거나 최소 > 최대이면 저장 전에 막고 최소 > 최대는 "참고범위 최소는 최대보다 클 수 없어요"(`getFormErrors`의 짝 규칙 검사와 같은 자리, 등록·수정 모두). 범위 없으면 ▲▼ 판정 없음, 검사 수치 추이 밴드는 가장 최근 회차 범위이고 없으면 밴드 없음
- 결과: 2026-11-03 검증 2회차 통과(1회차는 로그인 계정이 없어 화면 확인 못 함), 사람 확인 끝. `updateInspection`이 `refRange: { refLlmtNvl, refUplmtNvl }`를 항상 보내고, `LabInput.jsx`·`BloodResultForm.jsx`가 최소 > 최대를 막는다
- 결정: 범위가 없으면 검진상세 "참고범위 …" 줄을 숨기는 기존 동작 그대로, "참고범위 없음" 문구는 더하지 않음(사람 결정). PDF 분석 행은 최소 > 최대 검사를 넣지 않음
- 연결 남음: 없음

## SCR-HLT-002 건강 일지 · 지속 관찰 회차 수정 비우기 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-002-19·23·24(크기·변화·메모는 선택 입력)·22(사진 필수)에 걸침. 백엔드 `PATCH /pets/{petSn}/observation-cycles/{obsrvCyclSn}`(multipart)가 비울 필드 이름을 `clearFields`로 받는다(`obsrvSz`·`obsrvChgCd`·`memoCn`, 반복 키 또는 쉼표). 보내지 않은 칸은 유지, 그 밖의 이름은 400(`data[0].field` `clearFields[i]`), 같은 칸에 값과 비우기를 함께 보내면 400(`clearFieldsDistinct`). 사진은 비울 수 없고 보내면 교체
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 회차 수정 모달에서 크기·변화·메모 칸을 비우고 저장하면 `updateObservationCycle`이 그 칸 이름을 `clearFields`로 보내고, 선택 회차 상세에서 그 줄이 숨겨진다(메모는 비어 보임). 손대지 않은 칸은 보내지 않는다. 수정 모달은 기존 사진을 미리보기에 채우고 사진 칸에는 [촬영하기]·[앨범에서 선택]을 그대로 둔다(빼기 없음). 사진 칸 아래 보조 문구 "사진은 바꿀 수만 있어요"
- 결과: 2026-11-02 검증 2회차 통과, 사람 확인 끝. 수정 전 회차 값과 비교해 바뀐 값만 보내고 비운 칸은 `clearFields`로 보냄. 1회차는 `obsrvChgCd`를 보내지 않음
- 결정: 디자인 `html/hlt-diary.html`, 수정 모드 사진 버튼 두 개 유지(버튼 정리는 사람이 화면 손볼 때)
- 연결 남음: 없음

## SCR-HLT-007 검사 수치 입력 · PDF 분석 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-005-04(검진상세 첨부 [PDF 분석])·FN-HLT-007-04·05·06(분석 결과 검수·검사 종류 표시·다시 분석·직접 입력하기)에 걸침. `checkupApi.js` `analyzeLabPdf` 가짜를 Python `POST /ai/checkups/lab-results`(LJS, `nyangmeong-ai` develop, `aiApi`)로 바꾼다. 요청은 multipart `file`(PDF, 최대 10MB, 로그인 쿠키 필요)이라 첨부 원본을 `getAttachmentFile`(Blob)로 받아 올린다. 응답 `items[]`는 `inspArtclCd`·`inspArtclDrctInptNm`·`rsltNvl`·`unitNm`·`refLlmtNvl`·`refUplmtNvl`, `excludedArtclNms[]`(가짜의 `inspItmNm`·`rsltVal`·`refMinVal`·`refMaxVal`·`bloodYn`과 다름, 검토 행 `labInput/`을 서버 키로 맞춘다). 오류 `NOT_LAB_RESULT` 422·`PDF_ANALYZE_TIMEOUT` 504·`PDF_ANALYZE_API_ERROR` 502. 가짜 메모리 저장소(`getStore`·시드)와 `?fakeCheckupDetail`을 지운다
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 검진상세 첨부 PDF에서 [PDF 분석]을 누르면 `POST /ai/checkups/lab-results`에 파일이 올라가고 검수 행이 응답 값으로 채워지며, 저장하면 `POST /pets/{petSn}/inspection-values`로 저장된다. 검사결과지가 아닌 PDF·시간 초과·분석 오류는 각각 안내가 나오고 [다시 분석]·[직접 입력하기]로 이어진다
- 추가 요청: 추가-1 분석 오류 상태(422·504·502)에서는 노란 AI 주의 문구를 숨긴다
- 연결 남음: 없음

## SCR-HLT-002 건강 일지 · 영수증 일괄 저장 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-002-44(가계부 중복 확인)·46(가까운 예정 일정)과 영수증 저장(검진기록·처방약·가계부)에 걸침. `receiptApi.js`의 `prepareReceiptSave`·`saveReceiptCheckups`(검진기록은 실제, 처방약 `fakePrescriptions`·가계부 `fakeLedger`는 가짜, 반려동물마다 따로 저장)를 LJS 일괄 API `POST /api/receipts/{recptSn}/save-check`·`POST /api/receipts/{recptSn}/save`(검진기록·처방약·가계부 한 번에, 같은 요청 재전송은 200)로 바꾼다. `?fakeLedgerDup`·`?fakeReceiptSave` 가짜를 지운다
- 기다리는 것: 없음 (백엔드 가짜 교체가 develop에 병합됨 `c7cacb6`, PR #119. `save-check`의 `nearbySchedules`는 서버가 반려동물마다 가장 가까운 1건만 준다. [직접 입력] 영수증 저장 `POST /api/receipts/{recptSn}/checkups?petSn=`이 새로 생김)
- 백엔드 연결: 끝 (health 서비스 메서드·`ReceiptSaveService` 가짜 교체, 백엔드 JAJ)
- 결과: 2026-11-03 검증 통과(1·2회차 실패는 복용 상태 코드 `ING`·`END` 400, 공용 DB 쓰기 거부. 마지막은 옛 클래스로 돌던 백엔드를 다시 띄운 뒤 실제 저장으로 확인), 사람 확인 끝. `save-check` 요청 `{ ckupYmd, pets: [{ petSn, amt, expenseYn }] }`, 응답 `duplicateExpenses`·`nearbySchedules`(서버가 반려동물마다 1건)를 탭으로 바꾼다. `save`는 `idmptDmndId`(모달마다 1개)와 처방약 `prscSttsCd` `HLTC0010`·`HLTC0011`, 성공 때 `expenseKeys`도 무효화
- 추가 요청: 추가-1 2-E 창은 검진 종류가 없으면 "MM/DD 병원 일정이 있어요"(`NearScheduleModal.jsx`), 추가-2 `save`·`save-check` 409 `RECEIPT_ALREADY_SAVED`면 서버 message만 보이고 [다시 시도하기] 숨김(`ReceiptResultStep.jsx`)
- 결정: 디자인 `html/hlt-diary.html` 그대로(요청·응답만 바꿈). 백엔드를 먼저 고친 뒤 연결(사람 결정)
- 연결 남음: 없음 (백엔드 `ReceiptSaveService.check`가 저장완료 영수증에 409 `RECEIPT_ALREADY_SAVED`를 준다, 2026-11-09 확인)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 영수증 결과 확인에서 저장하면 `save-check` 뒤 `save` 한 번만 요청하고, 검진기록·처방약·가계부 지출(마이페이지 가계부 목록)에 실제로 남는다. 같은 지출이 있으면 중복 안내, 가까운 예정 일정이 있으면 연결 선택이 나온다

## SCR-HLT-002 건강 일지 · 영수증 [직접 입력] 저장 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-002-31(영수증 인식 실패·일시 오류 뒤 [직접 입력]으로 연 검진기록 등록 모달의 저장)에 걸침. 이 경로의 저장을 `POST /pets/{petSn}/checkups` 대신 `POST /api/receipts/{recptSn}/checkups?petSn=`로 보낸다. 요청은 직접 등록 Body(`ckupYmd`·`hsptlNm`·`ckupTypeCd`·`ckupCn`·`ckupMemoCn`·`schdlSn`)에 `idmptDmndId`(모달마다 한 번 만든 값)를 더한다. 응답은 `CheckupResponse`(201, `recptSn` 포함). 업로드 전 [직접 입력하기]로 연 경우는 지금처럼 영수증 연결 없음
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 미인식 영수증에서 [직접 입력]으로 검진기록을 저장하면 `POST /api/receipts/{recptSn}/checkups?petSn=` 한 번만 요청하고, 그 영수증이 저장완료가 되며 가계부 지출은 생기지 않는다. 409 `RECEIPT_ALREADY_SAVED`(이미 저장됨)·404 `RECEIPT_NOT_FOUND`는 안내를 보인다
- 결과: 2026-11-03 검증 통과(1회차 409·404 토스트가 `<dialog>` 뒤에 가려 안 보임, 2회차 모달 안 상자가 기획과 다름 → 추가-1로 확정 후 잠금을 풀고 다시 검증), 사람 확인 끝
- 추가 요청: 추가-1 409·404 안내를 토스트 대신 모달 안 빨간 안내 상자로(`CheckupModal.jsx`, `queries.js`)
- 연결 남음: 없음 (「영수증 일시 오류 [직접 입력] 연결」에서 연결)

## SCR-HLT-002 건강 일지 · 영수증 일시 오류 [직접 입력] 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-002-31(영수증 일시 오류 뒤 [직접 입력] 저장의 영수증 연결)에 걸침. `ReceiptUploadModal.jsx`가 AI 서버 오류 응답 `data.recptSn`을 [직접 입력]에 넘겨 `CheckupModal`이 영수증 경로로 저장한다. `onManualInput` 키 `rcptSn` → `recptSn`
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `/ai/receipts` 502에 `data.recptSn`이 있으면 실패 안내 [직접 입력] 저장이 `POST /api/receipts/{recptSn}/checkups?petSn=` 한 번, 없으면 `POST /pets/{petSn}/checkups`

## SCR-HLT-002 건강 일지 · 체중 그래프 정상범위·목표 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-002-10(체중 — 사용자 정상범위 기준 색상 표시)에 걸침. `DailyTrendCard.jsx`가 가짜 키 `nrmlWghtMinVal`·`nrmlWghtMaxVal`·`goalWghtVal` 대신 서버 키 `minBdwg`·`maxBdwg`(`GET /pets`)·`goalBdwg`(`GET /pets/{petSn}`)를 읽는다
- 기다리는 것: 없음(백엔드 develop에 있음, SJM)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 정상범위가 있는 반려동물의 체중 그래프에 범위 띠, 목표체중이 있으면 목표선이 보인다
- 결과: 2026-11-04 검증 2회차 통과(1회차는 검증 브라우저 미로그인으로 화면 확인 못 함), 사람 확인 끝

## SCR-HLT-002 건강 일지 · 영수증 원본 이미지 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-002-34(원본 이미지)에 걸침. `diary/ReceiptResultStep.jsx`의 `imgUrl = null`(아이콘 대체)을 `GET /api/receipts/{recptSn}/image`(비공개 파일)로 바꾼다
- 기다리는 것: 없음 (백엔드 `ReceiptController` `GET /{recptSn}/image`가 develop에 있음)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 영수증 인식 결과 확인 모달 썸네일과 [영수증 원본] 모달에 올린 영수증 사진이 보인다
- 결과: 2026-11-04 검증 1회차 통과, 사람 확인 끝
- 연결 남음: 없음 (추가-2 409는 「영수증 일괄 저장 연결」 절 참고, 2026-11-09 확인)

## SCR-HLT-003 케어 캘린더 · 일정 뱃지 색상 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-003-36 일정 메모 · 뱃지 색상에 걸침. 숨겨 둔 일정 등록·수정 모달의 뱃지 색상 선택을 켜고 칩 5개를 HLTG21 코드로 `cldrBadgeColrCd`에 보낸다. 색을 고르지 않은 일정은 종류·검진유형 기본 톤으로 표시한다(병원 일정은 정기검진 보라·예방접종 초록·질병진료 빨강·검사 파랑·기타 진료 회색, 그 밖의 종류는 회색). 코드와 `nyangmung.css` tone 토큰: HLTC0079 보라 → `--tone-violet-fg`/`--tone-violet-bg`, HLTC0080 초록 → `--tone-green-fg`/`--tone-green-bg`, HLTC0081 빨강 → `--tone-rose-fg`/`--tone-rose-bg`, HLTC0082 파랑 → `--tone-blue-fg`/`--tone-blue-bg`, HLTC0083 회색 → `--tone-gray-fg`/`--tone-gray-bg`. 캘린더 칩은 `hlt.css`의 `c-violet`·`c-green`·`c-rose`·`c-blue`·`c-gray`를 그대로 쓴다. `c-amber`는 쓰지 않는다
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `http://localhost:5173/health/calendar`에서 색을 골라 등록·수정한 일정이 그 색 칩으로 보이고, 색을 고르지 않은 일정은 종류·검진유형 기본 톤으로 보인다
- 결정: HLTC0081 칩 이름은 시안 "분홍"이 아니라 "빨강"(팀 확정, 공용 DB `COM_CD_NM`). 칩 순서는 시안에서 주황만 뺀 파랑·초록·빨강·보라·회색, 고른 칩을 다시 누르면 해제(`''` 전송). 색은 `TONE_CLASSES`(`index.css` `--color-tone-*` 클래스)로 그리고 hex 표는 지움
- 추가 요청: 추가-1 종합 건강기록 `summaryUtils.js`·`TimelineCard.jsx`도 tone 클래스로(빌드 실패로 함께) / 추가-2 선택 링을 `outline: medium solid currentColor`·`outline-offset: var(--spacing)`으로(앱에 `--space-1` 없음) / 추가-3 칩 간격 `gap-3`(12px)
- 결과: 2026-11-04 검증 통과(이전 루프는 로그인 미완료·첫 실패 뒤 핸드오프 URL 정정으로 실패해 사람이 루프를 버림, 마지막 루프 1회차는 로그인 세션 만료), 사람 확인 끝
- 연결 남음: 없음

## SCR-HLT-011·002 종합 건강기록·건강 일지 · 화면 다듬기 — 끝

- 기능: 명세 기능 ID 추가 없음. 마일스톤이 모두 끝난 뒤 대화로 받은 화면 다듬기(FN-HLT-011-01·02·03·06, FN-HLT-002-01·15~19에 걸침)
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 핸드오프 `### 추가 요청` 추가-1~26의 각 화면 조건(`/health`, `/health/diary`)
- 결정: 공용 `DropdownSelect`는 그대로 두고 건강 일지만 `DiaryPetPicker`로 바꿈. 지속 관찰 ⋮는 `CareItemMenu`에 선택 props `leadingItems`를 더해 씀. `LineChart`에 선택 props `labelFill`·`isEdgeToEdge`를 더함(기본값은 그대로). 사진 줄은 전체 회차, 차트는 크기 입력 회차 기준 최신 5개. 지속 관찰 모바일은 나중에(사람)
- 추가 요청: 추가-1~5·9~14 히어로 칩 줄·기준일·진행 점·스와이프·요약 3칸 / 추가-6 타임라인 상세 줄·아이콘 / 추가-7·8·16 탭별 태블릿·PC 배치 / 추가-15 검사 결과 최대 5줄·범위 이탈 / 추가-17 PC 탭 아래 제목 숨김 / 추가-18 건강 일지 전체 반려동물 패널 / 추가-19 지표 칩 색 / 추가-20~26 지속 관찰 PC 색·굵기·목록·⋮ 메뉴·삭제 확인·"변화 없음"·차트 폭·최신 5개·[+N]·사진 원본 넘기기·말풍선 잘림
- 결과: 2026-11-05 검증 에이전트 루프 없이 `yarn -s lint`·`yarn -s build` 0과 Playwright 화면 확인(가짜 응답은 브라우저에서만), 사람 확인 끝
- 연결 남음: 없음 (FN-HLT-011-03 `ckupCn` 백엔드 연결 2026-11-06 확인)

## SCR-HLT-002·003 건강 일지 그래프 기록 수 · 케어 캘린더 반려동물 선택 — 끝

- 기능: FN-HLT-002-09 건강기록 변화, 002-10 그래프 원칙 · 조회기간 (그래프 기준 기록 수 14 → 7 → 5, 사람 요청 2026-11-06). 추가 요청으로 FN-HLT-003-39 표시 반려동물 필터
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `/health/diary` 건강기록 변화 카드가 최근 5개 기록 기준(부제 "최근 5개 기록", 요청 `size=5`) / `/health/calendar` 핸드오프 `### 추가 요청` 추가-2·3의 화면 조건
- 결정: 디자인 기준 없음(지금 화면은 html·화면설계서와 달라 그대로 두고 개수만 바꿈). 캘린더 필터는 건강 일지 `DiaryPetPicker`에 `isMulti`·`selectedPetSns`·`onChange` props로 분기(단일 선택 값은 그대로), 필터는 달력·날짜 상세·다가오는 일정 셋 다, 모든 반려동물을 하나씩 고르면 전체로 바뀜, 반려동물 1마리 이하면 버튼 없이 제목. 전체 아이콘 `PawPrint`. 명세 FN-HLT-003-39·002-09·10 문구는 명세 일괄 갱신 때(핸드오프 "명세 갱신 때 반영")
- 추가 요청: 추가-1 기록 수 7 → 5 / 추가-2 통합 케어 캘린더 칩 → 반려동물 선택 버튼·격자(다중 선택·[전체]·[선택 해제]·체크 배지·캐릭터 겹침 "첫 이름 외 n"·일정 수 미표시), `PetFilterChips.jsx` 삭제 / 추가-3 제목 글자를 화면에서 숨기고 그 자리에 버튼(`Card.jsx` `isTitleHidden`, 추가-2의 `titleAside`는 뺌)
- 결과: 2026-11-06 검증 통과(이전 루프는 로그인 만료 2회·390px 머리줄 겹침 1회로 3회 실패, 사람이 루프를 버리고 추가-3으로 고침), 사람 확인 끝
- 연결 남음: 없음

## SCR-HLT-011 종합 건강기록 · ?petSn= 첫 반려동물 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-011-01 반려동물 선택에 걸침(마일스톤 없이 추가 요청으로 받음)
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `/health?petSn=<내 반려동물 번호>`면 그 반려동물로 시작, 목록에 없는 번호·`abc`·파라미터 없음이면 첫 반려동물. 탭을 바꿔도 URL은 그대로
- 결정: `?inspection=`과 같이 `useState` 초기값으로 처음 한 번만 읽는다(`pages/health/HealthSummaryPage.jsx` `tabPetSn`). 목록에 없는 번호는 기존 `?? pets?.[0]`이 첫 반려동물로. 탭을 바꿀 때 URL은 고치지 않는다(사람 결정)
- 추가 요청: 추가-1 `?petSn=`으로 첫 반려동물 탭 정하기
- 결과: 2026-11-06 lint·build 0, 화면 확인(17 구름·22 여름·1007 아린·9999·abc·없음은 누리, `?petSn=22&inspection=GLU`는 여름+검사 · 수치), 사람 확인 끝. 검증 에이전트 루프 없이 진행
- 연결 남음: 없음

## SCR-HLT-011·002·003 건강기록 · 공통 반려동물 카드 — 끝

- 기능: FN-HLT-011-01·002-01·003-01·003-39 반려동물 선택을 공통 카드 하나로(※신규 정책, 새 기능 ID 없음)
- 기다리는 것: 없음
- 완료 조건: 명령: lint·build 0 / 화면: 공통 카드(1101px 이상 사이드 메뉴 아래, 1100px 이하 제목 아래 알약)·팝오버·1마리·0마리, ⑤ 선택 유지·없는 아이면 첫 아이, 히어로 칩·건강 일지 셀렉트·케어리스트 셀렉트 삭제, 캘린더 스위치(켬·끔, 다른 아이 회색), ② 다른 아이 일정 클릭 토스트 + 수정 모달, ① `?petSn=` 진입·주소에서 지움, ④ 등록 이동
- 결정: 선택값은 `features/health/shared/SelectedPetProvider.jsx`(페이지가 `useMe` 회원 번호를 넘김) → 직접 고른 아이 → `?petSn=`(읽고 주소에서 지움) → localStorage `nyangmeong.health.petSn.<mbrSn>` → 첫 아이. 카드·팝오버는 `shared/PetSwitcher.jsx`, 레이아웃은 `SubPageLayout` `sideBottom` 2줄 추가만(메뉴 아래 따라 붙는 처리는 카드 안에서). 캘린더 스위치는 `components/Toggle.jsx` 그대로, 다른 아이 회색은 `scheduleTypes.js` `getScheduleTone`의 `isOtherPet`. `diary/DiaryPetPicker.jsx` 삭제(사람 결정 2026-11-07)
- 결과: 2026-11-07 검증 2회차 확인 못 함 있음(내 것 없음, 연결 남음만). 1회차는 `SubPageLayout` 기존 줄 변경·백엔드 미실행으로 실패. 1마리·0마리는 `GET /pets` route로 확인. 사람 확인 끝
- 참고: 주양육 10마리(`MAX_OWN_PETS`)면 팝오버 「+ 등록」 칸을 숨긴다(이전 히어로와 같음). 0마리 점선 박스 위에는 구분선이 없다. 토스트 '로/으로'는 `utils/josa.js` `pickJosa`라 ㄹ 받침 이름은 「하늘으로」처럼 나온다(공용 유틸, 이번엔 안 고침)
- 연결 남음: 없음 (③ 백엔드 「케어 일정 알림 반려동물 연결」 끝 `71e64e3`, develop 병합됨. ④ 마이페이지 `PetListPage.jsx`가 `?register=1`·`returnTo`를 처리, 2026-11-09 확인)

## SCR-HLT-011·002 건강기록 · 튜토리얼과 고른 기록 대시보드 — 끝

- 기능: FN-HLT-011-11 대시보드 머리 · 메뉴, 011-12 AI 건강분석 리포트, 011-13 체중 카드, 011-14 식사량 · 음수량 · 산책 카드, 011-15 배변 상태 카드, 011-16 케어리스트 카드, 011-18 튜토리얼 단계, 011-19 기록 고르기, 011-20 취소 · 저장(v1.4 신설, 만들 때는 ID 없음). 흐름도 D1~D11. 종합 건강기록 첫 진입 튜토리얼 모달 3단계(시작 · 기록 고르기 · 완료), 고른 기록만 대시보드 카드, [기록 항목 편집], 건강 일지 [오늘 기록하기]에 고른 매일 기록만 탭 + [항목 추가]
- 기다리는 것: 없음
- 완료 조건(초안, /start에서 확정): 명령: lint·build 0 / 화면: 저장된 선택이 없으면 1단계가 열린다. [나중에 할래요]·×는 추천 3개(체중·식사량·검진기록) 저장. 2단계 4묶음 칩, [추천대로 고르기], 0개면 「1개 이상 골라 주세요」 + [시작하기] 막힘, 760px 이하 미리보기 숨김, 기존 회원은 기록 있는 항목 미리 체크. 3단계 [다시 고르기]·[건강기록 보러 가기]. 대시보드 「{이름}의 건강 대시보드」·「고른 기록만 보여요 · 기준일 YYYY.MM.DD(요일)」·[기록 항목 편집], AI 건강분석 리포트 항상 표시, 카드 순서 4묶음 고정, 빈 상태 문구·링크는 프로토타입 원문, 기존 탭 4개는 대시보드 아래. 모달 `role="dialog"`·`aria-modal`·포커스 가두기. 코치마크 없음(D6)
- 결정: 기존 탭 4개는 없애고 히어로 + 대시보드만 둔다(추가-1, 사람 결정 2026-11-07. 처음엔 남기기로 했다가 바꿈). 첨부 자료 항목 추가(추가-2), 검사 수치 카드 항목 선택(추가-4). 데이터는 `GET /pets/{petSn}/health-indicators`(체중·식사량·음수량·산책·크레아티닌)·건강 요약·일상 기록·케어 항목 API를 `features/health`에서 쓴다(`features/dashboard`는 import 하지 않는다)
- 결정(/start 질문, 추천안대로 2026-11-07): 가짜 저장소 회원별 localStorage(`nyangmeong.health.widgets.<mbrSn>`), 2단계 주 버튼 「다음」, 편집 모드 문구·[취소]·[저장]·토스트 프로토타입대로, 히어로 통계 범위 밖, 고른 적 없으면 건강 일지 5종 모두, 케어리스트 오늘 기준은 케어 캘린더와 같게. 미리 체크는 모든 아이 합집합, 선택은 회원 단위(새 반려동물도 같은 선택), 0마리는 공통 카드 점선 안내. 튜토리얼 시작 항목 최대 6개(추가-8)
- 추가 요청: 추가-1 탭·4묶음 제거·안 쓰는 summary 파일 10개 삭제 / 추가-2 첨부 자료 항목 / 추가-3 2단계 한 줄 배치 / 추가-4 검사 수치 항목 선택·검진상세 「추이 보기 ›」 / 추가-5 검사 수치 미선택 토스트 / 추가-6 토스트 문구·1단계 Skeleton / 추가-7 미리보기 상태 칩 Skeleton / 추가-8 시작 항목 6개
- 결과: 2026-11-07 검증 통과(루프는 사람이 두 번 clear 뒤 새로 시작). 추가-7은 코드 확인, 추가-2 PDF 내려받기는 응답을 바꿔 확인. 사람 확인 끝
- 참고: 파일 위치가 기획과 다름 — `AiReportCard`는 `DashboardCard.jsx` 안, `useRecordedItems`는 `queries.js`, 카드 본문은 `WidgetCard.jsx`. 체중 직전 대비는 0.1kg 반올림(0이면 「변화 없음」, 사람 결정 유지). 튜토리얼 기록 확인이 아이 수 × 11개 요청(「고른 항목 저장 연결」에서 해결)(알려진 문제, B1에서 해결)
- 연결 남음: 없음 (「건강기록 대시보드 고른 항목 저장 연결」에서 연결)

## SCR-HLT-011·002 건강기록 · 대시보드 카드 이동 — 끝

- 기능: 새 기능(ID 없음, ※신규 정책). AI 건강분석 리포트를 뺀 카드 오른쪽 위 [더보기] 이동(카드 전체 클릭 이동은 하지 않음, 사람 결정 2026-11-08). ⋮ 메뉴는 다음 마일스톤으로 미룸(사람 결정 2026-11-08, [기록 항목 편집] 버튼은 그대로)
- 기다리는 것: 없음
- 완료 조건: 명령: lint·build 0 / 화면: 카드 빈 곳 클릭 시 이동 없음(빈 상태 카드도), [더보기] 클릭·Tab+Enter 시 아래 주소로 이동, [더보기]에 `aria-label` 「{이름}의 {항목} 기록 화면으로 이동」·포커스 링, 카드 안 이동 링크가 [더보기]와 같은 곳이면 뺌, 검사 수치 select·첨부 썸네일은 원래 동작만, 1100px 이하·390px에서 카드 머리 한 줄. 이동 주소: 매일 기록 5종 → 건강 일지 건강기록 변화 탭(누른 항목 선택), 검진기록·검사 수치 → 건강 일지 검진기록 탭, 지속 관찰 → 지속 관찰 탭, 처방·투약 → 검진상세 처방약 탭, 첨부 자료 → 건강 일지 검진기록 탭, 알레르기·기저질환 → 마이페이지 반려동물 관리, 예방접종·정기검진 → 케어 캘린더, 케어리스트 → 케어 캘린더 케어리스트 탭. 반려동물은 공통 카드가 넘긴다
- 결정: 처방·투약은 검진상세 처방약 탭(프로토타입과 같음), 첨부 자료는 건강 일지 검진기록 탭(사람 결정 2026-11-07. 종합 건강기록 탭이 없어져 처음 결정 「종합 건강기록 처방·투약 탭」을 바꿈). (사람 2026-11-08) 처방·투약은 가장 최근 처방의 검진상세, 처방 없으면 건강 일지 검진기록 탭. 카드 전체 이동 없음, [더보기]만 링크. 「위젯 순서 변경」은 기획 담당 기능 ID 요청 목록에 추가. ⋮ 메뉴는 순서 변경 동작이 없어 다음 마일스톤에서 함께 넣는다
- 추가 요청: 추가-1 대시보드 케어리스트 카드 항목 앞 동그라미 제거(완료 ✓도 같이 빠짐, 글자는 머리 아이콘·「보기 전용」 문구 선) / 추가-2 빈 상태 글자·링크와 AI 리포트 「준비 중이에요」를 본문 가로·세로 가운데
- 결과: 2026-11-08 검증 통과(1회차는 백엔드 미기동으로 화면 확인 못 함 → 로그인 뒤 통과), 사람 확인 끝. 6번 ⋮ 메뉴는 「대시보드 카드 순서 바꾸기」로 넘김
- 참고: 같은 곳으로 가서 뺀 링크는 빈 상태 8개(매일 기록 5종·검사 수치·지속 관찰·알레르기)와 알레르기 「수정하러 가기」. 케어리스트 빈 상태 「케어 캘린더에서 설정하기」(캘린더 탭)는 [더보기](케어리스트 탭)와 달라 남김. 처방 [더보기]는 카드 정렬(복용 중 먼저)의 첫 처방 `ckupRcdSn`, 없으면 건강 일지 검진기록 탭
- 연결 남음: 없음

## SCR-HLT-011 건강기록 · 대시보드 카드 순서 바꾸기 — 끝

- 기능: FN-HLT-011-21 카드 순서 바꾸기, 011-22 취소 · 저장(v1.4 신설, 만들 때는 ID 없음, ※신규 정책). 대시보드 카드 순서를 회원이 바꾼다. 대시보드 오른쪽 위 [기록 항목 편집] 버튼 자리에 ⋮ 메뉴 「기록 항목 편집」(지금 버튼과 같은 동작)·「위젯 순서 변경」(「대시보드 카드 이동」에서 미뤄 옴, 사람 결정 2026-11-08)
- 결정(사람 2026-11-08): ⋮ 메뉴는 기존 `features/health/CareItemMenu.jsx`를 고쳐 쓴다. `onEdit`을 안 넘기면 「수정」을 숨기고 메뉴 항목은 `leadingItems`로 넘긴다. 기존 화면(케어리스트·지속 관찰)은 그대로
- 기다리는 것: 없음
- 완료 조건: 명령: lint·build 0 / 화면: [기록 항목 편집]에서만 옮긴다(대시보드에서 바로 드래그하지 않음). 드래그와 함께 카드마다 [위로]·[아래로] 버튼(키보드·모바일 터치용, 맨 위 [위로]·맨 아래 [아래로]는 막힘). 저장하면 대시보드가 그 순서로 보이고 새로고침·다른 반려동물에서도 같음. AI 건강분석 리포트는 맨 앞 고정(옮기는 대상 아님). 새로 고른 항목은 맨 뒤에 붙는다(편집 모달·건강 일지 [항목 추가] 모두)
- 결정(사람 2026-11-07, 추천안): 드래그 라이브러리는 추가하지 않는다(브라우저 기본 기능). D8 「4묶음 순서 고정」은 이 마일스톤에서 버린다(그 전 마일스톤은 고정). 순서는 선택과 같이 회원 단위로 저장. 디자인은 프로토타입·아트보드에 없으므로 시안을 받거나, 없으면 기존 칩·카드 스타일로 AI 초안(/start 때 확인)
- 결정(사람 2026-11-08, /start 질문 추천안): 「위젯 순서 변경」은 순서만 바꾸는 별도 모달 `WidgetOrderModal`(끌기·[위로]·[아래로], AI 리포트 맨 앞 고정 줄), 편집 모달은 고르기만·미리보기는 저장 순서. 튜토리얼 처음 고를 때·3단계 칩은 4묶음 순서. 디자인은 시안 없이 기존 편집 모달 스타일 + `src/assets/index.css` 토큰 AI 초안. 토큰 기준: px·HEX 직접 값 0건, 글자·높이·폭·간격·버튼 크기는 편집 모달·⋮ 메뉴 버튼이 쓰는 단계만
- 추가 요청: 추가-1 순서 모달 간격 `mt-4` → `gap-4`, 순번 칸 `w-5` → `w-6`(기존 단계) / 추가-2 기획 「바꿀 곳」에서 튜토리얼 3단계 칩 빼고 이유 한 줄
- 결과: 2026-11-08 검증 통과(1회차 실패: 숨김 토스트 `joinWidgetNames`가 4묶음 순서 → 저장 순서로 고침), 사람 확인 끝
- 참고: 저장 순서 지키기는 `widgetItems.js` `keepWidgetOrder`(중복·모르는 키만 버림). `orderWidgetIds`(4묶음)는 칩 목록·튜토리얼·기록 있는 항목 합집합에만 남음. 건강 일지 [오늘 기록하기] 탭은 기록 종류 순서 그대로. `CareItemMenu`는 `onEdit`을 안 넘기면 「수정」을 숨김
- 연결 남음: 없음 (「건강기록 대시보드 고른 항목 저장 연결」에서 연결)

## SCR-HLT-011 건강기록 · 종합 건강기록 배너 개편 — 끝

- 기능: 새 기능(ID 없음, ※신규 정책). 반려동물 선택이 사이드바(보고 있는 아이)로 빠져서 상단 배너를 "캐릭터 + 건강 요약" 역할로 바꾼다. 지금 배너는 진한 청록 면 + 점무늬라 아래 흰 대시보드 카드들과 따로 떠 보인다
- 기다리는 것: 없음
- 완료 조건: 명령: lint·build 0, 토큰 검사 위반 0건(결과 보고) / 화면: 배너 바탕이 아래 대시보드 카드와 같은 흰색, 캐릭터 있는 아이·없는 아이 모두 배너 높이와 요약 칸 위치가 같음, 이름·요약 숫자와 단위만 청록
- 결정(사람 2026-11-08, F-1안): 배너는 대시보드 카드와 같은 흰 카드(바탕·테두리·모서리 같은 토큰), 진한 청록 바탕·점무늬 없앰. 왼쪽 캐릭터는 주인공 크기, 캐릭터 뒤에만 연한 청록 원(캐릭터 무대형). 오른쪽 위 이름 왼쪽·기준일(「2026.11.08 기준」) 오른쪽, 기준일 앞 노란 점 뺌. 오른쪽 아래 요약 3칸(최근 검진·검사 수치·현재 처방) 그대로, 칸 사이는 카드 테두리 색 세로선. 품종·나이·성별·체중은 사이드바와 겹쳐 뺌. 캐릭터 없는 아이는 같은 크기·자리에 점선 원 [캐릭터 만들기](지금 동작 그대로)
- 결정(글자 색, 사람 2026-11-08): 청록(메인 색)은 이름, 요약 숫자와 단위(96일 전, -, 0건)만. 기준일·항목명·아이콘·설명 문구는 회색(대시보드 카드 보조 글자와 같은 토큰)
- 결정(토큰, 사람 2026-11-08): 색·간격·모서리·그림자·글자 크기·굵기는 `tokens.css` 변수만(px·HEX 직접 쓰지 않음). 글자 크기·굵기는 Typography 표 조합만(최소 13px). 캐릭터 무대 원에 맞는 토큰이 없으면 구현 전에 멈추고 후보를 보여 주며 묻는다
- 결정(사람 2026-11-08, /start 질문): 메인(`/`)과 `SummaryHero.jsx`는 고치지 않고 건강기록 종합 화면만 새 `SummaryBanner.jsx`(메인 히어로는 메인 담당이 따로 없앰, `SummaryHero` 지우기는 아래 후속 절). 배치는 640px 이상 캐릭터 왼쪽 + 이름·기준일 / 요약 3칸 가로, 640px 미만 위 줄 캐릭터 + 이름·기준일, 아래 요약 3칸 세로 목록(가로선). 크기는 기존 화면이 쓰는 단계만: 무대 원/캐릭터 160/128px(`size-40`/`size-32`)·128/96px·96/80px. 앱에는 `tokens.css`가 없어 디자인 폴더 `nyangmung.css` `:root`와 `src/assets/index.css` `@theme`를 토큰 기준으로 봄. 무대 원 색은 기존 `brand-50`
- 결정(사람 2026-11-08, 검증 1회차 실패 뒤): 1100px 중단점 토큰이 없어 큰 크기는 Tailwind 기본 `lg:`(1024px 이상). `index.css`는 고치지 않음. 1024px에서 사이드바는 알약이라 비좁지 않음. 배너는 `Card.jsx`로 감싸지 않음(빈 머리 줄이 남음), 대시보드 카드의 옅은 그림자는 토큰이 없어 넣지 않음
- 문서: 명세 FN-HLT-011 배너 문구 갱신 → `handoff/JAJ.md` 명세 갱신 목록에 넣음
- 결과: 2026-11-08 검증 통과(1회차 실패: 토큰 검사 `min-[1100px]` 2건, 1100px 이상 크기가 `sm:`에 덮임 → 사람이 잠금을 풀고 `lg:` 결정, 다시 1회차 통과), 사람 확인 끝
- 참고: 배너 높이 1440·1024px 210px, 390px 376px(로딩 자리 `HealthSummaryPage.jsx` `SummarySkeleton`은 `h-52 max-sm:h-96`). 숫자 크기는 Typography 표에 없는 30px → 24px
- 연결 남음: 없음(기존 요약 데이터만 사용)

## SCR-HLT-011 건강기록 · 옛 종합 건강기록 히어로(SummaryHero) 지우기 — 끝

- 기능: 정리 작업(기능 ID 없음). 「종합 건강기록 배너 개편」으로 건강기록은 `SummaryBanner`를 쓰고, `features/health/summary/SummaryHero.jsx`는 메인(`pages/main/MainPage.jsx`)만 쓴다
- 기다리는 것: 없음 (LJS 메인 개편 `2f1def4`로 `MainPage.jsx`가 `SummaryHero`를 import 하지 않음, 2026-11-09 확인)
- 완료 조건: 명령: lint·build 0, `grep -rn "SummaryHero" src`·`grep -rnw "countItems" src` 0건 / 화면: `/health`(로그인) 배너 그대로·콘솔 새 오류 없음, `/` 메인 그대로
- 한 일: `features/health/summary/SummaryHero.jsx` 삭제, 그 파일만 쓰던 `summaryUtils.js` `countItems` 삭제
- 결과: 2026-11-09 검증 통과(1~3회차는 로그인 세션이 없어 화면 확인 못 함 → 사람이 로그인하게 해 4회차 통과), 사람 확인 끝
- 연결 남음: 없음

## SCR-HLT-011 건강기록 · 건강기록 대시보드 고른 항목 저장 연결 — 끝
- 기능: 명세 기능 ID 추가 없음(새 기능, ※신규 정책). 「튜토리얼과 고른 기록 대시보드」(D1~D3·D7·D10·D11)·「대시보드 카드 순서 바꾸기」의 저장. 기록 기반 자동 선택은 없애고 추천 3개만 기본으로 씀(사람 결정 2026-11-09 A안)
- 기다리는 것: 없음
- 완료 조건: `widgetStore.js` 가짜 저장소(localStorage)를 `GET·PUT /members/me/dashboard-widgets`로 바꾼다(`queries.js` `useHealthWidgets`·`useSaveHealthWidgets`). GET `data.savedYn=false`면 튜토리얼을 연다. 항목 키(weight…care)를 HLTG25 코드(HLTC0084 체중 ~ HLTC0096 케어리스트, 순서는 `widgetItems.js` id 순)로 바꾼다. PUT 본문은 `{widgets:[{dshbdWdgtCd, indctYn}]}` 13개를 보일 순서대로(빠진·중복·모르는 코드는 400 `INVALID_INPUT_VALUE`). GET 응답은 `savedYn`·`widgets`만이다. `dashboardApi.js` `getRecordedItems`(아이 수 × 11개 요청)와 기록 기반 자동 선택은 대체 없이 지우고, 튜토리얼 기본 선택은 추천 3개. `widgetItems.js:138` `vacc`의 `nm`을 「예방접종·정기검진」으로(카드가 예방접종·정기검진을 보여 주므로 이름을 맞춤, 구충은 케어리스트에 보임)
- 결정(사람, 2026-11-09 승인 때): develop 먼저 합침. 예전 브라우저 저장값 `nyangmeong.health.widgets.<mbrSn>`은 옮기지 않고 지움. [나중에 할래요]·×·Esc 저장이 실패하면 토스트 후 닫음(3단계·편집·순서 저장 실패는 모달 유지). 튜토리얼 봤음 키는 만들지 않음(여는 조건은 `savedYn=false`만). 저장 실패 토스트는 서버 `error.message`. [나중에 할래요] 토스트 문구 그대로. 건강 일지 [항목 편집]은 저장 중 누름 무시
- 결과: 2026-11-09 검증 1회차 통과, 사람 확인 끝. 정책·TC와 어긋나는 문장은 고치지 않고 핸드오프에 목록으로 남김(회의에서 정리)
- 연결 남음: 없음

## SCR-HLT-002 건강 일지 · 지속 관찰 모바일을 PC와 맞추기 — 끝

- 기능: 명세 기능 ID 추가 없음(FN-HLT-002-15·17·18의 760px 이하 화면). PC에 이미 들어간 추가 요청(목록 증감 표시, 사진 줄 최신 5개·[+N], 그래프 최신 5개, 사진 원본 창 넘기기)을 모바일 목록·상세에 맞춘다
- 기다리는 것: 없음(기존 API만 사용)
- 완료 조건: 390px에서 목록 증감이 PC와 같은 글(「▼1.3」·「변화 없음」)과 굵은 `brand-500` / 상세 사진 줄 최신 5개 + [+N] / 사진 원본 창에서 이전·다음 회차로 넘김
- 한 일: M1 목록 증감(`getItemDiffText`, `font-bold text-brand-500`), M2 사진 줄 최신 5개 + [+N 이전 회차], M3 그래프 최신 5개(`CHART_COUNT`를 `observationUtils.js`로 옮겨 PC·모바일 공용), M4 모바일 사진 원본 창 넘기기·[이 회차 선택]. 추가-1 PC와 같은 클래스·토큰, 고친 줄 px·HEX 0건
- 결정(사람, 2026-11-09 승인 때): 모바일 모양 그대로 두고 PC 추가 요청 규칙만 옮김. 삭제 확인 문구 그대로. 그래프도 최신 5개
- 결과: 2026-11-09 검증 1회차 통과, 사람 확인 끝
- 연결 남음: 없음

## SCR-HLT-002 건강 일지 · 영수증 같은 아이 여러 줄 합치기 — 끝

- 기능: FN-HLT-002-48 반려동물 연결(v1.4 신설, 만들 때는 ID 없음. ※신규 정책, 2026-11-08 「반려동물 연결」 상자의 후속). 영수증 「반려동물 연결」에서 한 아이를 여러 줄에 고를 수 있게 하고, 저장할 때 같은 아이의 줄을 검진기록 1건으로 합친다
- 합치는 규칙(※신규 정책, 요구사항에 없음): 검진 종류가 다르면 저장 막음, 검진 내용 `, `로 이음(500자), 메모 줄바꿈으로 이음(200자), 약품 모두 붙임, 가계부 체크된 줄 금액 합(없으면 가계부 안 씀). 구역 없는 영수증 [＋ 반려동물 추가]는 같은 아이 허용 안 함
- 기다리는 것: 없음(기존 save-check·save API. 합쳐 보내므로 백엔드 `checkPets` 그대로)
- 완료 조건: 이름 2개 영수증에서 두 줄 모두 같은 아이를 고를 수 있고 줄 아래 합침 안내 / 같은 아이 줄의 검진 종류가 다르면 저장 막힘·안내 / 같은 아이 두 줄 저장 때 `/receipts/{recptSn}/save` `pets`에 그 아이 1건(내용 이어짐·약품 합·금액 합), 검진기록 1건 / 다른 두 아이는 그대로 2건
- 한 일: R1 `ReceiptPetLink.jsx` 회색 막기 지우고 합침 안내, R2 `buildSectionTabs` 같은 이름 구역 모두 자동 연결, R3 `validateReceipt` 검진 종류 불일치·합친 길이 안내, R4 `buildSaveEntries` 아이별 합침(`tabId` 첫 줄, `tabIds` 모두). 추가-1 합치는 규칙 「※신규 정책」 표시, 추가-2 고친 줄 px·HEX·`style=` 0건(토큰은 `src/assets/index.css` `@theme`, `tokens.css`는 저장소에 없음)
- 결정(사람, 2026-11-09 승인 때): 합치는 규칙은 추천대로(검진 종류가 다르면 저장 막음). 구역 없는 영수증 같은 아이 탭 허용 안 함. 「기록 안 함」으로 한 줄만 저장하는 방법 그대로
- 결과: 2026-11-09 검증 1회차 통과, 사람 확인 끝
- 연결 남음: 없음

## SCR-HLT-011 종합 건강기록 · 대시보드에 안 쓰는 pets 넘기기 지우기 — 끝

- 기능: 명세 기능 ID 추가 없음(코드 정리). `pages/health/HealthSummaryPage.jsx`가 `HealthDashboard`에 안 쓰는 `pets`를 넘기는 것을 지운다. 동작 변화 없음
- 기다리는 것: 없음
- 완료 조건: `HealthDashboard`에 `pets` prop을 넘기지 않음 / lint·build 통과 / `/health` 대시보드가 전과 같이 보임
- 한 일: C1 `HealthSummaryPage.jsx`의 `pets={pets}`와 쓰지 않게 된 구조 분해 `pets,`를 지움
- 결과: 2026-11-09 검증 1회차 통과, 사람 확인 끝
- 연결 남음: 없음

## SCR-HLT-002 건강 일지 · 일상 기록 수정 모달 하나로 — 끝

- 기능: FN-HLT-002-47 하루 기록 수정 모달(v1.4 신설, 만들 때는 ID 없음. ※신규 정책, FN-HLT-002-13 상세 모달을 바꿈). 오늘의 기록 카드 맨 밑 버튼과 최근 건강기록 날짜 행이 같은 「기록 수정」 모달을 연다. 줄마다 시각·값 수정과 [삭제]
- 기다리는 것: 없음(기존 일상 기록 수정·삭제 API)
- 완료 조건: 두 진입점에서 같은 모달 / 바뀐 줄만 PATCH, 저장 뒤 카드 합계·그래프·표 갱신 / 시각·값 검사는 줄 아래 오류 / 일부 실패면 열어 두고 다시 저장 때 실패한 줄만 / 삭제 확인 뒤 즉시 삭제, 그날 마지막이면 닫힘 / 390px 아래 시트 / 1280px 두 카드 높이 차이 ±4px
- 한 일: E1 `DayRecordEditModal.jsx` 신규(`TYPE_ICONS`는 `diaryTypes.js`로 옮김), E2 `RecentRecordTable.jsx` 날짜 행 → 새 모달, `DetailModal`·`MobileDetail`·`RecordCell`·`RecordEditor` 삭제, E3 `TodayRecordCard.jsx` 맨 밑 버튼·`HealthDiaryPage.jsx` `petSn`. 추가-1 `Card.jsx` `footer`를 되돌리고 `TodayRecordCard.jsx` 안에서만(본문 `px-0! pb-0!`, `ul` `px-4.5 sm:px-5.5`, 카드 `overflow-hidden`), 추가-2 버튼 디자인 「✎ 오늘 기록 수정하기」 가운데 정렬 `text-brand-600`
- 결정(사람, 2026-11-09): 공용 `Card.jsx`는 고치지 않음. 일부 실패는 실패한 줄 아래 오류, 성공한 줄은 바뀐 줄에서 뺌
- 결과: 2026-11-09 검증 1회차 실패(안내 조사 「은」 고정) → 고친 뒤 통과, 추가-2 뒤 다시 통과, 사람 확인 끝. 1280px 두 카드 508.1 / 508.1px
- 연결 남음: 없음

## SCR-HLT-002·003 건강 일지·케어 캘린더 · 화면 점검 수정과 시간 선택 — 끝

- 기능: 명세 기능 ID 추가 없음(마일스톤 없이 추가 요청으로 받음). FN-HLT-002-12 오늘의 기록, 003-01 케어리스트 제목, 003-12·13 케어 항목, 003 일정 등록·날짜 상세, 002-13 기록 수정, 공통 반려동물 카드에 걸침
- 기다리는 것: 없음(메인 표시 API는 백엔드에서도 지움(5f7a18e), DB·ERD는 결정 대기)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 아래 추가 요청 각 줄의 화면 조건(`/health`, `/health/diary`, `/health/calendar`, 1280·744·375px)
- 추가 요청: 추가-1·3·4 공용 `Card.jsx` 제목줄(제목은 줄이지 않고 부제 → 동작 순으로 다음 줄, 카드보다 긴 제목만 말줄임) / 추가-2 「정기관리」·「일상관리」 코드 빼기 / 추가-5 카드형 반려동물 팝오버도 아래로 / 추가-6 1100px 이하 탭 줄 `z-30` → `min-[1101px]:z-30` / 추가-7 날짜 상세 0건 점선 박스 본문 높이·가운데 / 추가-8 시간 입력 → `components/TimeSelect.jsx` 오전/오후·시·분 세 칸("HH:mm" 그대로), 기록 수정 모달 760px 이하·일정 모달 640px 미만은 시간 줄을 위아래로 쌓음, 공용 `Select.jsx`에 선택 속성 `disabled`·`ref` / 추가-9 케어리스트 메인 표시(★)·안내 줄 제거, `MAX_MAIN_CARE`·`useSaveCareMain`·`saveCareMain`·안 쓰던 `CarePreview.jsx` 삭제 / 추가-10 TimeSelect 칸을 직접 만든 목록으로(항상 칸 아래, 칸이 든 `dialog`나 `body`에 포털·fixed, 넘치면 스크롤 영역을 올리고 그래도 모자라면 남은 높이) / 추가-11 케어리스트 제목 「토탈 케어리스트」(`petNm` 넘기기 제거)
- 결정(사람, 2026-11-10): 2026-11-09 "공용 `Card.jsx`는 고치지 않음"과 달리 추가-1·3·4는 제목 잘림을 `Card.jsx`에서 고침(모든 카드에 같은 줄바꿈). `CarePreview.jsx`는 2f1def4 뒤로 어디서도 import 하지 않아 삭제. 추가-10 뒤 TimeSelect는 `Select.jsx`를 쓰지 않지만 더한 `disabled`·`ref`는 그대로 둠
- 결과: 2026-11-10 lint·build 0, 화면 확인(Playwright: 폭별 잘림·겹침·가로 스크롤 없음, 시간 오후 01:05 → 13:05·오전 12:00 → 00:00 저장 뒤 다시 열어 같음, 일정 시간 비워 저장, 키보드 ↑↓·Enter·Esc, 모달 안 목록 안 잘림), 사람 확인 끝. 검증 에이전트 루프 없이 진행
- 연결 남음: 없음

## SCR-HLT-003 케어 캘린더 · 회원 단위 일정 조회 연결 — 끝

- 기능: 명세 기능 ID 추가 없음. FN-HLT-003-29·31·40(월간 캘린더·날짜 상세·다가오는 케어 일정)의 일정 조회를 반려동물마다 부르지 않고 백엔드 `GET /api/care-schedules?petSns=&fromYmd=&toYmd=&schdlKndCd=&ckupTypeCd=&size=` 한 번으로 바꾼다. 고칠 곳은 `features/health/api.js`의 `getSchedules` 하나. `CareCalendarPage.jsx`·`UpcomingSchedules.jsx`·`queries.js`는 고치지 않는다
- 기다리는 것: 백엔드 "SCR-HLT-003 케어 캘린더 · 회원 단위 일정 조회"(끝, 2026-11-11). `petSns`는 쉼표 구분(최대 50개), 생략·빈 문자열이면 양육 중인 반려동물 전체, 볼 수 없는 번호는 오류 없이 제외, `size`는 반려동물마다 N건
- 완료 조건: 명령: lint·build 0 / 화면: 반려동물 11마리 회원의 케어 캘린더에서 일정 조회 요청이 화면당 3번이고, 이번 달 일정·다가오는 일정·월 이동이 바꾸기 전과 같다
- 결과: 2026-11-11 lint·build 0, 화면 확인(Playwright: 검증 계정 8마리·다른 계정 11마리 모두 첫 화면 요청 3번(이전 24·33번), 등록·삭제 뒤 다시 읽기도 3번, 전체·아이별 화면이 바꾸기 전과 같음, 새 콘솔 오류 없음), 사람 확인 끝. 검증 에이전트 루프 없이 진행
- 연결 남음: 없음

## SCR-HLT-002·003·005·007 건강기록 입력칸 · 글자 수 한도·표시와 일수 오류 테두리 — 끝

- 기능: 명세 기능 ID 추가 없음(마일스톤 없이 추가 요청으로 받음). FN-HLT-002 관찰·검진기록 모달, 003 일정·관리 항목 모달, 005 기본정보·처방·기타검사·검사 수치 추가, 007 검사 수치 입력에 걸침
- 기다리는 것: 없음(서버 `@Size`·DDL v0.14 한도는 이미 있음)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 아래 추가 요청 각 줄의 조건(`/health/diary`, `/health/calendar`, `/health/pets/1/checkups/6`, `…/inspections`, 1440·390px)
- 추가 요청: 추가-1 병원명 50 → 80(`diary/CheckupModal.jsx`·`diary/receiptUtils.js`·`ScheduleModal.jsx`), 일정 메모 200 → 500 / 추가-2 ※신규 정책 글자 수 「n / 최대」를 `shared/CharCount.jsx`로 묶어 관찰·검진기록·기본정보·처방·기타검사·검사 수치·일정 입력칸에 넣고 기존 3곳도 바꿈(비활성·숫자 칸·PDF 검수 표·영수증 모달 제외) / 추가-3 `CareItemModal.jsx` 주기 직접입력 일수 오류 때 `aria-invalid:border-danger`
- 결과: 2026-11-11 lint·build 0, 화면 확인(Playwright: 병원명 81자 → 80, 일정 메모 501자 → 500, 병원명 80자·메모 500자 일정 저장 201 뒤 삭제, 일수 366 → `--color-danger` 테두리·365 → 원래), 사람 확인 끝. 영수증 모달은 화면 대신 코드로만 확인, 처방·기타검사·검사 수치 추가는 1440만. 검증 에이전트 루프 없이 진행
- 연결 남음: 없음

## SCR-HLT-002·003·005·011 건강기록 · 문구·표시 통일과 반려동물 카드 — 끝

- 기능: 명세 기능 ID 추가 없음(마일스톤 없이 요청으로 받음). 건강기록 전 화면(대시보드·건강 일지·검진상세·케어 캘린더)과 공통 반려동물 카드에 걸침
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `/health`, `/health/diary` 3개 탭, 검진상세, `/health/calendar` 2개 탭, 각 추가 모달, 반려동물 목록(1440·1100·390px)
- 추가 요청: 추가-1 이름(기록 항목 순서 변경·건강 대시보드·처방·투약·케어리스트 연동·반복 예방·케어리스트·케어 캘린더·일상관리/정기관리·체중 눈금 최대/최소) / 추가-2 표기(배변 상태·복용 중·관찰 중·주기 체크/주기 체크 안 함) / 추가-3 새로 넣는 버튼 「추가」, 모달 확인 버튼 「저장」(일정 수정 포함, 화면 안 입력칸 「저장하기」는 그대로), 빈 상태 「~이 없어요」, 「최근 N건」, 카드 부제 「선택」, 「최근 케어 기록」 / 추가-4 영수증 약품 삭제 버튼 `delete` 아이콘·`danger` 호버 / 추가-5 ※신규 정책 사이드 반려동물 카드·「이 기록의 아이」·반려동물 목록을 이름 / 나이 / 품종(`vrtyNm`·`vrtyDrctInptNm`) 한 줄씩, 종류 뺌, 라벨 「선택한 아이」 / 추가-6 390px 타일·종합 배너 빈 값 「기록이 없어요」 / 추가-7 사이드 열 끝에서 카드가 밀리면 메뉴도 같이 올림(`useStickBelowMenu`, 메뉴 `top`만 조정), 1100px에서 카드·pill 함께 보이던 것 `max-[1101px]` / 추가-8 케어 캘린더 설명 「통합」 뺌 / 추가-9 (범위 밖 1파일, AI 담당 확인) `features/ai/receipt/ReceiptUploadModal.jsx` 대상 반려동물 이름만·제목 「영수증으로 추가하기」 / 추가-10 (2026-11-13, 끝 판정 뒤 요청) 반려동물 선택 팝오버 칸은 사진과 이름만(추가-5의 나이·품종 줄을 칸에서만 뺌, 사이드 카드·「이 기록의 아이」는 그대로, `shared/PetSwitcher.jsx`) — 고치기 전에 추가 요청으로 적지 않고 고친 뒤 `/end`에서 적음
- 결과: 2026-11-13 lint·build 0, 화면 확인(Playwright: 위 화면에서 옛 문구 0건, 1440 짧은·긴 화면 맨 아래까지 카드가 메뉴 마지막 항목 아래, 1100 pill만, 390 타일·배너 말줄임 없음, 업로드 모달 옵션 이름만), 사람 확인 끝. 추가-10: lint·build 0, `/health` 1440에서 팝오버 칸 11개 이름만·사이드 카드 나이·품종 그대로(Playwright), 사람 확인 2026-11-13. 영수증 인식 결과 모달(약품 삭제 버튼)은 코드로만 확인. 검증 에이전트 루프 없이 진행
- 참고: 범위 밖에 남은 옛 문구(고치지 않음) `features/expense/dashboard/ExpenseAddModal.jsx`「영수증으로 등록하기」, `features/ai/chat/actionForm.js`「배변상태」, `features/point/guide/PointGuide.jsx`·`pages/ai/AiChatScreen.jsx`「검진기록 등록」, `docs/tc/` 다수(TC_건강기록 약 90곳). 업로드 모달은 같은 이름 반려동물(까미 2마리)을 구분 못 함
- 연결 남음: 없음

## SCR-HLT-011·002 건강기록 · 기록 항목 편집에서 순서 변경, 오늘 기록하기 모달, 켠 항목만 표시 — 끝

- 기능: 명세 기능 ID 추가 없음(마일스톤 없이 요청으로 받음). FN-HLT-011 대시보드 기록 항목 편집·튜토리얼, FN-HLT-002-09·10 건강기록 변화, 002-11 오늘 기록하기, 002-12 오늘의 기록에 걸침
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 핸드오프 `### 추가 요청` 추가-1~4의 화면 조건(`/health`, `/health/diary`)
- 추가 요청: 추가-1 ⋮ 메뉴 「기록 항목 순서 변경」 삭제(`WidgetOrderModal.jsx` 삭제), 기록 항목 편집·튜토리얼 2단계 미리보기 카드 끌어 순서 변경(AI 리포트 맨 위 고정, 끄는 카드 `bg-surface-2 border-line-strong`·놓을 자리 `border-brand-500`·`cursor-grab`, [위로]·[아래로] 없음), 튜토리얼도 끈 순서대로 저장, 안내 문구 「카드를 끌어 순서를 바꿀 수 있어요」 추가·`text-badge`(13px) / 추가-2 오늘 기록하기를 공통 모달로(페이지 영역 삭제, 종류 탭+[항목 편집] 한 줄·시간·양 한 줄·[등록하기] 오른쪽 아래, [완료]는 세로 구분선 뒤 청록 네모 버튼, 등록하면 닫힘·연속 입력 없앰, 그래프 빈 상태 [오늘 기록 추가]는 그 종류로 엶) / 추가-3 오늘의 기록·그래프 칩은 켠 항목만 대시보드 카드 순서로(고른 적 없으면 5개), 꺼 둔 항목이 있으면 남는 공간 가운데 「꺼 둔 항목은 [항목 편집]에서 켤 수 있어요」, 고른 칩이 꺼지면 첫 칩 / 추가-4 오늘 기록하기 모달 폭 560 → 688px / 추가-5(2026-11-17, ※신규 정책, `dashboard/DashboardCard.jsx`) AI 건강분석 리포트를 640px 이상에서 격자 한 줄 전체 폭 띠로(`col-span-full`, 흰 배경·`border-line`·`rounded-card`, 왼쪽 `brand-500` 세로 막대): 제목 줄 / 리포트 제목 / 팁 `' · '` 한 줄, 맨 아래 분석 시각·안내 줄 없앰, notice는 ⓘ에 마우스 올리면·누르면 보임. 리포트 제목 `text-[22px]` → `text-xl`. 640px 미만 띠는 그대로 / 추가-6(2026-11-17) 분석 시각을 ⓘ 옆 「· MM.DD HH:mm 분석」으로, 오른쪽은 [새로고침]·핀만. `rfrshPsblYn` false·409면 버튼 대신 「새로고침은 내일 돼요」(409 빨간 문구 그대로, 새로고침 중은 버튼 흐림 그대로)
- 결과: 2026-11-14 lint·build 0, 화면 확인(Playwright, user0006: 메뉴 항목 1개, 편집 미리보기 끌기·AI 카드 draggable=false, 모달 배치, 산책 끄면 두 카드에서 빠짐·카드 높이 482px 같음·안내 문구, 배변 상태 보던 중 끄면 체중 선택, 688px에서 칩·[완료] 한 줄), 사람 확인 2026-11-14. [등록하기] 뒤 닫힘·튜토리얼 끌기는 사람 확인으로만. 검증 에이전트 루프 없이 진행. 추가-5·6: 2026-11-17 lint·build 0, 화면 확인(Playwright, user0006: 1440·1100·1099·640px 띠 폭 = 격자 폭, 누리·봄이(dataLackYn), ⓘ 마우스 올림, 새로고침 가능·`rfrshPsblYn` false·409는 응답 route로), 사람 확인 2026-11-17. 실제 새로고침·실제 409 본문·ⓘ 터치는 사람 확인으로만. 기획 없이 받아 고친 뒤 `/end`에서 추가 요청으로 적음
- 연결 남음: 없음

## SCR-HLT-003 케어 캘린더 · 케어리스트 개편 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-003-12 토탈 케어리스트에 걸침(※신규 정책: 고른 케어 항목 · 5개 이상 · 공동양육자 미션 포인트 비공개)
- 기다리는 것: 없음(백엔드 SCR-HLT-003 케어리스트 개편 끝 2026-11-16, JAJ 브랜치 병합 후 develop에 들어감). API는 백엔드 `docs/api/health.md`의 `GET care-items`(`indctYn`·`todayMsnYn`·`msnPnt`·`msnCmptnYn`), `PUT /pets/{petSn}/care-items/indications`, `GET /pets/{petSn}/care-items/mission-progress`, 완료 기록 `cmptnDt`
- 완료 조건:
  - 케어리스트는 `indctYn=true`만 그린다. 「케어 항목 관리」 모달은 전부, 처방·반복 예방 연동 칩(`prscSn`·`reptPrvntMngSn`)은 켜진 상태로 고정 + 회색 push_pin(대시보드 AI 건강분석 리포트 「항상 표시」와 같은 아이콘, 마우스 올리면 「항상 표시」), 핀 칩이 하나라도 있으면 칩 아래 「복용 중인 약과 반복 예방은 항상 표시돼요. 처방이 끝나거나 검진상세 [반복 예방]에서 해지하면 자동으로 빠져요」. 튜토리얼 3단계도 같다
  - 모달 [저장] = POST(새 항목) → PATCH(수정) → PUT indications(지울 항목은 목록에서 뺌) → DELETE. 실패하면 모달을 닫지 않고 오류 안내·[다시 시도], 성공한 단계와 새 항목 번호는 기억해 남은 단계만 다시 보낸다(새 항목이 두 번 생기지 않게)
  - PUT·DELETE가 400 `INVALID_INPUT_VALUE`이고 `data[0].field`=`indctYn`이면 「케어리스트에는 항목을 5개 이상 남겨 주세요.」
  - 케어리스트 탭을 열 때 보이는 항목이 5개 미만이면 관리 모달 자동(왼쪽 위 주의 상자 「케어가 n개로 줄었어요. m개 이상 더 골라 주세요.」, ✕·Esc·배경 클릭으로 안 닫힘, 버튼은 [저장] 하나)
  - 검진기록 삭제(CheckupListCard)·처방약 삭제(PrescriptionForm)·반복 예방 해지(PreventionTab) 확인창(공용 Modal isConfirm)에 삭제하면 5개 미만일 때 warn 상자(ExpenseBulkDeleteDialog 100행 모양) 「삭제하면(해지는 「해지하면」) 케어리스트가 n개가 돼요. 케어리스트에 들어가면 [항목 관리]에서 케어를 추가할 수 있어요.」. n = GET care-items의 `indctYn=true` 수 − 그중 `ckupRcdSn`·`prscSn`·`reptPrvntMngSn`이 지울 대상과 같은 행 수. 처방 「수정」 경로는 넣지 않음
  - 기록 내용에 완료 시각 「08:12」(`cmptnDt`의 시·분)
  - 오늘 미션 기본 항목 줄 배지(`todayMsnYn`·`msnCmptnYn`·`msnPnt`). 공동양육자(`mission-progress`의 `prmyYn=false`)는 「⭑ 미션」/「✓ 미션」, 진행 상자 2줄 「오늘의 케어미션 a / b · 공동양육 중인 아이라 포인트는 주양육자에게 적립돼요」(a/b = `cmptnCnt`/`totCnt`), [미션 보기 ›]·받은 포인트 없음
  - 명령: `yarn -s lint`·`yarn -s build` 0
- 기획: 사람 작업 지시(2026-11-16 ■0~4)를 그대로 기획으로 봄. 위 완료 조건에 더해 튜토리얼 4단계(3 케어 고르기, 4단계에서만 케어 저장), 케어리스트 배치(진행 상자 + 「오늘 할 케어」·「다가오는 정기관리」, 1100px 이하 탭, 아래 「최근 케어 기록」 카드), 대시보드 케어리스트 위젯도 `indctYn=true`만
- 결정(사람, 2026-11-16): `components/Modal.jsx` width 1040 추가, 자동 모달 문구 m = 5 − n, 640px 미만은 기존 둥근 칸·[더보기]·투약 [마지막 1회 취소] 위치 그대로, ⋮ 삭제 오류는 확인창 안에만, 튜토리얼 [다시 고르기]는 2단계로, `useCareMissions`는 페이지(`CareCalendarPage.jsx`)에서 불러 숫자만 넘김
- 결과: 2026-11-16 검증 4회차 통과(1회차 로그인 세션 없음, 2회차 스켈레톤 높이·형제 key 겹침, 3회차 390px 스켈레톤 높이). 스켈레톤은 봄이(보이는 항목 5개) 실측 1440px 606/739·1000px 670/739·390px 691/727. 공동양육(까미) 「⭑ 미션」·적립 안내 확인. 튜토리얼·5개 미만 자동 모달·확인창 주의 상자·위젯은 응답을 route로 바꿔 확인, 반복 예방 해지 확인창은 화면으로 못 봄(같은 컴포넌트). 사람 확인 2026-11-16
- 추가 요청(2026-11-16, 추가-1~20 검증 통과·사람 확인, ※신규 정책):
  - 추가-1 케어미션 아이콘을 발바닥(lucide `PawPrint`)으로(안 한 미션 배지·진행 상자)
  - 추가-2·20 케어 줄 둘째 줄: 일상관리는 체크하면 「오늘 완료」만, 정기관리 「{주기} 주기 · MM.DD 예정」·오늘 완료 「{주기} 주기 · 오늘 완료 · MM.DD 예정」, 완료 시각은 화면에 없음(위 완료 조건의 「08:12」를 바꿈). 640px 미만은 「1주 · 11.10」·「1주 · 오늘 완료 · 다음 11.23」, 연동 배지 대신 회색 push_pin
  - 추가-3·6 최근 케어 기록 조회기간 드롭다운(최근 3·7·14일, 처음 3일, 오늘 포함), 640px 미만 부제 숨김
  - 추가-4·7·8 모든 줄 이름 줄 최소 74px(640px 미만은 감긴 만큼 늘어남, 투약 아래 줄은 비교에서 뺌), 완료는 취소선 없이 줄 배경색
  - 추가-9 진행 상자를 두 상자로(케어리스트 / 오늘의 케어미션 · 전체, `warn` 토큰). 주양육자는 상자 전체가 포인트 화면 링크, 공동양육자는 적립 안내만. 미션을 못 불러오면 케어리스트 상자가 전체 폭
  - 추가-10 케어 줄 ⋮ 메뉴 없앰(`CareItemModal.jsx` 삭제, 수정·삭제는 모달에서만)
  - 추가-11·12·13·14 「케어 항목 관리」 모달 [고르기 | 수정] 전환, 직접 만든 항목 전체 수정 + [이 항목 삭제](확인창, 실제 DELETE는 [저장] 때), 기본 정기관리는 주기만. 전환 버튼은 `features/health/SegmentSwitch.jsx`로 뽑아 일정 등록 모달과 같이 씀
  - 추가-16·18·19 두 구역 모두 「오늘의 미션 · n개」 묶음이 위(3px 세로 막대, 640px 미만 완료 칸만 `warn`). 오늘 할 케어는 체크하면 자기 묶음 맨 아래, 다가오는 정기관리는 묶음 안 예정일 순
  - 추가-5·15 스켈레톤은 기록이 있는 봄이 기준(1440px 633/291, 1000px 697/291, 390px 829/463), 추가-17 `careIcons.js` 주석
  - 추가-21(2026-11-17, 백엔드 #250 한도 = 관리자 설정값, 공동양육 포함) 반려동물 바꾸기 [등록]은 `GET /pets/limit`의 `remainingPetCount > 0`일 때만, 불러오는 중·실패면 숨김(임의 숫자 안 씀). 건강기록 `getPetLimit`·`usePetLimit`, queryKey는 `petKeys.limit()`(마이페이지 등록·삭제·수락과 캐시 공유). lint·build 0, 1마리 + 응답 route로 4경우 확인, 사람 확인 2026-11-17
- 연결 남음: 없음

## SCR-HLT-011·002·003 건강기록 · 피드백 반영(대시보드 편집·건강기록 둘러보기·기록하기 바로가기) — 끝

- 기능: 명세 기능 ID 추가 없음(마일스톤 없이 요청으로 받음). FN-HLT-011 대시보드·튜토리얼, FN-HLT-002-11 오늘 기록하기, FN-HLT-003-12 토탈 케어리스트·다가오는 일정에 걸침
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 핸드오프 `### 추가 요청` 추가-1~23의 화면 조건(`/health`, `/health/diary`, `/health/calendar`, 1440·1100·760·761·640·390)
- 추가 요청: 추가-1 ⓘ 이용 안내(추가-9로 되돌림, 공용 레이아웃 diff 없음) / 추가-2·8 0마리 빈 화면·등록 뒤 돌아오면 튜토리얼(`registerPath.js`), 종합 건강기록 0마리 등록 상자 숨김 / 추가-3·10 매일 기록 5개 카드 「기록하기 ›」 → 건강 일지 「오늘 기록하기」(휴대폰 타일 포함) / 추가-4 [더보기] 대신 항목별 이름 / 추가-5·6 케어 줄 동그라미 삭제, 연동 이동 버튼 / 추가-7 다가오는 일정 → 그 달·그 날짜 상세 / 추가-11·12 ⋮ → [대시보드 편집], 튜토리얼 2단계·편집 1040 두 칸(공용 `Modal.jsx` develop 그대로, 너비 transition 없음) / 추가-16·19·21 미리보기 5:7·3열·항목별 고정 예시 값 / 추가-13·15·17·20·22 새 「건강기록 둘러보기」 8장(사진 16:10, 3장 TIP 안 바로 열기, 크게 보기 확대, 번호 13px) / 추가-14 사이드 아이 말풍선·알약 한 줄 / 추가-18 주석 옛 이름 정리 / 추가-23 둘러보기 모달 `document.body` portal(너비 바꿔도 보임) / 추가-24 develop(LJS UI 통일 2-A·2-B) 병합 충돌 7개 정리: 기능은 JAJ, 크기·색·버튼·폭 기준(760·1100)은 develop. 지워진 `diary/EmptyBox` 대신 `NoPetDashboard`를 공용 `EmptyResult`로 / 추가-25 JAJ 코드를 2-A H1~H8로: [대시보드 편집]·[같이 둘러보기]·확대 [닫기] `BTN_SECONDARY`(덮어쓰기 제거), 「크게 보기」 `CHIP`, 알약 아래 한 줄·3장 TIP 링크 `TEXT_ACTION`, 둘러보기 장 제목 `text-lg`, `rounded-card`·`rounded-box`·`min-h-18`·`text-page` 토큰
- 결과: 2026-11-18 검증 에이전트 통과(1회차 760px 경계 실패 → `max-[761px]`로 고쳐 통과, 추가-23까지 재검증 통과), lint·build 0, 사람 확인 2026-11-18. 추가-24·25: 병합 뒤 검증 통과(추가-25 1회차 단계 밖 글자·손으로 만든 버튼 실패 → 2회차 통과), 사람 확인 2026-11-18. 처방 연동 [처방 보기 ›]는 데이터가 없어 코드로만, 다른 달 일정 이동·실제 등록 뒤 돌아오기는 사람 확인으로만
- 연결 남음: 없음

## SCR-HLT-011 건강기록 · 수정 모음 7건(크게 보기 아이콘·알레르기 수정하기·AI 리포트 민트 띠·케어리스트 카드 빼기·선택 창 5열·미리 요청·상세 요청 빼기) — 끝

- 기능: 명세 기능 ID 추가 없음. FN-HLT-011-01·12·16·17·19에 걸침(마일스톤 없이 요청으로 받음, ※신규 정책 3·4번)
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 1 둘러보기 사진 칸 아이콘만·툴팁 「크게 보기」, 2 알레르기 「수정하기 ›」 → `/mypage/pets?edit=<petSn>` 수정 모달, 3 AI 리포트 민트 띠(왼쪽 막대 없음·팁마다 막대·「내일 다시 새로고침할 수 있어요」), 4 대시보드 칩 12개(케어리스트 없음)·저장 성공, 5 선택 창 5열, 6 `health-report`·`dashboard-widgets`가 요약과 함께 출발·중복 없음, 7 `GET /pets/{petSn}`·최신 체중 요청 없음(요약 9개)
- 결정: 7번 요약 요청 9개(`getPet`·`getLatestWeight` 뺌, `summary.weight` 읽는 곳 없음, 화면이 목록 값 `selectedPet`을 `summary.pet`으로 붙임), 1번 `aria-label` 기존 유지·`title` 「크게 보기」, care 빼며 `DashboardCard`의 `titleNote`·`linkText` 분기 삭제, PUT 본문에 `HLTC0096`은 `indctYn=false`로 계속 보냄(백엔드가 13개를 모두 검사). 6번은 `queries.js` `usePrefetchHealthDashboard`(옵션 묶음 공유, staleTime 5분, 0마리면 위젯 설정 안 부름)를 페이지가 부름
- 결과: 2026-11-18 검증 1회차 통과(대시보드 수정 2건과 함께 다시 본 2회차도 통과), 사람 확인 끝. 6번 바꾼 뒤 진입 기준 `/pets` 1231ms 끝 → 요약 9개·리포트·위젯 설정 1248~1250ms 함께 출발(위젯 1990ms·리포트 2420ms 끝). 바꾸기 전은 재지 못함(요청 때 측정: 위젯 1.82초·리포트 2.56초). 4글자 이상 이름 말줄임은 계정에 없어 클래스로만
- 연결 남음: 없음

## SCR-HLT-011 건강기록 · 대시보드 수정 2건(식사량·음수량·산책 최근 기록일 합계·AI 리포트 흰 상자) — 끝

- 기능: 명세 기능 ID 추가 없음. FN-HLT-011-12·14에 걸침(요청으로 받음)
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0, 바꾼 파일 Prettier 0 / 화면: 1 식사량·음수량·산책 「최근 5개 기록」, 오늘 기록이 없으면 마지막 기록일 합계(「80.9 g / 10.28 합계」)·직전 기록일 대비(점 1개면 없음)·390 타일 같은 값과 칩, 오늘 기록이 있으면 그대로 / 2 AI 리포트 1440 제목·팁 흰 상자(`rounded-box bg-white px-4 py-3`, 제목 `text-base font-semibold`, 팁 `text-sm`), 390 띠 그대로, 7건 3번 민트 띠 그대로
- 결정: 오늘 기록이 없으면 카드·390 타일 대비 = points 마지막 − 그 앞(서버 `prevDiff`가 null이라 화면에서 계산, 점 1개면 없음), 날짜 `formatMonthDayDot`(「08.29」). 7건과 이어서 진행해 9건을 한 번에 `/end`
- 결과: 2026-11-18 검증 2회차 통과(1회차는 화면 통과, 바꾼 두 파일 작업 사본 CRLF로 Prettier check 1 → `prettier --write`로 LF), 사람 확인 끝. `dataLackYn` 리포트는 데이터가 없어 코드로만
- 연결 남음: 없음

## SCR-HLT-011 건강기록 · 대시보드 위젯 카드 300px 고정과 공용 차트 기본값 — 끝

- 기능: 명세 기능 ID 추가 없음. FN-HLT-011-12·14와 건강 일지·관리자 그래프(공용 차트)에 걸침(요청으로 받음)
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 대시보드 카드 300px 안 넘침 없음, 식사량·음수량·산책 오른쪽 위 합계·「┄ 평균 n」·막대 평균 글자 없음, 첨부 3줄·「최근 3건」, 체중 카드 날짜 안 겹침, 건강 일지 산책 탭·관리자 이용 통계 막대 높이 122·평균 글자 그대로, 체중 탭 좌우 여백 그대로·식사량·음수량 탭·관리자 일별 그래프 좌우 12, 760px 미만 지속 관찰 크기 변화 그래프(좌우 12로 바뀜) 첫·마지막 날짜와 말풍선 안 잘림
- 추가 요청: 추가-1 스켈레톤 높이, 추가-2 LineChart 위 여백 16·말풍선 점 아래·체중 카드 정리, 추가-3 넘치는 카드 4개 줄이기, 추가-4 검사 수치 1회 항목 점 하나, 추가-5 알레르기·기저질환 2줄, 추가-6 대시보드 열 수 컨테이너 기준(1000px), 추가-7 예방·정기검진 날짜만, 추가-8 labelEvery 5회 이상만 2, 추가-9 「점선은 참고범위」 삭제, 추가-10 말풍선이 날짜 줄에 닿으면 맨 위·검사 수치 높이 126- 결정: 1100폭은 1280 분기점 대신 `@container` 1000px 기준(ui.md 분기점 390·760·1100 유지), `Card.jsx`는 고치지 않음. `Delta`·`ValueRow` 삭제, 말풍선 아래 점선 자리 없으면 생략. 검사 수치 5회 항목 날짜 두 칸·지속 관찰 크기 2회 이상은 데이터가 없어 사람 확인으로. 390폭 건강 일지 체중 탭 최대·최소 라벨 3px 잘림은 이번 변경 전 문제라 다루지 않음. ※신규 정책(문서는 나중에): 검사 수치 1회 항목은 점 하나와 말풍선, 알레르기·기저질환은 최대 2줄 말줄임
- 결과: 2026-11-18 검증 통과(판정 「확인 못 함 있음」, 내 것 없음. 루프는 사람 결정으로 세 번 clear 후 다시 시작). 남은 관리자 화면(이용 통계 막대·일별 그래프)은 사람이 확인함. 사람 확인 끝. 데이터 없는 경우는 검증 에이전트가 브라우저 응답만 바꿔 확인
- 연결 남음: 없음

## SCR-HLT-005 검진상세 · 처방·투약 일괄 저장 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-005-03 처방·투약에 걸침(※추가 요청: 모달에서 약 여러 개 추가·수정을 한 번에 저장)
- 기다리는 것: 없음(백엔드 PR #267로 develop 병합)
- 요청 2026-11-19(사람이 고칠 파일·내용 승인): [A] 검진상세 「‹ 목록으로」(`back: true`, `backTo` 건강 일지 `#hlt002-exam`). [B] 검진상세 입력을 모두 `diary/FormModal` 모달로(검사 수치 추가·수정, 기타검사 [저장하기], 영상검사 → 영상 사진이 골라진 첨부 추가, 반복 예방, 첨부, 처방·투약 여러 약 모달). `LabInputPage`는 PDF 분석용으로 그대로
- 결정: 처방 행 배지 오른쪽 [수정] 추가(약품명도 같은 모달), 수정 모달은 누른 약만 펼침, 저장된 약 삭제 확인에만 CareShortageNotice, 약 0개면 [저장하기] 비활성, useCreatePrescription·useUpdatePrescription·API 함수는 남김. 400 칸 오류는 `values[i].필드`를 그 약 칸 아래에, 칸에 못 붙이는 문구는 모달 아래 오류 줄
- 결과: 2026-11-19 lint·build 통과, 화면 ①~⑥ Playwright 확인(백엔드 develop d3f25ff). 사람 확인 2026-11-19(추가 요청 포함). 2026-11-19 별도 검증 1회차 통과(일괄 저장·A·B·추가-5~9, 400·404는 코드로 확인, 처방약 연동 칩·투약 줄·반려동물 한 마리는 응답을 바꿔 확인)
- 연결 남음: 없음
- 추가 요청 2026-11-19(사람 승인): ① 검진상세 「‹ 목록으로」 모양을 커뮤니티 상세와 같게(contentClassName 기본값, gap-7·tabular-nums·antialiased는 본문 div에만) ② 검진상세에서 여는 모달의 칸 옆 「선택」 삭제(LabItemForm·EtcInspectionModal, 사람 결정으로 diary/CheckupModal도. 검사 수치 입력 페이지·건강 일지 검진기록 모달에서도 같이 빠짐) ③ 영상검사 링크 「첨부 자료 추가하기」 ④ 반복 예방 반복 주기를 SegmentSwitch로, 칸 한 줄에 하나씩, 직접입력이면 이름 없는 일수 칸(aria-label 「반복 일수」) ⑤ 공용 BarChart에 height(숫자 또는 폭→높이 함수, 기본 122), 건강 일지 산책 막대는 꺾은선과 같게 그래프 폭 600 미만 230·이상 260, 산책·꺾은선 로딩 칸 260 / 600px 미만 230
  - 결과: 2026-11-19 lint·build 통과, ①~⑤ Playwright 확인. 관리자 통계는 관리자 계정이 아니라 화면에서는 못 보고 코드로 확인(height를 넘기지 않아 122)
- 추가 요청 2026-11-19(사람 승인): ① 처방·투약 모달 [＋ 약 추가]는 펼친 약을 모두 접고 새 약만 펼친 채 그 위치로 폼 본문을 스크롤(scrollIntoView는 바깥 모달 감싸개까지 밀어 제목 줄이 움직여서 폼을 직접 scrollTo), 모달은 고정 높이(FormModal `isFixedHeight` → 공용 Modal isAutoHeight 없이 660px·화면 − 2rem·760px 미만 화면 전체, 폼만 안에서 스크롤) ② 첨부 추가의 파일 유형·영상 종류·촬영 부위를 SegmentSwitch로, 칸 한 줄에 하나씩
  - 결과: 2026-11-19 lint·build 통과, ①~④ Playwright 확인(1440px·390px). 390px 첨부 추가 버튼 글자 넘침 없음
- 추가 요청 2026-11-19(사람 승인): 처방·투약 모달 [＋ 약 추가] 버튼의 mt-4를 빼 마지막 약과 간격 20px, shrink-0으로 고정 높이 모달 안에서도 높이 40px
  - 결과: 2026-11-19 lint·build 통과, 1440px·390px 약 1개·6개 모두 간격 20px·높이 40px 확인
- 추가 요청 2026-11-19(사람 요청, 핸드오프 추가-5~9): 추가-5 일정 수정 모달 [삭제하기] → 첫 이름표 줄 오른쪽 휴지통(한 마리면 「일정 종류」 줄) 추가-6 건강 일지 검진기록 줄 전체 클릭(링크는 병원명 하나, [삭제]는 위) 추가-7 오늘의 케어미션 상자 민트·「배지가 붙은 항목이 오늘의 미션이에요」, 미션 세로 막대·「오늘의 미션 · n개」 삭제 추가-8 케어 항목 관리 「수정」에서 연동 칩을 눌러 [검진상세에서 관리 ›], 저장 안 한 변경이 있으면 Modal isConfirm 확인창 추가-9 케어리스트 줄의 [처방 보기 ›]·[반복 예방 관리 ›] 삭제(※신규 정책: 검진상세 이동은 관리 모달에서만)
  - 결과: 2026-11-19 lint·build 통과, 1440px·390px Playwright 확인(캡처 `.playwright-mcp/pr/JAJ-20261119-SCR-HLT-002·003-*`). 처방약 연동 칩·투약 줄·공동양육자 MissionBox는 데이터·계정이 없어 화면에서 못 봄. 사람 확인 2026-11-19
- 완료 조건:
  - 처방·투약 모달 [저장하기] 한 번이 `POST /pets/{petSn}/prescriptions/bulk-save` 한 번이다. 요청 `{ckupRcdSn, values:[…]}`, 이미 등록된 약은 `prscSn`을 넣고 모든 값을 보낸다(전체 덮어쓰기), 새 약은 `prscSn` 없이 보낸다. 필드 이름은 `PrescriptionCreateRequest`와 같다(mdcnNm·mdcnBgngYmd·mdcnEndYmd·dayMdcnNmtm·prscSttsCd·careRfltYn)
  - 200이면 응답 목록(요청 순서)으로 모달·처방 목록·케어리스트를 갱신한다. 400·404면 아무것도 저장되지 않았으니 입력을 그대로 두고 오류를 보여 준다
  - 삭제는 지금처럼 `DELETE /pets/{petSn}/prescriptions/{prscSn}`를 쓴다(일괄 저장에 넣지 않음)

## SCR-HLT-003·011·002·005 건강기록 · 수정 모음 2026-11-20(케어 항목 관리 모달 배치·둘러보기 틀·튜토리얼 명칭·지속 관찰 ⓘ·AI 리포트 팁 2줄·검진상세 뒤로 가기 글자) — 끝

- 기능: 명세 기능 ID 추가 없음. FN-HLT-003-21~24·38(케어 항목 입력), FN-HLT-011(대시보드·튜토리얼·둘러보기), FN-HLT-002-15~19(지속 관찰), FN-HLT-005(검진상세)에 걸침(마일스톤 없이 요청으로 받음, 프론트만·백엔드 변경 없음)
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 핸드오프 `### 추가 요청` 추가-1~7의 화면 조건(1440·390)
- 추가 요청(사람 요청 2026-11-20, 핸드오프 추가-1~7): 추가-1 케어 항목 관리 모달 1040×660 고정·반반 두 칸·「고칠 항목을 눌러 주세요」 상태 없앰·[+ 새 항목으로]·입력칸 순서(항목명|반복 유형 → 아이콘 10개 한 줄 → 주기 한 줄(잠금+안내) → 반복 일수|마지막으로 한 날)·다음 예정일 버튼 줄 한 줄·760px 미만 고르기/입력 화면 두 장 / 추가-2 건강기록 둘러보기를 메인 서비스 둘러보기 틀로(660 고정, 목차 높이 꽉, 설명→TIP→그림, 그림 `isFill`, 번호 배지 「여기를 누르면」 왼쪽) / 추가-3 튜토리얼 「기록 고르기」 → 「대시보드 항목」(2단계 제목 「대시보드 항목 고르기」, 760px 미만 편집 「항목 고르기」, `WidgetPicker` 주석 포함) / 추가-4 `DashboardCard` NoticeInfo를 `features/health/shared/NoticeInfo.jsx`로 꺼내 지속 관찰 제목 옆 ⓘ(「크기 변화 그래프」 안내), 「회차가 2개 이상…」 문구 삭제 / 추가-5 AI 리포트 팁 한 문단 `line-clamp-2` + `title` 전체 팁 / 추가-6 `SubPageLayout` `backLabel`(기본 「목록으로」), 검진상세만 「검진기록으로」 / 추가-7 일상관리면 「마지막으로 한 날」 잠금·빈 값·「-」, 지속 관찰 말풍선 760px 미만 `w-64`
- 결정: 660 안에 넣으려고 오른쪽 칸을 둥근 상자 대신 높이를 채운 회색 칸(수정 중 민트 테두리 없음), 항목명 글자 수를 라벨 줄 오른쪽·「만든 항목은…」을 제목 옆 같은 줄로(사람 확인). 주기 잠금은 감싼 칸 `opacity-40`(SegmentSwitch는 고치지 않음). 수정 화면에 「마지막으로 한 날」 없음은 원래 동작(수정 Body에 lastCmptnYmd 없음). AI 리포트 ⓘ는 760px 미만에 없고 760px에서 오른쪽 끝 724px라 `w-72` 그대로. 공용 Modal·SegmentSwitch·CareChipPicker·TocButton·ZoomBox·ZoomOverlay·ServiceTutorialModal은 고치지 않음. ※신규 정책(문서는 나중에): 위 추가-1~7
- 결과: 2026-11-20 lint·build 0, 토큰 위반 0(새 px·HEX 없음, 대괄호 값은 `max-[760px]` 분기점과 옮긴 기존 값뿐, `rounded-[14px]` 3곳 빠짐). Playwright 확인: 1440 케어 항목 관리 모든 상태(새 항목 4경우·직접입력+오류·직접 만든 항목·기본 정기·연동) 모달 660·오른쪽 칸 스크롤 0, 390 고르기↔입력 흐름, 둘러보기 8장 660·목차 523/본문 543, 지속 관찰 4경우 ⓘ·390 말풍선 오른쪽 끝 364, AI 리포트 팁 2줄(내용 60/보이는 40), 검진상세 「검진기록으로」·커뮤니티 「목록으로」. 캡처 `.playwright-mcp/pr/JAJ-20261120-*`. 튜토리얼·지속 관찰 경우·긴 팁은 응답을 바꿔 확인(저장 요청은 막음). 사람 확인 2026-11-20. 2026-11-20 별도 검증 1회차 통과(추가-1~7, 확인 못 함 없음. 처방약 칩은 복용 중인 처방이 없어 반복 예방 연동 칩으로 확인)
- 연결 남음: 없음

## SCR-HLT-011·002·005·003 건강기록 · 수정 모음 2026-11-23(튜토리얼 명칭·둘러보기 그림·영수증 칩 안내·관찰 모달·검진상세 추이 보기 삭제·범위 밖 수치·파일 교체·최근 건강기록) — 끝

- 기능: 명세 기능 ID 추가 없음. FN-HLT-011(튜토리얼·둘러보기·대시보드), FN-HLT-002-15~19(지속 관찰)·002-36(영수증 반려동물별 기록)·최근 건강기록, FN-HLT-005-02(검진상세 혈액검사·첨부)에 걸침(마일스톤 없이 요청으로 받음, 프론트만·백엔드 변경 없음)
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0, 토큰 위반 0 / 화면: 사람 지시 1~10번과 추가-1~7의 1440·390 조건
- 1~10번: ① 튜토리얼 3단계 「케어리스트 항목」/「케어리스트 항목 고르기」 ② 둘러보기 그림 7장 다시 캡처(1132×706, 옛 그림 배경·테두리·여백에 맞춤) ③ 영수증 칩은 이름만, 구역 이름이 다르면 PC title·760px 미만 ⓘ 한 줄 ④ [촬영하기] 작은 화면만 ⑤ 회차 추가·수정 항목·부위 disabled 회색 ⑥ 검진상세 「추이 보기」와 `?inspection=`·토스트 삭제, 안내 두 줄, 둘러보기 3장 TIP ⑦ ▲(빨강)·▼(파랑) 숫자 앞 ⑧ 「파일 교체」 ⑨ 최근 건강기록 › 칸·아이콘 삭제, 날짜 버튼(키보드) ⑩ 오늘 줄 바탕 같게·[오늘] 배지
- 추가 요청(사람 요청 2026-11-23): 추가-1 관찰 사진 칸 높이 고정·폭은 사진 비율·버튼 사진 오른쪽 / 추가-2 760px 미만 h-36 / 추가-3 둘러보기 지속 관찰 그림 3회차 선택으로 다시 캡처 / 추가-4 [촬영하기] 1100px 미만 / 추가-5 760px 미만 단계 막대는 지금 단계만 이름·연결선 12px / 추가-6 「기록 안 함」·「반려동물 선택」 칩 안내 정책 주석 / 추가-7 안내 문구 「영수증에 적힌 이름: '…'」
- 결정: 시간 칸은 지금 코드(오전 ▾ + 시·분 입력칸)가 옛 그림과 겉모양이 같아 지금 화면 그대로 찍음. 390 가로 사진은 버튼이 아래 줄. 공용 Badge·NoticeBox·Modal·FormModal·ImageAttach·josa.js는 고치지 않음. ※신규 정책(문서는 나중에): 위 1~10·추가-1~7
- 결과: 2026-11-23 lint·build 0, 토큰 위반 0(새 대괄호 값은 분기점 `min-[760px]`·`max-[760px]`·`min-[1100px]`과 지시의 `rounded-[10px]`뿐). Playwright 확인: 튜토리얼 390 단계 막대 scrollWidth=clientWidth, 관찰 모달 세 모드, 사진 칸 1440 160·390 144, 검진상세 추이 보기 0·▲▼ 색, 최근 건강기록 Tab→Enter 모달, 둘러보기 8장 1440·390 잘림 없음. 범위 초과 예시와 영수증 구역 이름 칩은 응답을 바꿔 확인(저장 요청 막음). 사람 확인 2026-11-23
- 연결 남음: 없음

## SCR-HLT-005·002·003 건강기록 · 수정 모음 2026-11-23 오후(검진상세 ⋮ 메뉴·검진기록 수정 잠금·일정 삭제 안내·목록 삭제 빼기·오늘 할 케어 자리 고정) — 끝

- 기능: 명세 기능 ID 추가 없음. FN-HLT-005-01·FN-HLT-002-14·26~31·FN-HLT-003-32~37·FN-HLT-003-12에 걸침(사람 요청으로 받음)
- 기다리는 것: 백엔드 `schdlDelYn`(검진상세)·`ckupRcdSn`(일정 목록). 없어도 동작(첫 문구·건강 일지로 이동)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0, 새 px·HEX 0 / 화면: 사람 지시 1~5의 확인 항목(1440·1024·390)
- 1~5: ① 검진상세 기본정보 ⋮(CareItemMenu) [수정]=모달·[삭제]=확인창, 삭제 뒤 `건강 일지?petSn=#hlt002-exam` replace 이동, 인라인 수정 삭제 ② 수정 모달 반려동물·검진일 disabled, 안내 2종(schdlDelYn이면 event_busy), body는 hsptlNm·ckupTypeCd·ckupCn·ckupMemoCn만, 반려동물 이동 확인창·onSaved 삭제 ③ 일정 수정 조건 A(병원·연결 검진기록) 안내상자, 삭제 확인창 설명·「검진기록 보기 ›」(ckupRcdSn이면 검진상세, 아니면 건강 일지), ConfirmModal 선택 prop children ④ 검진기록 목록 [삭제] 삭제 ⑤ 오늘 할 케어 체크해도 자리 그대로, 오늘 예정 정기관리는 `careTodayKept:{petSn}:{오늘}` localStorage로 오늘 하루 남김
- 결정: 삭제 뒤 지운 상세는 무효화하지 않고 removeQueries(`useDeleteCheckup` 전용 onSuccess). ※신규 정책(문서는 나중에): 위 1~5
- 결과: 2026-11-23 lint·build 0, 새 px·HEX 0. 검증 1회차 실패(삭제 뒤 404 오류 화면) → 2회차 확인 못 함 있음(연결 남음뿐). 삭제는 가짜 응답(DELETE 200·GET 404)으로, schdlDelYn·ckupRcdSn은 응답을 바꿔 확인. 사람 확인 2026-11-23
- 연결 남음: FN-HLT-005-01·002-26~29 (백엔드 연결 검진상세 `schdlDelYn`, 백엔드 저장소에서 /start — `SCR-HLT-002 검진기록 일정 연동 정리` 끝 2026-11-23), FN-HLT-003-32~37 (백엔드 연결 일정 목록 `ckupRcdSn`, 같은 백엔드 마일스톤). 프론트 확인은 아래 「검진기록 일정 연동 정리 연결」

## SCR-HLT-005 검진상세 · 검진기록 일정 연동 정리 연결 — 끝

- 기능: 명세 기능 ID 추가 없음. FN-HLT-005-01·FN-HLT-002-26~29·FN-HLT-003-29~37에 걸침(※신규 정책)
- 기다리는 것: 없음 — 백엔드 `SCR-HLT-002 건강 일지 · 검진기록 일정 연동 정리` 끝 2026-11-23(백엔드 `9185c8a`, `origin/JAJ`, develop 병합 전). 검진상세 `schdlDelYn`, 일정 목록 `ckupRcdSn`(연결 1건이면 번호, 0건·2건 이상 null), 검진기록 수정은 `petSn`·`ckupYmd`를 무시, 병원명·검진 종류는 검진기록↔일정 양방향 반영
- 이미 바뀐 것: "SCR-HLT-005·002·003 건강기록 · 수정 모음 2026-11-23 오후" ②③(수정 모달 반려동물·검진일 disabled·schdlDelYn 안내, 일정 삭제 확인창 「검진기록 보기 ›」의 ckupRcdSn 이동)
- 완료 조건: 화면: 실제 백엔드 응답으로 ① 연결 일정을 지운 검진기록 상세에서 event_busy 안내 ② 연결 1건 병원 일정의 「검진기록 보기 ›」가 그 검진상세로, 0건·2건은 건강 일지로 ③ 검진기록 수정으로 병원명을 바꾸면 캘린더 일정 병원명도 바뀜(캘린더 쿼리 무효화 필요 여부 확인) ④ 일정 수정으로 병원명을 바꾸면 검진상세에 반영. 가짜 응답이 남아 있으면 지운다. 명령: `yarn -s lint`·`yarn -s build` 0
- 결과: 2026-11-23 코드 변경 없음(기존 코드가 실제 응답 그대로 동작). lint·build 0, 검증 1회차 통과(실제 백엔드 JAJ 브랜치, 1440·390). 실제 응답 `schdlDelYn` boolean, `ckupRcdSn` 1건 번호·0건·2건 null. 0건 일정은 확인창에 「검진기록 보기」 자체가 없음(이전 조건 `ckupRcdCnt > 0`). 사람 확인 2026-11-23
- 연결 남음: 없음 (백엔드 `9185c8a`는 develop 병합됨, 2026-11-23 확인)

## SCR-HLT-002·003 건강 일지·케어 캘린더 · 작은 결함 3건(뒤로 가기 이름·체중 왼쪽 라벨 잘림·그래프 로딩 칸 높이) — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-003-12·FN-HLT-002-09·10·SCR-HLT-011 대시보드 검사 수치 카드에 걸침
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 케어 항목 관리 폼 ‹ 버튼 이름 「케어 항목 관리로 돌아가기」, 왼쪽 범위 라벨 여백을 라벨 길이 기준(최소 80)으로: 건강 일지 체중 「최소 12.35」·「최대 150.00」이 390·640·1200폭, 대시보드 검사 수치 카드 세 자리 값(「최대 320.5」)이 1200·1440폭에서 안 잘림, 짧은 라벨은 80, 640·1200·1440·390px에서 그래프 로딩 칸과 그래프 높이 같음
- 결정: ② 왼쪽 라벨 여백은 라벨 글자 폭을 화면 글꼴 14px로 재서 `max(80, 폭 + 10 + 4)`, 왼쪽 라벨이 없으면 예전 고정값(64·80). 공용 `components/LineChart.jsx` 변경이라 LJS에게 알림(바뀌는 화면은 건강 일지 체중·대시보드 검사 수치 카드뿐). ③ 스켈레톤은 `@container` + `@max-[600px]:h-[230px]`(Tailwind 4에서 칸 폭 < 600, 그래프의 `width < 600`과 같음. 기획의 599px 표기에서 바꿈). 범위 라벨은 `round2`라 「150.00」은 「150」으로 보여 150.55로 확인
- 결과: 2026-11-23 lint·build 0, 검증 1회차 통과. ② 체중 12.35~150.55 여백 85(390·640·1200·1440), 검사 수치 「최대 320.5」 여백 80, 짧은 라벨 80 ③ 로딩/그래프 390·620·640·900·1200 230/230, 1440 260/260. 사람 확인 2026-11-23
- 연결 남음: 없음

## SCR-HLT-002·003·011 건강기록 · 수정 6건 2026-11-25(오늘 기록하기 꺼 둔 항목 안내·지속 관찰 높이·날짜 상세 빈 상태·투약 한 번 누름 색·최근 케어 기록 정기관리 표시·배변 상태 카드) — 끝

- 기능: 명세 기능 ID 추가 없음. FN-HLT-002-11·13·16~19, FN-HLT-003-12·31, SCR-HLT-011 배변 상태·지속 관찰 카드에 걸침(사람 요청으로 받음, 프론트만)
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 기획 1~6과 추가-1~3의 1440·390 조건
- 1~6: ① 오늘 기록하기 꺼 둔 항목 안내(꺼 둔 항목이 있고 [항목 편집]이 접혀 있을 때만) ② 지속 관찰 상세 칸 높이 ResizeObserver + 0.3초 전환, 1100px 이상 목록은 상세 높이에 맞추고 넘치면 목록만 스크롤 ③ 날짜 상세 일정 0건은 테두리 없는 빈 상태(카드 본문 flex-col, 세로 가운데) ④ 투약 한 번 누름(다 하지 않음) PC bg-brand-50/50·760 미만 border-brand-100 bg-brand-50 ⑤ 최근 케어 기록 R 원 삭제, 정기관리는 bg-brand-100 text-brand-600 원 + 「{주기}마다」(CareList가 항목번호 → getCareCycleName Map) ⑥ 배변 상태 카드 큰 값 삭제, 「마지막 기록 …」
- 추가 요청(사람 요청 2026-11-25): 추가-1 종합 건강기록 지속 관찰 카드 맨 위 「관찰 중 n건」 + 항목 선택창(ObservationCompare, 처음 items[0], 저장 안 함) / 추가-2 오늘 기록하기 종류 탭 대신 켠 항목마다 한 줄(종류·시간·값), 값 넣은 줄만 bulk 한 번 등록, 배변 기본 「선택 안 함」, 푸터 「n개 기록을 입력했어요」·[n개 등록하기], 400 values[n] 칸별 오류, 연속 기록 없음 / 추가-3 오늘의 기록 카드 [오늘 기록 수정하기]·DayRecordEditModal 삭제, 안내 「고치려면 아래 「최근 건강기록」에서 날짜를 눌러 주세요」
- 결정: 추가-1 카드 300px 넘침을 막으려고 「항목명 · 부위」 줄과 사진 칸 mt-3을 뺌(사람 결정 2026-11-25, 선택창이 같은 정보). 추가-2 390은 공용 TimeSelect 최소 폭 때문에 값 칸이 다음 줄로 내려감(가로 넘침 없음), 배변 상태 값 칸은 공용 DropdownSelect라 청록 테두리 없이 바탕만, 지금 이후 시각 안내는 값 넣은 줄만, 0 이하는 넣지 않은 것으로 봄. 단건 등록 훅 `useCreateDailyRecord`·`createDailyRecord`는 쓰는 곳이 없어 삭제. 6번 `BigValue`는 쓰는 곳이 없어 삭제. 공용 components·layouts는 고치지 않음. ※신규 정책(문서는 나중에): 위 1~6·추가-1~3. 고칠 문서: FN-HLT-002-11·13·16~19, FN-HLT-003-12·31, SCR-HLT-002 ④⑤, 종합 건강기록 화면설계서 배변 상태·지속 관찰 카드
- 결과: 2026-11-25 lint·build 0. 검증 1회차 실패(검증 계정 데이터 없음, 3번 flex-col 빠짐) → 2회차 실패(추가-1 카드 넘침) → 3회차 확인 못 함 있음(추가-2 연결 남음뿐). 실제 백엔드(bulk 머지 뒤 재시작)로 식사·배변 2건 등록 → 요청 1번 201·모달 닫힘·오늘의 기록 반영, 산책 121은 화면 검사로 막히고 서버 거절(요청 값을 바꿔 보냄) 400 `values[1].rcdNvl` → 산책 줄 값 칸에만 오류·아무것도 저장 안 됨. 만든 기록은 지움, 프로필 체중 그대로. 사람 확인 2026-11-25
- 연결 남음: 없음

## SCR-HLT-002 건강 일지 · 일상 기록 일괄 등록 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-002-11에 걸침(※신규 정책)
- 기다리는 것: 없음 — 백엔드 「SCR-HLT-002 건강 일지 · 일상 기록 일괄 등록」(끝, 2026-11-25, develop 병합)
- 완료 조건: 오늘 기록하기 저장이 `POST /api/pets/{petSn}/daily-health-records/bulk` 한 번(`{values:[{dailyRcdIdctCd, rcdDt, rcdNvl 또는 crsdSttsCd}]}`, 1~5건, 같은 종류 한 번)이고 201 배열(단건 등록 응답 모양)을 쓴다. 400 `data[].field` `values[n].칸`은 그 칸에, `data` 없는 400(중복·0건·6건 이상)은 메시지만 보여 준다. 하나라도 틀리면 아무것도 저장되지 않는다. 음수량·식사량 상한은 요청 전 프로필 체중 기준
- 이미 바뀐 것: 위 「수정 6건 2026-11-25」 추가-2(`TodayRecordForm.jsx`·`diaryApi.js`·`queries.js`)
- 결과: 2026-11-25 위 절의 실제 서버 확인으로 끝(201·닫힘·반영, 400 `values[n]` 칸 오류·저장 안 됨). `data` 없는 400은 화면에서 생길 수 없는 경우(중복 종류·0건·6건 이상을 화면이 보내지 않음)라 코드 확인으로 갈음: 칸 없는 오류는 토스트(`useBulkCreateDailyRecords` onError). 사람 결정 2026-11-25
- 연결 남음: 없음

## 제외

- AI매니저 FN-AIM-008 참조 대상 반려동물 선택: 화면 SCR-AIM-008 영수증 업로드는 LJS(분배 표 "AIM-008 영수증 업로드")
- AI매니저 FN-AIM-008 참조 촬영 · 파일 선택: 화면 SCR-AIM-008 영수증 업로드는 LJS(분배 표 "AIM-008 영수증 업로드")
- AI매니저 FN-AIM-008 참조 분석 요청: 화면 SCR-AIM-008 영수증 업로드는 LJS(분배 표 "AIM-008 영수증 업로드")
- AI매니저 FN-AIM-008 참조 직접 입력하기: 화면 SCR-AIM-008 영수증 업로드는 LJS(분배 표 "AIM-008 영수증 업로드")

## 대조

- 건강기록(v1.4): 명세 102 = 마일스톤 98 + 제외 4. FN-HLT-003-13·011-06은 결번이라 세지 않음. v1.4 신설 011-11~22·002-47·48은 이미 끝난 마일스톤에 붙임
