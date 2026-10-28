# 냥멍케어 화면 URL 초안

2026-10-18 · 이진성 · 초안(팀 합의 전)

`src/routes/paths.js`에 넣을 화면 ID → URL. 반영한 뒤에는 `paths.js`가 정본이다.

2026-10-21: 1장의 URL을 `paths.js`에 모두 넣었다(구획은 `routes/domains` 폴더와 같음). 펫이야기 작성·수정은 `/community/posts/new`·`/community/posts/:pstSn/edit`로 해석했다(KSJ 확인). 새 URL은 이 문서를 먼저 고치고 팀에 알린 뒤 `paths.js`에 넣는다.

## 0. 규칙

| 항목 | 규칙 |
| --- | --- |
| 1 URL = 1 페이지 | 모달·드롭다운·화면 안 단계는 URL 없음 (프론트 `AGENTS.md`) |
| 이름 | 소문자 kebab-case |
| 단수·복수 | 뒤에 `/:id`가 붙으면 복수(`/notices`), 하나뿐이면 단수(`/mypage`, `/main`) |
| 상세·작성·수정 | `/:<PK>`(API 경로 변수와 같은 이름), `/new`, `/:<PK>/edit` |
| 탭·필터 | 쿼리(`?category=hospital`) (AIM-004-10) |
| 로그인 복귀 | `?redirect=` (COM-003-02) |
| AI 대상 | AI 서버가 쓰는 URL. 바꾸면 AI 매핑도 같이 고친다 (AIM-004-09) |

근거: 기능명세서 9종(10-16, 화면 54개), AI매니저 「부록_라우팅매핑표」, 현재 `paths.js`(기존 16개 경로 유지). 괄호 안은 근거 기능 ID(`FN-` 생략) 또는 매핑표 행 번호다.

## 1. URL 있는 화면

| 화면 ID | 화면 | URL | 담당 | AI |
| --- | --- | --- | --- | --- |
| MAN-002 | 랜딩 | `/` (`?redirect=`). 로그인 상태면 `/main` (COM-003-08) | YAY | |
| MAN-001 | 메인 | `/main`. 복귀 경로 없을 때 목적지 (COM-003-06) | YAY | ✓ |
| ACC-002 | 로그인 | `/login` (`?redirect=`) | YAY | |
| ACC-001 | 회원가입 | `/signup`. 1~4단계·SNS 가입·재가입 복구는 같은 URL | YAY | |
| ACC-011 | 비밀번호 찾기 | `/password/find` | YAY | |
| ACC-012 | 비밀번호 재설정 | `/password/reset`. 비밀번호를 URL에 노출하지 않음 (ACC-012-08) | YAY | |
| ACC-020 | 회원탈퇴 | `/mypage/withdraw` | YAY | |
| COM-008 | 알림 설정 | `/settings/notifications` | LJS | ✓ |
| AIM-011 | AI 대화창(새 창) | `/ai` (COM-007 런처가 엶) | LJS | |
| COM-009 · CMU-005 | 채팅(새 창) | `/chat` (`?otoChatRoomSn=`). 새 창 확정 (기능 분배 3.1절 20번) | LJS | |
| HLT-011 | 종합 건강기록 | `/health` | JAJ | ✓ |
| HLT-002 | 건강 일지 | `/health/diary` (매핑표 13행) | JAJ | ✓ |
| HLT-003 | 케어 캘린더 | `/health/calendar` (매핑표 11·12행) | JAJ | ✓ |
| HLT-005 | 검진상세 | `/health/checkups/:ckupRcdSn`. 단독 진입 불가 (매핑표 41행) | JAJ | |
| HLT-007 | 검사 수치 입력 | `/health/checkups/:ckupRcdSn/inspections`. 검진상세 경유 (매핑표 42행) | JAJ | |
| HOS-001 | 플레이스 | `/places` (`?category=hospital·beauty·goods·pet-friendly·hotel`) (매핑표 2·17~20행) | YAY | ✓ |
| CMU-001 | 펫이야기 | `/community` · `/community/posts/:pstSn` · `/new` · `/:pstSn/edit`. 남이 수정 URL로 오면 상세로 (CMU-001-15) | KSJ | ✓ 목록 |
| CMU-002 | 실종센터 | `/community/missing` · `/:lostTpofSn` · `/new` · `/:lostTpofSn/edit`. 남이 수정 URL로 오면 상세로 (CMU-002-06) | KSJ | ✓ 목록 |
| CMU-003 | 펫뉴스 | `/community/news` · `/:newsSn` | KSJ | ✓ 목록 |
| CMU-004 | 펫돌봄 | `/community/petcare` · `/new` · `/:petPrtcRcrtSn` · `/:petPrtcRcrtSn/edit` | KSJ | ✓ 목록 |
| CSC-001 | 공지사항 | `/notices` · `/:ntcMttrSn` | KSJ | ✓ 목록 |
| CSC-002 | FAQ | `/faqs`. AI 폴백 2회 실패 시 이동 (AIM-005-05) | KSJ | ✓ |
| CSC-003 | 1:1 문의 | `/inquiries` · `/new` · `/:otoInqrySn` | KSJ | |
| MYP-001 | 마이페이지 홈 | `/mypage` | SJM | ✓ |
| MYP-002 | 반려동물 목록 | `/mypage/pets`. AI의 "반려동물 등록"도 여기로 (매핑표 26행) | SJM | ✓ |
| MYP-004 | 공동양육자 | `/mypage/caregivers` | SJM | ✓ |
| MYP-005 (5-3) | 공동양육 초대 수락 | `/mypage/invitations/:invitationToken`. 초대 링크·알림으로 들어옴 | SJM | |
| MYP-010 | 픽셀 캐릭터 | `/mypage/characters` | SJM | ✓ |
| MYP-020 | 포인트·케어미션 | `/mypage/points` | SJM | ✓ |
| MYP-030 | 가계부 | `/mypage/expenses` | SJM | ✓ |
| MYP-030 (30-2) | 가계부 전체 내역 | `/mypage/expenses/all` (`?month=YYYY-MM`) | SJM | |
| MYP-040 | 회원정보 수정 | `/mypage/profile` | SJM | ✓ |

화면 ID 앞의 `SCR-`는 생략했다.

## 2. URL 없는 화면

| 형태 | 화면 ID |
| --- | --- |
| 레이아웃·흐름 | COM-002(레이아웃), COM-003(인증 진입) |
| 드롭다운 | COM-004(알림), COM-005(프로필), COM-006(GNB 2차 메뉴) |
| 버튼 | COM-007(AI 런처 → `/ai` 새 창) |
| `/ai` 안의 상태 | AIM-001·002·004·005·012 |
| 발송물 | AIM-006(사전 알림 메일·인앱) |
| 모달 | AIM-008·009·010(영수증, 건강 일지에서), MYP-011(아이템 상점) |
| 모달 추정 | MYP-003·005(5-1·5-2·5-4)·006·031 |
| `/places`의 탭 | PLC-001~004 |

## 3. 다른 곳에서 거는 링크

| 보내는 곳 | 대상 → URL |
| --- | --- |
| 알림 클릭 (COM-004-07) | 케어 일정 → `/health/calendar` · 공동양육 초대 수신 → `/mypage/invitations/:invitationToken` · 공동양육 초대 결과·연동 해제 → `/mypage/pets` · 실종 만료 → `/community/missing` · 가계부 → `/mypage/expenses` · 캐릭터 → `/mypage/characters` · 공지 → `/notices` · 문의 답변 → `/inquiries/:otoInqrySn` · 펫돌봄 거래 → `/chat?otoChatRoomSn=` |
| AI 라우팅 (AIM-004) | 1장의 ✓ 행 |
| 로그인 복귀 (COM-003-02·05·06) | `/?redirect=<경로>` → 로그인 후 그 경로, 없으면 `/main` |

## 4. 정할 것

### 지금 (`paths.js` 고치기 전)

| # | 내용 | 정할 사람 |
| --- | --- | --- |
| 1 | (해결) `HEALTH_RECORDS`·`HEALTH_STATUS`는 `paths.js`에 없다. `/health/diary`, `/health/calendar`로 반영됨 | JAJ |
| 10 | MYP-005 초대 수락 경로 변수 이름 `invitationToken`(가정). 초대 API 경로 변수와 같게 맞춘다 | SJM |

### AI 서버 구현 전

| # | 내용 | 정할 사람 |
| --- | --- | --- |
| 2 | MYP-011·031이 명세마다 다르다. 마이페이지: 아이템 상점 모달 / 가계부 등록. 매핑표: 캐릭터 상세 / 가계부 전체 내역. 매핑표 28·31행과 COM-004-10 수정 필요 | LJS |
| 3 | AI 대상(✓) URL 확정. 정한 뒤에는 바꾸면 AI 매핑도 고친다 | 전원 |

### 나중

| # | 내용 | 정할 사람 |
| --- | --- | --- |
| 4 | 채팅을 AI 대상으로 둘지. 매핑표는 "모달 열기"(10행), 실제는 새 창 | LJS, KSJ |
| 5 | 모달 추정 화면(MYP-003·005·006·031, HLT-007)이 페이지인지. 페이지면 URL 추가 (MYP-005 5-3은 페이지로 정함) | SJM, JAJ |
| 6 | 비밀번호 재설정 URL 파라미터(메일 링크로 들어오면 인증 식별값 필요) (ACC-012) | YAY |
| 7 | PLC-001~004 화면 ID 정리 (매핑표 44행 "보류") | YAY |
| 8 | 단수·복수 규칙에 어긋난 기존 이름: `/community/missing`(상세가 붙음 → `missing-reports`?) | KSJ |
| 9 | 관리자 화면 URL(설계서 없음, `paths.js`에 `/admin`만) (매핑표 45행) | 미정 |
