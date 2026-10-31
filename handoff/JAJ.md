# JAJ 핸드오프

## 지금 하는 것

끝남: SCR-HLT-005 검진상세 · API 연결 (2026-10-31). 검증 4회차 통과, 사람 확인 끝. 검진상세 조회(useQueries 6개)·첨부·기타검사·혈액검사 선택 삭제·처방약·반복 예방이 실제 API, 추가-1 첨부 목록 page=1&size=50

## 다음에 할 것

- 다음 작업: `milestones/JAJ.md`의 `대기` 맨 위(SCR-HLT-007 검사 수치 입력 · API 연결)
- 참고(SCR-HLT-005): 검진상세의 혈액검사 목록은 실제 API인데 검사 수치 저장·수정(`createInspections`·`updateInspection`)과 PDF 분석(`analyzeLabPdf`)은 가짜다. 그래서 검사 수치를 추가해도 목록에 안 나오고, 실제 행을 수정해 저장하면 가짜 저장소에 그 번호가 없어 반영되지 않는다(007 연결 때 해결). 첨부 목록은 서버 최대 50건만 받는다. 기능 태그(혈구·신장·간·당)는 서버가 주지 않아 `labInput/bloodItems.js`에서 항목 약어로 찾는다. 반복 예방 행의 "처방약 연동" 배지는 이전부터 있던 문구라 그대로다. PR 캡처는 세션 만료로 남지 않아 다시 찍어야 한다
- 알릴 것(팀): 검진상세·검사 수치 입력 주소가 `/health/pets/:petSn/checkups/:ckupRcdSn`(`/inspections`)로 바뀌었다(`routes/paths.js`, `docs/routes.md` HLT-005·007). `docs/routes.md` 0장 규칙은 JAJ가 직접 고치고 팀에 공유한다
- 참고(SCR-HLT-002 검진기록): 목록 행에 서버가 `ckupCn`을 주지 않아 검진 내용 줄이 없어졌다. 연도 목록은 `size=1` 두 번(최신·가장 오래된 기록)으로 만든다. 영수증 저장은 반려동물마다 실제 `POST checkups`를 따로 보내 중간 실패 때 앞 기록이 남고, 영수증 번호(`recptSn`)·처방 약품·가계부는 가짜 그대로다. 일상 기록·지속 관찰 탭은 실제 반려동물 번호와 가짜 데이터가 맞지 않아 "기록 없음"이다(각 API 연결 때 채움). 종합 건강기록의 검진상세 링크는 가짜 번호라 "찾을 수 없어요"(011 연결 때 해결)
- 검증용 데이터(공용 DB): 반려동물 "구름"(petSn 17)에 검진기록 1001·처방약 443("검증용 투약", 하루 2회, 2026-10-31~11-07) → 케어 항목 3272. 투약 확인에 다시 쓴다. 계정은 저장소에 적지 않는다. 사람 확인 때 만든 검진기록 1026("ff", 일정 4915에 연결)과 다른 반려동물로 옮겼을 수 있는 1016은 지우지 않고 남아 있다

- 연결 남음(공용 · PetFace 올리기): 캐릭터 얼굴 이미지 실제 응답 `GET /pets/{petSn}/character-image?part=face` (LJS 백엔드, 지금은 502라 기본 아이콘)
- 연결 남음(공용 · 영수증 사용처 키): 가계부 지출 생성·중복 확인 실제 호출 (SJM, `receiptApi.js` 가짜는 `expndYmd`·`expndAmt`·`dtlMttr: ''`·`expndPlcusNm`). `expsCtgrCd`·`inputMthdCd`는 담당자 답변에 없어 그대로 둠
- 참고(SCR-HLT-002, 실패 아님): 최근 건강기록 모바일 한 줄 요약은 기록 있는 종류만 잇는다. 390px 그래프 x축 날짜 글자가 붙는다(이전부터). 폭이 정확히 760px이면 `isLarge` 모달이 `max-[760px]`·`min-[761px]` 어느 쪽에도 걸리지 않아 기본 크기로 열린다(이전부터)
- 알릴 것(시안 담당): 건강 일지 반려동물 선택이 칩 막대 → 초록 알약형 셀렉트(히어로 `bg-brand-500`·흰 글자, 이름 칸 세 글자 폭, 넘치면 말줄임)로 바뀌었다(추가-1~3). 오늘 기록하기 한 줄, 검진기록 제목 옆 연도 선택, 모바일 지속 관찰 목록→상세, 관찰 0건에도 카드 머리 등록 버튼, 상세 기록 모달 높이 맞춤·✕ 없음, 검진상세 [건강 일지로 돌아가기] 삭제(추가-4)가 시안(`html/hlt-diary.html`)과 다르다. 사람이 시안을 갱신하기로 함. 페이지 바탕색 `#faf8f5`는 토큰이 없어 `DiaryPetBar.jsx`에 직접 값으로 썼다(토큰이 생기면 바꿈)
- 알릴 것(공용 파일 담당): `components/Modal.jsx`에 선택 속성 `isAutoHeight`(높이를 내용에 맞춤)·`isCloseIconHidden`(✕ 숨김), `components/DropdownSelect.jsx`에 `isPill`(알약형·히어로 색, 목록은 `min-w-max`)을 더했다. 모두 기본값 꺼짐이라 기존 화면은 그대로다. `components/Card.jsx`는 섹션 이름(`aria-labelledby`)이 제목 글자만 가리키게 id를 제목 `<span>`으로 옮겼다(모양 변화 없음)
- 연결 남음(SCR-HLT-002): 002-01 캐릭터 이미지 (LJS), 002-09~13·15~25·32·33 일상 기록·관찰 API (JAJ 백엔드)

- 결정 필요(SCR-HLT-011, 디자인 담당): 명세와 디자인이 다르다. 사람이 디자인 파일이 맞다고 했다. 명세를 디자인에 맞게 고칠지 정한다. (1) FN-HLT-011-02 "캐릭터 없으면 예시 그림" vs 지금 "캐릭터 만들기" 점선 카드(추가-5·14), (2) FN-HLT-011-07 "이탈 판정 없음" vs 범위를 벗어난 구간·점·마지막 값 빨간색, (3) 모바일 히어로·묶음 탭·검사 수치·관찰 기록 배치(추가-11~18)와 그래프 최대·최소 왼쪽 눈금은 시안·명세에 없다
- 참고(SCR-HLT-011): 칩 줄이 여러 줄로 꺾이면(`?fakePets=8`) 세로 구분선·등록 버튼이 마지막 줄 맨 앞으로 내려간다. 390px에서는 칩 줄이 가로로 밀려 등록 버튼이 화면 밖에 있다. 기준안에 없어 그대로 뒀다. `ConditionCard` 목록 key가 같은 항목이 두 번이면 겹칠 수 있다
- 결정 필요(LJS): 히어로 색 `#f9eaa6`(선택 칩·기준일 점)·`#dbe8e8`(글자)은 토큰이 없다. 공용 `assets/index.css`에 토큰을 더할지 정한다
- 연결 남음(SCR-HLT-011): 반려동물 목록·프로필 `getPets`와 필드 `petSeCd`·`chrcSttsCd`·`petRelCd`(지금 건강기록 가짜는 `chrctrImgPath`, 반려동물 도메인 가짜와 petSn도 다름) (SJM), 캐릭터 이미지·생성 상태 (LJS), 반려동물별 종합 조회와 첨부 파일 주소 `summaryApi.js` 가짜(`getFakeCheckups`·`getCheckupTabs`) → 실제 호출 (JAJ 백엔드)
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

- 영수증 등록 가짜 확인용 쿼리(개발 환경만): `?fakeReceipt=zones`·`nozone`, `?fakeLedgerDup=1`, `?fakeReceiptSave=fail`. 인식 실패·15초 초과는 업로드 파일 이름에 `fail`·`slow`
- 알릴 것(LJS): `routes/domains/devRoutes.js`의 영수증 DEV 화면은 "건강 일지가 영수증 모달을 열면 지움"이라 지워도 된다
- 연결 남음: 반려동물 프로필(체중 정상범위·목표) (SJM), 캐릭터 이미지 조회 (LJS), 케어 완료의 케어미션·포인트 반영 (SJM), 일상 기록·관찰 API `diaryApi.js` 가짜 응답을 실제 호출로 교체 (JAJ 백엔드), 영수증 번호를 검진기록에 연결(검진기록 API에 `recptSn` 없음, LJS·JAJ 백엔드와 맞춘 뒤)
- 결정 필요: 공용 `ConfirmModal`을 시안 스타일로 맞출지, 우측 아래 플로팅 버튼(시안은 고양이 이미지)을 맞출지(LJS 파일). 앱 전체 본문 줄 높이를 시안 1.6으로 할지(지금은 건강 일지 안에서만 맞춤). 식사량·음수량·산책 그래프의 "최근 14개"를 기록 14건이 걸친 날의 합계로 그렸는데 14일로 바꿀지
- 영수증 등록 연결 남음: 영수증 인식 결과 전체(YAY, 지금은 LJS 인식 응답 + `receiptApi.js` `getReceiptDetail` 가짜)
- 알릴 것(LJS): 공용 `layouts/UserHeader.jsx`·`NotificationDropdown.jsx`·`ProfileDropdown.jsx`를 시안 기준으로 수정(Material 아이콘, 새 `headerStyles.js`·`assets/user.svg`), `Card`·`buttonStyles`·`SideMenu`·`PetTabs`(SCR-HLT-003에서 삭제) 줄 높이·색·비활성 스타일 수정, 로컬 Pretendard 글꼴 추가(`assets/fonts/PretendardVariable.woff2` 약 2MB, `index.css` `@font-face`), `eslint.config.js`에 `html` 제외
