# YAY 핸드오프

## 지금 하는 것

SCR-MAN-001 메인페이지 · FN-MAN-008 전체 보기 링크 — 진행 중 (승인 2026-11-06 10:54, 검증 1회차 확인 못 함 있음(연결 남음만), 사람 확인 2026-11-06). 메인 [건강기록 전체 보기]가 `/health?petSn=<선택한 반려동물>`로 간다. HLT-011 시작 탭은 JAJ 연결, FN-MAN-002는 LJS 대화창 부품 대기로 마일스톤은 진행

기준: 메인페이지_기능명세서_v0.10_20261103, 메인페이지_화면설계서_v0.10_20261103 (DMS)
디자인: 없음, 화면설계서 기준 (화면 모양은 바꾸지 않는다)

| 기능 ID | 바꿀 파일 | API | 완료 조건 |
| --- | --- | --- | --- |
| FN-MAN-008 건강기록 전체 보기 이동 | `pages/main/MainPage.jsx`(링크에 `?petSn=<선택한 반려동물>`) | 없음 | `명령:` `yarn -s lint`·`yarn -s build` 0. `화면:` 메인에서 반려동물 탭을 고르고 [건강기록 전체 보기]를 누르면 `/health?petSn=<그 반려동물 번호>`로 간다. 탭을 바꾸면 링크 번호도 바뀐다. 버튼 모양·위치는 그대로. 연결 남음: HLT-011이 `?petSn=`으로 시작 탭을 고르는 것(JAJ `HealthSummaryPage.jsx`) |

이번엔 안 함: FN-MAN-002 AI 검색바 → 확장형 대화창. 대화창(SCR-AIM-001)은 LJS 화면이고 메인에 끼울 부품이 없다. LJS가 부품을 만들면 메인에 조립한다. 지금은 검색바에서 보내면 새 창이 열린다(그대로)

질문:
- FN-MAN-002·008의 남의 영역(LJS 대화창 부품, JAJ HLT-011 시작 탭)을 이 세션에서 고칠까요?
  결정: 고치지 않는다. 메인 링크 한 줄만 하고 나머지는 "다음에 할 것"에 연결로 남긴다 (2026-11-06 10:54)
- 디자인: 결정: 화면설계서 기준(화면 모양 변경 없음)

새 의존성: 없음

SCR-MAN-001 메인페이지 · 위젯 순서·건강 대시보드 API 연결 — 끝남 (승인 2026-11-05 16:07, 검증 통과 2회차(잠금을 버린 뒤, 앞 1회차 실패는 '메인은 공개 URL' 기획 전제가 틀려서), 사람 확인 2026-11-06). 메인은 회원 전용(`auth: 'member'` 그대로). 히어로는 대표 반려동물(`rprsPetYn`) `character-image` 전신 + 캡션, 없거나 실패면 기본 캐릭터. 탭·프로필·요약 3칸은 HLT-011 `SummaryHero`를 그대로(추가-1, `useHealthSummary`), 기준일·지표 5종은 `features/dashboard/IndicatorWidgets.jsx`(`GET /pets/{petSn}/health-indicators`, null이면 "기록이 없어요", `prevDiff` null이면 비교 숨김), 위젯 순서는 [순서 편집](끌어 놓기·앞뒤 버튼) → `PUT /members/me/dashboard-widgets` 7개(MANC0006은 그리드 밖 제자리), MANC0007은 "준비 중" 카드. 토탈 케어리스트는 `features/health/CarePreview.jsx`(읽기 전용 최대 6개). 가짜 `dashboardSample`·`MissionList`·`HealthSummary`와 안 쓰는 `AiReportCard`·`PetProfileCard`(추가-2) 지움. 로컬 백엔드에서 `character-image`·`daily-health-records` POST·`care-completions` POST가 500이라 캐릭터 있음·지표 값은 가짜 응답으로 검증했다

### 추가 요청

| 번호 | 바꿀 파일 | 완료 조건 | 요청 |
| --- | --- | --- | --- |
| 추가-3 | `features/health/CarePreview.jsx` | `명령:` `yarn -s lint`·`yarn -s build` 0. `화면:` 메인 토탈 케어리스트 항목이 1개여도 줄을 꽉 채우지 않고 한 칸 크기(PC 6칸 중 1칸), 폭을 줄이면 1100px 이하 3칸·700px 이하 2칸으로 바뀐다. 6개면 전처럼 한 줄 | 요청 2026-11-06 10:16 "한개일 때 꽉 차지 말고 기본 크기, 화면을 줄이거나 늘릴 때만 반응형" |

SCR-ACC-020 회원탈퇴 + 탈퇴 API 연결 — 끝남 (승인 2026-11-05 14:48, 검증 2회차 확인 못 함 있음(연결 남음만, 1회차 실패는 로그인 가능한 로컬 계정이 없어서), 사람 확인 2026-11-05). 안내·문구 모달·실패/확인 중은 `/mypage/withdraw`(`pages/mypage/WithdrawPage.jsx`가 `usePets`와 `features/member/withdraw/`를 조립), 완료는 공개 URL `/withdraw/complete`(`PATHS.WITHDRAW_COMPLETE`, 로그인 캐시는 완료 화면이 비움, 바로 열면 랜딩). `withdrawMember`는 문구를 trim 없이 보내고 timeout 15초(끊기면 `NETWORK_ERROR` → 확인 중, [결과 확인]은 `getMe`만 부름). 마이페이지 [회원 탈퇴](SJM 버튼)와 AI `screenPaths.js`에 연결. 검증이 로컬 확인용 회원 mbrSn 211·212를 탈퇴시켰다(개발용 토큰 `POST /api/auth/dev-tokens`로 로그인)

문서 정리 · 인증 이동 규칙을 지금 코드에 맞춤 — 진행 중 (승인 2026-10-27 16:29, 검증 통과, 사람 확인 남음, 커밋 3b31971). `docs/convention/api.md`·`docs/convention/pages.md`·`AGENTS.md` 2번. 결정: `skipAuthRedirect`는 원칙으로, AGENTS.md 2번 단서 삭제

두 화면은 PR #61(`YAY` → `develop`)로 올렸다. 기준: 로그인·회원가입_화면설계서_v0.10_20260930, 디자인: 시안 폴더(저장소 밖) `nmcare-design-v5`의 `acc.css`·`acc.js`. 가짜 규칙: 비밀번호 `wrong`은 불일치(5번 실패하면 보안코드), 인증번호 `123456` 일반·`234567` SNS 전용·`345678` 미가입·`456789` 탈퇴, 이메일 `fail@example.com`은 발송 실패, 새 비밀번호에 `fail`이 있으면 저장 실패. 로그인과 인증 화면이 같이 쓰는 컴포넌트는 `features/member/shared/Auth*.jsx`

## 다음에 할 것

- PR Breaking Changes(SCR-MAN-001): `features/pet/PetProfileCard.jsx`(SJM) 삭제, 메인이 HLT-011 `SummaryHero`(JAJ)를 그대로 씀(메인에서 `useHealthSummary` 호출), `features/health/CarePreview.jsx` 새 파일(JAJ 도메인). JAJ·SJM에게 알린다
- 팀 알림: 로컬 백엔드 500 — `GET /pets/{petSn}/character-image`(LJS), `POST /pets/{petSn}/daily-health-records`·`POST /pets/{petSn}/care-completions`(JAJ). 실제 기록·캐릭터로 메인 지표·히어로를 다시 본다
- 연결 남음: FN-MAN-008 (HLT-011 `HealthSummaryPage.jsx`가 `?petSn=`으로 시작 탭을 고른다, JAJ). 메인 링크는 이미 `/health?petSn=<번호>`. JAJ에게 요청한다
- 메인 남은 것: FN-MAN-002 AI 확장형 대화창(메인에 끼울 SCR-AIM-001 대화창 부품, LJS에게 요청. 받으면 `HeroAsk` 아래에 조립), MANC0007 AI 건강분석 리포트(명세 미결)
- 연결 남음: FN-AIM-011-19 (AI 서버 `data/routing.yaml`에 SCR-ACC-020 행, AI 담당). 프론트 `screenPaths.js` 줄은 넣음
- PR Breaking Changes(SCR-ACC-020): 새 공개 URL `/withdraw/complete`(`PATHS.WITHDRAW_COMPLETE`, `docs/routes.md`), SJM `ProfileEditPage.jsx` [회원 탈퇴] 이동 연결, LJS `screenPaths.js`에 `SCR-ACC-020` 행
- SNS 배포 연결(팀): 배포 도메인의 `/login/sns/{naver|kakao|google}/callback`을 제공자 콘솔·배포 백엔드 `app.sns.*.redirect-uri`에 등록, 배포 프론트 환경에 `VITE_*` 앱 ID 3개. 카카오는 전화번호 동의항목 권한 신청 전이라 번호를 주지 않는다(직접 입력으로 감)
- 팀 알림: 새 URL `/login/sns/:provider/callback`(`paths.js` `SNS_CALLBACK`)을 PR Breaking Changes에 적고 팀에 알린다
- 코드 후보: SNS 가입 확인 화면에서 새로고침하면 history state가 남아 SNS 가입 확인이 그대로 나온다(`SignupPage.jsx` 주석 "새로고침으로 state가 없으면 이메일 가입"과 다름). SCR-ACC-002 SNS 검증 메모
- 코드 후보: 390 폭에서 SNS 가입 확인의 "가입 계정 확인" 라벨이 두 줄로 꺾이고 이메일이 말줄임된다(`SnsSignupForm.jsx` 라벨 `shrink-0`)
- PR Breaking Changes(SNS): `.env.example`에 `VITE_NAVER_CLIENT_ID`·`VITE_KAKAO_REST_KEY`·`VITE_GOOGLE_CLIENT_ID` 추가, `TermsStep.jsx`에서 `TermsChecklist`·`SignupForm.jsx`에서 `SignupComplete`를 떼어 냄

- 문서 정리(인증 이동 규칙) 사람 확인 남음: `docs/convention/api.md` 48~61줄, `docs/convention/pages.md` 22~23줄, `AGENTS.md` 2번을 읽고 확인한 뒤 `/end`. develop의 바뀐 `src/api/axios.js`를 병합한 뒤 문서가 다시 어긋나지 않는지 본다. PR Breaking Changes에 AGENTS.md 변경을 적고 LJS에게 알린다
- 코드 후보: `src/features/member/api.js` 92줄 주석 "랜딩 이동을 끈다"가 지금 동작(로그인 화면 이동)과 다르다
- 연결 남음: (기반) 메인·마이페이지 라우트 `auth: 'member'` 전환 (팀과 정한 뒤, 각 라우트 담당)
- 백엔드: `DevTokenController` 삭제(백엔드 마일스톤 SCR-ACC-002 절에 이미 있음)
- PR Breaking Changes: `api/axios.js` 오류 객체에 `data` 추가(`docs/convention/api.md`), `snsCodes.js` 키를 서버 코드(`USRC0007~0009`)로 변경, 인증 화면 겉틀(`layouts/AuthLayout.jsx`·`AuthSlider.jsx`) 정렬 변경, `components/AiErrorGuide.jsx` 나타남 효과
- 코드 후보: 재전송 제한 알림이 떠 있을 때 인증번호 확인에 실패하면 그 알림이 남는다(검증 메모)
- 코드 후보: 가입을 마치고 [로그인 화면으로] → [회원가입]으로 다시 들어오면 새 가입이 아니라 앞 가입의 완료 화면이 남는다(`useSignup` 상태가 슬라이더 안에 남음, 새로고침하면 처음부터). SCR-ACC-001 검증 메모
