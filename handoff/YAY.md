# YAY 핸드오프

## 지금 하는 것

SCR-ACC-002 SNS 로그인 · SNS 로그인·가입 API 연결 — 끝남 (승인 2026-11-04 17:06, 검증 통과 2회차(1회차는 로컬 백엔드가 real 모드라 확인 못 함), 사람 확인 2026-11-04). 콜백은 새 URL 없이 `/login`이 받는다(`features/member/login/snsAuth.js`·`useSnsCallback.js`). state·제공자·`redirect`는 sessionStorage `snsLoginRequest`. 앱 ID(`VITE_NAVER_CLIENT_ID`·`VITE_KAKAO_REST_KEY`·`VITE_GOOGLE_CLIENT_ID`)가 비면 개발 서버에서 이름을 받아 `fake-이름`으로 돌아온다(백엔드 `app.sns.client=fake`). SNS 가입 확인은 `features/member/signup/SnsSignupForm.jsx`·`useSnsSignup.js`(router state `snsSignup`). `TermsChecklist`·`SignupComplete`를 떼어 이메일 가입과 같이 쓴다. 확인용 로컬 SNS 회원 `verifysnsk1104@example.com`(카카오)·`verifysnsg1104@example.com`(구글)이 로컬 DB에 남아 있다

코드 정리 · 약관 체크박스 합치기 — 끝남 (승인 2026-11-04 16:48, 검증 통과 1회차(확인 못 함 없음, 연결 남음 없음), 사람 확인 2026-11-04). `features/member/signup/TermsStep.jsx`의 지역 `CheckBox`를 지우고 `features/member/shared/AuthCheckBox.jsx`를 쓴다. 모양·동작은 그대로(체크 색은 `brand-500` 진녹색, 기획 문구의 '주황'은 틀림)

SCR-HOS-001 플레이스 · FN-HOS-001-33 로그인 필수 접근 — 끝남 (승인 2026-11-04 16:10, 검증 통과 1회차(확인 못 함 없음, 연결 남음 없음), 사람 확인 2026-11-04). `routes/AppRoutes.jsx`의 `<ProtectedRoute />` 묶음에 `pick('bare', 'member')`를 더하고 `placeRoutes.js`를 `auth: 'member'`로 바꿨다. `PlaceLayout`은 헤더 있음·푸터 없음(기획 문구의 '헤더 없음'은 틀림). 확인용 로컬 계정 `verify1104place@example.com`이 로컬 DB에 남아 있다

문서 정리 · 인증 이동 규칙을 지금 코드에 맞춤 — 진행 중 (승인 2026-10-27 16:29, 검증 통과, 사람 확인 남음, 커밋 3b31971). `docs/convention/api.md`·`docs/convention/pages.md`·`AGENTS.md` 2번. 결정: `skipAuthRedirect`는 원칙으로, AGENTS.md 2번 단서 삭제

두 화면은 PR #61(`YAY` → `develop`)로 올렸다. 기준: 로그인·회원가입_화면설계서_v0.10_20260930, 디자인: 시안 폴더(저장소 밖) `nmcare-design-v5`의 `acc.css`·`acc.js`. 가짜 규칙: 비밀번호 `wrong`은 불일치(5번 실패하면 보안코드), 인증번호 `123456` 일반·`234567` SNS 전용·`345678` 미가입·`456789` 탈퇴, 이메일 `fail@example.com`은 발송 실패, 새 비밀번호에 `fail`이 있으면 저장 실패. 로그인과 인증 화면이 같이 쓰는 컴포넌트는 `features/member/shared/Auth*.jsx`

## 다음에 할 것

- SNS 실제 앱 키 연결(팀): 제공자 콘솔에 redirect-uri `http://localhost:5173/login`(배포는 그 도메인의 `/login`) 등록, 로컬 백엔드 `app.sns.*.redirect-uri`가 지금 `/login/sns/<제공자>/callback`이라 `/login`으로 맞춘다. 프론트 `.env.local`에 `VITE_*` 앱 ID 3개
- 코드 후보: SNS 가입 확인 화면에서 새로고침하면 history state가 남아 SNS 가입 확인이 그대로 나온다(`SignupPage.jsx` 주석 "새로고침으로 state가 없으면 이메일 가입"과 다름). SCR-ACC-002 SNS 검증 메모
- 코드 후보: 390 폭에서 SNS 가입 확인의 "가입 계정 확인" 라벨이 두 줄로 꺾이고 이메일이 말줄임된다(`SnsSignupForm.jsx` 라벨 `shrink-0`)
- PR Breaking Changes(SNS): `.env.example`에 `VITE_NAVER_CLIENT_ID`·`VITE_KAKAO_REST_KEY`·`VITE_GOOGLE_CLIENT_ID` 추가, `TermsStep.jsx`에서 `TermsChecklist`·`SignupForm.jsx`에서 `SignupComplete`를 떼어 냄

- 문서 정리(인증 이동 규칙) 사람 확인 남음: `docs/convention/api.md` 48~61줄, `docs/convention/pages.md` 22~23줄, `AGENTS.md` 2번을 읽고 확인한 뒤 `/end`. develop의 바뀐 `src/api/axios.js`를 병합한 뒤 문서가 다시 어긋나지 않는지 본다. PR Breaking Changes에 AGENTS.md 변경을 적고 LJS에게 알린다
- 코드 후보: `src/features/member/api.js` 92줄 주석 "랜딩 이동을 끈다"가 지금 동작(로그인 화면 이동)과 다르다
- 연결 남음: (기반) 메인·마이페이지 라우트 `auth: 'member'` 전환 (팀과 정한 뒤, 각 라우트 담당)
- 백엔드: `DevTokenController` 삭제(백엔드 마일스톤 SCR-ACC-002 절에 이미 있음)
- SCR-ACC-012 연결 남음: 백엔드 SCR-ACC-012가 끝나면 가짜 `resetPassword`를 `POST /email-certifications/{emlCertSn}/password-reset`(`pswdInitTkn`·`pswd`·`pswdCnfrm`, 라우터 state로 넘겨받은 값)으로 바꾸고, 재설정 취소 때 `invalidate`(FN-ACC-012-04)를 부른다
- PR Breaking Changes: `api/axios.js` 오류 객체에 `data` 추가(`docs/convention/api.md`), `snsCodes.js` 키를 서버 코드(`USRC0007~0009`)로 변경, 인증 화면 겉틀(`layouts/AuthLayout.jsx`·`AuthSlider.jsx`) 정렬 변경, `components/AiErrorGuide.jsx` 나타남 효과
- 코드 후보: 재전송 제한 알림이 떠 있을 때 인증번호 확인에 실패하면 그 알림이 남는다(검증 메모)
- 코드 후보: 가입을 마치고 [로그인 화면으로] → [회원가입]으로 다시 들어오면 새 가입이 아니라 앞 가입의 완료 화면이 남는다(`useSignup` 상태가 슬라이더 안에 남음, 새로고침하면 처음부터). SCR-ACC-001 검증 메모
