# YAY 핸드오프

## 지금 하는 것

SCR-ACC-001 재가입 복구 · 화면과 복구 API 연결 — 끝남 (승인 2026-10-30, 검증 통과(재시작 1회차, 이전 루프는 탈퇴 보관 계정·인증번호 로그가 없어 2회 실패 뒤 버림), 사람 확인 2026-10-30, PR #116). FN-ACC-001-40~48. 비밀번호 찾기 탈퇴 알림의 "재가입 복구 절차" → `/signup` 복구 본인확인(`USRC0012`) → 복구 확인(`recovery-info`, 빠진 약관·`GET /terms/{trmsSn}` 레이어, 기존 번호 유지 또는 입력·중복확인) → 복구 → 완료 → `/login`. 복구 권한 토큰은 훅 state에만. 결정: `Auth*` 디자인, 진입은 비밀번호 찾기(가입 409는 코드만), 실제 `missingTrms` 사용(레이어는 `recovery/RecoveryTermsModal.jsx` 새로). 추가-1: 완료 화면 체크 가운데·버튼 아래. 확인 환경: 백엔드 로그 `../nyangmeong-backend/backend.log`(UTF-16)의 `[Mail]` 줄. 보관 번호가 없는 계정의 번호 입력칸은 코드로만 확인

문서 정리 · 인증 이동 규칙을 지금 코드에 맞춤 — 진행 중 (승인 2026-10-27 16:29, 검증 통과, 사람 확인 남음, 커밋 3b31971). `docs/convention/api.md`·`docs/convention/pages.md`·`AGENTS.md` 2번. 결정: `skipAuthRedirect`는 원칙으로, AGENTS.md 2번 단서 삭제

두 화면은 PR #61(`YAY` → `develop`)로 올렸다. 기준: 로그인·회원가입_화면설계서_v0.10_20260930, 디자인: 시안 폴더(저장소 밖) `nmcare-design-v5`의 `acc.css`·`acc.js`. 가짜 규칙: 비밀번호 `wrong`은 불일치(5번 실패하면 보안코드), 인증번호 `123456` 일반·`234567` SNS 전용·`345678` 미가입·`456789` 탈퇴, 이메일 `fail@example.com`은 발송 실패, 새 비밀번호에 `fail`이 있으면 저장 실패. 로그인과 인증 화면이 같이 쓰는 컴포넌트는 `features/member/shared/Auth*.jsx`

새 의존성: 없음

## 다음에 할 것

- 연결 남음: 가입 화면 409 `MEMBER_RECOVERY_AVAILABLE` → 복구 화면 진입 (마일스톤 "회원가입 · 가입·인증·닉네임 API 연결"에서 화면 확인, YAY)
- 코드 후보: `features/signup/TermsStep`의 CheckBox를 `features/member/shared/AuthCheckBox.jsx`로 합친다
- 문서 정리(인증 이동 규칙) 사람 확인 남음: `docs/convention/api.md` 48~61줄, `docs/convention/pages.md` 22~23줄, `AGENTS.md` 2번을 읽고 확인한 뒤 `/end`. develop의 바뀐 `src/api/axios.js`를 병합한 뒤 문서가 다시 어긋나지 않는지 본다. PR Breaking Changes에 AGENTS.md 변경을 적고 LJS에게 알린다
- 코드 후보: `src/features/member/api.js` 92줄 주석 "랜딩 이동을 끈다"가 지금 동작(로그인 화면 이동)과 다르다
- 연결 남음: FN-ACC-001-22 (닉네임 확인·저장 API `PATCH /members/me/nickname`, YAY 백엔드 SCR-ACC-001)
- 연결 남음: (기반) 메인·마이페이지 라우트 `auth: 'member'` 전환 (팀과 정한 뒤, 각 라우트 담당)
- 백엔드: `DevTokenController` 삭제(백엔드 마일스톤 SCR-ACC-002 절에 이미 있음)
- SCR-ACC-002 연결 남음: SNS 외부 인증창(네이버·카카오·구글 OAuth), 가입 직후 첫 로그인의 닉네임 모달(FN-ACC-001-22), 회원가입 화면(SCR-ACC-001)
- SCR-ACC-012 연결 남음: 백엔드 SCR-ACC-012가 끝나면 가짜 `resetPassword`를 `POST /email-certifications/{emlCertSn}/password-reset`(`pswdInitTkn`·`pswd`·`pswdCnfrm`, 라우터 state로 넘겨받은 값)으로 바꾸고, 재설정 취소 때 `invalidate`(FN-ACC-012-04)를 부른다
- PR Breaking Changes: `api/axios.js` 오류 객체에 `data` 추가(`docs/convention/api.md`), `snsCodes.js` 키를 서버 코드(`USRC0007~0009`)로 변경, 인증 화면 겉틀(`layouts/AuthLayout.jsx`·`AuthSlider.jsx`) 정렬 변경, `components/AiErrorGuide.jsx` 나타남 효과
- 코드 후보: 재전송 제한 알림이 떠 있을 때 인증번호 확인에 실패하면 그 알림이 남는다(검증 메모)
