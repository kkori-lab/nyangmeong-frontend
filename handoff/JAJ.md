# JAJ 핸드오프

## 지금 하는 것

끝남: SCR-HLT-002 영수증 [직접 입력] 저장 연결 (2026-11-03). 검증 통과(잠금을 한 번 풀어 회차를 다시 셈), 사람 확인 끝. `CheckupModal`이 `recptSn`을 받으면 `POST /receipts/{recptSn}/checkups?petSn=`(`idmptDmndId` 모달마다 1개)로 저장하고, 없으면 지금처럼 `/pets/{petSn}/checkups`. 409·404는 토스트 대신 모달 안 빨간 안내 상자(추가-1, 토스트가 `<dialog>` 뒤에 가려짐). `HealthDiaryPage` manual 상태 키 `rcptSn` → `recptSn`. 일시 오류 뒤 [직접 입력]은 영수증 번호가 없어 연결 남음

## 다음에 할 것

- 연결 남음(SCR-HLT-002 일시 오류 뒤 [직접 입력]의 영수증 연결): AI 서버 영수증 분석 502 `OCR_API_ERROR`·504 시간 초과 응답에 `recptSn`이 없어(원본은 먼저 저장됨) 화면이 `POST /pets/{petSn}/checkups`로 저장한다(FN-HLT-002-31 "인식 실패·일시 오류"와 다름). 필요: AI 서버가 오류 응답에 `recptSn`을 준다(nyangmeong-ai 저장소에서 /start), LJS `features/ai/receipt/ReceiptUploadModal.jsx`가 오류 때도 `recptSn`을 [직접 입력]에 넘긴다. 백엔드는 일시 오류 영수증 저장을 이미 받고, `CheckupModal`은 `recptSn`만 받으면 영수증 경로로 저장한다. 브라우저 쪽 시간 초과(요청 중단)는 번호를 알 수 없어 남는다
- 연결 남음(SCR-HLT-002 추가-2): 백엔드 `save-check`도 저장완료 영수증이면 409 `RECEIPT_ALREADY_SAVED`를 준다(백엔드 저장소에서 /start). 프론트는 이미 같은 안내로 처리한다
- 정리 필요(공용 DB, DB 담당): 검증 계정 누리(petSn 20)의 확인용 영수증 504·506·507·509·510·511·512·513(지우는 API 없음, 512는 Vision 키 없이 올린 일시 오류 영수증으로 보임). 검진기록 1002·처방약 443·가계부 10401·일정 4916은 지웠다
- 참고(로컬 확인): AI 서버 영수증 인식은 nyangmeong-ai `.env.local`의 `GOOGLE_VISION_API_KEY`가 없으면 502. 검증은 백엔드 내부 API(`POST /internal/ai/receipts` → `/{recptSn}/result` RECOGNIZED)로 영수증을 만들고 `/ai/receipts` 응답만 route로 줬다. 백엔드가 DevTools 재시작만 되고 옛 클래스로 돌면 새 API가 404이니 완전히 다시 띄운다
- 참고(SCR-HLT-007 PDF 분석): 분석 항목 이름은 목록 12종 코드면 약어, 아니면 `inspArtclDrctInptNm`. 둘 다 없으면 `inspArtclCd`를 그대로 보인다(`labInput/labRows.js` `getAnalyzedName`, 실제 응답에서는 안 나옴). 이때 보일 이름은 정하지 않았다. 저장 제외 행(혈액검사 아님)에도 "인식 실패" placeholder가 붙는다. 실패 안내는 `useAnalyzeLabPdf` 토스트 대신 화면이 보인다
- 참고(SCR-HLT-011 캐릭터 상태): 히어로 큰 이미지는 `GET /pixel-characters`(LJS) 행의 `pixelCharSn`이 없는 주양육 반려동물만 "캐릭터 만들기" 카드, 행이 없거나 조회 실패면 `PetFace`. 칩은 그대로. 생성 중(`CHRC0001`·`0002`)·실패(`CHRC0004`)는 백엔드 `character-image`가 종별 기본 캐릭터를 주므로 따로 표시하지 않는다(사람 결정)
- 알릴 것(명세 담당): 지속 관찰 회차 수정에서 사진은 바꿀 수만 있고 뺄 수 없다(수정 모달 보조 문구 "사진은 바꿀 수만 있어요"). 기능명세서 FN-HLT-002-22에 반영을 요청한다
- 참고(SCR-HLT-011): 타임라인 검진기록 행의 내용 줄은 목록 응답에 `ckupCn`이 없어 비어 있다. 예방접종 이력 이름은 `ckupTypeCdNm`. 예방접종은 `size=2`, 타임라인 검진기록은 `size=5`로 받은 뒤 오늘 이전만 거르므로 미래 날짜 검진기록이 있으면 표시 건수가 줄 수 있다. 첨부 썸네일·미리보기는 `summary/AttachmentImage.jsx`(검진상세 영상검사와 같은 캐시 키), PDF는 Blob으로 내려받는다. `PhotoModal`은 비공개 이미지를 `children`으로 받는다. 캐릭터가 없는 반려동물은 `character-image` 404가 콘솔에 남는다
- 검증용 데이터(공용 DB): 핸드오프에 적었던 예전 검증 데이터(검진기록 1001·1026·1016, 처방약 443, 케어 항목 3272, 첨부 430, 지속 관찰 사진)는 2026-11-03 확인 때 검증 계정의 구름(petSn 17)에 없음. 지금 구름에는 검진기록 274와 그 처방약·첨부·연동 케어 항목만 있다. 계정은 저장소에 적지 않는다
- 알릴 것(공용 `api/axios.js`·백엔드 인증 담당): 지속 관찰 검증 중 액세스 쿠키가 만료되자 POST가 `TOKEN_EXPIRED`가 아닌 401을 받아 재발급 없이 로그인 화면으로 갔다(뒤에 `/auth/refresh`는 200)
- 알릴 것(백엔드 기준 데이터): SDMA `HLTC0078`이 백엔드 `db/20261030_insert_base_data_v0.11.sql` HLTG12에 없다. 공용 DB에는 사람이 넣었다. 새로 DB를 만들면 SDMA 저장이 500이 난다
- 알릴 것(팀): 검진상세·검사 수치 입력 주소가 `/health/pets/:petSn/checkups/:ckupRcdSn`(`/inspections`)로 바뀌었다(`routes/paths.js`, `docs/routes.md` HLT-005·007). `docs/routes.md` 0장 규칙은 JAJ가 직접 고치고 팀에 공유한다
- 참고(SCR-HLT-002·005): 관찰 사진 캐시 키는 `healthKeys.observationPhoto`(사진을 바꾼 수정만 다시 받음). 일상 기록 그래프는 선택 지표만 `size=14`, 식사량·음수량·산책은 `fromYmd`로 한 번 더. 검진기록 연도 목록은 `size=1` 두 번. 첨부 목록은 서버 최대 50건. 기능 태그는 `labInput/bloodItems.js`에서 약어로 찾는다. 반복 예방 "처방약 연동" 배지는 이전 문구 그대로
- 연결 남음(공용 · PetFace 올리기): 캐릭터 얼굴 이미지 실제 응답 `GET /pets/{petSn}/character-image?part=face` (LJS 백엔드)
- 참고(SCR-HLT-002, 실패 아님): 최근 건강기록 모바일 한 줄 요약은 기록 있는 종류만 잇는다. 390px 그래프 x축 날짜 글자가 붙는다. 폭이 정확히 760px이면 `isLarge` 모달이 기본 크기로 열린다(이전부터)
- 알릴 것(시안 담당): 건강 일지 반려동물 선택이 칩 막대 → 초록 알약형 셀렉트로 바뀌었다(추가-1~3). 오늘 기록하기 한 줄, 검진기록 제목 옆 연도 선택, 모바일 지속 관찰 목록→상세, 관찰 0건에도 카드 머리 등록 버튼, 상세 기록 모달 높이 맞춤·✕ 없음, 검진상세 [건강 일지로 돌아가기] 삭제(추가-4)가 시안(`html/hlt-diary.html`)과 다르다. 사람이 시안을 갱신하기로 함. 페이지 바탕색 `#faf8f5`는 토큰이 없어 `DiaryPetBar.jsx`에 직접 썼다
- 알릴 것(공용 파일 담당): `components/Modal.jsx` `isAutoHeight`·`isCloseIconHidden`, `components/DropdownSelect.jsx` `isPill`, `components/Card.jsx` `leading`을 더했다(모두 기본값 꺼짐). `Card.jsx`는 `aria-labelledby` id를 제목 `<span>`으로 옮겼다. `features/health/PetTabs.jsx`는 지웠다
- 연결 남음(SCR-HLT-002·003): 002-01·003 캐릭터 이미지 (LJS), 003 케어미션·포인트 반영 (SJM), 반려동물 프로필 체중 정상범위·목표 (SJM), 영수증 인식 결과 전체(YAY, 지금은 LJS 인식 응답)

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
- 알릴 것(LJS): `routes/domains/devRoutes.js`의 영수증 DEV 화면은 지워도 된다. 공용 `layouts/UserHeader.jsx`·`NotificationDropdown.jsx`·`ProfileDropdown.jsx`를 시안 기준으로 수정(새 `headerStyles.js`·`assets/user.svg`), 로컬 Pretendard 글꼴 추가(`assets/fonts/PretendardVariable.woff2` 약 2MB), `eslint.config.js`에 `html` 제외
- 결정 필요: 공용 `ConfirmModal`·우측 아래 플로팅 버튼을 시안 스타일로 맞출지(LJS 파일). 앱 전체 본문 줄 높이를 시안 1.6으로 할지. 식사량·음수량·산책 그래프 "최근 14개"를 14일로 바꿀지
