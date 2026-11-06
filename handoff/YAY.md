# YAY 핸드오프

## 지금 하는 것

SCR-MAN-001 메인페이지 · 위젯 순서·건강 대시보드 API 연결 — 끝남 (승인 2026-11-05 16:07, 검증 통과 2회차(잠금을 버린 뒤, 앞 1회차 실패는 '메인은 공개 URL' 기획 전제가 틀려서), 사람 확인 2026-11-06). 메인은 회원 전용(`auth: 'member'` 그대로). 히어로는 대표 반려동물(`rprsPetYn`) `character-image` 전신 + 캡션, 없거나 실패면 기본 캐릭터. 탭·프로필·요약 3칸은 HLT-011 `SummaryHero`를 그대로(추가-1, `useHealthSummary`), 기준일·지표 5종은 `features/dashboard/IndicatorWidgets.jsx`(`GET /pets/{petSn}/health-indicators`, null이면 "기록이 없어요", `prevDiff` null이면 비교 숨김), 위젯 순서는 [순서 편집](끌어 놓기·앞뒤 버튼) → `PUT /members/me/dashboard-widgets` 7개(MANC0006은 그리드 밖 제자리), MANC0007은 "준비 중" 카드. 토탈 케어리스트는 `features/health/CarePreview.jsx`(읽기 전용 최대 6개). 가짜 `dashboardSample`·`MissionList`·`HealthSummary`와 안 쓰는 `AiReportCard`·`PetProfileCard`(추가-2) 지움. 로컬 백엔드에서 `character-image`·`daily-health-records` POST·`care-completions` POST가 500이라 캐릭터 있음·지표 값은 가짜 응답으로 검증했다

SCR-ACC-020 회원탈퇴 + 탈퇴 API 연결 — 끝남 (승인 2026-11-05 14:48, 검증 2회차 확인 못 함 있음(연결 남음만, 1회차 실패는 로그인 가능한 로컬 계정이 없어서), 사람 확인 2026-11-05). 안내·문구 모달·실패/확인 중은 `/mypage/withdraw`(`pages/mypage/WithdrawPage.jsx`가 `usePets`와 `features/member/withdraw/`를 조립), 완료는 공개 URL `/withdraw/complete`(`PATHS.WITHDRAW_COMPLETE`, 로그인 캐시는 완료 화면이 비움, 바로 열면 랜딩). `withdrawMember`는 문구를 trim 없이 보내고 timeout 15초(끊기면 `NETWORK_ERROR` → 확인 중, [결과 확인]은 `getMe`만 부름). 마이페이지 [회원 탈퇴](SJM 버튼)와 AI `screenPaths.js`에 연결. 검증이 로컬 확인용 회원 mbrSn 211·212를 탈퇴시켰다(개발용 토큰 `POST /api/auth/dev-tokens`로 로그인)

SCR-ACC-012 비밀번호 재설정 · 재설정 API 연결 — 끝남 (승인 2026-11-05 10:30, 검증 통과(잠금을 버린 뒤 1회차, 앞의 2회 실패는 로컬 백엔드가 SMTP라 인증번호를 못 읽어서), 사람 확인 2026-11-05). `resetPassword`가 `POST /email-certifications/{emlCertSn}/password-reset`을 부른다. 비밀번호 찾기가 라우터 state로 `{ emlCertSn, pswdInitTkn, initAuthrtExpryDt, certTrgtEml }`을 넘긴다. 400 `PASSWORD_RESET_NOT_AVAILABLE`은 만료 화면, `PASSWORD_MISMATCH`·`INVALID_INPUT_VALUE`는 칸 오류, 그 밖은 공통 알림. [취소]는 `invalidate` 뒤 결과와 상관없이 `/login`. 추가-1: 이메일 로그인 폼의 [회원가입]이 "준비 중" 토스트 대신 `/signup`으로 간다. 로컬 백엔드가 실제 메일(SMTP)을 보내면 인증번호를 로그로 읽을 수 없어, 받을 수 있는 메일 계정으로 사람이 번호를 넘겨 확인했다

SCR-ACC-002 SNS 로그인 · 제공자별 콜백 주소 — 끝남 (승인 2026-11-05 09:49, 검증 통과 1회차, 사람 확인 2026-11-05: 구글·카카오 실제 계정으로 SNS 가입 확인 화면까지). 콜백은 `/login/sns/:provider/callback`(`PATHS.SNS_CALLBACK`, `docs/routes.md` ACC-002 줄)이 받고 처리 뒤 `/login`(+`?redirect=`)으로 replace. 백엔드 `app.sns.*.redirect-uri`·제공자 콘솔이 이 주소다. 앞의 "콜백은 `/login`" 결정을 바꿨다

SCR-ACC-002 SNS 로그인 · SNS 로그인·가입 API 연결 — 끝남 (승인 2026-11-04 17:06, 검증 통과 2회차(1회차는 로컬 백엔드가 real 모드라 확인 못 함), 사람 확인 2026-11-04). 콜백은 새 URL 없이 `/login`이 받는다(`features/member/login/snsAuth.js`·`useSnsCallback.js`). state·제공자·`redirect`는 sessionStorage `snsLoginRequest`. 앱 ID(`VITE_NAVER_CLIENT_ID`·`VITE_KAKAO_REST_KEY`·`VITE_GOOGLE_CLIENT_ID`)가 비면 개발 서버에서 이름을 받아 `fake-이름`으로 돌아온다(백엔드 `app.sns.client=fake`). SNS 가입 확인은 `features/member/signup/SnsSignupForm.jsx`·`useSnsSignup.js`(router state `snsSignup`). `TermsChecklist`·`SignupComplete`를 떼어 이메일 가입과 같이 쓴다. 확인용 로컬 SNS 회원 `verifysnsk1104@example.com`(카카오)·`verifysnsg1104@example.com`(구글)이 로컬 DB에 남아 있다

코드 정리 · 약관 체크박스 합치기 — 끝남 (승인 2026-11-04 16:48, 검증 통과 1회차(확인 못 함 없음, 연결 남음 없음), 사람 확인 2026-11-04). `features/member/signup/TermsStep.jsx`의 지역 `CheckBox`를 지우고 `features/member/shared/AuthCheckBox.jsx`를 쓴다. 모양·동작은 그대로(체크 색은 `brand-500` 진녹색, 기획 문구의 '주황'은 틀림)

SCR-HOS-001 플레이스 · FN-HOS-001-33 로그인 필수 접근 — 끝남 (승인 2026-11-04 16:10, 검증 통과 1회차(확인 못 함 없음, 연결 남음 없음), 사람 확인 2026-11-04). `routes/AppRoutes.jsx`의 `<ProtectedRoute />` 묶음에 `pick('bare', 'member')`를 더하고 `placeRoutes.js`를 `auth: 'member'`로 바꿨다. `PlaceLayout`은 헤더 있음·푸터 없음(기획 문구의 '헤더 없음'은 틀림). 확인용 로컬 계정 `verify1104place@example.com`이 로컬 DB에 남아 있다

문서 정리 · 인증 이동 규칙을 지금 코드에 맞춤 — 진행 중 (승인 2026-10-27 16:29, 검증 통과, 사람 확인 남음, 커밋 3b31971). `docs/convention/api.md`·`docs/convention/pages.md`·`AGENTS.md` 2번. 결정: `skipAuthRedirect`는 원칙으로, AGENTS.md 2번 단서 삭제

두 화면은 PR #61(`YAY` → `develop`)로 올렸다. 기준: 로그인·회원가입_화면설계서_v0.10_20260930, 디자인: 시안 폴더(저장소 밖) `nmcare-design-v5`의 `acc.css`·`acc.js`. 가짜 규칙: 비밀번호 `wrong`은 불일치(5번 실패하면 보안코드), 인증번호 `123456` 일반·`234567` SNS 전용·`345678` 미가입·`456789` 탈퇴, 이메일 `fail@example.com`은 발송 실패, 새 비밀번호에 `fail`이 있으면 저장 실패. 로그인과 인증 화면이 같이 쓰는 컴포넌트는 `features/member/shared/Auth*.jsx`

## 다음에 할 것

- PR Breaking Changes(SCR-MAN-001): `features/pet/PetProfileCard.jsx`(SJM) 삭제, 메인이 HLT-011 `SummaryHero`(JAJ)를 그대로 씀(메인에서 `useHealthSummary` 호출), `features/health/CarePreview.jsx` 새 파일(JAJ 도메인). JAJ·SJM에게 알린다
- 팀 알림: 로컬 백엔드 500 — `GET /pets/{petSn}/character-image`(LJS), `POST /pets/{petSn}/daily-health-records`·`POST /pets/{petSn}/care-completions`(JAJ). 실제 기록·캐릭터로 메인 지표·히어로를 다시 본다
- 메인 남은 것: FN-MAN-002 AI 대화창, FN-MAN-008 전체 보기 반려동물 유지(`SCR-MAN-001 메인페이지` 절), MANC0007 AI 건강분석 리포트(명세 미결)
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
