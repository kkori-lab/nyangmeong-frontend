# YAY 핸드오프

## 지금 하는 것

SCR-ACC-002 로그인 (이메일) · 재발급 실패 뒤 원래 요청 재시도 — 구현 중 (승인 2026-11-09 10:30, 검증 통과 1회차, 사람 확인 2026-11-09)

기준: `milestones/YAY.md` 해당 절(명세 기능 ID 추가 없음, `POST /auth/refresh`·로그인 유지). 백엔드 YAY `7ba0860`(develop 머지): access 쿠키는 refresh 수명(24시간)만큼 남고 토큰 만료(30분) 뒤에는 401 `TOKEN_EXPIRED`, 동시 재발급에 진 요청은 401 `UNAUTHORIZED`만 받고 쿠키는 지워지지 않는다
디자인: 해당 없음(화면 변경 없음)

| 항목 | 바꿀 파일 | API | 완료 조건 |
| --- | --- | --- | --- |
| 재발급 실패 뒤 재전송(axios) | `src/api/axios.js` `onRejected`: `TOKEN_EXPIRED`로 재발급을 시도했으면 성공·실패와 상관없이 원래 요청을 보낸 인스턴스로 한 번 다시 보낸다(`_retried`가 이미 true라 다시 보낸 요청이 401이면 재발급 없이 지금처럼 로그인 화면으로 이동). `skipAuthRedirect`·`isRefresh` 처리는 그대로 | `POST /auth/refresh`(내 것, 있음) | `명령:` `yarn -s lint`·`yarn -s build` 0. `화면:` Playwright `page.route`로 로그인한 화면의 요청 하나를 401 `TOKEN_EXPIRED`로, `/api/auth/refresh`를 401 `UNAUTHORIZED`로 한 번씩 바꾸면 원래 요청이 한 번 더 나가고 200이면 화면이 그대로 남는다(로그인 이동 없음). 다시 보낸 요청도 401이면 `/login?redirect=<지금 경로>`로 간다. 재발급이 200이면 지금처럼 재전송 뒤 그대로 진행한다. `/auth/refresh`는 요청 한 번에 한 번만 나간다 |
| 재발급 실패 뒤 재전송(SSE) | `src/api/axios.js` `aiStream`: 재발급 실패여도 `retried=true`로 한 번 다시 부르고, 그것도 401이면 로그인 이동 | `POST /auth/refresh` | `명령:` 위와 같음. `화면:` AI 대화에서 메시지를 보낼 때 위와 같은 route 조작(`/ai/...` 401 `TOKEN_EXPIRED` + refresh 401)에서 다시 보낸 요청이 스트림으로 이어진다 |
| 규칙 문서 | `docs/convention/api.md` 상태 코드 절의 "`/auth/refresh` 자신이 401이면 더 시도하지 않는다"를 "재발급이 실패해도 원래 요청을 한 번 다시 보낸다(다른 탭이 먼저 재발급했을 수 있다). 그것도 401이면 로그인 화면으로"로 고치고, 401 행도 맞춘다 | 없음 | `명령:` 위와 같음. 문서와 `axios.js` 동작이 같다 |

확인 방법 메모: 실제 두 탭 경합은 토큰 만료(30분)를 기다려야 하고 Playwright 탭은 쿠키를 공유해 재현이 어렵다. 그래서 route 조작으로 "재발급 401 + 재전송 200"을 만들어 본다. 실제 30분 경과 두 탭 확인은 사람 확인으로 남긴다

질문: 없음

새 의존성: 없음

문서 정리 · 인증 이동 규칙을 지금 코드에 맞춤 — 진행 중 (승인 2026-10-27 16:29, 검증 통과, 사람 확인 남음, 커밋 3b31971). `docs/convention/api.md`·`docs/convention/pages.md`·`AGENTS.md` 2번. 결정: `skipAuthRedirect`는 원칙으로, AGENTS.md 2번 단서 삭제

두 화면은 PR #61(`YAY` → `develop`)로 올렸다. 기준: 로그인·회원가입_화면설계서_v0.10_20260930, 디자인: 시안 폴더(저장소 밖) `nmcare-design-v5`의 `acc.css`·`acc.js`. 가짜 규칙: 비밀번호 `wrong`은 불일치(5번 실패하면 보안코드), 인증번호 `123456` 일반·`234567` SNS 전용·`345678` 미가입·`456789` 탈퇴, 이메일 `fail@example.com`은 발송 실패, 새 비밀번호에 `fail`이 있으면 저장 실패. 로그인과 인증 화면이 같이 쓰는 컴포넌트는 `features/member/shared/Auth*.jsx`

## 다음에 할 것

- 로컬 계정: `yay315@naver.com`이 검증 중 로그인 실패 7회로 보안코드 상태다. 문서의 비밀번호로도 실패해 비밀번호가 바뀌었는지 확인하고 맞는 비밀번호로 한 번 로그인해 푼다
- 팀 알림: `docs/routes.md` 29줄 MAN-001 담당이 아직 YAY다. 담당 표(2026-11-08)대로 LJS로 고치도록 LJS에게 알린다
- 코드 후보: 휴대전화번호에 `---`만 적으면 [중복확인]이 켜지고 누르면 "휴대전화번호를 입력해 주세요."가 나온다(추가-1 검증 메모, `phone.trim()` 기준)

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
