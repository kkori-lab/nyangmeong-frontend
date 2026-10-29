# LJS 핸드오프

## 지금 하는 것

SCR-AIM-013 대화창 영수증 분석 서버 연결 — 끝(2026-10-29): 검증 통과·사람 확인 끝. 이미지 전송을 `/messages` 없이 `POST /ai/receipts`(출처 AIMC0031)로 분석하고, 끝나면 `receipt-result`(RECOGNIZED·FAILED·ERROR·CANCELED)로 함께 보낸 글·요약 한 줄을 이력에 저장. 결과 카드는 응답 `ocr` 그대로(추가-1 총금액·할인·결제 금액). 분석 중 [취소]는 요청 끊기 + CANCELED. 영수증 가짜 메시지·취소·결과 코드 삭제. 결정: 이미지만 보낸 새 대화는 "영수증 분석"으로 방 생성, [확인 후 저장] 본창 전달은 `localStorage`(읽으면 지움)

## 다음에 할 것

- SCR-AIM-013 병합 순서: ai 저장소 SCR-AIM-013(`receipt-result`·`AIMC0031`, 작업 사본 커밋 전)·백엔드 공통코드 AIMC0031 PR과 같은 때 병합한다. 공통코드는 알림 코드가 그대로라 `notiTabs.js` `INQRY_ANSWR`='AIMC0030' 유지
- SCR-AIM-013 연결 남음: FN-AIM-013-06·08·09 Java 영수증 저장·인식 결과 조회 API(LJS 백엔드). 지금 영수증은 ai 서버 가짜 저장소(Python 메모리)에 있고, [확인 후 저장]은 `features/ai/api.js` `keepChatReceiptResult`·`getChatReceiptResult`가 `localStorage`로 넘긴다. 조회 API가 생기면 본창이 `recptSn`으로 직접 읽게 바꾸고, 다시 연 대화의 결과 카드 다시 불러오기(013-09 미결)를 다시 본다. 반려동물은 계속 `fakePets`(SJM, SCR-AIM-011 연결 몫)
- SCR-AIM-013 사람이 볼 것(검증 판정 밖): 클라이언트 안전망은 20초(`SERVER_ANALYZE_GUARD_MS`, 기획 문구는 15초 — 서버 504가 15초라 동작 같음). 시간 초과·일시 오류, 결과 카드 [취소] 무저장, 할인 0 "없음"·결제 금액 없음 총금액 —은 코드로만 확인. 총금액은 결제 금액 + 할인 합계로 만든 값이라 영수증 할인이 하단·구역 할인으로 안 잡히면 실제 총액과 다를 수 있다
- 전달(SCR-AIM-008, PR 전): JAJ에게 "건강 일지 영수증 결과 확인 모달(`features/health/diary/Receipt*`·`receiptUtils.js`)이 이제 AI 서버 분석 응답 `{ recptSn, petSn, ocr: { hsptlNm, ckupYmd, recptAmt, btmDscntAmt, sections:[{ sectionNm, sbttlAmt, dscntAmt, items:[{ itemNm, itemAmt }], drugs:[{ mdcnNm, mdcnDays, mdcnUsage, mdcnAmt }] }] } }`를 그대로 읽어요. `receiptApi.js` `getReceiptDetail`·`useReceiptDetail`·`healthKeys.receiptDetail`과 `?fakeReceipt=`는 지웠고, `saveReceiptCheckups` 인자는 `recptSn`이에요. 검진 종류는 응답에 없어 회원이 골라요". ai-23에게 "프론트 연결 끝(검진 영수증·결과 확인 모달). 실제 청구서 확인함. 아조딜 `mdcnUsage`가 null로 와서 1일 횟수 칸이 비어요(회원 입력)"
- SCR-AIM-012 연결 남음: 012-13·14 Java 일정·케어 항목 등록 API(JAJ, 출처 HLTC0067, 사람이 JAJ에게 요청 예정). 나오면 `features/ai/api.js` `registerToHealth` 가짜만 실제 요청으로 바꾼다(카드 필드가 SCHDL·CARE_ARTCL 컬럼 이름 그대로). 직접입력 주기 `cycleDays` 저장 컬럼은 백엔드와 정할 것. 지금은 [등록]해도 캘린더에 생기지 않고 대화에 "✔ 등록됨"만 저장된다
- SCR-AIM-012 PR 전 확인: 프론트는 ai 저장소 LJS 작업 사본(커밋 전)의 `docs/api/chat.md` messages `draft`·`done.card`와 `POST /ai/conversations/{aiCnvrsRoomSn}/register-result`에 붙었다. ai 쪽이 커밋·배포돼야 develop에서 동작한다(ai-23 세션 몫)
- SCR-AIM-012 사람이 정할 것(검증 판정 밖): ① 등록 오류 안내가 `confirmRegister.isError || cancelRegister.isError`라 [취소] 실패 뒤 [등록]이 성공해도 "처리하지 못했어요…"가 남는다(전부터 있던 동작) ② 처리 안 한 카드는 새로고침하면 사라져 내 말풍선만 남는다(결정 A, 나중에 B 브라우저 `sessionStorage` 보관·C 서버 카드 저장을 다시 볼 수 있음). 고치면 추가 요청이나 새 마일스톤으로

- SCR-AIM-002 연결 남음: RECEIPT 판정 뒤 처리(SCR-AIM-013 마일스톤, LJS. REGISTER는 SCR-AIM-012 연결로 끝남). FN-AIM-002-07은 ai 반영(③) 뒤 틀린 LLM 키로 다시 확인해 볼 수 있다
- SCR-AIM-002 AI 서버 반영(ai-c7 2026-10-29, ai 커밋 전): ① ROUTE 이동 안내를 AI 메시지로 저장(`done.message`) — 이동 중 저장 말풍선과 카운트다운 안내가 함께 보이는 것은 그대로 둔다(사용자 결정 2026-10-29) ② 15자 이하 첫 메시지는 그대로 제목 ③ 분류 LLM 장애는 `intent` 없이 `error` 이벤트 — 틀린 LLM 키로 FN-AIM-002-07 재현 가능. 명세 FN-AIM-004 문구 갱신은 사람 몫
- SCR-AIM-002 FN-AIM-002-07 사람 확인: 아래 방법으로도 재현 안 됨, 사용자가 넘어가기로 함(2026-10-29). 검증은 브라우저에서 꾸민 SSE로만 확인된 상태. 원인은 아직 모름
- SCR-AIM-002 FN-AIM-002-07 재현법 정정: LLM 키를 빼면 서버가 안 뜨고, 틀린 키는 위 ③ 때문에 폴백이 된다. ai `.env.local`에 `AI_MODE=real`·올바른 `LLM_API_KEY`인 채로 `ANSWER_FIRST_TOKEN_SEC=0.01`을 넣고 재시작(mock에서는 첫 조각이 바로 나와 재현 안 됨, ai-c7 답 2026-10-29) → 건강 질문 → "일시적으로 답변할 수 없어요" + [다시 시도] → 줄을 지우고 재시작 → [다시 시도]

- SCR-AIM-002 사람이 정할 것(검증 판정 밖, 코드 읽다 나옴): ① 채팅(COM-009) 바로가기 버튼이 채팅 창 대신 본창을 `/chat`으로 옮김(`AnswerBubble`이 `isModal`을 안 씀) ② 서버 저장 전 전송 실패(400·404·502) 때 임시 내 말풍선이 "메시지를 보내지 못했어요"와 함께 남음. 고치면 `### 추가 요청`으로 받는다
- SCR-AIM-002 AI 서버(ai-41) 답(2026-10-28, 그쪽 사람 결정): ① 메시지 테이블은 INSERT 전용이라 [다시 생성] 뒤에도 미완료(`cmptnYn=false`) 메시지가 DB에 남는다 → 프론트 표시 규칙으로 처리: AI 메시지가 `cmptnYn=false`이고 다음 사용자 메시지 전에 다른 AI 메시지가 있으면 미완료를 숨기고(새 답변으로 교체된 것), 없으면 미완료 말풍선 + [다시 생성]. 지금 `ConversationMessages.jsx`는 이 규칙이 없어 다시 열면 둘 다 보인다 — 사람 확인 때 같이 보고 추가 요청으로 고칠지 정한다 ② `param` `?cat=`은 명세 부록 A 값이라 서버는 그대로, 프론트 `screenPaths.js`에서 `category`로 바꿔 쓰는 지금 방식 유지
- SCR-AIM-002 AI 서버에 보낸 것, 답 기다림: 의료 고지 두 번 저장·고지 앞 "※" 없음, `scrNm`에 "화면"이 들어가 "~화면 화면으로 이동할게요", 웃음만 보낸 대화 제목이 LLM 설명문(그쪽 승인 절차 뒤 알려 주기로 함)
- 팀에 알릴 것(SCR-AIM-002, PR 전): "`api/axios.js`에 AI 스트리밍용 `aiStream`을 더했어요. 오류 모양·401 재발급·로그인 이동은 인터셉터와 같고, 이 파일에서만 `fetch`를 써요(eslint 예외 한 줄). 화면 코드는 `fetch`를 직접 쓰지 않아요(`docs/convention/api.md`)"
- SCR-AIM-011 연결 남음: ① FN-AIM-011-08 반려동물 목록 API(SJM)가 붙으면 `AiChatPage.jsx`의 `fakePets`를 `features/pet` 훅으로 바꾸고 `features/ai/api.js` `createConversation`·`getConversations`에 `petSn`을 되살린다(지금은 서버 태그가 모두 "전체", 서버 응답에 `petNm`이 없어 이름은 목록의 펫으로 찾아 붙인다) ② 두 번째 이후 메시지·AI 답변 저장은 SCR-AIM-002에서 서버로 옮김. `fakeMessages`는 일정 등록·영수증 가짜만 남았고 SCR-AIM-012·013 연결 때 지운다 ③ FN-AIM-011-03·17 세션 만료 시 창 닫기(SCR-COM-003 003-10과 함께). 서버가 대화 갱신 시각을 주면 `lastActive`(이어 쓴 대화 목록 순서)를 그 값으로 바꾼다
- 팀에 알릴 것(SCR-AIM-011, PR 전): "AI 서버 요청은 `api/axios.js`의 `aiApi`(같은 오리진 `/ai`)로 보내요. `VITE_AI_API_URL`·`withCredentials`는 쓰지 않고(`docs/convention/api.md`), 오류 모양·401 재발급은 `api`와 같은 인터셉터를 써요. 재발급은 항상 `/api/auth/refresh`예요. `scripts/check-axios-errors.mjs`가 `@/` 별칭 때문에 돌지 않던 것을 고쳤으니 인터셉터를 고치면 `node scripts/check-axios-errors.mjs`를 돌려 주세요"
- ai-e6·백엔드 세션에 알릴 것: 공용 DB를 쓰는 백엔드에서 `POST /ai/conversations`가 502 `EXTERNAL_API_ERROR`를 낸 적이 있다(방과 메시지는 저장됨). ai 저장소 `app/core/backend.py`의 `TIMEOUT_SEC = 3.0`보다 Java 응답이 느린 것으로 보인다. 이때 화면은 "메시지를 보내지 못했어요"를 띄운다(새로고침하면 대화는 목록에 있음)

- 사람이 할 일(SCR-COM-003): ① (완료 2026-10-27) DMS에 공통레이아웃 기능명세서 v0.7(FN-COM-003-03 로그인 직행·003-04·003-01 확인 중 로딩·002-02 역할 불일치 이동)과 화면설계서 v0.10을 올렸다. ② 디스코드로 알린다: "로그인이 필요한 화면(user 레이아웃의 mypage·health·settings·community·support·main)이 이제 `ProtectedRoute`로 감싸져 로그인 없이는 열리지 않아요. 로그아웃 상태로 들어가면 스켈레톤 뒤 `/login?redirect=`로 가고, 회원이 `/admin`에 가면 `/main`으로 가요. 화면을 만들 때 백엔드를 띄우고 로그인해야 해요. `api/axios.js`는 401이면 랜딩이 아니라 로그인으로 보내고(`/login`에서는 이동 안 함), 로그인 화면 보조 요청(`getLoginStatus`·`getCaptcha`)에 `skipAuthRedirect`를 붙였어요" ③ YAY에 알린다: 로그인 화면 `features/member/api.js`·`login/useEmailLogin.js`를 이 PR에서 고쳤다(이메일 입력 중에는 비밀번호·보안코드를 유지하고 칸을 벗어날 때 `checkedEmail`과 다르면 비우고 새 보안코드). `getRoleHome`(`routes/redirect.js`)은 003-08(로그인 상태로 랜딩에 오면 메인으로)에서 쓰면 된다
- SCR-COM-003 연결 남음: `ai`·`chat`·`place`·`main`(bare 랜딩 제외)도 로그인 필요라면 `AppRoutes.jsx`에 `pick('bare', 'member')`를 `ProtectedRoute` 아래에 더해야 한다. `ai`·`chat`은 세션 만료 때 창 닫기(003-10)와 함께 정한다. 배포 때 nginx에서 로그인 쿠키가 없으면 `/login`으로 보내는 방법은 배포 담당과 이야기해 볼 수 있다(`ProtectedRoute` 확인은 그대로 필요). 로그아웃 상태에서 `/auth/me`가 두 번 나가는 것(`main.jsx` 미리 요청 + `useMe`)은 동작에 영향 없음
- 백엔드 세션(`backend-a8`)이 이 세션 요청을 처리함(로컬 커밋, push 전): 알림 목록 정렬을 안 읽음 우선으로(COM-004-05), 시드 알림·미션 경로를 프론트 라우트로 고침. 사람이 할 일: ① DMS 명세 FN-COM-004-05 문구를 새 버전으로 올린다 — 제안 문구 "안 읽은 알림을 먼저, 같은 읽음 상태끼리는 최신순으로 최대 5건 노출한다." ② 미션 이동 경로(`/health/calendar`로 맞춘 시드)는 SJM이 미션 기획대로 확정 ③ 공용 DB의 기존 알림 행은 팀원이 마이그레이션 UPDATE로 고친다
- 디스코드로 알릴 것(백엔드 세션이 적용할 때): 공용 DB 요청이 1초씩 걸린 원인은 DB 왕복 횟수. 백엔드가 JDBC URL 옵션 5개로 약 0.3초까지 줄였고, `application.properties`는 git에 없어 팀원이 직접 URL을 바꿔야 한다
- 알림 화면 로딩 표시 확인: 알림 패널(5행)·프로필 드롭다운·전체 메뉴(NavDrawer) 스켈레톤을 넣었다. `ProtectedRoute`의 `return null`(로그인 확인 전 화면이 통째로 빈다)은 이번에 안 건드렸다 — 헤더·푸터를 먼저 그릴지 결정 대기(공용 파일, `docs/convention/shared-files.md`)
- 디스코드로 알릴 것(공용 `src/api/axios.js`, 팀에 알리지 않고 고침 — 사용자 결정 10-26): "`api/axios.js`가 서버 오류의 `code`·`message`를 읽지 못해 모든 API 오류가 '일시적인 오류가 발생했어요.'로 나오던 것을 고쳤어요. 이제 `error.code`·`error.message`가 서버 값 그대로고, 입력값 오류(`INVALID_INPUT_VALUE`)는 `error.fields`에 `[{ field, message }]`가 와요. 재발급은 401 `TOKEN_EXPIRED`일 때만 하고, `UNAUTHORIZED`·403 `MEMBER_INACTIVE`는 바로 로그인 화면(`/login?redirect=`)으로 가요. `SERVER_ERROR`를 기대하고 분기한 곳이 있으면 확인해 주세요. 인터셉터를 고치면 `node scripts/check-axios-errors.mjs`를 돌려 주세요". SJM: `PetFormModal.jsx:294` `error.fields` 입력칸 문구가 이제 처음 동작한다(화면 확인 안 함)
- SCR-AIM-013 연결 남음 (2026-10-26 확정 반영)
  - 013-04·08·09 채팅 영수증 분석·취소·이력: Spring 경유(`POST /api/receipts`에 요청 출처 'AI 대화창'(AIMG07 신설)을 더하는 방향, 백엔드 논의 중 — LJS 백엔드 / 인식은 Python)
  - 영수증 인식 결과 조회 API 확정(백엔드 10-26, 사용자 결정): `GET /api/receipts/{recptSn}` → `ReceiptResponse` `{ recptSn, ocrPrcsSttsCd, failRsn, hsptlNm, ckupYmd, recptAmt, dstrbDscntAmt, sections:[{ sectionNm, petSn, sbttlAmt, dscntAmt, sectionAmt, ckupCn, items:[{ itemNm, itemAmt }], prescriptions:[{ mdcnNm, mdcnBgngYmd, mdcnEndYmd, dayMdcnNmtm, prscSttsCd, mdcnAmt }] }] }`(분석 응답과 같은 모양, `expense/dto/ReceiptResponse.java`). 없거나 남의 영수증은 404 `RECEIPT_NOT_FOUND`. 조회할 때마다 OCR 원본을 다시 가공해 날짜 기본값·반려동물 자동 연결이 분석 직후와 조금 다를 수 있음(사용자 허용, 화면에서 차이가 보이면 백엔드에 알림). 백엔드 구현은 내부 인증 작업 다음 마일스톤
  - 가짜를 이 모양으로 맞출 것: `features/ai/api.js` `analyzeChatReceipt`(`petAmts` → `sections`, `prscrptnCnt` → `prescriptions`)·`getChatReceiptResult`(`localStorage` 가짜 → `GET /api/receipts/{recptSn}`, 연결 때 `localStorage` 지움)·`recognizeCheckupReceipt`·`ReceiptUploadModal`(`rcptSn` → `recptSn`, `{ items }` → `ReceiptResponse`). 건강 일지 결과 확인 모달(`features/health/diary/ReceiptResultStep.jsx`·`health/receiptApi.js` `getReceiptDetail`, JAJ)의 입력도 `ReceiptResponse` 하나로 바뀌어야 해서 JAJ와 함께 바꾼다(한쪽만 바꾸면 SCR-AIM-008 → 결과 확인 흐름이 깨짐). 본창 조회가 404면 무엇을 보여 줄지 정한다(지금은 실패하면 모달이 안 열림)
  - 이미지와 함께 보낸 글(사용자 확정 10-26, FN-AIM-013-02): 내 말풍선 표시·분석에는 안 씀은 그대로, 서버가 사용자 메시지로 대화 이력에 저장(다시 열면 보이고 AI 컨텍스트 6턴에 포함). 연결 때 글을 서버로 함께 보낸다(요청 형식은 API 계약 때). 지금 가짜는 글을 저장하지 않아 다시 열면 요약 한 줄만 보임
  - [확인 후 저장] 뒤 대화창 닫힘: 사용자 확정(10-26, FN-AIM-013-06, FN-AIM-012-15와 같은 방식)
  - 013-05 카드 필드 이름은 위 `ReceiptResponse`로 맞춘다. 013-06·07 건강 일지 입구 쿼리 이름(`checkup=manual`·`recptSn`)은 JAJ 확인
  - 남은 미결(AI 세션): OCR 요청 출처 코드 AIMG07 'AI 대화창'(백엔드), 다시 열었을 때 결과 카드 다시 불러오기
- JAJ에 알릴 것(SCR-AIM-013): `HealthDiaryPage.jsx`에 넣은 입구 2개(`?checkup=manual&recptSn=` 빈 폼, `?recptSn=` 결과 확인)와 쿼리 이름 확인 요청, 결과 확인 모달 입력을 `ReceiptResponse`(`GET /api/receipts/{recptSn}`)로 함께 바꾸자는 제안. PR #93 참고. 메시지 초안은 2026-10-26 세션에서 사용자에게 전달함
- AI 서버 연결 기반(2026-10-25 결정, 사용자 확정): AI 기능(채팅·영수증 OCR·캐릭터 생성·검사결과지 PDF 분석)은 프론트가 Python을 직접 부르고, 나머지와 영수증 save-check·save는 Spring. 주소는 같은 오리진 경로 접두사로 나눈다 — 배포 nginx `/api/` → Spring(:8080), `/ai/` → Python(:8000), 둘 다 접두사를 자르지 않는다(`proxy_pass` 끝 슬래시 없음). 개발은 `vite.config.js` 프록시 `'^/ai/'`(커밋 `5c35ea3`. `/ai` 단독은 화면 URL `PATHS.AI`라 제외). 백엔드·AI 세션에 `/ai` 접두사 요구 전달함
  - nginx에서 Python `/internal/v1/...`·`/health`는 내보내지 않는다(`location /ai/`만)
  - 2026-10-26 정정(사용자 결정, AI·백엔드 세션 통보): DB는 Java만 다루고 Python은 상태 없는 AI 서버. 영수증 OCR(`POST /api/receipts`, `/api/receipts/{recptSn}/analyze`·`/cancel`)·캐릭터 생성(`POST /api/pets/{petSn}/pixel-characters`)·채팅 영수증 분석(SCR-AIM-013, 백엔드 확인 중)은 Spring 경유, Python 직접은 AI 채팅(`/ai/conversations…`, 스트리밍)만. Vite·nginx `/ai/` 프록시는 그대로. PDF 분석 위치도 Spring 경유로 바뀔 가능성(미확정)
  - 2026-10-29 정정(사용자 결정, ai-23 안내): 검진 영수증 OCR(SCR-AIM-008)은 Python 직접 `POST /ai/receipts`(multipart, 응답 `{ recptSn, ocr }`, 계약은 ai 저장소 `docs/api/ocr.md`). 저장 전 확인·저장은 Java(아직 없음)
  - 연결 작업 때 고칠 것(사용자 결정 10-26): `features/ai/api.js` `analyzeChatReceipt` 머리 주석 "경로 미정, Python AI 서버 `/ai/` 아래" → Spring `/api/receipts` 경유. 검진 영수증(`ai/api.js` `recognizeCheckupReceipt` "POST /receipts/recognize/checkup 추정")·가계부 영수증(`expense/api.js` "POST /receipts/recognize")·캐릭터 생성(`pet/api.js` "POST /pets/{petSn}/character")의 추정 경로도 위 Spring 경로와 맞춘다
  - AI 세션·백엔드 세션 답장 보냄(10-26): 경로 변경 영향 작음(가짜뿐), SSE 미착수, `/ai/` 인증 오류(401·403 `MEMBER_INACTIVE`·502 `EXTERNAL_API_ERROR`)는 `aiApi`에 같은 인터셉터를 붙여 받고 SSE는 `fetch`에서 같은 규칙으로 처리할 예정. 백엔드에 영수증 번호로 인식 결과를 받는 조회 API 요청
- 디스코드로 알릴 것(PR #87 병합됨): "`SubPageLayout`을 쓰는 섹션 화면(건강기록·커뮤니티·고객센터·마이페이지)의 앱(≤760) 위 8px·아래 126px 여백을 뺐어요. 헤더~경로 24px, 콘텐츠 끝~탭바는 main 여백만 남아요. 화면 안에서 아래 여백을 따로 기대던 곳이 있으면 확인해 주세요"
- SJM에 전달: 마이페이지 화면설계서 v0.6 ⑦ "상단 여백 약 40 → 20px"와 달리 구현은 섹션 화면 공통 24px로 정했다(마이페이지만 다르게 두지 않음). 설계서 문구를 고쳐 달라고 한다. 같은 ⑦의 "하단 여백 축소"는 PR #87로 반영
- 결정 대기(사람): 페이지 머리 구조. v5 시안(`nyangmung-com.css` COM-5 "별도 브레드크럼은 쓰지 않아요 (10-12)")과 마이페이지 시안은 첫 줄이 섹션 이름("마이페이지")이고, 구현(`SubPageHead`)은 경로 줄(홈 / 섹션 / 메뉴)이다. 시안 구조로 바꿀지(27개 화면 영향) 그대로 둘지 정한다. 공통레이아웃 화면설계서 v0.8은 "브레드크럼 사용"으로 올라가 있다
- 백엔드 세션에서: EXPND 사용처 컬럼(varchar(80) NULL, 기준 컬럼은 `CKUP_RCD.HSPTL_NM`, 기존 `DTL_MTTR`과 역할 정리), 초대받은 사람(연동 전)의 PetFace(`GET /pets/{petSn}/character-image`는 `PetAuthorizer`라 막힘), 초대 일부 수락 API(지금은 일괄 수락만), 알림 `mvmnPath`의 초대 식별자 이름(`invitationToken` vs `jntBrupInvtnSn`, 미정)
- YAY에 알릴 것: 로그인 → [회원가입] 이동(`pages/auth/LoginPage.jsx` `navigate(PATHS.SIGNUP)`)과 가입 완료 → 로그인(`SignupPage.jsx` `/login?joined=1`)에서 `?redirect=`가 사라진다. 공통레이아웃 명세 v0.6 FN-COM-003-02·05로 유지가 정해짐(초대 링크로 온 미가입자)
- 공동양육 알림 이동(SJM이 알림을 만들 때): 초대 수신은 `/mypage/invitations/:invitationToken`, 결과·연동 해제는 `/mypage/pets`. `docs/routes.md` 79행을 정정했고(추가-3) 백엔드 세션에도 전했다

- 서브 화면 경로(SCR-COM-002 B-01) 확인 남음(각 담당 화면, 선택): 761~1100px 폭과 건강기록(JAJ)·마이페이지(SJM)·고객센터(KSJ) 실제 화면에서 경로 줄·섹션 제목 위치를 한 번 본다. 공용 틀(`SubPageHead`·`SubPageLayout`·`SideMenu`)을 고쳤다. 사이드 메뉴 이탈 확인(`onLeave`)이 develop 병합 뒤에도 되는지 글쓰기 화면에서 본다
- SCR-COM-002 PR 전: 아래 디스코드 알림을 보내고, `docs/convention/ui.md` "로딩 표시" 절 변경을 팀과 합의한다. KSJ에 알릴 것: `useNotices`·`useFaqs`·`useInquiries`에 `placeholderData: keepPreviousData`(탭·검색·쪽 이동 때 이전 내용 유지), 390px `/faqs` 카테고리 탭 줄 때문에 가로 스크롤(범위 밖, 다 불러온 뒤)

- 로딩 스켈레톤 확인(각 담당): "불러오는 중이에요" 문구와 `return null` 로딩 분기를 각 페이지의 실제 카드 배치 스켈레톤으로 바꿔 두었다(LJS, SCR-COM-002, 1440·390px에서 높이 ±20% 확인). 화면 배치를 바꾸면 그 페이지 파일 안 `XxxSkeleton`(또는 로딩 분기)도 같이 고친다. 새 화면·새 로딩 분기는 `docs/convention/ui.md` "로딩 표시" 절대로 만든다

  | 컴포넌트 | props | 쓰는 곳 |
  | --- | --- | --- |
  | `@/components/PageSkeleton` | `top`(칩·탭 위 카드, 예: 히어로), `chips`·`tabs`(개수), `children`(카드 배치, 없으면 큰 카드 1장) | 페이지 본문 전체를 대신하는 로딩 |
  | `@/components/SkeletonCard` | `className`(높이·칸, 기본 `h-64`) | 카드 한 장 자리. 대시보드는 실제 그리드에 놓는다(예: `HealthDiaryPage`) |
  | `@/components/Skeleton` | `className`(크기·모양, 예: `h-5 w-40`), `lines`(여러 줄, 마지막 줄 짧게) | 카드가 아닌 작은 요소(검색창·버튼·탭 글자·쪽 번호·구역 제목)나 카드 안 한 구역 |

  ```jsx
  /** 첫 진입: 페이지 파일 안 XxxSkeleton으로 실제 배치 */
  if (isPending) return <XxxListSkeleton />;
  function XxxListSkeleton() {
    return (
      <PageSkeleton>
        <Skeleton className="h-12 w-[300px]" /> {/** 검색 줄 */}
        <SkeletonCard className="h-[754px]" /> {/** 목록 카드 */}
      </PageSkeleton>
    );
  }
  /** 페이지 안 컴포넌트가 따로 조회: 그 카드와 같은 크기 */
  if (isPending) return <SkeletonCard className="h-64" />;
  ```

  - KSJ: `pages/notice/NoticeListPage`·`NoticeDetailPage`, `pages/faq/FaqListPage`, `pages/inquiry/InquiryListPage`(로딩 분기 2곳이 같은 `InquiryListSkeleton`)·`InquiryDetailPage`·`InquiryEditPage`
  - JAJ: `pages/health/HealthSummaryPage`(`SummarySkeleton`)·`HealthDiaryPage`·`CheckupDetailPage`·`CareCalendarPage`(`CalendarSkeleton`, 일정 실패 시 대기 안 함)·`LabInputPage`, `features/health/CareList`·`diary/ReceiptResultStep`·`diary/CheckupListCard`·`diary/ObservationCard`, `features/health/queries.js`(`useDailyRecords`·`useObservations`·`useCheckups`·`useSchedules`에 `keepPreviousData`)
  - SJM: `pages/mypage/PetListPage`, `features/pet/list/FamilySection`·`list/SentInvitations`·`invite/InvitationAccept`
  - 공용(LJS): `components/Pagination`(카드 쪽 번호, 가계부 전체 내역·건강 일지 검진 카드)도 누르면 맨 위로 간다
  - PR 전 디스코드 알림: "페이지를 이동하면 스크롤이 맨 위로 가도록 `UserLayout`·`AdminLayout`에 넣었어요(뒤로가기는 원래 위치로 돌아가요). 쪽 번호(`BoardPagination`·`Pagination`)를 눌러도 맨 위로 가요. 첫 진입에 깜빡이던 '불러오는 중이에요'와 로딩 중 `return null`은 각 페이지의 실제 카드 배치 스켈레톤(`PageSkeleton`·`SkeletonCard`·`Skeleton`)으로 바꿨어요. 위 파일들이 바뀌었으니 화면 배치를 바꾸면 그 페이지의 `XxxSkeleton`도 같이 고쳐 주세요. 규칙은 `docs/convention/ui.md` '로딩 표시' 절, 사용법은 `handoff/LJS.md`에 있어요"

- SCR-CMU-005·COM-009 연결 남음: 채팅·매칭 API(KSJ, 백엔드 `docs/api/community.md`)로 `features/chat/api.js` 가짜를 바꾸고 가짜 읽음 위치 `localStorage['fake-chat-read-seq']` 코드를 지운다. 붙인 뒤 `room/FakePeerTools.jsx`·`fakePeerAct`·`/dev/chat`(`pages/dev/ChatDevPage.jsx`)·`fakeChat*` 쿼리 코드를 지운다. 009-18 알림 억제는 서버(YAY). 장소 검색은 YAY(`searchChatPlaces` → `GET /places`, 주소 검색 범위는 백엔드 issues 99번 13)
- KSJ에 물을 것(CMU-005 가짜가 추정한 것): ① 목록 `ChatRoomSummary`에 내 역할(`myRole`)·거래 상태(`mtchDlngSttsCd`)가 없다(탭·배지에 필요) ② 방 응답에 모집글 일정·비용 요약이 없다(카드 펼침 `rcrtSummary`) ③ 메시지 보낸 시각 필드(사람이 DDL 확인 후 정함) ④ 시스템 안내 메시지 유형과 강조(`sysToneCd`), 요청 취소 사유 표시(`tagCn`) ⑤ 주소 공유 필드 배치(가짜는 `shrnAddr`=장소, `msgCn`=상세 주소) ⑥ 매칭 요청 `CareMatchCreateRequest`의 조건 필드를 화면이 어디서 받나(시안은 "현재 모집글 조건으로 요청") ⑦ 완료 요청이 입력 없이 가능한지(백엔드는 회차·종료 시각·내용·사진을 받는다) ⑧ 채팅방 나가기·다시 요청·무응답 종료 API 없음(백엔드 issues 17) ⑨ 사진 업로드 방식(issues 15)
- 게시글 상세(SCR-CMU-004, KSJ): [채팅하기]는 `@/context/chatModal`의 `useChatModal().open({ pstSn })`, 보호자 [채팅 목록 보기]는 `open({ listPstSn })`로 채팅 모달을 연다(SCR-COM-009 채팅 모달 복귀, 2026-10-22). 모달의 [새 창으로 띄우기]가 새 창을 연다
- 사람이 고치는 문서: 백엔드 저장소 `docs/convention/milestone.md` 담당 표에 채팅 화면 LJS 이관 반영(채팅은 다시 모달, 2026-10-22. 명세 FN-COM-009-03 "모달"과 맞다)
- SCR-CMU-005 남은 화면 일(선택): 거래 버튼을 아주 빠르게 두 번 누르면 두 번째 요청이 서버에 가 거절 토스트가 뜬다(`useDealAction`의 `onSettled`가 `invalidateQueries`를 반환하지 않음). 메시지 시각·날짜 구분선은 `msgDt`가 정해지면 `ChatConversation.jsx`에 날짜 구분선 추가
- 공용 페이지 머리·사이드 메뉴 적용: 건강기록·마이페이지·커뮤니티·고객센터가 모두 `@/layouts/SubPageLayout`을 쓴다(건강기록 4개와 고객센터는 2026-10-23에 옮김). 새 화면은 `SubPageLayout`으로 감싼다. 메뉴 이름·순서·그림은 `layouts/subMenus.js`(`SUB_MENUS`)만 고친다. 다 옮겼으니 `/dev/sub-page`(`pages/dev/SubPageDevPage.jsx`)와 `routes/domains/dev/`의 해당 라우트는 지워도 된다(사람이 정함). 사용법:

  | prop | 기본값 | 하는 일 |
  | --- | --- | --- |
  | `section` | (필수) | `SUB_MENUS` 키: `health`·`community`·`mypage`·`support` |
  | `menu` | 현재 경로와 같은 메뉴 | 선택할 사이드 메뉴의 `to`. 경로가 메뉴 아래가 아닌 상세·글쓰기 화면에서 넘긴다 |
  | `title` | 선택 메뉴 이름 | 넘기면 3단계(섹션 › 메뉴 › 제목) |
  | `back` | `title`이 있으면 true | 본문 위 `‹ 목록으로`(선택 메뉴로) |
  | `description` | 없음 | 제목 아래 설명. 없어도 한 줄 높이를 비운다 |
  | `pixel` | true | false면 머리 그림을 끈다 |
  | `onLeave` | 없음 | 경로·목록으로 링크를 누르면 이동 대신 `onLeave(to)` 호출(작성 중 나가기 확인) |
  | `contentClassName` | `min-[1101px]:pt-6` | 본문 위 여백 바꾸기(펫이야기·펫뉴스 `min-[1101px]:pt-0`, 펫돌봄·실종센터 `min-[1101px]:pt-[7px]`) |

  ```jsx
  <SubPageLayout section="health" description="…">…</SubPageLayout>                                        {/** 목록: 건강기록 › 건강 일지, 761~1100px ▾ */}
  <SubPageLayout section="health" menu={PATHS.HEALTH_DIARY} title="검진상세">…</SubPageLayout>              {/** 3단계 + ‹ 목록으로 */}
  <SubPageLayout section="community" menu={PATHS.COMMUNITY} back>…</SubPageLayout>                          {/** 커뮤니티 상세: 커뮤니티 › 펫이야기 + ‹ 목록으로 */}
  ```

- 하네스 확인: 다음 화면 작업 PR의 `/end`에서 처음으로 `pr-assets` 릴리스를 만들고(사람 확인 후) 캡처 업로드·Screenshots 표 채우기가 되는지 본다. 검증 루프가 `.claude/skills/`도 기준 파일로 잠가 하네스 작업은 실패 뒤 고칠 수 없다(이번엔 사람이 clear). 하네스 작업이면 예외를 둘지 팀과 정한다

- KSJ 확인: 펫이야기 작성·수정 URL을 `/community/posts/new`·`/community/posts/:pstSn/edit`로 해석해 `paths.js`에 넣음
- 범위 밖 1px 경계(말만, 각 담당): `layouts/SideMenu.jsx`·`SubPageLayout`·`SubPageHead`(`min-[1101px]`·`max-[1101px]`, 디자인 ≤1100 기준. 헤더는 1100에서 GNB라 정확히 1100px에서 GNB와 `▾`가 같이 보임), `features/pet/list/PetSlide.jsx`(SJM)·`pages/health/CareCalendarPage.jsx`(JAJ)의 `min-[1101px]`·`min-[761px]`
- 선택: Figma MCP 한도가 풀리면 헤더 아이콘 원본 SVG(317:2097·317:2106·317:2087)와 비교해 바꾸고, 색을 바꿀 일이 생기면 `currentColor` 인라인 SVG로. AI 대화창 모바일·바텀 네비는 시안 없이 만들었으니 디자인 담당과 맞춘다
- SCR-AIM-006 연결 남음(가짜로 끝남): 006-01~08·10·15~18·20 사전 알림 배치(LJS 백엔드) — 매일 09:00 KST 스캔으로 케어 캘린더 병원 일정 D-N 대상 추출, 연동 양육자 전원(탈퇴 제외)별 설정(채널·D-0/1/3/7·케어 일정 유형) 적용, 이메일(가입 주소, 제목 `[냥멍케어] {반려동물명}의 {검진유형} 일정이 {D-N} 남았어요`, 당일은 "오늘이에요")·인앱(`CARE_SCHDL`, `mvmnPath` `/health/calendar`) 생성, 이력·10분 간격 3회 재시도·(회원+일정+일정일+시점+채널) 중복 방지. 메일 [케어 캘린더에서 확인하기]는 `/health/calendar`, 수신 해제는 `/settings/notifications`. 006-09·11·12 프론트는 알림 목록·미확인 수 API(LJS 백엔드)로 가짜를 바꿀 때 같이(SCR-COM-004 연결). 006-13 메일 링크 미인증 복귀는 로그인 연결 때 `ProtectedRoute`·`getRedirectPath`(YAY). 배지 1분 polling은 KSJ 채팅 안 읽은 수 방식이 정해지면 맞춘다
- SCR-AIM-010 연결 남음(가짜로 끝남): 검진기록 등록·수정 모달(SCR-HLT-002, JAJ)이 `ReceiptUploadModal`의 `onManualInput({ rcptSn? })`으로 빈 폼을 연다. `rcptSn`이 있으면 저장 때 영수증 상태를 인식실패→저장완료로 바꾸는 일은 LJS 백엔드·JAJ 저장 API와 맞춘다(명세 10-06 [확인 필요]). 영수증 인식 결과 확인 모달(SCR-HLT-002, JAJ)은 `onRecognized(result)`를 받는다. 부분 인식은 `ckupYmd`·`ckupAmt`가 `null`일 수 있다
- 사람이 고치는 문서(SCR-AIM-010 추가 요청): 기능명세서 v0.7 FN-AIM-010-03 [다시 촬영]→[다시 올리기], FN-AIM-010-07 문구 2종 "다시 촬영하거나"→"다시 올리거나". 화면설계서 v0.9 SCR-AIM-010 ② 라벨과 같은 문구도 같이
- SCR-AIM-008 연결 남음(2026-10-29 AI 서버 연결로 끝남): 저장 전 확인·저장(`health/receiptApi.js` `prepareReceiptSave`·`saveReceiptCheckups`)은 가짜. Java 영수증 저장 API(LJS 백엔드)와 가계부 지출·중복 확인(SJM)이 나오면 바꾸고, 저장 때 `recptSn`을 넘긴다. 결과 모달 원본 썸네일(FN-AIM-009-01)은 분석 응답에 이미지 주소가 없어 아이콘. 반려동물 목록(SJM) `vrtyNm` 키 확정 대기
- 반려동물 구역 없는 영수증·서버 400·409·504는 검증 때 응답을 가로채서만 확인했다. 실제 구역 없는 영수증이 생기면 건강 일지 [영수증으로 등록하기]로 고른 반려동물 탭 하나로 시작하는지 본다. 구역 없는 영수증의 구역 `dscntAmt`는 하단 할인과 합쳐 비율 배분한다(`getSplitDiscount`, 명세 FN-AIM-009-20 해석)
- 팀에 알릴 것(SCR-AIM-008, PR 전): SJM에게 `receiptFile.js`를 `src/utils/`로 옮겼다고 PR에 적는다. `common.md` "비동기" 절 추가는 팀 합의 문서라 PR에서 알린다
- 선택: `src/utils/formatDate.js`로 바꿀 수 있는 곳 — `ConversationHeader.jsx`의 `formatDate`는 `formatDate(crtDt)`, `features/expense/shared/expenseFormat.js`의 `formatMonthDay`는 `formatDate(expndYmd, { hasYear: false, separator: '-' })`. 이번에 안 건드렸다
- 범위 밖에서 본 것(말만): `ConversationMessages.jsx`의 `{children && <li>…}`가 항상 참이라 대화 목록 끝에 빈 `<li>`가 생긴다
- 사람이 고치는 문서(SCR-COM-002 반응형): FN-COM-002-23 햄버거·002-20 TOP은 기능명세서 v0.5·화면설계서 v0.8(2026-10-25)에 반영됨. 남은 것: FN-COM-006-07 터치 동작의 "반응형 범위 확정 후"를 범위 확정(≤1100px·≤760px)으로, 화면설계서 SCR-COM-006 터치(잠정) 문구
- SCR-COM-002 반응형 남은 것: 실제 대표전화·팩스 번호를 디스코드로 받아 `UserFooter.jsx`의 `TEL_PLACEHOLDER`·`FAX_PLACEHOLDER`에 넣는다. drawer 슬라이드 애니메이션(시안에 있음)·Tab 포커스 가두기는 안 했다. AI 플로팅 버튼의 고양이 이미지(시안 `.fab-ai`, `src/assets/ai-character.png`)는 디자인 담당과 맞춘다
- SCR-COM-008 남은 것: 008-12 캐릭터 완료 알림을 설정 가능하게 할지는 명세 확정 대기(명세 작성자). 알림 설정 API 연결은 끝남
- SCR-COM-004 남은 것: 004-08 공동양육 초대 알림 이동(알림 생성 SJM), 004-09 펫돌봄 알림의 채팅 모달(채팅 API·알림 생성 KSJ, 시드 `mvmnPath`는 `/chats`라 방 번호가 없음), 커뮤니티(`AIMC0010`) 알림 이동 경로(KSJ와 결정, `docs/routes.md` 79행에 없음), 공지 알림이 `/notices` 목록인지 `/notices/{sn}` 상세인지 결정. 시간 표시("10분 전")는 `NotificationSummary.regDt`로 화면에서 계산할 수 있다
- SCR-COM-003 연결 남음: 003-08 로그인 상태로 랜딩에 오면 `/main`으로(`useMe` 필요, 로그인 연결 때, YAY). 003-10 AI 대화창이 401이면 인증 오류 표시 후 창 닫기(SCR-AIM-011). 로그인 화면(ACC-002, YAY)은 성공 뒤 `routes/redirect.js`의 `getRedirectPath(location.search)`로 이동 경로를 정한다(YAY에 알릴 것). 테스트 러너가 없어 이 함수의 회귀 테스트가 없다(러너 추가는 의존성이라 팀 결정)
- SCR-COM-005 연결 남음: 005-02 회원 요약 조회 API(LJS 백엔드)로 `getMemberSummary`를 바꾸고 응답 키(`maskedAcntEml`, 명세 기준)를 Swagger로 확인, 005-07 로그아웃 API(YAY)로 `logout`을 바꾼다(로그인 연결 때)
- 사람이 고치는 문서 (`?cat` → `?category`):
  - AI매니저 기능명세서 v0.7: FN-AIM-004-10, 「부록_라우팅매핑표」 No.2·3·17~20행, 제.개정내역 새 버전 행
  - AI매니저 화면설계서 v0.9: 부록 라우팅 표의 `?cat=hospital`, `?cat=…` 2곳
- SCR-COM-006 문서 불일치(공통레이아웃): 006-03 메뉴별 카드·006-04 커뮤니티 순서는 기능명세서 v0.5·화면설계서 v0.8(2026-10-25)에 반영됨. 남은 것: 건강기록 2차 메뉴명(문서 건강 종합·검진기록관리·건강상태관리 ↔ 구현 종합 건강기록·건강 일지·케어 캘린더)은 JAJ 확인 후, 플레이스 지도 화면의 푸터·플로팅 미노출(002-01·21)과 캐릭터 완료 알림 표기(008-12)도 확인 필요로 남김. Figma 플레이스 프레임은 없음
- 화면설계서 v0.7 SCR-COM-006의 건강기록 첫 화면 ID `SCR-HLT-001`은 결번이다. `SCR-HLT-011`로 고친다(AI매니저 명세 부록 No.43 기준)
- 범위 밖에서 본 것(말만): 공통레이아웃 기능명세서 FN-COM-004-07의 케어 일정 알림 이동 대상(건강상태관리 정기관리)이 AI매니저 FN-AIM-006-13(케어 캘린더 SCR-HLT-003)과 다름
- SCR-COM-006 연결 남음: 006-07 터치 동작 명세 확정(반응형 범위는 ≤1100px·≤760px로 정해졌다. 명세 작성자가 문구를 갱신하면 구현할 내용을 정한다)
- SCR-COM-002 연결 남음: 002-02 `ProtectedRoute`로 감싸기(user 레이아웃은 끝, ai·chat·place·main bare는 위 SCR-COM-003 연결 남음), 002-06 GNB 대상 페이지를 `UserLayout` 아래 라우트로 붙이기(각 담당), 002-09 알림 미확인 수 API(LJS 백엔드), 002-11 채팅 안 읽은 수 조회 위치를 KSJ와 맞추고 연결(KSJ), 002-15 회원 프로필 이미지, 002-24 세션 만료 토스트(SCR-COM-003과 함께)
