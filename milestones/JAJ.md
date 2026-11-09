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

## SCR-HLT-002 건강 일지 · 검진기록 API 연결 — 끝

- 함께 바꿀 것(반려동물 목록): 건강 일지는 아직 가짜 `usePets`(`['health', 'pets']`)를 쓴다. 케어 캘린더처럼 실제 `GET /pets`(`useMyPets`)로 바꾼다(건강 일지의 다른 연결에서 이미 바꿨으면 넘어간다). 실제 응답은 `petRelCd`→`brupRoleCd`, `petSpcsCdNm`→`vrtyNm`이고 체중 정상범위·목표·캐릭터 상태가 없다. 건강 일지·검진상세·종합 건강기록이 모두 바뀌면 가짜 `getPets`·`usePets`를 지운다
- 기능: 건강 일지 검진기록 탭의 가짜 응답을 실제 API로 교체 (명세 기능 ID 추가 없음, FN-HLT-002-05·06·14·26~31·46에 걸침). 목록 `GET /pets/{petSn}/checkups?year=&ckupTypeCd=&page=&size=`(`year` 생략 시 전체 연도, 건수는 `totalElements`), 등록 `POST`(선택 `schdlSn` = 옮겨 연결하기), 수정 `PATCH`, 삭제 `DELETE`. 46 확인 창 후보는 `GET /pets/{petSn}/care-schedules`를 검진일 앞뒤 7일·`schdlKndCd=HLTC0057`로 불러 `ckupRcdCnt == 0`인 행 중 가장 가까운 1건을 고른다
- 기다리는 것: 백엔드 검진기록 API (JAJ 백엔드, 백엔드 JAJ 브랜치에서 검증 통과·develop 병합 전). 상위 키 상세 주소는 경로 방식으로 정해짐(2026-10-31, 핸드오프 "결정")
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 검진기록 탭에서 API로 등록한 검진기록이 연도·종류 칩에 맞게 최신순으로 나오고, 등록·수정·삭제가 서버에 반영되며 삭제 뒤 캘린더 일정은 남는다
- 그대로 두는 것: 영수증 [직접 입력] 경로의 영수증 연결(LJS와 맞춘 뒤)
- 연결 남음: 없음 (영수증 번호 연결은 "그대로 두는 것", 영수증 저장의 처방 약품·가계부는 SJM 가계부 연결에 남음)

## SCR-HLT-003 케어 캘린더 · 토탈 케어리스트 API 연결 — 끝

- 기능: 케어리스트 탭의 가짜 응답을 실제 API로 교체 (명세 기능 ID 추가 없음, FN-HLT-003-01·12·13·21~24·38에 걸침). 목록 `GET /pets/{petSn}/care-items`(정기관리 먼저, 상태 배지는 `nxtmPrnmntYmd`로 화면이 계산, 투약 n/N은 `todayCmptnCnt`/`dayMdcnNmtm`), 기록 내용 `GET /pets/{petSn}/care-completions?fromYmd=&toYmd=`(완료일 내림차순), 완료 체크 `POST /pets/{petSn}/care-completions`(처음 201, 같은 날 다시 200), 기록 내용 항목 아이콘 취소 `DELETE /pets/{petSn}/care-completions/{careCmptnHstrySn}`(투약도 그날 체크 전부 취소, 한 번만 보낸다), 투약 [마지막 1회 취소] `DELETE /pets/{petSn}/care-items/{careArtclSn}/today-completion/last`(목록 행의 `careArtclSn`만 쓴다, 투약 아니면 400 `INVALID_INPUT_VALUE`, 오늘 기록 없으면 404 `CARE_COMPLETION_NOT_FOUND`). 기록 내용 `GET care-completions`는 투약을 하루 N회 채운 날만 주므로 화면에서 따로 숨기지 않는다. 취소 뒤 목록·기록 내용을 다시 부른다. ★ `PUT /pets/{petSn}/care-item-exposures`(최대 6, 7개면 400 `CARE_ITEM_MAIN_LIMIT_EXCEEDED`), 항목 추가 `POST /pets/{petSn}/care-items`(구역 HLTC0036 일상·HLTC0037 정기, 주기 HLTC0038~0042, 직접입력 일수 `cycleDrctInptDayCnt`), 수정 `PATCH`·삭제 `DELETE /pets/{petSn}/care-items/{careArtclSn}`(기본 항목·처방약 연동 항목은 400)은 `updateCareItem`·`deleteCareItem` API 연결만 하고 UI는 "케어 항목 수정·삭제 UI" 절에서 한다. 아이콘은 Material Symbols 이름(`task_alt` 기본)
- 기다리는 것: 없음 (백엔드 develop에 있음)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `http://localhost:5173/health/calendar` 케어리스트 탭에서 새 반려동물에 기본 항목 11개(양치·빗질·발톱 관리 ★)가 나오고, 완료 토글·기록 내용 취소·★ 토글·항목 추가가 서버에 반영되며 정기관리 예정일이 완료일 + 주기로 바뀐다. 하루 2회 투약 항목을 1회 누르면 1/2회이고 기록 내용에 없으며, 2회 누르면 기록 내용에 1줄 생긴다. [마지막 1회 취소]는 1회씩 내려가고, 기록 내용 아이콘 취소는 요청 1번으로 그날 기록이 사라지며 0/2회가 된다
- 확인할 것: 해결됨. 투약 [마지막 1회 취소]는 완료 기록 번호 없이 새 API `DELETE /pets/{petSn}/care-items/{careArtclSn}/today-completion/last`(성공 200 data 없음, 투약 아니면 400, 오늘 기록 없으면 404)를 쓴다(백엔드 develop `b3389a0`)
- 연결 남음: 없음

## SCR-HLT-005 검진상세 · API 연결 — 끝

- 함께 바꿀 것(반려동물 목록): 검진상세(`pages/health/CheckupDetailPage.jsx`)는 아직 가짜 `usePets`(`['health', 'pets']`)를 쓴다. 케어 캘린더처럼 실제 `GET /pets`(`useMyPets`)로 바꾼다. 실제 응답은 `petRelCd`→`brupRoleCd`, `petSpcsCdNm`→`vrtyNm`이고 체중 정상범위·목표·캐릭터 상태가 없다. 건강 일지·검진상세·종합 건강기록이 모두 바뀌면 가짜 `getPets`·`usePets`를 지운다
- 기능: 검진상세 페이지의 가짜 응답을 실제 API로 교체 (명세 기능 ID 추가 없음, FN-HLT-005-01~05·11~15에 걸침). 기본정보 `GET /pets/{petSn}/checkups/{ckupRcdSn}`(인라인 수정은 `PATCH` 그대로), 첨부 `GET /pets/{petSn}/checkup-attachments?ckupRcdSn=&atchTypeCd=&page=&size=`(Page, 영상검사 칩은 `atchTypeCd=HLTC0064`)·`POST`(multipart `ckupRcdSn`·`file`·`atchTypeCd`·영상 사진이면 `imgKndCd`·`shtRegnCd` 필수)·`PATCH`(multipart 교체)·`DELETE`·파일 `GET …/{ckupRcdAtchSn}`, PDF 분석은 Java API 없이 화면이 검사결과지 PDF를 Python `POST /ai/checkups/lab-results`로 직접 보낸다(백엔드 `143956f`에서 Java `…/analyses` 삭제, 응답 모양은 AI 서버 쪽에서 확인), 혈액검사 `GET /pets/{petSn}/inspection-values?ckupRcdSn=`·선택 삭제 `DELETE ?inspNvlSn=&inspNvlSn=`, 기타검사 `GET/POST/PATCH/DELETE /pets/{petSn}/etc-inspections`, 처방약 `GET/POST/PATCH/DELETE /pets/{petSn}/prescriptions`(복용중 우선, `careRfltYn` 미전송은 OFF), 반복 예방 `GET/POST/DELETE /pets/{petSn}/repeat-preventions`. 목록 API는 모두 `ckupRcdSn` 필수. 탭 건수는 각 목록 길이로 센다
- 기다리는 것: 백엔드 검진상세 API (JAJ 백엔드, 백엔드 JAJ 브랜치에서 검증 통과·develop 병합 전)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 검진상세에서 탭 4개 건수가 API 결과와 맞고, 첨부 등록·교체·삭제와 기타검사·처방약·반복 예방 저장이 서버에 반영되며, 주기 체크 ON 처방약 저장 뒤 케어 캘린더 일상관리에 투약 항목이 생긴다
- 그대로 두는 것: [＋ 검사 수치 추가] 저장(백엔드 SCR-HLT-007 뒤)
- 이미지 표시: 첨부·영상 결과(`checkup/ImagingResultList.jsx`)는 비공개 파일이라 `publicFileUrl`이 아니라 `@/hooks/useFileImage` + `@/components/FileImage`로 `GET /pets/{petSn}/checkup-attachments/{ckupRcdAtchSn}`을 그린다(공통 이미지 코드가 develop에 올라온 뒤). 등록 전 로컬 미리보기(`createObjectURL`)는 그대로 둔다
- 추가 요청: 추가-1 첨부 목록 요청 `page=1&size=50`(서버 페이지는 1부터, 최대 50)
- 연결 남음: 없음 (검사 수치 저장·수정·PDF 분석은 SCR-HLT-007 · API 연결)

## SCR-HLT-007 검사 수치 입력 · API 연결 — 끝

- 기능: 검사 수치 입력 페이지와 검진상세 [＋ 검사 수치 추가]의 가짜 저장을 실제 API로 교체 (명세 기능 ID 추가 없음, FN-HLT-007-01~06에 걸침). 저장 `POST /pets/{petSn}/inspection-values`(본문 `ckupRcdSn`·`values[]`: `inspArtclCd`(HLTG12) 또는 `inspArtclDrctInptNm`(직접입력), `rsltNvl`·`unitNm` 필수, 참고범위 하한·상한은 둘 다 또는 둘 다 비움, 201, `data`는 실제 저장·복구된 행만 — 보낸 항목 중 빠진 것으로 "이미 등록된 항목입니다: …" 안내), 수정 `PATCH /pets/{petSn}/inspection-values/{inspNvlSn}`(보낸 필드만, 항목 변경 불가). 분석 검수는 Python `POST /ai/checkups/lab-results` 결과로 하고, 이미 등록된 항목 표시는 화면이 `GET /pets/{petSn}/inspection-values?ckupRcdSn=`와 비교한다(Java `…/analyses`의 `registered`·`excludedArtclNms`는 없어짐, 저장 때도 서버가 중복을 빼고 응답 `data`에 남은 행만 준다). SDMA는 공통코드 `HLTC0078`(HLTG12)로 보낸다
- 기다리는 것: 없음 (백엔드 검사 수치 저장·수정 API는 develop에 머지됨, PR #83)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 검사 수치 입력에서 저장하면 검진상세 혈액검사 탭에 반영되고, 이미 있는 항목은 안내 후 빠지며, 항목명 클릭 수정 진입 시 저장하면 새 행 없이 그 행이 바뀐다
- 결정: 수정 화면에서 기존 참고범위를 둘 다 비우면 "참고범위는 수정에서 지울 수 없어요"로 막는다(서버 PATCH가 `null`을 "안 바꿈"으로 받음). SDMA는 `HLTC0078`
- 연결 남음: FN-HLT-007-02·03 수정 (백엔드 연결 `PATCH /pets/{petSn}/inspection-values/{inspNvlSn}` 참고범위 비우기, 백엔드 저장소에서 /start)
- 연결 남음: FN-HLT-007-04·06 (검사결과지 PDF 분석 호출부, LJS. `checkupApi.js` `analyzeLabPdf` 가짜)

## SCR-HLT-002 건강 일지 · 일상 기록 API 연결 — 끝

- 함께 바꿀 것(반려동물 목록): 건강 일지는 아직 가짜 `usePets`(`['health', 'pets']`)를 쓴다. 케어 캘린더처럼 실제 `GET /pets`(`useMyPets`)로 바꾼다(건강 일지의 다른 연결에서 이미 바꿨으면 넘어간다). 실제 응답은 `petRelCd`→`brupRoleCd`, `petSpcsCdNm`→`vrtyNm`이고 체중 정상범위·목표·캐릭터 상태가 없다. 건강 일지·검진상세·종합 건강기록이 모두 바뀌면 가짜 `getPets`·`usePets`를 지운다
- 기능: 건강기록 변화 탭의 반려동물 드롭다운·그래프·오늘의 기록 카드·[오늘 기록추가] 입력 영역·최근 건강기록 표·상세 기록 모달 인라인 수정·삭제를 실제 API로 연결 (명세 기능 ID 추가 없음, FN-HLT-002-01·09~13에 걸침). 목록 `GET /pets/{petSn}/daily-health-records?dailyRcdIdctCd=&fromYmd=&toYmd=&size=`(size 1~100이면 최신 N건, 결과는 항상 `rcdDt` 오름차순, 서버는 날짜별로 묶지 않음 — 그래프는 `size=14`로 받은 뒤 가장 이른 날짜를 `fromYmd`로 한 번 더 불러 하루 합계를 맞춘다), 등록 `POST`(배변상태 HLTC0017은 `crsdSttsCd`(HLTG10)만, 그 밖은 `rcdNvl`만, 201), 수정 `PATCH …/{dailyHlthRcdSn}`(보낸 값만, 지표와 안 맞는 필드는 400), 삭제 `DELETE …/{dailyHlthRcdSn}`. 반려동물 목록은 `GET /pets`
- 기다리는 것: 없음 (백엔드 일상 건강기록 API는 develop에 머지됨, `2294375`)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 오늘 기록추가로 저장하면 오늘의 기록 카드·그래프·최근 건강기록 표에 바로 반영되고, 상세 기록 모달에서 한 줄을 고치거나 지우면 세 곳이 함께 바뀐다
- 결정: 반려동물 목록은 이미 실제 `useMyPets`였다. 일상 기록 가짜는 `getFakeDailyRecords`로 종합 건강기록 전용으로 남김(011 연결 때 지움), `?fakeDaily=`는 다른 가짜가 써서 남김
- 연결 남음: 없음

## SCR-HLT-002 건강 일지 · 지속 관찰 API 연결 — 끝

- 함께 바꿀 것(반려동물 목록): 건강 일지는 아직 가짜 `usePets`(`['health', 'pets']`)를 쓴다. 케어 캘린더처럼 실제 `GET /pets`(`useMyPets`)로 바꾼다(건강 일지의 다른 연결에서 이미 바꿨으면 넘어간다). 실제 응답은 `petRelCd`→`brupRoleCd`, `petSpcsCdNm`→`vrtyNm`이고 체중 정상범위·목표·캐릭터 상태가 없다. 건강 일지·검진상세·종합 건강기록이 모두 바뀌면 가짜 `getPets`·`usePets`를 지운다
- 기능: 지속 관찰 탭의 관찰 항목 목록·선택 항목 헤더·[관찰 종료]·회차별 사진 필름스트립·크기 변화 그래프·선택 회차 상세(수정·삭제)·관찰 기록 등록 모달 A(새 항목)/B(회차 추가)를 실제 API로 연결 (명세 기능 ID 추가 없음, FN-HLT-002-15~25·32에 걸침). 목록 `GET /pets/{petSn}/observation-items?obsrvSttsCd=`(firstCycle·lastCycle·cyclCnt·lastSzDiff, 관찰중 먼저), 종료 `POST …/observation-items/{obsrvArtclSn}/end`, 회차 `GET /pets/{petSn}/observation-cycles?obsrvArtclSn=`(관찰일 오름차순, cyclNo는 서버가 매김), 사진 `GET …/observation-cycles/{obsrvCyclSn}/photo`(원본, 썸네일 없음), 모달 A `POST /pets/{petSn}/observation-items`(multipart, 201), 모달 B `POST /pets/{petSn}/observation-cycles`(multipart, 종료 항목은 400 OBSERVATION_ITEM_ENDED), 수정 `PATCH …/observation-cycles/{obsrvCyclSn}`(multipart, 보낸 값만), 삭제 `DELETE …/observation-cycles/{obsrvCyclSn}`(마지막 회차를 지우면 항목도 사라짐). 그래프·증감은 화면이 계산
- 기다리는 것: 백엔드 지속 관찰 API (JAJ 백엔드, 백엔드 JAJ 브랜치에서 검증·사람 확인 끝, develop 병합 전)
- 이미지 표시: 회차 사진(`diary/ObservationCard.jsx`·`ObservationDetail.jsx`·`ObservationMobile.jsx`)은 비공개 파일이라 `@/hooks/useFileImage` + `@/components/FileImage`로 `GET …/observation-cycles/{obsrvCyclSn}/photo`를 그린다(공통 이미지 코드가 develop에 올라온 뒤). 모달의 로컬 미리보기(`ObservationModal.jsx` `createObjectURL`)는 그대로 둔다
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 모달 A로 항목을 등록하면 목록과 필름스트립에 1회차가 나오고, 모달 B로 회차를 추가·삭제하면 필름스트립·그래프·회차 번호가 함께 바뀌며, [관찰 종료] 뒤 항목이 목록 끝으로 가고 회차 추가가 막힌다
- 결정: 백엔드 API는 develop에 머지돼 있었다. 반려동물 목록은 이미 실제 `useMyPets`. 부위·변화·상태는 공통코드 HLTC0043~0056. 관찰 가짜는 `getFakeObservations`로 종합 건강기록 전용으로 남김(011 연결 때 지움). 추가-1 모바일 회차 사진도 오래된 회차부터 왼→오른쪽(처음엔 오른쪽 끝), 추가-2 삭제·등록·종료 때 사진은 다시 받지 않고 사진을 바꾼 수정만 다시 받음(지운 직후 404 없앰)
- 연결 남음: FN-HLT-002-19·23·24 회차 수정에서 크기·메모·변화 비우기 (백엔드 연결 `PATCH /pets/{petSn}/observation-cycles/{obsrvCyclSn}`가 빈 값을 "안 바꿈"으로 받음, 백엔드 저장소에서 /start)

## SCR-HLT-011 종합 건강기록 · API 연결 — 끝

- 함께 바꿀 것(반려동물 목록): 종합 건강기록은 아직 가짜 `usePets`(`['health', 'pets']`)를 쓴다. 케어 캘린더처럼 실제 `GET /pets`(`useMyPets`)로 바꾼다. 실제 응답은 `petRelCd`→`brupRoleCd`, `petSpcsCdNm`→`vrtyNm`이고 체중 정상범위·목표·캐릭터 상태가 없다. 건강 일지·검진상세·종합 건강기록이 모두 바뀌면 가짜 `getPets`·`usePets`를 지운다
- 기능: 종합 건강기록 화면 전체를 실제 API로 연결 (명세 기능 ID 추가 없음, FN-HLT-011-01~10에 걸침). 반려동물 탭 `GET /pets`, 요약 바·알레르기·기저질환 `GET /pets/{petSn}`(`petBdwg`·`algyCn`·`dssCn`) + 최신 체중 `GET /pets/{petSn}/daily-health-records?dailyRcdIdctCd=<체중>&size=1`(없으면 `petBdwg`) + 최근 검진 `GET /pets/{petSn}/checkups?size=1`, 타임라인 `GET /pets/{petSn}/checkups?size=5` + `GET /pets/{petSn}/repeat-preventions`(`ckupRcdSn` 생략 → 반려동물 전체, 시작일 최신순, `hsptlNm` 포함. 시작일이 오늘 이후인 것 제외·5건 병합·같은 날짜면 검진기록 먼저는 화면), 예방·정기검진 `GET …/checkups?ckupTypeCd=` + `GET …/care-schedules?fromYmd=<오늘>&schdlKndCd=<병원>&ckupTypeCd=&size=1`, 검사 결과·추이 `GET /pets/{petSn}/inspection-values`(`ckupRcdSn` 생략 → 전체, 검진일 오름차순·`schdlDt` 채움. 최근 1회차·기본 항목은 화면), 처방 `GET /pets/{petSn}/prescriptions`(`ckupRcdSn` 생략 → 전체, 복용중 우선·최신순), 첨부 `GET /pets/{petSn}/checkup-attachments?size=4`(`ckupRcdSn` 생략 → 전체, 최신순), 관찰 `GET …/observation-items?obsrvSttsCd=<관찰중>` + 사진 `GET …/observation-cycles/{obsrvCyclSn}/photo`
- 기다리는 것: 백엔드 종합 건강기록 전체 조회 (JAJ 백엔드, 백엔드 JAJ 브랜치에서 검증·사람 확인 끝, develop 병합 전)
- 이미지 표시: 첨부(`summary/AttachmentStrip.jsx`·`PhotoModal.jsx`)와 관찰 사진(`summary/ObservationSummaryCard.jsx`)은 비공개 파일이라 `@/hooks/useFileImage` + `@/components/FileImage`로 그린다(공통 이미지 코드가 develop에 올라온 뒤). 캐릭터 이미지(`summary/SummaryHero.jsx` `chrctrImgPath`)는 공개 파일이면 `@/utils/fileUrl`의 `publicFileUrl(atchFileSn)`을 쓴다 — 응답이 경로를 주는지 `atchFileSn`을 주는지 연결 때 확인한다
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 요약 바 몸무게가 최신 일상기록 체중이고 없으면 프로필 체중, 다음 예정일이 오늘 이후 가장 가까운 같은 유형 병원 일정, 타임라인 반복 예방에 출처 병원명이 나오고, 검사 수치 추이가 검진일 순서로 그려진다
- 결정: 백엔드 API는 develop에 머지돼 있었다. 디자인은 `html/hlt-summary.html` 그대로(모양은 바꾸지 않고 서버 키로만 바꿈). `GET /pets`에 캐릭터 상태가 없어 "캐릭터 만들기" 점선 카드를 빼고 `PetFace`로 둠(사람 결정). 건강기록 가짜 반려동물·일상기록·관찰·검진기록·일정·연동 케어 항목 저장소를 지움(PDF 분석·영수증 가짜는 남김)
- 연결 남음: FN-HLT-011-01·02 캐릭터 상태 (`GET /pets`의 `chrcSttsCd`, LJS)

## SCR-HLT-003 케어 캘린더 · 케어 항목 수정·삭제 UI — 끝

- 기능: 토탈 케어리스트에서 사용자가 추가한 항목을 수정·삭제하는 UI (명세 기능 ID 추가 없음, FN-HLT-003-12 "사용자가 추가한 항목만 직접 수정·삭제"·"정기관리 기본 항목은 주기만 변경"에 걸침). API는 "토탈 케어리스트 API 연결" 절에서 연결한 `updateCareItem`(`PATCH /pets/{petSn}/care-items/{careArtclSn}`)·`deleteCareItem`(`DELETE …`)을 쓴다. 지금 화면·시안(`html/hlt-calendar.html`)에 수정·삭제 버튼과 모달이 없다
- 기다리는 것: 화면설계서 갱신(수정·삭제 진입 위치와 모달), 이 파일의 "SCR-HLT-003 케어 캘린더 · 토탈 케어리스트 API 연결"
- 결정: 화면설계서에 진입 근거가 없어 사람이 정함(2026-11-03). 줄 끝 ⋯ 메뉴(마이페이지 가계부 `ExpenseMenu`의 여는 방식·모양을 복사해 `features/health/CareItemMenu.jsx`로 새로 만듦, LJS 파일은 건드리지 않음), 사용자 추가 [수정]·[삭제], 기본 정기관리 [수정]만, 기본 일상관리·연동 항목 ⋯ 없음, 삭제는 메뉴 → `ConfirmModal`, 수정 모달은 [취소]·[수정하기]만
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 사용자가 추가한 항목은 이름·아이콘·구역·주기를 고치고 지울 수 있고, 기본 정기관리 항목은 주기만 고칠 수 있으며, 기본 항목·처방약 연동 항목에는 삭제가 없다(갱신된 화면설계서 기준으로 다시 맞춘다)

## SCR-HLT-011 종합 건강기록 · 캐릭터 상태 연결 — 끝

- 기능: FN-HLT-011-02 요약 바 캐릭터 자리 (FN-HLT-011-01 칩은 그대로). `GET /pixel-characters`(LJS)의 `pixelCharSn`으로 캐릭터 유무를 판정해 주양육·미생성이면 "캐릭터 만들기" 카드
- 기다리는 것: 없음 (`GET /api/pixel-characters`가 백엔드 develop에 있음)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 캐릭터 없는 주양육 반려동물은 히어로에 "캐릭터 만들기" 카드가 나오고 `/mypage/characters`로 가며, 캐릭터 있음·공동양육·조회 실패는 `PetFace`
- 결정: "캐릭터 만들기" 카드를 되살림(디자인 기준), 생성 중·실패는 백엔드 기본 캐릭터 그대로(사람 결정)
- 연결 남음: 없음

## SCR-HLT-007 검사 수치 입력 · 참고범위 비우기 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-007-02·03(참고범위 최소·최대는 둘 다 입력하거나 둘 다 비움)에 걸침. 백엔드 검사 수치 PATCH `PATCH /pets/{petSn}/inspection-values/{inspNvlSn}`가 참고범위를 `refRange` 묶음(`{refLlmtNvl, refUplmtNvl}`)으로 받는다: 안 보내면 유지, 보내면 덮어씀, `{null, null}`이면 비움, 한쪽만 null이거나 최소 > 최대면 400(`data[0].field` `refRange.paired`·`refRange.ordered`). 등록 POST는 평평한 필드 그대로이고 최소 > 최대도 400(필드 목록 없음)
- 기다리는 것: 백엔드 SCR-HLT-007 검사 수치 입력 · 참고범위 비우기 (끝, develop 병합 전이면 병합 뒤)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `LabInput.jsx`·`BloodResultForm.jsx` 수정 저장 때 하한·상한을 `refRange`로 묶어 보내고(빈 칸은 null) "참고범위는 수정에서 지울 수 없어요" 막기를 지워, 저장된 참고범위를 둘 다 비우면 검진상세에서 "참고범위 …" 줄이 사라지고 ▲▼ 표시도 없다. 한쪽만 입력하거나 최소 > 최대이면 저장 전에 막고 최소 > 최대는 "참고범위 최소는 최대보다 클 수 없어요"(`getFormErrors`의 짝 규칙 검사와 같은 자리, 등록·수정 모두). 범위 없으면 ▲▼ 판정 없음, 검사 수치 추이 밴드는 가장 최근 회차 범위이고 없으면 밴드 없음
- 결과: 2026-11-03 검증 2회차 통과(1회차는 로그인 계정이 없어 화면 확인 못 함), 사람 확인 끝. `updateInspection`이 `refRange: { refLlmtNvl, refUplmtNvl }`를 항상 보내고, `LabInput.jsx`·`BloodResultForm.jsx`가 최소 > 최대를 막는다
- 결정: 범위가 없으면 검진상세 "참고범위 …" 줄을 숨기는 기존 동작 그대로, "참고범위 없음" 문구는 더하지 않음(사람 결정). PDF 분석 행은 최소 > 최대 검사를 넣지 않음
- 연결 남음: 없음

## SCR-HLT-002 건강 일지 · 지속 관찰 회차 수정 비우기 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-002-19·23·24(크기·변화·메모는 선택 입력)·22(사진 필수)에 걸침. 백엔드 `PATCH /pets/{petSn}/observation-cycles/{obsrvCyclSn}`(multipart)가 비울 필드 이름을 `clearFields`로 받는다(`obsrvSz`·`obsrvChgCd`·`memoCn`, 반복 키 또는 쉼표). 보내지 않은 칸은 유지, 그 밖의 이름은 400(`data[0].field` `clearFields[i]`), 같은 칸에 값과 비우기를 함께 보내면 400(`clearFieldsDistinct`). 사진은 비울 수 없고 보내면 교체
- 기다리는 것: 백엔드 SCR-HLT-002 건강 일지 · 지속 관찰 회차 수정 비우기 (끝, develop 병합 전이면 병합 뒤)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 회차 수정 모달에서 크기·변화·메모 칸을 비우고 저장하면 `updateObservationCycle`이 그 칸 이름을 `clearFields`로 보내고, 선택 회차 상세에서 그 줄이 숨겨진다(메모는 비어 보임). 손대지 않은 칸은 보내지 않는다. 수정 모달은 기존 사진을 미리보기에 채우고 사진 칸에는 [촬영하기]·[앨범에서 선택]을 그대로 둔다(빼기 없음). 사진 칸 아래 보조 문구 "사진은 바꿀 수만 있어요". 이 문구는 명세에 없는 새 정책이라 기능명세서 FN-HLT-002-22에도 반영한다
- 결과: 2026-11-02 검증 2회차 통과, 사람 확인 끝. 수정 전 회차 값과 비교해 바뀐 값만 보내고 비운 칸은 `clearFields`로 보냄. 1회차는 `obsrvChgCd`를 보내지 않음
- 결정: 디자인 `html/hlt-diary.html`, 수정 모드 사진 버튼 두 개 유지(버튼 정리는 사람이 화면 손볼 때)
- 연결 남음: 없음

## SCR-HLT-007 검사 수치 입력 · PDF 분석 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-005-04(검진상세 첨부 [PDF 분석])·FN-HLT-007-04·05·06(분석 결과 검수·검사 종류 표시·다시 분석·직접 입력하기)에 걸침. `checkupApi.js` `analyzeLabPdf` 가짜를 Python `POST /ai/checkups/lab-results`(LJS, `nyangmeong-ai` develop, `aiApi`)로 바꾼다. 요청은 multipart `file`(PDF, 최대 10MB, 로그인 쿠키 필요)이라 첨부 원본을 `getAttachmentFile`(Blob)로 받아 올린다. 응답 `items[]`는 `inspArtclCd`·`inspArtclDrctInptNm`·`rsltNvl`·`unitNm`·`refLlmtNvl`·`refUplmtNvl`, `excludedArtclNms[]`(가짜의 `inspItmNm`·`rsltVal`·`refMinVal`·`refMaxVal`·`bloodYn`과 다름, 검토 행 `labInput/`을 서버 키로 맞춘다). 오류 `NOT_LAB_RESULT` 422·`PDF_ANALYZE_TIMEOUT` 504·`PDF_ANALYZE_API_ERROR` 502. 가짜 메모리 저장소(`getStore`·시드)와 `?fakeCheckupDetail`을 지운다
- 기다리는 것: 없음 (LJS에게 응답 모양 확정 여부 확인, 로컬 확인에는 AI 서버와 `LLM_API_KEY` 필요)
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
- 연결 남음: 추가-2 (백엔드 연결 `save-check` 저장완료 영수증 409 `RECEIPT_ALREADY_SAVED`, 백엔드 저장소에서 /start)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 영수증 결과 확인에서 저장하면 `save-check` 뒤 `save` 한 번만 요청하고, 검진기록·처방약·가계부 지출(마이페이지 가계부 목록)에 실제로 남는다. 같은 지출이 있으면 중복 안내, 가까운 예정 일정이 있으면 연결 선택이 나온다

## SCR-HLT-002 건강 일지 · 영수증 [직접 입력] 저장 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-002-31(영수증 인식 실패·일시 오류 뒤 [직접 입력]으로 연 검진기록 등록 모달의 저장)에 걸침. 이 경로의 저장을 `POST /pets/{petSn}/checkups` 대신 `POST /api/receipts/{recptSn}/checkups?petSn=`로 보낸다. 요청은 직접 등록 Body(`ckupYmd`·`hsptlNm`·`ckupTypeCd`·`ckupCn`·`ckupMemoCn`·`schdlSn`)에 `idmptDmndId`(모달마다 한 번 만든 값)를 더한다. 응답은 `CheckupResponse`(201, `recptSn` 포함). 업로드 전 [직접 입력하기]로 연 경우는 지금처럼 영수증 연결 없음
- 기다리는 것: 백엔드 SCR-HLT-002 건강 일지 · 영수증 검진기록 연결 (JAJ 백엔드, 끝 2026-11-03)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 미인식 영수증에서 [직접 입력]으로 검진기록을 저장하면 `POST /api/receipts/{recptSn}/checkups?petSn=` 한 번만 요청하고, 그 영수증이 저장완료가 되며 가계부 지출은 생기지 않는다. 409 `RECEIPT_ALREADY_SAVED`(이미 저장됨)·404 `RECEIPT_NOT_FOUND`는 안내를 보인다
- 결과: 2026-11-03 검증 통과(1회차 409·404 토스트가 `<dialog>` 뒤에 가려 안 보임, 2회차 모달 안 상자가 기획과 다름 → 추가-1로 확정 후 잠금을 풀고 다시 검증), 사람 확인 끝
- 추가 요청: 추가-1 409·404 안내를 토스트 대신 모달 안 빨간 안내 상자로(`CheckupModal.jsx`, `queries.js`)
- 연결 남음: FN-HLT-002-31 일시 오류 뒤 [직접 입력]의 영수증 연결 (AI 서버 오류 응답 `recptSn`·업로드 모달, nyangmeong-ai 담당·LJS): AI 서버 영수증 분석 502 `OCR_API_ERROR`·504 시간 초과 응답에 `recptSn`이 없어(원본은 먼저 저장됨) 화면이 `POST /pets/{petSn}/checkups`로 저장한다(FN-HLT-002-31 "인식 실패·일시 오류"와 다름). 필요: AI 서버가 오류 응답에 `recptSn`을 준다(nyangmeong-ai 저장소에서 /start), LJS `features/ai/receipt/ReceiptUploadModal.jsx`가 오류 때도 `recptSn`을 [직접 입력]에 넘긴다. 백엔드는 일시 오류 영수증 저장을 이미 받고, `CheckupModal`은 `recptSn`만 받으면 영수증 경로로 저장한다. 브라우저 쪽 시간 초과(요청 중단)는 번호를 알 수 없어 남는다

## SCR-HLT-002 건강 일지 · 영수증 일시 오류 [직접 입력] 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-002-31(영수증 일시 오류 뒤 [직접 입력] 저장의 영수증 연결)에 걸침. `ReceiptUploadModal.jsx`가 AI 서버 오류 응답 `data.recptSn`을 [직접 입력]에 넘겨 `CheckupModal`이 영수증 경로로 저장한다. `onManualInput` 키 `rcptSn` → `recptSn`
- 기다리는 것: AI 서버 영수증 분석 오류 응답 `data.recptSn` (nyangmeong-ai)
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
- 연결 남음: 추가-2 (백엔드 연결 `POST /receipts/{recptSn}/save-check` 저장완료 영수증 409 `RECEIPT_ALREADY_SAVED`, 백엔드 저장소에서 /start)

## SCR-HLT-003 케어 캘린더 · 일정 뱃지 색상 연결 — 끝

- 기능: 명세 기능 ID 추가 없음, FN-HLT-003-36 일정 메모 · 뱃지 색상에 걸침. 숨겨 둔 일정 등록·수정 모달의 뱃지 색상 선택을 켜고 칩 5개를 HLTG21 코드로 `cldrBadgeColrCd`에 보낸다. 색을 고르지 않은 일정은 종류·검진유형 기본 톤으로 표시한다(병원 일정은 정기검진 보라·예방접종 초록·질병진료 빨강·검사 파랑·기타 진료 회색, 그 밖의 종류는 회색). 코드와 `nyangmung.css` tone 토큰: HLTC0079 보라 → `--tone-violet-fg`/`--tone-violet-bg`, HLTC0080 초록 → `--tone-green-fg`/`--tone-green-bg`, HLTC0081 빨강 → `--tone-rose-fg`/`--tone-rose-bg`, HLTC0082 파랑 → `--tone-blue-fg`/`--tone-blue-bg`, HLTC0083 회색 → `--tone-gray-fg`/`--tone-gray-bg`. 캘린더 칩은 `hlt.css`의 `c-violet`·`c-green`·`c-rose`·`c-blue`·`c-gray`를 그대로 쓴다. `c-amber`는 쓰지 않는다
- 기다리는 것: 백엔드 SCR-HLT-003 일정 뱃지 색상(JAJ 백엔드, HLTG21 코드 5개. 공용 DB에는 `db/` 변경 절 v0.12 (6) 실행됨, develop 병합 전)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `http://localhost:5173/health/calendar`에서 색을 골라 등록·수정한 일정이 그 색 칩으로 보이고, 색을 고르지 않은 일정은 종류·검진유형 기본 톤으로 보인다
- 결정: HLTC0081 칩 이름은 시안 "분홍"이 아니라 "빨강"(팀 확정, 공용 DB `COM_CD_NM`). 칩 순서는 시안에서 주황만 뺀 파랑·초록·빨강·보라·회색, 고른 칩을 다시 누르면 해제(`''` 전송). 색은 `TONE_CLASSES`(`index.css` `--color-tone-*` 클래스)로 그리고 hex 표는 지움
- 추가 요청: 추가-1 종합 건강기록 `summaryUtils.js`·`TimelineCard.jsx`도 tone 클래스로(빌드 실패로 함께) / 추가-2 선택 링을 `outline: medium solid currentColor`·`outline-offset: var(--spacing)`으로(앱에 `--space-1` 없음) / 추가-3 칩 간격 `gap-3`(12px)
- 결과: 2026-11-04 검증 통과(이전 루프는 로그인 미완료·첫 실패 뒤 핸드오프 URL 정정으로 실패해 사람이 루프를 버림, 마지막 루프 1회차는 로그인 세션 만료), 사람 확인 끝
- 연결 남음: 없음

## SCR-HLT-011·002 종합 건강기록·건강 일지 · 화면 다듬기 — 끝

- 기능: 명세 기능 ID 추가 없음. 마일스톤이 모두 끝난 뒤 대화로 받은 화면 다듬기(FN-HLT-011-01·02·03·06, FN-HLT-002-01·15~19에 걸침)
- 기다리는 것: 백엔드 검진기록 목록 `ckupCn`(추가-6 상세 줄, JAJ 백엔드)
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: 핸드오프 `### 추가 요청` 추가-1~26의 각 화면 조건(`/health`, `/health/diary`)
- 결정: 공용 `DropdownSelect`는 그대로 두고 건강 일지만 `DiaryPetPicker`로 바꿈. 지속 관찰 ⋮는 `CareItemMenu`에 선택 props `leadingItems`를 더해 씀. `LineChart`에 선택 props `labelFill`·`isEdgeToEdge`를 더함(기본값은 그대로). 사진 줄은 전체 회차, 차트는 크기 입력 회차 기준 최신 5개. 지속 관찰 모바일은 나중에(사람)
- 추가 요청: 추가-1~5·9~14 히어로 칩 줄·기준일·진행 점·스와이프·요약 3칸 / 추가-6 타임라인 상세 줄·아이콘 / 추가-7·8·16 탭별 태블릿·PC 배치 / 추가-15 검사 결과 최대 5줄·범위 이탈 / 추가-17 PC 탭 아래 제목 숨김 / 추가-18 건강 일지 전체 반려동물 패널 / 추가-19 지표 칩 색 / 추가-20~26 지속 관찰 PC 색·굵기·목록·⋮ 메뉴·삭제 확인·"변화 없음"·차트 폭·최신 5개·[+N]·사진 원본 넘기기·말풍선 잘림
- 결과: 2026-11-05 검증 에이전트 루프 없이 `yarn -s lint`·`yarn -s build` 0과 Playwright 화면 확인(가짜 응답은 브라우저에서만), 사람 확인 끝
- 연결 남음: 없음 (FN-HLT-011-03 `ckupCn` 백엔드 연결 2026-11-06 확인)

## SCR-HLT-002·003 건강 일지 그래프 기록 수 · 케어 캘린더 반려동물 선택 — 끝

- 기능: FN-HLT-002-09 건강기록 변화, 002-10 그래프 원칙 · 조회기간 (그래프 기준 기록 수 14 → 7 → 5, 사람 요청 2026-11-06). 추가 요청으로 FN-HLT-003-39 표시 반려동물 필터
- 기다리는 것: 없음
- 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `/health/diary` 건강기록 변화 카드가 최근 5개 기록 기준(부제 "최근 5개 기록", 요청 `size=5`) / `/health/calendar` 핸드오프 `### 추가 요청` 추가-2·3의 화면 조건
- 결정: 디자인 기준 없음(지금 화면은 html·화면설계서와 달라 그대로 두고 개수만 바꿈). 캘린더 필터는 건강 일지 `DiaryPetPicker`에 `isMulti`·`selectedPetSns`·`onChange` props로 분기(단일 선택 값은 그대로), 필터는 달력·날짜 상세·다가오는 일정 셋 다, 모든 반려동물을 하나씩 고르면 전체로 바뀜, 반려동물 1마리 이하면 버튼 없이 제목. 전체 아이콘 `PawPrint`. 명세 FN-HLT-003-39·002-09·10 문구는 명세 일괄 갱신 때(핸드오프 "다음에 할 것")
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
- 기다리는 것: 백엔드 B2 알림 `?petSn=`(③, JAJ 백엔드), 마이페이지 `?register=1`·`returnTo`(④, 마이페이지 담당)
- 완료 조건: 명령: lint·build 0 / 화면: 공통 카드(1101px 이상 사이드 메뉴 아래, 1100px 이하 제목 아래 알약)·팝오버·1마리·0마리, ⑤ 선택 유지·없는 아이면 첫 아이, 히어로 칩·건강 일지 셀렉트·케어리스트 셀렉트 삭제, 캘린더 스위치(켬·끔, 다른 아이 회색), ② 다른 아이 일정 클릭 토스트 + 수정 모달, ① `?petSn=` 진입·주소에서 지움, ④ 등록 이동
- 결정: 선택값은 `features/health/shared/SelectedPetProvider.jsx`(페이지가 `useMe` 회원 번호를 넘김) → 직접 고른 아이 → `?petSn=`(읽고 주소에서 지움) → localStorage `nyangmeong.health.petSn.<mbrSn>` → 첫 아이. 카드·팝오버는 `shared/PetSwitcher.jsx`, 레이아웃은 `SubPageLayout` `sideBottom` 2줄 추가만(메뉴 아래 따라 붙는 처리는 카드 안에서). 캘린더 스위치는 `components/Toggle.jsx` 그대로, 다른 아이 회색은 `scheduleTypes.js` `getScheduleTone`의 `isOtherPet`. `diary/DiaryPetPicker.jsx` 삭제(사람 결정 2026-11-07)
- 결과: 2026-11-07 검증 2회차 확인 못 함 있음(내 것 없음, 연결 남음만). 1회차는 `SubPageLayout` 기존 줄 변경·백엔드 미실행으로 실패. 1마리·0마리는 `GET /pets` route로 확인. 사람 확인 끝
- 참고: 주양육 10마리(`MAX_OWN_PETS`)면 팝오버 「+ 등록」 칸을 숨긴다(이전 히어로와 같음). 0마리 점선 박스 위에는 구분선이 없다. 토스트 '로/으로'는 `utils/josa.js` `pickJosa`라 ㄹ 받침 이름은 「하늘으로」처럼 나온다(공용 유틸, 이번엔 안 고침)
- 연결 남음: ③ 헤더 알림 (백엔드 연결 케어 일정 알림 `mvmnPath`에 `?petSn=`, 백엔드 저장소에서 /start)
- 연결 남음: ④ 등록 뒤 복귀·새 아이 선택 (`PetListPage.jsx`의 `?register=1`·`returnTo` 처리, 마이페이지 담당)

## SCR-HLT-011·002 건강기록 · 튜토리얼과 고른 기록 대시보드 — 끝

- 기능: 새 기능(ID 없음). 흐름도 D1~D11. 종합 건강기록 첫 진입 튜토리얼 모달 3단계(시작 · 기록 고르기 · 완료), 고른 기록만 대시보드 카드, [기록 항목 편집], 건강 일지 [오늘 기록하기]에 고른 매일 기록만 탭 + [항목 추가]
- 기다리는 것: 백엔드 B1 `MBR_DSHBD_WDGT` 건강기록 전용 API(JAJ 백엔드). 그때까지 가짜 저장소로 만든다(사람 결정 2026-11-07: 저장은 붙이지 않는다)
- 완료 조건(초안, /start에서 확정): 명령: lint·build 0 / 화면: 저장된 선택이 없으면 1단계가 열린다. [나중에 할래요]·×는 추천 3개(체중·식사량·검진기록) 저장. 2단계 4묶음 칩, [추천대로 고르기], 0개면 「1개 이상 골라 주세요」 + [시작하기] 막힘, 760px 이하 미리보기 숨김, 기존 회원은 기록 있는 항목 미리 체크. 3단계 [다시 고르기]·[건강기록 보러 가기]. 대시보드 「{이름}의 건강 대시보드」·「고른 기록만 보여요 · 기준일 YYYY.MM.DD(요일)」·[기록 항목 편집], AI 건강분석 리포트 항상 표시, 카드 순서 4묶음 고정, 빈 상태 문구·링크는 프로토타입 원문, 기존 탭 4개는 대시보드 아래. 모달 `role="dialog"`·`aria-modal`·포커스 가두기. 코치마크 없음(D6)
- 결정: 기존 탭 4개는 없애고 히어로 + 대시보드만 둔다(추가-1, 사람 결정 2026-11-07. 처음엔 남기기로 했다가 바꿈). 첨부 자료 항목 추가(추가-2), 검사 수치 카드 항목 선택(추가-4). 데이터는 `GET /pets/{petSn}/health-indicators`(체중·식사량·음수량·산책·크레아티닌)·건강 요약·일상 기록·케어 항목 API를 `features/health`에서 쓴다(`features/dashboard`는 import 하지 않는다)
- 결정(/start 질문, 추천안대로 2026-11-07): 가짜 저장소 회원별 localStorage(`nyangmeong.health.widgets.<mbrSn>`), 2단계 주 버튼 「다음」, 편집 모드 문구·[취소]·[저장]·토스트 프로토타입대로, 히어로 통계 범위 밖, 고른 적 없으면 건강 일지 5종 모두, 케어리스트 오늘 기준은 케어 캘린더와 같게. 미리 체크는 모든 아이 합집합, 선택은 회원 단위(새 반려동물도 같은 선택), 0마리는 공통 카드 점선 안내. 튜토리얼 시작 항목 최대 6개(추가-8)
- 추가 요청: 추가-1 탭·4묶음 제거·안 쓰는 summary 파일 10개 삭제 / 추가-2 첨부 자료 항목 / 추가-3 2단계 한 줄 배치 / 추가-4 검사 수치 항목 선택·검진상세 「추이 보기 ›」 / 추가-5 검사 수치 미선택 토스트 / 추가-6 토스트 문구·1단계 Skeleton / 추가-7 미리보기 상태 칩 Skeleton / 추가-8 시작 항목 6개
- 결과: 2026-11-07 검증 통과(루프는 사람이 두 번 clear 뒤 새로 시작). 추가-7은 코드 확인, 추가-2 PDF 내려받기는 응답을 바꿔 확인. 사람 확인 끝
- 참고: 파일 위치가 기획과 다름 — `AiReportCard`는 `DashboardCard.jsx` 안, `useRecordedItems`는 `queries.js`, 카드 본문은 `WidgetCard.jsx`. 체중 직전 대비는 0.1kg 반올림(0이면 「변화 없음」, 사람 결정 유지). 튜토리얼 기록 확인이 아이 수 × 11개 요청(알려진 문제, B1에서 해결)
- 연결 남음: D1~D3·D7·D10·D11 저장과 기록 있는 항목 (백엔드 연결 B1 `MBR_DSHBD_WDGT` 건강기록 전용 GET·PUT·기록 있는 항목 응답, 백엔드 저장소에서 /start)

## SCR-HLT-011·002 건강기록 · 대시보드 카드 이동 — 끝

- 기능: 새 기능(ID 없음, ※신규 정책). AI 건강분석 리포트를 뺀 카드 오른쪽 위 [더보기] 이동(카드 전체 클릭 이동은 하지 않음, 사람 결정 2026-11-08). ⋮ 메뉴는 다음 마일스톤으로 미룸(사람 결정 2026-11-08, [기록 항목 편집] 버튼은 그대로)
- 기다리는 것: 「튜토리얼과 고른 기록 대시보드」 끝
- 완료 조건: 명령: lint·build 0 / 화면: 카드 빈 곳 클릭 시 이동 없음(빈 상태 카드도), [더보기] 클릭·Tab+Enter 시 아래 주소로 이동, [더보기]에 `aria-label` 「{이름}의 {항목} 기록 화면으로 이동」·포커스 링, 카드 안 이동 링크가 [더보기]와 같은 곳이면 뺌, 검사 수치 select·첨부 썸네일은 원래 동작만, 1100px 이하·390px에서 카드 머리 한 줄. 이동 주소: 매일 기록 5종 → 건강 일지 건강기록 변화 탭(누른 항목 선택), 검진기록·검사 수치 → 건강 일지 검진기록 탭, 지속 관찰 → 지속 관찰 탭, 처방·투약 → 검진상세 처방약 탭, 첨부 자료 → 건강 일지 검진기록 탭, 알레르기·기저질환 → 마이페이지 반려동물 관리, 예방접종·구충 → 케어 캘린더, 케어리스트 → 케어 캘린더 케어리스트 탭. 반려동물은 공통 카드가 넘긴다
- 결정: 처방·투약은 검진상세 처방약 탭(프로토타입과 같음), 첨부 자료는 건강 일지 검진기록 탭(사람 결정 2026-11-07. 종합 건강기록 탭이 없어져 처음 결정 「종합 건강기록 처방·투약 탭」을 바꿈). (사람 2026-11-08) 처방·투약은 가장 최근 처방의 검진상세, 처방 없으면 건강 일지 검진기록 탭. 카드 전체 이동 없음, [더보기]만 링크. 「위젯 순서 변경」은 기획 담당 기능 ID 요청 목록에 추가. ⋮ 메뉴는 순서 변경 동작이 없어 다음 마일스톤에서 함께 넣는다
- 추가 요청: 추가-1 대시보드 케어리스트 카드 항목 앞 동그라미 제거(완료 ✓도 같이 빠짐, 글자는 머리 아이콘·「보기 전용」 문구 선) / 추가-2 빈 상태 글자·링크와 AI 리포트 「준비 중이에요」를 본문 가로·세로 가운데
- 결과: 2026-11-08 검증 통과(1회차는 백엔드 미기동으로 화면 확인 못 함 → 로그인 뒤 통과), 사람 확인 끝. 6번 ⋮ 메뉴는 「대시보드 카드 순서 바꾸기」로 넘김
- 참고: 같은 곳으로 가서 뺀 링크는 빈 상태 8개(매일 기록 5종·검사 수치·지속 관찰·알레르기)와 알레르기 「수정하러 가기」. 케어리스트 빈 상태 「케어 캘린더에서 설정하기」(캘린더 탭)는 [더보기](케어리스트 탭)와 달라 남김. 처방 [더보기]는 카드 정렬(복용 중 먼저)의 첫 처방 `ckupRcdSn`, 없으면 건강 일지 검진기록 탭
- 연결 남음: 없음

## SCR-HLT-011 건강기록 · 대시보드 카드 순서 바꾸기 — 끝

- 기능: 새 기능(ID 없음, ※신규 정책). 대시보드 카드 순서를 회원이 바꾼다. 대시보드 오른쪽 위 [기록 항목 편집] 버튼 자리에 ⋮ 메뉴 「기록 항목 편집」(지금 버튼과 같은 동작)·「위젯 순서 변경」(「대시보드 카드 이동」에서 미뤄 옴, 사람 결정 2026-11-08)
- 결정(사람 2026-11-08): ⋮ 메뉴는 기존 `features/health/CareItemMenu.jsx`를 고쳐 쓴다. `onEdit`을 안 넘기면 「수정」을 숨기고 메뉴 항목은 `leadingItems`로 넘긴다. 기존 화면(케어리스트·지속 관찰)은 그대로
- 기다리는 것: (「대시보드 카드 이동」 끝남 2026-11-08) 백엔드 B1 PUT `SORT_SEQ`(JAJ 백엔드). 그때까지 가짜 저장소에 순서를 같이 둔다
- 완료 조건(초안, /start에서 확정): 명령: lint·build 0 / 화면: [기록 항목 편집]에서만 옮긴다(대시보드에서 바로 드래그하지 않음). 드래그와 함께 카드마다 [위로]·[아래로] 버튼(키보드·모바일 터치용, 맨 위 [위로]·맨 아래 [아래로]는 막힘). 저장하면 대시보드가 그 순서로 보이고 새로고침·다른 반려동물에서도 같음. AI 건강분석 리포트는 맨 앞 고정(옮기는 대상 아님). 새로 고른 항목은 맨 뒤에 붙는다(편집 모달·건강 일지 [항목 추가] 모두)
- 결정(사람 2026-11-07, 추천안): 드래그 라이브러리는 추가하지 않는다(브라우저 기본 기능). D8 「4묶음 순서 고정」은 이 마일스톤에서 버린다(그 전 마일스톤은 고정). 순서는 선택과 같이 회원 단위로 저장. 디자인은 프로토타입·아트보드에 없으므로 시안을 받거나, 없으면 기존 칩·카드 스타일로 AI 초안(/start 때 확인)
- 결정(사람 2026-11-08, /start 질문 추천안): 「위젯 순서 변경」은 순서만 바꾸는 별도 모달 `WidgetOrderModal`(끌기·[위로]·[아래로], AI 리포트 맨 앞 고정 줄), 편집 모달은 고르기만·미리보기는 저장 순서. 튜토리얼 처음 고를 때·3단계 칩은 4묶음 순서. 디자인은 시안 없이 기존 편집 모달 스타일 + `src/assets/index.css` 토큰 AI 초안. 토큰 기준: px·HEX 직접 값 0건, 글자·높이·폭·간격·버튼 크기는 편집 모달·⋮ 메뉴 버튼이 쓰는 단계만
- 추가 요청: 추가-1 순서 모달 간격 `mt-4` → `gap-4`, 순번 칸 `w-5` → `w-6`(기존 단계) / 추가-2 기획 「바꿀 곳」에서 튜토리얼 3단계 칩 빼고 이유 한 줄
- 결과: 2026-11-08 검증 통과(1회차 실패: 숨김 토스트 `joinWidgetNames`가 4묶음 순서 → 저장 순서로 고침), 사람 확인 끝
- 참고: 저장 순서 지키기는 `widgetItems.js` `keepWidgetOrder`(중복·모르는 키만 버림). `orderWidgetIds`(4묶음)는 칩 목록·튜토리얼·기록 있는 항목 합집합에만 남음. 건강 일지 [오늘 기록하기] 탭은 기록 종류 순서 그대로. `CareItemMenu`는 `onEdit`을 안 넘기면 「수정」을 숨김
- 연결 남음: 순서 저장 (백엔드 연결 B1 PUT `SORT_SEQ`, 백엔드 저장소에서 /start)

## SCR-HLT-011 건강기록 · 종합 건강기록 배너 개편 — 끝

- 기능: 새 기능(ID 없음, ※신규 정책). 반려동물 선택이 사이드바(보고 있는 아이)로 빠져서 상단 배너를 "캐릭터 + 건강 요약" 역할로 바꾼다. 지금 배너는 진한 청록 면 + 점무늬라 아래 흰 대시보드 카드들과 따로 떠 보인다
- 기다리는 것: 「대시보드 카드 순서 바꾸기」 끝(끝남 2026-11-08. 둘 다 종합 건강기록 화면을 고쳐 같은 파일이 겹칠 수 있음. 사람 결정 2026-11-08: 순서 바꾸기를 먼저 한다)
- 완료 조건(초안, /start에서 확정): 명령: lint·build 0, 토큰 검사 위반 0건(결과 보고) / 화면: 배너 바탕이 아래 대시보드 카드와 같은 흰색, 캐릭터 있는 아이·없는 아이 모두 배너 높이와 요약 칸 위치가 같음, 이름·요약 숫자와 단위만 청록
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
- 기다리는 것: 메인 담당이 메인 히어로를 없애 `MainPage.jsx`가 `SummaryHero`를 더 이상 import 하지 않을 때(사람 결정 2026-11-08: 메인과 `SummaryHero`는 이번에 고치지 않음)
- 기다리는 것 확인(2026-11-09): LJS 메인 개편(`2f1def4`)으로 `MainPage.jsx`가 이미 `SummaryHero`를 import 하지 않음
- 완료 조건: 명령: lint·build 0, `grep -rn "SummaryHero" src`·`grep -rnw "countItems" src` 0건 / 화면: `/health`(로그인) 배너 그대로·콘솔 새 오류 없음, `/` 메인 그대로
- 한 일: `features/health/summary/SummaryHero.jsx` 삭제, 그 파일만 쓰던 `summaryUtils.js` `countItems` 삭제
- 결과: 2026-11-09 검증 통과(1~3회차는 로그인 세션이 없어 화면 확인 못 함 → 사람이 로그인하게 해 4회차 통과), 사람 확인 끝
- 연결 남음: 없음

## 제외

- AI매니저 FN-AIM-008 참조 대상 반려동물 선택: 화면 SCR-AIM-008 영수증 업로드는 LJS(분배 표 "AIM-008 영수증 업로드")
- AI매니저 FN-AIM-008 참조 촬영 · 파일 선택: 화면 SCR-AIM-008 영수증 업로드는 LJS(분배 표 "AIM-008 영수증 업로드")
- AI매니저 FN-AIM-008 참조 분석 요청: 화면 SCR-AIM-008 영수증 업로드는 LJS(분배 표 "AIM-008 영수증 업로드")
- AI매니저 FN-AIM-008 참조 직접 입력하기: 화면 SCR-AIM-008 영수증 업로드는 LJS(분배 표 "AIM-008 영수증 업로드")

## 대조

- 건강기록: 명세 90 = 마일스톤 86 + 제외 4
