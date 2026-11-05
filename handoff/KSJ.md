# KSJ 핸드오프

## 지금 하는 것

SCR-CMU-004 우리동네 펫돌봄 · 채팅 여부·최저시급 연결 (2026-11-05) — 상태: 끝 (검증 1회차 `확인 못 함 있음`(내 것 없음, 연결 남음만), `yarn -s lint` 0·`yarn -s build` 0, 사람 확인 2026-11-05)

- 바꾼 것: `CareSideBox.jsx`에 방문자 「내 채팅」(상태 배지, 끝난 글은 [내 채팅 보기])·작성자 「매칭된 돌보미」 칸을 상세 응답 `chatting`·`mtchSitterNcnm`으로, 글쓰기·수정 최저시급 안내·검사·문구를 `GET /care-recruitments/minimum-wage` 값으로(상수 제거, 서버 `CARE_MIN_WAGE_NOT_MET`은 금액 칸에 표시)

## 다음에 할 것

### 내가 할 것(프론트, 마일스톤 절 없음. `/start`가 새로 만든다)
- 1:1 문의 상세(CSC-003)에 `components/PostBody` 적용. 펫이야기·공지·펫뉴스·실종센터·펫돌봄은 적용됨(최소 200px은 사진과 글을 합친 영역 기준, 아래 여백 없음. 「‹ 목록으로」와 구분선은 각 상세가 둔다)
- 로그인 관련 연결 남음 정리: 커뮤니티 경로 전체가 `auth: 'member'`이고 `ProtectedRoute`가 로그인 뒤 원래 화면으로 돌려보낸다(LJS 0adaaa4). 로그아웃 상태로 확인한 뒤 CMU-001(FN-001-09·11·14·15 로그인 이동)·CMU-002(FN-002-05·10 연락처·로그인 이동)·CMU-004(FN-004-11) 연결 남음을 마일스톤에서 닫고, `communityRoutes.js`의 「로그인 구현 전 public」 주석을 고친다
- (낮은 우선순위) 공지 본문 맨 끝 줄이 못 불러오는 이미지면 그 앞 문단 아래 20px이 남는다(`PostBody` `last:mb-0`이 빈 fragment 때문에 안 걸림). 거슬리면 이미지 블록에 감싸는 요소를 둔다
- (낮은 우선순위) 문의를 수정해 저장하면 `inquiryKeys.all` 무효화가 이미지 쿼리까지 다시 받아 방금 지운 첨부에 404 요청이 한 번 나간다(화면 영향 없음). 거슬리면 무효화 범위를 목록·상세로 좁힌다

### 정할 것(사람)
- 실종센터·펫이야기 상세·수정, 펫뉴스 상세의 「…찾지 못했어요」도 펫돌봄처럼 `EmptyResult` 박스로 맞출지(펫돌봄만 바꿈 2026-11-04)
- 실종센터 목록에 펫돌봄처럼 `placeholderData: keepPreviousData`(`missingQueries.js` `useMissingList`)를 넣어 필터를 바꿀 때 필터 영역이 사라지지 않게 할지
- 실종센터 작성자가 찾았어요로 바꾼 글 상세에 [수정]이 보이는 것(서버는 실종 상태만 수정 허용)을 숨길지
- SCR-CMU-002: 실종 기간 필터 기준(화면설계서·기능명세서는 목격 날짜, ERD 비고 2026-09-23은 등록일시 `PST.REG_DT`), 품종 필수 여부(명세는 필수, ERD·디자인은 선택), FN-CMU-002-09 자동 댓글 이모지·「찾았어요!」 문구(디자인은 「찾았어요」)
- LJS 요청: `SubPageLayout`에 `back={false}`를 넘기면 머리에 목록용 메뉴 전환 ▾(761~1100px)가 켜진다(`hasSwitch = !title && !hasBack`). 본문 하단에 「목록으로」를 두는 상세(펫뉴스·공지)에 ▾와 위 「목록으로」를 모두 끄는 prop(예: `back="none"`)이 필요한지
- 펫뉴스 「많이 본 뉴스」 레일: 디자인에는 있으나 기능명세서에 FN이 없고 ERD에 조회수 컬럼도 없어 뺐다(2026-10-22). 기능명세서 FN(조회수 집계·기준 기간)과 ERD 컬럼이 생기면 목록 오른쪽(1100px 이하는 목록 아래)과 상세 레일에 넣는다(디자인 `.st-rail`·`.rank`)

### 남을 기다리는 것(연결 남음)
- 채팅 API 연결(LJS, 2026-11-05 전달): `features/chat/api.js` 가짜를 백엔드 채팅·매칭 API로. 연결 뒤 SCR-CMU-004 FN-CMU-004-05 [내 채팅 보기]·[채팅하기]가 기존 방을 여는지 확인(회원 152 글 3 → 방 8). 같이 남은 것: 헤더 안 읽은 수 배지(COM-002-11), 004-09 펫돌봄 알림이 채팅방을 여는 방 식별자(`otoChatRoomSn`, YAY), 마지막에 본 방을 새로고침 뒤에도 기억할지. `/dev/chat`·`ChatDevPage`(「[채팅하기]가 생기면 지움」)와 `/dev/sub-page`(고객센터 이관 끝) 삭제도 LJS에 알린다
- SCR-CMU-001: 댓글 알림 저장(FN-CMU-001-11, YAY `notification`)
- SCR-CMU-002: 장소 검색을 YAY `GET /places`로 교체(FN-CMU-002-11, YAY), 종료 알림(FN-CMU-002-09, YAY). 읍·면·동 필터는 DB `RGN` 전주시 아래 행이 생기면 다시 본다
- SCR-CMU-003: FN-CMU-003-04 관리자 글 첨부 이미지 실제 표시(시드 첨부 4061~4074가 공개 주소에서 404, LJS 관리자 뉴스 등록이 공개 파일로 저장하는지). 비공개 파일이면 `NewsDetail.jsx`를 `useFileImage`로 바꾼다
- SCR-CSC-003: FN-CSC-003-10 `pixelCharSn`·`charPhotoSn` 전송(SJM 캐릭터 화면이 `petSn`만 넘김), 003-14 답변 알림(YAY), 003-16 로그인 화면 쿠키 뒤 동작 확인(YAY)
- 375px 페이지 가로 스크롤은 공용 푸터가 원인(`UserFooter.jsx`, LJS). LJS 반응형 작업이 들어오면 다시 본다(CSC 추가-4). 푸터 일러스트와 내용 사이 여백도 LJS가 정한다

### 백엔드(백엔드 저장소에서 /start)
- 펫돌봄 완료 사진 관리자 열람(SCR-ADM-022, 진행): 관리자 전용 `GET /api/admin/care-matches/{petPrtcRcrtSn}/images/{atchFileSn}` 구현은 로컬에 있고 커밋 전. 끝나면 LJS에 `CareMatchDetailModal.jsx` `publicFileUrl` → `useFileImage` 전달. 채팅 실시간 제안(`docs/api/community.md` 「실시간」) 검토는 따로
- 파기 회원이 게시글·댓글에 `탈퇴회원#번호`로 보인다. 커뮤니티 조회에서 파기 회원은 `mbrNcnm`을 「탈퇴한 회원」, `mbrAtchFileSn`을 null로 준다(프론트는 고칠 것 없음)
- SCR-CMU-002: FN-CMU-002-10·11 전북 밖 좌표 거절(`POST·PATCH /lost-reports`, 낮은 우선순위)
- 펫뉴스 데이터: 시드 뉴스 썸네일이 `news.example.com` 가짜 주소라 자리 표시로 나옴, 수집 기사 요약에 `&#39;` 같은 HTML 엔티티가 남음(100번). 공용 DB에 v0.11 (7)·(8) 뉴스 제외 키워드가 들어갔는지 확인 뒤 수집

### 사람이 할 것(DB·파일·문서)
- 공용 DB: 펫돌봄 시드 글을 전북 지역으로(시드 SQL은 백엔드 845613d에서 고침, 공용 DB `UPDATE` 반영 확인)
- 공용 DB: 「[실종]」 글이 `BBS_CD=CMUC0002`라 관리자 `CMUC0024` 필터가 0건(사용자 화면은 영향 없음)
- 업로드 한도 100MB는 백엔드 `application.properties.example`에 들어감. 팀원·디스코드의 `application.properties`도 `max-request-size=100MB`로 바꾼다
- 시드 이미지 묶음이 시드 SQL(`db/seed/20261028_seed_data.sql`)과 다른 생성본이다(게시글 사진 3481~3529 없음, 번호가 49씩 밀림, 채팅·펫돌봄·1:1 문의·뉴스 사진도 어긋남). LJS에게 같은 생성본을 `public/seed/...` 구조로 받아 백엔드 `uploads/seed`·`uploads/public/seed`를 바꾼다
- 검증 데이터 삭제(아직 안 지웠으면): 펫돌봄 글 102·103·104와 첨부 4215~4219·업로드 파일, 글 49(pstSn 949)·51(pstSn 951) 신고, 채팅 방 11 / 실종 글 110~114와 첨부 4219~4247, 글 57·21·9 신고, 112 종료일 연장 / 펫이야기 글 1001~1006과 그 댓글·신고·좋아요·첨부 / 테스트 문의(회원 1의 201·204·205·215·217~227, 회원 2의 216, `OTO_INQRY`·`OTO_INQRY_STTS_HSTRY`·`INQRY_ATCH_PHOTO`·`ATCH_FILE`과 업로드 파일)
- 기능명세서: FN-CSC-002-01 카테고리 배지 문장 삭제, FN-CSC-003-18 「표시하고다」 오타, FN-CSC-003-13 「[문의 수정] 비활성」→「버튼 숨김 + 안내 문구」, FN-CSC-001-03 「공지 제목 검색」→ 제목·내용 검색, FN-CSC-001-01 「제목·작성일만 노출」→ 번호 포함, FN-CSC-001-05 조회수 삭제, FN-CMU-001 「내 댓글 삭제」 보완
- 화면설계서: SCR-CSC-003-03에 [삭제] 버튼·확인 모달 추가와 ③ 「[문의 수정] 비활성」 문구, SCR-CSC-001-01 ② 검색 문구

### 참고
- CMU 화면은 `SubPageLayout`(`section="community"`)으로 만든다(2026-10-22): 상세는 `title` 없이 제목이 메뉴 이름이고 「목록으로」는 본문 하단, 글쓰기·수정은 `title="글쓰기"`와 `onLeave`로 「작성을 그만둘까요?」 확인, 본문 위 여백은 펫이야기 목록 `min-[1101px]:pt-0`, 펫돌봄·실종센터 목록 `min-[1101px]:pt-[7px]`. 고객센터는 LJS 088ec11에서 `CustomerCenterLayout` → `SubPageLayout`(`section="support"`)으로 옮겨짐
- 문의 첨부는 `useInquiryImageUrls`(object URL + 해제)를 그대로 쓴다. 공용 `hooks/useFileImage`는 data URL 캐시용이고, 그 주석에 한 화면 전용 큰 사진은 문의 방식으로 둔다고 적혀 있다
- 장소 찾기 모달의 스크롤바를 끌어도 닫히지 않는지는 스크롤바가 보이는 실제 브라우저에서만 확인됐다. 다른 OS·브라우저에서 이상하면 `Modal.jsx` `handleMouseDown`을 본다
- 다른 PC에서 이어 갈 때: `.env.local`에 `DMS_MCP_URL`·`FIGMA_FILE_URL`을 디스코드 최신 파일로 채운다(`FIGMA_TOKEN`은 비어도 됨). `.cache/`는 git 제외라 화면설계서는 `/start`가 DMS에서 다시 받는다
