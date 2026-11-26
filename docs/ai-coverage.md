# 사이트 기능 전체 표 (AI 매니저 대화창 지원 범위)

스크립트가 만든 파일이다. 손으로 고치지 않고 `node scripts/ai-coverage.mjs --backend ../backend --ai ../ai`로 다시 만든다. 일부러 빼는 규칙은 스크립트 맨 위 `EXCLUDES` 한 곳에 있다(사람 결정 2026-11-26).

- 기준: 백엔드 컨트롤러 엔드포인트(`/api/admin`·`/internal` 제외)와 `@AiTool(name, domain, kind)`, 프론트 `features/` 아래 `api.js`·`<이름>Api.js`(관리자 호출 제외)의 `api` 호출, ai `data/tool_prompts.yaml`의 `skip`, `docs/routes.md` 1장
- 지원 방식(안): `@AiTool` READ는 읽기, CARD는 쓰기 카드. 도구가 없는 GET은 읽기 후보, 도구가 없는 그 밖은 쓰기 카드 후보. 뺌 규칙에 걸리면 뺌. 도구가 있는데 뺌 규칙에 걸리면 충돌, ai가 일부러 싣지 않은 도구는 보류
- 순서(사람 결정 2026-11-26): 이 표 → 도메인별 도구 거르기(ai) → 도메인 하나 늘릴 때마다 `tool_eval`로 정답률·토큰을 잰 뒤 다음 도메인(백엔드 `@AiTool` 추가도 도메인 단위)

만든 날: 2026-11-26

## 1. 도메인별 요약

| 도메인 | 전체 | 읽기 | 카드 | 읽기 후보 | 카드 후보 | 뺌 | 충돌 | 보류 | 화면에서 부름 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| auth | 8 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 6 |
| community | 49 | 8 | 0 | 11 | 0 | 30 | 0 | 0 | 48 |
| expense | 17 | 6 | 4 | 1 | 5 | 0 | 0 | 1 | 16 |
| health | 57 | 13 | 24 | 6 | 14 | 0 | 0 | 0 | 54 |
| member | 20 | 0 | 0 | 4 | 3 | 13 | 0 | 0 | 20 |
| notification | 6 | 0 | 0 | 3 | 3 | 0 | 0 | 0 | 6 |
| pet | 30 | 10 | 1 | 7 | 12 | 0 | 0 | 0 | 27 |
| place | 4 | 2 | 1 | 0 | 1 | 0 | 0 | 0 | 4 |
| support | 9 | 0 | 0 | 5 | 3 | 0 | 0 | 1 | 9 |
| 합계 | 200 | 39 | 30 | 37 | 41 | 51 | 0 | 2 | 190 |

`@AiTool` 71개(READ 40·CARD 31).

## 2. 엔드포인트별

### auth

| 메서드 | 경로 | 기능 | `@AiTool` | 지원 방식(안) | 프론트 함수 |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/auth/captchas` | 보안코드(캡챠) 발급·새로고침 |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | `features/member/api.js` `getCaptcha` |
| POST | `/api/auth/dev-tokens` | [개발용] 회원 번호로 토큰 쿠키 발급 |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | 화면에서 안 씀 |
| POST | `/api/auth/login` | 이메일 로그인 |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | `features/member/api.js` `login` |
| GET | `/api/auth/login-attempt-limits` | 아이디 기준 로그인 실패 횟수·보안코드 요구 상태 |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | `features/member/api.js` `getLoginStatus` |
| POST | `/api/auth/logout` | 로그아웃(Refresh 토큰 폐기) |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | `features/member/api.js` `logout` |
| GET | `/api/auth/me` | 내 정보(헤더 프로필·드롭다운) |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | `features/member/api.js` `getMe` |
| POST | `/api/auth/refresh` | Access 토큰 재발급(Refresh 쿠키 회전) |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | 화면에서 안 씀 |
| POST | `/api/auth/sns-login` | SNS 로그인(네이버·카카오·구글 인가 코드) |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | `features/member/api.js` `snsLogin` |

### community

| 메서드 | 경로 | 기능 | `@AiTool` | 지원 방식(안) | 프론트 함수 |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/care-matches` | 매칭 요청(보호자) |  | 뺌(다른 회원에게 가는 행동: 펫돌봄 거래 단계) | `features/chat/api.js` `requestCareMatch` |
| GET | `/api/care-matches/{}` | 매칭 조건·완료 요청 회차·수령 상태 조회(참여자만) |  | 읽기 후보 | `features/chat/api.js` `getCareMatch` |
| POST | `/api/care-matches/{}/accept` | 매칭 수락(제공자) |  | 뺌(다른 회원에게 가는 행동: 펫돌봄 거래 단계) | `features/chat/api.js` `acceptCareMatch` |
| POST | `/api/care-matches/{}/cancel` | 수락 전 매칭 요청 취소(보호자) |  | 뺌(다른 회원에게 가는 행동: 펫돌봄 거래 단계) | `features/chat/api.js` `cancelCareMatch` |
| POST | `/api/care-matches/{}/cancel-request` | 거래 취소 요청(매칭 완료~수령 대기, 두 당사자) |  | 뺌(다른 회원에게 가는 행동: 펫돌봄 거래 단계) | `features/chat/api.js` `requestDealCancel` |
| POST | `/api/care-matches/{}/cancel-request/approve` | 거래 취소 동의(요청한 사람의 상대) |  | 뺌(다른 회원에게 가는 행동: 펫돌봄 거래 단계) | `features/chat/api.js` `approveDealCancel` |
| POST | `/api/care-matches/{}/cancel-request/reject` | 거래 취소 거절(요청한 사람의 상대) |  | 뺌(다른 회원에게 가는 행동: 펫돌봄 거래 단계) | `features/chat/api.js` `rejectDealCancel` |
| POST | `/api/care-matches/{}/cancel-request/withdraw` | 거래 취소 요청 철회(요청한 사람) |  | 뺌(다른 회원에게 가는 행동: 펫돌봄 거래 단계) | `features/chat/api.js` `withdrawDealCancel` |
| POST | `/api/care-matches/{}/completion-requests` | 돌봄 완료 요청(제공자) |  | 뺌(다른 회원에게 가는 행동: 펫돌봄 거래 단계) | `features/chat/api.js` `requestCareCompletion` |
| POST | `/api/care-matches/{}/confirm-completion` | 돌봄 완료 확인(보호자) |  | 뺌(다른 회원에게 가는 행동: 펫돌봄 거래 단계) | `features/chat/api.js` `confirmCareCompletion` |
| POST | `/api/care-matches/{}/confirm-receipt` | 비용 수령 확인(제공자, 받았으면 거래 완료) |  | 뺌(다른 회원에게 가는 행동: 펫돌봄 거래 단계) | `features/chat/api.js` `confirmCareReceipt` |
| GET | `/api/care-recruitments` | 펫돌봄 모집 목록 | `list_care_recruitments` READ | 읽기 | `features/community/careApi.js` `getCareList` |
| POST | `/api/care-recruitments` | 펫돌봄 모집 등록 |  | 뺌(커뮤니티 글·댓글 쓰기(사람 결정)) | `features/community/careApi.js` `createCare` |
| DELETE | `/api/care-recruitments/{}` | 펫돌봄 모집 삭제(작성자) |  | 뺌(커뮤니티 글·댓글 쓰기(사람 결정)) | `features/community/careApi.js` `deleteCare` |
| GET | `/api/care-recruitments/{}` | 펫돌봄 모집 상세 |  | 읽기 후보 | `features/community/careApi.js` `getCare` |
| PATCH | `/api/care-recruitments/{}` | 펫돌봄 모집 수정(작성자, 모집중만) |  | 뺌(커뮤니티 글·댓글 쓰기(사람 결정)) | `features/community/careApi.js` `updateCare` |
| GET | `/api/care-recruitments/minimum-wage` | 펫돌봄 최저시급 조회 |  | 읽기 후보 | `features/community/careApi.js` `getMinimumWage` |
| GET | `/api/chat-rooms` | 내 채팅 목록(탭·안 읽음 필터) |  | 읽기 후보 | `features/chat/api.js` `getChatRooms` |
| POST | `/api/chat-rooms` | 채팅하기(채팅방 생성 또는 기존 방 반환) |  | 뺌(다른 회원에게 가는 행동: 채팅) | `features/chat/api.js` `createChatRoom` |
| GET | `/api/chat-rooms/{}` | 채팅방 조회(참여자만) |  | 읽기 후보 | `features/chat/api.js` `getChatRoom` |
| GET | `/api/chat-rooms/{}/images/{}` | 채팅 사진(참여자만) |  | 읽기 후보 | 화면에서 안 씀 |
| POST | `/api/chat-rooms/{}/leave` | 채팅방 나가기 |  | 뺌(다른 회원에게 가는 행동: 채팅) | `features/chat/api.js` `leaveChatRoom` |
| GET | `/api/chat-rooms/{}/messages` | 대화 메시지 조회(커서, 최신순) |  | 읽기 후보 | `features/chat/api.js` `getChatMessages` |
| POST | `/api/chat-rooms/{}/messages` | 메시지 전송(텍스트·사진·주소 공유) |  | 뺌(다른 회원에게 가는 행동: 채팅) | `features/chat/api.js` `createChatMessage` |
| POST | `/api/chat-rooms/{}/read` | 읽음 처리 |  | 뺌(다른 회원에게 가는 행동: 채팅) | `features/chat/api.js` `readChatRoom` |
| GET | `/api/chat-rooms/unread-count` | 읽지 않은 메시지 총수 |  | 읽기 후보 | `features/chat/api.js` `getChatUnreadCount` |
| GET | `/api/community-ai-commentaries` | 오늘의 이야기 |  | 읽기 후보 | `features/community/api.js` `getTodayStory` |
| GET | `/api/lost-reports` | 실종 제보 목록 | `list_lost_reports` READ | 읽기 | `features/community/missingApi.js` `getMissingList` |
| POST | `/api/lost-reports` | 실종 제보 등록 |  | 뺌(커뮤니티 글·댓글 쓰기(사람 결정)) | `features/community/missingApi.js` `createMissing` |
| DELETE | `/api/lost-reports/{}` | 실종 제보 삭제(작성자) |  | 뺌(커뮤니티 글·댓글 쓰기(사람 결정)) | `features/community/missingApi.js` `deleteMissing` |
| GET | `/api/lost-reports/{}` | 실종 제보 상세 |  | 읽기 후보 | `features/community/missingApi.js` `getMissing` |
| PATCH | `/api/lost-reports/{}` | 실종 제보 수정(작성자, 실종 상태만) |  | 뺌(커뮤니티 글·댓글 쓰기(사람 결정)) | `features/community/missingApi.js` `updateMissing` |
| POST | `/api/lost-reports/{}/found` | 찾았어요 전환(작성자) |  | 뺌(커뮤니티 글·댓글 쓰기(사람 결정)) | `features/community/missingApi.js` `markMissingFound` |
| POST | `/api/lost-reports/{}/renew` | 게시 기간 30일 연장(작성자) |  | 뺌(커뮤니티 글·댓글 쓰기(사람 결정)) | `features/community/missingApi.js` `extendMissing` |
| GET | `/api/news` | 펫뉴스 목록 (카테고리·제목/내용 검색, 최신순) | `list_news` READ | 읽기 | `features/news/api.js` `getNewsList` |
| GET | `/api/news/{}` | 펫뉴스 상세 |  | 읽기 후보 | `features/news/api.js` `getNews` |
| GET | `/api/posts` | 펫이야기 게시글 목록 | `list_posts` READ | 읽기 | `features/community/api.js` `getPostList` |
| POST | `/api/posts` | 게시글 작성 |  | 뺌(커뮤니티 글·댓글 쓰기(사람 결정)) | `features/community/api.js` `createPost` |
| DELETE | `/api/posts/{}` | 게시글 삭제(작성자) |  | 뺌(커뮤니티 글·댓글 쓰기(사람 결정)) | `features/community/api.js` `deletePost` |
| GET | `/api/posts/{}` | 게시글 상세 | `get_post` READ | 읽기 | `features/community/api.js` `getPost` |
| PATCH | `/api/posts/{}` | 게시글 수정(작성자) |  | 뺌(커뮤니티 글·댓글 쓰기(사람 결정)) | `features/community/api.js` `updatePost` |
| GET | `/api/posts/{}/comments` | 댓글·대댓글 목록 | `list_comments` READ | 읽기 | `features/community/api.js` `getComments` |
| POST | `/api/posts/{}/comments` | 댓글·대댓글 등록 |  | 뺌(커뮤니티 글·댓글 쓰기(사람 결정)) | `features/community/api.js` `createComment` |
| DELETE | `/api/posts/{}/comments/{}` | 댓글 삭제(작성자, 답글 유지) |  | 뺌(커뮤니티 글·댓글 쓰기(사람 결정)) | `features/community/api.js` `deleteComment` |
| DELETE | `/api/posts/{}/likes` | 좋아요 취소 |  | 뺌(다른 회원에게 가는 행동: 좋아요(작성자에게 알림)) | `features/community/api.js` `togglePostLike` |
| POST | `/api/posts/{}/likes` | 좋아요 등록 |  | 뺌(다른 회원에게 가는 행동: 좋아요(작성자에게 알림)) | `features/community/api.js` `togglePostLike` |
| GET | `/api/posts/health-tips` | 오늘의 건강팁 | `list_health_tips` READ | 읽기 | `features/community/api.js` `getHealthTips` |
| GET | `/api/posts/popular-photo` | 인기 포토 | `get_popular_photo` READ | 읽기 | `features/community/api.js` `getPopularPhoto` |
| POST | `/api/reports` | 게시글·댓글·채팅 상대 신고 |  | 뺌(다른 회원에게 가는 행동: 신고) | `features/chat/api.js` `reportChatRoom`<br>`features/community/api.js` `togglePostLike` |

### expense

| 메서드 | 경로 | 기능 | `@AiTool` | 지원 방식(안) | 프론트 함수 |
| --- | --- | --- | --- | --- | --- |
| DELETE | `/api/expenses` | 가계부 지출 여러 건 삭제(개별 선택) |  | 쓰기 카드 후보 | `features/expense/api.js` `deleteExpenses` |
| GET | `/api/expenses` | 가계부 지출 목록(기간·반려동물·공용·카테고리 필터, 최신순·금액순) | `list_expenses` READ | 읽기 | `features/expense/api.js` `getExpenses` |
| POST | `/api/expenses` | 가계부 지출 등록(반려동물별 줄, 영수증 연결) | `draft_expense` CARD | 쓰기 카드 | `features/expense/api.js` `createExpenses` |
| DELETE | `/api/expenses/{}` | 가계부 지출 한 건 삭제 | `delete_expense` CARD | 쓰기 카드 | `features/expense/api.js` `deleteExpense` |
| PATCH | `/api/expenses/{}` | 가계부 지출 수정 | `draft_expense_update` CARD | 쓰기 카드 | `features/expense/api.js` `updateExpense` |
| POST | `/api/expenses/bulk-delete` | 가계부 지출 조건 전체 삭제(조회 결과 전체 선택) |  | 쓰기 카드 후보 | `features/expense/api.js` `bulkDeleteExpenses` |
| POST | `/api/expenses/duplicate-check` | 가계부 지출 저장 전 중복 확인 |  | 쓰기 카드 후보 | `features/expense/api.js` `findDuplicateExpenses` |
| GET | `/api/expenses/months` | 가계부 지출이 있는 연월(월 피커) | `list_expense_months` READ | 읽기 | `features/expense/api.js` `getExpenseMonths` |
| GET | `/api/expenses/pets` | 가계부 필터 반려동물(연동 해제·삭제된 반려동물 포함) | `list_expense_pets` READ | 읽기 | `features/expense/api.js` `getExpensePets` |
| GET | `/api/expenses/statistics` | 가계부 월 통계(총 지출·한도·달력·카테고리별·반려동물별·주요 지출) | `get_expense_statistics` READ | 읽기 | `features/expense/api.js` `getExpenseStatistics` |
| GET | `/api/expenses/totals` | 가계부 조건별 지출 건수·합계 | `get_expense_total` READ | 읽기 | `features/expense/api.js` `getExpenseTotals` |
| PUT | `/api/members/me/expense-limit` | 월 지출 한도 저장(처음 저장하면 한도 알림 수신을 켬) | `draft_expense_limit` CARD | 쓰기 카드 | `features/expense/api.js` `saveExpenseLimit` |
| GET | `/api/receipts/{}` | 영수증 분석 결과 다시 열기 | `get_receipt` READ | 읽기 | `features/ai/api.js` `getChatReceiptResult` |
| POST | `/api/receipts/{}/checkups` | 영수증 인식 실패 뒤 [직접 입력] 검진기록 등록(영수증 저장완료·연결, 가계부 없음) |  | 쓰기 카드 후보 | `features/health/receiptApi.js` `createReceiptCheckup` |
| GET | `/api/receipts/{}/image` | 영수증 원본 이미지 |  | 읽기 후보 | 화면에서 안 씀 |
| POST | `/api/receipts/{}/save` | 영수증 확인 후 저장(검진기록·가계부 일괄) | `draft_receipt_save` CARD | 보류(ai skip: 저장 전 영수증 번호를 주는 READ 없음(SCR-AIM-013 ⑤ 팀 결정 대기)) | `features/health/receiptApi.js` `saveReceiptCheckups` |
| POST | `/api/receipts/{}/save-check` | 영수증 저장 전 확인(가계부 중복·가까운 예정 일정) |  | 쓰기 카드 후보 | `features/health/receiptApi.js` `prepareReceiptSave` |

### health

| 메서드 | 경로 | 기능 | `@AiTool` | 지원 방식(안) | 프론트 함수 |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/care-schedules` | 케어 캘린더 일정 목록(여러 반려동물) | `list_my_care_schedules` READ | 읽기 | `features/health/api.js` `getSchedules` |
| GET | `/api/members/me/dashboard-widgets` | 건강기록 대시보드 고른 항목 조회 |  | 읽기 후보 | `features/health/dashboardApi.js` `getHealthWidgets` |
| PUT | `/api/members/me/dashboard-widgets` | 건강기록 대시보드 고른 항목 저장 |  | 쓰기 카드 후보 | `features/health/dashboardApi.js` `saveHealthWidgets` |
| GET | `/api/pets/{}/care-completions` | 케어 완료 기록 목록 | `list_care_completions` READ | 읽기 | `features/health/api.js` `getCareItems` |
| POST | `/api/pets/{}/care-completions` | 케어 완료 체크 | `draft_care_completion` CARD | 쓰기 카드 | `features/health/api.js` `checkCareItem` |
| DELETE | `/api/pets/{}/care-completions/{}` | 그날 케어 완료 기록 취소(투약은 그날 체크 전부) | `cancel_care_completion` CARD | 쓰기 카드 | `features/health/api.js` `cancelCareRecord` |
| GET | `/api/pets/{}/care-items` | 케어 항목 목록(토탈 케어리스트) | `list_care_items` READ | 읽기 | `features/health/api.js` `getCareItems` |
| POST | `/api/pets/{}/care-items` | 케어 항목 추가 | `draft_care_item` CARD | 쓰기 카드 | `features/health/api.js` `createCareItem` |
| DELETE | `/api/pets/{}/care-items/{}` | 케어 항목 삭제 | `delete_care_item` CARD | 쓰기 카드 | `features/health/api.js` `deleteCareItem` |
| PATCH | `/api/pets/{}/care-items/{}` | 케어 항목 수정 | `draft_care_item_update` CARD | 쓰기 카드 | `features/health/api.js` `updateCareItem` |
| DELETE | `/api/pets/{}/care-items/{}/today-completion/last` | 투약 오늘 마지막 1회 취소 |  | 쓰기 카드 후보 | `features/health/api.js` `cancelLastDose` |
| PUT | `/api/pets/{}/care-items/indications` | 케어리스트 표시 항목 저장 |  | 쓰기 카드 후보 | `features/health/api.js` `saveCareIndications` |
| GET | `/api/pets/{}/care-items/mission-progress` | 케어리스트 오늘 케어미션 진행 |  | 읽기 후보 | `features/health/api.js` `getCareMissionProgress` |
| GET | `/api/pets/{}/care-schedules` | 케어 캘린더 일정 목록 |  | 읽기 후보 | `features/ai/api.js` `findChatNearSchedule`<br>`features/health/api.js` `findNearHospitalSchedule`<br>`features/health/summaryApi.js` `getInspectionName` |
| POST | `/api/pets/{}/care-schedules` | 일정 등록 | `draft_schedule` CARD | 쓰기 카드 | `features/health/api.js` `createSchedule` |
| DELETE | `/api/pets/{}/care-schedules/{}` | 일정 삭제 | `delete_schedule` CARD | 쓰기 카드 | `features/health/api.js` `deleteSchedule` |
| PATCH | `/api/pets/{}/care-schedules/{}` | 일정 수정 | `draft_schedule_update` CARD | 쓰기 카드 | `features/health/api.js` `updateSchedule` |
| GET | `/api/pets/{}/checkup-attachments` | 검진기록 첨부 목록 |  | 읽기 후보 | 화면에서 안 씀 |
| POST | `/api/pets/{}/checkup-attachments` | 검진기록 첨부 등록 |  | 쓰기 카드 후보 | `features/health/checkupApi.js` `createAttachment` |
| DELETE | `/api/pets/{}/checkup-attachments/{}` | 검진기록 첨부 삭제 |  | 쓰기 카드 후보 | `features/health/checkupApi.js` `deleteAttachment` |
| GET | `/api/pets/{}/checkup-attachments/{}` | 검진기록 첨부 파일 |  | 읽기 후보 | `features/health/checkupApi.js` `getAttachmentFile` |
| PATCH | `/api/pets/{}/checkup-attachments/{}` | 검진기록 첨부 교체·수정 |  | 쓰기 카드 후보 | `features/health/checkupApi.js` `replaceAttachment` |
| GET | `/api/pets/{}/checkups` | 검진기록 목록 | `list_checkups` READ | 읽기 | `features/ai/api.js` `getChatCheckups`<br>`features/health/diaryApi.js` `getCheckups` |
| POST | `/api/pets/{}/checkups` | 검진기록 직접 등록 |  | 쓰기 카드 후보 | `features/ai/api.js` `createChatCheckup`<br>`features/health/diaryApi.js` `createCheckup` |
| DELETE | `/api/pets/{}/checkups/{}` | 검진기록 삭제 | `delete_checkup` CARD | 쓰기 카드 | `features/health/diaryApi.js` `deleteCheckup` |
| GET | `/api/pets/{}/checkups/{}` | 검진상세 기본정보 | `get_checkup` READ | 읽기 | `features/health/diaryApi.js` `getCheckup` |
| PATCH | `/api/pets/{}/checkups/{}` | 검진기록 수정 | `draft_checkup_update` CARD | 쓰기 카드 | `features/health/diaryApi.js` `updateCheckup` |
| GET | `/api/pets/{}/daily-health-records` | 일상 건강기록 목록 | `list_daily_health_records` READ | 읽기 | `features/health/dashboardApi.js` `getRecentStools`<br>`features/health/diaryApi.js` `?`<br>`features/pet/api.js` `getLatestWeightRecord` |
| POST | `/api/pets/{}/daily-health-records` | 일상 건강기록 등록 | `draft_daily_health_record` CARD | 쓰기 카드 | 화면에서 안 씀 |
| DELETE | `/api/pets/{}/daily-health-records/{}` | 일상 건강기록 삭제 | `delete_daily_health_record` CARD | 쓰기 카드 | `features/health/diaryApi.js` `deleteDailyRecord` |
| PATCH | `/api/pets/{}/daily-health-records/{}` | 일상 건강기록 수정 | `draft_daily_health_record_update` CARD | 쓰기 카드 | `features/health/diaryApi.js` `updateDailyRecord` |
| POST | `/api/pets/{}/daily-health-records/bulk` | 일상 건강기록 일괄 등록 |  | 쓰기 카드 후보 | `features/health/diaryApi.js` `bulkCreateDailyRecords` |
| GET | `/api/pets/{}/etc-inspections` | 기타검사 목록 | `list_etc_inspections` READ | 읽기 | `features/health/checkupApi.js` `getEtcInspections` |
| POST | `/api/pets/{}/etc-inspections` | 기타검사 입력 |  | 쓰기 카드 후보 | `features/health/checkupApi.js` `createEtcInspection` |
| DELETE | `/api/pets/{}/etc-inspections/{}` | 기타검사 삭제 | `delete_etc_inspection` CARD | 쓰기 카드 | `features/health/checkupApi.js` `deleteEtcInspection` |
| PATCH | `/api/pets/{}/etc-inspections/{}` | 기타검사 수정 | `draft_etc_inspection_update` CARD | 쓰기 카드 | `features/health/checkupApi.js` `updateEtcInspection` |
| GET | `/api/pets/{}/health-indicators` | 메인 건강 지표 조회 | `get_health_indicators` READ | 읽기 | `features/health/dashboardApi.js` `getHealthIndicators` |
| DELETE | `/api/pets/{}/inspection-values` | 검사 수치 선택 삭제 |  | 쓰기 카드 후보 | `features/health/checkupApi.js` `deleteInspections` |
| GET | `/api/pets/{}/inspection-values` | 검사 수치 목록 | `list_inspection_values` READ | 읽기 | `features/health/checkupApi.js` `getInspectionValues`<br>`features/health/summaryApi.js` `getHealthSummary` |
| POST | `/api/pets/{}/inspection-values` | 검사 수치 저장 (이미 등록된 항목 제외, 삭제된 같은 항목 복구) | `draft_inspection_values` CARD | 쓰기 카드 | `features/health/checkupApi.js` `createInspections` |
| PATCH | `/api/pets/{}/inspection-values/{}` | 검사 수치 수정 | `draft_inspection_value_update` CARD | 쓰기 카드 | `features/health/checkupApi.js` `updateInspection` |
| GET | `/api/pets/{}/observation-cycles` | 관찰 회차 목록 | `list_observation_cycles` READ | 읽기 | `features/health/diaryApi.js` `getObservationCycles` |
| POST | `/api/pets/{}/observation-cycles` | 관찰 회차 추가 | `draft_observation_cycle` CARD | 쓰기 카드 | `features/health/diaryApi.js` `createObservationCycle` |
| DELETE | `/api/pets/{}/observation-cycles/{}` | 관찰 회차 삭제 | `delete_observation_cycle` CARD | 쓰기 카드 | `features/health/diaryApi.js` `deleteObservationCycle` |
| PATCH | `/api/pets/{}/observation-cycles/{}` | 관찰 회차 수정 | `draft_observation_cycle_update` CARD | 쓰기 카드 | `features/health/diaryApi.js` `updateObservationCycle` |
| GET | `/api/pets/{}/observation-cycles/{}/photo` | 관찰 사진 |  | 읽기 후보 | 화면에서 안 씀 |
| GET | `/api/pets/{}/observation-items` | 관찰 항목 목록 | `list_observation_items` READ | 읽기 | `features/ai/api.js` `getChatObservationItems`<br>`features/health/diaryApi.js` `getObservationItems` |
| POST | `/api/pets/{}/observation-items` | 관찰 항목 등록(1회차 포함) | `draft_observation_item` CARD | 쓰기 카드 | `features/health/diaryApi.js` `createObservationItem` |
| POST | `/api/pets/{}/observation-items/{}/end` | 관찰 종료 |  | 쓰기 카드 후보 | `features/health/diaryApi.js` `endObservationItem` |
| GET | `/api/pets/{}/prescriptions` | 처방약 목록 | `list_prescriptions` READ | 읽기 | `features/health/checkupApi.js` `getPrescriptions`<br>`features/health/summaryApi.js` `getHealthSummary` |
| POST | `/api/pets/{}/prescriptions` | 처방약 추가 |  | 쓰기 카드 후보 | `features/health/checkupApi.js` `createPrescription` |
| DELETE | `/api/pets/{}/prescriptions/{}` | 처방약 삭제 | `delete_prescription` CARD | 쓰기 카드 | `features/health/checkupApi.js` `deletePrescription` |
| PATCH | `/api/pets/{}/prescriptions/{}` | 처방약 수정 | `draft_prescription_update` CARD | 쓰기 카드 | `features/health/checkupApi.js` `updatePrescription` |
| POST | `/api/pets/{}/prescriptions/bulk-save` | 처방약 일괄 저장 |  | 쓰기 카드 후보 | `features/health/checkupApi.js` `bulkSavePrescriptions` |
| GET | `/api/pets/{}/repeat-preventions` | 반복 예방 목록 | `list_repeat_preventions` READ | 읽기 | `features/health/checkupApi.js` `getRepeatPreventions` |
| POST | `/api/pets/{}/repeat-preventions` | 반복 예방 등록 |  | 쓰기 카드 후보 | `features/health/checkupApi.js` `createPrevention` |
| DELETE | `/api/pets/{}/repeat-preventions/{}` | 반복 예방 해지 | `delete_repeat_prevention` CARD | 쓰기 카드 | `features/health/checkupApi.js` `cancelPrevention` |

### member

| 메서드 | 경로 | 기능 | `@AiTool` | 지원 방식(안) | 프론트 함수 |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/email-certifications` | 이메일 인증번호 발송·재전송 |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | `features/member/api.js` `sendRecoveryCode`<br>`features/member/api.js` `sendMemberRecoveryCode`<br>`features/member/api.js` `sendSignupCode` |
| POST | `/api/email-certifications/{}/invalidate` | 이메일 인증 무효화(비밀번호 찾기) |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | `features/member/api.js` `invalidateRecoveryCode` |
| POST | `/api/email-certifications/{}/password-reset` | 비밀번호 재설정(재설정 권한 토큰) |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | `features/member/api.js` `resetPassword` |
| POST | `/api/email-certifications/{}/verify` | 이메일 인증번호 확인 |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | `features/member/api.js` `verifyRecoveryCode` |
| POST | `/api/members` | 회원가입(이메일) |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | `features/member/api.js` `joinMember`<br>`features/member/api.js` `joinSnsMember` |
| GET | `/api/members/me` | 회원정보 수정 화면 조회 |  | 읽기 후보 | `features/member/api.js` `getMyProfile` |
| PATCH | `/api/members/me` | 회원정보 수정(휴대전화번호·프로필 사진) |  | 쓰기 카드 후보 | `features/member/api.js` `updateProfileImage`<br>`features/member/api.js` `updatePhone` |
| PATCH | `/api/members/me/nickname` | 닉네임 설정 완료 |  | 쓰기 카드 후보 | `features/member/api.js` `setupNickname` |
| PATCH | `/api/members/me/password` | 비밀번호 변경(로그인 상태) |  | 뺌(본인 계정: 비밀번호 변경) | `features/member/api.js` `updatePassword` |
| POST | `/api/members/me/password-verification` | 현재 비밀번호 확인(회원정보 수정 본인 확인) |  | 뺌(본인 계정: 비밀번호 변경) | `features/member/api.js` `verifyPassword` |
| POST | `/api/members/me/sns-links` | SNS 계정 연동(로그인 상태) |  | 뺌(본인 계정: SNS 연동) | `features/member/api.js` `linkSns` |
| GET | `/api/members/me/tutorial` | 서비스 튜토리얼 봤음 여부 조회 |  | 읽기 후보 | `features/dashboard/api.js` `getServiceTutorial` |
| PUT | `/api/members/me/tutorial` | 서비스 튜토리얼 봤음 저장 |  | 쓰기 카드 후보 | `features/dashboard/api.js` `saveServiceTutorialSeen` |
| POST | `/api/members/me/withdraw` | 회원탈퇴 |  | 뺌(본인 계정: 탈퇴) | `features/member/api.js` `withdrawMember` |
| GET | `/api/members/nickname-availability` | 닉네임 중복확인 |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | `features/member/api.js` `checkNicknameAvailability` |
| GET | `/api/members/phone-availability` | 휴대전화번호 정규화·중복확인 |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | `features/member/api.js` `checkPhoneAvailability` |
| POST | `/api/members/recovery` | 탈퇴 회원 기존 정보 복구 실행(복구 확인 권한 토큰) |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | `features/member/api.js` `recoverMember` |
| POST | `/api/members/recovery-info` | 탈퇴 회원 기존 정보 복구 안내(복구 확인 권한 토큰) |  | 뺌(로그인 전·인증 흐름(대화창은 로그인 뒤)) | `features/member/api.js` `getRecoveryInfo` |
| GET | `/api/terms` | 사용 중인 약관 목록 |  | 읽기 후보 | `features/member/api.js` `getTermsList` |
| GET | `/api/terms/{}` | 약관 전문 조회 |  | 읽기 후보 | `features/member/api.js` `getTerms` |

### notification

| 메서드 | 경로 | 기능 | `@AiTool` | 지원 방식(안) | 프론트 함수 |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/members/me/notification-settings` | 알림 설정 조회 |  | 읽기 후보 | `features/notification/api.js` `getNotificationSettings` |
| PUT | `/api/members/me/notification-settings` | 알림 설정 저장 |  | 쓰기 카드 후보 | `features/notification/api.js` `saveNotificationSettings` |
| GET | `/api/notifications` | 알림 드롭다운 목록 페이지(탭별, 기본 5건) |  | 읽기 후보 | `features/notification/api.js` `getNotifications` |
| POST | `/api/notifications/{}/read` | 알림 읽음 처리 |  | 쓰기 카드 후보 | `features/notification/api.js` `readNotification` |
| POST | `/api/notifications/read-all` | 알림 모두 읽음 처리(탭 무관, 숨김 기준 안의 미읽음 전부) |  | 쓰기 카드 후보 | `features/notification/api.js` `readAllNotifications` |
| GET | `/api/notifications/unread-count` | 미읽음 알림 개수(헤더 배지) |  | 읽기 후보 | `features/notification/api.js` `getUnreadCount` |

### pet

| 메서드 | 경로 | 기능 | `@AiTool` | 지원 방식(안) | 프론트 함수 |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/breeds` | 구분별 품종 목록 |  | 읽기 후보 | `features/community/missingApi.js` `getBreeds`<br>`features/pet/api.js` `getVarieties` |
| GET | `/api/caregiver-invitations` | 보낸 공동양육 초대 목록 | `list_sent_caregiver_invitations` READ | 읽기 | `features/pet/api.js` `getSentInvitations` |
| POST | `/api/caregiver-invitations` | 공동양육 초대 발송 |  | 쓰기 카드 후보 | `features/pet/api.js` `createInvitation` |
| DELETE | `/api/caregiver-invitations/{}` | 취소한 공동양육 초대 삭제 |  | 쓰기 카드 후보 | `features/pet/api.js` `deleteInvitation` |
| GET | `/api/caregiver-invitations/{}` | 받은 공동양육 초대 상세 |  | 읽기 후보 | `features/pet/api.js` `getInvitation` |
| POST | `/api/caregiver-invitations/{}/accept` | 공동양육 초대 수락 |  | 쓰기 카드 후보 | `features/pet/api.js` `acceptInvitation` |
| POST | `/api/caregiver-invitations/{}/cancel` | 보낸 공동양육 초대 취소 |  | 쓰기 카드 후보 | `features/pet/api.js` `cancelInvitation` |
| POST | `/api/caregiver-invitations/{}/reject` | 공동양육 초대 거절 |  | 쓰기 카드 후보 | `features/pet/api.js` `rejectInvitation` |
| GET | `/api/items/{}/image` | 아이템 이미지 |  | 읽기 후보 | 화면에서 안 씀 |
| GET | `/api/members/me/points` | 포인트 요약 | `get_points` READ | 읽기 | `features/point/api.js` `getPointBalance` |
| GET | `/api/pets` | 내 반려동물 목록 | `list_pets` READ | 읽기 | `features/health/api.js` `getMyPets`<br>`features/pet/api.js` `getPets` |
| POST | `/api/pets` | 반려동물 등록 |  | 쓰기 카드 후보 | `features/pet/api.js` `createPet` |
| DELETE | `/api/pets/{}` | 반려동물 삭제 |  | 쓰기 카드 후보 | `features/pet/api.js` `deletePet` |
| GET | `/api/pets/{}` | 반려동물 상세 | `get_pet` READ | 읽기 | `features/health/api.js` `getPetDetail`<br>`features/pet/api.js` `getPet` |
| PATCH | `/api/pets/{}` | 반려동물 수정 | `draft_pet_update` CARD | 쓰기 카드 | `features/pet/api.js` `updatePet` |
| GET | `/api/pets/{}/caregivers` | 양육자 목록 | `list_caregivers` READ | 읽기 | `features/pet/api.js` `getCaregivers` |
| DELETE | `/api/pets/{}/caregivers/{}` | 공동양육 연동 해제 |  | 쓰기 카드 후보 | `features/pet/api.js` `deleteCaregiver`<br>`features/pet/api.js` `leavePet` |
| GET | `/api/pets/{}/character-image` | 캐릭터 이미지(part=full 전신, face 얼굴) |  | 읽기 후보 | 화면에서 안 씀 |
| GET | `/api/pets/{}/daily-missions` | 그날의 케어미션 | `list_daily_missions` READ | 읽기 | `features/point/api.js` `getCareMissions` |
| POST | `/api/pets/{}/representative` | 대표 반려동물 지정 |  | 쓰기 카드 후보 | `features/pet/api.js` `setRepresentativePet` |
| GET | `/api/pets/limit` | 내 반려동물 한도 (운영 설정 최대 수와 남은 자리) |  | 읽기 후보 | `features/health/api.js` `getPetLimit`<br>`features/pet/api.js` `getPetLimit` |
| GET | `/api/pets/main-shortcuts` | 메인 반려동물 바로가기 조회(저장한 적 없거나 전부 숨기면 빈 목록) |  | 읽기 후보 | `features/dashboard/api.js` `getMainShortcuts` |
| PUT | `/api/pets/main-shortcuts` | 메인 반려동물 바로가기 저장(반려동물마다 보일 순서대로, 본문에 없는 반려동물은 그대로) |  | 쓰기 카드 후보 | `features/dashboard/api.js` `saveMainShortcuts` |
| GET | `/api/pixel-characters` | 내 캐릭터·공동양육 캐릭터 목록 | `list_pixel_characters` READ | 읽기 | 화면에서 안 씀 |
| GET | `/api/pixel-characters/{}` | 캐릭터 꾸미기 상세 | `get_pixel_character` READ | 읽기 | `features/pet/api.js` `getPixelCharacter` |
| PUT | `/api/pixel-characters/{}/equipped-items` | 착용 상태 저장 |  | 쓰기 카드 후보 | `features/pet/api.js` `saveEquippedItems` |
| POST | `/api/pixel-characters/{}/held-items` | 아이템 구매 |  | 쓰기 카드 후보 | `features/pet/api.js` `purchaseItems` |
| GET | `/api/pixel-characters/{}/shop-items` | 상점 아이템 목록 | `list_shop_items` READ | 읽기 | `features/pet/api.js` `getShopItems` |
| GET | `/api/point-ledgers` | 월 포인트 내역 | `list_point_ledgers` READ | 읽기 | `features/point/api.js` `getPointHistory` |
| GET | `/api/point-ledgers/months` | 포인트 내역이 있는 연월(월 선택 창) |  | 읽기 후보 | `features/point/api.js` `getPointMonths` |

### place

| 메서드 | 경로 | 기능 | `@AiTool` | 지원 방식(안) | 프론트 함수 |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/place-bookmarks` | 내 장소 즐겨찾기 목록 (카테고리별, 생략하면 전체 분류, 저장 최신순) | `list_place_bookmarks` READ | 읽기 | `features/place/api.js` `getPlaceBookmarks` |
| POST | `/api/place-bookmarks` | 장소 즐겨찾기 저장 |  | 쓰기 카드 후보 | `features/place/api.js` `addPlaceBookmark` |
| DELETE | `/api/place-bookmarks/{}` | 장소 즐겨찾기 해제 | `delete_place_bookmark` CARD | 쓰기 카드 | `features/place/api.js` `removePlaceBookmark` |
| GET | `/api/places` | 장소 검색 (카테고리·키워드·지도 범위, 추천·거리·이름순, 15건씩 또는 whole=true면 범위 전체를 한 번에) | `list_places` READ | 읽기 | `features/place/api.js` `searchPlaces` |

### support

| 메서드 | 경로 | 기능 | `@AiTool` | 지원 방식(안) | 프론트 함수 |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/faqs` | FAQ 목록 (카테고리·질문/답변 검색, 답변 포함) | `list_faqs` READ | 보류(ai skip: 사용법 문항이 search_guide와 겹침(운영 FAQ 문항이 정해지면 다시)) | `features/faq/api.js` `getFaqs` |
| GET | `/api/inquiries` | 내 1:1 문의 목록 |  | 읽기 후보 | `features/inquiry/api.js` `getInquiries` |
| POST | `/api/inquiries` | 1:1 문의 작성 |  | 쓰기 카드 후보 | `features/inquiry/api.js` `createInquiry` |
| DELETE | `/api/inquiries/{}` | 1:1 문의 삭제(접수 상태만) |  | 쓰기 카드 후보 | `features/inquiry/api.js` `deleteInquiry` |
| GET | `/api/inquiries/{}` | 내 1:1 문의 상세 |  | 읽기 후보 | `features/inquiry/api.js` `getInquiry` |
| PATCH | `/api/inquiries/{}` | 1:1 문의 수정(미답변 상태만) |  | 쓰기 카드 후보 | `features/inquiry/api.js` `updateInquiry` |
| GET | `/api/inquiries/{}/images/{}` | 내 1:1 문의 첨부 이미지 |  | 읽기 후보 | `features/inquiry/api.js` `getInquiryImage` |
| GET | `/api/notices` | 공지사항 목록 (상단 고정 우선, latestYn=true 면 최신순) |  | 읽기 후보 | `features/notice/api.js` `getNotices` |
| GET | `/api/notices/{}` | 공지사항 상세 |  | 읽기 후보 | `features/notice/api.js` `getNotice` |

## 3. 해당 없음(공용 보조 API)

회원 기능이 아니라 화면을 거드는 API라 1·2장의 개수와 후보에서 뺐다. 필요하면 각 도메인 도구 안에서 쓴다.

| 도메인 | 메서드 | 경로 | 기능 | 안내 | 프론트 함수 |
| --- | --- | --- | --- | --- | --- |
| global | GET | `/api/common-codes` | 공통코드 하위 목록 | 공용 보조 API(드롭다운 코드·지역·파일 열기) | `features/audit/api.js` `getAuditTaskTypes`<br>`features/inquiry/api.js` `getInquiryTypes` |
| global | GET | `/api/files/{}` | 로그인 회원 누구나 여는 파일 | 공통 규칙 b(사진·파일 보기)에서 다룸 | 화면에서 안 씀 |
| global | GET | `/api/regions` | 하위 지역 목록(없으면 시도) | 공용 보조 API(드롭다운 코드·지역·파일 열기) | `features/community/missingApi.js` `getRegions` |

## 4. 바로가기(화면)

`docs/routes.md` 1장의 화면. AI ✓는 대화창이 그 화면으로 보낼 수 있는 URL(AI 라우팅 매핑 대상)이다.

| 화면 ID | 화면 | URL | 담당 | AI 바로가기 |
| --- | --- | --- | --- | --- |
| MAN-002 | 랜딩 | `/` (`?redirect=`). 로그인 상태면 `/main` (COM-003-08) | YAY |  |
| MAN-001 | 메인 | `/main`. 복귀 경로 없을 때 목적지 (COM-003-06) | YAY | ✓ |
| ACC-002 | 로그인 | `/login` (`?redirect=`). SNS 인가 콜백 `/login/sns/:provider/callback`(provider: `kakao`·`google`, 네이버는 2026-11-23 뺌. 백엔드·제공자 콘솔 redirect URI와 같다)도 로그인 화면이 받고, 처리 뒤 `/login`으로 바꾼다 (2026-11-05) | YAY |  |
| ACC-001 | 회원가입 | `/signup`. 1~4단계·SNS 가입·재가입 복구는 같은 URL | YAY |  |
| ACC-011 | 비밀번호 찾기 | `/password/find` | YAY |  |
| ACC-012 | 비밀번호 재설정 | `/password/reset`. 비밀번호를 URL에 노출하지 않음 (ACC-012-08) | YAY |  |
| ACC-020 | 회원탈퇴 | `/mypage/withdraw`. 완료는 탈퇴 뒤 비로그인이라 공개 URL `/withdraw/complete`(탈퇴 직후 이동으로만 열림, 바로 열면 랜딩) (2026-11-05) | YAY |  |
| COM-008 | 알림 설정 | `/settings/notifications` | LJS | ✓ |
| AIM-011 | AI 대화창(새 창) | `/ai-chat` (COM-007 런처가 엶) | LJS |  |
| COM-009 · CMU-005 | 채팅(새 창) | `/chat` (`?otoChatRoomSn=`). 새 창 확정 (기능 분배 3.1절 20번) | LJS |  |
| HLT-011 | 종합 건강기록 | `/health` | JAJ | ✓ |
| HLT-002 | 건강 일지 | `/health/diary` (매핑표 13행) | JAJ | ✓ |
| HLT-003 | 케어 캘린더 | `/health/calendar` (매핑표 11·12행) | JAJ | ✓ |
| HLT-005 | 검진상세 | `/health/pets/:petSn/checkups/:ckupRcdSn`. 단독 진입 불가 (매핑표 41행) | JAJ |  |
| HLT-007 | 검사 수치 입력 | `/health/pets/:petSn/checkups/:ckupRcdSn/inspections`. 검진상세 경유 (매핑표 42행) | JAJ |  |
| HOS-001 | 플레이스 | `/places` (`?category=hospital·beauty·goods·pet-friendly·hotel`) (매핑표 2·17~20행) | YAY | ✓ |
| CMU-001 | 펫이야기 | `/community` · `/community/posts/:pstSn` · `/new` · `/:pstSn/edit`. 남이 수정 URL로 오면 상세로 (CMU-001-15) | KSJ |  |
| CMU-002 | 실종센터 | `/community/missing` · `/:lostTpofSn` · `/new` · `/:lostTpofSn/edit`. 남이 수정 URL로 오면 상세로 (CMU-002-06) | KSJ |  |
| CMU-003 | 펫뉴스 | `/community/news` · `/:newsSn` | KSJ |  |
| CMU-004 | 펫돌봄 | `/community/petcare` · `/new` · `/:petPrtcRcrtSn` · `/:petPrtcRcrtSn/edit` | KSJ |  |
| CSC-001 | 공지사항 | `/notices` · `/:ntcMttrSn` | KSJ |  |
| CSC-002 | FAQ | `/faqs`. AI 폴백 2회 실패 시 이동 (AIM-005-05) | KSJ | ✓ |
| CSC-003 | 1:1 문의 | `/inquiries` · `/new` · `/:otoInqrySn` | KSJ |  |
| MYP-001 | 마이페이지 홈 | `/mypage` | SJM | ✓ |
| MYP-002 | 반려동물 목록 | `/mypage/pets`. AI의 "반려동물 등록"도 여기로 (매핑표 26행) | SJM | ✓ |
| MYP-004 | 공동양육자 | `/mypage/caregivers` | SJM | ✓ |
| MYP-005 (5-3) | 공동양육 초대 수락 | `/mypage/invitations/:invitationToken`. 초대 링크·알림으로 들어옴 | SJM |  |
| MYP-010 | 픽셀 캐릭터 | `/mypage/characters` | SJM | ✓ |
| MYP-020 | 포인트·케어미션 | `/mypage/points` | SJM | ✓ |
| MYP-030 | 가계부 | `/mypage/expenses` | SJM | ✓ |
| MYP-030 (30-2) | 가계부 전체 내역 | `/mypage/expenses/all` (`?month=YYYY-MM`) | SJM |  |
| MYP-040 | 회원정보 수정 | `/mypage/profile` | SJM | ✓ |
| ADM-001 | 관리자 대시보드(관리자 홈) | `/admin`. 관리자 로그인 뒤 목적지 (ADM-001-01) | LJS |  |
| ADM-010 | 회원 목록 | `/admin/members` | LJS |  |
| ADM-011 | 회원 상세 | `/admin/members/:mbrSn` (`?tab=`) | LJS |  |
| ADM-012 | 회원 제재 | `/admin/members/suspensions`. 정지·해제는 모달 | LJS |  |
| ADM-013 | 탈퇴 회원 | `/admin/members/withdrawn` | LJS |  |
| ADM-020 | 게시글·댓글 | `/admin/posts` (`?tab=comments`) · `/admin/posts/:pstSn` | LJS |  |
| ADM-021 | 실종제보 | `/admin/lost-reports`. 상세는 모달 | LJS |  |
| ADM-022 | 펫돌봄 거래 | `/admin/care-matches`. 매칭 상세는 모달 | LJS |  |
| ADM-023 | 노출 콘텐츠 | `/admin/exposure` (`?tab=`) | LJS |  |
| ADM-030 | 신고 처리 | `/admin/reports` · `/admin/reports/:dclrSn` | LJS |  |
| ADM-040 | 공지사항 | `/admin/notices` · `/new` · `/:ntcMttrSn/edit` | LJS |  |
| ADM-041 | FAQ | `/admin/faqs`. 등록·수정은 모달 | LJS |  |
| ADM-042 | 1:1 문의 | `/admin/inquiries` · `/admin/inquiries/:otoInqrySn` | LJS |  |
| ADM-050 | 펫뉴스 | `/admin/news` (`?tab=`) | LJS |  |
| ADM-051 | 약관 | `/admin/terms` · `/admin/terms/new` | LJS |  |
| ADM-070 | 아이템 | `/admin/items` | LJS |  |
| ADM-071 | 케어미션 | `/admin/care-missions` | LJS |  |
| ADM-072 | 포인트 | `/admin/points` (`?mbrSn=`) | LJS |  |
| ADM-073 | 기본 캐릭터 | `/admin/default-characters` | LJS |  |
| ADM-080 | 라우팅 매핑표 | `/admin/ai-routes` | LJS |  |
| ADM-082 | 처리 현황 | `/admin/processing` (`?tab=`) | LJS |  |
| ADM-090 | 알림 템플릿 | `/admin/notification-templates` | LJS |  |
| ADM-091 | 발송 이력 | `/admin/notification-logs` | LJS |  |
| ADM-100 | 공통코드 | `/admin/codes` | LJS |  |
| ADM-101 | 품종 | `/admin/breeds` | LJS |  |
| ADM-110 | 운영 설정 | `/admin/settings` | LJS |  |
| ADM-111 | 배치 현황 | `/admin/batches` (`?batch=`) | LJS |  |
| ADM-112 | 외부 API 사용량 | `/admin/external-api-usage` | LJS |  |
| ADM-113 | 관리자 계정 | `/admin/admins` | LJS |  |
| ADM-114 | 감사 로그 | `/admin/audit-logs` | LJS |  |

화면 62개 중 AI 바로가기 14개.

## 5. 백엔드에서 못 찾은 프론트 호출

없음.
