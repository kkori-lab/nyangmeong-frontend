# YAY 핸드오프

## 지금 하는 것

SCR-ACC-001 회원가입 (이메일) · 메일 발송 실패(502) 안내 — 끝남 (승인 2026-11-09 13:55, 검증 통과 1회차, 사람 확인 2026-11-09). 가입 인증번호 발송이 502 `MAIL_SEND_FAILED`면 서버 문구를 공통 알림으로 보이고 재전송 대기를 시작하지 않는다. 비밀번호 찾기·재가입 복구는 이미 같아 코드 변경 없음

문서 정리 · 인증 이동 규칙을 지금 코드에 맞춤 — 진행 중 (승인 2026-10-27 16:29, 검증 통과, 사람 확인 남음, 커밋 3b31971). `docs/convention/api.md`·`docs/convention/pages.md`·`AGENTS.md` 2번. 결정: `skipAuthRedirect`는 원칙으로, AGENTS.md 2번 단서 삭제

두 화면은 PR #61(`YAY` → `develop`)로 올렸다. 기준: 로그인·회원가입_화면설계서_v0.10_20260930, 디자인: 시안 폴더(저장소 밖) `nmcare-design-v5`의 `acc.css`·`acc.js`. 가짜 규칙: 비밀번호 `wrong`은 불일치(5번 실패하면 보안코드), 인증번호 `123456` 일반·`234567` SNS 전용·`345678` 미가입·`456789` 탈퇴, 이메일 `fail@example.com`은 발송 실패, 새 비밀번호에 `fail`이 있으면 저장 실패. 로그인과 인증 화면이 같이 쓰는 컴포넌트는 `features/member/shared/Auth*.jsx`

## 다음에 할 것

- PR Breaking Changes(SCR-ACC-012 문구 정리): 공통 `features/member/shared/AuthField.jsx`가 `hasGuide`면 칸 아래 오류를 숨기고 AI 말풍선만 보인다(로그인·가입·복구·비밀번호 찾기·재설정 칸 오류 모두)
- 팀 알림: SJM `features/member/profile/PasswordChangeCard.jsx` 10줄 `PW_RULE` 끝에 마침표가 없다(가입·재설정은 마침표 있음)
- 팀 알림(문구 정리): 화면설계서 담당에게 설계서와 달라진 로그인·회원가입 문구 목록을 보낸다(PR 본문 Design Decisions와 같은 목록). PR Breaking Changes: `AuthNotice`에 `hasGuide`를 주면 색 상자 없이 AI 말풍선만 보인다
- 코드 후보: 로그인 방법 선택에서 [이메일로 로그인하기]를 누르고 0.8초 안에 입력하면 폼이 왼쪽으로 약 50px 밀린 채 남은 적이 있다(문구 정리 검증 메모, 슬라이더)
- 로컬 환경: 로컬 백엔드(8080)가 공개 POST(`/api/email-certifications`·`/api/auth/login`)를 모두 403 `FORBIDDEN`으로 거절한다(2026-11-09 14:01, 쿠키 없이도 같음). 백엔드 코드는 그 경로를 열어 두었으니 백엔드를 로그 파일로 남기며 다시 띄우고 SMTP 설정도 확인한다. 로그 파일은 2026-11-04 17:28에서 멈춰 있다
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
