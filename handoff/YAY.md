# YAY 핸드오프

## 지금 하는 것

SCR-ACC-020 회원탈퇴 안내 · 주양육자 탈퇴 반려동물 일괄 삭제 문구 — 진행 중 (팀원 요청 2026-11-24, 사람 확인 남음). `features/member/withdraw/WithdrawNotice.jsx` "탈퇴 전 꼭 확인해 주세요"에 "보관 기간이 지나면 등록한 반려동물과 기록이 삭제되고, 공동양육자와의 연동도 해제됩니다."(다른 줄 말투에 맞춰 "~됩니다"). 백엔드 연결(백엔드 저장소에서): `MemberPurgeService.purge`가 파기 성공 때 같은 트랜잭션에서 `member/domain/MemberPurgedEvent(mbrSn)` 발행, 받는 쪽(pet `purgeMemberPets`)은 `@EventListener`·`BEFORE_COMMIT`, `MemberPurgeJob` 회원별 예외 처리 여부 결정

랜딩 서비스 섹션(두 번째 섹션) · 스크롤이 여기서 멈춘 것 같다는 의견 — 진행 중 (직접 요청 2026-11-24, 사람 확인 남음). 섹션 높이를 `100dvh + 6×70vh`로 늘리고 안쪽을 sticky로 고정해 스크롤로 카드를 넘기던 방식을 없앰. `features/landing/ServiceSection.jsx`를 다른 섹션과 같은 높이(`min-h-[calc(100dvh-5rem)]`)로 바꾸고, 화면에 보이는 동안(`useInView` 0.3) 3초마다 자동으로 넘김(마우스를 올리면·동작 줄이기면 멈춤). 점·옆 카드·모바일 좌우 스와이프로 넘기면 10초 동안 자동 넘김을 멈춤(히어로와 같은 방식). 끝 카드 다음은 처음 카드로 원형으로 이어짐(`offsetOf`)

랜딩 · 들어오자마자 포트폴리오 안내 팝업 — 진행 중 (직접 요청 2026-11-24, 사람 확인 남음). 참고 이미지(에누리컷 체험 팝업)처럼 `features/landing/PortfolioModal.jsx`를 새로 만들어 `pages/landing/LandingPage.jsx`가 들어올 때마다 띄움. 팀 저장소 4개(frontend·backend·ai·character, `landingData.js` `GITHUB_REPOS`) 링크(새 창)와 [회원 로그인](`/login`, `?redirect=` 유지)·[관리자 로그인](`/login?method=email`, 관리자는 로그인 뒤 `getLoginDestination`이 `/admin`으로 보냄) 카드. 비회원 진행은 넣지 않음(요청). 데모 계정 자동 입력은 하지 않음(공개 저장소라 비밀번호를 코드에 넣지 않음). lucide 1.x에 GitHub 아이콘이 없어 SVG를 직접 그림. 같은 날 "더 예쁘고 랜딩과 맞게" 요청으로 디자인 변경: 위에 히어로 사진(`HERO_SLIDES[1]`) 배너(어두운 막·흰 로고·#5cd1d6 라벨·굵은 제목·히어로 화살표 같은 흰 원 ✕), 로그인 카드는 20px 둥근 카드(회원 `brand-600` 초록, 관리자 #f7f7f4)에 아이콘 원·화살표, GitHub는 랜딩 헤더 [로그인] 같은 알약 버튼(PC 4칸·모바일 2칸), 묶음 라벨은 `SectionTitle`처럼 영어 대문자(#2c6669). `Modal` `isLarge isAutoHeight isCloseIconHidden`으로 본문 여백을 직접 둠. 이어서 요청으로 사진 배너를 키우고(PC 320·모바일 260px) 소개·카드 문구를 줄임. 로그인 화면처럼 사진을 모달 가장자리까지 꽉 채우려고 공용 `components/Modal.jsx`에 `isHeaderHidden`(제목 줄을 화면에서만 숨김, 화면 읽기용 제목 유지) 옵션을 추가함(기존 모달에는 영향 없음). 이어서 데모 계정 미리 채우기: 카드를 누르면 `/login?method=email`(회원은 `?redirect=` 유지)로 가며 이동 state `demo`(member·admin)를 넘기고, `pages/auth/LoginPage.jsx`가 `api/env.js` `DEMO_ACCOUNTS`(`VITE_DEMO_MEMBER_EMAIL`·`_PASSWORD`, `VITE_DEMO_ADMIN_EMAIL`·`_PASSWORD`)를 `EmailLoginForm` `initialValues` → `useEmailLogin(onSuccess, initial)`로 넘겨 칸을 채움. 로그인은 사람이 [로그인]을 직접 누름(팝업 아래 안내 문구와 맞음). 값은 배포 환경·각자 `.env.local`에만(공개값이지만 저장소에 적지 않음). 로컬은 테스트 회원 계정으로 채워 확인(채움 → [로그인] → `/main`). 이어서 요청으로 모바일도 아래 시트가 아니라 가운데 팝업으로: 공용 `Modal`에 `isSheetDisabled`(760px 미만에서도 시트로 바꾸지 않음, 손잡이·끌어서 닫기 없음) 추가, 모바일 사진 높이 180px로 줄여 390×844에서 안쪽 스크롤 없이 들어감. 작은 화면(760px 미만)에서 로그인 카드·GitHub 버튼 크기를 줄임. 아이폰(iOS Safari·Chrome)에서 배경만 보이고 팝업이 안 보이던 버그: 실기기 진단으로 dialog 높이 0px 확인. 공용 `Modal`의 `isAutoHeight` 본문이 `flex-1`(0에서 시작)이라 `h-fit` 모달에서 iOS WebKit이 높이를 0으로 잡음 → `flex-auto`로 고침(같은 옵션을 쓰는 `ScheduleModal`·건강 일지 `FormModal`·`PetFormModal`에도 적용됨. PC 크롬·PC WebKit은 원래도 정상이라 재현 안 됨). 모바일 팝업이 아이폰 크롬(402×684)에서 잘려 모바일만 사진 140px·문구 13px·여백을 줄임(573px). 휴대폰으로 로컬 접속(http://PC-IP:5173) 때 로그인을 누르면 빈 화면: 보안 연결이 아니면 `crypto.randomUUID`가 없어 `useSignup` 등 15곳이 그리자마자 오류. `utils/randomUUIDPolyfill.js`(없을 때만 `getRandomValues`로 UUID v4)를 `main.jsx` 맨 처음에 불러 해결(PC WebKit 재현 → 고친 뒤 로그인 화면 정상). 남은 일: 배포 환경 데모 계정 값, 관리자 데모 계정을 만들고 백엔드에서 변경을 막을지 팀 결정

SNS 로그인·마이페이지 연동 · 네이버 제외(사업자 번호가 있어야 검수 가능) — 진행 중 (직접 요청 2026-11-23, 사람 확인 남음). 로그인 버튼(`login/SnsLoginButtons.jsx`)과 마이페이지 SNS 계정 연동 줄(`profile/SnsLinkCard.jsx`)에서 네이버를 빼고, 인가 설정(`login/snsAuth.js`)·`api/env.js`·`.env.example`의 `VITE_NAVER_CLIENT_ID`, 연동 요청의 네이버 전용 state(`api.js` `linkSns`)를 지움. 탈퇴 완료 안내 문구는 "카카오·구글 자체 계정"으로, `docs/routes.md` 콜백 provider에서 naver 뺌. 이미 있는 네이버 가입 회원 표시(`shared/snsCodes.js`·`SnsLogoChip`·`NaverLogo`·관리자 가입 경로 필터)는 서버 코드가 남아 있어 그대로 둠. 남은 일: TC 문서(`docs/tc/TC_로그인·회원가입.md` FN-ACC-002-09 등, `TC_마이페이지.md` TC-MYP-040-14-01)의 네이버 행 정리, 백엔드 `app.sns.naver` 정리는 백엔드 저장소에서

로그인·회원가입·비밀번호 찾기 화면 피드백 반영 — 진행 중 (직접 요청 2026-11-20, 사람 확인 남음). (1) 비밀번호 찾기·재설정도 이메일 로그인처럼 넓은 칸(`layouts/AuthLayout.jsx` `isWide`)으로 해 입력칸 너비 통일 (2) 비밀번호 찾기 "이메일 아이디"·회원가입 "이메일 (로그인 아이디)" 칸 이름을 "아이디(이메일)"로 (3) 비밀번호 찾기에 뒤로가기(이메일 단계 → 로그인, 인증번호·SNS 단계 → 이메일 다시 입력) (4) 회원가입 이메일 단계에서 이미 가입된 이메일이면 칸 아래 오류·새 버튼 대신 기존 안내 문구 자리에 오류 문구, [다음] 자리에 [기존 가입 방법으로 로그인], "이미 회원이신가요? 로그인" 줄 숨김 (5) 비밀번호 찾기 인증번호 단계의 "인증할 이메일" 요약 상자 대신 읽기 전용 이메일 칸 + [이메일 변경] 버튼(줄바꿈 문제도 해결) (6) [다시 보내기]·[인증번호 확인] 같은 너비 (7) 로그인 실패(LOGIN_FAILED) 문구를 "이메일 또는 비밀번호를 확인해 주세요."로(프론트에서 덮어씀)

로그인·회원가입·비밀번호 찾기/재설정·재가입 복구 · 화면마다 위치가 다르던 주 버튼을 모두 카드 맨 아래로 — 진행 중 (직접 요청 2026-11-20, 사람 확인 남음). `features/member/shared/AuthActions.jsx` 새로 만듦(`mt-auto`), `AuthCard`가 칸 높이를 채움(`flex-1 flex-col`), 각 폼·단계·`StepMotion`(`pages/auth/LoginPage.jsx` 포함)을 `flex-1 flex-col`로 이어 주 버튼과 그 아래 링크 줄을 맨 아래에 둠. 로그인 방법 선택은 SNS·이메일 버튼 묶음 전체를 아래로. 같은 날 요청(가운데 여백이 너무 많음)으로 `shared/AuthBody.jsx`(위아래 `my-auto`)를 만들어 제목 아래 내용을 제목과 버튼 사이 가운데로 옮기고 `AuthActions`의 `mt-auto`는 뺌. 로그인 방법 선택은 SNS·이메일 버튼을 내용으로 보고 가운데에, 회원가입 링크 줄만 아래에. 이어서 "타이틀까지 가운데" 요청으로 제목+내용 묶음을 버튼 위 공간 가운데로: `AuthCard`가 제목 위에 `grow` 빈칸을 두고(`isCentered`, 완료 화면 3개는 false), `AuthBody`와 폼·단계 `StepMotion`을 `flex grow flex-col`로 해 남는 칸을 반씩 나눔. 이제 필요 없어진 `AuthHeading`의 모바일 제목 아래 여백(`spacing` wide·step·stepEmail, 12vh)을 지움. 모바일은 "너무 가운데" 요청으로 위 빈칸 비율을 줄여(`max-md:grow-[0.25]`, 위:아래 1:4) 묶음을 위쪽에 가깝게(PC는 정가운데 그대로). 이어서 요청: 모바일 제목 아래 간격 20px → 36px(`AuthHeading` `max-md:mb-9`), 로그인 방법 선택의 [이메일로 로그인하기](초록)와 "또는"을 모바일에서만 맨 아래(PC는 SNS·이메일 한 묶음 가운데 그대로, `AuthBody md:grow-0`·`AuthActions md:grow`), 로그인 방법 선택은 모바일에서 정가운데(`AuthCard spacing="center"`, 다른 화면은 `spacing` normal·sparse). 모바일 제목 위 빈칸은 남는 칸 비율이 아니라 화면 높이 비율로 고정(normal 6dvh, sparse·center 16dvh)해서 [인증번호 보내기]로 칸이 생겨도 제목이 올라가지 않고 아래로만 늘어남. 회원가입 이메일 인증은 인증번호 칸이 생기면 꽉 차서 sparse에서 빼 위쪽(normal)으로. (그 뒤 단계 표시를 모바일 제목 위로 올린 것과 참고 이미지처럼 모바일 제목을 위에 붙인 것은 "전전으로 되돌려줘" 요청으로 되돌림), 이메일 인증·휴대전화·비밀번호 찾기는 모바일에서 제목과 입력칸 사이 32px 더(`AuthBody max-md:pt-8`), 내용이 적은 회원가입 이메일·휴대전화 단계와 비밀번호 찾기(이메일·인증번호 단계)는 `AuthCard isSparse`로 모바일 위 빈칸 비율 0.6(조금 더 가운데)

회원가입 완료·재가입 복구 완료 화면 · 내용이 위에 몰려 있던 것을 제목 묶음은 세로·가로 가운데, [로그인으로] 버튼은 맨 아래로 — 진행 중 (직접 요청 2026-11-20, 사람 확인 남음). `features/member/signup/SignupForm.jsx` `SignupComplete`, `recovery/RecoveryForm.jsx` 완료 단계, `shared/AuthCard.jsx`·`components/StepMotion.jsx`에 `className` prop(칸 높이를 채우려고). 복구 완료의 체크 원은 제목 위로 옮김

랜딩 서비스 섹션(두 번째 섹션) · 개인 브랜치 `YAY-landing-cards`의 커버플로 카드를 YAY에 적용 — 진행 중 (직접 요청 2026-11-20, 사람 확인 남음). `features/landing/ServiceSection.jsx`·`landingData.js`·`assets/landing/service/card1~7.webp`를 그 브랜치(4a729ab) 그대로 가져옴. 같은 날 요청으로 초록 뱃지 문구를 영어 "All-in-one Pet Care"로, 굵기를 semibold → normal로. 이어서 랜딩 섹션 머리를 통일: `features/landing/SectionTitle.jsx` 새로 만들어 서비스·과정·파트너·데이터·FAQ가 같은 영어 대문자 라벨(#2c6669)·제목(28/40/48px normal)·설명(14/18/20px)을 씀(서비스 알약 뱃지 → 글자 라벨, 파트너 라벨 "With pawever"·FAQ 라벨 "FAQ"와 제목 "자주 묻는 질문" 새로 넣음). 배경은 흰색과 #f7f7f4 두 가지를 번갈아(서비스 흰·과정 #f7f7f4·파트너 흰·데이터 #f7f7f4·FAQ 흰, FAQ 항목 바탕도 흰색)

로그인·회원가입 · 유효성 검사 오류를 AI 말풍선 대신 다른 화면과 같은 글자 안내로 — 진행 중 (직접 요청 2026-11-20, 사람 확인 남음). `features/member/shared/AuthField.jsx`(오류를 공용 `FieldError`로)·`AuthNotice.jsx`·`login/CaptchaBlock.jsx`에서 `AiErrorGuide`를 빼고 `hasGuide`·`guideTarget`을 지움(같은 부품을 쓰는 비밀번호 찾기·재설정·재가입 복구·탈퇴 확인 모달도 같이 바뀜). 마이페이지 탈퇴 안내(`WithdrawNotice`·`WithdrawResult`)의 말풍선은 그대로

SCR-HOS-001 플레이스 · [이 지도 영역에서 다시 검색] 때 핀이 잠깐 별 핀으로 바뀌었다가 초록 번호 핀으로 돌아오는 깜빡임 — 진행 중 (직접 요청 2026-11-20, 사람 확인 남음). 새 영역 결과를 받는 동안 결과가 비어 영역 안 즐겨찾기가 모두 별 핀(`strayFavorites`)으로 그려지던 것. `pages/place/PlacePage.jsx`에서 결과를 받기 전(`query.isSuccess` 아님)에는 별 핀을 그리지 않고 고른 즐겨찾기만 남김. 같은 날 요청으로 검색 결과에 든 즐겨찾기도 처음 디자인 그대로(흰 테두리·가로 100%) 연노랑 바탕·초록 번호 핀으로(고르면 다른 핀처럼 짙은 색). `PlacePin.jsx` `isFavorite` prop, `PlaceMap.jsx`, `PlacePage.jsx`가 `bookmarkSnOf`로 넘김

SCR-HOS-001 플레이스 · 다시 검색한 영역 밖 즐겨찾기를 누르면 그 업체 핀이 안 뜸 — 진행 중 (직접 요청 2026-11-19, 사람 확인 남음). `pages/place/PlacePage.jsx` `strayFavorites`가 재검색 영역 밖 즐겨찾기를 빼서 지도만 옮겨 가고 핀이 없었음. 고른 즐겨찾기는 영역 밖이어도 별 핀으로 보이게 함. 2026-11-19 요청으로 아래 핀 디자인 변경(노란색 통일·가로 75%·별 16px·결과 속 즐겨찾기 노란 번호)은 모두 전으로 되돌림(`PlacePin.jsx`·`PlaceMap.jsx` 원래대로, 버그 수정만 남김). 이어서 11-16 추가-4·5(핀 흰 테두리 제거·가로 85%)도 되돌려 `PlacePin.jsx`를 11-03(5c37998) 모습(흰 테두리·가로 100%)으로. 되돌리기 전 기록: 같은 날 요청으로 즐겨찾기 별 핀은 골라도 짙은 색으로 바꾸지 않고 노란색 그대로 크게만 보이게 함(`features/place/PlacePin.jsx`). 이어서 즐겨찾기 핀을 노란색으로만: 바탕을 목록 별과 같은 #f5c518, 별을 흰색으로(초록 별 뺌). 핀 물방울 가로를 85% → 75%로 더 좁힘(세로·글자 그대로, 번호 핀·즐겨찾기 핀 모두). 즐겨찾기 핀 안 별을 20px → 16px로 줄임. 검색 결과에 있는 즐겨찾기도 번호 핀을 노란색(흰 번호)으로, 골라도 노란색 그대로(`PlaceMap.jsx` `isFavorite`, `PlacePage.jsx`가 `bookmarkSnOf`로 넘김)

비밀번호 찾기 · [로그인으로]를 누르면 로그인 첫 화면(방법 선택)으로 — 진행 중 (직접 요청 2026-11-19, 사람 확인 남음). `pages/auth/PasswordFindPage.jsx` `onBackToLogin`을 `?method=email` 추가 이동에서 `PATHS.LOGIN` replace 이동으로 바꿔, 뒤로가기가 비밀번호 찾기로 돌아오는 반복을 없앰

파비콘 · 브라우저 탭 아이콘을 냥멍케어 발자국 로고로 — 진행 중 (직접 요청 2026-11-18, 사람 확인 남음). `public/favicon.svg`(Vite 기본 번개 아이콘)를 받은 발자국 로고 SVG(밝은 초록 #20915C 원 + 흰 발가락 4개 발자국, 메인 로고와 같은 초록)로 바꿈(앞서 넣은 첫 로고·발가락 3개 판·v2를 이 판으로 대체). `index.html`은 이미 `/favicon.svg`를 가리켜 그대로. 같은 날 요청으로 `src/assets/nm_logo.svg`(사용자 헤더·랜딩 헤더·인증·관리자 로고)를 받은 "pawever." 글자 로고(ever. 초록 #20915C 판)로 바꿈(viewBox만 글자 둘레로 잘라 냄). 흰 로고 `logo-white.svg`(랜딩 헤더 어두운 배경·인증 화면 사진 칸)도 받은 흰색 "pawever." 로고로 바꿈(viewBox 잘라 냄). 랜딩 푸터 왼쪽 로고는 대체 없이 뺐고(`LandingFooter.jsx`, 반려동물 그림·안내 문구만 가운데), `MainLogo.svg`는 이제 아무 데서도 안 쓴다. 플레이스 모바일 [이 지도 영역에서 다시 검색]이 두 줄로 꺾일 때 "다/시"가 갈라지지 않게 단어 단위로 꺾음(`PlaceMap.jsx` `break-keep`). 랜딩 섹션(서비스·과정·파트너·데이터·FAQ)을 화면 높이에서 헤더 80px를 뺀 높이 이상으로 늘림(`min-h-[calc(100dvh-5rem)]`, PC는 원래 높이와 큰 쪽). 데이터 섹션 영어 제목 "The NYANGMUNGCARE DATA" → "The PAWEVER DATA". 랜딩 헤더 메뉴로 섹션을 옮길 때는 헤더를 숨기지 않음(`LandingHeader.jsx` `goTo`, scrollend·휠·터치·키 입력에서 다시 숨김 켬. PC 메뉴도 `goTo`를 거치게 함). 랜딩 헤더 로고를 누르면 맨 위 히어로로 부드럽게 올라가고 슬라이드가 첫 장부터 다시 시작(`LandingHeader.jsx` `onHome`, `pages/landing/LandingPage.jsx` `HeroSlider key`). 랜딩(`features/landing/`)의 글자 "냥멍케어"·"냥멍 데이터"를 "pawever"·"pawever 데이터"로 바꿈(문구·alt·aria-label 18곳)

SCR-HOS-001 플레이스 · 지도 범위 한 번에 받고 목록 안에서 거르기 — 끝남 (승인 2026-11-16 11:50, 검증 통과, 사람 확인 2026-11-16, PR #386). `whole=true`로 범위 전체를 한 번 받고 상호명·주소 거르기와 거리순·이름순은 받은 목록 안에서([검색]도 서버를 부르지 않음). 추가-1 목록 항목을 누르면 지도 이동·팝업, 추가-2 업체 사진 칸 제거, 추가-3 즐겨찾기 별을 노란 별만, 추가-4·5 핀 흰 테두리 제거·가로 85%, 추가-8 카테고리 탭 선택 배경 미끄러지기(추가-6 목록·핀·팝업 모션은 뺌), 추가-7 지도 부드러운 이동은 되돌림, 추가-9 [일반 지도 | 스카이뷰] 선택 배경 미끄러지기

문서 정리 · 인증 이동 규칙을 지금 코드에 맞춤 — 진행 중 (승인 2026-10-27 16:29, 검증 통과, 사람 확인 남음, 커밋 3b31971). `docs/convention/api.md`·`docs/convention/pages.md`·`AGENTS.md` 2번. 결정: `skipAuthRedirect`는 원칙으로, AGENTS.md 2번 단서 삭제

두 화면은 PR #61(`YAY` → `develop`)로 올렸다. 기준: 로그인·회원가입_화면설계서_v0.10_20260930, 디자인: 시안 폴더(저장소 밖) `nmcare-design-v5`의 `acc.css`·`acc.js`. 가짜 규칙: 비밀번호 `wrong`은 불일치(5번 실패하면 보안코드), 인증번호 `123456` 일반·`234567` SNS 전용·`345678` 미가입·`456789` 탈퇴, 이메일 `fail@example.com`은 발송 실패, 새 비밀번호에 `fail`이 있으면 저장 실패. 로그인과 인증 화면이 같이 쓰는 컴포넌트는 `features/member/shared/Auth*.jsx`

## 다음에 할 것

- 연결 남음: SCR-HOS-001 실제 서버 확인 (백엔드 PR #246 `whole=true` develop 병합 뒤, YAY). 로컬 백엔드로는 확인함
- 대기: SCR-ACC-002 SNS 로그인 같은 이메일 중복 안내 문구(마일스톤 대기 절). PR #386 병합 뒤 `/start`
- 팀 알림(SCR-HOS-001): 명세 담당(sannabi1)에게 FN-HOS-001-03 [검색]은 지역명 서버 검색이 아니라 받은 지도 범위 안 상호명·주소 거르기, 목록 카드를 누르면 카카오 상세가 아니라 지도 이동·팝업(상세는 팝업 [상세보기]), 목록 업체 사진 칸 없음을 알린다
- 코드 후보(SCR-HOS-001): 카카오 상세 주소가 없는 장소(공공데이터·관리자 등록, 시드 데이터 다수)는 팝업 [상세보기]가 좌표 지도로 열려 길찾기처럼 보인다. 카카오맵 검색으로 열거나 버튼을 숨길지 정한다
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
