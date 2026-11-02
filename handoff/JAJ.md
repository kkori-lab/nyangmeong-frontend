# JAJ 핸드오프

## 지금 하는 것

끝남: SCR-HLT-011 종합 건강기록 · 캐릭터 상태 연결 (2026-11-01). 검증 통과, 사람 확인 끝. `GET /pixel-characters`(LJS)로 주양육·캐릭터 미생성(`pixelCharSn` 없음) 반려동물의 히어로 큰 이미지 자리에 "캐릭터 만들기" 카드를 되살림. 생성 중·실패·공동양육·조회 실패는 `PetFace`(사람 결정)

## 다음에 할 것

- 참고(SCR-HLT-011 캐릭터 상태): 히어로 큰 이미지는 `GET /pixel-characters`(LJS) 행의 `pixelCharSn`이 없는 주양육 반려동물만 "캐릭터 만들기" 카드, 행이 없거나 조회 실패면 `PetFace`. 칩은 그대로. 생성 중(`CHRC0001`·`0002`)·실패(`CHRC0004`)는 백엔드 `character-image`가 종별 기본 캐릭터를 주므로 따로 표시하지 않는다(사람 결정)
- 연결 남음: FN-HLT-002-19·23·24 회차 수정 비우기 (백엔드 연결 `PATCH …/observation-cycles/{obsrvCyclSn}`, 백엔드 저장소에서 /start, 백엔드 `milestones/JAJ.md`에 대기 절 있음): 보내지 않은 값과 빈 값을 모두 "안 바꿈"으로 받아 크기(`obsrvSz`)·메모(`memoCn`)·변화(`obsrvChgCd`)를 지울 수 없다. 백엔드가 바뀐 뒤 `diaryApi.js` `updateObservationCycle`이 빈 칸도 보내게 바꾸고(지금은 `appendIfFilled`), 비워 저장하면 상세에서 그 줄이 사라지는지 확인한다
- 연결 남음(SCR-HLT-007): FN-HLT-007-02·03 수정 화면의 참고범위 비우기 (백엔드 연결 `PATCH /pets/{petSn}/inspection-values/{inspNvlSn}`가 `null`을 "안 바꿈"으로 받음, 백엔드 저장소에서 /start. 지금은 화면이 막음), FN-HLT-007-04·06 검사결과지 PDF 분석 호출부 (LJS, `checkupApi.js` `analyzeLabPdf` 가짜, 응답의 `bloodYn`은 가정)
- 참고(SCR-HLT-011): 타임라인 검진기록 행의 내용 줄은 목록 응답에 `ckupCn`이 없어 비어 있다. 예방접종 이력 이름은 `ckupTypeCdNm`. 예방접종은 `size=2`, 타임라인 검진기록은 `size=5`로 받은 뒤 오늘 이전만 거르므로 미래 날짜 검진기록이 있으면 표시 건수가 줄 수 있다. 첨부 썸네일·미리보기는 `summary/AttachmentImage.jsx`(검진상세 영상검사와 같은 캐시 키), PDF는 Blob으로 내려받는다. `PhotoModal`은 비공개 이미지를 `children`으로 받는다. 캐릭터가 없는 반려동물은 `character-image` 404가 콘솔에 남는다
- 검증용 데이터(공용 DB): 반려동물 "구름"(petSn 17)에 검진기록 1001·처방약 443("검증용 투약") → 케어 항목 3272. SCR-HLT-011 검증 때 같은 검진기록에 올린 첨부 430(`verify-summary.pdf`)은 사람 확인 뒤 지우기로 했다. 계정은 저장소에 적지 않는다. 검진기록 1026("ff", 일정 4915)·1016은 남아 있다
- 알릴 것(공용 `api/axios.js`·백엔드 인증 담당): 지속 관찰 검증 중 액세스 쿠키가 만료되자 POST가 `TOKEN_EXPIRED`가 아닌 401을 받아 재발급 없이 로그인 화면으로 갔다(뒤에 `/auth/refresh`는 200)
- 알릴 것(백엔드 기준 데이터): SDMA `HLTC0078`이 백엔드 `db/20261030_insert_base_data_v0.11.sql` HLTG12에 없다. 공용 DB에는 사람이 넣었다. 새로 DB를 만들면 SDMA 저장이 500이 난다
- 알릴 것(팀): 검진상세·검사 수치 입력 주소가 `/health/pets/:petSn/checkups/:ckupRcdSn`(`/inspections`)로 바뀌었다(`routes/paths.js`, `docs/routes.md` HLT-005·007). `docs/routes.md` 0장 규칙은 JAJ가 직접 고치고 팀에 공유한다
- 참고(SCR-HLT-002·005): 관찰 사진 캐시 키는 `healthKeys.observationPhoto`(사진을 바꾼 수정만 다시 받음). 일상 기록 그래프는 선택 지표만 `size=14`, 식사량·음수량·산책은 `fromYmd`로 한 번 더. 검진기록 연도 목록은 `size=1` 두 번. 영수증 저장은 반려동물마다 `POST checkups`를 따로 보내 중간 실패 때 앞 기록이 남고 `recptSn`·처방 약품·가계부는 가짜. 첨부 목록은 서버 최대 50건. 기능 태그는 `labInput/bloodItems.js`에서 약어로 찾는다. 반복 예방 "처방약 연동" 배지는 이전 문구 그대로. 지속 관찰 검증 사진 첨부 행 `ATCH_FILE_SN` 4191~4194·4197~4211과 파일은 남아 있다
- 연결 남음(공용 · PetFace 올리기): 캐릭터 얼굴 이미지 실제 응답 `GET /pets/{petSn}/character-image?part=face` (LJS 백엔드)
- 연결 남음(공용 · 영수증 사용처 키): 가계부 지출 생성·중복 확인 실제 호출 (SJM, `receiptApi.js` 가짜는 `expndYmd`·`expndAmt`·`dtlMttr: ''`·`expndPlcusNm`). `expsCtgrCd`·`inputMthdCd`는 담당자 답변에 없어 그대로 둠
- 참고(SCR-HLT-002, 실패 아님): 최근 건강기록 모바일 한 줄 요약은 기록 있는 종류만 잇는다. 390px 그래프 x축 날짜 글자가 붙는다. 폭이 정확히 760px이면 `isLarge` 모달이 기본 크기로 열린다(이전부터)
- 알릴 것(시안 담당): 건강 일지 반려동물 선택이 칩 막대 → 초록 알약형 셀렉트로 바뀌었다(추가-1~3). 오늘 기록하기 한 줄, 검진기록 제목 옆 연도 선택, 모바일 지속 관찰 목록→상세, 관찰 0건에도 카드 머리 등록 버튼, 상세 기록 모달 높이 맞춤·✕ 없음, 검진상세 [건강 일지로 돌아가기] 삭제(추가-4)가 시안(`html/hlt-diary.html`)과 다르다. 사람이 시안을 갱신하기로 함. 페이지 바탕색 `#faf8f5`는 토큰이 없어 `DiaryPetBar.jsx`에 직접 썼다
- 알릴 것(공용 파일 담당): `components/Modal.jsx` `isAutoHeight`·`isCloseIconHidden`, `components/DropdownSelect.jsx` `isPill`, `components/Card.jsx` `leading`을 더했다(모두 기본값 꺼짐). `Card.jsx`는 `aria-labelledby` id를 제목 `<span>`으로 옮겼다. `features/health/PetTabs.jsx`는 지웠다
- 연결 남음(SCR-HLT-002·003): 002-01·003 캐릭터 이미지 (LJS), 003 케어미션·포인트 반영 (SJM), 반려동물 프로필 체중 정상범위·목표 (SJM), 영수증 번호를 검진기록에 연결(검진기록 API에 `recptSn` 없음, LJS·JAJ 백엔드와 맞춘 뒤), 영수증 인식 결과 전체(YAY, 지금은 LJS 인식 응답 + `receiptApi.js` `getReceiptDetail` 가짜)

- 결정 필요(SCR-HLT-011, 디자인 담당): 명세와 디자인이 다르다. 사람이 디자인 파일이 맞다고 했다. 명세를 디자인에 맞게 고칠지 정한다. (1) FN-HLT-011-02 "캐릭터 없으면 예시 그림" vs 지금 디자인의 "캐릭터 만들기" 카드(주양육·미생성, 2026-11-01 되살림), (2) FN-HLT-011-07 "이탈 판정 없음" vs 범위를 벗어난 구간·점·마지막 값 빨간색, (3) 모바일 히어로·묶음 탭·검사 수치·관찰 기록 배치(추가-11~18)와 그래프 최대·최소 왼쪽 눈금은 시안·명세에 없다
- 참고(SCR-HLT-011): 칩 줄이 여러 줄로 꺾이면 세로 구분선·등록 버튼이 마지막 줄 맨 앞으로 내려간다(10마리 계정에서 보임). 390px에서는 칩 줄이 가로로 밀려 등록 버튼이 화면 밖에 있다. `ConditionCard` 목록 key가 같은 항목이 두 번이면 겹칠 수 있다. `diary/LineChart.jsx` 선택 속성: `bandLabelSide`, `isLeftColumn`, `activeIndex`. 모바일 프로필 태그는 긴 값이면 넘칠 수 있다
- 결정 필요(LJS): 히어로 색 `#f9eaa6`(선택 칩·기준일 점)·`#dbe8e8`(글자)은 토큰이 없다. 공용 `assets/index.css`에 토큰을 더할지 정한다
- 결정 필요(SCR-HLT-003 추가 요청): 명세 v1.1·시안과 달라졌다. 한 화면 세로 배치 → 탭 둘(추가-6), [새 일정 등록]이 날짜 상세 카드 오른쪽 위(추가-1), 카드 머리·빈 상태 버튼이 채운 주 버튼 색(추가-2·5), 오른쪽 열 높이 배분(추가-3), 굵은 구분선(추가-7·8)을 고칠지 정한다. 시안은 퍼블리싱 담당에게 알린다
- 결정 필요(SCR-HLT-003 결함 정리 추가 요청, 디자인 담당): FN-HLT-003-30 날짜 칸 80px → 88px(추가-5), 760px 이하는 점·막대(추가-12). FN-HLT-003-12 [출처 보기] 삭제(추가-4). FN-HLT-003-01 반려동물 선택 탭 → 알약형 셀렉트(추가-13). 모바일 케어 목록 둥근 칸·더보기 3칸·"오늘 n/N 완료" 숨김(추가-14·15), 처방약 연동 배지를 이름 옆으로(추가-10·17). 시안(`html/hlt-calendar.html`)은 퍼블리싱 담당에게 알린다
- 참고(SCR-HLT-003): 1280px에서 정기관리 구충제·심장사상충 예방 이름이 말줄임된다. 6줄인 달은 로딩 자리보다 달력이 88px(모바일 약 56px) 길다. 761~1100px 로딩 자리 높이는 따로 재지 않았다
- 결정 필요(SCR-HLT-002 추가 요청): 명세 FN-HLT-002-13(날짜 행 클릭 펼침 → 상세 모달 하나의 표, 조회기간 3·7·14일 기본 3일), 앵커 → 탭, 제목 옆 글자 14px, [관찰 항목 등록] 채운 주 버튼을 고칠지 정한다. 검사 수치 추가가 아래에 열리는 것은 SCR-HLT-005·007 명세와 다르다
- 참고: 건강 일지 탭은 처음 열 때만 주소 `#`를 읽는다. `BloodResultForm.jsx`의 입력 검사가 `labInput/LabInput.jsx`와 거의 같아 합칠 수 있다
- 결정 필요(SCR-HLT-007 추가-1): 검사 결과 행을 누르면 수정 화면으로 가게 바꾸면서(`BloodResultList.jsx`) 검진상세에서 종합 건강기록 추이(`/health?inspection=<항목>`)로 가는 길이 없어졌다. FN-HLT-005-02를 고칠지, 다른 길을 둘지 정한다
- SCR-HLT-007 참고(실패 아님): [직접 입력하기] 뒤에도 주소가 `?mode=pdf&atch=<번호>`에 남아 새로고침하면 분석이 다시 뜬다. `labInput/ItemSelect.jsx` 묶음 행과 항목 행 key가 `GLU`로 겹쳐 콘솔 경고. PDF 진입 때 아래 입력칸은 선택으로 구현했다
- 영수증 등록 가짜 확인용 쿼리(개발 환경만): `?fakeReceipt=zones`·`nozone`, `?fakeLedgerDup=1`, `?fakeReceiptSave=fail`. 인식 실패·15초 초과는 업로드 파일 이름에 `fail`·`slow`
- 알릴 것(LJS): `routes/domains/devRoutes.js`의 영수증 DEV 화면은 지워도 된다. 공용 `layouts/UserHeader.jsx`·`NotificationDropdown.jsx`·`ProfileDropdown.jsx`를 시안 기준으로 수정(새 `headerStyles.js`·`assets/user.svg`), 로컬 Pretendard 글꼴 추가(`assets/fonts/PretendardVariable.woff2` 약 2MB), `eslint.config.js`에 `html` 제외
- 결정 필요: 공용 `ConfirmModal`·우측 아래 플로팅 버튼을 시안 스타일로 맞출지(LJS 파일). 앱 전체 본문 줄 높이를 시안 1.6으로 할지. 식사량·음수량·산책 그래프 "최근 14개"를 14일로 바꿀지
