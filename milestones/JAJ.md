# JAJ 마일스톤

기준: 건강기록_기능명세서_v1.0_20261014 (DMS, 2026-10-19)

## SCR-HLT-003 케어 캘린더 — 끝

- 기능: FN-HLT-003-29 월간 캘린더, 003-30 일정 종류 태그, 003-31 날짜 클릭 → 인라인 상세, 003-39 표시 반려동물 필터, 003-40 다가오는 케어 일정, 003-01 반려동물 선택 탭, 003-12 토탈 케어리스트, 003-13 메인 표시 ★ 토글, 003-37 반려동물 선택, 003-34 일정 종류, 003-32 날짜 · 시간, 003-35 종류별 추가 필드, 003-36 일정 메모 · 뱃지 색상, 003-33 하단 버튼, 003-21 항목명, 003-22 카테고리 대표 아이콘, 003-23 반복 유형, 003-24 주기, 003-38 마지막으로 한 날
- 기다리는 것: pet 목록·프로필 조회 (SJM), pet 캐릭터 이미지 조회 (LJS), pet 케어미션·포인트 반영 (SJM)
- 완료 조건: 날짜를 누르면 그날 일정이 인라인 상세에 나오고 [＋ 새 일정 등록]으로 모달이 열린다 / 케어 타일을 누르면 완료 토글되고 정기관리 다음 예정일이 다시 계산된다
- 연결 남음: FN-HLT-003-01·39 반려동물 목록 (SJM), 003-01 캐릭터 이미지 (LJS), 003-12 케어미션·포인트 반영 (SJM), 003-29~38·12·13·21~24 일정·케어 API (JAJ 백엔드)

## SCR-HLT-002 건강 일지 — 끝

- 기능: FN-HLT-002-01 반려동물 선택 탭, 002-09 건강기록 변화, 002-10 그래프 원칙 · 조회기간, 002-12 오늘의 기록, 002-11 오늘 기록하기, 002-13 최근 건강기록 (날짜별 표), 002-15 관찰 항목 목록, 002-16 선택 항목 헤더, 002-17 회차별 사진 필름스트립, 002-18 크기 변화 그래프, 002-19 선택 회차 상세, 002-05 검진기록 리스트, 002-14 조회 연도 선택, 002-06 검진 건수 필터 칩, 002-20 관찰 항목, 002-21 관찰 부위, 002-32 관찰일, 002-22 사진 촬영, 002-23 크기 · 변화, 002-24 메모, 002-25 취소 / 저장하기, 002-33 등록 방법 선택, 002-26 반려동물 선택, 002-27 검진일, 002-28 병원명 · 검진 종류, 002-29 검진 내용 · 검진 메모, 002-30 캘린더 연결 안내, 002-31 취소 / 저장하기
- 기다리는 것: pet 목록·프로필 조회 (SJM), pet 캐릭터 이미지 조회 (LJS)
- 완료 조건: 오늘 기록을 추가하면 오늘의 기록 타일·그래프·최근 건강기록 표가 함께 갱신된다 / 검진기록을 직접 입력해 저장하면 새 검진기록의 검진상세로 이동한다
- 연결 남음: FN-HLT-002-01 반려동물 목록 (SJM), 002-01 캐릭터 이미지 (LJS), 002-09~13·15~33 일상 기록·관찰·검진기록 API (JAJ 백엔드)

## SCR-HLT-002 건강 일지 · 영수증 등록 — 끝

- 기능: FN-HLT-002-34 원본 이미지, 002-35 검진일 · 병원명, 002-36 반려동물별 기록 탭, 002-37 검진 종류, 002-38 검진 내용 · 검진 메모, 002-39 금액, 002-40 처방 약품, 002-41 가계부에도 기록, 002-42 영수증 금액 · 할인 배분, 002-45 다시 촬영하기 · 저장하기, 002-43 배정 필요 목록, 002-44 가계부 중복 확인, 002-46 가까운 예정 일정 확인
- API가 남의 것: 002-34~46 영수증 결과 확인 (YAY), 002-41·44 가계부 지출 생성·중복 확인 (SJM)
- 기다리는 것: expense 지출 생성·중복 확인 (SJM), 영수증 인식 (YAY), 영수증 업로드 화면 SCR-AIM-008 (LJS)
- 완료 조건: 영수증으로 등록한 검진기록이 병원 일정에 자동 연결되고 검진상세로 이동한다 / 여러 마리 탭에서 하나라도 실패하면 모두 되돌리고 입력값이 유지된다
- 연결 남음: FN-HLT-002-34~46 영수증 인식 결과 전체 (YAY), 002-41·44 가계부 지출 생성·중복 확인 (SJM), 002-33~46 검진기록 저장·병원 일정 연결 API (JAJ 백엔드). 002-34 원본 이미지(`diary/ReceiptResultStep.jsx` `imgUrl`)는 비공개 파일이라 연결 때 `@/hooks/useFileImage` + `@/components/FileImage`로 `GET /receipts/{recptSn}/image`를 그린다(공통 이미지 코드가 develop에 올라온 뒤)

## SCR-HLT-005 검진상세 — 끝

- 기능: FN-HLT-005-01 기본정보 · 첨부 자료, 005-04 PDF 분석, 005-02 검사 결과 탭 · 검사 종류 칩, 005-03 처방약, 005-05 반복 예방 관리, 005-15 상세 탭, 005-11 검사명, 005-12 검사 결과, 005-13 메모, 005-14 취소 / 저장하기
- 기다리는 것: pet 목록·프로필 조회 (SJM)
- 완료 조건: 탭 4개가 건수와 함께 나오고 처음 열면 검사 결과 탭이 선택된다 / 처방약을 주기 체크 ON으로 저장하면 케어 캘린더 일상관리에 투약 항목이 생긴다
- 연결 남음: FN-HLT-005-01~05·11~15 검진기록·검사 결과·첨부 자료·처방약·반복 예방 API (JAJ 백엔드), 005-04 PDF 분석 호출부 (LJS)

## SCR-HLT-007 검사 수치 입력 — 끝

- 기능: FN-HLT-007-04 분석 결과 검수, 007-05 검사 종류 표시, 007-06 다시 분석 · 직접 입력하기, 007-01 검사 종류, 007-02 검사 항목, 007-03 취소 · 저장하기
- 기다리는 것: 검사결과지 PDF 분석 호출부 (`global/external`, LJS)
- 완료 조건: 참고범위를 한쪽만 입력하면 [저장하기]가 막힌다 / 수정 진입 시 기존 값이 채워지고 저장하면 해당 행이 갱신된다
- 연결 남음: FN-HLT-007-04·05·06 (검사결과지 PDF 분석 호출부, LJS), 007-03 (검사 결과 생성·수정 API, JAJ 백엔드)

## SCR-HLT-011 종합 건강기록 — 끝

- 기능: FN-HLT-011-01 반려동물 선택 탭, 011-02 요약 바, 011-03 건강 이력 타임라인, 011-04 예방 · 정기검진 이력, 011-05 알레르기 · 기저질환, 011-06 검사 결과, 011-07 검사 수치 추이, 011-08 처방 및 투약 이력, 011-09 첨부 자료, 011-10 관찰 기록
- 기다리는 것: pet 목록·프로필 조회 (SJM), pet 캐릭터 이미지 조회 (LJS)
- 완료 조건: 검사 결과 행을 누르면 옆 검사 수치 추이 그래프가 그 항목으로 바뀐다 / 예정 일정이 없으면 "등록된 예정 일정 없음"이 나온다
- 연결 남음: FN-HLT-011-01·02·05·추가-1·5 (반려동물 목록·프로필 `getPets`, 필드 `petSeCd`·`chrcSttsCd`·`petRelCd`와 petSn 통일, SJM), 011-01·추가-5 (캐릭터 이미지·생성 상태, LJS), 011-03~10 (반려동물별 종합 조회·첨부 파일 주소, JAJ 백엔드)

## SCR-HLT-002 건강 일지 · 검진 칩 해제 — 끝

- 기능: FN-HLT-002-06 검진 건수 필터 칩 (재클릭 해제를 [올해 검진]에도 적용)
- 기다리는 것: 없음
- 완료 조건: [올해 검진]·[예방접종] 모두 켜진 칩을 다시 누르면 꺼지고, 둘 다 꺼지면 그해 전체가 나온다
- 연결 남음: 없음

## 공용 · PetFace 올리기 — 끝

- 기능: `features/pet/shared/PetFace.jsx` → `components/PetFace.jsx`, `useCharacterImage` → `hooks/useCharacterImage.js`. props는 `petSn`·`petSeCd`·`chrcSttsCd`와 기존 `className`·`iconClassName`·`alt`·`fallback`
- 기다리는 것: 없음 (담당자 답변으로 확정: 이미지 키는 맞출 필요 없음, PetFace는 `petSn`으로 이미지 자체를 받는다)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 통과 / `features/pet` 밖에서 `PetFace`를 쓸 수 있고 `features/pet`의 네 곳(PetMiniCard·PetSlide·PetProfileCard·InvitationAccept) 표시가 그대로다
- 연결 남음: 1. PetFace 올리기 (캐릭터 얼굴 이미지 실제 응답 GET /pets/{petSn}/character-image, LJS)

## 공용 · 영수증 사용처 키 — 끝

- 기능: 건강 일지 영수증의 "가계부에도 기록"(FN-HLT-002-41)이 병원명을 `dtlMttr`(내용)이 아니라 사용처에 넣는다. 가계부 사용처 키를 `expndPlcNm` → `expndPlcusNm`으로 바꾼다. 내용(`dtlMttr`)은 빈칸
- 기다리는 것: 없음 (담당자 답변으로 확정)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 통과 / 화면: 영수증으로 검진기록을 저장하면 가계부 가짜 목록에 사용처=병원명, 내용=빈칸으로 들어간다
- 연결 남음: 2. 영수증 사용처 키 (가계부 지출 생성·중복 확인 실제 호출, SJM)
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
- 이미 바뀐 것: 백엔드 저장소 SCR-HLT-003 일정 작업(2026-10-26) 중 먼저 고친 파일이 커밋 전으로 남아 있다. `features/health/` `api.js`·`queries.js`·`scheduleTypes.js`·`MonthCalendar.jsx`·`ScheduleDayDetail.jsx`·`ScheduleModal.jsx`·`UpcomingSchedules.jsx`·`diaryApi.js`·`receiptApi.js`·`summaryApi.js`·`diary/CheckupListCard.jsx`·`diary/NearScheduleModal.jsx`, `pages/health/CareCalendarPage.jsx`, `utils/formatDate.js`. 이 마일스톤의 기획은 이 변경을 기준으로 쓰고, 검증·사람 확인 뒤 커밋한다
- 기다리는 것: 백엔드 일정 API (JAJ 백엔드, 백엔드 JAJ 브랜치에서 검증 통과·develop 병합 전)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `http://localhost:5173/health/calendar`에서 API로 등록한 일정이 월간 캘린더·날짜 상세에 코드명·시간 순으로 나오고, 모달의 등록·수정·삭제가 서버에 반영된다
- 그대로 두는 것: 가짜 일정 `fakeSchedules`(건강 일지·종합 건강기록이 쓴다. 그 화면의 백엔드 연결 때 지운다), 가짜 반려동물 목록 (SJM), 뱃지 색상 선택은 HLTG21 코드가 정해질 때까지 숨김
- 연결 남음: 없음 (반려동물 목록은 "케어 캘린더 · 반려동물 목록 연결"에서 끝)

## SCR-HLT-003 케어 캘린더 · 반려동물 목록 연결 — 끝

- 기능: 케어 캘린더의 가짜 반려동물 목록을 실제 `GET /pets`(SJM `PetSummary`)로 교체 (명세 기능 ID 추가 없음, FN-HLT-003-01·29·31·37·39·40에 걸침). 건강 일지·검진상세·종합 건강기록의 가짜 목록은 그대로 둔다
- 기다리는 것: 없음 (백엔드 develop에 있음)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `http://localhost:5173/health/calendar`의 필터 칩·날짜 상세·다가오는 일정·일정 모달·케어리스트 셀렉트 이름이 DB 이름으로 나온다
- 연결 남음: 없음

## SCR-HLT-002 건강 일지 · 검진기록 API 연결 — 대기

- 함께 바꿀 것(반려동물 목록): 건강 일지는 아직 가짜 `usePets`(`['health', 'pets']`)를 쓴다. 케어 캘린더처럼 실제 `GET /pets`(`useMyPets`)로 바꾼다(건강 일지의 다른 연결에서 이미 바꿨으면 넘어간다). 실제 응답은 `petRelCd`→`brupRoleCd`, `petSpcsCdNm`→`vrtyNm`이고 체중 정상범위·목표·캐릭터 상태가 없다. 건강 일지·검진상세·종합 건강기록이 모두 바뀌면 가짜 `getPets`·`usePets`를 지운다
- 기능: 건강 일지 검진기록 탭의 가짜 응답을 실제 API로 교체 (명세 기능 ID 추가 없음, FN-HLT-002-05·06·14·26~31·46에 걸침). 목록 `GET /pets/{petSn}/checkups?year=&ckupTypeCd=&page=&size=`(`year` 생략 시 전체 연도, 건수는 `totalElements`), 등록 `POST`(선택 `schdlSn` = 옮겨 연결하기), 수정 `PATCH`, 삭제 `DELETE`. 46 확인 창 후보는 `GET /pets/{petSn}/care-schedules`를 검진일 앞뒤 7일·`schdlKndCd=HLTC0057`로 불러 `ckupRcdCnt == 0`인 행 중 가장 가까운 1건을 고른다
- 기다리는 것: 백엔드 검진기록 API (JAJ 백엔드, 백엔드 JAJ 브랜치에서 검증 통과·develop 병합 전), URL 규칙 담당의 상위 키 상세 주소 규칙(docs/routes.md 0장)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 검진기록 탭에서 API로 등록한 검진기록이 연도·종류 칩에 맞게 최신순으로 나오고, 등록·수정·삭제가 서버에 반영되며 삭제 뒤 캘린더 일정은 남는다
- 그대로 두는 것: 영수증 [직접 입력] 경로의 영수증 연결(LJS와 맞춘 뒤)

## SCR-HLT-003 케어 캘린더 · 토탈 케어리스트 API 연결 — 진행

- 기능: 케어리스트 탭의 가짜 응답을 실제 API로 교체 (명세 기능 ID 추가 없음, FN-HLT-003-01·12·13·21~24·38에 걸침). 목록 `GET /pets/{petSn}/care-items`(정기관리 먼저, 상태 배지는 `nxtmPrnmntYmd`로 화면이 계산, 투약 n/N은 `todayCmptnCnt`/`dayMdcnNmtm`), 기록 내용 `GET /pets/{petSn}/care-completions?fromYmd=&toYmd=`(완료일 내림차순), 완료 체크 `POST /pets/{petSn}/care-completions`(처음 201, 같은 날 다시 200), 기록 내용 항목 아이콘 취소 `DELETE /pets/{petSn}/care-completions/{careCmptnHstrySn}`(투약도 그날 체크 전부 취소, 한 번만 보낸다), 투약 [마지막 1회 취소] `DELETE /pets/{petSn}/care-items/{careArtclSn}/today-completion/last`(목록 행의 `careArtclSn`만 쓴다, 투약 아니면 400 `INVALID_INPUT_VALUE`, 오늘 기록 없으면 404 `CARE_COMPLETION_NOT_FOUND`). 기록 내용 `GET care-completions`는 투약을 하루 N회 채운 날만 주므로 화면에서 따로 숨기지 않는다. 취소 뒤 목록·기록 내용을 다시 부른다. ★ `PUT /pets/{petSn}/care-item-exposures`(최대 6, 7개면 400 `CARE_ITEM_MAIN_LIMIT_EXCEEDED`), 항목 추가 `POST /pets/{petSn}/care-items`(구역 HLTC0036 일상·HLTC0037 정기, 주기 HLTC0038~0042, 직접입력 일수 `cycleDrctInptDayCnt`), 수정 `PATCH`·삭제 `DELETE /pets/{petSn}/care-items/{careArtclSn}`(기본 항목·처방약 연동 항목은 400)은 `updateCareItem`·`deleteCareItem` API 연결만 하고 UI는 "케어 항목 수정·삭제 UI" 절에서 한다. 아이콘은 Material Symbols 이름(`task_alt` 기본)
- 기다리는 것: 없음 (백엔드 develop에 있음)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `http://localhost:5173/health/calendar` 케어리스트 탭에서 새 반려동물에 기본 항목 11개(양치·빗질·발톱 관리 ★)가 나오고, 완료 토글·기록 내용 취소·★ 토글·항목 추가가 서버에 반영되며 정기관리 예정일이 완료일 + 주기로 바뀐다. 하루 2회 투약 항목을 1회 누르면 1/2회이고 기록 내용에 없으며, 2회 누르면 기록 내용에 1줄 생긴다. [마지막 1회 취소]는 1회씩 내려가고, 기록 내용 아이콘 취소는 요청 1번으로 그날 기록이 사라지며 0/2회가 된다
- 확인할 것: 해결됨. 투약 [마지막 1회 취소]는 완료 기록 번호 없이 새 API `DELETE /pets/{petSn}/care-items/{careArtclSn}/today-completion/last`(성공 200 data 없음, 투약 아니면 400, 오늘 기록 없으면 404)를 쓴다(백엔드 develop `b3389a0`)

## SCR-HLT-005 검진상세 · API 연결 — 대기

- 함께 바꿀 것(반려동물 목록): 검진상세(`pages/health/CheckupDetailPage.jsx`)는 아직 가짜 `usePets`(`['health', 'pets']`)를 쓴다. 케어 캘린더처럼 실제 `GET /pets`(`useMyPets`)로 바꾼다. 실제 응답은 `petRelCd`→`brupRoleCd`, `petSpcsCdNm`→`vrtyNm`이고 체중 정상범위·목표·캐릭터 상태가 없다. 건강 일지·검진상세·종합 건강기록이 모두 바뀌면 가짜 `getPets`·`usePets`를 지운다
- 기능: 검진상세 페이지의 가짜 응답을 실제 API로 교체 (명세 기능 ID 추가 없음, FN-HLT-005-01~05·11~15에 걸침). 기본정보 `GET /pets/{petSn}/checkups/{ckupRcdSn}`(인라인 수정은 `PATCH` 그대로), 첨부 `GET /pets/{petSn}/checkup-attachments?ckupRcdSn=&atchTypeCd=&page=&size=`(Page, 영상검사 칩은 `atchTypeCd=HLTC0064`)·`POST`(multipart `ckupRcdSn`·`file`·`atchTypeCd`·영상 사진이면 `imgKndCd`·`shtRegnCd` 필수)·`PATCH`(multipart 교체)·`DELETE`·파일 `GET …/{ckupRcdAtchSn}`, PDF 분석은 Java API 없이 화면이 검사결과지 PDF를 Python `POST /ai/checkups/lab-results`로 직접 보낸다(백엔드 `143956f`에서 Java `…/analyses` 삭제, 응답 모양은 AI 서버 쪽에서 확인), 혈액검사 `GET /pets/{petSn}/inspection-values?ckupRcdSn=`·선택 삭제 `DELETE ?inspNvlSn=&inspNvlSn=`, 기타검사 `GET/POST/PATCH/DELETE /pets/{petSn}/etc-inspections`, 처방약 `GET/POST/PATCH/DELETE /pets/{petSn}/prescriptions`(복용중 우선, `careRfltYn` 미전송은 OFF), 반복 예방 `GET/POST/DELETE /pets/{petSn}/repeat-preventions`. 목록 API는 모두 `ckupRcdSn` 필수. 탭 건수는 각 목록 길이로 센다
- 기다리는 것: 백엔드 검진상세 API (JAJ 백엔드, 백엔드 JAJ 브랜치에서 검증 통과·develop 병합 전)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 검진상세에서 탭 4개 건수가 API 결과와 맞고, 첨부 등록·교체·삭제와 기타검사·처방약·반복 예방 저장이 서버에 반영되며, 주기 체크 ON 처방약 저장 뒤 케어 캘린더 일상관리에 투약 항목이 생긴다
- 그대로 두는 것: [＋ 검사 수치 추가] 저장(백엔드 SCR-HLT-007 뒤)
- 이미지 표시: 첨부·영상 결과(`checkup/ImagingResultList.jsx`)는 비공개 파일이라 `publicFileUrl`이 아니라 `@/hooks/useFileImage` + `@/components/FileImage`로 `GET /pets/{petSn}/checkup-attachments/{ckupRcdAtchSn}`을 그린다(공통 이미지 코드가 develop에 올라온 뒤). 등록 전 로컬 미리보기(`createObjectURL`)는 그대로 둔다

## SCR-HLT-007 검사 수치 입력 · API 연결 — 대기

- 기능: 검사 수치 입력 페이지와 검진상세 [＋ 검사 수치 추가]의 가짜 저장을 실제 API로 교체 (명세 기능 ID 추가 없음, FN-HLT-007-01~06에 걸침). 저장 `POST /pets/{petSn}/inspection-values`(본문 `ckupRcdSn`·`values[]`: `inspArtclCd`(HLTG12) 또는 `inspArtclDrctInptNm`(직접입력), `rsltNvl`·`unitNm` 필수, 참고범위 하한·상한은 둘 다 또는 둘 다 비움, 201, `data`는 실제 저장·복구된 행만 — 보낸 항목 중 빠진 것으로 "이미 등록된 항목입니다: …" 안내), 수정 `PATCH /pets/{petSn}/inspection-values/{inspNvlSn}`(보낸 필드만, 항목 변경 불가). 분석 검수는 Python `POST /ai/checkups/lab-results` 결과로 하고, 이미 등록된 항목 표시는 화면이 `GET /pets/{petSn}/inspection-values?ckupRcdSn=`와 비교한다(Java `…/analyses`의 `registered`·`excludedArtclNms`는 없어짐, 저장 때도 서버가 중복을 빼고 응답 `data`에 남은 행만 준다). SDMA는 공통코드 `HLTC0078`(HLTG12)로 보낸다
- 기다리는 것: 백엔드 검사 수치 저장·수정 API (JAJ 백엔드, 백엔드 JAJ 브랜치에서 검증 통과·develop 병합 전)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 검사 수치 입력에서 저장하면 검진상세 혈액검사 탭에 반영되고, 이미 있는 항목은 안내 후 빠지며, 항목명 클릭 수정 진입 시 저장하면 새 행 없이 그 행이 바뀐다

## SCR-HLT-002 건강 일지 · 일상 기록 API 연결 — 대기

- 함께 바꿀 것(반려동물 목록): 건강 일지는 아직 가짜 `usePets`(`['health', 'pets']`)를 쓴다. 케어 캘린더처럼 실제 `GET /pets`(`useMyPets`)로 바꾼다(건강 일지의 다른 연결에서 이미 바꿨으면 넘어간다). 실제 응답은 `petRelCd`→`brupRoleCd`, `petSpcsCdNm`→`vrtyNm`이고 체중 정상범위·목표·캐릭터 상태가 없다. 건강 일지·검진상세·종합 건강기록이 모두 바뀌면 가짜 `getPets`·`usePets`를 지운다
- 기능: 건강기록 변화 탭의 반려동물 드롭다운·그래프·오늘의 기록 카드·[오늘 기록추가] 입력 영역·최근 건강기록 표·상세 기록 모달 인라인 수정·삭제를 실제 API로 연결 (명세 기능 ID 추가 없음, FN-HLT-002-01·09~13에 걸침). 목록 `GET /pets/{petSn}/daily-health-records?dailyRcdIdctCd=&fromYmd=&toYmd=&size=`(size 1~100이면 최신 N건, 결과는 항상 `rcdDt` 오름차순, 서버는 날짜별로 묶지 않음 — 그래프는 `size=14`로 받은 뒤 가장 이른 날짜를 `fromYmd`로 한 번 더 불러 하루 합계를 맞춘다), 등록 `POST`(배변상태 HLTC0017은 `crsdSttsCd`(HLTG10)만, 그 밖은 `rcdNvl`만, 201), 수정 `PATCH …/{dailyHlthRcdSn}`(보낸 값만, 지표와 안 맞는 필드는 400), 삭제 `DELETE …/{dailyHlthRcdSn}`. 반려동물 목록은 `GET /pets`
- 기다리는 것: 백엔드 일상 건강기록 API (JAJ 백엔드, 백엔드 JAJ 브랜치에서 검증·사람 확인 끝, develop 병합 전)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 오늘 기록추가로 저장하면 오늘의 기록 카드·그래프·최근 건강기록 표에 바로 반영되고, 상세 기록 모달에서 한 줄을 고치거나 지우면 세 곳이 함께 바뀐다

## SCR-HLT-002 건강 일지 · 지속 관찰 API 연결 — 대기

- 함께 바꿀 것(반려동물 목록): 건강 일지는 아직 가짜 `usePets`(`['health', 'pets']`)를 쓴다. 케어 캘린더처럼 실제 `GET /pets`(`useMyPets`)로 바꾼다(건강 일지의 다른 연결에서 이미 바꿨으면 넘어간다). 실제 응답은 `petRelCd`→`brupRoleCd`, `petSpcsCdNm`→`vrtyNm`이고 체중 정상범위·목표·캐릭터 상태가 없다. 건강 일지·검진상세·종합 건강기록이 모두 바뀌면 가짜 `getPets`·`usePets`를 지운다
- 기능: 지속 관찰 탭의 관찰 항목 목록·선택 항목 헤더·[관찰 종료]·회차별 사진 필름스트립·크기 변화 그래프·선택 회차 상세(수정·삭제)·관찰 기록 등록 모달 A(새 항목)/B(회차 추가)를 실제 API로 연결 (명세 기능 ID 추가 없음, FN-HLT-002-15~25·32에 걸침). 목록 `GET /pets/{petSn}/observation-items?obsrvSttsCd=`(firstCycle·lastCycle·cyclCnt·lastSzDiff, 관찰중 먼저), 종료 `POST …/observation-items/{obsrvArtclSn}/end`, 회차 `GET /pets/{petSn}/observation-cycles?obsrvArtclSn=`(관찰일 오름차순, cyclNo는 서버가 매김), 사진 `GET …/observation-cycles/{obsrvCyclSn}/photo`(원본, 썸네일 없음), 모달 A `POST /pets/{petSn}/observation-items`(multipart, 201), 모달 B `POST /pets/{petSn}/observation-cycles`(multipart, 종료 항목은 400 OBSERVATION_ITEM_ENDED), 수정 `PATCH …/observation-cycles/{obsrvCyclSn}`(multipart, 보낸 값만), 삭제 `DELETE …/observation-cycles/{obsrvCyclSn}`(마지막 회차를 지우면 항목도 사라짐). 그래프·증감은 화면이 계산
- 기다리는 것: 백엔드 지속 관찰 API (JAJ 백엔드, 백엔드 JAJ 브랜치에서 검증·사람 확인 끝, develop 병합 전)
- 이미지 표시: 회차 사진(`diary/ObservationCard.jsx`·`ObservationDetail.jsx`·`ObservationMobile.jsx`)은 비공개 파일이라 `@/hooks/useFileImage` + `@/components/FileImage`로 `GET …/observation-cycles/{obsrvCyclSn}/photo`를 그린다(공통 이미지 코드가 develop에 올라온 뒤). 모달의 로컬 미리보기(`ObservationModal.jsx` `createObjectURL`)는 그대로 둔다
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 모달 A로 항목을 등록하면 목록과 필름스트립에 1회차가 나오고, 모달 B로 회차를 추가·삭제하면 필름스트립·그래프·회차 번호가 함께 바뀌며, [관찰 종료] 뒤 항목이 목록 끝으로 가고 회차 추가가 막힌다

## SCR-HLT-011 종합 건강기록 · API 연결 — 대기

- 함께 바꿀 것(반려동물 목록): 종합 건강기록은 아직 가짜 `usePets`(`['health', 'pets']`)를 쓴다. 케어 캘린더처럼 실제 `GET /pets`(`useMyPets`)로 바꾼다. 실제 응답은 `petRelCd`→`brupRoleCd`, `petSpcsCdNm`→`vrtyNm`이고 체중 정상범위·목표·캐릭터 상태가 없다. 건강 일지·검진상세·종합 건강기록이 모두 바뀌면 가짜 `getPets`·`usePets`를 지운다
- 기능: 종합 건강기록 화면 전체를 실제 API로 연결 (명세 기능 ID 추가 없음, FN-HLT-011-01~10에 걸침). 반려동물 탭 `GET /pets`, 요약 바·알레르기·기저질환 `GET /pets/{petSn}`(`petBdwg`·`algyCn`·`dssCn`) + 최신 체중 `GET /pets/{petSn}/daily-health-records?dailyRcdIdctCd=<체중>&size=1`(없으면 `petBdwg`) + 최근 검진 `GET /pets/{petSn}/checkups?size=1`, 타임라인 `GET /pets/{petSn}/checkups?size=5` + `GET /pets/{petSn}/repeat-preventions`(`ckupRcdSn` 생략 → 반려동물 전체, 시작일 최신순, `hsptlNm` 포함. 시작일이 오늘 이후인 것 제외·5건 병합·같은 날짜면 검진기록 먼저는 화면), 예방·정기검진 `GET …/checkups?ckupTypeCd=` + `GET …/care-schedules?fromYmd=<오늘>&schdlKndCd=<병원>&ckupTypeCd=&size=1`, 검사 결과·추이 `GET /pets/{petSn}/inspection-values`(`ckupRcdSn` 생략 → 전체, 검진일 오름차순·`schdlDt` 채움. 최근 1회차·기본 항목은 화면), 처방 `GET /pets/{petSn}/prescriptions`(`ckupRcdSn` 생략 → 전체, 복용중 우선·최신순), 첨부 `GET /pets/{petSn}/checkup-attachments?size=4`(`ckupRcdSn` 생략 → 전체, 최신순), 관찰 `GET …/observation-items?obsrvSttsCd=<관찰중>` + 사진 `GET …/observation-cycles/{obsrvCyclSn}/photo`
- 기다리는 것: 백엔드 종합 건강기록 전체 조회 (JAJ 백엔드, 백엔드 JAJ 브랜치에서 검증·사람 확인 끝, develop 병합 전)
- 이미지 표시: 첨부(`summary/AttachmentStrip.jsx`·`PhotoModal.jsx`)와 관찰 사진(`summary/ObservationSummaryCard.jsx`)은 비공개 파일이라 `@/hooks/useFileImage` + `@/components/FileImage`로 그린다(공통 이미지 코드가 develop에 올라온 뒤). 캐릭터 이미지(`summary/SummaryHero.jsx` `chrctrImgPath`)는 공개 파일이면 `@/utils/fileUrl`의 `publicFileUrl(atchFileSn)`을 쓴다 — 응답이 경로를 주는지 `atchFileSn`을 주는지 연결 때 확인한다
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 요약 바 몸무게가 최신 일상기록 체중이고 없으면 프로필 체중, 다음 예정일이 오늘 이후 가장 가까운 같은 유형 병원 일정, 타임라인 반복 예방에 출처 병원명이 나오고, 검사 수치 추이가 검진일 순서로 그려진다

## SCR-HLT-003 케어 캘린더 · 케어 항목 수정·삭제 UI — 대기

- 기능: 토탈 케어리스트에서 사용자가 추가한 항목을 수정·삭제하는 UI (명세 기능 ID 추가 없음, FN-HLT-003-12 "사용자가 추가한 항목만 직접 수정·삭제"·"정기관리 기본 항목은 주기만 변경"에 걸침). API는 "토탈 케어리스트 API 연결" 절에서 연결한 `updateCareItem`(`PATCH /pets/{petSn}/care-items/{careArtclSn}`)·`deleteCareItem`(`DELETE …`)을 쓴다. 지금 화면·시안(`html/hlt-calendar.html`)에 수정·삭제 버튼과 모달이 없다
- 기다리는 것: 화면설계서 갱신(수정·삭제 진입 위치와 모달), 이 파일의 "SCR-HLT-003 케어 캘린더 · 토탈 케어리스트 API 연결"
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 사용자가 추가한 항목은 이름·아이콘·구역·주기를 고치고 지울 수 있고, 기본 정기관리 항목은 주기만 고칠 수 있으며, 기본 항목·처방약 연동 항목에는 삭제가 없다(갱신된 화면설계서 기준으로 다시 맞춘다)

## 제외

- AI매니저 FN-AIM-008 참조 대상 반려동물 선택: 화면 SCR-AIM-008 영수증 업로드는 LJS(분배 표 "AIM-008 영수증 업로드")
- AI매니저 FN-AIM-008 참조 촬영 · 파일 선택: 화면 SCR-AIM-008 영수증 업로드는 LJS(분배 표 "AIM-008 영수증 업로드")
- AI매니저 FN-AIM-008 참조 분석 요청: 화면 SCR-AIM-008 영수증 업로드는 LJS(분배 표 "AIM-008 영수증 업로드")
- AI매니저 FN-AIM-008 참조 직접 입력하기: 화면 SCR-AIM-008 영수증 업로드는 LJS(분배 표 "AIM-008 영수증 업로드")

## 대조

- 건강기록: 명세 90 = 마일스톤 86 + 제외 4
