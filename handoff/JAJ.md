# JAJ 핸드오프

## 지금 하는 것

진행 중: SCR-HLT-003 케어 캘린더 · 토탈 케어리스트 API 연결 (시작 2026-10-31 02:13, 승인 2026-10-31 03:21). 구현과 lint·build는 끝, 사람은 화면을 확인하고 문제없다고 함. 검증 1회차가 화면 확인 못 함으로 `실패`라 `진행`

기준: 건강기록_기능명세서_v1.1_20261023 FN-HLT-003-12·13·21~24·38, 백엔드 develop `CareItemController`(`docs/api/health.md`, JAJ 백엔드). 디자인: 기존 화면 그대로(`html/hlt-calendar.html`), 모양은 바꾸지 않는다. SCR-HLT-002 검진기록 연결은 URL 규칙 결정 대기로 `대기`

실제 응답과 가짜의 차이(가짜 → 실제): `careItemSn`→`careArtclSn`, `careItemNm`→`careArtclNm`, `careIconCn`→`rprsIconId`, `rptTypeCd`(`DAILY`·`REGULAR`)→`careZoneCd`(`HLTC0036` 일상·`HLTC0037` 정기), `rptCycleCd`(`1W`·`2W`·`1M`·`1Y`·`CUSTOM`)→`careCycleCd`(`HLTC0038`~`HLTC0042`, 이름은 `careCycleCdNm`), `rptCycleDayCnt`→`cycleDrctInptDayCnt`, `baseItemYn`→`bscArtclYn`, `nextSchdYmd`→`nxtmPrnmntYmd`, `dosEndYmd`→`mdcnEndYmd`, `dayGoalCnt`→`dayMdcnNmtm`, `todayChckCnt`→`todayCmptnCnt`, 연동 표시 `lnkgTypeCd`→`prscSn`·`reptPrvntMngSn`, `lastCareYmd`→`lastCmptnYmd`. 완료 기록은 `careRcdSn`·`careYmd`→`careCmptnHstrySn`·`cmptnYmd`(+`cmptnCycl`). `todayDoneYn`·`regYmd`는 없음. 목록과 완료 기록은 API가 따로다. 투약 규칙(백엔드 develop `b3389a0`): 기록 내용 `GET care-completions`는 투약을 하루 N회 채운 날만 주고, `DELETE care-completions/{careCmptnHstrySn}`는 투약도 그날 기록 전체를 지우며, 오늘 마지막 1회 취소는 `DELETE care-items/{careArtclSn}/today-completion/last`다

- 조회 FN-HLT-003-12: `features/health/api.js` `getCareItems(petSn)`을 `GET /pets/{petSn}/care-items` + `GET /pets/{petSn}/care-completions`(기간 없이 전체, 완료일 내림차순) 두 호출로 바꿔 `{ careItems, careRecords }`를 그대로 돌려준다. 화면 필드는 실제 이름으로 바꾼다(`CareList.jsx`·`CareTile.jsx`·`CareRecordList.jsx`·`CareItemModal.jsx`·`careDue.js`). 오늘 완료는 화면이 계산: 투약은 `todayCmptnCnt >= dayMdcnNmtm`, 그 밖은 오늘 `cmptnYmd` 완료 기록이 있으면. 상태 배지는 `nxtmPrnmntYmd`로(지금 `getDueBadge` 그대로), 주기 표시는 `careCycleCdNm`(직접입력은 `cycleDrctInptDayCnt`일). 기록 내용은 받은 대로 그린다(투약 숨김 처리 없음) / 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0 / 화면: `http://localhost:5173/health/calendar` 케어리스트 탭에서 새 반려동물에 기본 항목 11개(정기 6개가 위, 일상 5개가 아래)가 나오고 양치·빗질·발톱 관리에 ★가 켜져 있다
- 완료 토글 FN-HLT-003-12: `checkCareItem`을 오늘 완료가 아니면 `POST /pets/{petSn}/care-completions`(`careArtclSn`), 오늘 완료면 그 기록 `DELETE /pets/{petSn}/care-completions/{careCmptnHstrySn}`로. 투약 항목은 N회를 채우기 전까지 누를 때마다 `POST`, 채운 뒤에는 아무것도 안 함(지금 가짜와 같음) / 화면: 줄을 누르면 배경이 채워지고 "기록 내용"에 오늘 날짜로 쌓이며, 정기관리 예정일이 오늘 + 주기로 바뀐다. 다시 누르면 취소된다
- 마지막 1회 취소 FN-HLT-003-12: `cancelLastDose({ petSn, careArtclSn })`를 `DELETE /pets/{petSn}/care-items/{careArtclSn}/today-completion/last` 1번으로(성공 200 data 없음, 투약 아니면 400 `INVALID_INPUT_VALUE`, 오늘 기록 없으면 404 `CARE_COMPLETION_NOT_FOUND` → 서버 메시지를 지금처럼 토스트). 완료 기록 번호는 쓰지 않는다 / 화면: 하루 2회 투약 항목을 2회 누르면 2/2회·기록 내용 1줄, [마지막 1회 취소]를 누르면 1/2회가 되고 기록 내용에서 빠진다(실제 처방약 등록은 검진상세 SCR-HLT-005 API 연결 전이라 DB에 투약 항목이 없으면 확인 못 함, 보고에 적는다)
- 기록 내용 취소 FN-HLT-003-12: `cancelCareRecord`를 `DELETE …/care-completions/{careCmptnHstrySn}` 1번으로. 투약 기록도 이 1번으로 그날 기록 전체가 지워진다 / 화면: 투약 기록을 취소하면 요청 1번으로 그 날이 빠지고 0/N회가 된다. 기록 내용 아이콘을 누르면 그 기록이 빠지고 정기관리 예정일이 남은 가장 최근 완료일 + 주기로 돌아간다
- ★ FN-HLT-003-13: `toggleCareMain`을 `PUT /pets/{petSn}/care-item-exposures`(`careArtclSns`: 지금 켜진 항목을 `mainSortSeq` 순으로, 켤 때는 끝에 더하고 끌 때는 뺀다)로. 7개째는 서버 400 `CARE_ITEM_MAIN_LIMIT_EXCEEDED`의 메시지를 지금처럼 토스트로 / 화면: ★를 누르면 즉시 반영되고 n/6이 바뀌며, 6개일 때 7번째는 안내가 뜨고 켜지지 않는다
- 항목 추가 FN-HLT-003-21~24·38: `createCareItem`을 `POST /pets/{petSn}/care-items`(`careArtclNm`·`rprsIconId`(미선택 `task_alt`)·`careZoneCd`·정기만 `careCycleCd`·직접입력만 `cycleDrctInptDayCnt`·`lastCmptnYmd`)로. `CareItemModal.jsx` 미리보기는 `careDue.js` `addCycle`을 새 코드로 계산 / 화면: 주기 2주·마지막으로 한 날 3일 전으로 추가하면 정기관리에 예정일 11일 뒤로 나오고, 기록 내용에 3일 전 기록이 생긴다
- 공통 코드: `careDue.js` `CARE_CYCLES`의 `cd`를 `HLTC0038`~`HLTC0042`로, 구역은 `HLTC0036`·`HLTC0037` 상수로. 같이 쓰는 검진상세 가짜(`checkup/PreventionForm.jsx`, `api.js` 연동 가짜 `saveLinkedDoseItem`·`createLinkedPreventionItem`·`moveLinkedCareItems`)의 `'CUSTOM'`·`'DAILY'`·`'REGULAR'` 글자도 새 코드로 바꾼다. 연동 가짜는 검진상세 가짜가 쓰는 동안 남기지만, 케어리스트는 실제 API라 가짜 연동 항목은 더 이상 케어리스트에 안 보인다. 쓰는 곳이 없어지는 가짜(`BASE_CARE_ITEMS`·`fakeCareRecords`·`getNextDueYmd` 등)는 지운다
- 항목 수정·삭제 FN-HLT-003-12 (API 연결만): `api.js`에 `updateCareItem({ petSn, careArtclSn, body })`(`PATCH /pets/{petSn}/care-items/{careArtclSn}`, 보낸 값만)·`deleteCareItem({ petSn, careArtclSn })`(`DELETE …`), `queries.js`에 `useUpdateCareItem`·`useDeleteCareItem`(`useCareMutation`)을 만든다. 화면에서 부르는 곳은 없다. 수정·삭제 UI는 화면설계서 갱신 뒤 마일스톤 "SCR-HLT-003 케어 캘린더 · 케어 항목 수정·삭제 UI"(대기) / 완료 조건: 명령: `yarn -s lint`·`yarn -s build` 0
- 무효화: 완료·취소·★·추가 성공 뒤 `healthKeys.careItems` 무효화(지금 그대로)로 목록·기록 내용을 다시 부른다(둘이 같은 `careItemList(petSn)` 조회 안에 있다). 캐시 키 `careItemList(petSn)` 그대로

질문: 없음 (질문 1은 (가)로 정함. 투약 취소 마일스톤은 이 마일스톤에 합침)
새 의존성: 없음

## 다음에 할 것

- 검증 루프 1회차 실패로 보관 중. 기획은 고치지 않는다. 루프를 버리려면 `! sh scripts/verify-loop.sh clear`. 실패 항목(확인 못 함): 검증 에이전트가 로그인할 계정이 없어 `/health/calendar` 케어리스트 화면 전부, DB에 투약 항목이 없어 [마지막 1회 취소]·투약 기록 취소. 코드 지적은 없음. 이어 가려면 검증 에이전트가 쓸 테스트 계정(이메일 로그인)과 하루 2회 투약 케어 항목 1건을 마련한 뒤 `/verify`, 또는 루프를 버리고 투약 확인을 SCR-HLT-005 연결 뒤로 옮기는 기획 수정
- 알릴 것(URL 규칙 담당, `docs/routes.md`): 상위 키가 필요한 상세 화면 주소 규칙이 없다. 검진상세 `/health/checkups/:ckupRcdSn`·검사 수치 입력 `/health/checkups/:ckupRcdSn/inspections`는 실제 API가 `/pets/{petSn}/checkups/{ckupRcdSn}`라 `petSn`이 필요하다. `?petSn=` 쿼리(지금 규칙의 쿼리는 탭·필터용)와 경로 `/health/pets/:petSn/checkups/:ckupRcdSn` 중 무엇을 규칙으로 할지 정해 `routes.md` 0장에 적어 달라고 요청한다. 규칙이 정해져야 SCR-HLT-002 검진기록 연결(질문 1)을 승인·구현한다. 임시 주소는 쓰지 않는다
- 참고(SCR-HLT-002 검진기록 API 연결, 기획 승인 전 대기):
  - 실제 응답과 가짜의 차이: 병원명 `hospNm`→`hsptlNm`, 영수증 `rcptSn`→`recptSn`, 목록 행(`CheckupSummary`)에 `ckupCn`·`ckupMemoCn`·`petSn` 없음, "연결된 일정 삭제됨"은 `schdlDelYn`, 목록은 `PageResponse`(`content`·`totalElements`·`totalPages`, size 최대 50), 연도 목록·`hasAnyCheckup`은 서버가 주지 않음
  - 질문 1. 검진상세 주소 `/health/checkups/:ckupRcdSn`에 반려동물 번호가 없는데 실제 상세·수정 API는 `/pets/{petSn}/checkups/{ckupRcdSn}`이다. 목록이 실제 번호가 되면 가짜 검진상세는 "찾을 수 없음"이 된다. (가) 검진상세 주소에 `?petSn=`을 붙여 기본정보 조회·[검진기록 수정]만 실제 API로, 검진상세 반려동물 목록도 `useMyPets`로 바꾸고 나머지 탭(검사·첨부·처방·반복 예방)은 가짜 그대로 / (나) 검진상세는 SCR-HLT-005 연결 때로 미루고 이번 완료 조건에서 수정을 뺀다 / (다) 백엔드에 반려동물 번호 없는 상세 조회를 요청한다(`백엔드 연결`). (추천: 가)
  - 질문 2. 건강 일지 반려동물을 실제 목록으로 바꾸면 일상 기록·지속 관찰 탭은 가짜 데이터가 가짜 반려동물 번호에 묶여 빈 상태로 보인다. 그대로 둘까요? (추천: 그대로 둔다. 각 API 연결 마일스톤에서 채운다)

- 참고(반려동물 실제 응답): 건강 일지·종합 건강기록은 다른 담당 작업 뒤에 바꾼다(실제 응답에 `petRelCd`→`brupRoleCd`, `petSpcsCdNm`→`vrtyNm`, 체중 정상범위·목표·캐릭터 상태 없음)
- 연결 남음(공용 · PetFace 올리기): 캐릭터 얼굴 이미지 실제 응답 `GET /pets/{petSn}/character-image?part=face` (LJS 백엔드, 지금은 502라 기본 아이콘)
- 연결 남음(공용 · 영수증 사용처 키): 가계부 지출 생성·중복 확인 실제 호출 (SJM, `receiptApi.js` 가짜는 `expndYmd`·`expndAmt`·`dtlMttr: ''`·`expndPlcusNm`). `expsCtgrCd`·`inputMthdCd`는 담당자 답변에 없어 그대로 둠
- 참고(SCR-HLT-002, 실패 아님): 최근 건강기록 모바일 한 줄 요약은 기록 있는 종류만 잇는다. 390px 그래프 x축 날짜 글자가 붙는다(이전부터). 폭이 정확히 760px이면 `isLarge` 모달이 `max-[760px]`·`min-[761px]` 어느 쪽에도 걸리지 않아 기본 크기로 열린다(이전부터)
- 알릴 것(시안 담당): 건강 일지 반려동물 선택이 칩 막대 → 초록 알약형 셀렉트(히어로 `bg-brand-500`·흰 글자, 이름 칸 세 글자 폭, 넘치면 말줄임)로 바뀌었다(추가-1~3). 오늘 기록하기 한 줄, 검진기록 제목 옆 연도 선택, 모바일 지속 관찰 목록→상세, 관찰 0건에도 카드 머리 등록 버튼, 상세 기록 모달 높이 맞춤·✕ 없음, 검진상세 [건강 일지로 돌아가기] 삭제(추가-4)가 시안(`html/hlt-diary.html`)과 다르다. 사람이 시안을 갱신하기로 함. 페이지 바탕색 `#faf8f5`는 토큰이 없어 `DiaryPetBar.jsx`에 직접 값으로 썼다(토큰이 생기면 바꿈)
- 알릴 것(공용 파일 담당): `components/Modal.jsx`에 선택 속성 `isAutoHeight`(높이를 내용에 맞춤)·`isCloseIconHidden`(✕ 숨김), `components/DropdownSelect.jsx`에 `isPill`(알약형·히어로 색, 목록은 `min-w-max`)을 더했다. 모두 기본값 꺼짐이라 기존 화면은 그대로다. `components/Card.jsx`는 섹션 이름(`aria-labelledby`)이 제목 글자만 가리키게 id를 제목 `<span>`으로 옮겼다(모양 변화 없음)
- 연결 남음(SCR-HLT-002): FN-HLT-002-01 반려동물 목록 (SJM), 002-01 캐릭터 이미지 (LJS), 002-09~13·15~33 일상 기록·관찰·검진기록 API (JAJ 백엔드)

- 결정 필요(SCR-HLT-011, 디자인 담당): 명세와 디자인이 다르다. 사람이 디자인 파일이 맞다고 했다. 명세를 디자인에 맞게 고칠지 정한다. (1) FN-HLT-011-02 "캐릭터 없으면 예시 그림" vs 지금 "캐릭터 만들기" 점선 카드(추가-5·14), (2) FN-HLT-011-07 "이탈 판정 없음" vs 범위를 벗어난 구간·점·마지막 값 빨간색, (3) 모바일 히어로·묶음 탭·검사 수치·관찰 기록 배치(추가-11~18)와 그래프 최대·최소 왼쪽 눈금은 시안·명세에 없다
- 참고(SCR-HLT-011): 칩 줄이 여러 줄로 꺾이면(`?fakePets=8`) 세로 구분선·등록 버튼이 마지막 줄 맨 앞으로 내려간다. 390px에서는 칩 줄이 가로로 밀려 등록 버튼이 화면 밖에 있다. 기준안에 없어 그대로 뒀다. `ConditionCard` 목록 key가 같은 항목이 두 번이면 겹칠 수 있다
- 결정 필요(LJS): 히어로 색 `#f9eaa6`(선택 칩·기준일 점)·`#dbe8e8`(글자)은 토큰이 없다. 공용 `assets/index.css`에 토큰을 더할지 정한다
- 연결 남음(SCR-HLT-011): 반려동물 목록·프로필 `getPets`와 필드 `petSeCd`·`chrcSttsCd`·`petRelCd`(지금 건강기록 가짜는 `chrctrImgPath`, 반려동물 도메인 가짜와 petSn도 다름) (SJM), 캐릭터 이미지·생성 상태 (LJS), 반려동물별 종합 조회와 첨부 파일 주소 `summaryApi.js` 가짜 → 실제 호출 (JAJ 백엔드)
- 참고(SCR-HLT-011): 개발용 `?fakePets=8`(미생성·공동양육 포함 8마리, 늘어난 5마리는 앞 세 마리 프로필을 돌려 씀). `features/health/diary/LineChart.jsx` 선택 속성: `bandLabelSide`, `isLeftColumn`(모바일 건강기록 변화), `activeIndex`(모바일 지속 관찰). 모바일 프로필 태그는 7px 여유라 실제 데이터의 긴 값이면 넘칠 수 있다

- 결정 필요(SCR-HLT-003 추가 요청): 명세 v1.1·시안과 달라졌다. 한 화면 세로 배치 → 탭 둘(캘린더·케어리스트, 추가-6), [새 일정 등록]이 날짜 상세 카드 오른쪽 위(추가-1), 카드 머리 버튼·빈 상태 버튼이 채운 주 버튼 색(추가-2·5, 시안은 `btn-soft`), 오른쪽 열 높이 배분(추가-3), 구역 제목·기록 내용 제목의 굵은 구분선(추가-7·8)을 고칠지 정한다. 시안은 퍼블리싱 담당에게 알린다
- 결정 필요(SCR-HLT-003 결함 정리 추가 요청, 디자인 담당): 명세 v1.1·시안과 달라졌다. FN-HLT-003-30 날짜 칸 80px 고정 → 88px(추가-5), 760px 이하는 태그 대신 점·막대(가계부 달력과 같은 모양, 추가-12). FN-HLT-003-12 [출처 보기] 삭제(추가-4). FN-HLT-003-01 반려동물 선택 탭 → 토탈 케어리스트 카드 제목 왼쪽 알약형 셀렉트(추가-13). 모바일 케어 목록 둥근 칸·더보기 3칸·"오늘 n/N 완료" 숨김(추가-14·15), 처방약 연동 배지를 이름 옆으로(추가-10·17). 시안(`html/hlt-calendar.html`)은 퍼블리싱 담당에게 알린다
- 알릴 것(공용 파일 담당): `components/Card.jsx`에 선택 속성 `leading`(제목 왼쪽 요소, 있을 때만 머리 줄이 꺾임)을 더했다. 기본값 없음이라 기존 화면은 그대로다. `features/health/PetTabs.jsx`는 쓰는 곳이 없어 지웠다
- 참고(SCR-HLT-003): 1280px에서 정기관리 구충제·심장사상충 예방 이름이 33px로 줄어 말줄임된다(이름 칸 7.5em 고정 정렬의 결과). 6줄인 달은 로딩 자리보다 달력이 88px(모바일 약 56px) 길다. 761~1100px 로딩 자리 높이는 따로 재지 않았다. 가짜 일정 5건(`api.js` schdlSn 9~13)은 오늘+2일이라 날마다 이동한다
- 연결 남음(SCR-HLT-003): 캐릭터 이미지 (LJS), 케어미션·포인트 반영 (SJM)

- 결정 필요(SCR-HLT-002 추가 요청): 명세 v1.1·시안과 달라졌다. 명세 FN-HLT-002-13(날짜 행 클릭 펼침, 5·3·2칸 → 행 클릭 시 상세 모달 하나의 표, 조회기간 3·7·14일 기본 3일), 앵커 → 탭, 제목 옆 글자 14px, [관찰 항목 등록] 채운 주 버튼(시안은 `btn-soft`)을 고칠지 정한다. 검사 수치 추가가 아래에 열리는 것은 검진상세 SCR-HLT-005·검사 수치 입력 SCR-HLT-007 명세와 다르다
- 참고: 건강 일지 탭은 처음 열 때만 주소 `#`를 읽는다. `BloodResultForm.jsx`의 입력 검사가 `labInput/LabInput.jsx`와 거의 같아 한 곳으로 합칠 수 있다

- 결정 필요(SCR-HLT-007 추가-1): 검사 결과 행을 어디나 누르면 수정 화면으로 가게 바꾸면서(`BloodResultList.jsx`) 검진상세에서 종합 건강기록 검사 수치 추이(`/health?inspection=<항목>`)로 가는 길이 없어졌다. 기능명세서 FN-HLT-005-02를 고칠지, 추이로 가는 다른 길을 둘지 정한다
- SCR-HLT-007 참고(실패 아님): [직접 입력하기] 뒤에도 주소가 `?mode=pdf&atch=<번호>`에 남아 새로고침하면 분석이 다시 뜬다(기획은 `?mode=manual`로 바꾸는 것). `labInput/ItemSelect.jsx` 목록에서 묶음 행과 항목 행 key가 `GLU`로 겹쳐 콘솔 경고. PDF 진입 때 아래 입력칸은 선택(비우면 분석 행만 저장)으로 구현했다
- 연결 남음(SCR-HLT-007): 검사결과지 PDF 분석 호출부 (LJS, `checkupApi.js` `analyzeLabPdf` 가짜, 응답의 `bloodYn`은 가정), 검사 결과 생성·수정 API (JAJ 백엔드, `createInspections`·`updateInspection` 가짜)

- 알려진 결함(검증 1회차 실패 항목, 코드는 아직 고치지 않음): `features/health/checkup/CheckupInfoCard.jsx`에서 [검진기록 수정] 모달로 저장해도 카드가 인라인 수정 상태로 남고, 이어서 카드의 [저장하기]를 누르면 모달에서 고친 검진 내용이 옛 값으로 돌아간다. 모달 저장 성공 때 조회 상태로 돌리거나 초안을 새 값으로 다시 채우면 된다
- 연결 남음: 검진상세의 검진기록·검사 결과·첨부 자료·처방약·반복 예방 API (JAJ 백엔드, `checkupApi.js`·`diaryApi.js` 가짜 응답을 실제 호출로 교체), 검사결과지 PDF 분석 호출부 (LJS). 007·011 도착 화면은 각 마일스톤에서 만든다
- 영수증 등록 가짜 확인용 쿼리(개발 환경만): `?fakeReceipt=zones`·`nozone`, `?fakeLedgerDup=1`, `?fakeReceiptSave=fail`. 인식 실패·15초 초과는 업로드 파일 이름에 `fail`·`slow`
- 알릴 것(LJS): `routes/domains/devRoutes.js`의 영수증 DEV 화면은 "건강 일지가 영수증 모달을 열면 지움"이라 지워도 된다
- 연결 남음: 반려동물 목록·프로필(체중 정상범위·목표 포함) `getPets` (SJM), 캐릭터 이미지 조회 (LJS), 케어 완료의 케어미션·포인트 반영 (SJM), 일상 기록·관찰·검진기록 API `diaryApi.js` 가짜 응답을 실제 호출로 교체 (JAJ 백엔드)
- 결정 필요: 공용 `ConfirmModal`을 시안 스타일로 맞출지, 우측 아래 플로팅 버튼(시안은 고양이 이미지)을 맞출지(LJS 파일). 앱 전체 본문 줄 높이를 시안 1.6으로 할지(지금은 건강 일지 안에서만 맞춤). 식사량·음수량·산책 그래프의 "최근 14개"를 기록 14건이 걸친 날의 합계로 그렸는데 14일로 바꿀지
- 영수증 등록 연결 남음: 영수증 인식 결과 전체(YAY, 지금은 LJS 인식 응답 + `receiptApi.js` `getReceiptDetail` 가짜)
- 알릴 것(LJS): 공용 `layouts/UserHeader.jsx`·`NotificationDropdown.jsx`·`ProfileDropdown.jsx`를 시안 기준으로 수정(Material 아이콘, 새 `headerStyles.js`·`assets/user.svg`), `Card`·`buttonStyles`·`SideMenu`·`PetTabs`(SCR-HLT-003에서 삭제) 줄 높이·색·비활성 스타일 수정, 로컬 Pretendard 글꼴 추가(`assets/fonts/PretendardVariable.woff2` 약 2MB, `index.css` `@font-face`), `eslint.config.js`에 `html` 제외
