# YAY 핸드오프

## 지금 하는 것

SCR-ACC-011 비밀번호 찾기 · 인증번호 API 연결 — 끝남 (승인 2026-10-29, 검증 통과, 사람 확인 2026-10-29). FN-ACC-011-02~10. 발송·재전송(`USRC0011`, 재전송 제한 남은 시간), 이메일 다시 입력 시 `invalidate`, 확인 `certRslt`로 재설정·SNS 전용·미가입·탈퇴 분기, 재설정 화면에는 라우터 state로 `emlCertSn`·`pswdInitTkn`·`initAuthrtExpryDt`를 넘긴다(재설정 API는 아직 가짜). 결정: SNS 코드 키를 `USRC0007~0009`로, `api/axios.js` 오류 객체에 `data` 추가(공유 파일). 추가-1: 인증 화면 `justify-center-safe`로 제목 잘림 방지, AI 안내 서서히 표시. 추가-2: 폼 위 알림 서서히 표시

문서 정리 · 인증 이동 규칙을 지금 코드에 맞춤 — 진행 중 (승인 2026-10-27 16:29, 검증 통과, 사람 확인 남음, 커밋 3b31971). `docs/convention/api.md`·`docs/convention/pages.md`·`AGENTS.md` 2번. 결정: `skipAuthRedirect`는 원칙으로, AGENTS.md 2번 단서 삭제

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
- SCR-ACC-012 연결 남음: 백엔드 SCR-ACC-012가 끝나면 가짜 `resetPassword`를 `POST /email-certifications/{emlCertSn}/password-reset`(`pswdInitTkn`·`pswd`·`pswdCnfrm`, 라우터 state로 넘겨받은 값)으로 바꾸고, 재설정 취소 때 `invalidate`(FN-ACC-012-04)를 부른다. 탈퇴 계정의 "재가입 복구 절차"는 SCR-ACC-001 복구 화면이 생기면 연결한다
- PR Breaking Changes: `api/axios.js` 오류 객체에 `data` 추가(`docs/convention/api.md`), `snsCodes.js` 키를 서버 코드(`USRC0007~0009`)로 변경, 인증 화면 겉틀(`layouts/AuthLayout.jsx`·`AuthSlider.jsx`) 정렬 변경, `components/AiErrorGuide.jsx` 나타남 효과
- 코드 후보: 재전송 제한 알림이 떠 있을 때 인증번호 확인에 실패하면 그 알림이 남는다(검증 메모)
