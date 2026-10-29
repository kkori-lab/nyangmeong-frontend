# YAY 핸드오프

## 지금 하는 것

문서 정리 · 인증 이동 규칙을 지금 코드에 맞춤 — 진행 중 (승인 2026-10-27 16:29, 검증 통과, 사람 확인 남음). 마일스톤 절 없음(SCR-ACC-002 API 연결과 LJS SCR-COM-003의 후속 문서 작업, 기능 ID 없음)

기준: `src/api/axios.js`(401·`MEMBER_INACTIVE`면 `toLoginPath`로 로그인 화면 이동, `/login`에서는 이동 안 함), `src/utils/loginRedirect.js`, `src/routes/ProtectedRoute.jsx`, `skipAuthRedirect`를 붙인 요청 5개(`getMe`, `login`, `getLoginStatus`, `getCaptcha`, `hooks/useCharacterImage.js`)
디자인: 해당 없음(문서만)

- `docs/convention/api.md`
  - 오류 표 401·403 줄과 재발급 설명(48·49·55·56줄): "랜딩으로 이동"을 "로그인 화면(`/login?redirect=`)으로 이동, 로그인 화면에서는 이동하지 않음"으로
  - 57줄 `skipAuthRedirect` 규칙: 결정 1대로 고친다
  - `axios.js` 예시 코드(96~102줄): 지금 `src/api/axios.js`의 이동 부분(`toLoginPath`, `/login` 제외)과 같게
- `docs/convention/pages.md` 22줄: `useMe`가 실패하면 "랜딩으로"를 "로그인 화면으로"로
- `AGENTS.md` 2번: 결정 2대로
- 바꿀 파일: `docs/convention/api.md`, `docs/convention/pages.md`, (결정 2에 따라) `AGENTS.md`. 코드는 고치지 않는다
- 완료 조건 `명령:` `yarn -s lint`, `yarn -s build`
- 완료 조건 `화면:` 없음. 대신 문서의 이동 대상·`skipAuthRedirect` 대상·예시 코드가 `src/api/axios.js`·`src/features/member/api.js`·`src/hooks/useCharacterImage.js`와 어긋나지 않는다(`grep -n "랜딩" docs/convention/api.md docs/convention/pages.md`에 인증 이동 설명이 남지 않는다)

질문:
1. `skipAuthRedirect` 규칙을 어떻게 쓸까요? (추천: 목록 대신 원칙으로 "로그인하지 않은 상태에서도 부르는 요청(로그인 여부 확인, 로그인 화면의 요청, 로그인 전 화면의 이미지 등)에만 붙인다. 실패를 그 화면이 직접 안내해야 하기 때문이다"로 쓰고 지금 붙은 5개를 예로 든다. 목록으로 두면 요청이 늘 때마다 문서가 또 어긋난다)
2. `AGENTS.md` 2번의 "로그인을 구현하기 전에는 `ProtectedRoute`로 감싸지 않는다"는 이제 지난 일입니다(로그인 연결 끝, LJS가 PR #100에서 감쌌다). 이 단서를 지울까요? (추천: 지우고 "화면을 만들 때는 백엔드를 띄우고 로그인해서 확인한다"로 바꾼다. AGENTS.md는 모두가 읽는 파일이라 PR Breaking Changes에 적고 LJS에게 알린다)
결정:
1. 추천안대로: 원칙으로 쓰고 지금 붙은 5개를 예로 든다
2. 추천안대로: 단서를 지우고 "화면을 만들 때는 백엔드를 띄우고 로그인해서 확인한다"로 바꾼다. PR Breaking Changes에 적고 LJS에게 알린다

새 의존성: 없음

SCR-ACC-002 로그인 · 로그인·로그아웃 API 연결 — 끝남 (승인 2026-10-27, 검증 통과(재검증, 이전 1~3회차는 검증 에이전트가 시드 비밀번호를 못 읽어 실패), 사람 확인 2026-10-27). FN-ACC-002-03·05·16·18~20·22, FN-COM-005-07·08, FN-AIM-011-17. 보안코드 요구 확인·발급(서버 이미지), 로그인 오류 코드별 안내(서버 문구), 성공 시 `memberKeys.me` 무효화·`ncnmReguide`면 닉네임 모달, 로그아웃. PR #98. 결정: `login`에 `skipAuthRedirect: true`, `docs/convention/api.md` 갱신. 정지 회원·닉네임 재안내 모달은 해당 계정이 없어 코드로만 확인

SCR-ACC-002 로그인 — 끝남 (승인 2026-10-21, 검증 통과 회차 2, 사람 확인 2026-10-22). FN-ACC-002-01~05·07~11·13~16·18~20·22. 방법 선택, 이메일 입력, 입력 오류, 불일치(1~4회), 5회 실패 보안코드, AI 오류 안내, Caps Lock 안내

SCR-ACC-011 비밀번호 찾기, SCR-ACC-012 비밀번호 재설정 — 끝남 (승인 2026-10-22, 검증 통과, 사람 확인 2026-10-22). FN-ACC-011-01~03·05~11, FN-ACC-012-01~09, FN-ACC-002-07. 이메일 인증 후 일반 계정은 재설정, SNS 전용은 안내, 미가입·탈퇴는 알림. 재설정은 본인확인이 없으면 만료 안내

두 화면은 PR #61(`YAY` → `develop`)로 올렸다. 기준: 로그인·회원가입_화면설계서_v0.10_20260930, 디자인: 시안 폴더(저장소 밖) `nmcare-design-v5`의 `acc.css`·`acc.js`. 가짜 규칙: 비밀번호 `wrong`은 불일치(5번 실패하면 보안코드), 인증번호 `123456` 일반·`234567` SNS 전용·`345678` 미가입·`456789` 탈퇴, 이메일 `fail@example.com`은 발송 실패, 새 비밀번호에 `fail`이 있으면 저장 실패. 로그인과 인증 화면이 같이 쓰는 컴포넌트는 `features/member/shared/Auth*.jsx`

새 의존성: 없음

## 다음에 할 것

- 문서 정리(인증 이동 규칙) 사람 확인 남음: `docs/convention/api.md` 48~61줄, `docs/convention/pages.md` 22~23줄, `AGENTS.md` 2번을 읽고 확인한 뒤 `/end`. develop의 바뀐 `src/api/axios.js`를 병합한 뒤 문서가 다시 어긋나지 않는지 본다. PR Breaking Changes에 AGENTS.md 변경을 적고 LJS에게 알린다
- 코드 후보: `src/features/member/api.js` 92줄 주석 "랜딩 이동을 끈다"가 지금 동작(로그인 화면 이동)과 다르다
- 연결 남음: FN-ACC-001-22 (닉네임 확인·저장 API `PATCH /members/me/nickname`, YAY 백엔드 SCR-ACC-001)
- 연결 남음: (기반) 메인·마이페이지 라우트 `auth: 'member'` 전환 (팀과 정한 뒤, 각 라우트 담당)
- 백엔드: `DevTokenController` 삭제(백엔드 마일스톤 SCR-ACC-002 절에 이미 있음)
- SCR-ACC-002 연결 남음: SNS 외부 인증창(네이버·카카오·구글 OAuth), 가입 직후 첫 로그인의 닉네임 모달(FN-ACC-001-22), 회원가입 화면(SCR-ACC-001)
- SCR-ACC-011·012 연결 남음: 인증번호 발송·확인·비밀번호 재설정 API(YAY 백엔드)가 나오면 `features/member/api.js`의 가짜(`sendRecoveryCode`·`verifyRecoveryCode`·`getRecoveryStatus`·`resetPassword`)를 실제 호출로 바꾼다. 인증 유효시간·재전송 제한은 백엔드와 정한다. 탈퇴 계정의 "재가입 복구 절차"는 SCR-ACC-001 복구 화면이 생기면 연결한다
