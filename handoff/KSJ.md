# KSJ 핸드오프

## 지금 하는 것

SCR-CSC-003 1:1 문의 · 캐릭터 오류 문의 이미지 미리보기 (2026-11-11) — 상태: 끝 (검증 2회차 `통과`, `yarn -s lint` 0·`yarn -s build` 0, 사람 확인 2026-11-11)

- 바꾼 것: 문의 작성 화면에서 유형이 「픽셀 캐릭터」이고 캐릭터 화면에서 넘어왔으면 「이미지 추가」 칸 오른쪽에 삭제 불가 「캐릭터 이미지」 칸(`ImageAttach` `fixedImage`, 이미지는 `useCharacterImage(petSn,'full')`, 못 받으면 자리 표시)과 안내를 보임. 캐릭터 생성 완료 창 「오류 문의」 링크에 `pixelCharSn` 추가(SJM 화면, 이전에는 자동 첨부가 안 됐음)
- 추가 요청: 추가-1 문의 유형 목록 스크롤 없애기(공용 `DropdownSelect`에 `listMaxHeight`, 기본 256 그대로, 열림 방향 계산 +8→+10), 추가-2 캐릭터 이미지를 「이미지 추가」 칸 오른쪽 칸으로(`fixedImage`)

## 다음에 할 것

### 내가 할 것(프론트)
- SCR-CMU-005: 주소 공유 말풍선을 지도 카드로 보이고 [장소 보기]로 큰 지도 창을 연다(사람 결정: 받는 쪽이 주소로 위치를 찾는 프론트만 방식. 핀이 어긋나면 백엔드에 좌표 저장 요청). 이번 정리 PR 뒤 `/start CMU-005`
- SCR-CMU-005: 「내 돌봄 글의 채팅 / 전체 채팅」 띠 삭제는 사람이 더 생각해 보기로 함(보류)
- 수집 기사로 펫뉴스 상세·목록 높이 기준을 운영 데이터에서 다시 확인한다(로컬은 수집 기사가 없고 시드 썸네일이 가짜 주소)

### 남을 기다리는 것(연결 남음)
- SCR-CMU-001: 펫이야기 목록 「내 글」 배지는 백엔드 `PostSummary.owner`를 기다린다. 같은 백엔드 작업의 `GET /posts?mineYn=true`가 들어오면 프론트에서 펫이야기 목록에 「내 글만 보기」 체크박스를 더한다(마이페이지에 내가 쓴 글 목록이 없어 필요하다고 정함, 실종센터·펫돌봄 필터를 참고). 서버 자동 댓글에 붙는 🎉는 화면에서 가렸고 서버(`LostReportService.FOUND_COMMENT`)에서도 뺄지는 선택
- SCR-CMU-002: 실종센터 검색 안내 문구를 「제목, 지역, 품종, 특징으로 검색」으로 바꾸는 것은 백엔드 `GET /lost-reports` 검색에 제목(`PST_TTL`)이 들어간 뒤에 한다(백엔드 저장소에서 /start)
- 채팅 API 연결(LJS, 2026-11-05 전달): `features/chat/api.js` 가짜를 백엔드 채팅·매칭 API로. 연결 뒤 SCR-CMU-004 FN-CMU-004-05 [내 채팅 보기]·[채팅하기]가 기존 방을 여는지 확인(회원 152 글 3 → 방 8). 같이 남은 것: 헤더 안 읽은 수 배지(COM-002-11), 004-09 펫돌봄 알림이 채팅방을 여는 방 식별자(`otoChatRoomSn`, YAY), 마지막에 본 방을 새로고침 뒤에도 기억할지. `/dev/chat`·`ChatDevPage`(「[채팅하기]가 생기면 지움」)와 `/dev/sub-page`(고객센터 이관 끝) 삭제도 LJS에 알린다
- SCR-CMU-001: 댓글 알림 저장(FN-CMU-001-11, YAY `notification`)
- SCR-CMU-002: 장소 검색을 YAY `GET /places`로 교체(FN-CMU-002-11, YAY), 종료 알림(FN-CMU-002-09, YAY). 읍·면·동 필터는 DB `RGN` 전주시 아래 행이 생기면 다시 본다
- SCR-CMU-003: FN-CMU-003-04 관리자 글 첨부 이미지 실제 표시(시드 첨부 4061~4074가 공개 주소에서 404, LJS 관리자 뉴스 등록이 공개 파일로 저장하는지). 비공개 파일이면 `NewsDetail.jsx`를 `useFileImage`로 바꾼다
- SCR-CSC-003: FN-CSC-003-14 답변 알림(YAY). 003-10 `charPhotoSn`은 SJM 캐릭터 화면이 넘기면 `createInquiry`에 더한다(서버 선택 값)
- 375px 페이지 가로 스크롤은 공용 푸터가 원인(`UserFooter.jsx`, LJS). LJS 반응형 작업이 들어오면 다시 본다(CSC 추가-4). 푸터 일러스트와 내용 사이 여백도 LJS가 정한다

### 백엔드(백엔드 저장소에서 /start)
- 작성자 본인이 자기 글 상세를 열어도 조회수가 오른다(`PostService.getPost`·`LostReportService.getReport`·`CareRecruitmentService.getRecruitment`). 작성자는 건너뛰게 고친다(사람이 백엔드에서 진행)
- SCR-CMU-002: FN-CMU-002-10·13 `POST·PATCH /lost-reports`가 `vrtySn`·`vrtyDrctInptNm` 둘 다 없는 요청을 받게(`LostReportService` 「둘 중 하나만」 검사). 이것이 들어간 뒤 품종 없는 글의 상세(「강아지」만)·카드(품종 줄 없음)·수정 폼(미선택으로 열림)을 확인하고 프론트 PR을 합친다
- 관리자 설정 `dscvAutoCmntCn`(찾았어요 자동 댓글)이 저장만 되고 댓글에는 반영되지 않는다. `LostReportService.FOUND_COMMENT` 상수가 쓰인다. 설정값을 쓰게 하면 프론트 미리보기(`missingCodes.js` `foundCommentText`)도 설정값을 받아야 한다
- 펫돌봄 완료 사진 관리자 열람(SCR-ADM-022, 진행): 관리자 전용 `GET /api/admin/care-matches/{petPrtcRcrtSn}/images/{atchFileSn}` 구현은 로컬에 있고 커밋 전. 끝나면 LJS에 `CareMatchDetailModal.jsx` `publicFileUrl` → `useFileImage` 전달. 채팅 실시간 제안(`docs/api/community.md` 「실시간」) 검토는 따로
- 파기 회원이 게시글·댓글에 `탈퇴회원#번호`로 보인다. 커뮤니티 조회에서 파기 회원은 `mbrNcnm`을 「탈퇴한 회원」, `mbrAtchFileSn`을 null로 준다(프론트는 고칠 것 없음)
- SCR-CMU-002: FN-CMU-002-10·11 전북 밖 좌표 거절(`POST·PATCH /lost-reports`, 낮은 우선순위)
- 펫뉴스 데이터: 시드 뉴스 썸네일이 `news.example.com` 가짜 주소라 자리 표시로 나옴, 수집 기사 요약에 `&#39;` 같은 HTML 엔티티가 남음(100번). 공용 DB에 v0.11 (7)·(8) 뉴스 제외 키워드가 들어갔는지 확인 뒤 수집

### 사람이 할 것(DB·파일·문서)
- SCR-CSC-003: SJM에 캐릭터 생성 완료 창 「오류 문의」 링크에 `pixelCharSn` 한 줄을 KSJ가 추가했다고 알리기. 검증 중 만든 문의 226·227(캐릭터 문의)이 남아 있다(접수 상태가 아니라 화면 삭제 불가, DB·관리자 화면에서 정리). 로컬 AI 서버가 꺼져 있어 완료 창은 실제 생성으로 못 봤다(요청 가로채기로 확인)
- SCR-CMU-005: LJS에 이번 정리(채팅 아바타·역할 글자 삭제·거래 카드 한 줄·주소 공유 검색형, 공용 `Modal` 옵션 3개) 알리기. 기능명세서 FN-CMU-005-02(역할 표시·「안 읽음만」)·005-04·005-05(「처음에는 돌봄 글 동네 근처 장소」)와 화면설계서 SCR-CMU-005-01·02·주소공유모달을 변경에 맞춰 고치기. 검증 중 방 271에 생긴 주소 공유 테스트 메시지(`OTO_CHAT_MSG`) 삭제
- 로컬 이미지: `D:\home\ggorilab\attachment\seed\post`·`character`를 `attachment\public\seed\`로 복사한다(시드 SQL이 `public/seed/post|character/…`로 저장했는데 파일이 `seed/…`에만 있어 404). 나머지 `seed` 폴더(비공개)는 그대로 둔다. 복사해도 post는 SQL 636건 중 약 50건이 없다(시드 이미지 묶음이 SQL과 다른 생성본)
- 기능명세서 FN-CMU-004-09는 「사진은 선택 사항」 그대로 맞다(사진 필수는 하지 않기로 함)
- 로컬 백엔드 `app.file.root-dir`이 `/home/ggorilab/attachment`라 시드 이미지(`uploads/`)를 못 찾아 `/api/files/public/*`가 404(커뮤니티 썸네일·첨부가 깨져 보임). 개인 `application.properties`의 `app.file.root-dir`을 백엔드 저장소 `uploads` 폴더로 맞추고 서버를 다시 시작한다
- 공용 DB: 펫돌봄 시드 글을 전북 지역으로(시드 SQL은 백엔드 845613d에서 고침, 공용 DB `UPDATE` 반영 확인)
- 공용 DB: 「[실종]」 글이 `BBS_CD=CMUC0002`라 관리자 `CMUC0024` 필터가 0건(사용자 화면은 영향 없음)
- 업로드 한도 100MB는 백엔드 `application.properties.example`에 들어감. 팀원·디스코드의 `application.properties`도 `max-request-size=100MB`로 바꾼다
- 시드 이미지 묶음이 시드 SQL(`db/seed/20261028_seed_data.sql`)과 다른 생성본이다(게시글 사진 3481~3529 없음, 번호가 49씩 밀림, 채팅·펫돌봄·1:1 문의·뉴스 사진도 어긋남). LJS에게 같은 생성본을 `public/seed/...` 구조로 받아 백엔드 `uploads/seed`·`uploads/public/seed`를 바꾼다
- 검증 데이터 삭제(아직 안 지웠으면): 펫돌봄 글 102·103·104와 첨부 4215~4219·업로드 파일, 글 49(pstSn 949)·51(pstSn 951) 신고, 채팅 방 11 / 실종 글 110~114와 첨부 4219~4247, 글 57·21·9 신고, 112 종료일 연장 / 펫이야기 글 1001~1006과 그 댓글·신고·좋아요·첨부 / 테스트 문의(회원 1의 201·204·205·215·217~227, 회원 2의 216, `OTO_INQRY`·`OTO_INQRY_STTS_HSTRY`·`INQRY_ATCH_PHOTO`·`ATCH_FILE`과 업로드 파일)
- 기능명세서: FN-CMU-002-10·13 「품종 필수·미선택 시 저장 차단」→ 선택(사람 결정 2026-11-06), FN-CSC-002-01 카테고리 배지 문장 삭제, FN-CSC-003-18 「표시하고다」 오타, FN-CSC-003-13 「[문의 수정] 비활성」→「버튼 숨김 + 안내 문구」, FN-CSC-001-03 「공지 제목 검색」→ 제목·내용 검색, FN-CSC-001-01 「제목·작성일만 노출」→ 번호 포함, FN-CSC-001-05 조회수 삭제, FN-CMU-001 「내 댓글 삭제」 보완
- ERD 비고 2026-09-23 「실종 기간 필터는 등록일시 `PST.REG_DT`」→ 최종 목격 날짜 기준으로 정정(화면·서버는 이미 목격 날짜)
- 화면설계서: SCR-CSC-003-03에 [삭제] 버튼·확인 모달 추가와 ③ 「[문의 수정] 비활성」 문구, SCR-CSC-001-01 ② 검색 문구

### 참고
- CMU 화면은 `SubPageLayout`(`section="community"`)으로 만든다(2026-10-22): 상세는 `title` 없이 제목이 메뉴 이름이고 「목록으로」는 본문 하단, 글쓰기·수정은 `title="글쓰기"`와 `onLeave`로 「작성을 그만둘까요?」 확인, 본문 위 여백은 펫이야기 목록 `min-[1101px]:pt-0`, 펫돌봄·실종센터 목록 `min-[1101px]:pt-[7px]`. 고객센터는 LJS 088ec11에서 `CustomerCenterLayout` → `SubPageLayout`(`section="support"`)으로 옮겨짐
- 문의 첨부는 `useInquiryImageUrls`(object URL + 해제)를 그대로 쓴다. 공용 `hooks/useFileImage`는 data URL 캐시용이고, 그 주석에 한 화면 전용 큰 사진은 문의 방식으로 둔다고 적혀 있다
- 장소 찾기 모달의 스크롤바를 끌어도 닫히지 않는지는 스크롤바가 보이는 실제 브라우저에서만 확인됐다. 다른 OS·브라우저에서 이상하면 `Modal.jsx` `handleMouseDown`을 본다
- 다른 PC에서 이어 갈 때: `.env.local`에 `DMS_MCP_URL`·`FIGMA_FILE_URL`을 디스코드 최신 파일로 채운다(`FIGMA_TOKEN`은 비어도 됨). `.cache/`는 git 제외라 화면설계서는 `/start`가 DMS에서 다시 받는다
