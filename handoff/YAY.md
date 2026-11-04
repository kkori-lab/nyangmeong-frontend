# YAY 핸드오프

## 지금 하는 것

SCR-HOS-001 플레이스 · 장소 검색·즐겨찾기 API 연결 — 끝남 (승인 2026-11-03 11:10, 검증 통과(확인 못 함 없음, 연결 남음 FN-HOS-001-33), 사람 확인 2026-11-03). `features/place/` 더미를 `GET /places`(카테고리 `PLCC0001~5`·키워드·지도 범위·중앙·정렬, 15건씩 최대 45건 무한 스크롤)와 `/place-bookmarks`(목록·저장·해제)로 바꿨다. 결정: 결과 카드·병원명·상세보기는 문서대로 카카오맵 상세(`kakaoUrlPath`)를 새 탭으로 열고, 지도 선택은 핀만. 영업시간·영업 상태·태그는 서버에 없어 뺐다. 무한 스크롤은 공용 `useInView`가 스크롤 영역을 root로 못 받아 `PlacePanel.jsx`가 IntersectionObserver를 직접 쓴다. 즐겨찾기 저장·해제는 즐겨찾기 목록만 다시 받는다(별은 그 목록 기준). 확인 환경: `VITE_KAKAO_MAP_KEY`는 카카오 JavaScript 키여야 한다(REST 키면 지도 SDK 401)

문서 정리 · 인증 이동 규칙을 지금 코드에 맞춤 — 진행 중 (승인 2026-10-27 16:29, 검증 통과, 사람 확인 남음, 커밋 3b31971). `docs/convention/api.md`·`docs/convention/pages.md`·`AGENTS.md` 2번. 결정: `skipAuthRedirect`는 원칙으로, AGENTS.md 2번 단서 삭제

두 화면은 PR #61(`YAY` → `develop`)로 올렸다. 기준: 로그인·회원가입_화면설계서_v0.10_20260930, 디자인: 시안 폴더(저장소 밖) `nmcare-design-v5`의 `acc.css`·`acc.js`. 가짜 규칙: 비밀번호 `wrong`은 불일치(5번 실패하면 보안코드), 인증번호 `123456` 일반·`234567` SNS 전용·`345678` 미가입·`456789` 탈퇴, 이메일 `fail@example.com`은 발송 실패, 새 비밀번호에 `fail`이 있으면 저장 실패. 로그인과 인증 화면이 같이 쓰는 컴포넌트는 `features/member/shared/Auth*.jsx`

새 의존성: 없음

### 추가 요청

| 추가-1 | `features/member/signup/signupMessages.js`·`signup/SignupForm.jsx`·`password/passwordMessages.js` | 명령: `yarn -s lint`, `yarn -s build` / 화면: 회원가입 비밀번호 단계 부제·도움말·오류와 비밀번호 재설정 도움말·오류가 "영문과 숫자를 함께 써서 8~64자로 입력해 주세요(공백 제외)" | 요청 2026-11-04 12:32 "공용 isValidPassword가 서버 규칙(영문+숫자, 공백 없는 ASCII 8~64자)으로 바뀌었으니 가입·재설정 안내 문구를 마이페이지 문구에 맞춘다" |

## 다음에 할 것

- 중단: SCR-ACC-001 회원가입 · 가입·인증·닉네임 API 연결 (승인 2026-11-03 10:50, 2026-11-03 플레이스 API 연결을 먼저 하려고 멈춤). 코드(`features/member/` 약관 `GET /terms`·`shared/TermsModal.jsx`, 발송·확인 `USRC0010`, 번호 `checkPhoneAvailability`, 가입 `POST /members`(`USRC0006`·`certNo`·`trmsAgres`·`idmptDmndId`), 닉네임 모달 `GET /members/nickname-availability`·`PATCH /members/me/nickname`, 가입 비밀번호 `isValidJoinPassword`). lint·build 통과. 검증 1회차는 환경 때문에 실패: `backend.log`가 없어 인증번호를 못 읽음, 탈퇴 보관 계정 없음(회원 204가 정상). 코드는 `git stash`("SCR-ACC-001 회원가입 연결 중단분", 새 파일 포함)에 보관했다. `git stash pop`으로 되돌린다. 다시 할 때 백엔드를 로그 파일로 띄우고 회원 204를 탈퇴 보관으로 되돌린 뒤 `/start SCR-ACC-001`로 이어 간다. 서버 약관에는 만 14세 항목이 없다(SERVICE·PRIVACY·LOCATION·MARKETING)
- 연결 남음: FN-HOS-001-33 플레이스 로그인 필수. `routes/AppRoutes.jsx`의 `<ProtectedRoute />` 아래에 `pick('bare', 'member')` 조립을 넣는 별도 PR을 올린 뒤 `routes/domains/place/placeRoutes.js`를 `auth: 'member'`로 바꾼다(YAY)
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
