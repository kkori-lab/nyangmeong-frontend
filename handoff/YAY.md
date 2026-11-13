# YAY 핸드오프

## 지금 하는 것

SCR-ACC-001 회원가입 (이메일) · 휴대전화 하이픈 표시·인증번호 오답 뒤 재발송 — 진행 중 (승인 2026-11-13 10:28, 검증 3회차 실패로 보관, 사람 확인 2026-11-13). 코드는 다 만들었고 검증 실패는 환경(인증번호를 읽을 수 없음) 때문이다

기준: 로그인·회원가입_기능명세서_v0.8(캐시). 명세는 불일치를 "입력칸과 AI로 안내"(FN-ACC-001-06·42)하고 재전송 간격은 "공통 인증 설정에서 읽고 화면별 숫자를 따로 두지 않는다"고 한다. 이번에 입력칸을 숨기는 것은 사람 요청(백엔드 fail-limit=1로 한 번 틀리면 그 번호는 무효)이라 명세와 다르다 → 팀 알림. 남은 초는 프론트에 60을 두지 않고 서버 시각(`resendAvailableDt`)으로만 센다. 디자인: 없음(Figma 토큰 없음, `html/`에 ACC 파일 없음). 지금 인증 화면의 버튼·칸·AI 말풍선(`AuthField`·`AuthNotice`의 `hasGuide`)을 그대로 쓴다

- 휴대전화 하이픈 표시(FN-ACC-001-29): `features/member/shared/validate.js`에 입력 중 형식 함수 `formatPhoneInput` 추가(숫자만 남겨 최대 11자리, 3-4-4 / 10자리는 3-3-4로 하이픈. `+82`로 시작하면 지금처럼 그대로 둔다). `signup/useSignup.js`·`signup/useSnsSignup.js`·`recovery/useRecovery.js`의 `changePhone`이 이 함수를 쓴다. 서버로는 지금처럼 `normalizePhone` 결과(숫자만). API 변경 없음
  - 완료 조건: `명령:` `yarn -s lint`, `yarn -s build` / `화면:` 가입 휴대전화 단계·SNS 가입 확인 직접 입력·재가입 복구 휴대전화 칸에 `01012345678`을 치면 `010-1234-5678`로 보이고, 지우기·중간 수정도 자연스럽다. [중복확인] 요청 본문의 번호는 `01012345678`이다
- 인증번호 오답 뒤 재발송(FN-ACC-001-06, SCR-ACC-011 인증, FN-ACC-001-42): 공통 판단은 `features/member/shared/emailCert.js`(새 파일, 오답 코드 판별·남은 초 계산). 가입 `signup/useSignup.js`·`signup/EmailStep.jsx`, 비밀번호 찾기 `password/usePasswordFind.js`·`password/PasswordFindForm.jsx`, 복구 `recovery/useRecovery.js`·`recovery/RecoveryForm.jsx`, 문구 `signup/signupMessages.js`(필요한 곳만)
  - 확인 응답이 429 `EMAIL_CERT_FAIL_LIMIT_EXCEEDED` 또는 400 `EMAIL_CERT_MISMATCH`(또는 가입의 `certRslt` 불일치)면 인증번호 칸·타이머를 숨기고 이메일 칸 옆 [다시 보내기]만 남긴다. 안내는 공통 알림을 AI 말풍선으로(서버 문구 "인증번호가 일치하지 않습니다. 인증번호를 다시 받아 주세요.") 보인다
  - [다시 보내기]가 400 `EMAIL_CERT_RESEND_NOT_YET`이면 `error.data.resendAvailableDt`까지 버튼을 끄고 "다시 보내기 (N초)"로 남은 초를 센다. 0초가 되면 다시 켜진다. 발송 응답에 `resendAvailableDt`가 오면(백엔드 연결 뒤) 발송 직후부터 같은 방식으로 센다
  - 다시 보내 성공하면 인증번호 칸·타이머가 다시 나오고 이전 오답 안내는 사라진다. 만료(`EMAIL_CERT_EXPIRED`)는 지금처럼 칸 아래 안내 그대로
  - API: `POST /email-certifications`, `POST /email-certifications/{emlCertSn}/verify`(YAY, 있음). 백엔드 연결: 오답 뒤 재발송 간격 해제 여부, 발송 응답에 `resendAvailableDt` 추가 (백엔드 저장소에서 /start)
  - 완료 조건: `명령:` `yarn -s lint`, `yarn -s build` / `화면:` 가입 이메일 단계·비밀번호 찾기·재가입 복구에서 틀린 인증번호를 넣고 [확인] → 인증번호 칸과 타이머가 사라지고 AI 말풍선에 다시 받으라는 안내가 뜬다 → 바로 [다시 보내기] → 간격이 남았으면 버튼이 꺼지고 "다시 보내기 (N초)"가 줄어든다 → 0이 되면 눌러 새 번호를 받고 칸·타이머가 다시 나온다 → 새 번호로 인증된다

새 의존성: 없음

질문: 디자인 파일이 없습니다. 지금 인증 화면의 칸·버튼·AI 말풍선을 그대로 쓰고 동작만 바꿀까요? 디자인 HTML 경로가 있으면 알려 주세요. (추천: 지금 모양 그대로 동작만 바꾼다)
결정: 추천안대로 (디자인: 없음, 지금 인증 화면 모양 기준)

### 추가 요청

| 번호 | 바꿀 파일 | 완료 조건 | 요청 |
| --- | --- | --- | --- |
| 추가-1 | `signup/SignupForm.jsx`, `signup/EmailStep.jsx`, `password/PasswordFindForm.jsx`, `recovery/RecoveryForm.jsx` | `명령:` `yarn -s lint`, `yarn -s build` / `화면:` 가입 이메일 단계·비밀번호 찾기·재가입 복구에서 인증번호가 틀리면 AI 말풍선이 폼 맨 위가 아니라 이메일 칸(비밀번호 찾기는 "인증할 이메일" 상자·[이메일 다시 입력]) 바로 아래에 뜬다. 다른 알림(발송 실패 등)은 지금처럼 맨 위 | 요청 2026-11-13 11:03 "인증번호 틀렸을 때 AI 말풍선이 이메일 위가 아니라 아래에 뜨게" |

문서 정리 · 인증 이동 규칙을 지금 코드에 맞춤 — 진행 중 (승인 2026-10-27 16:29, 검증 통과, 사람 확인 남음, 커밋 3b31971). `docs/convention/api.md`·`docs/convention/pages.md`·`AGENTS.md` 2번. 결정: `skipAuthRedirect`는 원칙으로, AGENTS.md 2번 단서 삭제

두 화면은 PR #61(`YAY` → `develop`)로 올렸다. 기준: 로그인·회원가입_화면설계서_v0.10_20260930, 디자인: 시안 폴더(저장소 밖) `nmcare-design-v5`의 `acc.css`·`acc.js`. 가짜 규칙: 비밀번호 `wrong`은 불일치(5번 실패하면 보안코드), 인증번호 `123456` 일반·`234567` SNS 전용·`345678` 미가입·`456789` 탈퇴, 이메일 `fail@example.com`은 발송 실패, 새 비밀번호에 `fail`이 있으면 저장 실패. 로그인과 인증 화면이 같이 쓰는 컴포넌트는 `features/member/shared/Auth*.jsx`

## 다음에 할 것

- 검증 루프 3회차 실패로 보관 중(SCR-ACC-001 휴대전화 하이픈·인증번호 오답 뒤 재발송). 기획은 고치지 않는다. 루프를 버리려면 `! sh scripts/verify-loop.sh clear`
  - 1회차: FN-ACC-001-29 `+82` 입력 시 커서 복원으로 깨짐 → 고침(2·3회차 확인)
  - 2회차: 이메일 가입 휴대전화 단계·복구 휴대전화 칸 확인 못 함(백엔드가 `backend.log`에 인증번호를 남기지 않음) → 3회차(사람 `/verify`)에서 가짜 응답으로 통과
  - 3회차(추가-1 뒤): "새 번호로 인증됨"과 재가입 복구 화면 확인 못 함(인증번호를 읽을 수 없음, `verify1104b@example.com`은 발송 도메인 확인에 막힘)
  - 이어 가기: 백엔드를 가짜 메일 발송(`LoggingMailSender`)·`backend.log` 로그로 띄우고, 받을 수 있는 도메인의 탈퇴 보관 계정을 준비한 뒤 `/verify` → 통과하면 `/end`
  - 주의: 검증 중 로컬 백엔드가 실제 SMTP로 보내 `verify1113a@naver.com`(남의 주소일 수 있음)·`yay315@naver.com`으로 메일이 나갔다
- 백엔드 연결(SCR-ACC-001 오답 뒤 재발송): 오답 뒤 재발송 간격 해제(지금 로컬 백엔드는 바로 받아 줌, 확정 필요), 발송 응답에 `resendAvailableDt` 추가(백엔드 저장소에서 /start)
- 팀 알림(SCR-ACC-001): 명세 FN-ACC-001-06·42 "불일치는 입력칸과 AI로 안내" → 오답이면 인증번호 칸·타이머를 숨기고 이메일 칸 아래 AI 말풍선 + [다시 보내기]만 남김(백엔드 fail-limit=1)
- 코드 후보: 재전송 제한 알림("인증번호를 다시 보낼 수 없습니다…")이 남은 초가 0이 된 뒤에도 남는다. 휴대전화 칸 placeholder가 아직 `01012345678`

- 팀 알림(SCR-HOS-001): 명세 담당(sannabi1)에게 FN-HOS-001-07·08·21·22·26 "카카오맵 상세 새 탭" → "작은 창", 처음 검색 영역 "전주시" → "내 위치 주변(정확도 3km 이내), 아니면 전주시"로 바뀐다고 알린다
- 팀 알림(SCR-HOS-001): 명세 담당(sannabi1)에게 FN-HOS-001-06 정렬이 "추천순·거리순·이름순" → "거리순·이름순"(추천순은 카카오 정확도순이라 뺌), 검색창 아래 추천어를 지웠다고 알린다. FN-HOS-001-03 예시 "다리수술잘하는곳, 가까운곳"은 카카오 키워드 검색으로 찾을 수 없다
- 코드 후보(SCR-HOS-001): 검색창 새 검색은 지금 지도 영역이 아니라 처음 영역 기준이라, 지도를 옮긴 뒤 결과 0곳이면 머리 "전주시 전체"와 지도 위치가 다르다. 결과 0곳에서 지도를 옮긴 뒤 [처음 위치로]를 누르면 머리가 "지도를 움직였어요"로 남는다. `PlaceMap.jsx` `fitPlaces` 주석 "결과가 없으면 처음 영역"은 이제 [처음 위치로]에만 맞다
- 결정 필요(SCR-HOS-001): 위치를 못 받거나 정확도가 나쁘면 전주시로 간다. 서비스가 전국 대상이면 "내 위치 직접 정하기"(주소 입력·기억)를 따로 기획한다
- 코드 후보: 플레이스 위치를 찾는 동안 목록 머리에 "내 위치를 찾는 중 · 결과 0곳"이 보인다(결과가 오기 전 0곳). 검증 메모
- 코드 후보: `features/place/PlaceListItem.jsx` 9줄 주석 "카카오맵 업체 상세를 새 탭으로 연다"가 지금 동작(작은 창)과 다르다
- 코드 후보: 재가입 복구(`recovery/RecoveryForm.jsx`)의 [중복확인]은 빈 칸에서도 켜져 있다(가입 화면은 꺼짐). 맞출지 정한다
- 코드 후보: 휴대전화번호에 `+82`만 적으면 `normalizePhone`이 `0`이 되어 [중복확인]이 켜진다(누르면 형식 오류 안내). 검증 메모
- PR Breaking Changes(SCR-ACC-012 문구 정리): 공통 `features/member/shared/AuthField.jsx`가 `hasGuide`면 칸 아래 오류를 숨기고 AI 말풍선만 보인다(로그인·가입·복구·비밀번호 찾기·재설정 칸 오류 모두)
- 팀 알림: SJM `features/member/profile/PasswordChangeCard.jsx` 10줄 `PW_RULE` 끝에 마침표가 없다(가입·재설정은 마침표 있음)
- 팀 알림(문구 정리): 화면설계서 담당에게 설계서와 달라진 로그인·회원가입 문구 목록을 보낸다(PR 본문 Design Decisions와 같은 목록). PR Breaking Changes: `AuthNotice`에 `hasGuide`를 주면 색 상자 없이 AI 말풍선만 보인다
- 팀 알림: `docs/routes.md` 29줄 MAN-001 담당이 아직 YAY다. 담당 표(2026-11-08)대로 LJS로 고치도록 LJS에게 알린다

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
