# JAJ 핸드오프

## 지금 하는 것

끝남: 공용 · PetFace 올리기, 공용 · 영수증 사용처 키, 그리고 건강 일지(SCR-HLT-002) 추가 요청 20건(PC 칩·탭 막대, 오늘 기록하기 한 줄, 검진기록 연도 선택, 모바일 반영·지속 관찰 목록→상세 등) (2026-10-26). 검증 통과, 사람 확인 완료

## 다음에 할 것

- 요청 보류(SCR-HLT-002 상세 기록 모달, 공용 `components/Modal.jsx` 담당에게): "상세 기록" 모달(`RecentRecordTable.jsx` `DetailModal`)은 `isLarge`가 높이를 고정해 표 아래가 비고, 오른쪽 위 ✕도 있다. 기본값 꺼짐인 선택 속성 `isAutoHeight`(높이를 내용에 맞추고 화면을 넘으면 안쪽 스크롤)와 `isCloseIconHidden`(✕ 숨김, 배경 클릭·ESC는 유지)을 `Modal.jsx`에 더해 달라고 요청한다. 답을 받기 전까지 `Modal.jsx`는 원래대로이고 모달은 이전 모양이다(닫기 버튼만 오른쪽 끝). 승인되면 `DetailModal`에 두 속성만 켠다
- 연결 남음(공용 · PetFace 올리기): 캐릭터 얼굴 이미지 실제 응답 `GET /pets/{petSn}/character-image?part=face` (LJS 백엔드, 지금은 502라 기본 아이콘)
- 연결 남음(공용 · 영수증 사용처 키): 가계부 지출 생성·중복 확인 실제 호출 (SJM, `receiptApi.js` 가짜는 `expndYmd`·`expndAmt`·`dtlMttr: ''`·`expndPlcusNm`). `expsCtgrCd`·`inputMthdCd`는 담당자 답변에 없어 그대로 둠
- 연결 남음(SCR-HLT-002 칩 막대): `features/health/diary/DiaryPetBar.jsx`의 사진 원이 건강 도메인 가짜 `chrctrImgPath`를 `<img>`로 쓴다. 반려동물 목록을 실제 API로 연결할 때 공용 `components/PetFace`(`petSn`·`petSeCd`·`chrcSttsCd`)로 바꾼다 (SJM·LJS 연결 때)
- 참고(SCR-HLT-002, 실패 아님): 모바일 지속 관찰에서 크기가 없는 회차를 고르면 그래프 말풍선이 마지막 점에 남는다. 상세(`?obsv=`)를 연 채 반려동물을 바꾸면 주소에 `?obsv=`가 남는다(화면은 목록). 최근 건강기록 모바일 한 줄 요약은 기록 있는 종류만 잇는다. 검진기록 연도 선택이 `Card`의 `sub`(헤딩 안)에 있어 헤딩 이름에 연도 목록이 섞인다. 390px 그래프 x축 날짜 글자가 붙는다(이전부터). 지속 관찰 모바일 목록에서 오른쪽 값이 길면 "위치 · 회차"가 말줄임된다
- 알릴 것(시안 담당): 건강 일지 칩·탭 막대, 오늘 기록하기 한 줄, 검진기록 제목 옆 연도 선택, 모바일 지속 관찰 목록→상세가 시안(`html/hlt-diary.html`)과 다르다. 사람이 시안을 갱신하기로 함. 페이지 바탕색 `#faf8f5`는 토큰이 없어 `DiaryPetBar.jsx`에 직접 값으로 썼다(토큰이 생기면 바꿈)
- 결정 필요(SCR-HLT-002): 관찰 항목이 0건이면 카드 머리 [관찰 항목 등록]이 숨고 빈 안내 버튼만 남는다. 시안 `html/hlt-diary.html` 151행에는 머리 버튼이 있다. 의도인지 정한다
- 연결 남음(SCR-HLT-002): FN-HLT-002-01 반려동물 목록 (SJM), 002-01 캐릭터 이미지 (LJS), 002-09~13·15~33 일상 기록·관찰·검진기록 API (JAJ 백엔드)

- 결정 필요(SCR-HLT-011, 디자인 담당): 명세와 디자인이 다르다. 사람이 디자인 파일이 맞다고 했다. 명세를 디자인에 맞게 고칠지 정한다. (1) FN-HLT-011-02 "캐릭터 없으면 예시 그림" vs 지금 "캐릭터 만들기" 점선 카드(추가-5·14), (2) FN-HLT-011-07 "이탈 판정 없음" vs 범위를 벗어난 구간·점·마지막 값 빨간색, (3) 모바일 히어로·묶음 탭·검사 수치·관찰 기록 배치(추가-11~18)와 그래프 최대·최소 왼쪽 눈금은 시안·명세에 없다
- 참고(SCR-HLT-011): 칩 줄이 여러 줄로 꺾이면(`?fakePets=8`) 세로 구분선·등록 버튼이 마지막 줄 맨 앞으로 내려간다. 390px에서는 칩 줄이 가로로 밀려 등록 버튼이 화면 밖에 있다. 기준안에 없어 그대로 뒀다. `ConditionCard` 목록 key가 같은 항목이 두 번이면 겹칠 수 있다
- 결정 필요(LJS): 히어로 색 `#f9eaa6`(선택 칩·기준일 점)·`#dbe8e8`(글자)은 토큰이 없다. 공용 `assets/index.css`에 토큰을 더할지 정한다
- 연결 남음(SCR-HLT-011): 반려동물 목록·프로필 `getPets`와 필드 `petSeCd`·`chrcSttsCd`·`petRelCd`(지금 건강기록 가짜는 `chrctrImgPath`, 반려동물 도메인 가짜와 petSn도 다름) (SJM), 캐릭터 이미지·생성 상태 (LJS), 반려동물별 종합 조회와 첨부 파일 주소 `summaryApi.js` 가짜 → 실제 호출 (JAJ 백엔드)
- 참고(SCR-HLT-011): 개발용 `?fakePets=8`(미생성·공동양육 포함 8마리, 늘어난 5마리는 앞 세 마리 프로필을 돌려 씀). `features/health/diary/LineChart.jsx` 선택 속성: `bandLabelSide`, `isLeftColumn`(모바일 건강기록 변화), `activeIndex`(모바일 지속 관찰). 모바일 프로필 태그는 7px 여유라 실제 데이터의 긴 값이면 넘칠 수 있다

- 결정 필요(SCR-HLT-003 추가 요청): 명세 v1.1·시안과 달라졌다. 한 화면 세로 배치 → 탭 둘(캘린더·케어리스트, 추가-6), [새 일정 등록]이 날짜 상세 카드 오른쪽 위(추가-1), 카드 머리 버튼·빈 상태 버튼이 채운 주 버튼 색(추가-2·5, 시안은 `btn-soft`), 오른쪽 열 높이 배분(추가-3), 구역 제목·기록 내용 제목의 굵은 구분선(추가-7·8)을 고칠지 정한다. 시안은 퍼블리싱 담당에게 알린다
- 참고(SCR-HLT-003): 390px에서 날짜 상세 카드 제목이 말줄임되고 부제가 두 줄로 꺾인다(추가-1의 부작용). 탭 선택은 주소 `#`를 읽지 않는다. 가짜 일정 5건(`api.js` schdlSn 9~13)은 오늘+2일이라 날마다 이동한다
- 연결 남음(SCR-HLT-003): 반려동물 목록 (SJM), 캐릭터 이미지 (LJS), 케어미션·포인트 반영 (SJM), 일정·케어 API `features/health/api.js` 가짜 응답을 실제 호출로 교체 (JAJ 백엔드)

- 결정 필요(SCR-HLT-002 추가 요청): 명세 v1.1·시안과 달라졌다. 명세 FN-HLT-002-13(날짜 행 클릭 펼침, 5·3·2칸 → 행 클릭 시 상세 모달 하나의 표, 조회기간 3·7·14일 기본 3일), 앵커 → 탭, 제목 옆 글자 14px, [관찰 항목 등록] 채운 주 버튼(시안은 `btn-soft`)을 고칠지 정한다. 검사 수치 추가가 아래에 열리는 것은 검진상세 SCR-HLT-005·검사 수치 입력 SCR-HLT-007 명세와 다르다
- 참고: 건강 일지 탭은 처음 열 때만 주소 `#`를 읽는다. `BloodResultForm.jsx`의 입력 검사가 `labInput/LabInput.jsx`와 거의 같아 한 곳으로 합칠 수 있다

- 결정 필요(SCR-HLT-007 추가-1): 검사 결과 행을 어디나 누르면 수정 화면으로 가게 바꾸면서(`BloodResultList.jsx`) 검진상세에서 종합 건강기록 검사 수치 추이(`/health?inspection=<항목>`)로 가는 길이 없어졌다. 기능명세서 FN-HLT-005-02를 고칠지, 추이로 가는 다른 길을 둘지 정한다
- SCR-HLT-007 참고(실패 아님): [직접 입력하기] 뒤에도 주소가 `?mode=pdf&atch=<번호>`에 남아 새로고침하면 분석이 다시 뜬다(기획은 `?mode=manual`로 바꾸는 것). `labInput/ItemSelect.jsx` 목록에서 묶음 행과 항목 행 key가 `GLU`로 겹쳐 콘솔 경고. PDF 진입 때 아래 입력칸은 선택(비우면 분석 행만 저장)으로 구현했다
- 연결 남음(SCR-HLT-007): 검사결과지 PDF 분석 호출부 (LJS, `checkupApi.js` `analyzeLabPdf` 가짜, 응답의 `bloodYn`은 가정), 검사 결과 생성·수정 API (JAJ 백엔드, `createInspections`·`updateInspection` 가짜)

- 알려진 결함(검증 1회차 실패 항목, 코드는 아직 고치지 않음): `features/health/checkup/CheckupInfoCard.jsx`에서 [검진기록 수정] 모달로 저장해도 카드가 인라인 수정 상태로 남고, 이어서 카드의 [저장하기]를 누르면 모달에서 고친 검진 내용이 옛 값으로 돌아간다. 모달 저장 성공 때 조회 상태로 돌리거나 초안을 새 값으로 다시 채우면 된다
- 연결 남음: 검진상세의 검진기록·검사 결과·첨부 자료·처방약·반복 예방 API (JAJ 백엔드, `checkupApi.js`·`diaryApi.js` 가짜 응답을 실제 호출로 교체), 검사결과지 PDF 분석 호출부 (LJS). 007·011 도착 화면은 각 마일스톤에서 만든다
- 영수증 등록 가짜 확인용 쿼리(개발 환경만): `?fakeReceipt=zones`·`nozone`, `?fakeLedgerDup=1`, `?fakeReceiptSave=fail`. 인식 실패·15초 초과는 업로드 파일 이름에 `fail`·`slow`
- 알릴 것(LJS): `routes/domains/devRoutes.js`의 영수증 DEV 화면은 "건강 일지가 영수증 모달을 열면 지움"이라 지워도 된다
- 연결 남음: 반려동물 목록·프로필(체중 정상범위·목표 포함) `getPets` (SJM), 캐릭터 이미지 조회 (LJS), 케어 완료의 케어미션·포인트 반영 (SJM), 일정·케어·일상 기록·관찰·검진기록 API `features/health/api.js`·`diaryApi.js` 가짜 응답을 실제 호출로 교체 (JAJ 백엔드)
- 결정 필요: 공용 `ConfirmModal`을 시안 스타일로 맞출지, 우측 아래 플로팅 버튼(시안은 고양이 이미지)을 맞출지(LJS 파일). 앱 전체 본문 줄 높이를 시안 1.6으로 할지(지금은 건강 일지 안에서만 맞춤). 식사량·음수량·산책 그래프의 "최근 14개"를 기록 14건이 걸친 날의 합계로 그렸는데 14일로 바꿀지
- 영수증 등록 연결 남음: 영수증 인식 결과 전체(YAY, 지금은 LJS 인식 응답 + `receiptApi.js` `getReceiptDetail` 가짜)
- 알릴 것(LJS): 공용 `layouts/UserHeader.jsx`·`NotificationDropdown.jsx`·`ProfileDropdown.jsx`를 시안 기준으로 수정(Material 아이콘, 새 `headerStyles.js`·`assets/user.svg`), `Card`·`buttonStyles`·`SideMenu`·`PetTabs` 줄 높이·색·비활성 스타일 수정, 로컬 Pretendard 글꼴 추가(`assets/fonts/PretendardVariable.woff2` 약 2MB, `index.css` `@font-face`), `eslint.config.js`에 `html` 제외
