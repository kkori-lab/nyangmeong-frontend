# LJS 핸드오프

## 지금 하는 것

SCR-ADM-001 관리자 목록 화면 · 모바일 세로 스크롤 줄이기 — 끝(2026-11-05). 768px 미만에서 관리자 표 34곳이 공통 상자 `ADMIN_TABLE_BOX`(`components/adminTableStyles.js`)로 높이 480px까지만 보이고 표 안에서 스크롤하며, 머리줄은 위에 붙는다

## 다음에 할 것

- SCR-ADM-001 사람이 볼 것(판정 밖, 2026-11-05): 390px 관리자 헤더에서 "관리자"와 옆 글자("냥멍관…")가 붙어 보인다(`layouts/` 관리자 헤더, 이번 범위 밖)
- SCR-ADM-081 사람이 볼 것(2026-11-05): 삭제 확인 문구 "키워드를 삭제할까요?"와 [키워드 등록] 버튼에는 "키워드"가 남아 있다(기획 밖이라 그대로 둠). 실제 API 연결 때 `kwrdClsfNm`은 탭의 저장 값(`keywordLabels.js`)을 쓴다
- SCR-ADM-021 사람이 볼 것(2026-11-05): 이 DB에 사진 있는 실종제보가 없어 상세 사진 표시와 404 문구는 응답을 바꿔서만 확인했다. 사진 있는 제보가 생기면 모달에서 사진이 열리는지 본다
- SCR-ADM-022 사람이 볼 것(2026-11-05): ① 이 PC는 완료 사진 파일이 없어 모두 404라, 실제 사진이 열리는 것은 응답을 바꿔서만 확인했다(파일이 있는 DB에서 모집 71의 3916·3917 확인) ② 조건 버전은 모든 버전을 펼치고 최신만 굵게 보인다(기획 문구는 "최신 펼침 + 이전 목록")
- SCR-CMU-005 연결 남음: FN-COM-009-08 주소 공유의 장소 검색 `searchChatPlaces` (장소 검색 API 미정, 가짜로 남김)
- SCR-COM-009 연결 남음: FN-COM-009-18 열린 방 알림 억제 (서버 알림 쪽, YAY)
- SCR-CMU-005 공용 DB 검증 데이터: 방 1에 "[검증]…"·"[검증2]…" 메시지와 사진 4312·4314, 매칭 101 요청·취소 이력, 모집글 49에 방 260. 메시지는 앱에서 지울 수 없어 DB에서 지운다
- SCR-CMU-005 참고: 기존 시드 채팅 사진(예: 3530·3866)은 서버가 404 `FILE_NOT_FOUND`(파일이 이 PC에 없음). 코드 문제 아님
- 돌봄 장소 찾기(KSJ `PlaceSearchModal`) 지도 오류 원인 조사(2026-11-05, 말만): 키 없음·서버 재시작 안 함, 카카오 Web 도메인에 `localhost:5180` 미등록, JS 키 대신 REST 키, 카카오맵 사용 설정 OFF, 네트워크·광고 차단. 공용 `hooks/useKakaoMap.js`는 `onload` 안에서 예외가 나면 Promise가 끝나지 않아 안내 없이 검색 버튼만 비활성으로 남는다
- SCR-ADM-080 사람이 볼 것(판정 밖, 2026-11-05): ① 페이지 머리 안내문(`AdminAiRoutesPage.jsx`)에 "우선순위가 높은(숫자가 작은) 행이 먼저예요"가 남아 모달의 "같은 지시어일 때 순서"와 말이 어긋난다 ② 모달 겹침 경고는 사용 안 함 행도 센다(표는 안 셈) ③ 매핑표 API가 가짜 응답이고 처음 값에는 겹치는 지시어가 없다
- SCR-ADM-091 사람이 볼 것(2026-11-05): 대시보드 "알림 발송 실패(24시간)" 링크는 대시보드가 아직 가짜(`notiFailCnt` 0)라 화면에 안 보여 응답을 바꿔서만 확인했다. [2]쪽 요청도 로컬 데이터가 4건이라 응답을 바꿔서만 확인했다
- 다음 추천(2026-11-04): 백엔드 PR #149(backend-a9) 연결 남은 1건 — FN-MYP-010-16 착용 확정(`PUT /api/pixel-characters/{pixelCharSn}/equipped-items` 200) 뒤 Python `/ai/characters/{pixelCharSn}/equipped-image` 합성 요청, 끝나면 `character-image` 캐시 무효화, 409 `EQUIPPED_ITEMS_CHANGED`는 무시(꾸미기 화면). 마일스톤 절이 생기면 `/start`. 그 밖에 백엔드 API가 develop에 있는데 프론트가 가짜인 화면: 외부 API 사용량(112)·운영 설정(110)·노출 콘텐츠(023)
- SCR-ADM-070 사람이 볼 것(2026-11-05): ① 이 PC의 ai `.env.local`이 `CHARACTER_BAKE_ENABLED=true`라 실제 [굽기]는 이미지 API가 과금된다. 반복 호출·[멈춤]·화면 떠나기는 Playwright 가짜 응답으로만 확인했다 ② 본문 없는 502(AI 서버 꺼짐 등)는 "일시적인 오류가 발생했어요."로 보인다 ③ 390폭에서 굽기 칸이 늘어 이름 칸이 좁다
- SCR-ADM-070 다음에(결정 2026-11-05): 굽기 지시를 고친 뒤 이미 구운 캐릭터 다시 굽기는 넣지 않았다. AI 서버는 안 구운 캐릭터만 굽는다(다시 굽기는 ai·백엔드 몫 포함)
- SCR-ADM-070 새 아이템 등록 도구(마일스톤 `대기`, 사람 2026-11-05): 범위·흐름이 정해지면 `/start`
- SCR-ADM-101 사람이 볼 것(판정 밖, 2026-11-04): ① 강아지 "확인용품종"(정렬 5) 등 로컬 DB 확인용 품종은 [수정]에서 사용을 끈다(삭제 API 없음) ② 400 `fields`에 `vrtyNm`·`sortSeq` 밖 칸만 오면 문구가 안 보인다(약관 폼과 같음)
- SCR-ADM-001 연결 남음: FN-ADM-001-02·03 (백엔드 연결 `GET /api/admin/dashboard`(운영 현황 `totMbrCnt`·`nrmlMbrCnt`·`stopMbrCnt`·`todayJoinCnt`·`weekJoinCnt`·`totPstCnt`·`recentMbrs`·`recentPsts`, 처리 대기 `dclrRcptCnt`·`unansInqryCnt`·`pixelInqryCnt`·`charFailCnt`·`ocrFailCnt`·`notiFailCnt`·`btchFailCnt`, 가정 필드), 백엔드 저장소에서 /start). 나오면 `features/adminDashboard/api.js` 가짜 본문만 실제 요청으로 바꾼다
- SCR-ADM-001 연결 남음: FN-ADM-001-04·05 (백엔드 연결 `GET /api/admin/dashboard/stats?fromYmd=&toYmd=`(`daily`[`ymd`·`joinCnt`·`whdwlCnt`·`aiChatCnt`·`ocrRqstCnt`]·`pstCntByBbs`·`expnsCntByCtgry`·`petDstrb`·`fvrtPlcs`, 가정 필드, 최대 90일), 백엔드 저장소에서 /start)
- SCR-ADM-001 사람이 볼 것(판정 밖): ① 캐릭터 생성 실패 링크의 `jobSttsCd=TMP00044`는 SCR-ADM-082와 같은 임시 코드 ② 실패한 배치는 배치 화면에 실패 필터가 없어 필터 없이 간다 ③ 스켈레톤은 검증에서 코드로만 확인했다

- SCR-ADM-082 연결 남음: FN-ADM-082-01 (백엔드 연결 `GET /api/admin/processing/receipts?fromYmd=&toYmd=&ocrRqstSrcCd=&ocrPrcsSttsCd=&page=`(summary `totCnt`·`scsCnt`·`failCnt`·`prcsCnt` 가정)·`GET /api/admin/processing/receipts/{recptSn}/image`, 가계부 출처 코드(지금 임시 `TMP00031`), 백엔드 저장소에서 /start). 나오면 `features/adminProcessing/api.js` 가짜 본문만 실제 요청으로, 코드는 `processingLabels.js`에서 맞춘다
- SCR-ADM-082 연결 남음: FN-ADM-082-02 (백엔드 연결 `GET /api/admin/processing/character-jobs?jobSttsCd=&page=`(`sttsCnts` 가정)·CHAR_CRT_JOB 상태 공통코드(지금 임시 `TMP00041~44`), 백엔드 저장소에서 /start)
- SCR-ADM-082 연결 남음: FN-ADM-082-03 (백엔드 연결 `GET /api/admin/processing/pdf-analyses?fromYmd=&toYmd=&page=`(summary `totCnt`·`scsCnt`·`tmotCnt`·`errCnt` 가정)·Python→Java 통지 내부 API, 백엔드 저장소에서 /start)
- SCR-ADM-082 사람이 볼 것(판정 밖): ① `routes/paths.js`에 `ADMIN_PROCESSING`을 기능 커밋에 같이 넣었다(사람 2026-11-04 추천안대로) ② 대시보드 링크는 `?tab=ocr&ocrPrcsSttsCd=AIMC0004`(기획의 `status=`를 서버 키 이름으로 고침) ③ 스켈레톤 높이는 브라우저로 재지 않고 계산한 값 ④ 가짜 영수증 성공·처리 중 코드 AIMC0003·0002는 가정(AIMG01에서 확인된 것은 인식 실패 AIMC0004뿐)
- SCR-ADM-081 연결 남음: FN-ADM-081-01·02 (백엔드 연결 `GET /api/admin/ai/keywords?dictUsgCd=&kwrdClsfNm=`·`POST /api/admin/ai/keywords`·`PATCH`·`DELETE /api/admin/ai/keywords/{kwrdDictSn}`, 새 행 `sortSeq` 규칙(가정: 그 탭 맨 아래), 백엔드 저장소에서 /start). 나오면 `features/adminAiKeyword/api.js` 가짜 본문(sessionStorage `fakeAdminAiKeywords`)만 실제 요청으로, 코드 선택지는 `keywordLabels.js`에서 맞춘다
- SCR-ADM-081 연결 남음: FN-ADM-081-03 (백엔드 연결 가계부 분류 AIMC0038 초기 키워드, 백엔드 저장소에서 /start. 지금 가짜 가계부 3행은 예시)
- SCR-ADM-081 연결 남음: AI 서버가 사전을 DB 조회 API로 읽기(백엔드 조회 API는 백엔드 저장소, AI 서버 전환은 ai 저장소). 예시 문구 형식 차이: AI 서버 `ai/data/register_dict.yaml`은 정규식(`(잡아|등록해)(줘|주|줄)`·`\d+일후`), DB `KWRD_CN`은 부록 B 예시 문구(`잡아줘, 등록해줘`·`○일 후`)라 그대로 못 쓴다. 사전에 정규식을 저장할지, 예시를 정규식으로 바꾸는 규칙을 둘지 정한다. 가계부 분류는 지금 OCR(`ai/app/ocr/clients.py`)의 고정 표가 쓴다
- SCR-ADM-081 사람이 볼 것(판정 밖): ① 화면설계서 예시 `EXPC0001` 대신 실제 코드 MYPC0012~0018(MYPG05)을 썼다 ② 글자 수는 입력을 막지 않고 칸 아래 오류로 알린다(라우팅 매핑표 모달은 `maxLength`로 막는다) ③ `routes/paths.js`에 `ADMIN_AI_KEYWORDS`를 기능 커밋에 같이 넣었다
- SCR-ADM-080 연결 남음: FN-ADM-080-01·02·03 (백엔드 연결 `GET /api/admin/ai/routes?q=`·`POST /api/admin/ai/routes`·`PATCH`·`DELETE /api/admin/ai/routes/{aiRoutMpngSn}`(등록·수정 본문에 `prrtSeq`, 그 자리에 넣고 나머지를 민다), 화면 ID 선택지 출처, 지시어 저장 형식(가정 쉼표 구분), `domnNm` 정하는 규칙, 백엔드 저장소에서 /start). 나오면 `features/adminAiRoute/api.js` 가짜 본문(sessionStorage `fakeAdminAiRoutes`)만 실제 요청으로, 선택지는 `routeLabels.js`에서 맞춘다
- SCR-ADM-080 연결 남음: FN-ADM-080-04·05 (백엔드 연결 AI 서버·대화창용 조회 API와 부록 A 초기 데이터 INSERT, 백엔드 저장소에서 /start. AI 서버가 `data/routing.yaml` 대신 그 API를 읽는 것은 ai 저장소 몫)
- SCR-ADM-080 사람이 볼 것(판정 밖): ① 화면 ID 선택지에 `docs/routes.md` ✓가 아닌 `SCR-COM-009`·`SCR-MYP-031`을 더했다(부록 A 행이 씀) ② 저장 토스트는 기획 문구 그대로 "~했습니다" 말투라 다른 관리자 화면("~했어요")과 다르다 ③ `routes/paths.js`에 `ADMIN_AI_ROUTES`를 기능 커밋에 같이 넣었다 ④ 스켈레톤 높이(3330px)는 45행 어림값
- SCR-ADM-072 연결 남음: FN-ADM-072-01·02 (백엔드 연결 `GET /api/admin/points?mbrSn=&mbrNcnm=&pntDlngTypeCd=&fromDt=&toDt=&page=&size=`·`POST /api/admin/points/adjustments { mbrSn, dlngPnt, memoCn }`, 회원 보유 포인트 응답 필드, 상한(프론트 가정 1회 100,000P·사유 200자), 백엔드 저장소에서 /start). 나오면 `features/adminPoint/api.js` 가짜 본문(sessionStorage 보관, 가짜 회원 9001~9005)만 실제 요청으로, 상한은 `pointLabels.js`에서 맞춘다. FN-ADM-072-03은 그 뒤 회원 포인트 내역에 "관리자 조정"으로 보이는지 화면으로 확인
- SCR-ADM-072 사람이 볼 것(판정 밖): ① 기획의 `nickNm`·`keyword=` 대신 서버 키 `mbrNcnm`·`q`를 썼다 ② 가짜 원장에 없는 실제 회원의 현재 잔액은 회원 상세 포인트 탭 API의 마지막 잔액으로 읽는다 ③ `routes/paths.js`에 `ADMIN_POINTS`를 기능 커밋에 같이 넣었다
- SCR-ADM-071 연결 남음: FN-ADM-071-01·02 (백엔드 연결 `GET /api/admin/care-missions?msnPoolCd=`·`PATCH /api/admin/care-missions/{careMsnSn}`, 허용 범위(프론트 가정 1 이상 정수·보상 1000P·횟수 10회 이하), 출제 배치 `CareMissionJob`이 `CARE_MSN`의 `useYn`·값을 읽는지, 백엔드 저장소에서 /start). 나오면 `features/adminCareMission/api.js` 가짜 본문(sessionStorage 보관 포함)만 실제 요청으로, 상한은 `careMissionLabels.js`에서 맞춘다
- SCR-ADM-071 사람이 볼 것(판정 밖): ① `routes/paths.js`에 `ADMIN_CARE_MISSIONS`를 기능 커밋에 같이 넣었다 ② 스켈레톤 높이는 행 높이로 계산한 값(풀마다 21·9·12행, `AdminCareMissionsPage.jsx`) ③ 조회 오류·저장 실패 문구는 가짜가 실패하지 않아 검증에서 응답을 바꿔서만 봤다 ④ 백엔드 마일스톤 SCR-ADM-071의 "`pet` 케어미션 협의 (SJM)"는 사람이 맞춘다
- 대기 순서(사람 결정 2026-11-03): SCR-ADM-060 장소는 없앰(사람 결정 2026-11-04, 메뉴·`docs/routes.md` 행 삭제, 마일스톤 제외 절). 백엔드 `milestones/LJS.md`의 SCR-ADM-060 절도 백엔드 저장소에서 제외로 옮긴다. SCR-ADM-001 페이지 틀·조회 오류 정리는 남은 관리자 화면 구현 뒤 맨 마지막
- SCR-ADM-051 사람이 볼 것(판정 밖): ① 같은 버전 값은 확인 모달을 누른 뒤에 막힌다 ② 로컬 DB `TRMS`의 `MARKETING`에 검증용 `v9.9-check`·`v9.9-verify`가 남아 있다(삭제 API 없음, 지우려면 두 행 삭제 후 `v1.0` 사용 여부를 되돌린다) ③ 기능별 동의 2종이 `TRMS`에 생기면 `termsKinds.js`에 다시 넣는다

- SCR-ADM-101 사람이 볼 것(판정 밖): ① 기능명세서 FN-ADM-101-02 지역 조회·화면설계서 SCR-ADM-101 지역 부분을 DMS에서 빼는 것은 문서 담당 몫(2026-11-03 결정) ② URL 변경(`docs/routes.md`·`routes/paths.js` `ADMIN_BREEDS`)은 `shared-files.md`상 따로 PR 대상이라 PR 본문에 팀 알림을 넣는다(2026-11-03 결정) ③ 옛 URL `/admin/breeds-regions` 리다이렉트는 두지 않았다 ④ 품종 이름 50자·중복 검사(공백 무시)는 가정

- SCR-ADM-050 사람이 볼 것(판정 밖): ① 실행할 수 없는 서버(`runnableYn:false`)에서도 [뉴스 수집 실행]이 켜져 있다(배치 현황 `BatchTable.jsx`는 막음) ② 중복 키워드 안내가 그 칩을 지운 뒤에도 남는다 ③ 관리자 등록 뉴스도 사용 스위치로 숨길 수 있다(명세는 수집 기사만) ④ 썸네일은 선택 값, 제목 200자·요약 1000자·키워드 50자는 가정 ⑤ 스켈레톤 높이는 행 높이로 어림한 값(`AdminNewsPage.jsx`) ⑥ `routes/paths.js`에 `ADMIN_NEWS`를 기능 커밋에 같이 넣었다
- SCR-ADM-050 로컬 DB 검증 데이터(2026-11-04): 관리자 뉴스 `newsSn` 201 "검증용 뉴스 LJS 수정"과 썸네일 첨부 4223·4224가 남았다(뉴스 삭제 API 없음. DB에서 지우거나 [사용]을 끈다). 400 `fields` 칸 아래 서버 문구는 코드로만 확인했다. 썸네일 업로드 뒤 등록이 실패하면 올린 파일이 남는다(정리 API 없음)
- SCR-ADM-050 로컬 정리(2026-11-03): 뉴스 수집 배치 실행 이력 `btchExcnHstrySn` 308과 실제 RSS 수집 기사가 로컬 DB에 남았다(되돌리는 API 없음). 백엔드 로컬 설정 `app.news.batch-enabled=true`는 확인용으로 켰으니 끄려면 `false`로 되돌린다
- 추가-1(SCR-AIM-010) 알릴 것: ai-47에게 "프론트 반영 끝. `ReceiptUploadModal`이 `error.data?.recptSn`을 [직접 입력]에 `rcptSn` 키로 넘기고(받는 쪽 `HealthDiaryPage`도 `rcptSn`), 다시 올리기·닫기 때 비운다. AI `LJS` PR과 같이 낸다". JAJ에게 "`HealthDiaryPage.jsx`가 받은 `rcptSn`을 `receiptFlow`에 넣기만 하고 `CheckupModal`·검진기록 등록 요청에 넘기지 않아 영수증 연결이 실제 저장에 빠진다(추출 0건도 같음)"

- SCR-ADM-023 연결 남음: FN-ADM-023-01~06 (백엔드 연결 `/api/admin/community/exposure` 건강팁 목록·지정·해제·자동 대체, 후보 문구 테이블·API(가정 필드 `todayPhrsSn`·`phrsCn`·200자)·00:00 배치·오늘 문구 `todayPhrs`, AI 코멘트 목록·사용 전환, 백엔드 저장소에서 /start). 나오면 `features/adminCommunity/api.js` 노출 콘텐츠 가짜 본문만 실제 요청으로 바꾼다
- SCR-ADM-023 사람이 볼 것(판정 밖): `routes/paths.js`에 `ADMIN_EXPOSURE`를 기능 커밋에 같이 넣었다. 스켈레톤 높이는 잰 값이 아니라 행 높이로 어림한 값이다(`AdminExposurePage.jsx`). AI 코멘트 탭은 미사용을 글자 없이 스위치·회색 글자로만 보인다

- SCR-ADM-090 로컬 DB 검증 데이터(2026-11-03): 템플릿 `notiTmpltSn` 5(케어 일정·이메일, 제목 "검증 등록", 미사용)가 남았다(삭제 API 없음). 3번은 원래 값으로 되돌렸다. 수정 모달은 제목을 필수로 검사하지만 서버는 선택 값이다(DB에 제목 null 템플릿 3번)

- SCR-ADM-022 사람이 볼 것(판정 밖): 비용 단위 코드가 백엔드 `CareCostUnit`(PCAC0004·0005)과 회원용 펫돌봄 화면(PCAC0011·0012)이 다르다. 관리자 화면은 백엔드 값을 따랐다. `routes/paths.js`에 `ADMIN_CARE_MATCHES`를 기능 커밋에 같이 넣었다. 백엔드 마일스톤 SCR-ADM-022 절의 "KSJ 협의" 표기는 사람이 맞춘다

- SCR-ADM-021 사람이 고치는 문서: 백엔드 `docs/admin/implementation-plan.md`의 SCR-ADM-021 담당 KSJ → LJS


- SCR-ADM-090 사람이 볼 것(판정 밖): 목록 스켈레톤 높이(1108px, 모바일 1160px)는 20행 기준 계산값인데 실제 AIMG02는 9종이라 18행이다(`AdminNotificationTemplatesPage.jsx`). 템플릿 목록 자체 오류(403 아닌 것) 분기는 코드로만 봤다. 치환 변수 칩은 케어 일정 기준 목록을 모든 유형에 똑같이 보인다. 화면설계서의 `{변수}` 표기를 `{{변수}}`로 고치는 것은 사람 몫

- SCR-ADM-070 로컬 DB 검증 데이터(2026-11-03): 아이템 `itemSn` 39 "[검증] 연결 가방 수정"(가방, 판매 중지)이 남았다(삭제 API 없음). 가방 순서는 원래대로 되돌렸다. 처음부터 있던 아이템(1~36)은 이 PC에 첨부 파일이 없어 이미지가 404로 빈 칸이다
- SCR-ADM-070 연결 남음: 추가-1 (백엔드 연결 공통코드 MYPG01에서 신발 제외·기존 신발 아이템과 보유·착용 처리, 백엔드 저장소에서 /start). 정리되면 `api.js` `EXCLUDED_PART_NAMES` 이름 거르기를 지운다. 문서(FN-ADM-070-02, 화면설계서 SCR-ADM-070 부위 목록) 갱신은 사람 몫
- SCR-ADM-070 사람이 볼 것(판정 밖): 이미지 검사에 영수증용 `@/utils/receiptFile`을 쓴다. 미리보기 object URL을 해제하지 않는다. 가짜 목록이 공통코드도 불러 "아이템 목록을 불러오지 못했어요." 분기는 화면으로 못 봤다. 부위 Select 안내에 `aria-describedby`가 없다.

- SCR-ADM-042 연결 남음: FN-ADM-042-07 접수 시점 캐릭터 이미지 (백엔드 연결 `GET /api/admin/inquiries/{otoInqrySn}/images/{atchFileSn}`가 캐릭터 이미지 1483에 404 FILE_NOT_FOUND, 백엔드 저장소에서 /start). 같은 코드로 204 첨부는 200이다. 백엔드 `/api/admin/inquiries`는 `origin/LJS`에만 있어 develop 병합이 돼야 배포에서 동작한다. 검증은 로컬 8080(백엔드 LJS 작업 사본)으로 했다
- SCR-ADM-042 FN-ADM-042-08 펫돌봄 분쟁 연결: SCR-ADM-022(펫돌봄 거래)를 만들 때 분쟁(`inqryCtgr=DISPUTE`) 문의 상세에 [작성자 매칭 목록] 링크(`mbrSn`)를 붙인다(사람 결정 2026-11-03)
- SCR-ADM-042 사람이 볼 것(판정 밖): ① 상태가 서버 이름 그대로 "접수"로 보이고 탭은 "미답변"이다(백엔드 문서는 CSCC0012를 화면에서 '미답변'). 맞추려면 추가 요청이나 새 마일스톤으로 ② 삭제된 픽셀 캐릭터 문의는 `imgs`가 비어 `charImgAtchFileSn`이 오면 캐릭터 이미지 자리가 스켈레톤으로 남는다(`AdminInquiryDetailPage.jsx` `InquiryDetailBody`, 화면으로 못 봄) ③ 시드 픽셀 문의(82 등)는 첨부가 있는데 `charImgAtchFileSn`이 null이라 캐릭터 이미지 칸이 없다(백엔드 데이터) ④ 409 응답 표시는 코드로만 봤다
- SCR-ADM-042 로컬 DB 검증 데이터(2026-11-03): 문의 204~206("확인A~C", 205는 회원 삭제)이 남았다. 204는 답변 완료("[검증] 답변 수정 확인입니다."), 206은 원래 캐릭터 복원(CHRC0009)을 실행해 회원 1의 캐릭터 1이 복원되고 알림이 갔을 수 있다. 감사 로그도 남았다(되돌리는 API 없음)

- SCR-ADM-041 로컬 DB 검증 데이터(2026-11-03): FAQ `faqSn` 41~44("[검증]·[확인]" 질문, 비노출)가 남았다(삭제 API 없음)
- SCR-ADM-041 사람이 볼 것(판정 밖): 기획은 사용 칸을 "배지"라고 했지만 글자(비노출만 회색)로 보인다(`FaqTable.jsx`). 등록 직후 새로고침 없이 목록이 바뀌는지는 검증이 직접 보지 않았다(수정과 같은 무효화)

- SCR-ADM-040 사람이 정할 것: 폼이 [사용]을 끈 상태에서도 [알림 발송] 체크를 막지 않아 서버가 400 "입력값이 올바르지 않습니다."로 거절한다(`NoticeForm.jsx`). 막으려면 새 마일스톤이나 추가 요청으로
- SCR-ADM-040 로컬 DB 검증 데이터(2026-11-03): 공지 37 "[검증] 알림 발송 공지"가 비노출로 남았다(삭제 API 없음). 회원 191명에게 공지 알림이 1건씩 갔다
- SCR-ADM-040 실제 확인이 남은 것: 글자 수 400은 입력칸 `maxLength`가 막아 화면으로 못 봤다. 403은 코드로만 봤다. 스켈레톤 높이(목록 표 1025px, 폼 카드 600px)는 잰 값이 아니라 계산값이다
- SCR-ADM-040 본문 이미지: 사용자 공지 상세(KSJ, 공용 `PostBody`)가 `![](/api/files/public/{atchFileSn})` 줄을 이미지로 그리게 되면 같이 한다(사람 결정 2026-11-03). 할 일: `NoticeForm.jsx` 이미지 버튼, `api.js` `uploadNoticeImage`(`POST /api/admin/notices/images`, multipart `image`, 201 `{ atchFileSn }`), 내용 커서 자리에 그 줄을 넣기

- 8080 백엔드를 공용 DB로 되돌릴지: SCR-ADM-030 검증 때 사람이 `local` 프로필(로컬 DB)로 재시작했다. 지금 5173 화면도 로컬 데이터를 본다
- SCR-ADM-030 백엔드 병합 순서: 신고 관리자 API(백엔드 `origin/LJS`, 조치 코드 커밋 `c96d29a`)가 develop에 병합되고 공용 DB에 `DCLR.DCLR_ACTN_CD`(v0.11 (9))가 적용돼야 배포에서 동작한다
- SCR-ADM-030 공용 DB 검증 데이터(2026-11-02, 사람 허용 "아무나 해도 돼, DB 갈아엎을 예정", 되돌리지 않음): 신고 97·99·100·116·121·122·131·132 처리(100은 다른 회원 신고가 같은 대상이라 함께 처리됨), 글 337·213 블라인드로 남음, 글 607 블라인드 뒤 복구, 댓글 2561 삭제로 남음, 회원 38 7일 정지 뒤 해제. 신고자 알림·감사 로그가 남았다
- SCR-ADM-030 로컬 DB 검증 데이터: SQL로 넣은 신고 `dclr` 126~136·142(신고자 회원 191~197, 상세 내용 '검증A'~'검증G'), tester API 신고 137~141. 회원 141 정지(2026-11-09까지), 글 998 블라인드로 남음
- SCR-ADM-030 사람이 정할 것(판정 밖): 정지 사유 칸에 글자 수 제한이 없다(`ReportCompleteForm.jsx`, 서버 제한 확인 안 함). 영구 정지 `suspnDayCnt: null` 전송은 코드로만 확인했다. 첫 진입 때 상태 탭 줄이 스켈레톤이 아니다(`ui.md` 로딩 표시, `AdminPostsPage.jsx`와 같은 구조). 행 수가 정해지지 않은 목록 스켈레톤은 판정에서 뺐다(반려 탭 11건 +83%)
- SCR-ADM-020 실제 확인이 남은 것: 403과 조회 오류·[다시 시도]는 조작한 응답으로만 봤다. 상세 스켈레톤은 748px인데 글 1001 실제는 1299px다(이력 길이에 따라 달라짐, `AdminPostDetailPage.jsx`). `/admin/posts/abc`처럼 잘못된 번호는 [다시 시도]만 나오고 [목록으로]가 없다. 삭제된 글의 댓글에도 [삭제]가 나온다(기획이 막지 않음, 막을지 사람이 정한다). 실종센터 필터는 0건이고 `[실종]`·`[펫돌봄]` 제목 글은 펫정보·펫일상 코드다
- 공용 DB 검증 데이터(2026-11-02, 사람 허용): 글 1001을 블라인드·복구 2번(`pstSttsHstrySn` 1077~1080), 댓글 4028을 달고 삭제했다(되돌리지 않음). 감사 로그 `mngrTaskLogSn` 9~14. 검증 중 다른 작업이 글 1001을 신고(`dclrSn` 126~130)·자동 블라인드(이력 1081)·복구(이력 1082, 감사 로그 16·17)해 글은 정상이고 신고 수 5가 남았다. 주체는 확인 못 함. 감사 로그 15도 다른 세션으로 보인다
- 공용 DB 확인: 아래 줄의 앞선 기록 `mngrTaskLogSn` 10~13·25·26과 번호가 겹친다. 지금 DB의 10~13은 SCR-ADM-020 것이고 로그가 17번까지뿐이다. DB 초기화인지 다른 DB인지 확인 안 함
- SCR-ADM-020 문서 맞출 것(사람): 기능명세서 FN-ADM-020-01·화면설계서 SCR-ADM-020의 게시판에 펫돌봄이 있는데 코드가 없어 필터에서 뺐다
- SCR-ADM-011 연결 남음: FN-ADM-011-01 백엔드 연결 `AdminMemberDetailResponse.mbrAuthrtCd`(백엔드 저장소에서 `/start`). 그동안 관리자 회원에게도 [정지]가 보이고 서버가 409로 거절한다. 필드가 들어오면 `AdminMemberDetailPage.jsx` 머리 주석의 해당 줄만 지운다
- SCR-ADM-011 실제 확인이 남은 것: 반려동물 20건 초과 쪽 번호와 동의 기록 없는 약관 행은 조작 응답으로만 봤다(로컬 데이터에 없음). 스켈레톤은 화면으로 못 봤고 높이는 계산값이다(`AdminMemberDetailPage.jsx`). 범위를 벗어난 `?page=`는 빈 문구만 나오고 쪽 번호가 없다(SCR-ADM-010과 같음). 기본 정보 한 줄에 가입일 `2026-10-21`과 최근 로그인 `2026.10.22 14:02` 표기가 섞여 있다(`MemberDetailInfo.jsx`)
- 원인 안 봄: SCR-ADM-011 검증 중 `/api/auth/me` 401로 로그인 화면으로 한 번 넘어갔고 다시 로그인하니 정상이었다
- SCR-ADM-113 실제 확인이 남은 것: 스켈레톤은 화면으로 못 봤고 높이 240px는 잰 값이 아니다(`AdminAdminsPage.jsx`). 범위를 벗어난 `?page=`는 "관리자가 없어요"만 나오고 쪽 번호가 없다(SCR-ADM-010과 같음). 마지막 관리자 [해제] 비활성은 내 행이 아닌 경우를 조작한 응답으로만 봤다
- 로컬 검증 데이터: 회원 198을 지정했다가 해제해 감사 로그 2줄(`mngrTaskLogSn` 25·26)이 남았다
- SCR-ADM-111 실제 확인이 남은 것: `?batch=`로 바로 들어오면 `HistorySkeleton`(20행 1026px)이 실제보다 길다(2026-11-02 이력 5건: 본문 1598px, 실제 약 927px, +72%). 행 수는 응답 전에 알 수 없어 그대로 둔다(사람 결정 2026-11-02). 이력 없음 문구도 이번에는 화면으로 못 봤다. 수동 실행은 로컬 DB에 SYSC0027이 없으면 외래키에 걸릴 수 있어 해 보지 않았다
- SCR-ADM-013 사람이 정할 것: 파기 안내와 [배치 현황]이 403·조회 오류 화면에도 나온다(`AdminMembersWithdrawnPage.jsx`). 고치면 추가 요청이나 새 마일스톤으로
- SCR-ADM-013 실제 확인이 남은 것: 스켈레톤은 화면으로 못 봤다. 높이 1025px는 20행 기준이라 지금처럼 실제 5건이면 표보다 훨씬 크다(`AdminMembersWithdrawnPage.jsx`). 화면의 403 안내는 조작한 응답으로만 봤고 실제 서버 문구로는 못 봤다. 가짜 상태 배분을 바꿔 정지 23명이고 SCR-ADM-010·012 값이 달라졌다(이 둘 연결 때 없어진다)
- 공용 하네스: 관리자 화면 검증은 별도 검증 에이전트가 관리자 계정을 받아야 한다. 이번에는 사람이 지시해 프롬프트에 계정을 넣었다(`/impl` 고정 프롬프트 예외). 검증 스킬에 관리자 화면 로그인을 어떻게 둘지 PR로 정한다
- SCR-ADM-012 실제 확인이 남은 것: 쪽 이동 화면, 정지 일시 null 행 "—", 403 안내, 409 `MEMBER_NOT_SUSPENDABLE` 표시는 조작한 응답으로만 봤다. 일반 회원은 라우트 가드가 `/main`으로 보내 403 안내까지 가지 않는다. 해제 409 뒤 목록은 자동 갱신하지 않는다(기획에서 뺌). 로딩 스켈레톤은 화면으로 못 봤고 표 높이 1008px는 잰 값(실제 1186px, 15% 작음)이다
- 공용 DB 검증 데이터(2026-11-02, 사람 허용): 회원 129를 7일 정지·해제·영구 정지·해제해 정상으로 되돌렸다. 상태 이력 `mbrSttsHstrySn` 209~212, 감사 로그 `mngrTaskLogSn` 10~13이 남았고, 관리자 로그인 감사 로그 9도 이 검증으로 보인다. 그 회원 세션은 정지 때 폐기됐다
- 백엔드에 알릴 것(검증 에이전트 보고, 사람 미확인): `application-local.properties`는 `local` 프로필이 켜져야 읽혀 그냥 `bootRun`하면 공용 DB에 붙는다. 백엔드 README "파일이 있으면 그 DB 설정이 우선한다"와 다르다. 2026-11-02 8080 서버의 DB 연결은 공용 DB로 확인했다
- SCR-ADM-010 실제 확인이 남은 것: 정지 회원 행의 정지 종료일은 일단 표시하지 않는다(사람 결정 2026-11-01). `?page=99`처럼 범위를 벗어난 쪽은 빈 문구만 나오고 쪽 번호가 없다
- SCR-ADM-112 연결 남음: FN-ADM-112-01·02·03 백엔드 연결(백엔드 저장소에서 `/start`). 사용량 조회 API 3종·필드 이름, SYSG05를 명세 7종으로 수정, 호출 로그 기록(Python 통지 포함). 연결 때 `features/apiUsage/api.js` 가짜와 `apiUsageLabels.js`의 임시 코드(`TMP00001` AI 분류, `TMP00002` PDF 분석)를 바꾼다. 지금 AI 서버에는 토큰을 읽는 코드와 Java 통지가 없다(2026-11-01 검색)
- SCR-ADM-112 문서 맞출 것(사람): 명세 7종에 대화 제목 생성(별도 LLM 호출)이 없고, PDF 분석은 AI 저장소 작업 사본에 코드가 없다. SCR-ADM-082도 PDF 실패를 이 로그로 본다고 되어 있다. 공통코드의 장소 공공데이터는 명세 7종에 없다
- SCR-ADM-112 실제 확인이 남은 것: 스켈레톤 높이는 계산값이다(`AdminExternalApiUsagePage.jsx`). 조회 오류의 [다시 시도]는 화면으로 못 봤다. 390px 날짜 입력 줄 오른쪽 끝이 다른 칸보다 약 9px 더 나간다(`ApiUsageFilter.jsx`, 캡처로 어림, 가로 스크롤은 없음)
- SCR-ADM-111 문서 맞출 것(사람): 기능명세서 FN-ADM-111-02·화면설계서 SCR-ADM-111에 실패 건수가 남아 있다. 응답에 없어 화면에서 지웠다(사람 결정 2026-11-01)
- SCR-ADM-111 실제 확인이 남은 것: `실패 · {사유}` 문구는 화면으로 못 봤다. 이력 스켈레톤은 20행 기준(잰 값 306·1026px)이라 이력이 적은 배치를 `?batch=`로 바로 열면 ±20%를 넘는다(1행 +139%, 행 수는 응답 전에 알 수 없음). 실행 직후 결과 칸은 `실행 중`인데 버튼은 활성인 구간이 약 5초 있다(기획대로). 케어미션 출제는 이 서버에서 `runnableYn=false`다
- SCR-ADM-111 배치 범위: 가짜는 공통코드 SYSG02 4종이다. 명세 10종·설계서 9종과 차이는 문서를 고치거나 배치가 늘 때 정한다
- SCR-ADM-114 관리자 화면을 붙일 때: 새 `trgtTblNm`은 `features/audit/auditLabels.js` `TARGET_OPTIONS`에 한 줄 더한다(지금 `SYS_STNG`·`MBR`). 없으면 표에는 서버 값이 보이고 필터에는 없다
- SCR-ADM-114 실제 확인이 남은 것: 쪽 이동은 로그가 8건뿐이라 응답 조작으로만 봤다(서버 페이징은 직접 호출로 확인). 스켈레톤 높이는 계산값이다(`AdminAuditLogsPage.jsx`). 로그가 20건을 넘으면 1440px·390px로 잰다(`docs/convention/ui.md`). 대상 필터 [회원]은 로그인 행을 주지만 그 행의 대상 칸은 "—"다(결정, 그대로 둠). 요약·상세 항목은 서버 필드 이름 그대로다. 한글 요약은 서버에서 고칠 일이다
- 사람이 고칠 것(2026-11-01 사람 확인 때 "고치고 싶은 부분이 많은데 나중에", 내용은 아직 안 받음, 2026-11-01 사람 결정으로 다른 화면 구현 뒤로 미룸): 그때 목록을 받아 정한다. 검증 때 나온 참고 3가지: ① 390px에서 "관리자"와 닉네임 사이 간격 0px(`AdminLayout`) ② 390px 운영 설정 저장 토스트가 [되돌리기] 버튼과 일부 겹침 ③ 정확히 760px 사용자 화면은 바텀 네비가 없는데 토스트만 76px 위에 뜸(`BottomNav`는 `min-[760px]:hidden`, 운영 설정 네비는 `min-[761px]:hidden`이라 경계가 1px 다름)
- 팀에 알릴 것(PR 전): 공용 `components/ToastContainer.jsx`를 고쳤다. 760px 이하에서 토스트가 76px 위에 뜬다(바텀 네비 없는 `/main` 등도 같음)
- 사람이 고치는 문서(운영 설정 모바일 네비): 관리자 화면설계서 SCR-ADM-001 처리 조건을 "1100px 이하: 사이드바를 숨기고 상단 바 왼쪽 [≡]로 연다(덮는 서랍). 관리자 화면은 PC 사용 기준이라 공통 모바일 전용 배치는 두지 않음. 예외로 운영 설정(SCR-ADM-110)은 760px 이하에서 묶음 5개를 하단 바텀 네비로 나눠 고른 묶음만 표시"로 고친다
- 운영 설정 연결 때 확인: 묶음 바텀 네비의 저장 포함은 가짜 API에서 다시 불러온 값으로만 확인했다. 스켈레톤 카드 1장도 화면으로 보지 못했다
- SCR-ADM-110 프론트 연결 남음(FN-ADM-110-01~04): 백엔드는 이미 있다(`global/setting/AdminSystemSettingController`, 문서 `docs/api/global.md`). 가짜(`features/setting/api.js`)와 다른 점: 수정이 PUT이 아니라 `PATCH`, 응답이 묶음별 중첩(`memberPet`·`community`·`notification`·`ai`·`file`), `lowstHrwgAplcnYr`가 문자열, 응답에 `dshbdCareMaxExpsrCnt`가 있음(화면에는 두지 않음). 실제 항목별 오류 모양과 허용 범위를 맞춘다
- SCR-ADM-110 스켈레톤 높이는 계산값이다(`AdminSettingsPage.jsx`, 383·503·143·203·143px). 실제 API 연결 때 1440px·390px로 잰다(`docs/convention/ui.md`)
- `AdminLayout`의 `AdminLogoutConfirm`은 `ProfileDropdown`의 `LogoutConfirm`과 달리 AI 창·채팅 창을 닫지 않는다(관리자 화면에 여는 버튼이 없음). 이동 대상도 `/login`으로 다르다. 공통화할지 정한다
- YAY에게 알릴 것(PR 전): 로그인 성공 뒤 이동을 `LoginPage.jsx`에서 바꿨다. 관리자는 `?redirect=`와 상관없이 `/admin`, 이동 전 `/auth/me`를 새로 받는다
- 공용 하네스: 검증 스킬의 기준 사본 비교 명령이 `scripts/verify-loop.sh:99` 가드에 막혀 검증 에이전트가 비교하지 못한다(2026-10-30, 사람이 직접 실행해 확인). 가드나 스킬을 PR로 고친다
- 관리자가 회원 화면(`/main` 등 user 레이아웃)에 들어오면 지금은 열린다(2026-10-30 SCR-ADM-110 기획에서 범위 밖으로 넘김). FN-COM-002-02 "역할이 맞지 않는 화면 → 역할별 홈"대로 `AppRoutes.jsx` member 묶음의 `ProtectedRoute`에 회원 역할만 허용할지 정한다(관리자도 회원 화면을 봐야 하는지 사람 결정)
- 팀에 알릴 것(관리자, PR 전): `docs/routes.md` 1장에 관리자 화면 URL 32개를 넣었다(`/admin/...`, 관리자 화면설계서 v0.1). 담당 표에 관리자(ADM) LJS 추가(백엔드 PR #79와 같음). DMS에 `관리자_화면설계서_v0.1_20261030`(새 문서)·`관리자_기능명세서` v0.2(FN-ADM-050-07 추가, 110 케어 노출 수 제외)를 올렸다. 기능명세서 DMS 설명 문구는 v0.1 그대로(134건·화면설계서 없음)라 DMS 화면에서 고친다(사람)
- 공통 이미지 연결 남음(2026-10-30): KSJ에게 커뮤니티 사진 주소를 `getPostImageUrl`에서 `@/utils/fileUrl` `publicFileUrl`로 바꿨고(7곳, 주소 같음) `@/components/FileImage`를 쓸 수 있다고 알린다. 문의 첨부 `useInquiryImageUrls`는 object URL 방식 그대로(한 화면 전용·큰 사진). SJM에게 `PetFace`가 받는 동안 스켈레톤을 보여 주고 `fallback`은 실패 때만 나온다고 알린다(`PetProfileCard`). JAJ 영수증 원본(`/receipts/{recptSn}/image`)·SJM 아이템(`/items/{itemSn}/image`)은 `useFileImage` + `FileImage`로 붙인다. 공개·비공개 분류는 가정이고 공동양육자 한정 여부는 SJM 확인 전. 팀 공지 문구는 2026-10-30 세션에서 사용자에게 전달함
- 백엔드에 알릴 것(범위 밖, 2026-10-30): ① 파일은 올린 PC 디스크에만 있어 공용 DB의 다른 사람 사진은 이 PC·배포 서버에서 404(`/api/files/public/4247` 등) ② 게시글을 지워도 그 사진 `/api/files/public/{번호}`가 200으로 계속 열린다(글 1021·사진 4251) ③ 브라우저 `fetch`로 직접 보낸 `DELETE /api/posts/1021`은 403, 화면 [삭제]는 성공(원인 안 봄)
- 대화창 화면 URL `/ai` → `/ai-chat`(2026-10-30, backend-90 요청, 사람이 고침): 배포 Nginx가 `/ai`를 301로 `/ai/`(Python)에 보내 Not Found였다. Nginx는 바꾸지 않았다(임시 `location = /ai` 없음, 사람 확인 2026-10-30). PR #120 병합(2026-10-30) 뒤 `https://pawever.cloud/ai-chat`이 200·SPA로 열림(curl 확인 2026-10-30). 남은 것: 팀에 알림(사람)
- SCR-AIM-011·013 연결 남음: FN-AIM-011-08 대표 반려동물 기본 선택은 SJM이 `features/pet/api.js` `getPets`를 실제 `GET /api/pets`로 붙인 뒤 확인(지금 가짜는 `rprsYn: 'Y'`라 계약 필드 `rprsPetYn`이 없어 기본 [전체]). SJM에게 "pet 가짜 `getPets`의 대표 필드가 `rprsYn: 'Y'`인데 계약은 `rprsPetYn`(boolean)이에요. AI 대화창이 `usePets`로 `rprsPetYn`을 읽어요"라고 알린다. 본창 건강 일지는 `features/health/api.js` 가짜 목록이라 같은 `petSn`이 다른 이름일 수 있다(JAJ 연결 몫). 다시 연 대화에서 결과 카드 다시 불러오기는 명세 FN-AIM-013-09 미결
- 정리(2026-10-30 검증 데이터): 대화 138 "검증 초코 태그"·139 "영수증 분석"(둘 다 `petSn` 1)과 펫 태그 검증 때 만든 "검증 나비 태그"·"검증 전체 태그"를 `/ai-chat` 사이드바에서 삭제. 영수증 `recptSn` 531은 백엔드 정리 방법을 따른다
- SCR-AIM-013 병합 순서: ai 저장소 SCR-AIM-013(`receipt-result`·`AIMC0031`, 작업 사본 커밋 전)·백엔드 공통코드 AIMC0031 PR과 같은 때 병합한다. 공통코드는 알림 코드가 그대로라 `notiTabs.js` `INQRY_ANSWR`='AIMC0030' 유지
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
- SCR-AIM-011 연결 남음: ① (011-08은 2026-10-30 연결, 위 SCR-AIM-011·013 줄) ② 두 번째 이후 메시지·AI 답변 저장은 SCR-AIM-002에서 서버로 옮김. `fakeMessages`는 일정 등록·영수증 가짜만 남았고 SCR-AIM-012·013 연결 때 지운다 ③ FN-AIM-011-03·17 세션 만료 시 창 닫기(SCR-COM-003 003-10과 함께). 서버가 대화 갱신 시각을 주면 `lastActive`(이어 쓴 대화 목록 순서)를 그 값으로 바꾼다
- 팀에 알릴 것(SCR-AIM-011, PR 전): "AI 서버 요청은 `api/axios.js`의 `aiApi`(같은 오리진 `/ai`)로 보내요. `VITE_AI_API_URL`·`withCredentials`는 쓰지 않고(`docs/convention/api.md`), 오류 모양·401 재발급은 `api`와 같은 인터셉터를 써요. 재발급은 항상 `/api/auth/refresh`예요. `scripts/check-axios-errors.mjs`가 `@/` 별칭 때문에 돌지 않던 것을 고쳤으니 인터셉터를 고치면 `node scripts/check-axios-errors.mjs`를 돌려 주세요"
- ai-e6·백엔드 세션에 알릴 것: 공용 DB를 쓰는 백엔드에서 `POST /ai/conversations`가 502 `EXTERNAL_API_ERROR`를 낸 적이 있다(방과 메시지는 저장됨). ai 저장소 `app/core/backend.py`의 `TIMEOUT_SEC = 3.0`보다 Java 응답이 느린 것으로 보인다. 이때 화면은 "메시지를 보내지 못했어요"를 띄운다(새로고침하면 대화는 목록에 있음)

- 사람이 할 일(SCR-COM-003): 디스코드로 알린다: "로그인이 필요한 화면(user 레이아웃의 mypage·health·settings·community·support·main)이 이제 `ProtectedRoute`로 감싸져 로그인 없이는 열리지 않아요. 로그아웃 상태로 들어가면 스켈레톤 뒤 `/login?redirect=`로 가고, 회원이 `/admin`에 가면 `/main`으로 가요. 화면을 만들 때 백엔드를 띄우고 로그인해야 해요. `api/axios.js`는 401이면 랜딩이 아니라 로그인으로 보내고(`/login`에서는 이동 안 함), 로그인 화면 보조 요청(`getLoginStatus`·`getCaptcha`)에 `skipAuthRedirect`를 붙였어요" ③ YAY에 알린다: 로그인 화면 `features/member/api.js`·`login/useEmailLogin.js`를 이 PR에서 고쳤다(이메일 입력 중에는 비밀번호·보안코드를 유지하고 칸을 벗어날 때 `checkedEmail`과 다르면 비우고 새 보안코드). `getRoleHome`(`routes/redirect.js`)은 003-08(로그인 상태로 랜딩에 오면 메인으로)에서 쓰면 된다
- SCR-COM-003 연결 남음: `ai`·`chat`·`place`·`main`(bare 랜딩 제외)도 로그인 필요라면 `AppRoutes.jsx`에 `pick('bare', 'member')`를 `ProtectedRoute` 아래에 더해야 한다. `ai`·`chat`은 세션 만료 때 창 닫기(003-10)와 함께 정한다. 배포 때 nginx에서 로그인 쿠키가 없으면 `/login`으로 보내는 방법은 배포 담당과 이야기해 볼 수 있다(`ProtectedRoute` 확인은 그대로 필요). 로그아웃 상태에서 `/auth/me`가 두 번 나가는 것(`main.jsx` 미리 요청 + `useMe`)은 동작에 영향 없음
- 백엔드 세션(`backend-a8`)이 이 세션 요청을 처리함(로컬 커밋, push 전): 알림 목록 정렬을 안 읽음 우선으로(COM-004-05), 시드 알림·미션 경로를 프론트 라우트로 고침. 사람이 할 일: ① DMS 명세 FN-COM-004-05 문구를 새 버전으로 올린다 — 제안 문구 "안 읽은 알림을 먼저, 같은 읽음 상태끼리는 최신순으로 최대 5건 노출한다." ② 미션 이동 경로(`/health/calendar`로 맞춘 시드)는 SJM이 미션 기획대로 확정 ③ 공용 DB의 기존 알림 행은 팀원이 마이그레이션 UPDATE로 고친다
- 디스코드로 알릴 것(백엔드 세션이 적용할 때): 공용 DB 요청이 1초씩 걸린 원인은 DB 왕복 횟수. 백엔드가 JDBC URL 옵션 5개로 약 0.3초까지 줄였고, `application.properties`는 git에 없어 팀원이 직접 URL을 바꿔야 한다
- 알림 화면 로딩 표시 확인: 알림 패널(5행)·프로필 드롭다운·전체 메뉴(NavDrawer) 스켈레톤을 넣었다. `ProtectedRoute`의 `return null`(로그인 확인 전 화면이 통째로 빈다)은 이번에 안 건드렸다 — 헤더·푸터를 먼저 그릴지 결정 대기(공용 파일, `docs/convention/shared-files.md`)
- 디스코드로 알릴 것(공용 `src/api/axios.js`, 팀에 알리지 않고 고침 — 사용자 결정 10-26): "`api/axios.js`가 서버 오류의 `code`·`message`를 읽지 못해 모든 API 오류가 '일시적인 오류가 발생했어요.'로 나오던 것을 고쳤어요. 이제 `error.code`·`error.message`가 서버 값 그대로고, 입력값 오류(`INVALID_INPUT_VALUE`)는 `error.fields`에 `[{ field, message }]`가 와요. 재발급은 401 `TOKEN_EXPIRED`일 때만 하고, `UNAUTHORIZED`·403 `MEMBER_INACTIVE`는 바로 로그인 화면(`/login?redirect=`)으로 가요. `SERVER_ERROR`를 기대하고 분기한 곳이 있으면 확인해 주세요. 인터셉터를 고치면 `node scripts/check-axios-errors.mjs`를 돌려 주세요". SJM: `PetFormModal.jsx:294` `error.fields` 입력칸 문구가 이제 처음 동작한다(화면 확인 안 함)
- JAJ에 알릴 것(SCR-AIM-013): `HealthDiaryPage.jsx`에 넣은 입구 2개(`?checkup=manual&recptSn=` 빈 폼, `?recptSn=&petSn=` 결과 확인, 2026-10-30 `petSn` 추가·Java 조회로 바뀜. 결과 확인 모달의 원본 이미지는 아이콘만 보이니 `GET /api/receipts/{recptSn}/image` 연결 여부도 함께)와 쿼리 이름 확인 요청, 결과 확인 모달 입력을 `ReceiptResponse`(`GET /api/receipts/{recptSn}`)로 함께 바꾸자는 제안. PR #93 참고. 메시지 초안은 2026-10-26 세션에서 사용자에게 전달함
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
- SCR-ADM-090 검증 오류 메시지 구체화(마일스톤 `대기`, 사람 결정 2026-11-03: 맨 마지막에 한다, 사람 요청 2026-11-03): 모르는 치환 변수를 넣으면 "입력값이 올바르지 않습니다."만 보여 무엇이 문제인지 알 수 없다. 저장 전에 칸·변수 이름을 보이게 한다
