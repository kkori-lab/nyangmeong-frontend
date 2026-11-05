# KSJ 핸드오프

## 지금 하는 것

SCR-CMU-004 우리동네 펫돌봄 · 채팅 여부·최저시급 연결 (2026-11-05) — 상태: 끝 (검증 1회차 `확인 못 함 있음`(내 것 없음, 연결 남음만), `yarn -s lint` 0·`yarn -s build` 0, 사람 확인 2026-11-05)

- 바꾼 것: `CareSideBox.jsx`에 방문자 「내 채팅」(상태 배지, 끝난 글은 [내 채팅 보기])·작성자 「매칭된 돌보미」 칸을 상세 응답 `chatting`·`mtchSitterNcnm`으로, 글쓰기·수정 최저시급 안내·검사·문구를 `GET /care-recruitments/minimum-wage` 값으로(상수 제거, 서버 `CARE_MIN_WAGE_NOT_MET`은 금액 칸에 표시)

## 다음에 할 것

- SCR-CMU-004 연결 남음: FN-CMU-004-05 끝난 글 [내 채팅 보기]·[채팅하기]가 기존 방을 여는 것(채팅 창 `features/chat/api.js`가 아직 가짜라 실제 방 대신 가짜 방으로 감, LJS 채팅 창 API 연결 뒤 확인)
- 백엔드 데이터(사람, 백엔드 저장소에서 /start): 펫돌봄 시드 글 100건이 모두 전북 밖(`RLS_RGN_NM` 「강서구」 등)이라 전북 지역 필터가 0건, 상세 지도가 안 나온다. 시드 SQL과 공용 DB(`UPDATE`)의 `RGN_SN`·`RLS_RGN_NM`(「전주시 완산구 효자동」 형태)·좌표·`PRTC_PLC_DADDR_ENC`를 전북으로
- 펫돌봄 검증 때 만든 데이터는 DB에서 직접 지운다(사람): 펫돌봄 글 102·103·104(화면에서 삭제, 숨김)와 첨부 4215~4219·업로드 파일, 글 49(pstSn 949)·51(pstSn 951) 신고, 채팅 방 11(채팅 창이 만든 것이면)
- 실종센터·펫이야기 상세·수정, 펫뉴스 상세의 「…찾지 못했어요」도 펫돌봄처럼 `EmptyResult` 박스로 맞출지 정한다(펫돌봄만 바꿈 2026-11-04)
- (낮은 우선순위) 공지 본문 맨 끝 줄이 못 불러오는 이미지면 그 앞 문단 아래 20px이 남는다(`PostBody` `last:mb-0`이 빈 fragment 때문에 안 걸림). 거슬리면 이미지 블록에 감싸는 요소를 둔다
- 백엔드(같은 공유, 백엔드 저장소에서 /start): 파기 회원이 게시글·댓글에 `탈퇴회원#번호`(DB 닉네임 UK 때문)로 보인다. 커뮤니티 조회에서 파기 회원은 `mbrNcnm`을 「탈퇴한 회원」, `mbrAtchFileSn`을 null로 준다. 프론트는 고칠 것 없음
- 펫돌봄 완료 사진 관리자 열람(사람 결정 2026-11-04, 1안): 완료 사진은 채팅 사진이라 비공개 저장(`ChatMessageService` `fileStore.store`)이고 관리자 화면(`adminCommunity/CareMatchDetailModal.jsx`)이 `publicFileUrl`로 열어 404. 백엔드에 관리자 전용 `GET /api/admin/care-matches/{…}/images/{atchFileSn}`(관리자 + 그 모집글 완료 요청 회차 사진일 때만, `AdminInquiryController` 이미지와 같은 방식)을 추가하고, 관리자 프론트는 `useFileImage`로 바꾼다. 백엔드는 KSJ(채팅·매칭, 백엔드 저장소에서 /start), 관리자 프론트는 LJS에 전달. 사용자 화면은 고칠 것 없음. 채팅 실시간 제안(백엔드 `docs/api/community.md` 「실시간」) 검토는 따로 남음
- 데이터(사람): 공용 DB 「[실종]」 글이 `BBS_CD=CMUC0002`라 관리자 `CMUC0024` 필터가 0건. 사용자 화면은 `/lost-reports`라 영향 없음
- 시드 이미지 묶음이 시드 SQL(`db/seed/20261028_seed_data.sql`, 백엔드)과 다른 생성본이다. 게시글 사진 3481~3529가 없고(번호가 49씩 밀림), 채팅·펫돌봄·1:1 문의·뉴스 시드 사진도 빠지거나 어긋난다. LJS에게 같은 생성본을 `public/seed/...` 구조로 받아 백엔드 `uploads/seed`·`uploads/public/seed`를 바꾼다(지금 `uploads/public/seed`의 `post`·`character`는 임시 복사본)
- 실종센터 검증 때 만든 데이터(실종 글 110~114와 첨부 4219~4247, 글 57·21·9 신고, 112 종료일 연장)는 DB에서 아직 안 지웠으면 직접 지운다(사람)
- 펫이야기 검증·확인 때 만든 데이터(글 1001~1006과 그 댓글·신고·좋아요·첨부)는 DB에서 아직 안 지웠으면 직접 지운다(사람, 업로드 파일은 지움)
- 사람이 고치는 문서: 기능명세서 FN-CSC-002-01 「질문 목록에는 카테고리 배지가 함께 표시된다」 삭제(디자인에 배지 없음, 2026-10-30 결정)
- 사람이 고치는 문서: 기능명세서 FN-CSC-003-18 끝 문구 「표시하고다」 오타, 화면설계서 SCR-CSC-003-03에 [삭제] 버튼·확인 모달 추가
- LJS 「공통 파일 이미지 컴포넌트」(`hooks/`·`components/`)가 생기면 `features/inquiry/queries.js` `useInquiryImageUrls`를 그것으로 바꾼다
- 문의를 수정해 저장하면 `inquiryKeys.all` 무효화가 이미지 쿼리까지 다시 받아, 방금 지운 첨부에 404 요청이 한 번 나간다(화면 영향 없음). 거슬리면 무효화 범위를 목록·상세로 좁힌다
- SCR-CSC-003 연결 남음: FN-CSC-003-09·11·15 업로드 한도(백엔드 연결 `max-request-size` 10MB → 100MB, 백엔드 저장소에서 /start). `application.properties.example` 커밋과 팀원·디스코드 `application.properties`도 같이 바꾼다
- SCR-CSC-003 연결 남음: FN-CSC-003-10 `pixelCharSn`·`charPhotoSn` 전송(SJM 캐릭터 화면이 `petSn`만 넘김), 003-14 답변 알림(YAY), 003-16 로그인 화면 쿠키 뒤 동작 확인(YAY, 라우트는 LJS #100이 `member`로 감쌈)
- 검증·확인 중 만든 테스트 문의(회원 1의 201·204·205·215·217~227, 회원 2의 216, 사람 확인 때 만든 것. 204·205와 이후 것은 삭제 API로 숨김 처리만 됨)는 DB `OTO_INQRY`·`OTO_INQRY_STTS_HSTRY`·`INQRY_ATCH_PHOTO`·`ATCH_FILE`과 업로드 파일에서 직접 지운다(사람)
- 장소 찾기 모달의 스크롤바를 끌어도 닫히지 않는지는 실제 브라우저(스크롤바가 보이는 환경)에서만 확인됐다. 다른 OS·브라우저에서 이상하면 `Modal.jsx` `handleMouseDown`을 본다
- SCR-CMU-004 연결 남음: FN-CMU-004-11 글쓰기·수정 `ProtectedRoute`와 [돌봄 요청 등록하기]·[채팅하기] 비로그인 로그인 이동 후 복귀(YAY)
- 실종센터 목록은 필터를 바꾸면 목록이 새로 불러와져 필터 영역이 잠깐 사라질 수 있다. 펫돌봄처럼 `missingQueries.js`의 `useMissingList`에 `placeholderData: keepPreviousData`를 넣을지 정한다
- SCR-CMU-001 연결 남음: 로그인 연결 후 글쓰기·수정 `ProtectedRoute`와 비로그인 좋아요·댓글·글쓰기 로그인 이동 후 복귀(FN-CMU-001-09·11·14·15, YAY), 댓글 알림 저장(FN-CMU-001-11, YAY `notification`). 기능명세서에 없는 「내 댓글 삭제」는 사람이 명세에 보완
- SCR-CMU-002 연결 남음: FN-CMU-002-10·11 전북 밖 좌표 거절(백엔드 연결 `POST·PATCH /lost-reports`, 낮은 우선순위), FN-CMU-002-11 장소 검색을 YAY `GET /places`로 교체(YAY), FN-CMU-002-05·10 연락처 로그인 회원만·로그인 이동 후 복귀·`ProtectedRoute`(YAY), FN-CMU-002-09 종료 알림(YAY). 읍·면·동 필터는 DB `RGN` 전주시 아래 행이 생기면 다시 본다. 작성자가 찾았어요로 바꾼 글 상세에 [수정]이 보이는 것(서버는 실종 상태만 수정 허용)을 숨길지 정한다
- SCR-CMU-002 사람이 정할 것: 실종 기간 필터 기준(화면설계서·기능명세서는 목격 날짜, ERD 비고 2026-09-23은 등록일시 `PST.REG_DT`), 품종 필수 여부(명세는 필수, ERD·디자인은 선택), 기능명세서 FN-CMU-002-09의 자동 댓글 이모지·「찾았어요!」 문구(디자인은 「찾았어요」)
- SCR-CMU-003 연결 남음: FN-CMU-003-04 관리자 글 첨부 이미지 실제 표시(시드 첨부 4061~4074가 공개 주소에서 404, 관리자 뉴스 등록 화면 ADM이 공개 파일로 저장하는지, LJS). 관리자 등록이 비공개 파일이면 `NewsDetail.jsx`를 `useFileImage`로 바꾼다
- 펫뉴스 데이터(백엔드, 필요하면 백엔드 저장소에서 /start): 시드 뉴스 썸네일이 `news.example.com` 가짜 주소라 자리 표시로 나옴, 수집 기사 요약에 `&#39;` 같은 HTML 엔티티가 그대로 남음(100번에서 봄). 공용 DB에 v0.11 (7)·(8) 뉴스 제외 키워드가 들어갔는지 확인 뒤 수집
- 펫뉴스 「많이 본 뉴스」 레일: 디자인에는 있으나 기능명세서에 FN이 없고 ERD에 조회수 컬럼도 없어 뺐다(사람 결정 2026-10-22). 사람이 기능명세서에 FN(조회수 집계·기준 기간)과 ERD 컬럼을 추가하면 목록 오른쪽(1100px 이하는 목록 아래)과 상세 레일에 넣는다(디자인 `.st-rail`·`.rank`)
- LJS 요청: `SubPageLayout`에 `back={false}`를 넘기면 머리에 목록용 메뉴 전환 ▾(761~1100px)가 켜진다(`hasSwitch = !title && !hasBack`). 본문 하단에 「목록으로」를 두는 상세(펫뉴스·공지)는 ▾와 위 「목록으로」를 모두 끄는 prop(예: `back="none"`)이 필요한지 정한다
- CMU 화면은 `SubPageLayout`(`section="community"`)으로 만든다(사람 결정 2026-10-22): 상세는 `title` 없이 제목이 메뉴 이름이고 「목록으로」는 본문 하단, 글쓰기·수정은 `title="글쓰기"`와 `onLeave`로 「작성을 그만둘까요?」 확인, 본문 위 여백은 펫이야기 목록 `min-[1101px]:pt-0`, 펫돌봄·실종센터 목록 `min-[1101px]:pt-[7px]`
- 고객센터(`CustomerCenterLayout`, KSJ)도 `SubPageLayout`(`section="support"`)으로 옮긴다(LJS 핸드오프). 옮기면 `SideMenu`의 `menuLabel` 호환과 `/dev/sub-page`를 지운다
- SCR-CSC-003 사람이 고치는 문서: 기능명세서 FN-CSC-003-13의 「[문의 수정] 비활성」을 「버튼 숨김 + 안내 문구」로, 화면설계서 SCR-CSC-003-03 ③의 같은 문구
- 375px 페이지 가로 스크롤은 공용 푸터가 원인(`UserFooter.jsx`, LJS). develop의 LJS 반응형 작업이 들어오면 다시 본다(FN 추가-4 연결 남음). 푸터 일러스트와 내용 사이 여백도 LJS가 푸터 공통 레이아웃에서 정하고, 그 전까지 고객센터 화면은 내용이 띠에 붙어 보인다
- 사람이 고치는 문서: 기능명세서 FN-CSC-001-03 「공지 제목 검색」→ 제목·내용 검색, FN-CSC-001-01 「제목·작성일만 노출」→ 번호 포함, 화면설계서 SCR-CSC-001-01 ② 검색 문구. FN-CSC-001-05 「작성자·작성일·조회수」에서 조회수 삭제(상세에 조회수를 보이지 않기로 함, 2026-10-30)
- 본문 영역은 `components/PostBody`(최소 200px은 사진과 글을 합친 영역 기준, 아래 여백 없음 2026-10-30)로 맞춘다. 펫이야기·공지·펫뉴스·실종센터·펫돌봄은 적용됨. 남음: 1:1 문의 상세(CSC-003, 사람이 적용 예정). 「‹ 목록으로」와 구분선은 `PostBody` 안에 없고 각 상세가 둔다
- (2026-10-21 화면은 LJS로 이관, 채팅 API는 KSJ. 목록·대화·읽음·소켓 이벤트의 요청·응답 모양을 LJS와 먼저 맞춘다) SCR-COM-009 연결 남음(LJS 핸드오프에서 넘어옴): `ChatModalPlaceholder.jsx`를 실제 셸로 교체하고 `ChatModal.jsx`의 DEV 조건 제거, 헤더 안 읽은 수 배지(002-11), 004-09 펫돌봄 알림이 채팅방을 열게 하는 방 식별자(`otoChatRoomSn`, YAY), 마지막에 본 방을 새로고침 뒤에도 기억할지
- 다른 PC에서 이어 갈 때: `.env.local`에 `DMS_MCP_URL`·`FIGMA_FILE_URL`을 디스코드 최신 파일로 채운다(`FIGMA_TOKEN`은 비어도 됨). `.cache/`는 git 제외라 화면설계서는 `/start`가 DMS에서 다시 받고 Figma PNG는 노드를 Figma MCP로 다시 받는다
