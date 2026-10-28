# YAY 핸드오프

## 지금 하는 것

SCR-ACC-002 로그인 · 로그인·로그아웃 API 연결 — 진행 중 (승인 2026-10-27 09:35). 구현 끝, 검증 3회차 실패(로그인 성공·로그아웃 화면 확인 못 함)로 보관. PR은 진행 상태로 올림

기준: 백엔드 `docs/api/member.md`(LoginRequest·LoginResponse·LoginAttemptLimitResponse·CaptchaCreateRequest·CaptchaResponse), 백엔드 SCR-ACC-002 절 "프론트 연결". 명세 기능 ID 추가 없음(연결 작업)
디자인: 기존 로그인 화면 그대로. 보안코드만 서버가 그린 이미지로 바꾼다

- FN-ACC-002-03·22 보안코드 요구 확인: `getLoginStatus`를 `GET /auth/login-attempt-limits?email=`로 바꾼다. 응답 `scrtyCdRqtYn`이 true면 보안코드 영역을 연다. 조회 실패는 폼 위 알림과 AI로 `error.message`를 보인다
- FN-ACC-002-18·19 보안코드 발급·새로고침: `getCaptcha({ acntEml })`를 `POST /auth/captchas`로 바꾼다. `CaptchaBlock`은 글자를 CSS로 그리던 것을 `captchaImg`(data URI) `<img>`로 바꾼다. 가짜 코드 생성(`makeCaptchaCode` 등)은 지운다
- FN-ACC-002-05·16·20 로그인: `login({ acntEml, pswd, scrtyCd })`를 `POST /auth/login`으로 바꾼다(보안코드 영역이 열렸을 때만 `scrtyCd`). 성공 응답은 `{ ncnmReguide, mbrNcnm }`, 실패는 오류 코드로 가른다
  - `LOGIN_FAILED`: 폼 위 불일치 알림(서버 `message`). 보안코드 영역이 열려 있으면 새 코드를 받는다
  - `LOGIN_CAPTCHA_REQUIRED`(429, 5회째 실패·보안코드 없음): 보안코드 영역을 열고 서버 `message`로 안내, 새 코드를 받는다
  - `CAPTCHA_MISMATCH`: 보안코드 칸 아래 오류(서버 `message`)와 새 코드
  - `MEMBER_WITHDRAWN`·`MEMBER_INACTIVE`: 폼 위 알림(서버 `message`). `MEMBER_INACTIVE`는 결정 1로 랜딩 이동 없이 보인다
  - `INVALID_INPUT_VALUE`: `fields`의 `acntEml`·`pswd`·`scrtyCd`를 각 입력칸 오류로
  - 그 밖(`NETWORK_ERROR` 등): 폼 위 알림
  - 어느 실패든 비밀번호·보안코드 입력은 비우고 이메일은 둔다(지금과 같다)
  - 화면 문구는 서버 `message`를 쓰고 `loginMessages.js`에서 서버와 겹치는 문구(불일치·보안코드 필요·보안코드 불일치)는 지운다. 입력 전 검사 문구(미입력·형식)는 그대로 둔다
- 로그인 성공: `memberKeys.me`를 무효화해 헤더가 로그인 상태가 되게 하고 `getRedirectPath`로 이동한다
- FN-ACC-001-22 첫 로그인 닉네임 재안내: `ncnmReguide`가 true면 이동 전에 `features/member/signup/NicknameModal`을 `mbrNcnm`으로 띄우고, 저장하거나 닫으면 이동한다. 닉네임 확인·저장은 지금의 가짜(`checkNickname`·`updateNickname`) 그대로(백엔드 `PATCH /members/me/nickname` 대기)
- FN-COM-005-07·08, FN-AIM-011-17 로그아웃: `logout`을 `POST /auth/logout`으로 바꾼다. 쓰는 곳(`layouts/ProfileDropdown.jsx`, `pages/mypage/InvitationPage.jsx`)은 그대로
- 바꿀 파일: `features/member/api.js`, `features/member/queries.js`(인자 이름), `features/member/login/{useEmailLogin.js,CaptchaBlock.jsx,EmailLoginForm.jsx,loginMessages.js}`, `pages/auth/LoginPage.jsx`(닉네임 모달·캐시 무효화), `docs/convention/api.md`(skipAuthRedirect 줄, 결정 1)
- 완료 조건 `명령:` `yarn -s lint`, `yarn -s build`
- 완료 조건 `화면:` (백엔드 8080, 테스트 계정 기준) `/login?method=email`에서 올바른 계정으로 로그인하면 메인으로 가고 헤더가 로그인 상태가 된다. 틀린 비밀번호 1~4번은 "일치하는 회원정보를 찾을 수 없습니다.", 5번째는 보안코드 안내와 서버 보안코드 이미지가 나온다. 새로고침 버튼을 누르면 이미지가 바뀐다. 틀린 보안코드는 "보안코드가 일치하지 않습니다. 다시 입력해 주세요."와 새 이미지. 다른 탭에서 `/login?method=email`을 다시 열고 같은 이메일을 입력하고 칸을 벗어나면 보안코드 영역이 바로 나온다. 로그아웃하면 랜딩으로 가고 `/auth/me`가 401이다
- 연결 남음(이 절에서 하지 않음): 닉네임 확인·저장 API(백엔드 SCR-ACC-001), 백엔드 `DevTokenController` 삭제(이 연결 뒤 백엔드에서), 메인·마이페이지 라우트 `auth: 'member'` 전환(AGENTS.md 2번, 다른 담당 라우트라 팀과 정한 뒤)

질문:
1. 정지 회원(`MEMBER_INACTIVE`, 403)은 `api/axios.js`가 랜딩으로 새로고침 이동시킨다. 로그인 화면에서는 이동 없이 서버 문구("이용할 수 없는 계정입니다. 고객센터에 문의해 주세요.")를 보여야 한다. `login` 요청에만 `skipAuthRedirect: true`를 붙이고 `docs/convention/api.md`의 "getMe에만 붙인다" 줄을 "getMe와 login에만"으로 고칠까요? (추천: 그렇게 한다. 공유 문서라 PR 본문 Breaking Changes에 적는다)
2. 화면 확인용 테스트 계정: 가입 API가 아직 없어 화면으로 계정을 만들 수 없다. 로컬 DB에 쓸 이메일 계정(비밀번호 포함)을 알려 주시거나, 없으면 백엔드 저장소에서 넣어 주세요. (추천: 계정을 알려 주시면 그것으로 확인, 없으면 로그인 성공·로그아웃 조건은 "확인 못 함"으로 보고)
결정:
1. 추천안대로: `login` 요청에만 `skipAuthRedirect: true`를 붙이고 `docs/convention/api.md`를 고친다. PR Breaking Changes에 적는다
2. 백엔드 시드 계정 `tester@nyangmeong.dev`로 확인한다(비밀번호는 백엔드 설정 `app.seed.password`, 여기 적지 않음)

새 의존성: 없음

SCR-ACC-002 로그인 — 끝남 (승인 2026-10-21, 검증 통과 회차 2, 사람 확인 2026-10-22). FN-ACC-002-01~05·07~11·13~16·18~20·22. 방법 선택, 이메일 입력, 입력 오류, 불일치(1~4회), 5회 실패 보안코드, AI 오류 안내, Caps Lock 안내

SCR-ACC-011 비밀번호 찾기, SCR-ACC-012 비밀번호 재설정 — 끝남 (승인 2026-10-22, 검증 통과, 사람 확인 2026-10-22). FN-ACC-011-01~03·05~11, FN-ACC-012-01~09, FN-ACC-002-07. 이메일 인증 후 일반 계정은 재설정, SNS 전용은 안내, 미가입·탈퇴는 알림. 재설정은 본인확인이 없으면 만료 안내

두 화면은 PR #61(`YAY` → `develop`)로 올렸다. 기준: 로그인·회원가입_화면설계서_v0.10_20260930, 디자인: 시안 폴더(저장소 밖) `nmcare-design-v5`의 `acc.css`·`acc.js`. 가짜 규칙: 비밀번호 `wrong`은 불일치(5번 실패하면 보안코드), 인증번호 `123456` 일반·`234567` SNS 전용·`345678` 미가입·`456789` 탈퇴, 이메일 `fail@example.com`은 발송 실패, 새 비밀번호에 `fail`이 있으면 저장 실패. 로그인과 인증 화면이 같이 쓰는 컴포넌트는 `features/member/shared/Auth*.jsx`

새 의존성: 없음

## 다음에 할 것

- 검증 루프 3회차 실패로 보관 중. 기획은 고치지 않는다. 루프를 버리려면 `! sh scripts/verify-loop.sh clear`
  - 1~3회차 실패 항목: 화면 "올바른 계정 로그인 성공(메인 이동·헤더 로그인 상태)"과 "로그아웃"(2·3회차)을 확인 못 함. 검증 에이전트가 시드 비밀번호를 읽을 권한이 auto mode 분류기에 막혔다. 코드 결함은 보고되지 않았다. 로그아웃은 1회차 검증에서 통과했다
  - 사람이 2026-10-27에 같은 조건을 직접 확인했다(메인 이동, 전체 메뉴에 로그인 계정 표시). 판정이 `실패`라 `끝`으로 두지 않았다. 검증 에이전트가 시드 계정으로 로그인할 수 있게 한 뒤 `/verify`를 다시 돌린다
  - 정지 회원(`MEMBER_INACTIVE`)이 로그인 화면에 머무는지는 정지 계정이 없어 코드로만 확인했다
- PR을 올릴 때 Breaking Changes: `docs/convention/api.md`의 `skipAuthRedirect`를 "getMe와 login에만"으로 바꿨다(결정 1)
- SCR-ACC-002 연결 남음: SNS 외부 인증창(네이버·카카오·구글 OAuth), 가입 직후 첫 로그인의 닉네임 모달(FN-ACC-001-22), 회원가입 화면(SCR-ACC-001)
- SCR-ACC-011·012 연결 남음: 인증번호 발송·확인·비밀번호 재설정 API(YAY 백엔드)가 나오면 `features/member/api.js`의 가짜(`sendRecoveryCode`·`verifyRecoveryCode`·`getRecoveryStatus`·`resetPassword`)를 실제 호출로 바꾼다. 인증 유효시간·재전송 제한은 백엔드와 정한다. 탈퇴 계정의 "재가입 복구 절차"는 SCR-ACC-001 복구 화면이 생기면 연결한다
- 로그인 구현 후 메인·마이페이지 라우트의 `auth`를 `'member'`로 바꾼다
