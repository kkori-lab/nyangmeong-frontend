# YAY 핸드오프

## 지금 하는 것

SCR-ACC-001 회원가입 (이메일) · 가입·인증·닉네임 API 연결 — 끝남 (승인 2026-11-04 12:41, 검증 통과 7회차(확인 못 함 없음, 연결 남음 없음), 사람 확인 2026-11-04). `features/member/signup/` 가짜 API를 약관 `GET /terms`·`/terms/{trmsSn}`, 인증 `POST /email-certifications`·`/verify`(`USRC0010`), 번호 `GET /members/phone-availability`, 가입 `POST /members`, 닉네임 `GET /members/nickname-availability`·`PATCH /members/me/nickname`으로 바꿨다. 결정: 약관은 서버 목록 그대로(서버에 `AGE_14` 있음), 닉네임 입력은 자르지 않고 길이·문자 오류 문구로 막는다, 가입된 이메일 오류 아래 [기존 가입 방법으로 로그인] 버튼. 확인 환경: 백엔드를 `backend.log`로 띄우고(인증번호는 `[Mail]` 줄), 409 복구 진입은 탈퇴 보관 회원이 있어야 한다

문서 정리 · 인증 이동 규칙을 지금 코드에 맞춤 — 진행 중 (승인 2026-10-27 16:29, 검증 통과, 사람 확인 남음, 커밋 3b31971). `docs/convention/api.md`·`docs/convention/pages.md`·`AGENTS.md` 2번. 결정: `skipAuthRedirect`는 원칙으로, AGENTS.md 2번 단서 삭제

두 화면은 PR #61(`YAY` → `develop`)로 올렸다. 기준: 로그인·회원가입_화면설계서_v0.10_20260930, 디자인: 시안 폴더(저장소 밖) `nmcare-design-v5`의 `acc.css`·`acc.js`. 가짜 규칙: 비밀번호 `wrong`은 불일치(5번 실패하면 보안코드), 인증번호 `123456` 일반·`234567` SNS 전용·`345678` 미가입·`456789` 탈퇴, 이메일 `fail@example.com`은 발송 실패, 새 비밀번호에 `fail`이 있으면 저장 실패. 로그인과 인증 화면이 같이 쓰는 컴포넌트는 `features/member/shared/Auth*.jsx`

새 의존성: 없음

### 추가 요청

| 추가-1 | `features/member/signup/signupMessages.js`·`signup/SignupForm.jsx`·`password/passwordMessages.js` | 명령: `yarn -s lint`, `yarn -s build` / 화면: 회원가입 비밀번호 단계 부제·도움말·오류와 비밀번호 재설정 도움말·오류가 "영문과 숫자를 함께 써서 8~64자로 입력해 주세요(공백 제외)" | 요청 2026-11-04 12:32 "공용 isValidPassword가 서버 규칙(영문+숫자, 공백 없는 ASCII 8~64자)으로 바뀌었으니 가입·재설정 안내 문구를 마이페이지 문구에 맞춘다" |
| 추가-2 | `features/member/shared/validate.js`·`signup/useSignup.js` | 명령: `yarn -s lint`, `yarn -s build` / 화면: 가입 비밀번호 검사가 공용 `isValidPassword`와 같다(`isValidJoinPassword` 없음) | 요청 2026-11-04 12:34 "develop 병합 뒤 겹치는 isValidJoinPassword를 공용 isValidPassword로 합친다" |

## 다음에 할 것

- 연결 남음: FN-HOS-001-33 플레이스 로그인 필수. `routes/AppRoutes.jsx`의 `<ProtectedRoute />` 아래에 `pick('bare', 'member')` 조립을 넣는 별도 PR을 올린 뒤 `routes/domains/place/placeRoutes.js`를 `auth: 'member'`로 바꾼다(YAY)
- 코드 후보: `features/signup/TermsStep`의 CheckBox를 `features/member/shared/AuthCheckBox.jsx`로 합친다
- 문서 정리(인증 이동 규칙) 사람 확인 남음: `docs/convention/api.md` 48~61줄, `docs/convention/pages.md` 22~23줄, `AGENTS.md` 2번을 읽고 확인한 뒤 `/end`. develop의 바뀐 `src/api/axios.js`를 병합한 뒤 문서가 다시 어긋나지 않는지 본다. PR Breaking Changes에 AGENTS.md 변경을 적고 LJS에게 알린다
- 코드 후보: `src/features/member/api.js` 92줄 주석 "랜딩 이동을 끈다"가 지금 동작(로그인 화면 이동)과 다르다
- 연결 남음: (기반) 메인·마이페이지 라우트 `auth: 'member'` 전환 (팀과 정한 뒤, 각 라우트 담당)
- 백엔드: `DevTokenController` 삭제(백엔드 마일스톤 SCR-ACC-002 절에 이미 있음)
- SCR-ACC-002 연결 남음: SNS 외부 인증창(네이버·카카오·구글 OAuth), 가입 직후 첫 로그인의 닉네임 모달(FN-ACC-001-22), 회원가입 화면(SCR-ACC-001)
- SCR-ACC-012 연결 남음: 백엔드 SCR-ACC-012가 끝나면 가짜 `resetPassword`를 `POST /email-certifications/{emlCertSn}/password-reset`(`pswdInitTkn`·`pswd`·`pswdCnfrm`, 라우터 state로 넘겨받은 값)으로 바꾸고, 재설정 취소 때 `invalidate`(FN-ACC-012-04)를 부른다
- PR Breaking Changes: `api/axios.js` 오류 객체에 `data` 추가(`docs/convention/api.md`), `snsCodes.js` 키를 서버 코드(`USRC0007~0009`)로 변경, 인증 화면 겉틀(`layouts/AuthLayout.jsx`·`AuthSlider.jsx`) 정렬 변경, `components/AiErrorGuide.jsx` 나타남 효과
- 코드 후보: 재전송 제한 알림이 떠 있을 때 인증번호 확인에 실패하면 그 알림이 남는다(검증 메모)
- 코드 후보: 가입을 마치고 [로그인 화면으로] → [회원가입]으로 다시 들어오면 새 가입이 아니라 앞 가입의 완료 화면이 남는다(`useSignup` 상태가 슬라이더 안에 남음, 새로고침하면 처음부터). SCR-ACC-001 검증 메모
