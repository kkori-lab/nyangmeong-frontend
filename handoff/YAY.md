# YAY 핸드오프

## 지금 하는 것

SCR-ACC-001 재가입 복구 · 화면과 복구 API 연결 — 진행 중 (승인 2026-10-30 09:36, 검증 2회차 실패: 탈퇴 보관 계정·인증번호 로그가 없어 화면 미확인, 사람 확인 2026-10-30 기획의 화면 조건 전부 확인, 추가-1 화면 확인 남음)

기준: 로그인·회원가입_기능명세서_v0.7_20260930(FN-ACC-001-40~48), 로그인·회원가입_화면설계서_v0.10_20260930 화면 36~38, 백엔드 `docs/api/member.md`(복구 목적 `USRC0012` 발송·확인, `POST /members/recovery-info`·`POST /members/recovery`, MemberRecoverRequest·MemberRecoveryResponse·TermsSummary, `GET /members/phone-availability`, `GET /terms/{trmsSn}`), 백엔드 재가입 복구 절 "프론트 연결". 마일스톤 두 절(화면 `대기`였던 것과 API 연결)을 함께 한다. 백엔드가 끝나 있어 가짜 없이 실제 API로 만든다
URL: `docs/routes.md`대로 `/signup` 안의 단계로 둔다(새 URL 없음)
디자인: 없음, 화면설계서 기준(로그인·회원가입과 같은 `Auth*` 컴포넌트, 결정 1)

- FN-ACC-001-40 복구 대상 이메일 확인: 복구 본인확인 단계에 들어온 이메일을 읽기 전용으로 보인다. 이메일을 바꾸려면 취소하고 가입부터 다시 한다
- FN-ACC-001-41 발송·재전송: `POST /email-certifications` `{ emlCertPrpsCd: 'USRC0012', certTrgtEml }`. 재전송 제한은 서버 문구와 `error.data.resendAvailableDt` 남은 시간(비밀번호 찾기와 같다). 404 `MEMBER_NOT_FOUND`·400 `MEMBER_RECOVERY_EXPIRED`는 폼 위 알림(서버 `message`)
- FN-ACC-001-42·43 인증번호 입력·본인확인: 숫자 6자리·`certExpryDt` 남은 시간. `POST /email-certifications/{emlCertSn}/verify` `{ certNo }`. `certRslt`가 `RECOVERY_READY`면 `rcvryAuthrtTkn`·`initAuthrtExpryDt`를 훅 메모리(state)에만 두고 복구 확인 단계로. URL·라우터 state·저장소에는 넣지 않는다(새로고침하면 본인확인부터 다시). `EMAIL_CERT_*` 오류는 인증번호 칸 아래 서버 문구
- FN-ACC-001-44 기존 정보 복구 안내: `POST /members/recovery-info` `{ emlCertSn, rcvryAuthrtTkn }`로 이메일·닉네임·남은 기간(`rcvryExpryDt`까지 일 수)·복구되는 정보(회원정보·반려동물·건강기록·픽셀캐릭터)를 보인다. `missingTrms`가 있으면 그 약관만 개별 동의 체크(필수·선택 표시, 내용보기는 `GET /terms/{trmsSn}`, `trmsFixIdntfKey`가 연령 확인이면 내용보기 없음). `maskedMblTelno`가 있으면 "기존 번호 유지"로 읽기 전용, 없으면 번호 입력칸과 중복확인(`GET /members/phone-availability`)
- FN-ACC-001-45 복구 실행: 필수 약관 동의와 번호 확인이 끝나야 버튼이 열린다. `POST /members/recovery` `{ emlCertSn, rcvryAuthrtTkn, trmsAgres: [{ trmsSn, agreYn }], mblTelno(보관 번호가 없을 때만) }`. 400 `MEMBER_RECOVERY_NOT_AVAILABLE`은 본인확인 단계로 돌아가 서버 문구로 다시 인증하도록 안내, `MEMBER_RECOVERY_EXPIRED`는 폼 위 알림과 새로 회원가입 안내, `INVALID_INPUT_VALUE`는 `fields`를 각 칸으로, 그 밖은 폼 위 알림. 처리 중에는 버튼을 막아 중복 클릭을 막는다
- FN-ACC-001-46 복구 취소: 본인확인·복구 확인 단계의 "취소"는 발송한 인증이 있으면 `POST /email-certifications/{emlCertSn}/invalidate` `{ certTrgtEml }`를 부르고(실패해도 진행) 로그인 방법 선택(`/login`)으로 간다
- FN-ACC-001-47·48 복구 완료·로그인으로: 성공하면 "기존 정보가 복구되었습니다. 기존에 가입한 방법으로 다시 로그인해 주세요."와 "로그인 방법 선택으로" 버튼. 자동 로그인하지 않는다. 완료 상태도 메모리라 새로고침해도 복구를 다시 부르지 않는다
- 진입: 결정 2에 따른다
- 세 인증 요청·`recovery-info`·`recovery`·`phone-availability`·`terms`에 `skipAuthRedirect: true`(로그인 전 요청)
- 바꿀 파일: `features/member/api.js`, `features/member/queries.js`, `features/member/recovery/`(새 폴더: `useRecovery.js`, `RecoveryForm.jsx`, `RecoveryVerifyStep.jsx`, `RecoveryConfirmStep.jsx`, `recoveryMessages.js`), `pages/auth/SignupPage.jsx`(복구 단계로 전환), `features/member/signup/useSignup.js`(409 `MEMBER_RECOVERY_AVAILABLE`이면 복구로), `features/member/password/PasswordFindForm.jsx`·`pages/auth/PasswordFindPage.jsx`("재가입 복구 절차" 버튼), 결정 3에 따라 약관 내용보기 레이어
- 완료 조건 `명령:` `yarn -s lint`, `yarn -s build`
- 완료 조건 `화면:` (백엔드 8080, 인증번호는 백엔드 콘솔 `[Mail]` 로그) 탈퇴 보관 계정으로 `/password/find` 탈퇴 알림의 "재가입 복구 절차" → `/signup` 복구 본인확인(이메일 읽기 전용) → 발송·남은 시간 → 틀린 번호 칸 아래 오류 → 맞는 번호로 복구 확인(이메일·닉네임·남은 기간, 번호 유지 또는 입력칸, 빠진 약관) → 필수 동의 전에는 복구 버튼 비활성 → 복구 → 완료 문구 → "로그인 방법 선택으로"가 `/login`. 다른 탈퇴 보관 계정으로 취소하면 `invalidate` 200과 `/login`, 그 계정은 탈퇴 그대로. 복구 확인에서 새로고침하면 본인확인부터 다시. 복구는 DB를 바꾸므로 계정 하나에 한 번만 확인되고, 탈퇴 보관 계정이 없으면 "확인 못 함"으로 이유와 함께 보고
- 연결 남음: 가입 화면의 409 진입은 가입 API 연결(마일스톤 "SCR-ACC-001 회원가입 · 가입·인증·닉네임 API 연결") 뒤에 화면으로 확인된다. 지금 가입 발송은 가짜라 코드로만 확인

질문:
1. 디자인 파일(`html/`, Figma)이 없습니다. 어떻게 할까요? (추천: 화면설계서 36~38 배치를 기준으로 비밀번호 찾기·가입 화면이 쓰는 `features/member/shared/Auth*` 컴포넌트와 스타일로 만든다. 같은 겉틀이라 새 디자인 초안이 필요 없다. 대안: AI 초안 `html/SCR-ACC-001-recovery.html`을 먼저 만든다)
2. 진입점: 가입 화면의 409는 가입 발송이 아직 가짜라 지금은 나오지 않습니다. 어떻게 확인할까요? (추천: 비밀번호 찾기 탈퇴 알림의 "재가입 복구 절차" 버튼(지금 "준비 중" 토스트)을 `/signup`의 복구 본인확인으로 이어 화면은 이 경로로 확인하고, 가입 화면의 409 처리는 코드만 넣는다. 넘기는 값은 이메일 하나이고 라우터 state로 넘긴다(토큰은 넘기지 않는다))
3. 약관 내용보기: 가입 화면의 약관 단계는 가짜 약관 목록(`SIGNUP_TERMS`)을 쓴다. 복구에서는 `missingTrms`와 `GET /terms/{trmsSn}` 실제 값을 쓸까요? (추천: 실제 값을 쓴다. 내용보기 레이어는 가입 약관 단계에 있는 것을 재사용하고, 없으면 복구 폴더에 간단한 레이어를 둔다. 가입 약관 단계의 실제 연결은 가입 API 연결 때 한다)
결정:
1. 로그인·회원가입 화면과 디자인을 똑같이 한다: 같은 겉틀(`AuthLayout`)과 `features/member/shared/Auth*` 컴포넌트·`authStyles`를 쓰고 배치는 화면설계서 36~38을 따른다
2. 추천안대로: 비밀번호 찾기의 "재가입 복구 절차" 버튼으로 진입해 화면을 확인하고, 가입 화면의 409 처리는 코드만 넣는다. 이메일만 라우터 state로 넘긴다
3. 추천안대로: `missingTrms`와 `GET /terms/{trmsSn}` 실제 값을 쓰고, 내용보기 레이어는 가입 약관 단계 것을 재사용한다

새 의존성: 없음

### 추가 요청

| 추가-1 | `features/member/recovery/RecoveryForm.jsx` | `명령:` `yarn -s lint`, `yarn -s build`. `화면:` 복구 완료 화면에서 체크 표시가 카드 가운데, "로그인 방법 선택으로" 버튼이 카드 아래쪽 | 요청 2026-10-30 "복구 완료 화면 버튼을 아래에 두고 체크 표시는 중앙에" |

문서 정리 · 인증 이동 규칙을 지금 코드에 맞춤 — 진행 중 (승인 2026-10-27 16:29, 검증 통과, 사람 확인 남음, 커밋 3b31971). `docs/convention/api.md`·`docs/convention/pages.md`·`AGENTS.md` 2번. 결정: `skipAuthRedirect`는 원칙으로, AGENTS.md 2번 단서 삭제

두 화면은 PR #61(`YAY` → `develop`)로 올렸다. 기준: 로그인·회원가입_화면설계서_v0.10_20260930, 디자인: 시안 폴더(저장소 밖) `nmcare-design-v5`의 `acc.css`·`acc.js`. 가짜 규칙: 비밀번호 `wrong`은 불일치(5번 실패하면 보안코드), 인증번호 `123456` 일반·`234567` SNS 전용·`345678` 미가입·`456789` 탈퇴, 이메일 `fail@example.com`은 발송 실패, 새 비밀번호에 `fail`이 있으면 저장 실패. 로그인과 인증 화면이 같이 쓰는 컴포넌트는 `features/member/shared/Auth*.jsx`

새 의존성: 없음

## 다음에 할 것

- SCR-ACC-001 재가입 복구 남은 것: 검증 판정이 `실패`(2회차, 환경)로 남아 `끝`이 아니다. 사람이 회원 204로 취소·복구 흐름을 모두 확인했다(2026-10-30). 추가-1(완료 화면 체크 가운데·버튼 아래)은 회원 204를 다시 탈퇴 보관 상태로 되돌린 뒤 화면 확인하고 `/verify` 또는 `/end`. 검증 에이전트가 인증번호(백엔드 콘솔 `[Mail]`)를 읽을 수 없는 문제는 팀과 정한다
- 연결 남음: 가입 화면 409 `MEMBER_RECOVERY_AVAILABLE` → 복구 화면 진입 (가입 API 연결 뒤 화면 확인, YAY)
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
