# TC 점검 결함 목록

`docs/tc/TC_*.md` 끝의 "명세·요구사항과 코드가 어긋난 곳" 절을 꼬리표별로 모은 것이다. 원문과 근거 파일은 각 TC 파일에 있다.
이 파일은 스크립트로 만든다. 고칠 때는 TC 파일의 줄을 고친 뒤 다시 만든다.

| 분류 | 건수 | 할 일 |
| --- | --- | --- |
| 프론트 코드 수정 `[코드]` | 66 | 프론트를 고친다. 각 도메인 담당이 `/start`로 |
| 백엔드 수정 `[백엔드]` | 10 | 백엔드 저장소에서 `/start`로 |
| AI 서버 수정 `[AI 서버]` | 3 | AI 저장소에서 `/start`로 |
| 결정 필요 `[결정]` | 22 | 회의에서 어느 쪽이 맞는지 정한 뒤 문서나 코드를 고친다 |
| 다른 도메인 문서 수정 `[문서]` | 19 | 코드가 맞다. 그 도메인 명세·화면설계서 담당이 고친다 |

## 프론트 코드 수정

### AI매니저 (5)
- FN-AIM-011-03 / FN-AIM-011-17 / REQ-AIM-003 — 세션 만료 시 명세는 "인증 오류 표시 후 대화창 닫기", 코드는 401이면 창이 로그인 화면으로 이동한다 (src/api/axios.js, milestones/LJS.md "연결 남음")
- FN-AIM-005-08 / FN-AIM-005-03 — 범위 밖 안내가 일반 AI 말풍선이라 칩 7개·고객센터 안내가 나오지 않는다. 연속 실패 횟수만 오른다 (src/features/ai/chat/ConversationMessages.jsx, src/pages/ai/AiChatPage.jsx)
- FN-AIM-012-09 / FN-AIM-012-13 / FN-AIM-012-14 / FN-AIM-012-17 / REQ-AIM-007 — [등록]의 일정·케어 항목 저장이 가짜 응답이라 실제로 저장되지 않는다 (src/features/ai/api.js)
- FN-AIM-006-02 — 알림 설정 화면의 "예정일 알림" 설명이 명세·백엔드(병원 일정만)보다 넓다. 화면 문구를 고친다
- FN-AIM-011-09 — 이어 쓴 대화를 목록 맨 위로 올리는 마지막 활동 시각이 이 창 메모리에만 있어 새로고침하면 등록일순으로 돌아간다 (src/features/ai/api.js lastActive)

### 건강기록 (3)
- FN-HLT-011-13 — 체중 카드 0건 문구가 명세 v1.4는 "첫 기록을 남기면 그래프로 보여요", 코드는 "기록이 없어요"다 (`dashboard/widgetItems.js` `emptyText`)
- FN-HLT-002-15 — PC 관찰 항목 목록 줄에 대표 사진·부위가 없다(항목명·크기와 증감·최근 관찰일만) (`diary/ObservationCard.jsx` `ItemButton`)
- REQ-NFR-003 / FN-HLT-011-09 — 요구사항은 검진 첨부 PDF를 "화면 내 미리보기·실행 없이 다운로드·[PDF 분석] 대상으로만" 취급한다고 하나 첨부 자료 탭 PDF 행의 [열기]가 새 창으로 연다 (`checkup/AttachmentTab.jsx` `handleOpenPdf`)

### 고객센터 (3)
- FN-CSC-002-01 — 명세는 질문 목록에 카테고리 배지를 함께 표시한다고 하나 화면에 없다 (`FaqList.jsx`)
- FN-CSC-001-01 / FN-CSC-002-01 / FN-CSC-003-01 — 명세의 "최대 10페이지"를 지키는 코드가 없다. 쪽 번호는 10개씩 묶어 보여 줄 뿐 서버 쪽 수 상한도 없다 (`BoardPagination.jsx`, `docs/api/support.md`)
- FN-CSC-003-10 — 명세는 오류 캐릭터 이미지가 첨부된 채로 작성 화면에 연결된다고 하나, 화면은 이미지를 보여 주지 않고 서버가 제출 때 첫 첨부로 붙인다. 캐릭터 생성 완료 모달의 [오류 문의]는 `pixelCharSn`을 안 보낸다 (`InquiryWritePage.jsx`, `CharacterCreateModal.jsx`)

### 공통레이아웃 (16)
- FN-COM-002-02 — 명세는 역할이 맞지 않는 화면을 해당 역할의 홈으로 보내라고 하나, 관리자가 사용자 화면(`/main`, `/health` 등)에 들어가도 막지 않음. 회원 → `/admin`만 `/main`으로 보냄 (`routes/AppRoutes.jsx` 사용자 라우트에 `allowedRoles` 없음)
- FN-COM-002-02 / FN-COM-002-24 — `/ai-chat`·`/chat`은 `auth: 'public'` 라우트라 로그인 확인 없이 화면이 열리고, 이후 API 401로만 로그인 이동 (`routes/domains/ai/aiRoutes.js`, `routes/domains/chat/chatRoutes.js`)
- FN-COM-002-01 / FN-COM-002-19 / FN-COM-002-21 — 명세는 모든 서비스 페이지에 푸터·플로팅 버튼, 지도 페이지는 위치 조정이나 `/places`는 푸터·[AI]·[TOP]을 아예 그리지 않음 (`layouts/PlaceLayout.jsx`)
- FN-COM-002-15 — 명세는 회원 프로필 이미지(미등록 시 기본)이나 헤더 프로필 아이콘은 항상 기본 이미지 (`layouts/ProfileDropdown.jsx`, `layouts/NavDrawer.jsx`)
- FN-COM-002-19 — 첫 방문 말풍선이 로그인 직후 첫 화면 `/main`(버튼이 숨겨진 상태)에서 이미 "본 것"으로 기록되어 다른 화면에서는 뜨지 않음. 말풍선은 PC 폭에서도 표시됨 (`hooks/useAiDock.js`, `layouts/FloatingButtons.jsx`)
- FN-COM-002-22 / REQ-MAN-001 — 명세는 "상세면 제목"까지 경로에 표시하나 커뮤니티·고객센터 상세 화면은 `title`을 넘기지 않아 소속 메뉴 이름에서 끝남 (`pages/community/PostDetailPage.jsx`, `layouts/CustomerCenterLayout.jsx`)
- FN-COM-002-23 — 정확히 1100px에서 GNB는 숨고(`max-[1100px]`) 햄버거도 숨어(`min-[1100px]:hidden`) 메뉴 진입이 없음. `NavDrawer`의 `(min-width: 1100px)`도 같은 경계 (`layouts/UserHeader.jsx`, `layouts/NavDrawer.jsx`)
- FN-COM-002-26 — 명세는 760px 이하에서 바텀 네비를 노출하나 `BottomNav`는 `min-[760px]:hidden`이라 760px에서 숨고, 푸터(`max-[760px]:hidden`)도 숨어 둘 다 없음. 플로팅 버튼만 네비 높이만큼 올라감 (`layouts/BottomNav.jsx`, `layouts/UserLayout.jsx`, `docs/convention/ui.md`는 "760px 미만")
- FN-COM-002-24 / FN-COM-003-07 — 세션 만료 안내 토스트가 없고 곧바로 `location.href`로 로그인 이동 (`api/axios.js` `redirectIfLoggedOut`)
- FN-COM-003-02 / FN-COM-003-05 — 로그인 화면 [회원가입] 이동과 가입 완료 뒤 `/login?joined=1` 이동이 redirect를 넘기지 않아 가입 경유 시 목적지가 사라짐 (`pages/auth/LoginPage.jsx`, `pages/auth/SignupPage.jsx`)
- FN-COM-003-08 / REQ-MAN-007 — 로그인 상태에서 랜딩(`/`)에 접근해도 `/main`으로 이동하지 않음 (`routes/domains/main/mainRoutes.js`, `pages/landing/LandingPage.jsx`)
- FN-COM-003-10 — 세션 만료 시 AI 대화창이 인증 오류를 표시하고 닫히는 게 아니라 그 창이 로그인 화면으로 이동함 (`api/axios.js`)
- FN-COM-004-04 / FN-COM-004-05 — 알림 조회가 실패해도 오류 안내·[다시 시도]가 없고 목록 칸이 비어 보임 (`layouts/NotificationDropdown.jsx`)
- FN-COM-004-06 — 읽음 처리 실패(404 `NOTIFICATION_NOT_FOUND` 포함) 때 안내 없이 이동도 하지 않음 (`layouts/NotificationDropdown.jsx`)
- FN-COM-009-01 / FN-COM-009-10 — 명세는 "마지막으로 본 채팅방이 선택된 상태로 연다"이나 [✕] 닫기는 보던 방을 잊고, 최소화([─])만 기억함 (`context/ChatModalProvider.jsx`)
- FN-COM-009-19 — 주소 공유의 장소 검색이 가짜 응답(고정 4곳) (`features/chat/api.js` `searchChatPlaces`)

### 관리자 (9)
- FN-ADM-020-01 / REQ-ADM-006 — 명세 게시판은 펫정보·펫일상·실종센터·펫돌봄 4개인데 게시글 화면 필터는 3개(펫돌봄 없음, `src/features/adminCommunity/postLabels.js`)
- FN-ADM-023-01 / REQ-ADM-023 — 백엔드 `/admin/community/exposure/...` 계약이 있는데 화면이 아직 메모리 가짜다(`src/features/adminCommunity/api.js`, milestones 대기)
- FN-ADM-042-08 / REQ-ADM-009 — 분쟁 문의 상세에서 작성자의 펫돌봄 매칭 목록으로 가는 연결이 없다(`src/features/adminInquiry/`, `src/pages/admin/AdminInquiryDetailPage.jsx`). 도착 화면 `?rcrtSn=`만 준비됨
- FN-ADM-110-01 / REQ-ADM-016 / REQ-NFR-002 — 탈퇴 회원 보관일수는 읽기 전용이어야 하는데 화면은 다른 일수 항목과 같은 입력칸이다(`src/features/setting/shared/settingFields.js` `whdwlMbrKpngDayCnt`). 백엔드 수정 요청에도 이 항목이 없다
- FN-ADM-110-01 — 명세 비고의 "대시보드 케어 최대 노출 수"(백엔드 `dshbdCareMaxExpsrCnt`, 1~20)가 설정 화면 항목에 없다(`src/features/setting/shared/settingFields.js`)
- FN-ADM-110-02 — 입력 허용 범위가 서버와 다르다. 가짜 응답은 일수 1~99, 그 밖의 숫자 1~9,999인데 서버는 항목마다 다르다(예: AI 토큰 상한 500~100,000, AI 대화 턴 수 1~50, 반려동물 최대 수 1~100, 초대 유효 일수 1~3650; `src/features/setting/api.js`, 백엔드 `docs/api/global.md` AdminSettingUpdateRequest)
- FN-ADM-012-01 / FN-ADM-012-03 — 정지·해제 사유 입력에 글자 수 제한이 없는데 서버는 1,000자 이내만 받는다(`src/features/adminMember/SuspendModal.jsx`·`ReleaseModal.jsx`, 백엔드 `docs/api/member.md`)
- FN-ADM-112-01 — 기간 상한(서버 92일)을 화면에서 검사하지 않는 것으로 보인다. 가짜 응답이라 연결 뒤 확인 필요(`src/features/apiUsage/`)
- FN-ADM-114-01 — 명세는 대상으로 거른다고 하나 대상 필터 항목이 운영 설정·회원 2개뿐이다(`src/features/audit/auditLabels.js` `TARGET_OPTIONS`). 공지·FAQ 등 나머지 대상은 서버 테이블명 그대로 표시되고 거를 수 없다

### 로그인·회원가입 (11)
- FN-ACC-002-03 / FN-ACC-002-18 — 명세는 "같은 로그인 진행 중 아이디 변경만으로 표시된 캡챠를 해제하지 않는다"인데, 코드는 아이디를 바꿔 서버가 캡챠 불필요로 답하면 보안코드 영역을 닫는다 (`login/useEmailLogin.js` blurEmail)
- FN-ACC-002-19 / FN-ACC-002-20 — 보안코드 새로고침 뒤·표시 직후 입력칸으로 포커스를 옮기지 않는다 (`login/CaptchaBlock.jsx`)
- FN-ACC-001-14 — 최종 저장에서 번호 중복(409 `PHONE_ALREADY_USED`)·이메일 중복(409 `EMAIL_ALREADY_REGISTERED`)이면 명세는 3단계 번호·이메일 단계로 돌아가 비밀번호를 비운다고 하나, 코드는 4단계 위 알림으로 서버 문구만 보인다 (`signup/useSignup.js` handleJoinError)
- FN-ACC-001-22·28 — 닉네임 설정용 쿠키가 만료됐을 때 명세는 닉네임을 유지하고 로그인 화면으로 안내하나, 코드는 "닉네임을 저장하지 못했습니다. 다시 시도해 주세요."만 보인다 (`signup/NicknameModal.jsx`)
- FN-ACC-001-40 — 이메일 인증을 이미 마친 경우의 생략, 기존 연결과 같은 SNS 새 인증의 본인확인 사용이 없고 항상 복구용 이메일 인증번호를 새로 받는다 (`recovery/useRecovery.js`, 백엔드 `docs/api/member.md` 449줄)
- FN-ACC-001-41·45 / FN-ACC-011-03·07 — 발송 실패·복구 실패 문구가 명세("인증번호를 보내지 못했습니다. 다시 시도해 주세요.", "정보를 복구하지 못했습니다. 다시 시도해 주세요.", "복구 처리 결과를 확인하고 있습니다.")가 아니라 서버·공통 오류 문구("네트워크 연결을 확인해 주세요." 등)로 보인다. 복구 실행의 "결과 미확인" 상태도 없다 (`recovery/useRecovery.js`, `password/usePasswordFind.js`)
- FN-ACC-001-16 — 필수 약관 해제 시 명세는 AI 안내를 하나, 1단계는 [다음] 비활성과 안내 문구만 있다 (`signup/TermsStep.jsx`)
- FN-ACC-002-05 — 탈퇴 회원이 비밀번호가 맞게 로그인하면 서버 문구 "탈퇴한 계정입니다. 재가입 또는 계정 복구를 진행해 주세요."만 알림으로 나오고 재가입·복구로 이동하는 버튼이 없다 (`login/useEmailLogin.js`)
- FN-ACC-020-06 / FN-ACC-020-03 — 명세는 로그인 회원이 바뀌면 탈퇴 확인 절차를 종료한다고 하나 코드는 그런 처리가 없다. 계정은 마스킹된 이메일로 표시한다 (`withdraw/WithdrawConfirmModal.jsx`)
- FN-ACC-020-17 — 명세는 결과 불명확 상태에서 다음 계정 접근 전에 기존 요청 결과를 먼저 확인한다고 하나 코드는 [안내 닫기]가 랜딩 이동만 한다 (`withdraw/WithdrawFlow.jsx`, `pages/mypage/WithdrawPage.jsx`)
- FN-ACC-020-15 — 결과 미확인(`unknown`)은 네트워크 끊김·15초 시간 초과(`NETWORK_ERROR`)일 때만이고, 프록시·서버 5xx는 "탈퇴를 처리하지 못했습니다."(실패)로 본다 (`withdraw/useWithdraw.js`)

### 마이페이지 (5)
- FN-MYP-002-06 — 반려동물 목록 조회가 실패해도 오류 안내·[다시 시도] 없이 "아직 등록된 반려동물이 없어요"가 보인다 (src/pages/mypage/PetListPage.jsx에 isError 처리 없음)
- FN-MYP-005-03 — 보낸 초대 조회가 실패해도 오류 안내 없이 "아직 보낸 초대가 없어요"가 보인다 (src/features/pet/list/SentInvitations.jsx)
- FN-MYP-002-09 — `/mypage/pets?register=1`은 등록 한도(주양육 10마리)를 확인하지 않고 모달을 연다. 한도 계정은 등록 때 `PET_LIMIT_EXCEEDED` 토스트로만 알게 된다 (src/pages/mypage/PetListPage.jsx). 확인 필요
- FN-MYP-003-01 — 체중 기록일이 명세 "MM.DD 기록"과 달리 코드는 "MM-DD 기록"이다 (src/features/pet/list/PetFormModal.jsx `formatRecordDate`)
- FN-MYP-031-05 — 분석 중 모달에 명세의 썸네일·"분석 중…"·"15초 안에 끝나요. 기다리기 어려우면 취소할 수 있어요." 문구가 없고 진행 막대와 "영수증을 분석하고 있어요"만 있다 (src/features/expense/dashboard/ExpenseReceiptUpload.jsx)

### 커뮤니티 (6)
- FN-CMU-002-01 / REQ-NFR-004 — 11-09 결정으로 목록 10건 통일, 실종센터는 지금 12건(`MissingListPage` PAGE_SIZE)
- FN-CMU-004-11 — 서버는 모집중인 글만 수정할 수 있는데 코드는 매칭완료·거래완료 글에도 [수정]을 보여 주고 저장 시 서버 문구로 거절한다 (`care/CareDetail.jsx`, `CARE_RECRUITMENT_NOT_EDITABLE`)
- FN-CMU-005-02·04 — 명세·서버(`ctptProfileAtchFileSn`)는 상대 프로필 사진을 주는데 채팅 화면은 닉네임 첫 글자 동그라미(`src/features/chat/room/ChatAvatar.jsx`)만 그린다
- FN-CMU-005-05 / REQ-NFR-003 — 주소 공유 모달의 장소 검색이 가짜 4곳이다 (`src/features/chat/api.js` `searchChatPlaces`). 또 채팅 사진 검사는 MIME 형식만 보고 확장자·실제 파일 형식을 함께 검증하지 않는다 (`room/ChatMessageInput.jsx` `checkPhotos`)
- FN-CMU-005-11 — 명세는 조건·확인자·확인 시각을 보관(거래 기록 조회)하는데 채팅 화면에는 합의 조건 한 줄만 보이고 확인자·확인 시각 표시가 없다 (`room/CareDealCard.jsx` `formatCondition`)
- FN-CMU-001-06 — 명세는 7일 → 30일 → 전체 순으로 대체하는데 화면 안내 글자는 어느 기간이든 "이번 주"로 고정이다 (`src/features/community/StoryRail.jsx`)

### 플레이스 (8)
- FN-HOS-001-03 / REQ-HOS-002 — 입력 중 관련 후보 표시가 없고 고정된 "추천" 버튼만 있다 (`features/place/PlacePanel.jsx`, `placeData.js`의 `SUGGESTIONS`)
- FN-HOS-001-04 — 검색 버튼이 없고 Enter로만 검색한다 (`features/place/PlaceSearchForm.jsx`)
- FN-HOS-001-04 / REQ-HOS-002 — 지역명이 없으면 "확정된 검색 영역"을 쓰기로 했으나, 새 검색은 항상 전주시 대표 영역으로 되돌린다 (`features/place/usePlaceSearch.js`의 `submitSearch`)
- FN-HOS-001-09·23 / REQ-HOS-005 — 지도 요약 카드에 즐겨찾기 별이 없다 (`features/place/PlacePopup.jsx`)
- FN-HOS-001-29 — 저장 항목이 없을 때 「저장한 즐겨찾기가 없습니다.」를 보이지 않고 영역을 숨긴다 (`features/place/PlacePanel.jsx`)
- FN-HOS-001-19 — 0건 문구가 명세(「이 지도 영역에 검색 결과가 없습니다」)와 다르다. 코드는 "이 지도 영역에 검색 결과가 없어요" (`features/place/PlacePanel.jsx`)
- FN-HOS-001-10 — 명세는 "동일 문자의 핀과 결과 카드"이고 ★가 즐겨찾기를 나타내지만, 코드는 숫자 핀이며 검색 결과에 포함된 즐겨찾기는 별 모양이 아닌 번호 핀이다 (`PlaceMap.jsx`, `PlacePin.jsx`)
- FN-HOS-001-03 / REQ-HOS-002 — 검색어 100자 이하 제한이 서버 계약에만 있고 입력칸에는 글자 수 제한이 없다 (`PlaceSearchForm.jsx`, 백엔드 `PlaceSearchCond.java`)

## 백엔드 수정

### AI매니저 (2)
- FN-AIM-006-20 / REQ-AIM-001 — 수신자 조회가 빈 목록을 주는 가짜라 배치를 돌려도 알림이 하나도 생기지 않는다 (nyangmeong-backend scheduler/CaregiverFake.java)
- FN-AIM-006-16 — 재시도 대기가 메모리 예약이라 서버를 재시작하면 남은 재시도가 사라진다 (nyangmeong-backend notification/service/CareScheduleAlarmService.java)

### 관리자 (1)
- FN-ADM-051-04 / REQ-ADM-024 — 명세·요구사항은 기능별 동의 문구 2종(펫돌봄 이용수칙, 실종 개인정보 공개 동의)도 관리하는데 화면은 가입 약관 4종만 다룬다(`src/features/adminTerms/termsKinds.js`, 서버 TRMS에 2종 없음)

### 로그인·회원가입 (2)
- FN-ACC-001-12·11 — 외부 연령 확인(네이버 로그인 플러스·카카오싱크) 자동 반영은 화면에 구현돼 있으나 서버가 `ageCnfrmd`를 항상 false로 준다 (`docs/api/member.md`, `signup/useSnsSignup.js`)
- FN-ACC-001-43 — 보관 기간 경과 문구가 명세 "복구 가능한 기간이 지났습니다. 새로 회원가입해 주세요."가 아니라 서버 문구 "복구 가능 기간이 지난 계정입니다."이다 (`ErrorCode.java` MEMBER_RECOVERY_EXPIRED)

### 마이페이지 (4)
- FN-MYP-001-01 — 명세는 얼굴 원형에 "착용 아이템 없이" 캐릭터 얼굴을 보이라는데, 서버 `character-image?part=face`는 착용 모습 대표 이미지가 있으면 그것을 잘라 줘서 아이템이 보일 수 있다 (pet.md, PetFace.jsx). 확인 필요
- FN-MYP-011-05 — 명세는 구매 시 포인트 차감을 요구하나 서버 `ItemService`가 `PointFake`(보유 8,450P 고정, 차감 없음)를 써서 포인트가 줄지 않고 상점 보유 포인트가 포인트 페이지와 다르다 (nyangmeong-backend src/main/java/com/nyangmeong/pet/service/ItemService.java:63·85, PointFake.java)
- FN-MYP-040-14 — 백엔드 develop에 `POST /members/me/sns-links`가 없어 [연동하기]가 서버 연동까지 닿지 못한다 (src/features/member/profile/SnsLinkCard.jsx, src/features/member/api.js `linkSns`). 서버 구현이 필요하다
- REQ-MYP-004 — 한도 알림은 "각 1회, 같은 달 재발송 없음"인데 서버는 한도·90% 경계를 새로 넘을 때마다 발송해 지출을 지웠다 다시 넘는 경우 재발송될 수 있다 (ExpenseService.java). 확인 필요

### 커뮤니티 (1)
- FN-CMU-004-05 — 명세는 "첫 메시지를 보내면 보호자의 채팅 목록에 등록"인데 서버 목록 쿼리는 메시지 없이 방만 만든 경우도 목록에 준다. 「채팅 n명」 집계만 메시지 1건 이상 기준이다 (`ChatRoomMapper.xml selectList`, `docs/api/community.md` CareRecruitmentSummary.aplcntCnt)

## AI 서버 수정

### AI매니저 (1)
- FN-AIM-004-08 — 변환표에 SCR-ACC-020(회원탈퇴)이 있으나 AI 서버 매핑표에는 그 화면이 없어 "탈퇴"는 회원정보 수정(SCR-MYP-040)으로 간다 (src/features/ai/shared/screenPaths.js, nyangmeong-ai data/routing.yaml)

### 관리자 (1)
- FN-ADM-080-01 / REQ-ADM-020 — 관리자 라우팅 매핑표 화면은 백엔드 DB를 고치지만 AI 서버는 data/routing.yaml만 읽어(재시작 때 캐시) 관리자가 고친 매핑이 AI 대화에 반영되지 않는다 (AI 서버 app/chat/rules.py routing_table)

### 마이페이지 (1)
- FN-MYP-010-13 / FN-MYP-010-16 — 착용 합성(미리보기·[장착] 뒤 대표 이미지)이 AI 서버의 아이템 굽기에 달려 있어, 설정이 꺼져 있으면 `ITEM_BAKING`(409)로 동작하지 않는다 (milestones/SJM.md, WearPreview.jsx)

## 결정 필요

### AI매니저 (1)
- FN-AIM-013-03 / REQ-AIM-004 — 대상 반려동물을 명세는 "대화의 펫 태그"로 정하지만 코드는 사이드바에서 고른 칩으로 정한다 (src/pages/ai/AiChatPage.jsx handleSendReceipt)

### 건강기록 (1)
- FN-HLT-005-15 / FN-HLT-003-12 / REQ-HLT-002 — FN-HLT-005-15와 REQ-HLT-002는 케어 항목의 [출처 보기] 역링크를 말하지만 FN-HLT-003-12는 11-01자로 삭제했고 코드에도 없다. 종합 건강기록 대시보드 진입은 11-10 결정으로 두지 않는다 (`CareTile.jsx`)

### 고객센터 (2)
- FN-CSC-003-09 — 명세 총 110MB, 서버 `max-request-size` 100MB(`application.properties.example`)이고 프론트는 총합을 검사하지 않는다. 명세 문장도 "최대 10개이미지 첨부 가능며"로 깨져 있다 (`ImageAttach.jsx`)
- FN-CSC-003-18 — 기능 설명에 "관리자는 삭제됨 필터로 조회만 한다"가 있으나 이 기능은 서버 문서 표에 "명세 없음(프론트 요청)"으로 남아 있고, 캐릭터 오류 문의 삭제 제외 규칙은 명세에 없다 (`docs/api/support.md`)

### 공통레이아웃 (4)
- FN-COM-004-07 — 커뮤니티(댓글)·공지 알림의 이동 경로는 미확정 (`milestones/LJS.md`)
- FN-COM-006-07 — 터치 환경의 "첫 탭 열기, 두 번째 탭 이동" 처리가 코드에 없음. 명세도 잠정 (`layouts/UserHeader.jsx`)
- FN-COM-008-12 — 명세가 "잠정, 설정 가능 여부 확정 필요"로 두었고 코드는 항상 받는 알림에 배치. 서버 설정 응답에도 캐릭터 항목이 없음 (`features/notification/settings/NotificationSettingsForm.jsx`, `notification.md`)
- REQ-CMU-010 — 요구사항 수행방안의 "전체/안 읽음 필터"에 비해 코드는 내 글·지원한 글 탭을 추가로 두고, 탭 구분은 서버 `tab` 파라미터가 아닌 프론트가 `myRole`로 걸러냄 (`features/chat/room/ChatRoomList.jsx`, `community.md`의 `GET /chat-rooms?tab=`)

### 로그인·회원가입 (1)
- FN-ACC-001-01 — 가입 진행 상태를 서버 임시 상태로 관리·복원한다고 하나 코드는 화면 메모리만 쓰고 새로고침하면 1단계부터 다시 한다 (`signup/useSignup.js`)

### 마이페이지 (3)
- FN-MYP-010-23 / REQ-COM-002 — 명세는 오류 확인 중·재생성 중인 동물이 대표여도 대표를 유지한다고 하나, 요구사항은 캐릭터가 여러 개면 다음 캐릭터로 대표가 자동 승계된다고 한다. 코드는 대표를 바꾸지 않는다 (CharacterCard.jsx, 기능명세서 v0.5, 요구사항정의서 v0.10.2)
- FN-MYP-010-24 / REQ-COM-002 — 요구사항은 오류 유형 필수 선택 뒤 AI 1차 판정으로 접수하라고 하나 명세·코드는 유형 선택 없이 고객센터 1:1 문의(유형 "픽셀 캐릭터")로 연결한다 (src/features/pet/character/CharacterDecorate.jsx)
- REQ-MYP-002 — 요구사항 세부내용은 식사량·음수량 권장 범위를 등록·수정할 수 있어야 한다고 하나 명세 FN-MYP-003-01과 등록/수정 모달에 입력란이 없다 (src/features/pet/list/PetFormModal.jsx). 확인 필요

### 메인페이지 (1)
- FN-MAN-008 / REQ-MAN-006 — 바로가기 목록 조회(`GET /pets/main-shortcuts`)만 실패하면 명세에 표시 방식이 없고, 코드는 빈 목록으로 보아 타일 없이 [바로가기 추가]만 보인다. 반려동물 조회 실패처럼 "불러오지 못했어요"를 보일지 정해야 한다 (`MainShortcuts.jsx`)

### 커뮤니티 (5)
- FN-CMU-002-10·13 — 명세는 품종 필수(미선택·미입력 시 저장 차단)인데 코드는 실종 글쓰기·수정의 품종을 선택 항목으로 바꿨다 (`src/features/community/missing/MissingForm.jsx` validate, `BreedCombobox required={false}`, 커밋 b099d67). 펫돌봄(FN-CMU-004-13)은 필수 그대로다
- FN-CMU-001-04 / REQ-CMU-005 — 요구사항은 인기글을 "좋아요·댓글 수 기반" 가중치로 산정하는데 명세는 "최근 7일 글, 좋아요 높은 순 5개"뿐이고 화면·서버도 좋아요 기준이다 (`src/features/community/PostList.jsx`, `docs/api/community.md` GET /posts)
- FN-CMU-005-06 — 화면 문구와 명세는 "14일 동안 수락이 없으면 자동 취소"인데 상태 이름에는 "요청 취소"와 별도로 "무응답 종료"가 있어 14일 경과 때 어느 쪽이 되는지 코드·계약에 없다 (`room/dealSteps.js`, `shared/chatCodes.js`)
- FN-CMU-005-09 / REQ-CMU-010 — 요구사항은 "보완 요청, 영수증 확인 후 거래완료"인데 명세·코드는 보완 요청 버튼과 영수증 확인 단계가 없고 보완은 채팅으로 협의한다 (`room/dealSteps.js`)
- REQ-CMU-010 — "실종센터 등 커뮤니티 1:1 문의에서 재사용"을 요구하지만 채팅방 생성 API는 펫돌봄 글(`pstSn`)만 받고 실종센터에는 채팅 진입이 없다 (`docs/api/community.md` ChatRoomCreateRequest, `features/community/missing/MissingSideBox.jsx`)

### 플레이스 (4)
- FN-HOS-001-07·08·21·22 / REQ-HOS-003 — 명세는 카드·병원명 클릭으로 카카오맵 새 탭을 열지만, 요구사항은 "카드 클릭 = 선택, 이동은 [카카오맵 상세보기]만"이다. 코드는 명세를 따른다 (`features/place/PlaceListItem.jsx`)
- FN-HOS-001-06 — 명세는 추천순·거리순·이름순 순서이고 요구사항에 기본값이 없다. 코드는 거리순·추천순·이름순 순서에 기본 거리순이며 서버 기본은 RECOMMEND다 (`placeData.js`, 백엔드 `docs/api/place.md`)
- FN-HOS-001-26 / REQ-HOS-003 — 요구사항은 카카오 상세 주소가 없으면 상세 버튼을 비활성화하지만, 코드는 그 좌표의 카카오맵 링크로 대신 연다 (`features/place/placeFormat.js`)
- FN-HOS-001-33 / REQ-HOS-005 — 요구사항은 비로그인 즐겨찾기 시도에 로그인 유도 컴포넌트(SCR-COM-903)를 표시한다고 하지만, 명세는 플레이스 안의 로그인 유도 팝업을 표시하지 않는다고 한다. 코드는 명세를 따른다 (`routes/domains/place/placeRoutes.js`)

## 다른 도메인 문서 수정

### 건강기록 (4)
- 건강기록 대시보드 항목 저장 — 코드는 `GET·PUT /members/me/dashboard-widgets`에 건강기록 전용 13개 코드(HLTC0084~0096)·`indctYn`·`savedYn`을 쓰지만, 백엔드 `docs/api/member.md`에는 메인 위젯용 초안(`DashboardWidgetSaveRequest`의 `dshbdWdgtCds`, 응답 `sortSeq`)만 있고 건강기록용 계약이 없다. 요청·응답 모양은 프론트 코드 기준으로 정했다 (`dashboardApi.js`, `dashboard/widgetItems.js`)
- REQ-HLT-003 — 요구사항정의서 v0.10.5는 건강기록 변화 그래프를 최근 14개로 적었으나 명세 v1.4·코드는 최근 5개 기록이다 (`diary/recordUtils.js` `RECENT_RECORD_COUNT`)
- FN-HLT-002-17·18 — 사진 줄이 최신 5회차만 나열하고 앞은 "+N 이전 회차" 칸으로 접히며, 크기 그래프도 크기 입력 회차 중 최신 5개만 그린다 (`diary/ObservationDetail.jsx` `CHART_COUNT`)
- FN-HLT-002-19 — [사진 원본 보기]·[이 회차 수정]·[삭제]가 버튼이 아니라 선택 회차 줄의 ⋮ 메뉴에 있다 (`diary/ObservationDetail.jsx`)

### 고객센터 (2)
- FN-CSC-001-05 — 명세는 상세에 조회수를 보인다고 하나 화면에 없다(서버가 조회수를 쓰지 않기로 2026-10-30 결정). 명세를 고쳐야 한다 (`docs/api/support.md`, `NoticeDetail.jsx`)
- FN-CSC-003-06 — 명세는 "7종"이라 하면서 이름을 10개(건강기록 문의·픽셀 캐릭터·플레이스·커뮤니티·포인트·결제·가계부·계정·로그인·기타) 나열한다. 서버 공통코드는 7개(건강기록·픽셀 캐릭터·플레이스·커뮤니티·포인트·결제·가계부 묶음·계정·로그인 묶음·기타)이고 화면은 응답 이름 그대로 쓴다 (`InquiryType.java`, `InquiryForm.jsx`)

### 로그인·회원가입 (6)
- FN-ACC-002-03·04·20 / FN-ACC-001-03·29·09·10 — 명세는 미입력 문구("아이디를 입력해 주세요." 등)를 입력칸과 AI로 안내한다고 하나, 코드는 빈 칸이면 버튼을 비활성으로 막아(추가-1) 미입력 문구가 나오지 않는다 (`login/useEmailLogin.js`, `signup/useSignup.js`)
- FN-ACC-002-14·15·16 / FN-ACC-001-15·18 — 명세는 AI 말풍선을 "기존 입력칸 아래 문구나 폼 상단 공통 알림과 함께" 표시한다고 하나, 코드는 AI 말풍선이 붙은 칸은 오류 문구를 말풍선에만 보이고(입력칸 아래 문구는 화면 읽기용 `sr-only`), 폼 위 오류 알림도 색 상자 없이 말풍선만 보인다. 11-09 의도한 변경이다: 같은 문구가 두 번 보이지 않게 함(`11b2623`, `07f660a` A5). 보안코드 칸(`login/CaptchaBlock.jsx`)은 아직 문구와 말풍선이 함께 보인다 (`shared/AuthField.jsx`, `shared/AuthNotice.jsx`)
- FN-ACC-002-21 / FN-ACC-001-04·06·15 / FN-ACC-011-09 — 문구 표기·말투를 화면설계서에 맞춰 통일해(`07f660a` B, 설계서 담당에게 목록 전달) 명세 문구와 다르다: "이메일 주소 형식을 확인해 주세요."(명세 "확인해주세요."), "인증 시간이 만료되었습니다."(명세 "인증시간"), 가입 완료 "가입한 방법으로 로그인해 주세요."(명세 "다시 로그인해 주세요."), 버튼 [인증번호 발송](명세 기능명 "인증코드 발송") (`signup/signupMessages.js`, `login/loginMessages.js`, `signup/EmailStep.jsx`, `login/LoginMethodChoice.jsx`)
- FN-ACC-001-04 — 명세는 발송 실패를 "인증번호를 보내지 못했습니다. 다시 시도해 주세요."로 안내하나, 메일 발송 실패(502 `MAIL_SEND_FAILED`)는 서버 문구를 공통 알림(AI 말풍선)으로 보이고 재전송 대기를 시작하지 않는다. 그 밖의 발송 실패는 명세 문구다(`fe95eba`, 마일스톤 YAY 완료 조건) (`signup/useSignup.js` submitSend)
- FN-ACC-001-09·10 / FN-ACC-012-01 — 비밀번호 규칙이 명세는 "8자 이상, 문자와 숫자를 함께"인데 코드·서버는 영문+숫자 ASCII 8~64자(공백 불가)다. 오류 문구도 명세 "비밀번호는 8자 이상, 문자와 숫자를 함께 입력해 주세요."가 아니라 "영문과 숫자를 함께 써서 8~64자로 입력해 주세요(공백 제외)."이다. 가입 4단계는 같은 문구를 부제에만 두고 칸 아래 안내는 지웠다 (`shared/validate.js`, `password/passwordMessages.js`)
- 명세 밖 — SNS 계정 연동(`linkSns`, 회원정보의 [연동하기], 콜백 `mode: 'link'`)은 이 명세에 기능 ID가 없다. 마이페이지(MYP-040) TC에서 다룬다 (`login/useSnsCallback.js`, `profile/SnsLinkCard.jsx`)

### 마이페이지 (1)
- FN-MYP-040-06 — 명세 v0.6은 규칙을 영문+숫자 8~64자로 고쳤지만 새 비밀번호 칸 안내 문구가 "…8자 이상 입력해 주세요"로 남아 코드 "…8~64자로 입력해 주세요(공백 제외)"와 다르다 (src/features/member/profile/PasswordChangeCard.jsx, src/features/member/shared/validate.js, milestones/SJM.md 2026-11-04 결정)

### 커뮤니티 (5)
- FN-CMU-004-05 — 명세는 돌봄 상세 [채팅하기]도 사이트 안 채팅 모달인데, 코드는 새 창(`/chat`)을 연다. 헤더 아이콘·알림만 모달(`src/features/community/care/CareDetail.jsx`의 `useChatWindow`, 마일스톤 LJS "FN-COM-009-02 `useChatModal`의 `open({ pstSn })` 호출" 연결 남음)
- FN-CMU-001-13 — 명세는 상세 내용 선택인데 요구사항(REQ-CMU-007)·코드·백엔드는 "기타" 선택 시 필수다 (`ReportModal`, `docs/api/community.md` ReportCreateRequest)
- FN-CMU-002-03 — 실종 기간 필터가 명세는 "전체/오늘/1주일/1개월 이상", 코드는 "전체/오늘/1주 이내/1개월 이내/1개월 이상"이다 (`src/features/community/missingCodes.js`)
- FN-CMU-004-13 — 명세는 "'기타' 선택 시 직접 입력"인데 코드는 목록 맨 아래 "직접 입력"이다 (`missing/BreedCombobox.jsx`)
- FN-CMU-001-11 — 명세에 내 댓글 삭제 버튼 규정이 없는데 요구사항(REQ-CMU-003)은 댓글 삭제를 요구하고 코드는 [삭제]를 제공한다 (`src/features/community/CommentSection.jsx`, 마일스톤 KSJ "명세 보완 필요")

### 플레이스 (1)
- FN-HOS-001-07·25 / REQ-HOS-002·003 — 명세는 카드·요약 카드에 영업시간을 적었으나 요구사항은 영업시간을 제외했고 서버 계약에도 없다. 코드에는 영업시간이 없다 (`PlaceListItem.jsx`, `PlacePopup.jsx`, 백엔드 `docs/api/place.md`)
