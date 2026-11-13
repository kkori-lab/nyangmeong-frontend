# YAY 핸드오프

## 지금 하는 것

SCR-ACC-001 회원가입 · 인증 완료 박스와 가입 완료 화면 보강 — 되돌림 (직접 요청 2026-11-13, 검증 1회차 통과 뒤 사람이 되돌리기로 함). 코드 변경 없음

랜딩 · 서비스 소개 섹션을 제목 + 가로 카드 줄로, 메뉴 이동 중 헤더 유지 — 진행 중 (직접 요청 2026-11-13, 사람 확인 남음). 카드 줄은 자동으로 흐른다(마퀴, 화면 밖이면 멈춤, 동작 줄이기 설정이면 멈춤). 추가-1 세로 스크롤 연동(sticky) → 자동 마퀴로. 카드 이미지 6장은 `tester@nyangmeong.dev` 화면을 캡처(`src/assets/landing/service/*.webp`, 옛 card1~6 삭제). 설명 문단·[자세히 알아보기] 버튼은 시안에 없어 뺐다. 헤더는 메뉴로 이동하는 스크롤이 끝날 때(`scrollend`)까지 숨기지 않는다

SCR-HOS-001 플레이스 · 이전 검색어가 남는 문제와 빈 검색칸 — 끝남 (직접 요청, 사람 확인 2026-11-13). 입력칸을 지우고 검색하면 카테고리 전체로 찾고, [이 지도에서 다시 검색]은 입력칸 글자 기준(비었거나 카테고리 이름이면 검색어 없이). 처음 검색칸은 비우고, 검색어가 없으면 결과 머리 검색어 표시를 숨김

SCR-ACC-001 회원가입 (이메일) · 휴대전화 하이픈 표시·인증번호 오답 뒤 재발송 — 끝남 (승인 2026-11-13 10:28, 검증 4회차 확인 못 함 있음(연결 남음만), 사람 확인 2026-11-13). 가입·SNS 가입 확인·재가입 복구 휴대전화 칸을 입력 중 010-1234-5678로 표시(서버에는 숫자만), 인증번호 오답이면 칸·타이머를 숨기고 이메일 칸 아래 AI 말풍선과 [다시 보내기 (N초)]만 남김(가입·비밀번호 찾기·복구). 추가-1 오답 말풍선을 이메일 칸 아래로

문서 정리 · 인증 이동 규칙을 지금 코드에 맞춤 — 진행 중 (승인 2026-10-27 16:29, 검증 통과, 사람 확인 남음, 커밋 3b31971). `docs/convention/api.md`·`docs/convention/pages.md`·`AGENTS.md` 2번. 결정: `skipAuthRedirect`는 원칙으로, AGENTS.md 2번 단서 삭제

두 화면은 PR #61(`YAY` → `develop`)로 올렸다. 기준: 로그인·회원가입_화면설계서_v0.10_20260930, 디자인: 시안 폴더(저장소 밖) `nmcare-design-v5`의 `acc.css`·`acc.js`. 가짜 규칙: 비밀번호 `wrong`은 불일치(5번 실패하면 보안코드), 인증번호 `123456` 일반·`234567` SNS 전용·`345678` 미가입·`456789` 탈퇴, 이메일 `fail@example.com`은 발송 실패, 새 비밀번호에 `fail`이 있으면 저장 실패. 로그인과 인증 화면이 같이 쓰는 컴포넌트는 `features/member/shared/Auth*.jsx`

## 다음에 할 것

- 연결 남음: FN-ACC-001-04·06, SCR-ACC-011 인증, FN-ACC-001-41 (백엔드 연결 발송 응답에 `resendAvailableDt`, 백엔드 저장소에서 /start. 백엔드 마일스톤에 대기 절 넣음). 오답 뒤 재발송 간격 해제는 백엔드에서 끝
- 주의: 2026-11-13 검증 중 로컬 백엔드가 실제 SMTP로 보내 `verify1113a@naver.com`(남의 주소일 수 있음)·`yay315@naver.com`으로 인증 메일이 나갔다. 로컬 검증은 `app.mail.client=log`로
- 팀 알림(SCR-ACC-001): 명세 FN-ACC-001-06·42 "불일치는 입력칸과 AI로 안내" → 오답이면 인증번호 칸·타이머를 숨기고 이메일 칸 아래 AI 말풍선 + [다시 보내기]만 남김(백엔드 fail-limit=1)
- 코드 후보: 재전송 제한 알림("인증번호를 다시 보낼 수 없습니다…")이 남은 초가 0이 된 뒤에도 남는다. 휴대전화 칸 placeholder가 아직 `01012345678`

- 팀 알림(SCR-HOS-001): 명세 담당(sannabi1)에게 FN-HOS-001-07·08·21·22·26 "카카오맵 상세 새 탭" → "작은 창", 처음 검색 영역 "전주시" → "내 위치 주변(정확도 3km 이내), 아니면 전주시"로 바뀐다고 알린다
- 팀 알림(SCR-HOS-001): 명세 담당(sannabi1)에게 FN-HOS-001-03·19 지도 재검색은 "검색어 유지"가 아니라 입력칸 글자 기준, 처음 검색칸은 카테고리 이름 대신 빈칸이라고 알린다
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
