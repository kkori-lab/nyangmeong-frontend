# LJS 핸드오프

## 지금 하는 것

끝남: SCR-COM-002 공용 달 선택 추가 (2026-11-25, 검증 2회차 통과·사람 확인). M1 `MonthPicker` 막는 규칙은 넘길 때만 · M2 모든 `DatePicker` 연·월 칸 기본 켬 · M3 케어 캘린더 연월 달 고르기 · M4 390px · 추가-1 `DatePicker` 날짜 → 월 → 연도(12년 칸) · 추가-2 `MonthPicker` `yearSelect`(기본 꺼짐, 케어 캘린더만 켬, 마이페이지는 그대로)

## 다음에 할 것

- SCR-COM-002 달 선택 팀 알림(PR 본문 + 팀 채널): 모두 — 모든 `DatePicker` 달력 헤더 "YYYY년 M월 ▾"로 연·월 칸, 그 위 "YYYY년 ▾"로 12년 칸(끄려면 `monthSelect={false}`). JAJ — 케어 캘린더(`MonthCalendar`·`CareCalendarPage`) 연월을 눌러 달·연도를 고름(◀ ▶ 그대로, `onSelectMonth` prop). SJM — `MonthPicker`의 `enabledYms`·`maxYm`이 선택 prop(넘길 때만 막음, 안내 문구도 `enabledYms` 있을 때만), 새 `disabled`·`align`·`yearSelect`(기본 꺼짐). 가계부·포인트 동작 그대로
- SCR-COM-002 달 선택 이번엔 안 함: 케어미션 날짜 이동·관찰 사진 회차 이동(달 선택 아님), `TimeSelect`·펫돌봄 일정 시간 칸, ◀ ▶ 버튼 모양 통일(사람 결정: 그대로)
- 다음 후보: SCR-ADM-042 1:1 문의 · 펫돌봄 분쟁 작성자 매칭 목록 연결(마일스톤 대기, 백엔드 `GET /api/admin/care-matches?mbrSn=` develop 병합됨)
- SCR-ADM-030 회원 신고 사람이 고치는 문서: 관리자 기능명세서 FN-ADM-030-08 "대상은 게시글·댓글만" → 채팅 상대 회원 포함(대상 종류 회원, 조치 유지·회원 정지만, 자동 블라인드 제외), 화면설계서 SCR-ADM-030에 대상 「회원」·상세 신고된 회원·채팅방 줄
- SCR-ADM-030 회원 신고 이번엔 안 함: 채팅 원문 보기(서버가 주지 않음), 관리자에서 채팅방 열기
- SCR-ADM-030 회원 신고 참고(검증 보고, 판정 밖): 돌봄 글 제목이 없을 때 내용 "채팅"만 나오는 분기는 코드로만 확인. 같은 회원의 다른 접수 신고 함께 처리는 1건으로만 확인
- SCR-ADM-030 회원 신고 검증 데이터(8081 공용 DB, 지울 수 없어 남김): 신고 172(user0006 → 채팅방 261, 처리완료), 회원 133 정지 이력(해제됨)

- SCR-AIM-013 사진 칸 남은 것(판정 밖, 사람이 고칠지 정함): 관찰 기록 추가 카드 "관찰 항목" 줄이 부위 이름과 세부 위치가 같으면 "털 빠짐 · 등 · 등"으로 두 번 나옴, 관찰 항목 목록 조회 실패 때 "관찰 항목 233"처럼 번호만 보임(검진기록 줄처럼 "관찰 항목을 불러오지 못했어요"로). 둘 다 `features/ai/chat/ActionCardFields.jsx` `ObservationItemValue`
- 범위 밖에서 본 것(말만): 관찰 기록 추가 카드에 칸 이름 `obsrvChgCd`가 영어 그대로 라벨(`features/ai/shared/actionFields.js` 이름표에 없음)
- SCR-AIM-013 ai 저장소 몫(ai-1a에 전달 2026-11-24, ai가 다음 작업으로 정함): ① 사진 칸만 빈 채 확인 말이 오면 저장 글이 "등록할게요."인데 실행 안 됨 → 사람 결정 A: 11-20 결정("[확인] 버튼을 누르라고 안내하지 않음") 유지, 버튼을 말하지 않는 문구(예: "사진을 카드에 올려 주세요.")로, 파일 칸 카드 요약 안내 글에도 사진은 카드에서 올린다고 ② 이미 관찰 중인 항목이 있어도 lesion-card가 늘 새 항목(`draft_observation_item`)을 줘 같은 이름 항목이 생김 → 같은 부위면 `draft_observation_cycle`(ai 핸드오프 "피부 병변 분석 후속 ③"). ai가 고쳤다고 알리면 프론트에서 문구·카드 종류만 다시 본다
- SCR-AIM-013 사진 칸 팀 알림(PR 본문, JAJ): AI 대화창이 관찰 기록 추가 카드의 항목 이름을 보이려고 `GET /api/pets/{petSn}/observation-items`(`obsrvArtclSn`·`obsrvArtclNm`·`obsrvRegnCdNm`·`obsrvRegnDtlNm`)를 `features/ai/api.js`에서 따로 부르고, `POST …/observation-items`·`…/observation-cycles`(multipart `file`)를 확인 카드로 실행함. 응답·요청 칸이 바뀌면 알려 달라
- SCR-AIM-013 사진 칸 검증 데이터 정리(로컬 8080 DB, 누리 petSn 20 다견 계정): 지속 관찰 항목 226~229·233의 검증 기록(23:18·23:20)·234와 그 사진, AI 대화방 826~838 중 "[검증]"·"누리 … 관찰 기록" 계열(대화창 ⋮ 삭제)
- 참고: PR 캡처 `.playwright-mcp/pr/LJS-20261124-SCR-AIM-013-after-*.png`를 이번 검증이 덮어씀(같은 날 피부·PDF 작업 PR용이면 다시 찍기)
- 백엔드 세션에서: 로컬 백엔드 `LJS`에 `origin/develop`을 merge함(2026-11-24, `draft_observation_item` 필요). 푸시는 확인 안 함

- 핫픽스 배포 확인(사람): 배포 빌드에 `VITE_DEMO_MEMBER_*`·`VITE_DEMO_ADMIN_*` 값이 들어가 있는지. 없으면 운영에서는 바로 로그인 대신 로그인 화면으로 감(H3)
- 핫픽스 팀 알림(PR 본문 + 팀 채널, YAY): 랜딩 팝업(`features/landing/PortfolioModal`) 로그인 카드가 링크에서 버튼(`onDemoLogin`·`pendingKey`)으로 바뀌고, `pages/landing/LandingPage`가 데모 계정으로 바로 로그인(`useLogin`·`useFetchMe`, 실패하면 전처럼 `/login?method=email` + `state.demo`). 팝업 안내 문구 변경
- SCR-AIM-013 피부·눈 팀 알림(PR 본문 + 팀 채널): 모두: 공용 `hooks/useFloatingLayer` `getPortalTarget`가 `<dialog>`뿐 아니라 `role="dialog"`인 고정 창(AI 매니저 창·채팅 모달·모바일 메뉴 서랍·장소 팝업·반려동물 바꾸기 등)도 포털 대상으로 잡음 → 그 창 안의 `DropdownSelect`·`DatePicker`·`TimeSelect` 펼침 창이 body 대신 그 창에 붙음(`TimeSelect`도 같은 함수). JAJ: AI 대화창이 지속 관찰 항목 등록 `POST /api/pets/{petSn}/observation-items`(multipart, 분석한 사진 `file`)를 확인 카드로 실행함. 요청 칸이 바뀌면 알려 달라
- SCR-AIM-013 피부·눈 참고(검증 보고, 판정 밖): `role="dialog"` 다른 창들의 펼침 목록은 검증이 보지 않음(사람 확인 때 봄). 카드 [취소]·[확인] 직후 결과 줄이 "이렇게 할까요?" 요약 위에 보임(방을 다시 열면 맞음, `ConversationMessages` `placeCards` 자리 규칙, SCR-AIM-012부터). 분석 요약이 펼쳐지는 동안 그 아래 카드는 바로 보임
- SCR-AIM-013 피부·눈 사람이 고치는 문서: AI매니저 기능명세서 피부 분석 FN 행에 눈 분석(image-intent EYE·ASK 칩 [눈 분석])과 결과 저장(요약 메시지 + 지속 관찰 확인 카드, 사진 첨부), 화면설계서 SCR-AIM-013에 반려동물 되묻기·분석 중 [취소]·요약 + 카드
- SCR-AIM-013 피부·눈 검증 데이터 정리(8081 공용 DB, tester 계정): 까미 지속 관찰 "털 빠짐 · 등"·"눈곱 · 얼굴", AI 대화방 "[검증] 피부 봐줘"·"[검증] 까미 눈 봐줘 …" 계열·"[검증] 까미 피부 봐줘 실제"·"동물병원 일정 등록 요청"·"피부 상태 확인 요청"·"강아지 산책 횟수와 시간 기준"·"까미 발톱 깎기 2주 주기 일정 등록"·"강아지 발톱 깎기 주기와 관리 방법"·"[검증] 고양이 하루 물 섭취량은?"·"까미 피부 상태 봐줘" 안 검증 메시지·"사진 대화"(대화창 ⋮ 삭제). 까미 일정 "[검증]동물병원" 12-03 14:00(케어 캘린더)
- SCR-AIM-012 ai 저장소 몫(ai-23 받음 2026-11-24, ai 세션이 따로 기획): 확인 카드 요약 글의 빈 칸 되물음에 Java 칸 이름이 그대로 나옴("아직 일정 날짜, hrInptYn가 비어 있어요"). 안내 문구 "말로 알려 주세요"·"'등록해 줘'라고 말해 주세요"를 카드 [확인]·빈 칸 입력에 맞게 바꿀지는 사람 결정(ai 쪽 2026-11-20 결정 "[확인] 버튼을 누르라고 하지 않는다"와 다름)
- SCR-AIM-012 ai 저장소 몫(아직 안 보냄, 검증 보고): 카드에서 날짜·시간을 채운 뒤 다른 말을 보내면 `action.input`에 값이 실렸는데도 AI가 "날짜가 필요해요"로 답하고 카드를 주지 않음(done.action null)
- SCR-AIM-012 사람이 정할 것: 일정 카드 "시간 입력 | 예/아니요" 줄을 보기에서도 숨길지(일정 일시에 시간이 같이 보임)
- SCR-AIM-012 팀 알림(PR 본문, JAJ): AI 대화창 검사 수치 카드가 검진기록 목록 `GET /api/pets/{petSn}/checkups`(size 50, `content`의 `ckupRcdSn`·`ckupYmd`·`hsptlNm`)를 `features/ai/api.js`에서 따로 부름. 응답 모양을 바꾸면 알려 달라
- SCR-AIM-012 사람이 고치는 문서: AI매니저 기능명세서 FN-AIM-012-09·10·11(카드는 칸 이름·값 보기 + 빈 필수 칸만 카드에서 입력, 이미 있는 값은 말로 고침, [확인]·[취소]와 말로 하는 확인·취소 둘 다), 화면설계서 SCR-AIM-012에 검사 수치 카드(검진기록 고르기·항목 표)
- SCR-AIM-012 이번엔 안 함: FN-AIM-012-10 이미 값이 있는 칸을 카드에서 고치기, 관찰 기록 추가 사진 칸
- SCR-AIM-012 검증 데이터 정리(8081 공용 DB, tester 계정, 남았는지 확인): 까미 일정 "[검증] 동물병원"(12-01 15:00·11-30·11-29), 케어 항목 "[검증] 발톱 깎기", 검진기록 5(10-20 우리동물병원) 검사 수치 ALT 45·BUN 20, AI 대화방 "[검증] 까미 검사결과지야"·"[검증] 코코 검사결과지야"·"[검증] 취두부 검사결과지야"·"예방접종 예약 …"·"강아지 발톱 깎는 주기 문의"·"2주마다 [검증] 발톱 깎기 넣어줘" 방
- SCR-AIM-012 참고(검증 보고, 판정 밖): 새 방 첫 메시지에서 약 0.5초 말풍선 캐릭터 얼굴이 스켈레톤(검색 답변도 같음, 전부터). 390 검사 수치 표 "참고 범위" 머리글은 가로 스크롤로 보임


- SCR-AIM-013 피부 분석 팀 알림(PR 본문 + 팀 채널, 모두): 새 공용 `components/AnalyzingStatus`(분석 중 문구: 별 아이콘이 3초에 한 바퀴 + 문구 위 빛이 5초마다 지나감, 끝 "…"는 컴포넌트가 붙이므로 문구만 넘김, 동작 줄이기면 멈춤). `assets/index.css`에 `animate-sparkle-spin`·`animate-text-shimmer`. 대화창 사진 판단·영수증·검사결과지 분석 중 문구가 이것으로 바뀜. 새 분석·로딩 문구를 만들면 이 컴포넌트
- SCR-AIM-013 피부 분석 사람이 고치는 문서: AI매니저 기능명세서에 피부 분석 FN 행, 화면설계서 SCR-AIM-013에 ASK 칩 [피부 분석]·분석 결과 말풍선(등급·병변·안내·참고 문구)
- SCR-AIM-013 피부 분석 검증 데이터 정리(8081 공용 DB, tester 계정): AI 대화방 "[검증] 피부 사진"(723)·"[검증] 피부 사진 실제"·717·718·712 "강아지 피부 이상 증상 살펴보기"(대화창 ⋮ 삭제)
- SCR-AIM-013 피부 분석 참고(검증 보고, 판정 밖): 400·502·504 오류와 [다시 시도], NOT_PET_SKIN·UNCLEAR·URGENT는 Playwright route로만 확인. 검증 캡처가 같은 날 PDF 작업 캡처(`.playwright-mcp/pr/LJS-20261124-SCR-AIM-013-after-*.png`)를 덮어씀

- SCR-AIM-013 ai 저장소 몫(ai-23 받음, 그 세션 /end 뒤 /start): action-result 검사 수치 저장 결과 글이 values 전체를 한 줄에 나열 → "반려동물 · 검진일(요일) 병원 · 혈액검사 N항목"으로 요약. 프론트 수정 없음
- 다음 작업 순서(사람 2026-11-24, 피부 분석 끝): ② SCR-AIM-012 확인 카드를 카드 모양으로(검사 수치·일정·케어 항목, 마일스톤 대기 절) ③ SCR-ADM-030 채팅 상대 회원 신고(2026-11-25 끝)
- SCR-AIM-013 PDF 남은 것: 결과 줄의 검진상세 바로가기(이번엔 안 함)
- SCR-AIM-013 ai 저장소 몫(ai-23에 요청함, 그 저장소에서 /start): 검진기록 0건 저장 글을 "검진기록이 없어요. 검진기록을 먼저 등록할까요? …"로(지금 "본창 건강 일지에서…"), 도구 없음 글의 "본창" 빼기, 실행 카드 values에 inspArtclCd와 직접입력명이 같이 붙음(프론트 `actionForm.js` `cleanInput`이 보내기 전에 이름을 뺌), 검진기록 여럿에서 "10월 20일 ○○병원"이라고 답해도 ckupRcdSn이 안 채워지고 참고 범위 칸이 빠진 적 있음, "BUN 카드도 띄울게요" 뒤 카드 안 나옴, 요약 글 마지막 항목 줄 뒤 문단이 목록에 붙어 보임(빈 줄 없음)
- SCR-AIM-013 팀 알림(PR 본문 + 팀 채널, JAJ): AI 대화창이 검진기록 만들기에 `POST /api/pets/{petSn}/checkups`와 가까운 예정 병원 일정 찾기(`GET /pets/{petSn}/care-schedules`, 앞뒤 7일·FN-HLT-002-46 규칙)를 `features/ai/api.js`에 따로 둠(다른 도메인 함수 import 금지). 건강 일지 검진기록 추가 규칙·칸 길이(80·500·200)를 바꾸면 알려 달라. 모두: 새 공용 `utils/chatAttachment.js`(사진 + PDF 첨부 검사)
- SCR-AIM-013 사람이 고치는 문서: AI매니저 기능명세서 FN-AIM-013-01·화면설계서 SCR-AIM-013 ① "PDF 불가" → 검사결과지 PDF 허용과 흐름(분석·요약·카드·검진기록 없을 때 대화창 안 등록), 메인페이지 FN-MAN-002 검색창 첨부에 PDF
- SCR-AIM-013 검증 데이터 정리(8081 공용 DB, tester 계정): 탄이(petSn 2) 검진기록 1049 검사 수치 2건, 알약(1074) 검진기록 1050 "[검증]병원", 반려동물 1038 검진기록 1051 "[검증] 동물병원"과 수치, AI 대화방 "PDF 대화"·"탄이 검사결과지 [검증]" 등(대화창 ⋮ 삭제)
- SCR-COM-002 플로팅 버튼 사람이 고치는 문서: 공통레이아웃 화면설계서 SCR-COM-002 ⑦에 말풍선 위치(PC 캐릭터 위·760 미만 왼쪽, 꼬리 없는 흰 말풍선)·[등록]·[TOP] 발바닥 모양·모바일 AI+[등록] 묶음 접기, 기능명세서 FN-COM-002-19(접기 범위)·FN-COM-002-27 플로팅 반려동물 등록 버튼
- SCR-COM-002 플로팅 버튼 참고(검증 보고, 판정 밖): 1440 `/health`에서 말풍선이 'AI 건강분석 리포트' 카드 [새로고침] 글자 위에 겹침(플로팅이라 원래 겹침). 플로팅 [등록]으로 연 반려동물 등록 모달이 Esc로 안 닫힘(닫기 버튼은 됨, 전부터인지 안 봄, `PetFormModal` SJM). 등록 한도가 찬 계정은 [등록]이 숨음(사람 결정 "이대로 유지"). 말풍선 흔들림(`animate-sway`)은 그대로
- SCR-AIM-011 참고(검증 보고, 판정 밖): 오류 확인 중(`bscCharSbstYn`) 흑백 얼굴은 검증 계정에 그런 방이 없어 화면으로 못 봄(PetFace 공용 규칙). 검증이 8081 공용 DB 취두부 방에 "[검증] 고마워" 메시지·답변 하나를 남김(메시지 삭제 기능 없음)
- SCR-ADM-112 참고(검증 보고, 판정 밖): 8081에 사유 null·21건 이상 실패·토큰 데이터가 없어 Playwright route로만 확인. 회원 계정으로 `/admin/...`에 가면 `ProtectedRoute`가 `/main`으로 보내 `AdminForbidden`은 화면에서 안 보임(전부터)
- SCR-COM-002 피드백 묶음 2 팀 알림(PR 본문 + 팀 채널, 모두): ① 터치 기기에서 `input`·`textarea`·`select` 글자가 16px(iOS 확대 막기, `assets/index.css` 레이어 밖 규칙이라 `text-sm`보다 앞섬) ② 공용 `DatePicker` 위 "YYYY년 M월 ▾"로 월 고르기 보기 ③ `DatePicker`·`DropdownSelect` 펼침 창이 포털(모달 안이면 그 dialog, 아니면 body) + fixed로 뜨고, `TimeSelect` 포함 열린 동안 바깥 휠·터치 스크롤이 막힘(`hooks/useFloatingLayer.js`). 펼침 창 안에 스크롤 목록을 새로 두면 `overscroll-contain` ④ 플로팅 버튼 z-30 → z-20, `KebabMenu`·`MonthPicker` 펼침 창 z-30 ⑤ 사이드 메뉴 '›'가 줄 오른쪽 끝. JAJ·KSJ·YAY·SJM: 새 공용 `components/FieldFoot`(왼쪽 오류, 오른쪽 "n / 최대")으로 바뀜 — JAJ 일정·검진·관찰·기타 검사·처방·케어 항목(라벨 줄 글자 수가 칸 아래로)·검사 수치 입력, `health/shared/CharCount.jsx` 삭제, KSJ `AddressShareModal`, YAY `NicknameModal`(칸 안 글자 수가 칸 아래로), SJM `PetFormModal`(라벨 줄 글자 수가 칸 아래로). `FieldError`에 `className` prop. 모달에 글자 수 칸을 새로 만들면 `FieldFoot`
- 피드백 묶음 2 참고(검증 보고, 판정 밖): G2 실제 iOS 확대는 검증이 못 봄(에뮬레이션은 계산 글자 크기만). 사람이 휴대폰으로 LAN 접속해 확인. [반려동물 등록] 플로팅 버튼은 검증 계정 등록 한도라 route로만 확인
- SCR-COM-002 모바일 바텀시트 팀 알림(PR 본문 + 팀 채널, 모두): 760px 미만에서 공용 `Modal`(확인 창 `isConfirm`·`ConfirmModal`은 가운데 카드 그대로)이 모두 아래 시트. 손잡이·제목 줄을 끌어 80px 넘게 내리면 닫힘(`isPending`·`isDismissDisabled`면 제자리), 열 때 200ms 올라옴(동작 줄이기면 없음). JAJ: 건강기록 입력(`FormModal`)·일정·케어 항목 관리·건강기록 둘러보기가 화면 전체 → 시트(고정 높이 창은 화면 − 32px). 관리자 `isTop` 입력 창도 모바일은 시트. SJM: `isSheet` prop 없어짐(가계부 6곳·하루 기록 수정·가족 초대·반려동물 등록에서 지움). 모바일 `isWide` 푸터 버튼 반반, `isLarge` 푸터는 `<p>` 안내가 버튼 위 한 줄·버튼 둘 묶음 반반. 모달 안에서 모바일 화면 전체를 가정한 코드를 새로 쓰지 말 것
- 바텀시트 참고(검증 보고, 판정 밖): 반반 규칙은 버튼이 둘일 때만이라 가족 초대(`InviteModal` 자체 `justify-end`)는 자기 너비, 케어 항목 관리 [저장하기] 하나는 89px. 건강기록 둘러보기(`HealthGuideModal`, JAJ)는 서비스 둘러보기와 같은 스케일 연출을 쓰는지 안 봄(쓰면 모바일 시트 연출과 겹침). 반려동물 등록 창은 검증 계정 등록 한도라 수정 창·route로 확인
- 헤더 알림 참고(2026-11-23 코드 확인, 말만): 알림은 지우지 않고 `AUTO_HIDE_DT`(생성 + 운영 설정 일수, 기본 7일) 지나면 목록에서 숨김. 숨긴 행을 지우는 배치 없음(`INAPP_NOTI` 쌓임), 일수 변경은 새 알림부터

- SCR-MAN-001 400 참고(판정 밖): 재현은 GET 진입 4경우만 했다. 바로가기 편집 저장 `PUT /pets/main-shortcuts`는 시도 안 함. 다시 400을 보면 메서드·응답 본문(오류 코드)을 남겨 새 마일스톤으로
- 범위 밖(말만, 2026-11-20 로컬 백엔드): `/main` 진입마다 `GET /members/me/tutorial` 404, `GET /pets/{petSn}/character-image?part=face` 404·500(반려동물마다 다름). 띄운 백엔드 버전 때문인지 확인 안 함

- SCR-COM-002 바탕·헤더·푸터 색 팀 알림(PR 본문 + 팀 채널, 모두): 화면 바탕 `--color-page-bg`가 #faf8f5 → #f7f9f9, 관리자(`AdminLayout`)·로그인·가입(`AuthLayout`, 760 미만 `bg-white` 지움) 바탕도 `bg-page-bg`. 회원 헤더(`UserHeader`)는 맨 위에서 바탕·아래선 투명, 스크롤하면 흰 반투명+아래선. 푸터 `--color-footer` #f1f6f6·`--color-footer-line` #dfe5e6(위 테두리도 footer-line), "냥멍케어" 글자 대신 로고 그림, Dev Team 안인철 뺌. KSJ: `chat/room/AddressMapScreen` 바탕 `bg-surface-2` → `bg-page-bg`
- SCR-COM-002 커밋 전 사람 확인: `layouts/UserFooter.jsx`에 팀원 실제 이메일 5개·대표전화·FAX가 들어감(공개 저장소). 본인들 동의 확인
- SCR-COM-002 로그인·가입 버튼 48 팀 알림(PR 본문 + 팀 채널, YAY): `features/member` 로그인·가입·비밀번호 찾기·재설정·재가입 복구·탈퇴 완료·약관 창 버튼과 입력칸 옆 버튼이 `shared/authStyles`의 `AUTH_BTN_PRIMARY`·`AUTH_BTN_SECONDARY`·`SIDE_BTN`(공용 버튼 + 48px·둥글기 12)로 바뀜. 로그인 [이메일로 로그인하기]·[로그인]은 50px·15px 굵게·떠오름 → 48px·16px 600·떠오름 없음, 보안코드 그림 칸·새로고침·입력칸 40 → 48. 2-K 공용 규격(40·6)과 다름(입력칸 48에 맞춤). 회원정보·탈퇴 안내 화면(`profile/`·`withdraw/` 나머지)은 그대로 40
- 검증 참고(판정 밖): 비밀번호 찾기·재설정·재가입 복구·닉네임 모달·SNS 가입·탈퇴 완료·약관 창은 코드로만 확인(SNS·탈퇴 계정 필요)


- 버그 후보(JAJ, 사람이 처리 방법 정함): 관찰 입력 모달 사진 미리보기가 칸 안에 다 안 들어오고 잘림. `features/health/diary/ObservationModal.jsx:266` `grid h-40 place-items-center` 상자 안 `img.size-full object-contain`이 grid에서 높이 100%를 못 받아 원래 비율로 커짐(600×900 그림 → 618×927, 칸 160). 공용 모달 문제 아님. `flex items-center justify-center`면 618×158. 수정 모드(`ObservationPhoto`)도 같은 칸
- SCR-COM-002 ⋮ 메뉴 공통화 팀 알림(PR 본문 + 팀 채널): JAJ `health/CareItemMenu`·SJM `expense/shared/ExpenseMenu`가 공용 `KebabMenu variant="row"` 껍데기(props 그대로, 아래 공간이 모자라면 위로 펼침이 새로 생김). JAJ·YAY·SJM: `components/Card`(`sm:`→760), `adminTableStyles`(`md:`→760), 로그인·가입 `AuthLayout`·`AuthSlider`(768→760, 1024→1100), 마이페이지 홈(768→760)이라 640~759·760~767·1024~1099px 모양이 바뀜. 숫자 분기점 560·600·1000·1260(`MissingListPage`·`MissingList`·`CareDealCard`·`PetSlide`·`HealthDashboard`·`DailyTrendCard`)은 그대로, 담당자 알림만
- ⋮ 메뉴 참고(검증 보고, 판정 밖): AI 사이드바 ⋮ 메뉴를 Esc로 닫으면 AI 매니저 모달까지 닫힘(전부터, KebabMenu Esc가 막지 않음). 검증이 `.playwright-mcp/pr/LJS-20261120-SCR-MAN-001-after-1440.png`를 덮어씀(그 PR에 쓰려면 다시 찍기)

- SCR-COM-002 스크롤 막대 겹침 팀 알림(PR 본문 + 팀 채널): 모두: 공용 `Modal` `isLarge` 모달(건강 일지 입력·일정·케어 항목 관리·건강기록 둘러보기·아이템 상점·반려동물 등록·수정 등)이 dialog 자체로는 스크롤하지 않고 본문만 스크롤(가장자리 막대 없어짐). YAY: `member/shared/TermsModal` 약관 본문의 `max-h-[50vh]` 안쪽 스크롤을 없애 모달 본문 스크롤 하나로. 모달 본문 안에 `max-h`+`overflow-y-auto` 목록을 새로 두면 막대가 둘이 되니 본문 스크롤에 맡기기(PC 두 칸 구조는 칸마다 하나)
- SCR-COM-002 스크롤 막대 겹침 참고(검증 보고, 판정 밖): `ExpenseDuplicateDialog`(확인 창 안 목록이 유일한 막대)·`BloodResultList`(모달 아닌 화면 목록)는 코드로만 판정. PC 두 칸 모달(`ShortcutEditModal`·`CareManageModal`)은 1280×560에서 칸마다 막대 1개씩(사람 결정대로 그대로)

- SCR-MYP-011 구매 409 팀 알림(PR 본문, SJM): `features/pet/character/ItemShopModal.jsx`(멱등키를 409 때 새로 만듦, `PURCHASE_ERRORS` 문구 추가)·`features/pet/queries.js` `usePurchaseItems` `onError`(409 때 상세·상점·포인트 무효화)를 고침
- SCR-MYP-011 참고(검증 보고, 판정 밖): 검증 계정 아이템 미리보기 `POST /ai/characters/3/preview` 400("미리보기를 불러오지 못했어요" 토스트, 이번 변경과 무관)
- SCR-COM-002 피드백 묶음 팀 알림(PR 본문 + 팀 채널): 모두: 760~1099px에서 서브 화면(SubPageLayout) 왼쪽에 사이드 메뉴 180px가 생겨 본문이 좁아짐(제목 옆 ▾ 메뉴 없어짐, 768에서 반려동물 카드 값이 말줄임). 공용 `TimeSelect` 시·분은 직접 입력 가능, 오전/오후는 빈 칸 없이 오전부터(시간 비운 칸도 오전으로 보임). KSJ: `features/community/useLeaveGuard`가 `@/hooks/useLeaveGuard`로 옮겨짐(커뮤니티 글쓰기·수정 6곳 import, `InquiryForm` 나가기 확인이 공용 훅으로, 문의 확인 창 제목/설명 나눔). SJM: `useSetRepresentativePet`이 `healthKeys.myPets`도 무효화. 아래 F4 표의 가계부 메모·초대 이메일 상한 없음
- SCR-COM-002 피드백 묶음 참고(검증 보고, 판정 밖): 시 칸에 13을 치면 1이 남아 벗어날 때 01, 분 75는 07이 됨(둘째 글자만 막음). 빈 시·분 칸 안내 글자는 "--"(칸 폭이 좁음)
- F4 사용자 화면 모달 입력 상한 현황(2026-11-20 분석, 코드 수정 없음. 서버 = 백엔드 요청 DTO `@Size`). 담당자에게 알리고 고칠지는 사람이 정함
  | 모달·폼 | 칸 | 프론트 상한 | 서버 상한 | 담당 | 결과 |
  | --- | --- | --- | --- | --- | --- |
  | 가계부 직접 입력(`expense/shared/ExpenseForm.jsx`)·영수증 확인(`ExpenseReceiptReview.jsx`) | 메모 `dtlMttr` | 없음 | 1000 | SJM | 다름: 1000자 넘기면 서버 400 |
  | 공동양육 초대(`pet/list/InviteModal.jsx`) | 이메일 `invtnTrgtEml` | 없음 | 254 | SJM | 다름: 254자 넘기면 서버 400 |
  | 반려동물 등록·수정(`pet/list/PetFormModal.jsx`) | 품종 검색 칸(`BreedCombo`) | 없음 | 직접 입력 `vrtyDrctInptNm` 40(직접 입력 칸은 40으로 맞음) | SJM | 검색 칸이라 저장 안 됨, 확인만 |
  | 반려동물 등록·수정 | 이름 20·직접 입력 품종 40·직접 입력 색 20·인식칩 15·성격·알레르기·질병 1000 | 같음 | 같음(칩은 12 또는 15자리 패턴) | SJM | 맞음 |
  | 신고(`components/ReportModal.jsx`) | 상세 `dclrDtlCn` | 500 | 500 | 공용 | 맞음 |
  | 채팅 주소 공유(`chat/room/AddressShareModal.jsx`) | 상세 주소 30·공유 주소 200(잘라서 보냄) | 같음 | 30·200 | KSJ | 맞음(검색어 칸은 저장 안 됨) |
  | 펫돌봄 거래 취소(`chat/room/CareDealCard.jsx`) | 직접 입력 사유 | 50 | 50 | KSJ | 맞음 |
  | 처방(`health/checkup/PrescriptionModal.jsx`) | 약 이름 | 40 | 40 | JAJ | 맞음 |
  | 기타 검사(`EtcInspectionModal.jsx`) | 검사명 100·결과 500·메모 200 | 같음 | 같음 | JAJ | 맞음 |
  | 일정(`health/ScheduleModal.jsx`) | 병원 80·일정 이름 40·메모 500 | 같음 | 같음 | JAJ | 맞음 |
  | 검진(`health/diary/CheckupModal.jsx`) | 병원 80·내용 500·메모 200 | 같음 | 같음 | JAJ | 맞음 |
  | 관찰(`health/diary/ObservationModal.jsx`) | 항목 이름 40·세부 위치 40·메모 200 | 같음 | 같음 | JAJ | 맞음 |
  | 케어 항목(`health/CareItemFields.jsx`) | 항목 이름 | 40 | 40 | JAJ | 맞음 |
  | 가계부 | 사용처 `expndPlcusNm` | 80 | 80 | SJM | 맞음 |
  | 파일·숫자만 있는 모달(영수증 올리기·첨부·캐릭터 만들기·예방·하루 기록·지출 한도) | - | - | - | - | 글자 칸 없음, 대상 아님 |
- 모바일 바텀 네비 구조(사람과 이야기 2026-11-20, 팀 논의 필요): 지금은 섹션 서브 메뉴를 바텀 네비에 두어 화면마다 내용이 바뀜. 흔한 방식은 최상위 메뉴(홈·건강기록·커뮤니티·마이페이지 등) 고정. 모든 사용자 화면·다른 담당 화면에 걸쳐 팀 결정 뒤 따로 기획
- SCR-MAN-001 튜토리얼 커밋 전 사람 확인: `src/assets/tutorial/` 스크린샷 5장 개인정보(로컬 테스트 데이터 닉네임·반려동물 이름·포인트·지출, 커뮤니티 인기 포토의 다른 회원 사진·닉네임). 플레이스는 지도를 뺀 472×520 그대로(사람 결정)
- SCR-MAN-001 튜토리얼 팀 알림(PR 본문 + 팀 채널, JAJ): 건강기록 둘러보기 모달(`features/health/shared/HealthGuideModal.jsx`)의 목차 한 줄·사진 칸·확대 화면이 `components/TocButton`·`ZoomBox`(새 `isFill`)·`ZoomOverlay`로 옮겨짐(모양·동작 그대로). 모두: 튜토리얼 문구가 각 담당 기능을 한 줄씩 소개하므로 메뉴 이름·기능이 바뀌면 LJS에게 알림
- SCR-MAN-001 사람이 고치는 문서: 메인페이지 기능명세서에 서비스 튜토리얼 기능 ID(FN-MAN-0xx) 추가, 화면설계서 SCR-MAN-001에 튜토리얼 모달·왼쪽 아래 [?]
- SCR-MAN-001 튜토리얼 참고(검증 보고, 판정 밖): 연출 상수 4개를 `pages/ai/AiChatModal.jsx`에서 복사(features는 pages를 import 못 함, AI 쪽만 바꾸면 두 연출이 달라짐). 390에서 그림 상자가 세로로 길어 [크게 보기]가 그림과 떨어진 상자 모서리에 있음. 메인 [AI 매니저] 버튼 글자는 760 미만에서 `sr-only`(`HeroAsk.jsx:161`)라 설명 문구와 모바일 모양이 다를 수 있음

- SCR-COM-002 공용 확인 창 팀 알림(PR 본문 + 팀 채널, 모두): 확인 창(`ConfirmModal`·`Modal isConfirm`)이 왼쪽 정렬·제목 18px 600·설명 16px 회색, 760px 이상은 버튼이 오른쪽에 자기 너비(최소 80px), 760 미만은 반반 꽉 참. 파일 수정 없이 전체 적용. `Modal`의 `isSpacious` 없어짐(SJM `pet/list` 4곳에서 지움). 문구: 로그아웃 "로그아웃할까요?"+설명, JAJ 건강기록 삭제 창 5곳 설명 추가·일정 삭제·반려동물 변경·다시 촬영 제목/설명 나눔, KSJ 댓글 삭제 설명 추가·게시글·돌봄·실종·문의 삭제·글쓰기 나가기 제목/설명 나눔, SJM 가계부 다시 촬영 제목/설명 나눔. 확인 창 제목은 질문 한 문장, 덧붙일 말은 `description`에 쓰기
- 확인 창 참고(검증 보고·구현, 판정 밖): `components/ConfirmModal.jsx` 위 주석 "가운데 정렬, 버튼 꽉 참"이 이제 코드와 다름(다음에 이 파일을 고칠 때). `inquiry/InquiryForm.jsx` 나가기 창 제목에 두 문장이 붙어 있음(기획 목록 밖, KSJ). PC 프로필 메뉴로 연 로그아웃 창은 폭을 1100 아래로 줄이면 닫힘(헤더 드롭다운이 사라짐, 전부터)
- 카카오 지도 키 도메인(2026-11-19 확인): `localhost:5180`·`127.0.0.1`은 등록되지 않아 `sdk.js` 401 `domain mismatched`(5173·5174는 됨). 검증(5180)에서 지도 확인이 필요하면 키 관리자가 카카오 개발자 콘솔 Web 사이트 도메인에 `http://localhost:5180`을 추가해야 함

- SCR-COM-002 UI 통일 2-M 팀 알림(PR 본문 + 팀 채널, KSJ·SJM): 펫돌봄·실종센터·펫이야기 상세(`features/community`·`pages/community/CareListPage`) 분기점이 `min-[760px]`·`max-[1100px]`·`min-[1100px]`로 바뀌어 폭이 정확히 760·1100px일 때 PC 쪽 모양. 가계부 전체 내역(`ExpenseHistory`)도 760px부터 PC. AI 대화 삭제·관리자 라우팅 매핑 삭제 확인 버튼이 빨간색
- 2-M 참고(검증 보고, 판정 밖): `care/CareFilters.jsx`·`missing/MissingFilters.jsx` 주석 "760px 미만는" 조사 오타(→ "미만은"). 다음에 이 파일을 고칠 때 같이. 2-M 범위 밖으로 남긴 옛 분기점: `components/Card` `sm:`, `adminTableStyles` `md:`, `AuthLayout`·`MyPageHomePage`, 랜딩 `LandingHeader` 768·`ProcessSection` 1280(랜딩 교체 SCR-MAN-002 때)

- SCR-COM-002 공용 토스트 팀 알림(PR 본문 + 팀 채널, 모두, 사람이 전달): `showToast(message, { type: 'success' | 'error' })` 생김(인자 없으면 info). JAJ·SJM·KSJ·YAY 폴더 호출부 약 70개 파일에 type을 붙임(문구·시점 그대로, 일부 Prettier 줄바꿈). 같은 문구 합침·최대 3개, 두 문장은 문장마다 새 줄. 760 미만에서 화면 아래 고정 막대를 새로 만들면 `data-toast-above`(안쪽 요소 기준이면 `="form"`처럼 선택자) 달기
- SCR-COM-002 토스트 범위 밖(말만): 모바일 캐릭터 꾸미기 저장 줄(`CharacterDecorate.jsx`, SJM)·PC 장소 지도 팝업(`PlacePopup`, YAY)과 토스트 겹침, 닫기 버튼·hover 멈춤
- SCR-COM-002 토스트 참고(검증 보고, 판정 밖): 기획 T4는 CSS `:has`로 적었으나 구현은 JS로 막대 위 끝을 재서 인라인 `bottom`. Vite HMR 뒤 콘솔에서 `import('/src/components/toastStore.js')`로 부르면 앱과 다른 모듈이라 안 뜸(`performance` 리소스 주소로 import)
- 버그 후보(KSJ, 검증 중 발견): 390 채팅 모달에서 주소 메시지가 있는 방을 열면 화면이 비어 버림. `features/chat/room/AddressMessage.jsx:25` `kakao.maps.StaticMap is not a constructor`
- SCR-COM-002 UI 통일 2-N 팀 알림(PR 본문 + 팀 채널, JAJ·SJM): ① 종합 건강기록 배너 캐릭터가 마이페이지 반려동물 카드와 같은 모양(회색 원에 꽉 참, 연한 청록 무대 원 없앰) ② 캐릭터 목록 조회가 `@/hooks/usePixelCharacters` 하나로(키 `pixelCharacterKeys.all`, 5분 `staleTime`). `features/pet`·`features/health`의 `usePixelCharacters`·`getPixelCharacters`·`healthKeys.pixelCharacters` 없어짐. 반려동물 등록·초대 수락 뒤에도 캐릭터 목록을 다시 읽음 ③ 캐릭터 상태가 바뀌는 새 기능을 만들면 `pixelCharacterKeys.all`을 무효화해야 함(안 하면 5분 동안 옛 값)
- 2-N 사람이 정할 것: 마이페이지 반려동물 카드에도 캐릭터 없는 주양육 동물일 때 점선 [캐릭터 만들기]를 넣을지(배너와 같게, `features/pet/list/PetSlide.jsx`, SJM 화면). 2026-11-19 물었고 답 없이 마무리
- 2-N 참고(검증 보고, 판정 밖): 캐릭터 없는 동물의 `GET /pets/{petSn}/character-image` 404(백엔드 기본 그림 교체 건, 백엔드 재시작 필요). 추가-1 초대 수락은 route로만 확인(다음 `/health` 진입 때 다시 읽음)
- SCR-COM-004 알림 목록 더 불러오기 팀 알림·PR(PR 본문): 백엔드 PR #271(`GET /notifications` 쪽 응답 `{ content, page, size, totalElements, totalPages, hasNext }`)과 이 프론트 PR을 같이 병합한다(한쪽만 병합하면 알림 목록을 못 읽음). 드롭다운이 5건씩 끝에서 더 불러오고, 탭을 바꾸면 이전 탭 목록 없이 스켈레톤부터, 로딩 중 목록 칸 스크롤 막음. `useNotifications`가 `useInfiniteQuery`(`gcTime: 0`)로 바뀜
- SCR-COM-004 사람이 고치는 문서: 공통레이아웃 기능명세서 v0.10 FN-COM-004-05 "최대 5건을 미리보기로" → "5건씩, 목록 끝에서 다음 5건을 더 불러온다", 화면설계서 v0.13 SCR-COM-004 ③ 같은 문구
- SCR-COM-004 참고(검증 보고, 판정 밖): 목록 맨 아래에서 [모두 읽음]을 누르면 1쪽만 다시 받고, 끝 줄이 보이는 자리여도 다음 쪽을 저절로 부르지 않음(한 번 위로 올렸다 내리면 부름). 0건 탭·두 쪽 겹침·다음 쪽 실패는 Playwright route로만 확인

- SCR-COM-007 참고(검증 보고 2026-11-19, 판정 밖): `pages/ai/AiChatModal.jsx` `useCloseWithMotion` 위 주석 "화면 이동으로 닫을 때는 이 함수를 쓰지 않는다"가 이제 코드와 다름(이제 이동에도 씀). 다음에 이 파일을 고칠 때 한 줄 고친다. 390은 AI 모달이 화면 아래까지 덮어 바텀 네비를 누를 수 없음. 모달 안 바로가기 이동(`handleOpenMain`)은 코드로만 확인
- SCR-COM-007 팀 알림(PR 본문 + 팀 채널, KSJ): 펫돌봄 채팅 모달(`layouts/ChatModal.jsx`)이 같은 주소로 다시 이동(로고·같은 GNB)해도 닫힌다(`location.key` 기준). 모달이 열린 동안 뒤 화면이 주소의 `?` 값을 바꾸면 모달이 닫히니 그런 화면을 만들면 알려 달라

- 기본 캐릭터 네모 임시 그림 없애기(사람 2026-11-19): 백엔드 `resources/character/default-dog.png`·`default-cat.png`(`CharacterDefaultImage`, 캐릭터 없음·오류 확인 중일 때 `GET /pets/{petSn}/character-image`가 200으로 줌)를 프론트 `src/assets/pets/default-character-*.png` 도트 그림으로 교체 요청. 백엔드 연결: 기본 캐릭터 그림 교체(백엔드 저장소에서 /start). 백엔드 회신 2026-11-19: 1안으로 기획, 사람 승인 대기. 백엔드 그림을 프론트 `default-character-*-full.png`(512 전신)로 바꾸고 얼굴은 기존 자르기로 프론트 얼굴 그림과 같은 픽셀. API 그대로, 프론트 할 일 없음. 백엔드 회신 2 2026-11-19: 교체·검증 통과(face 256·full 512 도트, 캐릭터 없음·오류 확인 중 모두 200), 백엔드 커밋·사람 확인 대기. 프론트에서 보려면 백엔드 재시작 필요

- SCR-COM-002 쪽 번호 팀 알림(PR 본문 + 팀 채널, 모두): 760 미만에서 공용 `BoardPagination` 쪽 번호가 5개 묶음(1~5, 6~10 …)으로 바뀜(760 이상은 10개 그대로). 카드 쪽 번호 `Pagination`은 원래 5개라 그대로

- 2026-11-19 사람 지시로 기획 없이 바로 되돌림(급함): 로그인 방법 선택 [이메일로 로그인하기]·이메일 로그인 [로그인] 버튼(`login/LoginMethodChoice`·`EmailLoginForm`)과 `shared/AuthField` 입력칸을 2-K 전 모양으로(버튼 50px·둥글기 12·15px 굵게, 입력칸 48px·둥글기 12·라벨 13px·`*`·오류 문구 mt-2). `AuthField`라 가입·비밀번호 찾기·재설정·재가입 복구 입력칸도 같이 돌아감. 2-K 공용 규격(`ui-checklist.csv`)과 다시 다름 → YAY 알림, 규격으로 다시 맞출지 사람이 정함. 화면 검증 안 함(lint·build만)

### SCR-COM-002 플로팅 반려동물 등록 버튼 남은 것(2026-11-19)

- 팀 알림(PR 본문 + 팀 채널, SJM): 플로팅 버튼 묶음(AI → 등록 → TOP)에 [반려동물 등록] 버튼 추가. `layouts/FloatingButtons.jsx`가 `features/pet/list/PetFormModal`(등록 모달)과 `features/pet/queries` `usePetLimit`을 그대로 쓴다. 모달 props·한도 응답(`remainingPetCount`)을 바꾸면 플로팅 버튼도 영향. 남은 자리가 0이거나 한도를 못 불러오면, 모바일 AI 접힘 때 숨김
- 디자인: 최종은 발바닥 모양 버튼(사람). 지금은 [TOP]과 같은 상자 + `PawPrint` 20px + `Plus` 12px. 디자인이 오면 바꾼다
- 사람이 고치는 문서: 공통레이아웃 기능명세서 FN-COM-002-27 "플로팅 반려동물 등록 버튼" 추가, 화면설계서 SCR-COM-002 ⑦ 플로팅 버튼 설명
- 참고(검증 보고, 판정 밖): `/mypage/pets`에는 화면의 [반려동물 등록]과 플로팅 버튼이 같은 이름으로 둘 보인다(낭독기에서 헷갈릴 수 있음). 등록 성공 뒤 동작(토스트 후 그 자리)은 공용 DB라 코드로만 확인


### SCR-COM-002 UI 통일 다음 단계(사람 결정 2026-11-18)

- 2-L 팀 알림(PR 본문 + 팀 채널, YAY): ① 플레이스 분기점 768·1024 → 760·1100(760~767px이 PC 3칸 배치로, 1024~1099px은 레일 64·목록 340), JS `(width < 760px)` ② 검색창이 공용 `SearchInput`(높이 48 → 40, 둥글기 6, 오른쪽 돋보기 버튼), 모바일 지도 위 지역 표시·다시 검색 버튼이 8px 위로 ③ 팝업 [상세보기]·[길찾기] `BTN_PRIMARY`·`BTN_SECONDARY`, 조회 실패 `LoadError`, 로딩 `Skeleton` 3줄, 결과 없음 `EmptyResult isCompact` ④ "현재 지도 밖" 공용 `Badge tone="amber"` ⑤ 팝업 장소명 20 → 18px(H1 24px 그대로, 사람 결정) ⑥ 모바일 장소 종류 칩 흰 바탕+테두리·그림자 없음(미끄러지는 배경 유지) ⑦ 지도 위 요소 그림자 `shadow-depth-sm` 하나(바텀시트·핀은 그대로) ⑧ 4px 간격, 760 미만 팝업 ✕·즐겨찾기 ☆ 44px
- 2-L 참고(판정 밖): 팝업 [상세보기]·[길찾기]는 `<a>`라 공용 버튼의 `hover:enabled:` hover 모양이 걸리지 않음(2-C 칩과 같은 현상). 1회차 검증은 로컬 `.env.local`에 카카오 지도 키가 없어 지도 확인 3건(L2·L5·L8)을 못 봐 실패, 키를 넣고 2회차 통과(코드 변경 없음)
- 2-J 팀 알림(PR 본문 + 팀 채널, YAY): ① 회원정보 카드 그림자 삭제, 섹션 제목 20 → 18px, 줄 오른쪽 [수정]·[변경]·[연동하기]가 `BTN_SECONDARY`(높이 32 → 40) ② `shared/profileStyles.js`에서 `INPUT`·`LABEL`·`HELP`·`ROW_BTN` 없어짐(입력칸은 `components/formStyles`), `FieldMessage`의 `ErrorText` 없어지고 오류 문구는 공용 `FieldError`(위 여백 6px 생김), `OkText`는 남음 ③ 탈퇴 화면 버튼 `BTN_PRIMARY`·`BTN_SECONDARY`(높이 50 → 40, 둥글기 12 → 6), "안내 닫기" → "닫기", 확인 체크가 공용 `Checkbox` ④ 분기점 640·768 → 760 ⑤ 회원 정보 조회 실패 `LoadError`([다시 시도]) ⑥ 4px 간격, 편집 줄 라벨 `pt-[18px]` → `pt-4`
- 2-J 참고(검증 보고, 판정 밖): 탈퇴 안내 체크 오류는 체크 전 [계속]이 비활성이라 화면에서 못 띄움(Playwright route로 400을 돌려 확인). `WithdrawResult`는 코드로만 확인. 탈퇴 버튼 반반 폭은 PC만(`min-[760px]:flex-1`)
- 2-K 팀 알림(PR 본문 + 팀 채널, YAY): ① 로그인·가입·비밀번호 찾기·재설정·재가입 복구·탈퇴 완료 버튼이 `BTN_PRIMARY`·`BTN_SECONDARY` + `w-full`(높이 50 → 40, 둥글기 12 → 6, 15px 굵게 → 16px 600, 떠오르는 hover 없음), 입력칸 옆 버튼도 40px `BTN_SECONDARY` ② `shared/authStyles.js`에서 `PRIMARY_BTN`·`OUTLINE_BTN`·`SIDE_BTN` 없어지고 `TEXT_LINK`만 남음, `shared/AuthCheckBox.jsx` 삭제(공용 `Checkbox`) ③ `AuthField`·보안코드 칸 48px·둥글기 12 → 40px·6px(공용 `INPUT` 값), 라벨 13px → 공용 `LABEL`, `*` → `Required`, 오류 문구 → 공용 `FieldError`(아이콘, 위 여백 6px) ④ 제목 26px → 24px, `AuthNotice` 14px·여백 12 ⑤ 약관 › 누르는 영역 PC 24·모바일 44 ⑥ 문구 "로그인 화면으로"·"로그인 방법 선택으로" → "로그인으로", "인증번호 발송" → "인증번호 보내기", "중복 확인" → "중복확인", SNS 가입 "회원가입 완료" → "회원가입" ⑦ 분기점 768 → 760
- 2-K 참고(검증 보고, 판정 밖): 기획 K2 grep이 `features/member` 전체라 2-J의 `profileStyles` `SIDE_BTN`(다른 상수) 5줄이 걸림, auth 쪽 0건으로 통과(사람 확인). 빈 값 제출은 [로그인] 비활성이라 오류 문구는 Playwright route로 확인. 보안코드 칸은 코드로만. SNS 로그인 버튼(`SnsLoginButtons`, 48px·둥글기 12)은 사람 결정으로 그대로. `AuthHeading` 모바일 여백 `calc(12vh-67px)`·`calc(12vh-43px)`는 칸·버튼 높이 변경 뒤 다시 계산하지 않음
- 다음 2 조각 후보(2-K 뒤): 2-L YAY `place`
- 2-I 팀 알림(PR 본문 + 팀 채널, KSJ): ① 실종 상태 배지가 공용 `Badge`(실종 `rose`·찾았어요 `green` + 테두리, 기간 만료 `gray`) ② 카드·필터 상자·글쓰기 카드·오른쪽 요약 상자·품종 목록 팝업 그림자 삭제, 찾았어요 상자 테두리 `#cfe3d6` → `border-tone-green-fg/12`, 4px 간격(안내 아이콘 `mt-0.5` → `mt-1`) ③ 상세 제목 24/모바일 18px, 찾았어요 상자 제목 18px ④ 글쓰기 "등록하기"·"저장하기", 글 삭제 확인 `isDanger` ⑤ 글쓰기 폼 `formStyles`·`FieldError`·`Required`·공용 `Checkbox`, 제목·본문 글자 수 칸 아래 오른쪽 ⑥ "총 N건" → "전체 N 건", 목록 조회 실패 `LoadError`([다시 시도]) ⑦ 펫돌봄도 같이 바뀜: `care/`가 가져다 쓰는 `missing/BreedCombobox`(공용 `LABEL`·`INPUT`·`FieldError`, 오류 문구 아이콘)·`PlaceSearchModal`·`MissingMap`(지도 위 칩 테두리 `ring`)·`CheckList`(간격)
- 2-I 참고(검증 보고, 판정 밖): 기간 만료 배지는 화면 못 봄(만료 글은 작성자에게만, 코드로만 확인). 로컬 계정에 내 실종 글이 없어 삭제 확인은 Playwright route로 `owner`를 바꿔 확인, 수정 "저장하기"는 코드로만. 라벨 `leading-[1.4]`는 공용 `LABEL` 값이라 남음
- 다음 2 조각 후보(2-I 뒤): YAY `member`·`place`(회원 `profileStyles` → `components/formStyles`)
- 2-H 팀 알림(PR 본문 + 팀 채널, KSJ): ① 펫돌봄 상태 배지가 공용 `Badge`(모집중 `ok` 점+테두리, 매칭완료 `blue`+테두리, 거래완료 `gray` 바탕 `bg-surface-2`), 내 채팅 배지도 `Badge` ② 카드·필터 상자·글쓰기 카드·오른쪽 요약 상자 그림자 삭제, 4px 간격 ③ 상세 제목 24/모바일 18px ④ 글쓰기 "등록하기"·"저장하기", 글 삭제 확인 `isDanger` ⑤ 글쓰기 폼 `formStyles`·`FieldError`·`Required`·공용 `Checkbox`, `careFormStyles.js` 삭제, `CareFormParts`에는 `Counter`·`Section`만, 제목 글자 수 칸 아래 오른쪽 ⑥ "총 N건" → "전체 N 건", 목록 조회 실패 `LoadError`([다시 시도])
- 2-H 버그 후보(KSJ, 판정 밖): `CareForm` 빠진 항목으로 이동이 `setErrors` 반영 전에 `[aria-invalid]`를 찾아 첫 [등록하기] 뒤 포커스가 제출 버튼에 남음(2-H 전에도 같음). 품종 오류 문구(`missing/BreedCombobox`)는 아이콘 없음 → 2-I에서 볼 것
- 2-H 참고: 빈 결과 [필터 초기화] 버튼은 자체 36px 클래스 그대로(기획 밖). 동의 체크박스는 공용 `Checkbox`가 `aria-invalid`를 받지 않아 바깥 칸 `data-invalid`로 둠
- 다음 2 조각 후보(2-H 뒤): KSJ 실종센터(`missing/`) 2-I, YAY `member`·`place`
- 2-G 팀 알림(PR 본문 + 팀 채널, KSJ): ① 커뮤니티 공용 `ListFilterParts` 칩이 `FILTER_CHIP`·`FILTER_CHIP_ON`(40 → 36, 고른 칩 연한 청록), [내 글만 보기] 등 체크가 공용 `Checkbox`, [상세 필터]가 `BTN_SECONDARY`라 펫돌봄·실종센터 목록도 같이 바뀜 ② `CommentSection`: 댓글·답글 제출 "등록하기", 삭제 확인 "삭제하기" + `isDanger`, ⋮ 메뉴 그림자 없음, 입력칸 `formStyles`, 모바일 답글 연결선 -25px·21px ③ 펫이야기 카드·레일·글쓰기 카드 그림자 삭제, 썸네일 높이 150px, "총 N건" → "전체 N 건", 목록-페이지 이동 48/32px, [인기] 공용 `Badge tone="rose"`, 조회 실패 `LoadError` ④ 글쓰기 "등록하기"·"저장하기", 폼 `formStyles`·`FieldError`·`Required`, 제목 글자 수 칸 아래 오른쪽 ⑤ 글 상세 제목 24/모바일 18px, 오른쪽 최신글 박스 없음
- 2-G 참고(판정 밖): 행 78 펫이야기 내 글에도 [신고] 보이는 것은 그대로(KSJ 버그 후보). 캡처는 목록만(화면 ID가 SCR-COM-002 하나라 상세·글쓰기 캡처 이름이 겹침). `.playwright-mcp/`가 eslint 검사 대상이라 그 폴더에 `require` 쓰는 임시 스크립트를 두면 lint가 깨짐(`eslint.config.js` ignores 추가는 사람 결정)
- 다음 2 조각 후보(2-G 뒤): KSJ 펫돌봄(`care/`) 2-H·실종센터(`missing/`) 2-I, YAY `member`·`place`
- 2-F 팀 알림(PR 본문 + 팀 채널, KSJ): ① 문의·FAQ 탭이 공용 `UnderlineTabs`(PC 높이 72 → 48, 탭 패널 id는 고른 탭 id `inquiry-status-*`·`faq-category-*`), FAQ 검색창 줄 아래 여백 16 → 4, 검색창 좁힘 1280 → 1100 ② 펫뉴스 카테고리 칩 `FILTER_CHIP`·`FILTER_CHIP_ON`(40 → 36, 고른 칩 연한 청록) ③ 문의 상태·뉴스 카테고리·공지 고정 배지가 공용 `Badge` tone ④ 버튼 `BTN_PRIMARY`·`BTN_SECONDARY`(빈 안내 버튼 36 → 40, 원문 기사 보기 44 → 40), 문구 "문의 제출" → "등록하기", "저장" → "저장하기", 삭제 확인 "삭제하기" + `isDanger` ⑤ 문의 폼 `formStyles`·`FieldError`·`Required`, 제목 글자 수가 칸 아래 오른쪽, 문의 유형 칸 오류 빨간 테두리 ⑥ 조회 실패 `LoadError`([다시 시도]), 문의 수정 화면 조회 실패는 [목록으로] 링크 없어짐, 뉴스 빈 결과 `EmptyResult` ⑦ 공지 상세 "최신 공지" 박스 없앰, 상세 제목 모바일 20 → 18px, 카드 그림자 삭제, 4px 간격
- 2-F 참고(검증 보고, 판정 밖): 문의 작성 제목 칸이 42px라 문의 유형 칸(40px)보다 2px 높음(`py-2`+`leading-6`+테두리). 커뮤니티 필터 칩(`ListFilterParts` `Chips`)과 "총 N건"은 csv 15·80행으로 커뮤니티 조각에서
- 다음 2 조각 후보(2-F 뒤): KSJ `community`(펫이야기·펫돌봄·실종센터), YAY `member`·`place`
- 2-E 팀 알림(PR 본문 + 팀 채널, SJM): ① 포인트 숫자 30·32px → 28px, 20px → 18px ② 분기점 `md:`(768)·`sm:`·`lg:`(1024) → 760·1100(요약 3칸이 760부터 항상 가로 한 줄, 1024~1099px에서 케어미션·내역 1열) ③ 케어미션 반려동물 칩 `FILTER_CHIP`·`FILTER_CHIP_ON`(높이 40 → 36, 고른 칩은 연한 청록 바탕) ④ 진행 막대 공용 `ProgressBar`(홈 칸 8 → 10px, 바탕 회색) ⑤ 완료·미완료·"오늘" 공용 `Badge`(미완료 바탕 `bg-surface-2`) ⑥ 요약·내역·미션 조회 실패 때 `LoadError`([다시 시도]), 빈 안내 셋 `EmptyResult isCompact` ⑦ 공용 `StatLink`(가계부 홈 칸도) 숫자 30 → 28px, 분기점 768 → 760
- 2-E 참고(검증 보고, 판정 밖): 1100px 폭에서 요약 칸 적립·사용 숫자("+627P")가 칸보다 6~7px 넓음(1280·390은 문제없음). `StatLink`의 `gap-0.5`(2px)는 범위 밖이라 남음. 주양육 동물 없음 안내는 검증 계정 데이터가 없어 코드로만 확인
- 2-D 팀 알림(PR 본문 + 팀 채널, SJM): ① 반려동물 화면 분기점 600 → 760(600~759는 모바일 배치), 1281 → 1100(넓은 PC 모양이 1100부터), 761·1101 → 760·1100, 1032·1108 좁힘 범위 → 760~1100 ② 확인 창 5개 버튼 `BTN_SECONDARY`·`BTN_DANGER`(높이 44 → 40), 문구 "저장하기"·"삭제하기"·"해제하기"·"거절하기"("초대 취소"는 그대로) ③ `PetSlide`·`SentInvitations` 안 배지 복사본 지우고 공용 `Badge` tone, "대표" `tone="solid"` ④ 캐릭터 탭 `UnderlineTabs`(패널 id `char-own`·`char-shared`), 부위 칩 `CHIP`(PC 32 → 36) ⑤ 폼 `formStyles`·`FieldError`·`Required`·`Checkbox`(초대 수락 카드는 공용 체크박스를 카드 위에 덮음), 안내 `NoticeBox`, 조회 실패 `LoadError` ⑥ 전환 점 누르는 영역 PC 24·모바일 높이 44(폭은 줄을 나눠 최대 44), 가족 해제 ✕ 모바일 44, "N명 더보기" → "더보기 +N" ⑦ 제목 20·22px → 18px
- 2-D 참고(판정 밖): 초대 수락 "나중에 하기"는 맞는 공용 버튼 상수가 없어 그대로. 오류 문구가 공용 `FieldError`의 위 여백으로 칸과 6px 더 떨어짐. 초대 모달에서 고를 수 없는 줄이 반투명(공용 `Checkbox` 비활성). "선택" 표시(`Optional`)는 공용에 없어 남김. 가족 "더보기 +N"·공동양육 배지는 검증 계정 데이터가 없어 코드로만 확인
- 2-C 팀 알림(PR 본문 + 팀 채널, SJM): ① 가계부 버튼 문구: 지출 등록 "등록하기"·수정 "저장하기", 영수증 "등록하기", 중복 "그래도 등록하기", 한도 "저장하기", 삭제 확인 "삭제하기"(⋮ 메뉴·편집 막대 [삭제]는 그대로) ② 폼이 `components/formStyles`(`LABEL`·`INPUT`)·`components/FieldError`(`Required`·`FieldError`)를 씀, `shared/ExpenseRequired`에는 `MissingNotice`만 남음 ③ 카테고리 칩 `CHIP`·`CHIP_ON`, 줄·전체 선택 체크박스 공용 `Checkbox`(전체 선택의 일부 선택 − 표시 없앰, 사람 결정), 영수증 안내 `NoticeBox` ④ 분기점 `lg:`(1024) → 1100이라 1024~1099px에서 대시보드 1열 ⑤ 카드 여백 22·18px → 24·20px, 색 막대 들여쓰기 14 → 16px
- 2-C 참고(검증 보고, 판정 밖): 카테고리 칩 hover 표시가 없어짐(공용 `CHIP`의 `hover:enabled:`가 `<span>`에는 안 걸림). 같은 병원비 안내가 지출 입력 모달은 `FieldError`, 영수증 확인은 `NoticeBox`(기획대로). 채팅 목록 편집 [전체 선택](`chat/room/ChatRoomList.jsx`)은 아직 기본 체크박스
- 2-B 팀 알림(PR 본문 + 팀 채널): ① 전체: 공용 `Modal` 입력 모달 제목 22px·제목 줄 위아래 12px, 확인 창 제목 18px, isLarge가 아닌 모달은 본문만 안쪽 스크롤(제목 줄·푸터 고정) ② 전체: 공용 차트가 건강 일지 차트로 바뀜(`components/BarChart` props `points`·`formatValue`·`ariaLabel`, `CurveChart` → `LineChart`), 새 `components/formStyles.js`(INPUT·LABEL·TEXTAREA·HELP), `UnderlineTabs` `isLineHidden`·`isScrollable`, `Checkbox` `ariaLabel`, `NoticeBox` `role`, `EmptyResult` `isCompact`, `ConfirmModal` `isDanger`(삭제 등은 빨간 확인 버튼), `Badge` 톤 7개 추가 ③ JAJ: 지운 파일 `diary/BarChart`·`LineChart`·`useElementWidth`·`DiaryTabs`·`FieldError`·`formStyles`·`EmptyBox`, `checkupStyles` `TAG`, 입력 모달 머리 아이콘 없어짐, 760 이하 입력 모달은 화면 전체 ④ `docs/ui-checklist.csv`가 UI 통일 기준
- 2-B 사람이 정할 것: 모달 제목 22px는 체크리스트 글자 단계(12·13·14·15·16·18·24·28px) 밖이라 단계에 넣을지 팀이 정한다
- 2-B 참고(검증 보고, 판정 밖): `/health` 체중 위젯 차트 위 빈 공간이 큼. `/admin` 막대 그래프는 최소 상한 60이라 값 0~2면 막대가 거의 안 보임(옛 차트도 같음). 일정 모달 입력칸은 `aria-invalid`가 없어 서버 오류 때 빨간 테두리가 안 생김
- 2-A 팀 알림(PR 본문 + 팀 채널, JAJ): ① 건강기록 640~759px 폭이 모바일 배치로 바뀜(`sm:`·`lg:` → 760·1100) ② 칩이 공용 `CHIP`·`FILTER_CHIP`, 작은 버튼이 높이 40px ③ 버튼 문구 등록하기·저장하기·삭제하기 ④ 버그 후보 82 `ZONES` 순서는 그대로 둠
- 2-A 사람이 정할 것(검증 보고, 판정 밖): 줄 안 글자형 [삭제] 6곳(`diary/CheckupListCard`·`DayRecordEditModal`, `checkup/PrescriptionForm`·`AttachmentTab`·`EtcResultList`, ⋮ 메뉴 `CareItemMenu`)은 "삭제" 그대로. 확인 창 버튼은 "삭제하기". 규칙에 넣을지 정한다
- 2-A 참고(판정 밖): `ui.md` "로딩 표시" 예시 코드에 옛 분기점 `min-[1101px]`이 남음. 콘솔의 `GET /api/pets/1/character-image?part=face` 404는 `PetFace` 데이터 문제(/main에서도 남)
- 팀 알림(PR 본문 + 팀 채널): ① `ConfirmModal`이 공용 `Modal isConfirm` 모양(440px·[취소][확인] 꽉 참)으로 바뀌어 커뮤니티·건강기록·가계부·고객센터·회원 확인 창이 파일 수정 없이 같이 바뀜 ② 토큰 값 변경: `--color-subtle` #5f6b6c, `--color-cat-hosp-fg` #496f97, `--color-tone-gray-bg` #f4f6f6, 알림 배지 #d4411c ③ 새 공용 부품·칩 규격을 2단계에서 쓴다 ④ SJM: `routes/paths.js` `MYPAGE_CAREGIVERS`(화면 없음, `docs/routes.md` MYP-004)는 그대로 두고 AI 바로가기만 `/mypage/pets`로 보냄. 상수·문서·AI 서버 매핑 정리 여부는 SJM이 정함
- 버그 후보 알림: KSJ `community/PostDetail.jsx` 내 글에도 신고 버튼(체크리스트 78), JAJ `health/CareChipPicker.jsx`·`CareItemFields.jsx` `ZONES` 순서 반대(82)
- 1-B 팀 알림(PR 본문 + 팀 채널): ① components·layouts의 `min-[761px]`·`min-[1101px]`이 `760`·`1100`으로, JS 조건이 `(width < 760px)`·`(width >= 1100px)`로 바뀌어 폭이 정확히 760·1100px일 때 PC 모양이 나옴 ② 분기점 규칙이 `docs/convention/ui.md`에 들어감 ③ 메인 검색창 [AI 매니저] 버튼은 760 미만에서 아이콘만(전에는 480 이하)
- 1-B 참고(판정 밖): 알림 설정 H1 행간은 `text-page` 토큰 1.35배라 37.8px(기획 문장의 36px와 다름). `rgba(...)` 직접 값(LJS 폴더 34곳)·관리자 H1 24px는 그대로
- 참고(검증 보고, 판정 밖): `components/`의 `rgba(...)` 직접 값(그림자·포커스 링·딤) 몇 곳은 이번 hex 대상 밖이라 남음

### SCR-COM-004 모두 읽음 남은 문서 일

- 사람: DMS 공통레이아웃 기능명세서 FN-COM-004에 "모두 읽음" 기능 ID 추가(제안 FN-COM-004-17)

### 랜딩·메인 픽셀 시안(기획 전, 시안 확정되면 /start)

SCR-MAN-002 랜딩 · SCR-MAN-001 메인 픽셀 디자인 시안(2026-11-17, 기획(/start) 전, `src/` 코드 변경 없음). 피드백 "랜딩과 메인 스타일이 너무 다르다"에서 시작. `html/` 시안만 만듦. `html/`은 git 제외라 이 PC에만 있다. 다른 PC에서 이으려면 아래 파일·폴더를 디스코드로 옮긴다


#### 시안 파일(`html/`)

- `SCR-MAN-002.html` 랜딩 시안 A(주력): 앱 색(청록 `brand-*`·연노랑 `accent-300`), 밤 → 새벽 → 아침 크림 흐름. 구성: ① 첫 화면 픽셀 장면(PC 6px·모바일 4px 칸 캔버스, 언덕·가로등·길이 흐르고 보호자+강아지가 목줄로 걸음, 단계 탭 3개로 밤·새벽·노을) ② 길 4칸(S자 픽셀 타일 길이 스크롤만큼 채워지고 보호자·강아지가 길을 따라 걸음, 카드·표지판은 모서리 점 깎은 도트 상자) ③ 새벽 하늘(1080px, 23단계 띠, 발자국이 스크롤마다 하나씩 찍혀 해 쪽으로) ④ 자주 묻는 질문 ⑤ 마무리 버튼 ⑥ 메인 픽셀 띠. 기존 랜딩 섹션 중 숫자(샘플값)는 뺌. 로그인·시작하기 버튼은 메인 시안 A로 이동(시안 연결용)
- `SCR-MAN-001.html` 시안 묶음 보기(2026-11-17): 아래 바에서 A(랜딩 A·메인 A), B(랜딩 B·메인 B)를 바꿈(주소 #la·#a·#lb·#b). 랜딩 A 버튼 → 메인 A, 랜딩 B 버튼 → 메인 B
- `SCR-MAN-002-b.html` 랜딩 시안 B: 두 번째 랜딩 후보(흑백 미니멀 고정 무대)를 복사, 메인 B와 짝. 로그인·시작하기 버튼만 메인 B로 연결
- `SCR-MAN-002-merge.html` 랜딩 A + 두 번째 후보 합친 버전: 사람 "별로"(버림 후보)
- `SCR-MAN-001-b.html` 메인 시안 B(주력, 다듬는 중): 미색(`#f7f6f3`) + 검정 한 색. 2단 배치(사람 결정 2026-11-17, UX 검토 추천안): 왼쪽 옅은 모눈 격자 + 캐릭터 + 픽셀 말풍선, 오른쪽 인사말(44/56px) → AI 매니저 검색창 → 바로가기 목록(왼쪽 정렬). 오른쪽 묶음 윗선 = 말풍선 윗선, 아랫선 = 격자 바닥(점선 바로 아래에서 격자가 끝남), 묶음 전체를 무대 세로 가운데. 캐릭터는 사람이 준 생성기 시트의 서 있는 정면 그림 그대로(1.12배, `CHAR_SCALE`), 0.5초 숨쉬기·클릭 점프·마우스 줄 떨림. 말풍선은 사용 팁 5개(검색창·건강기록·바로가기 편집·영수증 가계부·플레이스)를 한 글자씩, 다음 버튼·캐릭터 클릭·7초 자동. 시간대 표시·바꾸기는 없앰(사람 결정), 인사말은 지금 시각 문구. 맨 아래 픽셀 띠는 흑백 2026-11-17 바꿈(옛 B2를 B로): 페이지 배경 전체가 모눈(칸·위치를 캐릭터 무대 격자에 맞춤), 캐릭터 뒤·오른쪽 묶음 뒤에 둥근 미색 번짐(모눈을 흐리게 지움), 헤더는 미색 불투명 + 아래 선
- `SCR-MAN-001-a.html` 메인 시안 A(2026-11-17 다시 짬, 옛 A2를 A로. 옛 A는 버림): 랜딩 A 첫 화면과 한 세트. 랜딩 히어로와 같은 픽셀 장면(칸 PC 6px·모바일 4px, 하늘 띠 + 디더링, 언덕 3겹, 4칸 길, 가로등, 8fps), 색은 랜딩 색표만(새벽 = 랜딩 새벽, 아침·낮 = 랜딩 새벽 하늘 섹션의 크림 쪽 띠·가로등 꺼짐, 저녁 = 랜딩 노을, 밤 = 랜딩 밤). 왼쪽에 인사말(44/56px) → 흰 둥근 검색창 + 연노랑 [AI 매니저] → 반려동물 탭(작은 얼굴, 고르면 인사말 이름·검색 안내·바로가기가 바뀜, [+ 등록]) → 바로가기 카드 2×2(랜딩 단계 탭 모양)를 한 묶음으로. 무대 아래쪽은 언덕·길 위로 랜딩의 보호자 + 강아지가 걸어 지나감. 헤더는 투명 + 흰 로고·글자, 하늘이 헤더 뒤까지. 뺀 것(사람 결정): 큰 정면 캐릭터, 시간대 배지, 맨 아래 픽셀 띠
- 자원 폴더: `SCR-MAN-002/`(로고·픽셀 띠·카드 그림·`dog-sheet.png`), `SCR-MAN-001/`(로고·픽셀 띠). `dog-sheet.png`는 사람이 준 생성기 2×2 시트(앉기·서기 × 정면·옆모습, 자홍 바탕). 캐릭터는 이 시트에서 잘라 HTML 안에 데이터로 넣어 파일을 더블클릭해 열어도 보인다(Tailwind·Pretendard는 CDN이라 인터넷 필요)
- 두 번째 랜딩 후보(`nyangmung-hero-pixel2.html`, 흑백 미니멀 고정 무대)는 저장소 밖 사람 파일. 분석·비교는 2026-11-17 대화에서 함

#### 정한 것(사람, 2026-11-17)

- 랜딩 색은 청록·연노랑(주황·어두운 리브랜딩 아님). 랜딩 색 토큰·Pretendard·짝수 글자 크기
- 픽셀 칸 = 캐릭터 점 크기(PC 6px·모바일 4px). 캐릭터 크기를 바꿀 때는 배경 칸을 캐릭터에 맞춘다
- 기본 캐릭터 원본 2×2 시트는 없다(백엔드·캐릭터 생성기 세션 확인: 백엔드 `resources/character/default-*.png`는 임시 네모 그림, 로컬 첨부 폴더에도 없음). 옆모습은 사람이 준 시트를 쓴다
- 메인 시안 B: 캐릭터는 원본 정면 그림(다시 뽑은 점 데이터는 눈이 뭉개져서 안 씀), 고양이 없음
- 메인 시안 B 모눈: 왼쪽 무대에만 넓히기(바로가기 미색 바탕)는 버리고, 페이지 배경 전체 모눈 + 캐릭터·오른쪽 묶음 뒤 둥근 번짐으로 정함
- 메인 시안 A 헤더는 투명(랜딩과 같은 흰 로고·글자). 실제 `UserHeader`는 공용이라 메인 전용 변형을 기획 때 정한다. B 헤더는 미색 불투명


- 랜딩·메인 시안 마무리 → 확정되면 /start로 기획(SCR-MAN-002 랜딩 교체, SCR-MAN-001 메인 개편). 기획 때 정할 것: ① 메인 간격 규칙(2026-11-11 사람 요청: 헤더→인사말 PC 120px·760px 이하 56px, 묶음 사이 56/40px, `MainPage.jsx` 주석)을 새 배치에 맞게 바꿀지 ② 말풍선을 언제 보일지(첫 방문만·닫기 버튼) ③ 회원 캐릭터 그림: 메인 정면은 기존 캐릭터 이미지로 되지만, 걷는 옆모습은 백엔드에 회원용 시트(`PIXEL_CHAR.BODY_SHEET_FILE_SN`) 조회 API가 없어 `백엔드 연결:` 필요 ④ 메인 B 맨 아래 픽셀 띠 흑백 유지 여부 ⑤ 헤더(`UserHeader`)는 공용이라 시안에서 안 바꿈
- 시안 남은 것: 메인 B·A, 랜딩 합친 버전 모바일(390px)은 대부분 안 봄. 1.12배·0.8배처럼 정수배가 아닌 캐릭터 크기는 점 크기가 미세하게 고르지 않다. 랜딩 A의 보호자 픽셀 그림은 직접 그린 초안(20×40점), 강아지 옆모습은 시트를 다시 뽑은 작은 점 데이터라 정면 원본과 질감이 다르다. 랜딩 A 밤·새벽 언덕이 하늘과 비슷하게 어둡다. 랜딩 A 모바일 메뉴(햄버거) 없음
- 시안 보는 법: `html/`에서 정적 서버(예: `python -m http.server 8765`)로 열거나 파일을 더블클릭

- SCR-ADM-082 참고(검증 보고 2026-11-17, 판정 밖): 390 폭 관리자 헤더에서 관리자 이름이 "냥멍관…"으로 잘린다(이번 변경과 무관한 `AdminLayout` 헤더)

- SCR-COM-002 스크롤 잠금 팀 알림(2026-11-16, 결정 "PR 본문 + 팀 채널 한 줄"): JAJ에게 `features/health/ScheduleModal.jsx`·`features/health/diary/FormModal.jsx`, SJM에게 `features/expense/shared/ExpenseDetailSheet.jsx`에 `useScrollLock()` 한 줄을 넣어 창이 열린 동안 뒤 페이지가 스크롤되지 않는다고 알린다. 공용 `ConfirmModal`·`ImageViewer`도 같다. 앞으로 `showModal()`을 직접 부르는 창을 만들면 `useScrollLock()`을 같이 넣거나 공용 `Modal`을 쓴다
- SCR-COM-002 스크롤 잠금 이번엔 안 함(2026-11-16): ① 다섯 창을 공용 `Modal`로 옮기기(마일스톤 절 단계안) ② `NavDrawer`·`AdminLayout` 드로어의 `body` 잠금을 `useScrollLock`으로 ③ `LandingHeader` 모바일 메뉴 잠금 없음. 하려면 새 마일스톤으로
- SCR-COM-002 스크롤 잠금 참고(검증 보고 2026-11-16, 판정 밖): 창을 닫은 뒤 html `style` 속성이 없던 상태(null)에서 빈 문자열("")로 남는다. 화면 차이는 없다

- SCR-ADM-081 연결 남음: FN-ADM-081-01·02·03 (백엔드 연결 관리자·내부 키워드 사전 API 삭제, 백엔드 저장소에서 /start — 백엔드 마일스톤 `SCR-ADM-081 키워드 사전 · 관리자·내부 키워드 사전 API 삭제` 진행 중). 2026-11-16 프론트 없앰: 프론트 화면·라우트·메뉴·TC 문서를 지움. 예전 "연결 남음"(관리자 API 연결·가계부 초기 키워드·AI 서버 DB 조회)은 모두 취소. 백엔드 API 지우기는 백엔드 LJS가 백엔드 저장소에서 기획 중(`KWRD_DICT`는 뉴스·건강 키워드가 써서 남김). 기획 문서(요구사항정의서·화면설계서·기능명세서 SCR-ADM-081·FN-ADM-081-01~03) 정리는 사람
- SCR-ADM-042 백엔드 후보(2026-11-16, 사람이 정할 것, 백엔드 저장소에서 /start): ① 캐릭터가 "오류 확인 중"(`PIXEL_CHAR.BSC_CHAR_SBST_YN`)이 아니면 `finishErrorCheck`가 409 `ALREADY_PROCESSED`("이미 처리된 요청입니다")를 준다. 시드 픽셀 문의(1·7·82·149·195 등)가 이 경우다. 관리자 문의 상세에 `bscCharSbstYn`을 넣고 오류 코드를 나누면 프론트가 버튼을 숨기거나 맞는 문구를 보일 수 있다 ② AI 서버 호출이 실패한 요청 상태 재생성 작업은 시간 초과 배치(10분, 5분 주기)까지 기다려야 다시 처리할 수 있다. 바로 다시 시도하게 할지
- SCR-ADM-042 참고(2026-11-16, 판정 밖): 다른 PC에서 올린 원본 사진은 이 PC 디스크에 없어 무료 재생성이 원본 사진 조회 404(`CHARACTER_INPUT_ERROR`)로 바로 실패한다(작업 809·811·812). 이 PC에서 만든 캐릭터(621)는 생성 완료까지 갔다
- SCR-ADM-042 검증 데이터 정리(2026-11-16, 공용 DB): 문의 226·82는 원래 캐릭터 복원으로, 문의 236("캐릭터 오류 검증 (재검증)", tester)은 무료 재생성(작업 814, 생성 완료)으로 처리됨. 236은 회원 1:1 문의 목록에서 지울 수 있다
- SCR-ADM-110 연결 남음(2026-11-16): S1 거래완료 글 숨김 기준 칸(`dlngCmptnHideCrtrDayCnt`)은 검증 8081이 예전 코드라 칸이 비어 있었다. 백엔드 LJS가 다음 /start에서 global/setting(KSJ가 고침, 백엔드 `13794f1`) 검토 뒤 8081을 다시 띄우고 알려 주기로 함. 그 뒤 `/admin/settings`에서 조회 값 7, 저장 본문 `{"dlngCmptnHideCrtrDayCnt": n}` 하나, 새로고침 유지, 0 입력 400 칸 오류를 보고 값을 7로 되돌린다
- SCR-COM-002 PR 알림(2026-11-16): member 도메인 `features/member/queries.js` `useUpdateProfileImage`가 `memberKeys.me`도 무효화한다(헤더 프로필 사진이 `useMe`의 `atchFileSn`을 씀). 플로팅 AI 버튼은 대표 반려동물만 쓰고(대표 없으면 강아지 기본 전신), 메인(`/main`)에서는 플로팅 버튼이 없다. 기본 전신 그림 `assets/pets/default-character-dog-full.png`·`cat-full.png` 추가
- SCR-COM-002 사람이 볼 것(판정 밖, 2026-11-16 검증 보고): ① `useAiDock`이 메인에서도 돌아 첫 방문 말풍선 "봤음"이 바로 저장된다. 로그인 뒤 첫 화면이 메인이라 메인 밖 첫 방문 말풍선이 거의 안 보인다(이전과 같은 동작). 고치려면 저장 시점을 "실제로 보였을 때"로(`hooks/useAiDock.js`) ② 760px 이하 창에서 마우스로 끌어 접으면 뒤따르는 click으로 다시 펼쳐진다(터치는 정상, 이전과 같은 동작) ③ 캐릭터를 안 만든 대표는 서버 기본 그림(네모 블록)이라 보이는 높이가 93/70px로 다르다(아래 "서버 기본 캐릭터 그림 맞추기")
- SCR-COM-002 이번엔 안 함(2026-11-16): 관리자 헤더(`AdminLayout`) 프로필 사진
- 서버 기본 캐릭터 그림 맞추기(2026-11-16, LJS 백엔드): 캐릭터 안 만든 반려동물에 `GET /pets/{petSn}/character-image`가 주는 서버 기본 그림(백엔드 `resources/character/default-dog.png`·`cat.png`, 512 네모 블록)이 우리 기본 캐릭터(프론트 `assets/pets/default-character-*.png`)와 다르다. 맞출지 정하고, 하면 백엔드 저장소에서 /start(전신 `full`·얼굴 `face` 둘 다)
- SCR-MYP-010 연결 남음(2026-11-16): F1 프로필·채팅 상대 프로필·뉴스 썸네일은 기존 첨부 번호(69·42·4225·4590~4600 등)가 이 PC에서 새·예전 주소 모두 404 `FILE_NOT_FOUND`라 그림까지 못 봤다. 서버는 DB 행 `physStrgPath`로 디스크를 읽고 파일이 없으면 404(백엔드 `FileStore.java` `read`), 아래 "백엔드에 알릴 것(2026-10-30) ①"과 같은 원인으로 봄(LJS 백엔드). 이 PC에서 새로 올린 4612는 200
- SCR-MYP-010 백엔드 예전 주소 정리(2026-11-16, 판정 밖): 프론트에서 `/api/files/public/` 요청이 0건이 됐다(저장된 공지 본문의 예전 줄도 `PostBody`가 `/api/files/{번호}`로 그림). 백엔드 커밋 `e8734cf`의 "프론트가 옮긴 뒤 예전 주소를 지운다"를 할지 백엔드 저장소에서 정한다
- SCR-MYP-010 팀 알림(2026-11-16): `utils/fileUrl.js` `publicFileUrl`(25개 파일이 씀, 이름 그대로)이 `/api/files/{번호}`를 준다. 이제 로그인해야 열리는 주소라 비로그인 화면(`/chat`은 `auth: 'public'`)에서 쓰면 401로 그림이 깨진다(추정, 확인 안 함)
- SCR-MYP-010 검증 데이터 정리(2026-11-16, 공용 DB): 검증 때 공지 [이미지 넣기]로 올린 첨부 4612(공지는 저장 안 함, 어디에도 연결 안 됨). 지우려면 DB 첨부파일 행과 백엔드 업로드 폴더의 그 파일을 지운다
- 로컬 서버 메모(2026-11-16): 노트북 네트워크(IP)가 바뀌면 떠 있던 백엔드의 공용 DB 연결이 죽은 채 남아 DB를 읽는 API(`/api/terms`·로그인)가 500이다. 같은 쿼리를 DB에 직접 보내면 성공했다. 백엔드를 재시작하면 풀린다(2026-11-16 재시작 뒤 200)
- SCR-HLT-011 AI 건강분석 리포트 팀 알림(2026-11-14, 사람 결정 "추천안대로"): ① JAJ에게 PR 본문·팀 채널로 `features/health/` 4파일(`dashboardApi.js` 리포트 조회·새로고침, `queries.js` `healthKeys.healthReport`·`useHealthReport`·`useRefreshHealthReport`, `dashboard/DashboardCard.jsx` `AiReportCard`·`AiReportBand`, `dashboard/HealthDashboard.jsx` `<AiReportCard key pet>`)을 고쳤다고 알린다 ② 문서 담당에게 건강기록 명세 v1.4 FN-HLT-011-12 "리포트 내용·산출 기준은 미정·준비 중 안내만"을 AI 계약(ai `docs/api/healthreport.md`)대로 채워 달라고 알린다: 제목 줄 "{이름}은/는 지금 {rptTtl}", 팁 1~3개, 고정 안내, 만든 시각, 최근 기록 미반영 안내, 데이터 부족이면 팁 안내만, [새로고침] 하루 1회, 640px 미만 띠는 제목 줄 한 줄
- SCR-HLT-011 검증 참고(2026-11-14, 판정 밖): 검증 브라우저 콘솔 오류는 `/api/pets/*/character-image` 404·500이 대부분(이번 변경과 무관). 로컬 반려동물 누리(petSn 20)에서 [새로고침]을 누르면 그날 새로고침 1회를 쓴다
- SCR-AIM-011 develop 재확인 검증 데이터 정리(2026-11-14, 8080 백엔드·반려동물 여러 마리 회원 계정): AI 대화방 522·523·524·525·526은 AI 창 ⋮ [삭제], 코코(petSn 14) 건강 일지 체중 2026-11-14 14:53 4.2kg는 건강 일지에서 지운다. 참고: Java 400 칸 오류는 실제 값으로 못 일으켜(AI가 거절·반올림) 응답을 가로채 확인했다
- SCR-AIM-012 같은 이름 반려동물 AI 세션 알림(사람 요청 2026-11-13, AI 저장소에서 /start): tester 계정처럼 이름이 같은 반려동물("연탄" 두 마리, petSn 1006·1040)이 있으면 확인 카드가 "아직 반려동물이 비어 있어요"만 되풀이한다. 원인은 `app/chat/service.py` `_pick_pet`이 문장 속 이름으로 고르는데 두 마리가 다 걸려 None, 칩 [연탄]도 둘이 구분되지 않음. 반려동물 결정과 칩 목록은 AI 서버 몫(사람 결정 2026-11-13). AI 할 일: ① 돌려받은 카드 `action.input.petSn`이 양육 반려동물이고 문장에 걸린 이름 중 하나면 이름보다 그 번호를 먼저 씀 ② `petChoices`에 구분 글 칸 추가(이름이 겹치는 아이만 `연탄 · 말티즈`처럼, 품종도 같으면 나이·성별), `docs/api/chat.md` ActionCard 계약 고침 ③ 겹칠 때 요약 글을 "어느 연탄인지 골라 주세요"처럼(필요하면). 프론트 상태: 추가-1(SCR-AIM-011)로 칩을 누르면 이름 대신 고른 `petSn`을 다음 메시지 `action.input.petSn`에 실어 보냄(검증 통과 2026-11-13). AI ② 뒤 프론트 연결: `PetChoiceChips`가 새 구분 글 칸을 보여 주기(프론트에서 따로 구분 정보를 만들지 않음). 같이 알릴 것(검증 보고, 판정 밖): 요약 뒤 "체중을 999로 바꿔 줘"에 AI가 "지금 카드는 체중 3.1kg 그대로예요"라고 답하면서 `done.action`을 null로 줘서 프론트가 계약대로 카드를 버림 → 이어서 "등록해 줘"가 방 태그 반려동물로 새 카드를 만듦. 답 문구와 계약이 어긋남


- SCR-COM-002 공용 스크롤바 팀 알림(2026-11-13): 팀 채널에 알린다. ① 앱 전체 스크롤 영역 막대가 얇은 둥근 회색 막대로 바뀜(마우스 기기만, `assets/index.css`) ② 페이지(html) 막대는 브라우저 막대를 숨기고 `components/PageScrollbar`가 내용 위에 그림(화면 오른쪽 10px는 막대 칸이라 그 아래가 눌리지 않음, html 너비가 막대 유무와 상관없이 같음) ③ 막대 자리를 비워 둘 스크롤 영역은 `scrollbar-stable` 클래스 ④ 옛 Safari(18.2 전)는 `[&::-webkit-scrollbar]:hidden` 없는 탭 줄에 막대가 보일 수 있음(사람 결정으로 둠)
- SCR-COM-002 사람이 볼 것(판정 밖, 2026-11-13 검증 보고): 기획 S1①·S4의 "html 막대 칸 10px·채팅 모달 여백 10px"은 추가-1로 0이 맞는 값이 됨. `layouts/ChatModal.jsx`의 `paddingRight` 보정과 `hooks/useScrollLock.js`의 gutter 처리는 이제 마우스 기기에서 0이라 남겨 둠(정리할지 정할 것). 화면마다 콘솔 오류 1~9건(원인 안 봄)
- SCR-MAN-001 문서 담당(YAY) 알림(2026-11-13): 메인페이지 명세 v0.11과 달라짐(사람 결정) ① FN-MAN-008 반려동물 없음: 글+링크 대신 [바로가기 편집] 칸 모양의 [반려동물 등록하기] 타일(위에 "등록된 반려동물이 없어요.") ② FN-MAN-010·011: [바로가기 추가] 창·⋮ [바로가기 수정] 하나짜리 창 대신 "바로가기 편집" 창 하나. 지금 메인 바로가기를 담고 열려 빼기·넣기 뒤 [저장](목록 전체 PUT), ⋮ [바로가기 편집]은 그 반려동물 탭이 골라진 채 열림, ⋮ [삭제]는 그대로 ③ 타일 종류 이름은 두 줄까지 줄바꿈("반려동물 / 정보 수정")
- SCR-AIM-011 사람 확인 피드백 알림(2026-11-13): JAJ에게 건강기록 마지막 선택 저장이 `features/health/shared/selectedPet.js`에서 `utils/lastPetSn.js`(`readLastPetSn`·`writeLastPetSn`, 키 `nyangmeong.lastPetSn.<mbrSn>`, 예전 키도 읽음)로 옮겨졌고 AI 채팅이 처음 칩으로 읽는다고 알린다(PR 본문에도). 플로팅 버튼으로 연 AI 모달은 이제 최근 방을 연다(사람 결정 2026-11-10 "다시 열면 새 대화"를 플로팅 버튼만 바꿈, 메인 검색창은 새 대화)
- SCR-AIM-011 사람이 볼 것(판정 밖, 2026-11-13 검증 보고): 메인 검색창에서 보낸 직후 AI 모달이 닫힌 일과 `/ai-chat`이 새로고침된 일이 한 번씩 있었다(다시 해 보니 재현 안 됨, pageerror 없음, 원인·이번 변경 관련 여부 모름). 화면마다 콘솔 오류 1~4건(원인 안 봄)
- SCR-AIM-011 검증 데이터 정리(2026-11-13, 8081 DB·tester 계정): AI 대화방 467·469·475와 메인 검색으로 만든 방은 AI 창 ⋮ [삭제]. 방 451 "까미 혈액검사 결과 두 회차 비교 확인"에 [검증]·"검증:" 질문과 답변이 남았다(메시지 삭제 API 없음). 방 468 "이 사진 봐줘"는 다른 세션이 만든 것으로 보임
- SCR-ADM-070 그림 참고 굽기 검증 데이터 정리(2026-11-13, 8081 DB): 아이템 "[검증] 그림 참고 모자"(itemSn 54, 머리, 10P, 판매 중지)를 만들었다. 지우려면 DB에서 지운다. itemSn 45 "검증용 굽기 지시 모자"는 이름은 되돌렸지만 `bakeImgRefYn`이 false→true로 바뀌었다(판매 중지). 사람 확인 때 등록한 아이템도 판매를 끄거나 지운다
- SCR-MAN-001 새 반려동물 기본 바로가기 없애기 연결 남음(2026-11-13, 프론트 몫 끝): 백엔드 연결 `PetShortcutService.search`가 바로가기 행 없는 반려동물에 MANC0008 대신 빈 목록을 준다(백엔드 저장소에서 /start, 백엔드 마일스톤에 `대기` 절 넣음). 끝나면 가짜 응답 없이 8081에서 새로 등록한 반려동물 타일이 메인에 안 생기는 것을 본다(프론트 코드 변경 없음). 이미 기본값을 받던 반려동물(행 없음)의 종합 건강기록도 같이 사라진다(사람 결정 2026-11-12, 데이터 옮기기 없음). 확인 뒤 tester 반려동물 "바로가기검증"(petSn 1038, 지금 GET에 `["MANC0008"]`)을 지운다
- SCR-ADM-070 검증 데이터 정리(2026-11-11): 공용 DB에 아이템 "검증용 픽셀 모자"(itemSn 43, 머리, 10P, 판매)가 생겼다. 관리자 화면에 삭제가 없으니 판매를 끄거나 DB에서 지운다. 사람 확인 때 등록한 아이템도 같다
- SCR-ADM-070 참고(검증 보고 2026-11-11, 판정 밖): 픽셀 그림 없이 [등록]을 눌러 나온 "픽셀 그림을 만들어 골라 주세요"가 그림을 만든 뒤에도 [이 그림 쓰기]까지 남는다
- 로컬 서버 메모(2026-11-11): AI 서버는 `--reload` 없이 띄우면 `git pull` 뒤 새 API가 404다(이번에 `pixel-image`가 404였음). ai 저장소 README대로 `uv run uvicorn app.main:app --reload`로 띄운다

- SCR-COM-007 이번 PR 알림(2026-11-11): 팀 채널에 ① 공통 알림 `components/ToastContainer.jsx`가 popover(top layer)라 `<dialog>` 모달 위에 보임(쓰는 법 그대로) ② 원 금액·포인트 숫자에 `tabular-nums`를 붙임(가계부 SJM, 건강 일지 영수증·케어 캘린더 JAJ, 돌봄·채팅 거래 카드 KSJ, 관리자), 새 금액 표시·입력에도 붙여 달라고 알린다(초안은 2026-11-11 대화에서 만듦)
- SCR-COM-007 `/ai-chat` 새 창 페이지 정리(사람 2026-11-11): PC도 모달로 바뀐 뒤 앱 안에서 여는 곳이 없다(주소 직접 입력만). 없앨지 정하고, 없애면 `routes/paths.js`·`docs/routes.md`·AI 서버 라우팅 매핑을 같이 고친다
- AI 서버 `POST /ai/conversations` 실패(2026-11-11 검증 보고): 검증 브라우저(5180→프록시 `/ai/`)에서 `net::ERR_FAILED`로 "메시지를 보내지 못했어요"가 나온다(GET은 200, 바꾸지 않은 메인 모달에서도 같음). 아래 `fetch('/ai/...')` 항목과 같은 원인인지 본다

- SCR-MAN-001 AI 매니저 같은 창 모달 알림(2026-11-11): 명세 FN-COM-007-01·FN-MAN-002는 "새 창(탭)"이라 PC도 같은 창 모달로 바뀐 것을 문서 담당에 알린다. 팀에는 `useScrollLock`(공용 훅)이 이제 원래 스크롤바가 있을 때만 `scrollbar-gutter`를 남긴다는 것(스크롤 없는 화면에서 모달 여닫을 때 흔들림 없어짐), 캐릭터 생성 모달(SJM `pet/character/CharacterCreateModal`)에 사진 미리보기를 넣고 영수증 업로드 모달(`ai/receipt/ReceiptUploadModal`) 미리보기를 키운 것을 PR 본문·팀 채널에 알린다
- SCR-MAN-001 업로드 미리보기(2026-11-11): 검증 브라우저(Chromium)에서는 다섯 곳 모두 JPG·PNG 미리보기가 보였다. 사람이 본 "안 보임"이 특정 브라우저·파일(휴대폰 사진 등)에서만이면 그 조건을 받아 다시 본다
- SCR-MAN-001 검증 데이터(2026-11-11, tester 계정): AI 대화방 "강아지가 밥을 안 먹어요"·"가계부 화면으로 이동해줘"·"고양이 하루 물 섭취량"·"강아지 산책 몇 분이 좋아?"·"390 질문 테스트"·사진 첨부 대화 등은 AI 매니저 대화 목록에서 지운다. 1회차 검증이 이전 PR 캡처 `.playwright-mcp/pr/LJS-20261111-SCR-HLT-002-after-1440.png`를 영수증 미리보기로 덮어썼다(필요하면 다시 찍음)
- 검증 브라우저에서 `fetch('/ai/...')`가 net::ERR_FAILED(2026-11-11 검증 보고, 같은 주소 XHR은 200): 이번 변경과 무관해 보임, 원인 안 봄

- SCR-COM-002 셀렉트·날짜 교체 팀 알림(2026-11-11): PR 본문과 팀 채널에 알린다. 남의 담당 파일을 고쳤다(JAJ `health/` 15파일, SJM `expense/`·`pet/list/PetFormModal`, KSJ `community/care/CareFilters·CareForm`·`community/missing/MissingForm`, YAY `place/PlacePanel`). 기본 셀렉트·날짜·시간 입력 대신 `DropdownSelect`·`DatePicker`·`TimeSelect`를 쓰고, `onChange`는 이벤트가 아니라 값을 바로 받는다. `Select.jsx`도 안에서 `DropdownSelect`를 써서 쓰는 27곳 모양이 바뀌었다. 공용 검증 스킬에 "이전 통과 유지"(`.cache/verify/<이름>.md`)가 들어갔다
- SCR-COM-002 셀렉트 교체 뒷정리 남은 것(2026-11-11): `health/diary/formStyles.js`의 `SELECT_CLASS`·`SELECT_ARROW_STYLE`은 쓰는 곳이 없다(JAJ에게 지울지 묻는다). `TimeSelect`에 `invalid`가 생긴 것도 알린다(건강기록 3곳은 안 넘겨 모양 그대로)
- 공용 검증 스킬 "이전 통과 유지" 문구(2026-11-11): 기록 첫 줄과 마일스톤 절 제목을 비교할 때 끝의 `— 진행` 같은 상태 표시를 빼고 비교한다고 적을지 정한다(검증 에이전트가 알아서 빼고 봤다). 백엔드 저장소 검증 스킬에도 같은 규칙을 넣을지 정한다
- SCR-MAN-001 기본 캐릭터 얼굴 알림(2026-11-11): JAJ(`ReceiptPetLink`·`PetSwitcher`·`SummaryBanner`)·SJM(`PetMiniCard`·`InvitationAccept`·`PetSlide`)에게 공용 `components/PetFace.jsx` 기본 대체가 종별 아이콘 → 기본 캐릭터 얼굴로 바뀐 것을 알린다(PR 본문에도). `iconClassName`은 받기만 하고 효과 없음, 아이콘이 필요하면 `fallback`으로 넘김
- SCR-MAN-001 character-image 404 원인(사람이 정할 것, 2026-11-11 코드로 추정, DB 조회는 안 함): 백엔드 `PixelCharacterService.currentImage()`는 캐릭터가 없으면 서버 기본 이미지(`resources/character/default-*.png`)를 주므로 404가 아니다. 404는 DB에 캐릭터 파일 행이 있는데 이 PC의 `app.file.root-dir`에 실제 파일이 없을 때 `FileStore.read()`가 던진다(공용 DB, 다른 PC에서 만든 캐릭터로 보임. tester 계정 petSn 1·2·14). 없애려면 백엔드에서 파일을 못 읽으면 기본 이미지로 넘기는 작업(백엔드 저장소에서 /start), 또는 서버 기본 이미지를 이번 프론트 이미지와 같은 그림으로 맞출지도 정한다
- SCR-MAN-001 기본 캐릭터 이미지 품질(판정 밖, 2026-11-11): AI 세션이 만든 얼굴 PNG는 원본이 스크린샷이라 외곽에 밝은 반투명 픽셀이 조금 남고 강아지 털 바깥에 흐린 점이 있다. 깔끔하게 하려면 번지지 않은 원본 도트 파일을 받아 AI 세션에 다시 요청
- SCR-MAN-001 바로가기 세부 메뉴 알림(2026-11-11): SJM에게 `pages/mypage/PointPage.jsx`·`features/point/mission/CareMission.jsx`(`?petSn=…#care-mission`)·`pages/mypage/CharacterPage.jsx`(`?petSn=` → 꾸미기)·`pages/mypage/PetListPage.jsx`(`?edit=` → 수정 모달) 변경을 알린다(PR 본문에도)
- SCR-MAN-001 바로가기 세부 메뉴 사람이 볼 것(판정 밖, 2026-11-11): ① 건강기록 변화·캘린더는 부모(건강 일지·케어 캘린더)의 첫 탭이라 같은 곳으로 간다(뺄지 사람이 정함) ② 메인 타일 ⋮ [바로가기 수정] 셀렉트는 하위 이름("캘린더")만 보인다 ③ 디자인 캡처 `html/SCR-MAN-001/shortcut-edit-*.png`가 이 PC에 없어 트리는 기획 문장 기준 ④ 공동양육 반려동물도 `?edit=`로 수정 모달이 열린다(목록 ⋯ 메뉴와 같음)
- SCR-MAN-001 바로가기 웹 드래그 순서 남은 것(2026-11-11): 순서는 브라우저마다 따로다(사람 결정 "일단 로컬스토리지로"). 기기 사이에 맞추려면 백엔드 정렬 변경(LJS 백엔드, 마일스톤 절 "참고"). 키보드로 순서 바꾸기는 넣지 않음(사람 결정 2026-11-10). 검증 데이터: user0006 서버 바로가기는 검증 전 12개로 되돌림, Playwright 브라우저에 `nyangmeong.main.shortcutOrder.6` 키가 남음(지우면 서버 순서)
- SCR-MAN-001 바로가기 배치 상한 남은 것(2026-11-10): 모바일(760px 이하)에서 6번째부터 숨긴 바로가기는 메인에서 수정·삭제할 길이 없다(사람 결정 "그대로, 바텀시트에서 빼기는 나중 절"). 검증 데이터 user0006은 검증 시작 때의 12개로 되돌림, 구현 전 상태와 같은지는 모름
- SCR-MAN-001 바로가기 편집 사람이 볼 것(판정 밖, 2026-11-10): ① 12개 상한에 걸리면 메뉴가 회색으로만 막히고 이유 문구가 없다 ② 공용 DB `PUT /pets/main-shortcuts` 응답이 6초쯤 걸렸다(검증 실측 6095ms) ③ 타일 ⋮[삭제]를 연달아 누를 때 첫 삭제가 빠져 보인 적이 있다(브라우저 캐시였을 수 있음, 원인 못 가림)
- SCR-MAN-001 바로가기 편집 검증 환경 정리(2026-11-10): 검증 때 8080을 백엔드 `origin/LJS` 별도 worktree(공용 DB, 프로필 없음)로 바꿔 띄웠다. 원래 IDE 서버는 꺼진 채라 다시 띄우고 worktree는 지운다. 검증 데이터는 user0006·관리자 계정 모두 처음 상태로 되돌림(검증 보고)
- SCR-MAN-001 사진 용도 판단 연결 검증 데이터(2026-11-10, 8081 DB·tester 계정): AI 대화방 393("진료 영수증")·395("탄이 진료 영수증이야")는 AI 창 [삭제]. 영수증 결과는 저장하지 않았다
- SCR-MAN-001 사진 용도 판단 사람이 볼 것(판정 밖, 2026-11-10): ① 판단 요청의 `petSn`은 글에 나온 반려동물이 아니라 칩 값을 보낸다(AI 서버는 판단에 쓰지 않음) ② 부르는 이름(`callName`)은 대화창 캐릭터·영수증 분석 말풍선에만 넣었다
- SCR-ADM-080 매핑표 API 연결 정할 것(2026-11-10, 8081 DB): 검증 전부터 있던 sn 47 "확인용 매핑(수정)"(사용 안 함, 순위 1)을 지울지 사람이 정한다. 검증 때 만든 sn 48·49는 지웠다
- 프론트에 남은 가짜 응답(2026-11-10 조사): `features/apiUsage/api.js`(SCR-ADM-112, 연결 마일스톤 없음), `features/chat/api.js` `searchChatPlaces`(장소 검색 API 담당 미정), `features/community/missingCodes.js` `DONG_BY_REGION`(주로 KSJ)
- SCR-COM-007 모바일 AI 모달 검증 데이터 정리(2026-11-10, 8081 DB·tester 계정): 까미(petSn 1) 일정 2026-11-11 10:00 "[검증] 까미 미용"(케어 캘린더에서 삭제), 건강 일지 체중 2026-11-10 09:40 4.5kg(건강 일지에서 삭제), AI 대화 "까미 미용 일정 등록"·사진 대화·"반려동물 케어 AI 첫 인사"·"까미 귀 청소 주간 케어 등록"(대화 목록에서 삭제)
- SCR-COM-007 사람이 볼 것(판정 밖, 2026-11-10): ① 로그아웃·탈퇴 때 AI 모달 닫기는 코드로만 확인 ② 검증 중 AI 확인 카드로 케어 항목 등록 시 8081 `POST /api/pets/1/care-items` 500(이번 변경과 무관해 보임, 원인 안 봄) ③ 명세(공통레이아웃 기능명세서 v0.10 FN-COM-007-01)는 아직 "새 창, 모달 아님"이라 모바일 모달을 문서에 반영해 달라고 문서 담당에 알린다
- SCR-ADM-001 대시보드 사람이 볼 것(판정 밖, 2026-11-10): ① 알림 실패·배치 실패는 검증 때 0건이라 링크 목록 건수와 대조 못 함(알림 실패는 최근 24시간 기준이라 날짜 필터 발송 이력과 다를 수 있다) ② 종·품종·즐겨찾기 빈 문구와 서버 오류 문구는 코드로만 확인
- SCR-ADM-110 검증 데이터 정리(2026-11-10, 8081 DB): 운영 설정 읽은 알림 숨김 기준(`notiHideCrtrDayCnt`)이 8로 남았다(처음 7, 12:31 변경). 관리자 `/admin/settings`에서 7로 되돌린다. 감사 로그 354·355 등 검증 기록은 지우는 API가 없다
- SCR-ADM-110 사람이 볼 것(판정 밖, 2026-11-10): ① 시드 설정 행은 수정자가 `SEED`라 아무도 저장 안 한 DB에서는 "관리자 #SEED"로 보인다 ② 검증용 8081 백엔드가 SYS_STNG 컬럼 삭제 커밋 전 코드라 500이 났었다. 사람용 8080도 11:52 전에 띄웠으면 재시작 ③ 입력 자릿수는 기획의 두 항목 말고도 개수 3자리·파일 크기 2자리로 줄였다(서버 범위 안)
- SCR-ADM-082 연결 남음(2026-11-10): 추가-1 캐릭터 생성 탭 기간 필터 (백엔드 연결 `GET /api/admin/processing/character-jobs` `fromYmd`·`toYmd`, 백엔드 저장소에서 /start). 백엔드 세션에 알렸고 SCR-ADM-110 다음에 하기로 답함. 프론트는 이미 보내므로 끝나면 화면에서 기간 조회만 확인
- SCR-ADM-072 연결 남음(2026-11-10): FN-ADM-072-03 회원 포인트 내역(`/mypage/points`)에 관리자 조정 사유 `memoCn`을 보일지 SJM과 정한다. 지금은 `features/point/history/PointHistory.jsx` `getTitle`이 일부러 "관리자 조정" 고정 문구만 보인다(SJM, SCR-MYP-020)
- SCR-ADM-072 검증 데이터(2026-11-10, 8081 DB): 회원 #1(tester)에 원장 2줄 "+10 [검증] 포인트 지급"·"-10 [검증] 되돌림"이 남았다(잔액은 처음과 같은 2,209, 원장 삭제 API 없음)

- SCR-ADM-023 노출 콘텐츠 연결 검증 데이터(2026-11-10, 8081 DB·관리자 계정): 후보 문구 `todayPhrsSn` 3 "[검증] 수정한 문구"(사용 안 함, 삭제 API 없음). 건강팁 1·2번 지정(pstSn 2·3)과 문구 1·2는 검증 전부터 있던 것
- SCR-AIM-011 사이드바 정리 알림(2026-11-09): 문서 담당에게 FN-AIM-011-20 설정 진입 입구(사이드바 하단 [설정])를 없앴고, 대화 헤더 안내 문구 "대화 제목은 첫 메시지로 자동 생성돼요"를 지웠다고 알림
- SCR-AIM-011 사이드바 정리 사람이 볼 것(판정 밖, 2026-11-09): 터치 기기에서 ⋮가 hover 없이 항상 보이는지는 코드(`@media(hover:hover)`일 때만 숨김)로만 확인
- SCR-AIM-011 새 방 펫 태그 검증 데이터 정리(2026-11-09, 8081 DB·tester 계정): AI 대화 330~339(제목 "까미 귀청소 주간 반복 등록"·"까미 체중 변화" 등)는 AI 창 [삭제]. 2026-11-09 사이드바 정리 검증에서 "까미 귀청소 주간 반복 등록" 6개를 지웠고 같은 제목이 3개 남았다
- SCR-AIM-012 일정·케어 항목 확인 카드 남은 것(2026-11-09): ① 일정 출처 `schdlSrcCd`를 안 보내 Java 기본값 HLTC0065(직접 등록)로 저장된다. 명세 FN-AIM-012-13은 "AI 생성"(HLTG22). Java 요청은 `schdlSrcCd`를 받으므로 AI 서버가 카드 `call`에 넣을 일 — AI 세션에 알림 ④ 결과 줄 요약이 카드 값과 겹친다(사람 "일단 놔둬봐"). ②·③은 끝(확인 카드 후속 정리)
- SCR-AIM-012 확인 카드 후속 정리 알림(2026-11-09): 문서 담당에게 FN-AIM-012-15 케어 항목 바로가기 글자가 "케어리스트에서 보기"로 바뀌었다고 알림(일정은 "케어 캘린더에서 보기" 그대로)
- SCR-AIM-012 확인 카드 후속 정리 검증 데이터 정리(2026-11-09, 8081 DB·tester 계정): 까미(petSn 1) 케어 항목 "귀 청소 검증"(케어리스트), 일정 "미용 예약" 2026-11-20 15:00(캘린더), AI 대화 323·324(AI 창 [삭제])
- SCR-AIM-012 일정·케어 항목 확인 카드 알림(2026-11-09): JAJ에게 `features/health/scheduleTypes.js`의 `BADGE_COLORS`·`TONE_CLASSES`를 `src/constants/calendarBadge.js`로 옮기고 다시 내보낸다고 알림(PR 본문에도). 문서 담당: FN-AIM-012-05(빈 칸이면 되물음 글)·버튼 [등록]이 ④ 확인 카드(빈 칸은 카드 `missing`, 버튼 [확인])와 다름. AI 세션: 프론트가 옛 등록 카드를 지웠으니 `register-result`·`done.card`·`draft` 이어 쓰기를 지워도 됨
- SCR-AIM-012 일정·케어 항목 확인 카드 검증 데이터 정리(2026-11-09, 8081 DB·tester 계정): 까미(petSn 1) 일정 schdlSn 4946·케어 항목 careArtclSn 3409·3410·AI 대화 318, 취두부(petSn 1004) 일정 4949와 11-19 11:00 정기검진 메이 동물병원·케어 항목 3411·3412·AI 대화 321. 일정은 케어 캘린더, 케어 항목은 케어리스트, 대화는 AI 창 [삭제]
- SCR-AIM-011 칩 정리 연결 남음(2026-11-09): AI 세션에 알린다 — "열린 방 메시지 요청에 `petSn`을 보내지 않는다, 칩은 대화 목록 필터로만 쓴다(방 태그는 그대로), 확인 카드는 `rules` 조건이 안 맞는 칸을 숨기고 `action.input`·Java 요청에서 뺀다"
- SCR-AIM-011 칩 정리 검증 데이터 정리(2026-11-09, 8081 DB·tester 계정): 까미(petSn 1) 음수량 기록 2026-11-09 09:10·200, 대화방 312(탄이)·314·315(까미)는 AI 창 [삭제], 방 309 "[검증] 고마워"·"검증: 고마워" 메시지와 답변은 메시지 삭제 API가 없어 DB에서
- SCR-AIM-002 Markdown 표시 연결 남음: AI 세션에 알림(2026-11-09, PR #288). AI 쪽 `docs/api/chat.md`에 "`cnvrsCn`은 Markdown(GFM)" 기재 대기(AI 세션)
- SCR-AIM-012 다음 작업(AI develop 병합됨 PR #52, `/start`로 기획): AI 쪽 배열·파일 칸 카드(`draft_expense`·`draft_observation_cycle`, `params`의 `array`·`items`·`minItems`·`generated`, `file`, `call.contentType`, `missing`의 `lines[0].expndAmt` 꼴)가 develop에 병합되면 `/start`로 기획한다. 지금 카드는 배열 칸을 숨겨서 이 카드가 오면 [확인]이 영영 꺼진다
- AI 대화창 버그(사람 2026-11-09 제보, 원인만 봄): 새 대화 첫 메시지에서 첫 글자 전 오류(`error`)나 스트림 전 오류(`failed`)가 나면 `useAnswerStream.js` `catch`가 `refresh()`를 부르지 않아, 서버에 만든 방이 왼쪽 목록에 안 나와 다른 대화로 옮기면 지워진 것처럼 보인다. `catch`에서도 목록·상세를 무효화하면 된다. 사람이 고칠지 아직 안 정함
- SCR-AIM-012 확인 카드 사람이 볼 것(검증 판정 밖, 2026-11-09): ① `useActionCards.js` `SERVER_FAILURE_CODES`가 `SERVER_ERROR`·`NETWORK_ERROR`·`INTERNAL_SERVER_ERROR`만 봐서 502(`EXTERNAL_API_ERROR` 등)·403·404·409는 `FAILED`로 저장되지 않고 카드가 오류 문구로 남는다 ② 칸 오류가 난 카드를 [취소]해도 칸 밑 오류가 남는다(`ActionCard.jsx`가 `fieldErrors`에 `isPending`을 안 봄) ③ 조건부 칸(건강 일지 '상태')을 고른 뒤 지표를 바꿔도 그 값이 input에 남아 저장 요청에 실린다 ④ 케어 완료 카드는 칸이 `petSn`·`careArtclSn`뿐이라 항목 이름을 못 보인다 ⑤ 처리 안 한 카드는 새로고침하면 사라져 답 없는 질문만 남는다(명세·계약대로) ⑥ "산책 30분 기록해줘"는 LLM이 건강 일지·케어 완료·케어 항목 중 다르게 고를 수 있다
- SCR-AIM-012 확인 카드 검증 데이터 정리(2026-11-09): 8081 DB 까미(petSn 1) 체중 기록 2026-11-09 09:30 4.5(`dailyHlthRcdSn` 55444)와 1회차의 09:00 4.5, 검증 대화 "까미 체중 4.2 기록해줘"(2개)·"까미 산책 30분 기록해줘"를 지운다

- SCR-MAN-001 정리(2026-11-09): tester 계정의 까미(petSn 1) 바로가기가 비어 있다(검증 시작 때부터, 원인 모름). 처음 상태로 두려면 `/main` [바로가기 추가] → 까미 → 종합 건강기록
- SCR-MAN-001 사람이 볼 것(판정 밖, 2026-11-09 푸터·AI 버튼): ① 모바일 dock 접기는 검증에서 터치 이벤트로만 확인(Playwright 마우스 드래그로는 안 접힘, `useAiDock.js`는 안 바뀜) ② `/community` 한 화면에서 `character-image?part=face` 요청이 수백 건 보였다(AI 버튼은 `part=full`만 부름, 원인 미확인) ③ 메인 바로가기 얼굴이 반려동물 1·2·14에서 404(기존 동작, 아이콘으로 대체) ④ 전신 이미지 오른쪽 투명 여백 14px는 서버 문서의 캐릭터 위치(512 중 x 96~416) 기준이라 캐릭터마다 조금 다를 수 있다 ⑤ PR 캡처는 `.playwright-mcp/pr/LJS-20261109-SCR-MAN-001-after-*`·`-community-after-*`(`-ai-face-after-*`는 얼굴 버전이라 쓰지 않음)
- SCR-MAN-001 사람이 볼 것(판정 밖, 2026-11-09): ① 대화창 `ChatInput`의 첨부 미리보기도 메인처럼 썸네일만 크게 할지 ② 반려동물 칩 단계(대표 없는 여러 마리 계정)는 화면으로 못 봄 ③ 검증 대화방이 tester 계정에 남음(AI 창 [삭제])
- SCR-MAN-001 사람이 볼 것(판정 밖, 2026-11-08): ① 영수증 인식 뒤 건강일지 주소에 `?recptSn=`이 남는다(`HealthDiaryPage.jsx`, JAJ, 가짜 응답에서 봄) ② 메인이 더는 `GET·PUT /members/me/dashboard-widgets`·`GET /pets/{petSn}/health-indicators`를 부르지 않는다(백엔드 정리는 담당과 상의) ③ `src/assets/index.css`의 `man-float` keyframes를 쓰는 곳이 없다 ④ `docs/routes.md` MAN-001 담당이 YAY로 남아 있다 ⑤ PR 캡처는 가짜 반려동물이 찍혀 실제 계정으로 다시 찍는 편이 낫다 ⑥ AI 건강분석 리포트 카드 행선지는 JAJ 건강기록 개편 공유 뒤
- SCR-MAN-001 로컬 검증 데이터(2026-11-08): 실제 영수증 업로드로 영수증 기록이 로컬 DB에 남았다(지우는 API 없음). 검증용 복사 파일 `.playwright-mcp/tmp/receipt.png`
- SCR-ADM-090 백엔드 후보(2026-11-05, 기획 밖): 템플릿 저장 400(`checkVariables`)에 모르는 변수 이름을 `data`로 실어 주면 프론트 전용 문구 대신 그 이름을 보일 수 있다(LJS 백엔드, 필요하면 백엔드 저장소에서 /start). 지금 프론트가 저장 전에 같은 패턴으로 먼저 검사한다
- SCR-ADM-090 사람이 볼 것(2026-11-05): 신고 복구·댓글 삭제·회원 정지·정지 해제 모달의 칸별 오류는 코드로만 확인했다(같은 모양인 신고 반려·게시글 블라인드는 화면 확인). 가짜 응답 폼(키워드 사전·라우팅 매핑표·케어미션·노출 콘텐츠 문구)은 API 연결 때 `toFieldErrors`·`toFormError`로 같이 한다
- SCR-ADM-040 사람이 볼 것(판정 밖, 2026-11-05): ① [이미지 넣기] 뒤 커서가 넣은 줄 끝이 아니라 내용 맨 끝으로 간다(`NoticeForm.jsx` `requestAnimationFrame` 뒤 다시 그려지며 밀림) ② 4,000자 초과 토스트는 코드로만 확인했다
- SCR-ADM-040 공용 DB 검증 데이터(2026-11-05): 공지 39 "[검증] 본문 이미지 확인"·41 "검증 이미지 공지", 첨부 4316·4317·4330·4331. 삭제 API가 없어 수정 화면에서 [사용]을 끄면 비노출
- SCR-ADM-001 사람이 볼 것(판정 밖, 2026-11-05): 390px 관리자 헤더에서 "관리자"와 옆 글자("냥멍관…")가 붙어 보인다(`layouts/` 관리자 헤더, 이번 범위 밖)
- SCR-ADM-021 사람이 볼 것(2026-11-05): 이 DB에 사진 있는 실종제보가 없어 상세 사진 표시와 404 문구는 응답을 바꿔서만 확인했다. 사진 있는 제보가 생기면 모달에서 사진이 열리는지 본다
- SCR-ADM-022 사람이 볼 것(2026-11-05): ① 이 PC는 완료 사진 파일이 없어 모두 404라, 실제 사진이 열리는 것은 응답을 바꿔서만 확인했다(파일이 있는 DB에서 모집 71의 3916·3917 확인) ② 조건 버전은 모든 버전을 펼치고 최신만 굵게 보인다(기획 문구는 "최신 펼침 + 이전 목록")
- SCR-CMU-005 연결 남음: FN-COM-009-08 주소 공유의 장소 검색 `searchChatPlaces` (장소 검색 API 미정, 가짜로 남김)
- SCR-COM-009 연결 남음: FN-COM-009-18 열린 방 알림 억제 (서버 알림 쪽, YAY)
- SCR-CMU-005 공용 DB 검증 데이터: 방 1에 "[검증]…"·"[검증2]…" 메시지와 사진 4312·4314, 매칭 101 요청·취소 이력, 모집글 49에 방 260. 메시지는 앱에서 지울 수 없어 DB에서 지운다
- SCR-CMU-005 참고: 기존 시드 채팅 사진(예: 3530·3866)은 서버가 404 `FILE_NOT_FOUND`(파일이 이 PC에 없음). 코드 문제 아님
- 돌봄 장소 찾기(KSJ `PlaceSearchModal`) 지도 오류 원인 조사(2026-11-05, 말만): 키 없음·서버 재시작 안 함, 카카오 Web 도메인에 `localhost:5180` 미등록, JS 키 대신 REST 키, 카카오맵 사용 설정 OFF, 네트워크·광고 차단. 공용 `hooks/useKakaoMap.js`는 `onload` 안에서 예외가 나면 Promise가 끝나지 않아 안내 없이 검색 버튼만 비활성으로 남는다
- SCR-ADM-080 사람이 볼 것(판정 밖, 2026-11-05): ① 페이지 머리 안내문(`AdminAiRoutesPage.jsx`)에 "우선순위가 높은(숫자가 작은) 행이 먼저예요"가 남아 모달의 "같은 지시어일 때 순서"와 말이 어긋난다 ② 모달 겹침 경고는 사용 안 함 행도 센다(표는 안 셈) ③ 매핑표 API가 가짜 응답이고 처음 값에는 겹치는 지시어가 없다
- SCR-ADM-091 사람이 볼 것(2026-11-05): 대시보드 "알림 발송 실패(24시간)" 링크는 대시보드가 아직 가짜(`notiFailCnt` 0)라 화면에 안 보여 응답을 바꿔서만 확인했다. [2]쪽 요청도 로컬 데이터가 4건이라 응답을 바꿔서만 확인했다
- 다음 추천(2026-11-04): 백엔드 PR #149(backend-a9) 연결 남은 1건 — FN-MYP-010-16 착용 확정(`PUT /api/pixel-characters/{pixelCharSn}/equipped-items` 200) 뒤 Python `/ai/characters/{pixelCharSn}/equipped-image` 합성 요청, 끝나면 `character-image` 캐시 무효화, 409 `EQUIPPED_ITEMS_CHANGED`는 무시(꾸미기 화면). 마일스톤 절이 생기면 `/start`. 그 밖에 백엔드 API가 develop에 있는데 프론트가 가짜인 화면: 외부 API 사용량(112)·운영 설정(110)·노출 콘텐츠(023)
- SCR-ADM-070 사람이 볼 것(2026-11-05): ① 이 PC의 ai `.env.local`이 `CHARACTER_BAKE_ENABLED=true`라 실제 [굽기]는 이미지 API가 과금된다. 반복 호출·[멈춤]·화면 떠나기는 Playwright 가짜 응답으로만 확인했다 ② 본문 없는 502(AI 서버 꺼짐 등)는 "일시적인 오류가 발생했어요."로 보인다 ③ 390폭에서 굽기 칸이 늘어 이름 칸이 좁다
- SCR-ADM-070 다음에(결정 2026-11-05): 굽기 지시를 고친 뒤 이미 구운 캐릭터 다시 굽기는 넣지 않았다. AI 서버는 안 구운 캐릭터만 굽는다(다시 굽기는 ai·백엔드 몫 포함)
- SCR-ADM-101 사람이 볼 것(판정 밖, 2026-11-04): ① 강아지 "확인용품종"(정렬 5) 등 로컬 DB 확인용 품종은 [수정]에서 사용을 끈다(삭제 API 없음) ② 400 `fields`에 `vrtyNm`·`sortSeq` 밖 칸만 오면 문구가 안 보인다(약관 폼과 같음)
- SCR-ADM-001 사람이 볼 것(판정 밖): ② 실패한 배치는 배치 화면에 실패 필터가 없어 필터 없이 간다 ③ 스켈레톤은 검증에서 코드로만 확인했다

- SCR-ADM-082 연결 남음: FN-ADM-082-03 (백엔드 연결 `GET /api/admin/processing/pdf-analyses?fromYmd=&toYmd=&page=`(summary `totCnt`·`scsCnt`·`tmotCnt`·`errCnt` 가정)·Python→Java 통지 내부 API, 백엔드 저장소에서 /start)
- SCR-ADM-082 사람이 볼 것(판정 밖): ① `routes/paths.js`에 `ADMIN_PROCESSING`을 기능 커밋에 같이 넣었다(사람 2026-11-04 추천안대로) ② 대시보드 링크는 `?tab=ocr&ocrPrcsSttsCd=AIMC0004`(기획의 `status=`를 서버 키 이름으로 고침) ③ 스켈레톤 높이는 브라우저로 재지 않고 계산한 값 ④ 가짜 영수증 성공·처리 중 코드 AIMC0003·0002는 가정(AIMG01에서 확인된 것은 인식 실패 AIMC0004뿐)
- SCR-ADM-080 연결 남음: FN-ADM-080-04·05 (백엔드 연결 AI 서버·대화창용 조회 API와 부록 A 초기 데이터 INSERT, 백엔드 저장소에서 /start. AI 서버가 `data/routing.yaml` 대신 그 API를 읽는 것은 ai 저장소 몫)
- SCR-ADM-080 사람이 볼 것(판정 밖): ① 화면 ID 선택지에 `docs/routes.md` ✓가 아닌 `SCR-COM-009`·`SCR-MYP-031`을 더했다(부록 A 행이 씀) ② 저장 토스트는 기획 문구 그대로 "~했습니다" 말투라 다른 관리자 화면("~했어요")과 다르다 ③ `routes/paths.js`에 `ADMIN_AI_ROUTES`를 기능 커밋에 같이 넣었다 ④ 스켈레톤 높이(3330px)는 45행 어림값
- SCR-ADM-072 사람이 볼 것(판정 밖): ① 기획의 `nickNm`·`keyword=` 대신 서버 키 `mbrNcnm`·`q`를 썼다 ② 가짜 원장에 없는 실제 회원의 현재 잔액은 회원 상세 포인트 탭 API의 마지막 잔액으로 읽는다 ③ `routes/paths.js`에 `ADMIN_POINTS`를 기능 커밋에 같이 넣었다
- SCR-ADM-071 사람이 볼 것(판정 밖): ① `routes/paths.js`에 `ADMIN_CARE_MISSIONS`를 기능 커밋에 같이 넣었다 ② 스켈레톤 높이는 행 높이로 계산한 값(풀마다 21·9·12행, `AdminCareMissionsPage.jsx`) ③ 조회 오류·저장 실패 문구는 가짜가 실패하지 않아 검증에서 응답을 바꿔서만 봤다 ④ 백엔드 마일스톤 SCR-ADM-071의 "`pet` 케어미션 협의 (SJM)"는 사람이 맞춘다
- 대기 순서(사람 결정 2026-11-03): SCR-ADM-060 장소는 없앰(사람 결정 2026-11-04, 메뉴·`docs/routes.md` 행 삭제, 마일스톤 제외 절). 백엔드 `milestones/LJS.md`의 SCR-ADM-060 절도 백엔드 저장소에서 제외로 옮긴다.
- SCR-ADM-051 사람이 볼 것(판정 밖): ① 같은 버전 값은 확인 모달을 누른 뒤에 막힌다 ② 로컬 DB `TRMS`의 `MARKETING`에 검증용 `v9.9-check`·`v9.9-verify`가 남아 있다(삭제 API 없음, 지우려면 두 행 삭제 후 `v1.0` 사용 여부를 되돌린다) ③ 기능별 동의 2종이 `TRMS`에 생기면 `termsKinds.js`에 다시 넣는다

- SCR-ADM-101 사람이 볼 것(판정 밖): ① 기능명세서 FN-ADM-101-02 지역 조회·화면설계서 SCR-ADM-101 지역 부분을 DMS에서 빼는 것은 문서 담당 몫(2026-11-03 결정) ② URL 변경(`docs/routes.md`·`routes/paths.js` `ADMIN_BREEDS`)은 `shared-files.md`상 따로 PR 대상이라 PR 본문에 팀 알림을 넣는다(2026-11-03 결정) ③ 옛 URL `/admin/breeds-regions` 리다이렉트는 두지 않았다 ④ 품종 이름 50자·중복 검사(공백 무시)는 가정

- SCR-ADM-050 사람이 볼 것(판정 밖): ① 실행할 수 없는 서버(`runnableYn:false`)에서도 [뉴스 수집 실행]이 켜져 있다(배치 현황 `BatchTable.jsx`는 막음) ② 중복 키워드 안내가 그 칩을 지운 뒤에도 남는다 ③ 관리자 등록 뉴스도 사용 스위치로 숨길 수 있다(명세는 수집 기사만) ④ 썸네일은 선택 값, 제목 200자·요약 1000자·키워드 50자는 가정 ⑤ 스켈레톤 높이는 행 높이로 어림한 값(`AdminNewsPage.jsx`) ⑥ `routes/paths.js`에 `ADMIN_NEWS`를 기능 커밋에 같이 넣었다
- SCR-ADM-050 로컬 DB 검증 데이터(2026-11-04): 관리자 뉴스 `newsSn` 201 "검증용 뉴스 LJS 수정"과 썸네일 첨부 4223·4224가 남았다(뉴스 삭제 API 없음. DB에서 지우거나 [사용]을 끈다). 400 `fields` 칸 아래 서버 문구는 코드로만 확인했다. 썸네일 업로드 뒤 등록이 실패하면 올린 파일이 남는다(정리 API 없음)
- SCR-ADM-050 로컬 정리(2026-11-03): 뉴스 수집 배치 실행 이력 `btchExcnHstrySn` 308과 실제 RSS 수집 기사가 로컬 DB에 남았다(되돌리는 API 없음). 백엔드 로컬 설정 `app.news.batch-enabled=true`는 확인용으로 켰으니 끄려면 `false`로 되돌린다
- 추가-1(SCR-AIM-010) 알릴 것: ai-47에게 "프론트 반영 끝. `ReceiptUploadModal`이 `error.data?.recptSn`을 [직접 입력]에 `rcptSn` 키로 넘기고(받는 쪽 `HealthDiaryPage`도 `rcptSn`), 다시 올리기·닫기 때 비운다. AI `LJS` PR과 같이 낸다". JAJ에게 "`HealthDiaryPage.jsx`가 받은 `rcptSn`을 `receiptFlow`에 넣기만 하고 `CheckupModal`·검진기록 등록 요청에 넘기지 않아 영수증 연결이 실제 저장에 빠진다(추출 0건도 같음)"

- SCR-ADM-023 사람이 볼 것(판정 밖): `routes/paths.js`에 `ADMIN_EXPOSURE`를 기능 커밋에 같이 넣었다. 스켈레톤 높이는 잰 값이 아니라 행 높이로 어림한 값이다(`AdminExposurePage.jsx`). AI 코멘트 탭은 미사용을 글자 없이 스위치·회색 글자로만 보인다

- SCR-ADM-090 로컬 DB 검증 데이터(2026-11-03): 템플릿 `notiTmpltSn` 5(케어 일정·이메일, 제목 "검증 등록", 미사용)가 남았다(삭제 API 없음). 3번은 원래 값으로 되돌렸다. 수정 모달은 제목을 필수로 검사하지만 서버는 선택 값이다(DB에 제목 null 템플릿 3번)

- SCR-ADM-022 사람이 볼 것(판정 밖): 비용 단위 코드가 백엔드 `CareCostUnit`(PCAC0004·0005)과 회원용 펫돌봄 화면(PCAC0011·0012)이 다르다. 관리자 화면은 백엔드 값을 따랐다. `routes/paths.js`에 `ADMIN_CARE_MATCHES`를 기능 커밋에 같이 넣었다. 백엔드 마일스톤 SCR-ADM-022 절의 "KSJ 협의" 표기는 사람이 맞춘다

- SCR-ADM-021 사람이 고치는 문서: 백엔드 `docs/admin/implementation-plan.md`의 SCR-ADM-021 담당 KSJ → LJS


- SCR-ADM-090 사람이 볼 것(판정 밖): 목록 스켈레톤 높이(1108px, 모바일 1160px)는 20행 기준 계산값인데 실제 AIMG02는 9종이라 18행이다(`AdminNotificationTemplatesPage.jsx`). 템플릿 목록 자체 오류(403 아닌 것) 분기는 코드로만 봤다. 치환 변수 칩은 케어 일정 기준 목록을 모든 유형에 똑같이 보인다. 화면설계서의 `{변수}` 표기를 `{{변수}}`로 고치는 것은 사람 몫

- SCR-ADM-070 로컬 DB 검증 데이터(2026-11-03): 아이템 `itemSn` 39 "[검증] 연결 가방 수정"(가방, 판매 중지)이 남았다(삭제 API 없음). 가방 순서는 원래대로 되돌렸다. 처음부터 있던 아이템(1~36)은 이 PC에 첨부 파일이 없어 이미지가 404로 빈 칸이다
- SCR-ADM-070 연결 남음: 추가-1 (백엔드 연결 공통코드 MYPG01에서 신발 제외·기존 신발 아이템과 보유·착용 처리, 백엔드 저장소에서 /start). 정리되면 `api.js` `EXCLUDED_PART_NAMES` 이름 거르기를 지운다. 문서(FN-ADM-070-02, 화면설계서 SCR-ADM-070 부위 목록) 갱신은 사람 몫
- SCR-ADM-070 사람이 볼 것(판정 밖): 이미지 검사에 영수증용 `@/utils/receiptFile`을 쓴다. 미리보기 object URL을 해제하지 않는다. 가짜 목록이 공통코드도 불러 "아이템 목록을 불러오지 못했어요." 분기는 화면으로 못 봤다. 부위 Select 안내에 `aria-describedby`가 없다.

- SCR-ADM-042 연결 남음: FN-ADM-042-07 접수 시점 캐릭터 이미지 (백엔드 연결 `GET /api/admin/inquiries/{otoInqrySn}/images/{atchFileSn}`가 캐릭터 이미지 1483에 404 FILE_NOT_FOUND, 백엔드 저장소에서 /start). 같은 코드로 204 첨부는 200이다. 백엔드 `/api/admin/inquiries`는 `origin/LJS`에만 있어 develop 병합이 돼야 배포에서 동작한다. 검증은 로컬 8080(백엔드 LJS 작업 사본)으로 했다
- SCR-ADM-042 FN-ADM-042-08 펫돌봄 분쟁 연결: SCR-ADM-022(펫돌봄 거래)를 만들 때 분쟁(`inqryCtgr=DISPUTE`) 문의 상세에 [작성자 매칭 목록] 링크(`mbrSn`)를 붙인다(사람 결정 2026-11-03)
- SCR-ADM-042 사람이 볼 것(판정 밖): ① 상태가 서버 이름 그대로 "접수"로 보이고 탭은 "미답변"이다(백엔드 문서는 CSCC0012를 화면에서 '미답변'). 맞추려면 추가 요청이나 새 마일스톤으로 ② 삭제된 픽셀 캐릭터 문의는 `imgs`가 비어 `charImgAtchFileSn`이 오면 캐릭터 이미지 자리가 스켈레톤으로 남는다(`AdminInquiryDetailPage.jsx` `InquiryDetailBody`, 화면으로 못 봄) ③ 시드 픽셀 문의(82 등)는 첨부가 있는데 `charImgAtchFileSn`이 null이라 캐릭터 이미지 칸이 없다(백엔드 데이터) ④ 409 응답 표시는 코드로만 봤다
- SCR-ADM-042 로컬 DB 검증 데이터(2026-11-03): 문의 204~206("확인A~C", 205는 회원 삭제)이 남았다. 204는 답변 완료("[검증] 답변 수정 확인입니다."), 206은 원래 캐릭터 복원(CHRC0009)을 실행해 회원 1의 캐릭터 1이 복원되고 알림이 갔을 수 있다. 감사 로그도 남았다(되돌리는 API 없음)

- SCR-ADM-041 로컬 DB 검증 데이터(2026-11-03): FAQ `faqSn` 41~44("[검증]·[확인]" 질문, 비노출)가 남았다(삭제 API 없음)
- SCR-ADM-041 사람이 볼 것(판정 밖): 기획은 사용 칸을 "배지"라고 했지만 글자(비노출만 회색)로 보인다(`FaqTable.jsx`). 등록 직후 새로고침 없이 목록이 바뀌는지는 검증이 직접 보지 않았다(수정과 같은 무효화)

- SCR-ADM-040 사람이 정할 것: 폼이 [사용]을 끈 상태에서도 [알림 발송] 체크를 막지 않아 서버가 400 "입력값이 올바르지 않습니다."로 거절한다(`NoticeForm.jsx`). 막으려면 새 마일스톤이나 추가 요청으로
- SCR-ADM-040 로컬 DB 검증 데이터(2026-11-03): 공지 37 "[검증] 알림 발송 공지"가 비노출로 남았다(삭제 API 없음). 회원 191명에게 공지 알림이 1건씩 갔다
- SCR-ADM-040 실제 확인이 남은 것: 글자 수 400은 입력칸 `maxLength`가 막아 화면으로 못 봤다. 403은 코드로만 봤다. 스켈레톤 높이(목록 표 1025px, 폼 카드 600px)는 잰 값이 아니라 계산값이다

- 8080 백엔드를 공용 DB로 되돌릴지: SCR-ADM-030 검증 때 사람이 `local` 프로필(로컬 DB)로 재시작했다. 지금 5173 화면도 로컬 데이터를 본다
- SCR-ADM-030 백엔드 병합 순서: 신고 관리자 API(백엔드 `origin/LJS`, 조치 코드 커밋 `c96d29a`)가 develop에 병합되고 공용 DB에 `DCLR.DCLR_ACTN_CD`(v0.11 (9))가 적용돼야 배포에서 동작한다
- SCR-ADM-030 공용 DB 검증 데이터(2026-11-02, 사람 허용 "아무나 해도 돼, DB 갈아엎을 예정", 되돌리지 않음): 신고 97·99·100·116·121·122·131·132 처리(100은 다른 회원 신고가 같은 대상이라 함께 처리됨), 글 337·213 블라인드로 남음, 글 607 블라인드 뒤 복구, 댓글 2561 삭제로 남음, 회원 38 7일 정지 뒤 해제. 신고자 알림·감사 로그가 남았다
- SCR-ADM-030 로컬 DB 검증 데이터: SQL로 넣은 신고 `dclr` 126~136·142(신고자 회원 191~197, 상세 내용 '검증A'~'검증G'), tester API 신고 137~141. 회원 141 정지(2026-11-09까지), 글 998 블라인드로 남음
- SCR-ADM-030 사람이 정할 것(판정 밖): 정지 사유 칸에 글자 수 제한이 없다(`ReportCompleteForm.jsx`, 서버 제한 확인 안 함). 영구 정지 `suspnDayCnt: null` 전송은 코드로만 확인했다. 첫 진입 때 상태 탭 줄이 스켈레톤이 아니다(`ui.md` 로딩 표시, `AdminPostsPage.jsx`와 같은 구조). 행 수가 정해지지 않은 목록 스켈레톤은 판정에서 뺐다(반려 탭 11건 +83%)
- SCR-ADM-020 실제 확인이 남은 것: 403과 조회 오류·[다시 시도]는 조작한 응답으로만 봤다. 상세 스켈레톤은 748px인데 글 1001 실제는 1299px다(이력 길이에 따라 달라짐, `AdminPostDetailPage.jsx`). `/admin/posts/abc`처럼 잘못된 번호는 [다시 시도]만 나오고 [목록으로]가 없다. 삭제된 글의 댓글에도 [삭제]가 나온다(기획이 막지 않음, 막을지 사람이 정한다). 실종센터 필터는 0건이고 `[실종]`·`[펫돌봄]` 제목 글은 펫정보·펫일상 코드다
- 공용 DB 검증 데이터(2026-11-02, 사람 허용): 글 1001을 블라인드·복구 2번(`pstSttsHstrySn` 1077~1080), 댓글 4028을 달고 삭제했다(되돌리지 않음). 감사 로그 `mngrTaskLogSn` 9~14. 검증 중 다른 작업이 글 1001을 신고(`dclrSn` 126~130)·자동 블라인드(이력 1081)·복구(이력 1082, 감사 로그 16·17)해 글은 정상이고 신고 수 5가 남았다. 주체는 확인 못 함. 감사 로그 15도 다른 세션으로 보인다
- 공용 DB 확인: 아래 줄의 앞선 기록 `mngrTaskLogSn` 10~13·25·26과 번호가 겹친다. 지금 DB의 10~13은 SCR-ADM-020 것이고 로그가 17번까지뿐이다. DB 초기화인지 다른 DB인지 확인 안 함
- SCR-ADM-020 문서 맞출 것(사람): 기능명세서 FN-ADM-020-01·화면설계서 SCR-ADM-020의 게시판에 펫돌봄이 있는데 코드가 없어 필터에서 뺐다
- SCR-ADM-011 연결 남음: FN-ADM-011-01 백엔드 연결 `AdminMemberDetailResponse.mbrAuthrtCd`(백엔드 저장소에서 `/start`). 그동안 관리자 회원에게도 [정지]가 보이고 서버가 409로 거절한다. 필드가 들어오면 `AdminMemberDetailPage.jsx` 머리 주석의 해당 줄만 지운다
- SCR-ADM-011 실제 확인이 남은 것: 반려동물 20건 초과 쪽 번호와 동의 기록 없는 약관 행은 조작 응답으로만 봤다(로컬 데이터에 없음). 스켈레톤은 화면으로 못 봤고 높이는 계산값이다(`AdminMemberDetailPage.jsx`). 범위를 벗어난 `?page=`는 빈 문구만 나오고 쪽 번호가 없다(SCR-ADM-010과 같음). 기본 정보 한 줄에 가입일 `2026-10-21`과 최근 로그인 `2026.10.22 14:02` 표기가 섞여 있다(`MemberDetailInfo.jsx`)
- 원인 안 봄: SCR-ADM-011 검증 중 `/api/auth/me` 401로 로그인 화면으로 한 번 넘어갔고 다시 로그인하니 정상이었다
- SCR-ADM-113 실제 확인이 남은 것: 스켈레톤은 화면으로 못 봤고 높이 240px는 잰 값이 아니다(`AdminAdminsPage.jsx`). 범위를 벗어난 `?page=`는 "관리자가 없어요"만 나오고 쪽 번호가 없다(SCR-ADM-010과 같음). 마지막 관리자 [해제] 비활성은 내 행이 아닌 경우를 조작한 응답으로만 봤다
- 로컬 검증 데이터: 회원 198을 지정했다가 해제해 감사 로그 2줄(`mngrTaskLogSn` 25·26)이 남았다
- SCR-ADM-111 실제 확인이 남은 것: `?batch=`로 바로 들어오면 `HistorySkeleton`(20행 1026px)이 실제보다 길다(2026-11-02 이력 5건: 본문 1598px, 실제 약 927px, +72%). 행 수는 응답 전에 알 수 없어 그대로 둔다(사람 결정 2026-11-02). 이력 없음 문구도 이번에는 화면으로 못 봤다. 수동 실행은 로컬 DB에 SYSC0027이 없으면 외래키에 걸릴 수 있어 해 보지 않았다
- SCR-ADM-013 사람이 정할 것: 파기 안내와 [배치 현황]이 403·조회 오류 화면에도 나온다(`AdminMembersWithdrawnPage.jsx`). 고치면 추가 요청이나 새 마일스톤으로
- SCR-ADM-013 실제 확인이 남은 것: 스켈레톤은 화면으로 못 봤다. 높이 1025px는 20행 기준이라 지금처럼 실제 5건이면 표보다 훨씬 크다(`AdminMembersWithdrawnPage.jsx`). 화면의 403 안내는 조작한 응답으로만 봤고 실제 서버 문구로는 못 봤다. 가짜 상태 배분을 바꿔 정지 23명이고 SCR-ADM-010·012 값이 달라졌다(이 둘 연결 때 없어진다)
- 공용 하네스: 관리자 화면 검증은 별도 검증 에이전트가 관리자 계정을 받아야 한다. 이번에는 사람이 지시해 프롬프트에 계정을 넣었다(`/impl` 고정 프롬프트 예외). 검증 스킬에 관리자 화면 로그인을 어떻게 둘지 PR로 정한다
- SCR-ADM-012 실제 확인이 남은 것: 쪽 이동 화면, 정지 일시 null 행 "—", 403 안내, 409 `MEMBER_NOT_SUSPENDABLE` 표시는 조작한 응답으로만 봤다. 일반 회원은 라우트 가드가 `/main`으로 보내 403 안내까지 가지 않는다. 해제 409 뒤 목록은 자동 갱신하지 않는다(기획에서 뺌). 로딩 스켈레톤은 화면으로 못 봤고 표 높이 1008px는 잰 값(실제 1186px, 15% 작음)이다
- 공용 DB 검증 데이터(2026-11-02, 사람 허용): 회원 129를 7일 정지·해제·영구 정지·해제해 정상으로 되돌렸다. 상태 이력 `mbrSttsHstrySn` 209~212, 감사 로그 `mngrTaskLogSn` 10~13이 남았고, 관리자 로그인 감사 로그 9도 이 검증으로 보인다. 그 회원 세션은 정지 때 폐기됐다
- 백엔드에 알릴 것(검증 에이전트 보고, 사람 미확인): `application-local.properties`는 `local` 프로필이 켜져야 읽혀 그냥 `bootRun`하면 공용 DB에 붙는다. 백엔드 README "파일이 있으면 그 DB 설정이 우선한다"와 다르다. 2026-11-02 8080 서버의 DB 연결은 공용 DB로 확인했다
- SCR-ADM-010 실제 확인이 남은 것: 정지 회원 행의 정지 종료일은 일단 표시하지 않는다(사람 결정 2026-11-01). `?page=99`처럼 범위를 벗어난 쪽은 빈 문구만 나오고 쪽 번호가 없다
- SCR-ADM-112 연결 남음: FN-ADM-112-01·02·03 백엔드 연결(백엔드 저장소에서 `/start`). 사용량 조회 API 3종·필드 이름, SYSG05를 명세 7종으로 수정, 호출 로그 기록(Python 통지 포함). 연결 때 `features/apiUsage/api.js` 가짜와 `apiUsageLabels.js`의 임시 코드(`TMP00001` AI 분류, `TMP00002` PDF 분석)를 바꾼다. 지금 AI 서버에는 토큰을 읽는 코드와 Java 통지가 없다(2026-11-01 검색)
- SCR-ADM-112 문서 맞출 것(사람): 명세 7종에 대화 제목 생성(별도 LLM 호출)이 없고, PDF 분석은 AI 저장소 작업 사본에 코드가 없다. SCR-ADM-082도 PDF 실패를 이 로그로 본다고 되어 있다. 공통코드의 장소 공공데이터는 명세 7종에 없다
- SCR-ADM-112 실제 확인이 남은 것: 스켈레톤 높이는 계산값이다(`AdminExternalApiUsagePage.jsx`). 조회 오류의 [다시 시도]는 화면으로 못 봤다. 390px 날짜 입력 줄 오른쪽 끝이 다른 칸보다 약 9px 더 나간다(`ApiUsageFilter.jsx`, 캡처로 어림, 가로 스크롤은 없음)
- SCR-ADM-111 문서 맞출 것(사람): 기능명세서 FN-ADM-111-02·화면설계서 SCR-ADM-111에 실패 건수가 남아 있다. 응답에 없어 화면에서 지웠다(사람 결정 2026-11-01)
- SCR-ADM-111 실제 확인이 남은 것: `실패 · {사유}` 문구는 화면으로 못 봤다. 이력 스켈레톤은 20행 기준(잰 값 306·1026px)이라 이력이 적은 배치를 `?batch=`로 바로 열면 ±20%를 넘는다(1행 +139%, 행 수는 응답 전에 알 수 없음). 실행 직후 결과 칸은 `실행 중`인데 버튼은 활성인 구간이 약 5초 있다(기획대로). 케어미션 출제는 이 서버에서 `runnableYn=false`다
- SCR-ADM-111 배치 범위: 가짜는 공통코드 SYSG02 4종이다. 명세 10종·설계서 9종과 차이는 문서를 고치거나 배치가 늘 때 정한다
- SCR-ADM-114 관리자 화면을 붙일 때: 새 `trgtTblNm`은 `features/audit/auditLabels.js` `TARGET_OPTIONS`에 한 줄 더한다(지금 `SYS_STNG`·`MBR`). 없으면 표에는 서버 값이 보이고 필터에는 없다
- SCR-ADM-114 실제 확인이 남은 것: 쪽 이동은 로그가 8건뿐이라 응답 조작으로만 봤다(서버 페이징은 직접 호출로 확인). 스켈레톤 높이는 계산값이다(`AdminAuditLogsPage.jsx`). 로그가 20건을 넘으면 1440px·390px로 잰다(`docs/convention/ui.md`). 대상 필터 [회원]은 로그인 행을 주지만 그 행의 대상 칸은 "—"다(결정, 그대로 둠). 요약·상세 항목은 서버 필드 이름 그대로다. 한글 요약은 서버에서 고칠 일이다
- 사람이 고칠 것(2026-11-01 사람 확인 때 "고치고 싶은 부분이 많은데 나중에", 내용은 아직 안 받음, 2026-11-01 사람 결정으로 다른 화면 구현 뒤로 미룸): 그때 목록을 받아 정한다. 검증 때 나온 참고 3가지: ① 390px에서 "관리자"와 닉네임 사이 간격 0px(`AdminLayout`) ② 390px 운영 설정 저장 토스트가 [되돌리기] 버튼과 일부 겹침 ③ 정확히 760px 사용자 화면은 바텀 네비가 없는데 토스트만 76px 위에 뜸(`BottomNav`는 `min-[760px]:hidden`, 운영 설정 네비는 `min-[761px]:hidden`이라 경계가 1px 다름)
- 팀에 알릴 것(PR 전): 공용 `components/ToastContainer.jsx`를 고쳤다. 760px 이하에서 토스트가 76px 위에 뜬다(바텀 네비 없는 `/main` 등도 같음)
- 사람이 고치는 문서(운영 설정 모바일 네비): 관리자 화면설계서 SCR-ADM-001 처리 조건을 "1100px 이하: 사이드바를 숨기고 상단 바 왼쪽 [≡]로 연다(덮는 서랍). 관리자 화면은 PC 사용 기준이라 공통 모바일 전용 배치는 두지 않음. 예외로 운영 설정(SCR-ADM-110)은 760px 이하에서 묶음 5개를 하단 바텀 네비로 나눠 고른 묶음만 표시"로 고친다
- 운영 설정 연결 때 확인: 묶음 바텀 네비의 저장 포함은 가짜 API에서 다시 불러온 값으로만 확인했다. 스켈레톤 카드 1장도 화면으로 보지 못했다
- SCR-ADM-110 스켈레톤 높이는 계산값이다(`AdminSettingsPage.jsx`, 383·503·143·203·143px). 실제 API 연결 때 1440px·390px로 잰다(`docs/convention/ui.md`)
- `AdminLayout`의 `AdminLogoutConfirm`은 `ProfileDropdown`의 `LogoutConfirm`과 달리 AI 창·채팅 창을 닫지 않는다(관리자 화면에 여는 버튼이 없음). 이동 대상도 `/login`으로 다르다. 공통화할지 정한다
- YAY에게 알릴 것(PR 전): 로그인 성공 뒤 이동을 `LoginPage.jsx`에서 바꿨다. 관리자는 `?redirect=`와 상관없이 `/admin`, 이동 전 `/auth/me`를 새로 받는다
- 공용 하네스: 검증 스킬의 기준 사본 비교 명령이 `scripts/verify-loop.sh:99` 가드에 막혀 검증 에이전트가 비교하지 못한다(2026-10-30, 사람이 직접 실행해 확인). 가드나 스킬을 PR로 고친다
- 관리자가 회원 화면(`/main` 등 user 레이아웃)에 들어오면 지금은 열린다(2026-10-30 SCR-ADM-110 기획에서 범위 밖으로 넘김). FN-COM-002-02 "역할이 맞지 않는 화면 → 역할별 홈"대로 `AppRoutes.jsx` member 묶음의 `ProtectedRoute`에 회원 역할만 허용할지 정한다(관리자도 회원 화면을 봐야 하는지 사람 결정)
- 팀에 알릴 것(관리자, PR 전): `docs/routes.md` 1장에 관리자 화면 URL 32개를 넣었다(`/admin/...`, 관리자 화면설계서 v0.1). 담당 표에 관리자(ADM) LJS 추가(백엔드 PR #79와 같음). DMS에 `관리자_화면설계서_v0.1_20261030`(새 문서)·`관리자_기능명세서` v0.2(FN-ADM-050-07 추가, 110 케어 노출 수 제외)를 올렸다. 기능명세서 DMS 설명 문구는 v0.1 그대로(134건·화면설계서 없음)라 DMS 화면에서 고친다(사람)
- 공통 이미지 연결 남음(2026-10-30): KSJ에게 커뮤니티 사진 주소를 `getPostImageUrl`에서 `@/utils/fileUrl` `publicFileUrl`로 바꿨고(7곳, 주소 같음) `@/components/FileImage`를 쓸 수 있다고 알린다. 문의 첨부 `useInquiryImageUrls`는 object URL 방식 그대로(한 화면 전용·큰 사진). SJM에게 `PetFace`가 받는 동안 스켈레톤을 보여 주고 `fallback`은 실패 때만 나온다고 알린다(`PetProfileCard`). JAJ 영수증 원본(`/receipts/{recptSn}/image`)·SJM 아이템(`/items/{itemSn}/image`)은 `useFileImage` + `FileImage`로 붙인다. 공개·비공개 분류는 가정이고 공동양육자 한정 여부는 SJM 확인 전. 팀 공지 문구는 2026-10-30 세션에서 사용자에게 전달함
- 백엔드에 알릴 것(범위 밖, 2026-10-30): ① 파일은 올린 PC 디스크에만 있어 공용 DB의 다른 사람 사진은 이 PC·배포 서버에서 404(`/api/files/public/4247` 등) ② 게시글을 지워도 그 사진 `/api/files/public/{번호}`가 200으로 계속 열린다(글 1021·사진 4251) ③ 브라우저 `fetch`로 직접 보낸 `DELETE /api/posts/1021`은 403, 화면 [삭제]는 성공(원인 안 봄)
- 대화창 화면 URL `/ai` → `/ai-chat`(2026-10-30, backend-90 요청, 사람이 고침): 배포 Nginx가 `/ai`를 301로 `/ai/`(Python)에 보내 Not Found였다. Nginx는 바꾸지 않았다(임시 `location = /ai` 없음, 사람 확인 2026-10-30). PR #120 병합(2026-10-30) 뒤 `https://pawever.cloud/ai-chat`이 200·SPA로 열림(curl 확인 2026-10-30). 남은 것: 팀에 알림(사람)
- SCR-AIM-011·013 연결 남음: FN-AIM-011-08 대표 반려동물 기본 선택은 SJM이 `features/pet/api.js` `getPets`를 실제 `GET /api/pets`로 붙인 뒤 확인(지금 가짜는 `rprsYn: 'Y'`라 계약 필드 `rprsPetYn`이 없어 기본 [전체]). SJM에게 "pet 가짜 `getPets`의 대표 필드가 `rprsYn: 'Y'`인데 계약은 `rprsPetYn`(boolean)이에요. AI 대화창이 `usePets`로 `rprsPetYn`을 읽어요"라고 알린다. 본창 건강 일지는 `features/health/api.js` 가짜 목록이라 같은 `petSn`이 다른 이름일 수 있다(JAJ 연결 몫). 다시 연 대화에서 결과 카드 다시 불러오기는 명세 FN-AIM-013-09 미결
- 정리(2026-10-30 검증 데이터): 대화 138 "검증 초코 태그"·139 "영수증 분석"(둘 다 `petSn` 1)과 펫 태그 검증 때 만든 "검증 나비 태그"·"검증 전체 태그"를 `/ai-chat` 사이드바에서 삭제. 영수증 `recptSn` 531은 백엔드 정리 방법을 따른다
- SCR-AIM-013 병합 순서: ai 저장소 SCR-AIM-013(`receipt-result`·`AIMC0031`, 작업 사본 커밋 전)·백엔드 공통코드 AIMC0031 PR과 같은 때 병합한다. 공통코드는 알림 코드가 그대로라 `notiTabs.js` `INQRY_ANSWR`='AIMC0030' 유지
- SCR-AIM-013 사람이 볼 것(검증 판정 밖): 클라이언트 안전망은 20초(`SERVER_ANALYZE_GUARD_MS`, 기획 문구는 15초 — 서버 504가 15초라 동작 같음). 시간 초과·일시 오류, 결과 카드 [취소] 무저장, 할인 0 "없음"·결제 금액 없음 총금액 —은 코드로만 확인. 총금액은 결제 금액 + 할인 합계로 만든 값이라 영수증 할인이 하단·구역 할인으로 안 잡히면 실제 총액과 다를 수 있다
- 전달(SCR-AIM-008, PR 전): JAJ에게 "건강 일지 영수증 결과 확인 모달(`features/health/diary/Receipt*`·`receiptUtils.js`)이 이제 AI 서버 분석 응답 `{ recptSn, petSn, ocr: { hsptlNm, ckupYmd, recptAmt, btmDscntAmt, sections:[{ sectionNm, sbttlAmt, dscntAmt, items:[{ itemNm, itemAmt }], drugs:[{ mdcnNm, mdcnDays, mdcnUsage, mdcnAmt }] }] } }`를 그대로 읽어요. `receiptApi.js` `getReceiptDetail`·`useReceiptDetail`·`healthKeys.receiptDetail`과 `?fakeReceipt=`는 지웠고, `saveReceiptCheckups` 인자는 `recptSn`이에요. 검진 종류는 응답에 없어 회원이 골라요". ai-23에게 "프론트 연결 끝(검진 영수증·결과 확인 모달). 실제 청구서 확인함. 아조딜 `mdcnUsage`가 null로 와서 1일 횟수 칸이 비어요(회원 입력)"
- SCR-AIM-012 연결 남음: 012-13·14 Java 일정·케어 항목 등록 API(JAJ, 출처 HLTC0067, 사람이 JAJ에게 요청 예정). 나오면 `features/ai/api.js` `registerToHealth` 가짜만 실제 요청으로 바꾼다(카드 필드가 SCHDL·CARE_ARTCL 컬럼 이름 그대로). 직접입력 주기 `cycleDays` 저장 컬럼은 백엔드와 정할 것. 지금은 [등록]해도 캘린더에 생기지 않고 대화에 "✔ 등록됨"만 저장된다
- SCR-AIM-012 PR 전 확인: 프론트는 ai 저장소 LJS 작업 사본(커밋 전)의 `docs/api/chat.md` messages `draft`·`done.card`와 `POST /ai/conversations/{aiCnvrsRoomSn}/register-result`에 붙었다. ai 쪽이 커밋·배포돼야 develop에서 동작한다(ai-23 세션 몫)
- SCR-AIM-012 사람이 정할 것(검증 판정 밖): ① 등록 오류 안내가 `confirmRegister.isError || cancelRegister.isError`라 [취소] 실패 뒤 [등록]이 성공해도 "처리하지 못했어요…"가 남는다(전부터 있던 동작) ② 처리 안 한 카드는 새로고침하면 사라져 내 말풍선만 남는다(결정 A, 나중에 B 브라우저 `sessionStorage` 보관·C 서버 카드 저장을 다시 볼 수 있음). 고치면 추가 요청이나 새 마일스톤으로

- SCR-AIM-002 연결 남음: RECEIPT 판정 뒤 처리(SCR-AIM-013 마일스톤, LJS. REGISTER는 SCR-AIM-012 연결로 끝남). FN-AIM-002-07은 ai 반영(③) 뒤 틀린 LLM 키로 다시 확인해 볼 수 있다
- SCR-AIM-002 AI 서버 반영(ai-c7 2026-10-29, ai 커밋 전): ① ROUTE 이동 안내를 AI 메시지로 저장(`done.message`) — 이동 중 저장 말풍선과 카운트다운 안내가 함께 보이는 것은 그대로 둔다(사용자 결정 2026-10-29) ② 15자 이하 첫 메시지는 그대로 제목 ③ 분류 LLM 장애는 `intent` 없이 `error` 이벤트 — 틀린 LLM 키로 FN-AIM-002-07 재현 가능. 명세 FN-AIM-004 문구 갱신은 사람 몫
- SCR-AIM-002 FN-AIM-002-07 사람 확인: 아래 방법으로도 재현 안 됨, 사용자가 넘어가기로 함(2026-10-29). 검증은 브라우저에서 꾸민 SSE로만 확인된 상태. 원인은 아직 모름
- SCR-AIM-002 FN-AIM-002-07 재현법 정정: LLM 키를 빼면 서버가 안 뜨고, 틀린 키는 위 ③ 때문에 폴백이 된다. ai `.env.local`에 `AI_MODE=real`·올바른 `LLM_API_KEY`인 채로 `ANSWER_FIRST_TOKEN_SEC=0.01`을 넣고 재시작(mock에서는 첫 조각이 바로 나와 재현 안 됨, ai-c7 답 2026-10-29) → 건강 질문 → "일시적으로 답변할 수 없어요" + [다시 시도] → 줄을 지우고 재시작 → [다시 시도]

- SCR-AIM-002 사람이 정할 것(검증 판정 밖, 코드 읽다 나옴): ① 채팅(COM-009) 바로가기 버튼이 채팅 창 대신 본창을 `/chat`으로 옮김(`AnswerBubble`이 `isModal`을 안 씀) ② 서버 저장 전 전송 실패(400·404·502) 때 임시 내 말풍선이 "메시지를 보내지 못했어요"와 함께 남음. 고치면 `### 추가 요청`으로 받는다
- SCR-AIM-002 AI 서버(ai-41) 답(2026-10-28, 그쪽 사람 결정): ① 메시지 테이블은 INSERT 전용이라 [다시 생성] 뒤에도 미완료(`cmptnYn=false`) 메시지가 DB에 남는다 → 프론트 표시 규칙으로 처리: AI 메시지가 `cmptnYn=false`이고 다음 사용자 메시지 전에 다른 AI 메시지가 있으면 미완료를 숨기고(새 답변으로 교체된 것), 없으면 미완료 말풍선 + [다시 생성]. 지금 `ConversationMessages.jsx`는 이 규칙이 없어 다시 열면 둘 다 보인다 — 사람 확인 때 같이 보고 추가 요청으로 고칠지 정한다 ② `param` `?cat=`은 명세 부록 A 값이라 서버는 그대로, 프론트 `screenPaths.js`에서 `category`로 바꿔 쓰는 지금 방식 유지
- SCR-AIM-002 AI 서버에 보낸 것, 답 기다림: 의료 고지 두 번 저장·고지 앞 "※" 없음, `scrNm`에 "화면"이 들어가 "~화면 화면으로 이동할게요", 웃음만 보낸 대화 제목이 LLM 설명문(그쪽 승인 절차 뒤 알려 주기로 함)
- 팀에 알릴 것(SCR-AIM-002, PR 전): "`api/axios.js`에 AI 스트리밍용 `aiStream`을 더했어요. 오류 모양·401 재발급·로그인 이동은 인터셉터와 같고, 이 파일에서만 `fetch`를 써요(eslint 예외 한 줄). 화면 코드는 `fetch`를 직접 쓰지 않아요(`docs/convention/api.md`)"
- SCR-AIM-011 연결 남음: ① (011-08은 2026-10-30 연결, 위 SCR-AIM-011·013 줄) ② 두 번째 이후 메시지·AI 답변 저장은 SCR-AIM-002에서 서버로 옮김. `fakeMessages`는 일정 등록·영수증 가짜만 남았고 SCR-AIM-012·013 연결 때 지운다 ③ FN-AIM-011-03·17 세션 만료 시 창 닫기(SCR-COM-003 003-10과 함께). 서버가 대화 갱신 시각을 주면 `lastActive`(이어 쓴 대화 목록 순서)를 그 값으로 바꾼다
- 팀에 알릴 것(SCR-AIM-011, PR 전): "AI 서버 요청은 `api/axios.js`의 `aiApi`(같은 오리진 `/ai`)로 보내요. `VITE_AI_API_URL`·`withCredentials`는 쓰지 않고(`docs/convention/api.md`), 오류 모양·401 재발급은 `api`와 같은 인터셉터를 써요. 재발급은 항상 `/api/auth/refresh`예요. `scripts/check-axios-errors.mjs`가 `@/` 별칭 때문에 돌지 않던 것을 고쳤으니 인터셉터를 고치면 `node scripts/check-axios-errors.mjs`를 돌려 주세요"
- ai-e6·백엔드 세션에 알릴 것: 공용 DB를 쓰는 백엔드에서 `POST /ai/conversations`가 502 `EXTERNAL_API_ERROR`를 낸 적이 있다(방과 메시지는 저장됨). ai 저장소 `app/core/backend.py`의 `TIMEOUT_SEC = 3.0`보다 Java 응답이 느린 것으로 보인다. 이때 화면은 "메시지를 보내지 못했어요"를 띄운다(새로고침하면 대화는 목록에 있음)

- 사람이 할 일(SCR-COM-003): 디스코드로 알린다: "로그인이 필요한 화면(user 레이아웃의 mypage·health·settings·community·support·main)이 이제 `ProtectedRoute`로 감싸져 로그인 없이는 열리지 않아요. 로그아웃 상태로 들어가면 스켈레톤 뒤 `/login?redirect=`로 가고, 회원이 `/admin`에 가면 `/main`으로 가요. 화면을 만들 때 백엔드를 띄우고 로그인해야 해요. `api/axios.js`는 401이면 랜딩이 아니라 로그인으로 보내고(`/login`에서는 이동 안 함), 로그인 화면 보조 요청(`getLoginStatus`·`getCaptcha`)에 `skipAuthRedirect`를 붙였어요" ③ YAY에 알린다: 로그인 화면 `features/member/api.js`·`login/useEmailLogin.js`를 이 PR에서 고쳤다(이메일 입력 중에는 비밀번호·보안코드를 유지하고 칸을 벗어날 때 `checkedEmail`과 다르면 비우고 새 보안코드). `getRoleHome`(`routes/redirect.js`)은 003-08(로그인 상태로 랜딩에 오면 메인으로)에서 쓰면 된다
- SCR-COM-003 연결 남음: `ai`·`chat`·`place`·`main`(bare 랜딩 제외)도 로그인 필요라면 `AppRoutes.jsx`에 `pick('bare', 'member')`를 `ProtectedRoute` 아래에 더해야 한다. `ai`·`chat`은 세션 만료 때 창 닫기(003-10)와 함께 정한다. 배포 때 nginx에서 로그인 쿠키가 없으면 `/login`으로 보내는 방법은 배포 담당과 이야기해 볼 수 있다(`ProtectedRoute` 확인은 그대로 필요). 로그아웃 상태에서 `/auth/me`가 두 번 나가는 것(`main.jsx` 미리 요청 + `useMe`)은 동작에 영향 없음
- 백엔드 세션(`backend-a8`)이 이 세션 요청을 처리함(로컬 커밋, push 전): 알림 목록 정렬을 안 읽음 우선으로(COM-004-05), 시드 알림·미션 경로를 프론트 라우트로 고침. 사람이 할 일: ① DMS 명세 FN-COM-004-05 문구를 새 버전으로 올린다 — 제안 문구 "안 읽은 알림을 먼저, 같은 읽음 상태끼리는 최신순으로 최대 5건 노출한다." ② 미션 이동 경로(`/health/calendar`로 맞춘 시드)는 SJM이 미션 기획대로 확정 ③ 공용 DB의 기존 알림 행은 팀원이 마이그레이션 UPDATE로 고친다
- 디스코드로 알릴 것(백엔드 세션이 적용할 때): 공용 DB 요청이 1초씩 걸린 원인은 DB 왕복 횟수. 백엔드가 JDBC URL 옵션 5개로 약 0.3초까지 줄였고, `application.properties`는 git에 없어 팀원이 직접 URL을 바꿔야 한다
- 알림 화면 로딩 표시 확인: 알림 패널(5행)·프로필 드롭다운·전체 메뉴(NavDrawer) 스켈레톤을 넣었다. `ProtectedRoute`의 `return null`(로그인 확인 전 화면이 통째로 빈다)은 이번에 안 건드렸다 — 헤더·푸터를 먼저 그릴지 결정 대기(공용 파일, `docs/convention/shared-files.md`)
- 디스코드로 알릴 것(공용 `src/api/axios.js`, 팀에 알리지 않고 고침 — 사용자 결정 10-26): "`api/axios.js`가 서버 오류의 `code`·`message`를 읽지 못해 모든 API 오류가 '일시적인 오류가 발생했어요.'로 나오던 것을 고쳤어요. 이제 `error.code`·`error.message`가 서버 값 그대로고, 입력값 오류(`INVALID_INPUT_VALUE`)는 `error.fields`에 `[{ field, message }]`가 와요. 재발급은 401 `TOKEN_EXPIRED`일 때만 하고, `UNAUTHORIZED`·403 `MEMBER_INACTIVE`는 바로 로그인 화면(`/login?redirect=`)으로 가요. `SERVER_ERROR`를 기대하고 분기한 곳이 있으면 확인해 주세요. 인터셉터를 고치면 `node scripts/check-axios-errors.mjs`를 돌려 주세요". SJM: `PetFormModal.jsx:294` `error.fields` 입력칸 문구가 이제 처음 동작한다(화면 확인 안 함)
- JAJ에 알릴 것(SCR-AIM-013): `HealthDiaryPage.jsx`에 넣은 입구 2개(`?checkup=manual&recptSn=` 빈 폼, `?recptSn=&petSn=` 결과 확인, 2026-10-30 `petSn` 추가·Java 조회로 바뀜. 결과 확인 모달의 원본 이미지는 아이콘만 보이니 `GET /api/receipts/{recptSn}/image` 연결 여부도 함께)와 쿼리 이름 확인 요청, 결과 확인 모달 입력을 `ReceiptResponse`(`GET /api/receipts/{recptSn}`)로 함께 바꾸자는 제안. PR #93 참고. 메시지 초안은 2026-10-26 세션에서 사용자에게 전달함
- AI 서버 연결 기반(2026-10-25 결정, 사용자 확정): AI 기능(채팅·영수증 OCR·캐릭터 생성·검사결과지 PDF 분석)은 프론트가 Python을 직접 부르고, 나머지와 영수증 save-check·save는 Spring. 주소는 같은 오리진 경로 접두사로 나눈다 — 배포 nginx `/api/` → Spring(:8080), `/ai/` → Python(:8000), 둘 다 접두사를 자르지 않는다(`proxy_pass` 끝 슬래시 없음). 개발은 `vite.config.js` 프록시 `'^/ai/'`(커밋 `5c35ea3`. `/ai` 단독은 화면 URL `PATHS.AI`라 제외). 백엔드·AI 세션에 `/ai` 접두사 요구 전달함
  - nginx에서 Python `/internal/v1/...`·`/health`는 내보내지 않는다(`location /ai/`만)
  - 2026-10-26 정정(사용자 결정, AI·백엔드 세션 통보): DB는 Java만 다루고 Python은 상태 없는 AI 서버. 영수증 OCR(`POST /api/receipts`, `/api/receipts/{recptSn}/analyze`·`/cancel`)·캐릭터 생성(`POST /api/pets/{petSn}/pixel-characters`)·채팅 영수증 분석(SCR-AIM-013, 백엔드 확인 중)은 Spring 경유, Python 직접은 AI 채팅(`/ai/conversations…`, 스트리밍)만. Vite·nginx `/ai/` 프록시는 그대로. PDF 분석 위치도 Spring 경유로 바뀔 가능성(미확정)
  - 2026-10-29 정정(사용자 결정, ai-23 안내): 검진 영수증 OCR(SCR-AIM-008)은 Python 직접 `POST /ai/receipts`(multipart, 응답 `{ recptSn, ocr }`, 계약은 ai 저장소 `docs/api/ocr.md`). 저장 전 확인·저장은 Java(아직 없음)
  - 연결 작업 때 고칠 것(사용자 결정 10-26): `features/ai/api.js` `analyzeChatReceipt` 머리 주석 "경로 미정, Python AI 서버 `/ai/` 아래" → Spring `/api/receipts` 경유. 검진 영수증(`ai/api.js` `recognizeCheckupReceipt` "POST /receipts/recognize/checkup 추정")·가계부 영수증(`expense/api.js` "POST /receipts/recognize")·캐릭터 생성(`pet/api.js` "POST /pets/{petSn}/character")의 추정 경로도 위 Spring 경로와 맞춘다
  - AI 세션·백엔드 세션 답장 보냄(10-26): 경로 변경 영향 작음(가짜뿐), SSE 미착수, `/ai/` 인증 오류(401·403 `MEMBER_INACTIVE`·502 `EXTERNAL_API_ERROR`)는 `aiApi`에 같은 인터셉터를 붙여 받고 SSE는 `fetch`에서 같은 규칙으로 처리할 예정. 백엔드에 영수증 번호로 인식 결과를 받는 조회 API 요청
- 디스코드로 알릴 것(PR #87 병합됨): "`SubPageLayout`을 쓰는 섹션 화면(건강기록·커뮤니티·고객센터·마이페이지)의 앱(≤760) 위 8px·아래 126px 여백을 뺐어요. 헤더~경로 24px, 콘텐츠 끝~탭바는 main 여백만 남아요. 화면 안에서 아래 여백을 따로 기대던 곳이 있으면 확인해 주세요"
- SJM에 전달: 마이페이지 화면설계서 v0.6 ⑦ "상단 여백 약 40 → 20px"와 달리 구현은 섹션 화면 공통 24px로 정했다(마이페이지만 다르게 두지 않음). 설계서 문구를 고쳐 달라고 한다. 같은 ⑦의 "하단 여백 축소"는 PR #87로 반영
- 결정 대기(사람): 페이지 머리 구조. v5 시안(`nyangmung-com.css` COM-5 "별도 브레드크럼은 쓰지 않아요 (10-12)")과 마이페이지 시안은 첫 줄이 섹션 이름("마이페이지")이고, 구현(`SubPageHead`)은 경로 줄(홈 / 섹션 / 메뉴)이다. 시안 구조로 바꿀지(27개 화면 영향) 그대로 둘지 정한다. 공통레이아웃 화면설계서 v0.8은 "브레드크럼 사용"으로 올라가 있다
- 백엔드 세션에서: EXPND 사용처 컬럼(varchar(80) NULL, 기준 컬럼은 `CKUP_RCD.HSPTL_NM`, 기존 `DTL_MTTR`과 역할 정리), 초대받은 사람(연동 전)의 PetFace(`GET /pets/{petSn}/character-image`는 `PetAuthorizer`라 막힘), 초대 일부 수락 API(지금은 일괄 수락만), 알림 `mvmnPath`의 초대 식별자 이름(`invitationToken` vs `jntBrupInvtnSn`, 미정)
- YAY에 알릴 것: 로그인 → [회원가입] 이동(`pages/auth/LoginPage.jsx` `navigate(PATHS.SIGNUP)`)과 가입 완료 → 로그인(`SignupPage.jsx` `/login?joined=1`)에서 `?redirect=`가 사라진다. 공통레이아웃 명세 v0.6 FN-COM-003-02·05로 유지가 정해짐(초대 링크로 온 미가입자)
- 공동양육 알림 이동(SJM이 알림을 만들 때): 초대 수신은 `/mypage/invitations/:invitationToken`, 결과·연동 해제는 `/mypage/pets`. `docs/routes.md` 79행을 정정했고(추가-3) 백엔드 세션에도 전했다

- 서브 화면 경로(SCR-COM-002 B-01) 확인 남음(각 담당 화면, 선택): 761~1100px 폭과 건강기록(JAJ)·마이페이지(SJM)·고객센터(KSJ) 실제 화면에서 경로 줄·섹션 제목 위치를 한 번 본다. 공용 틀(`SubPageHead`·`SubPageLayout`·`SideMenu`)을 고쳤다. 사이드 메뉴 이탈 확인(`onLeave`)이 develop 병합 뒤에도 되는지 글쓰기 화면에서 본다
- SCR-COM-002 PR 전: 아래 디스코드 알림을 보내고, `docs/convention/ui.md` "로딩 표시" 절 변경을 팀과 합의한다. KSJ에 알릴 것: `useNotices`·`useFaqs`·`useInquiries`에 `placeholderData: keepPreviousData`(탭·검색·쪽 이동 때 이전 내용 유지), 390px `/faqs` 카테고리 탭 줄 때문에 가로 스크롤(범위 밖, 다 불러온 뒤)

- 로딩 스켈레톤 확인(각 담당): "불러오는 중이에요" 문구와 `return null` 로딩 분기를 각 페이지의 실제 카드 배치 스켈레톤으로 바꿔 두었다(LJS, SCR-COM-002, 1440·390px에서 높이 ±20% 확인). 화면 배치를 바꾸면 그 페이지 파일 안 `XxxSkeleton`(또는 로딩 분기)도 같이 고친다. 새 화면·새 로딩 분기는 `docs/convention/ui.md` "로딩 표시" 절대로 만든다

  | 컴포넌트 | props | 쓰는 곳 |
  | --- | --- | --- |
  | `@/components/PageSkeleton` | `top`(칩·탭 위 카드, 예: 히어로), `chips`·`tabs`(개수), `children`(카드 배치, 없으면 큰 카드 1장) | 페이지 본문 전체를 대신하는 로딩 |
  | `@/components/SkeletonCard` | `className`(높이·칸, 기본 `h-64`) | 카드 한 장 자리. 대시보드는 실제 그리드에 놓는다(예: `HealthDiaryPage`) |
  | `@/components/Skeleton` | `className`(크기·모양, 예: `h-5 w-40`), `lines`(여러 줄, 마지막 줄 짧게) | 카드가 아닌 작은 요소(검색창·버튼·탭 글자·쪽 번호·구역 제목)나 카드 안 한 구역 |

  ```jsx
  /** 첫 진입: 페이지 파일 안 XxxSkeleton으로 실제 배치 */
  if (isPending) return <XxxListSkeleton />;
  function XxxListSkeleton() {
    return (
      <PageSkeleton>
        <Skeleton className="h-12 w-[300px]" /> {/** 검색 줄 */}
        <SkeletonCard className="h-[754px]" /> {/** 목록 카드 */}
      </PageSkeleton>
    );
  }
  /** 페이지 안 컴포넌트가 따로 조회: 그 카드와 같은 크기 */
  if (isPending) return <SkeletonCard className="h-64" />;
  ```

  - KSJ: `pages/notice/NoticeListPage`·`NoticeDetailPage`, `pages/faq/FaqListPage`, `pages/inquiry/InquiryListPage`(로딩 분기 2곳이 같은 `InquiryListSkeleton`)·`InquiryDetailPage`·`InquiryEditPage`
  - JAJ: `pages/health/HealthSummaryPage`(`SummarySkeleton`)·`HealthDiaryPage`·`CheckupDetailPage`·`CareCalendarPage`(`CalendarSkeleton`, 일정 실패 시 대기 안 함)·`LabInputPage`, `features/health/CareList`·`diary/ReceiptResultStep`·`diary/CheckupListCard`·`diary/ObservationCard`, `features/health/queries.js`(`useDailyRecords`·`useObservations`·`useCheckups`·`useSchedules`에 `keepPreviousData`)
  - SJM: `pages/mypage/PetListPage`, `features/pet/list/FamilySection`·`list/SentInvitations`·`invite/InvitationAccept`
  - 공용(LJS): `components/Pagination`(카드 쪽 번호, 가계부 전체 내역·건강 일지 검진 카드)도 누르면 맨 위로 간다
  - PR 전 디스코드 알림: "페이지를 이동하면 스크롤이 맨 위로 가도록 `UserLayout`·`AdminLayout`에 넣었어요(뒤로가기는 원래 위치로 돌아가요). 쪽 번호(`BoardPagination`·`Pagination`)를 눌러도 맨 위로 가요. 첫 진입에 깜빡이던 '불러오는 중이에요'와 로딩 중 `return null`은 각 페이지의 실제 카드 배치 스켈레톤(`PageSkeleton`·`SkeletonCard`·`Skeleton`)으로 바꿨어요. 위 파일들이 바뀌었으니 화면 배치를 바꾸면 그 페이지의 `XxxSkeleton`도 같이 고쳐 주세요. 규칙은 `docs/convention/ui.md` '로딩 표시' 절, 사용법은 `handoff/LJS.md`에 있어요"

- 게시글 상세(SCR-CMU-004, KSJ): [채팅하기]는 `@/context/chatModal`의 `useChatModal().open({ pstSn })`, 보호자 [채팅 목록 보기]는 `open({ listPstSn })`로 채팅 모달을 연다(SCR-COM-009 채팅 모달 복귀, 2026-10-22). 모달의 [새 창으로 띄우기]가 새 창을 연다
- 사람이 고치는 문서: 백엔드 저장소 `docs/convention/milestone.md` 담당 표에 채팅 화면 LJS 이관 반영(채팅은 다시 모달, 2026-10-22. 명세 FN-COM-009-03 "모달"과 맞다)
- SCR-CMU-005 남은 화면 일(선택): 거래 버튼을 아주 빠르게 두 번 누르면 두 번째 요청이 서버에 가 거절 토스트가 뜬다(`useDealAction`의 `onSettled`가 `invalidateQueries`를 반환하지 않음). 메시지 시각·날짜 구분선은 `msgDt`가 정해지면 `ChatConversation.jsx`에 날짜 구분선 추가
- 공용 페이지 머리·사이드 메뉴 적용: 건강기록·마이페이지·커뮤니티·고객센터가 모두 `@/layouts/SubPageLayout`을 쓴다(건강기록 4개와 고객센터는 2026-10-23에 옮김). 새 화면은 `SubPageLayout`으로 감싼다. 메뉴 이름·순서·그림은 `layouts/subMenus.js`(`SUB_MENUS`)만 고친다. 다 옮겼으니 `/dev/sub-page`(`pages/dev/SubPageDevPage.jsx`)와 `routes/domains/dev/`의 해당 라우트는 지워도 된다(사람이 정함). 사용법:

  | prop | 기본값 | 하는 일 |
  | --- | --- | --- |
  | `section` | (필수) | `SUB_MENUS` 키: `health`·`community`·`mypage`·`support` |
  | `menu` | 현재 경로와 같은 메뉴 | 선택할 사이드 메뉴의 `to`. 경로가 메뉴 아래가 아닌 상세·글쓰기 화면에서 넘긴다 |
  | `title` | 선택 메뉴 이름 | 넘기면 3단계(섹션 › 메뉴 › 제목) |
  | `back` | `title`이 있으면 true | 본문 위 `‹ 목록으로`(선택 메뉴로) |
  | `description` | 없음 | 제목 아래 설명. 없어도 한 줄 높이를 비운다 |
  | `pixel` | true | false면 머리 그림을 끈다 |
  | `onLeave` | 없음 | 경로·목록으로 링크를 누르면 이동 대신 `onLeave(to)` 호출(작성 중 나가기 확인) |
  | `contentClassName` | `min-[1101px]:pt-6` | 본문 위 여백 바꾸기(펫이야기·펫뉴스 `min-[1101px]:pt-0`, 펫돌봄·실종센터 `min-[1101px]:pt-[7px]`) |

  ```jsx
  <SubPageLayout section="health" description="…">…</SubPageLayout>                                        {/** 목록: 건강기록 › 건강 일지, 761~1100px ▾ */}
  <SubPageLayout section="health" menu={PATHS.HEALTH_DIARY} title="검진상세">…</SubPageLayout>              {/** 3단계 + ‹ 목록으로 */}
  <SubPageLayout section="community" menu={PATHS.COMMUNITY} back>…</SubPageLayout>                          {/** 커뮤니티 상세: 커뮤니티 › 펫이야기 + ‹ 목록으로 */}
  ```

- 하네스 확인: 다음 화면 작업 PR의 `/end`에서 처음으로 `pr-assets` 릴리스를 만들고(사람 확인 후) 캡처 업로드·Screenshots 표 채우기가 되는지 본다. 검증 루프가 `.claude/skills/`도 기준 파일로 잠가 하네스 작업은 실패 뒤 고칠 수 없다(이번엔 사람이 clear). 하네스 작업이면 예외를 둘지 팀과 정한다

- KSJ 확인: 펫이야기 작성·수정 URL을 `/community/posts/new`·`/community/posts/:pstSn/edit`로 해석해 `paths.js`에 넣음
- 범위 밖 1px 경계(말만, 각 담당): `layouts/SideMenu.jsx`·`SubPageLayout`·`SubPageHead`(`min-[1101px]`·`max-[1101px]`, 디자인 ≤1100 기준. 헤더는 1100에서 GNB라 정확히 1100px에서 GNB와 `▾`가 같이 보임), `features/pet/list/PetSlide.jsx`(SJM)·`pages/health/CareCalendarPage.jsx`(JAJ)의 `min-[1101px]`·`min-[761px]`
- 선택: Figma MCP 한도가 풀리면 헤더 아이콘 원본 SVG(317:2097·317:2106·317:2087)와 비교해 바꾸고, 색을 바꿀 일이 생기면 `currentColor` 인라인 SVG로. AI 대화창 모바일·바텀 네비는 시안 없이 만들었으니 디자인 담당과 맞춘다
- SCR-AIM-006 연결 남음(가짜로 끝남): 006-01~08·10·15~18·20 사전 알림 배치(LJS 백엔드) — 매일 09:00 KST 스캔으로 케어 캘린더 병원 일정 D-N 대상 추출, 연동 양육자 전원(탈퇴 제외)별 설정(채널·D-0/1/3/7·케어 일정 유형) 적용, 이메일(가입 주소, 제목 `[냥멍케어] {반려동물명}의 {검진유형} 일정이 {D-N} 남았어요`, 당일은 "오늘이에요")·인앱(`CARE_SCHDL`, `mvmnPath` `/health/calendar`) 생성, 이력·10분 간격 3회 재시도·(회원+일정+일정일+시점+채널) 중복 방지. 메일 [케어 캘린더에서 확인하기]는 `/health/calendar`, 수신 해제는 `/settings/notifications`. 006-09·11·12 프론트는 알림 목록·미확인 수 API(LJS 백엔드)로 가짜를 바꿀 때 같이(SCR-COM-004 연결). 006-13 메일 링크 미인증 복귀는 로그인 연결 때 `ProtectedRoute`·`getRedirectPath`(YAY). 배지 1분 polling은 KSJ 채팅 안 읽은 수 방식이 정해지면 맞춘다
- SCR-AIM-010 연결 남음(가짜로 끝남): 검진기록 등록·수정 모달(SCR-HLT-002, JAJ)이 `ReceiptUploadModal`의 `onManualInput({ rcptSn? })`으로 빈 폼을 연다. `rcptSn`이 있으면 저장 때 영수증 상태를 인식실패→저장완료로 바꾸는 일은 LJS 백엔드·JAJ 저장 API와 맞춘다(명세 10-06 [확인 필요]). 영수증 인식 결과 확인 모달(SCR-HLT-002, JAJ)은 `onRecognized(result)`를 받는다. 부분 인식은 `ckupYmd`·`ckupAmt`가 `null`일 수 있다
- 사람이 고치는 문서(SCR-AIM-010 추가 요청): 기능명세서 v0.7 FN-AIM-010-03 [다시 촬영]→[다시 올리기], FN-AIM-010-07 문구 2종 "다시 촬영하거나"→"다시 올리거나". 화면설계서 v0.9 SCR-AIM-010 ② 라벨과 같은 문구도 같이
- 반려동물 구역 없는 영수증·서버 400·409·504는 검증 때 응답을 가로채서만 확인했다. 실제 구역 없는 영수증이 생기면 건강 일지 [영수증으로 등록하기]로 고른 반려동물 탭 하나로 시작하는지 본다. 구역 없는 영수증의 구역 `dscntAmt`는 하단 할인과 합쳐 비율 배분한다(`getSplitDiscount`, 명세 FN-AIM-009-20 해석)
- 팀에 알릴 것(SCR-AIM-008, PR 전): SJM에게 `receiptFile.js`를 `src/utils/`로 옮겼다고 PR에 적는다. `common.md` "비동기" 절 추가는 팀 합의 문서라 PR에서 알린다
- 선택: `src/utils/formatDate.js`로 바꿀 수 있는 곳 — `ConversationHeader.jsx`의 `formatDate`는 `formatDate(crtDt)`, `features/expense/shared/expenseFormat.js`의 `formatMonthDay`는 `formatDate(expndYmd, { hasYear: false, separator: '-' })`. 이번에 안 건드렸다
- 범위 밖에서 본 것(말만): `ConversationMessages.jsx`의 `{children && <li>…}`가 항상 참이라 대화 목록 끝에 빈 `<li>`가 생긴다
- 사람이 고치는 문서(SCR-COM-002 반응형): FN-COM-002-23 햄버거·002-20 TOP은 기능명세서 v0.5·화면설계서 v0.8(2026-10-25)에 반영됨. 남은 것: FN-COM-006-07 터치 동작의 "반응형 범위 확정 후"를 범위 확정(≤1100px·≤760px)으로, 화면설계서 SCR-COM-006 터치(잠정) 문구
- SCR-COM-002 반응형 남은 것: 실제 대표전화·팩스 번호를 디스코드로 받아 `UserFooter.jsx`의 `TEL_PLACEHOLDER`·`FAX_PLACEHOLDER`에 넣는다. drawer 슬라이드 애니메이션(시안에 있음)·Tab 포커스 가두기는 안 했다. AI 플로팅 버튼의 고양이 이미지(시안 `.fab-ai`, `src/assets/ai-character.png`)는 디자인 담당과 맞춘다
- SCR-COM-008 남은 것: 008-12 캐릭터 완료 알림을 설정 가능하게 할지는 명세 확정 대기(명세 작성자). 알림 설정 API 연결은 끝남
- SCR-COM-004 남은 것: 004-08 공동양육 초대 알림 이동(알림 생성 SJM), 004-09 펫돌봄 알림의 채팅 모달(채팅 API·알림 생성 KSJ, 시드 `mvmnPath`는 `/chats`라 방 번호가 없음), 커뮤니티(`AIMC0010`) 알림 이동 경로(KSJ와 결정, `docs/routes.md` 79행에 없음), 공지 알림이 `/notices` 목록인지 `/notices/{sn}` 상세인지 결정. 시간 표시("10분 전")는 `NotificationSummary.regDt`로 화면에서 계산할 수 있다
- SCR-COM-003 연결 남음: 003-08 로그인 상태로 랜딩에 오면 `/main`으로(`useMe` 필요, 로그인 연결 때, YAY). 003-10 AI 대화창이 401이면 인증 오류 표시 후 창 닫기(SCR-AIM-011). 로그인 화면(ACC-002, YAY)은 성공 뒤 `routes/redirect.js`의 `getRedirectPath(location.search)`로 이동 경로를 정한다(YAY에 알릴 것). 테스트 러너가 없어 이 함수의 회귀 테스트가 없다(러너 추가는 의존성이라 팀 결정)
- SCR-COM-005 연결 남음: 005-02 회원 요약 조회 API(LJS 백엔드)로 `getMemberSummary`를 바꾸고 응답 키(`maskedAcntEml`, 명세 기준)를 Swagger로 확인, 005-07 로그아웃 API(YAY)로 `logout`을 바꾼다(로그인 연결 때)
- 사람이 고치는 문서 (`?cat` → `?category`):
  - AI매니저 기능명세서 v0.7: FN-AIM-004-10, 「부록_라우팅매핑표」 No.2·3·17~20행, 제.개정내역 새 버전 행
  - AI매니저 화면설계서 v0.9: 부록 라우팅 표의 `?cat=hospital`, `?cat=…` 2곳
- SCR-COM-006 문서 불일치(공통레이아웃): 006-03 메뉴별 카드·006-04 커뮤니티 순서는 기능명세서 v0.5·화면설계서 v0.8(2026-10-25)에 반영됨. 남은 것: 건강기록 2차 메뉴명(문서 건강 종합·검진기록관리·건강상태관리 ↔ 구현 종합 건강기록·건강 일지·케어 캘린더)은 JAJ 확인 후, 플레이스 지도 화면의 푸터·플로팅 미노출(002-01·21)과 캐릭터 완료 알림 표기(008-12)도 확인 필요로 남김. Figma 플레이스 프레임은 없음
- 화면설계서 v0.7 SCR-COM-006의 건강기록 첫 화면 ID `SCR-HLT-001`은 결번이다. `SCR-HLT-011`로 고친다(AI매니저 명세 부록 No.43 기준)
- 범위 밖에서 본 것(말만): 공통레이아웃 기능명세서 FN-COM-004-07의 케어 일정 알림 이동 대상(건강상태관리 정기관리)이 AI매니저 FN-AIM-006-13(케어 캘린더 SCR-HLT-003)과 다름
- SCR-COM-006 연결 남음: 006-07 터치 동작 명세 확정(반응형 범위는 ≤1100px·≤760px로 정해졌다. 명세 작성자가 문구를 갱신하면 구현할 내용을 정한다)
- SCR-COM-002 연결 남음: 002-02 `ProtectedRoute`로 감싸기(user 레이아웃은 끝, ai·chat·place·main bare는 위 SCR-COM-003 연결 남음), 002-06 GNB 대상 페이지를 `UserLayout` 아래 라우트로 붙이기(각 담당), 002-09 알림 미확인 수 API(LJS 백엔드), 002-11 채팅 안 읽은 수 조회 위치를 KSJ와 맞추고 연결(KSJ), 002-15 회원 프로필 이미지, 002-24 세션 만료 토스트(SCR-COM-003과 함께)
