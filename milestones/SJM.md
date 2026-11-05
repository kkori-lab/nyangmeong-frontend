# SJM 마일스톤

기준: 마이페이지_기능명세서_v0.4_20261025.xlsx (DMS, 2026-10-25). 10-19 변경: FN-MYP-003-03 털색 선택지, FN-MYP-010-08 1단계 털색 읽기 전용 표시. 10-25 신규: FN-MYP-005-09·005-10(SCR-MYP-005), FN-MYP-030-22(SCR-MYP-030)
10-24 디자인 시안 v0.1~v0.3 변경분(초대 v0.2·5-6, 가계부 사용처·지출 상세 시트 포함, 명세 v0.4_20261025 기준)은 기능 ID 변경 없이 화면만 고쳐 반영했다. 마일스톤 상태는 그대로다

## SCR-MYP-003 반려동물 등록/수정 — 끝

- 기능: FN-MYP-003-01 반려동물 등록/수정, FN-MYP-003-02 품종 선택, FN-MYP-003-03 털색 선택, FN-MYP-003-04 목표체중·체중 정상범위, FN-MYP-003-05 인식칩 번호 등록, FN-MYP-003-06 중성화 여부 수정, FN-MYP-003-07 알레르기·기저질환 입력
- 함께 만드는 것: `features/pet`(api·queries)
- 기다리는 것: member 로그인·회원 조회 (AIC), 품종 마스터 (KSJ), 건강 일지 체중 기록 조회 (JAJ)
- 완료 조건: 필수값(이름·품종·생년월일·체중·정상범위·털색)이 비어 있으면 [등록하기]·[저장]을 눌렀을 때 저장하지 않고 항목 아래에 오류 문구를 띄운 뒤 첫 오류 항목으로 이동한다. 수정으로 열면 기존 값이 채워지고, 체중 기록이 있으면 체중 입력란이 읽기 전용이다
- 연결 남음: FN-MYP-003-02 품종 목록 (품종 마스터, KSJ), FN-MYP-003-01 체중 기록 (건강 일지 조회, JAJ) → 품종 목록은 `features/pet/api.js` `getVarieties`·`queries.js` `useVarieties`에서, 체중 기록은 "체중 입력 잠금을 건강 일지 체중 기록 조회로 연결" 절에서 끝

## SCR-MYP-002 반려동물 프로필 목록 — 끝

- 기능: FN-MYP-002-01 등록 상한(10마리), FN-MYP-002-02 반려동물 슬라이드, FN-MYP-002-03 인식칩 번호 표시, FN-MYP-002-04 수정, FN-MYP-002-05 삭제, FN-MYP-002-06 0마리 안내, FN-MYP-002-07 삭제 확인 팝업, FN-MYP-002-08 공동양육 연동 자동 해제
- API가 남의 것: FN-MYP-002-02 캐릭터 얼굴 (LJS)
- 기다리는 것: member 로그인·회원 조회 (AIC), pet 캐릭터 이미지 조회 (LJS), notification 알림 저장 (YAY)
- 완료 조건: 슬라이드 ◀▶로 동물이 바뀌고 N/총마리가 갱신된다. 10마리면 [＋ 반려동물 등록]이 비활성이고 안내가 보인다
- 연결 남음: FN-MYP-002-02 캐릭터 얼굴 (pet 캐릭터 이미지 조회, LJS) → `components/PetFace.jsx`·`hooks/useCharacterImage.js`에서 끝

## SCR-MYP-030 가계부 목록 — 끝

- 기능: FN-MYP-030-01 총 지출·월 한도·진행률, FN-MYP-030-02 월간 달력, FN-MYP-030-03 날짜별 상세·수정·삭제, FN-MYP-030-04 카테고리별 지출, FN-MYP-030-05 반려동물별 지출, FN-MYP-030-06 이번달 주요 지출, FN-MYP-030-07 이번달 전체 내역 보기, FN-MYP-030-08 한도 알림, FN-MYP-030-09 기간 조회·월 전환, FN-MYP-030-10 필터, FN-MYP-030-11 정렬, FN-MYP-030-12 내역 리스트, FN-MYP-030-13 한도 설정 모달, FN-MYP-030-14 한도 미설정 상태, FN-MYP-030-15 삭제 확인 모달, FN-MYP-030-16 월 피커, FN-MYP-030-17 편집 모드·삭제 범위, FN-MYP-030-18 선택·전체 선택, FN-MYP-030-19 선택 요약·삭제, FN-MYP-030-20 페이지네이션, FN-MYP-030-21 다중 삭제 확인 모달, FN-MYP-030-22 사용처
- 기다리는 것: member 로그인·회원 조회 (AIC), notification 알림 저장 (YAY)
- 완료 조건: ◀▶로 달을 바꾸면 총 지출·달력·그래프가 그 달 기준으로 바뀌고 미래 달은 비활성이다. 전체 내역에서 필터·정렬을 바꾸면 1페이지로 돌아간다
- 연결 남음: FN-MYP-030-08 한도 알림 (알림 저장 YAY, 가계부 API SJM 백엔드), 가계부 API 전체 (SJM 백엔드, 지금은 가짜 응답) → 한도 알림은 백엔드 끝(`ExpenseService.java` `notifyLimit`), 화면 미확인. 가계부 API는 "가계부 가짜 응답을 실제 API로" 절에서 끝

## SCR-MYP-031 가계부 등록/수정 — 끝

- 기능: FN-MYP-031-01 등록모달 1단계, FN-MYP-031-02 직접 입력 폼, FN-MYP-031-03 인식 결과 확인·수정, FN-MYP-031-04 영수증 날짜 반영, FN-MYP-031-05 영수증 업로드, FN-MYP-031-06 중복 지출 확인
- API가 남의 것: FN-MYP-031-03·05 영수증 인식 (YAY, OCR 호출부 LJS)
- 기다리는 것: 영수증 인식 (YAY), global/external OCR 호출부 (LJS)
- 완료 조건: 병원 카테고리를 고르면 반려동물 목록에서 "공용"이 사라지고 [저장]이 비활성이 된다. 같은 반려동물·날짜·금액·카테고리로 저장하면 중복 확인 모달이 뜬다
- 연결 남음: FN-MYP-031-02·06 가계부 API (SJM 백엔드), FN-MYP-031-03·05 영수증 인식 (YAY, OCR 호출부 LJS), FN-MYP-031-02·03 사용처 서버 필드 (지출 API·DB, SJM 백엔드). 지금은 모두 가짜 응답 → 가계부 API는 "가계부 가짜 응답을 실제 API로" 절, 영수증 인식은 "영수증 인식을 실제 API로" 절, 사용처 서버 필드는 `ExpenseResponse.java`·`ExpenseCreateRequest.java`의 `expndPlcusNm`에서 끝

## SCR-MYP-020 포인트 관리/케어미션 — 끝

- 기능: FN-MYP-020-01 보유 포인트, FN-MYP-020-02 적립·사용 내역, FN-MYP-020-03 케어미션 동물 탭, FN-MYP-020-04 케어미션 기록·날짜 이동, FN-MYP-020-05 미션 포인트 지급 규칙, FN-MYP-020-06 공동양육자 수행분 처리, FN-MYP-020-07 케어미션 0마리 안내, FN-MYP-020-08 검진기록 등록 포인트, FN-MYP-020-09 포인트 요약, FN-MYP-020-10 포인트 적립 안내
- 기다리는 것: health 일정·검진기록 등록 (JAJ), 커뮤니티 글·댓글 (KSJ)
- 완료 조건: 동물 탭을 바꾸면 그 동물의 미션 8개와 진행률이 보인다. 포인트 내역 ◀▶로 월을 바꾸면 그 달 합계와 목록이 바뀌고 미래 달은 비활성이다
- 연결 남음: FN-MYP-020-01~10 포인트·케어미션 API (SJM 백엔드), 미션 출제·정산·검진기록 포인트 (health JAJ, 커뮤니티 KSJ). 지금은 모두 가짜 응답 → 포인트·케어미션 API는 "포인트·케어미션 가짜 응답을 실제 API로" 절, 미션 출제·정산은 `CareMissionJob.java:52-53`, 검진기록 포인트는 `CheckupService.java:283`에서 끝. 펫이야기 글·댓글(KSJ)의 `reflectRepresentative`는 안 됨: 호출하는 곳 없음(백엔드 `CareMissionService.java:110·114`에 정의만 있고 main 코드의 community 참조가 없으며, 부르는 곳은 테스트뿐)

## SCR-MYP-040 회원정보 수정 — 끝

- 기능: FN-MYP-040-01 본인 확인, FN-MYP-040-02 프로필 사진, FN-MYP-040-03 이메일(로그인 아이디), FN-MYP-040-04 닉네임 변경·중복확인, FN-MYP-040-05 휴대폰 번호 변경, FN-MYP-040-06 비밀번호 변경, FN-MYP-040-07 회원 탈퇴, FN-MYP-040-08 프로필 사진(SNS), FN-MYP-040-09 계정 표시(SNS), FN-MYP-040-10 닉네임 변경·중복확인(SNS), FN-MYP-040-11 휴대폰 번호 변경(SNS), FN-MYP-040-12 회원 탈퇴(SNS)
- API가 남의 것: FN-MYP-040-04·05·06·10·11 닉네임·휴대전화·비밀번호 검증 (AIC)
- 기다리는 것: member 로그인·회원 조회 (AIC)
- 완료 조건: 새 비밀번호와 확인이 다르면 "비밀번호가 일치하지 않아요"가 보이고 [저장]이 비활성이다. 닉네임을 바꾸면 [중복확인]이 나타난다
- 연결 남음: FN-MYP-040-01~06·08~13 회원 조회·수정·검증 API (member, AIC), FN-MYP-040-07·12 회원 탈퇴 화면 이동 (SCR-ACC-020, YAY) → 회원 API는 "회원정보 수정" 절들, 탈퇴 화면 이동은 `ProfileEditPage.jsx` `navigate(PATHS.MYPAGE_WITHDRAW)`에서 끝

## SCR-MYP-004 공동양육자 목록 — 끝

- 기능: FN-MYP-004-01 가족관리 목록, FN-MYP-004-02 가족 초대하기, FN-MYP-004-03 주양육자 표시, FN-MYP-004-04 내 연동 상태
- 기다리는 것: member 로그인·회원 조회 (AIC)
- 완료 조건: 슬라이드를 넘기면 목록이 그 동물 기준으로 바뀐다. 공동양육자로 보면 본인 1건과 [연동 해제]만 보인다
- 연결 끝: FN-MYP-004-01·03·04 양육관계 조회·강제 해제 API (2026-11-01, SCR-MYP-002 가족 영역 절)

## SCR-MYP-006 공동양육 연동 해제(자진 탈퇴) — 끝

- 기능: FN-MYP-006-01 연동 해제 확인 팝업 노출, FN-MYP-006-02 공동양육 연동 자진 해제, FN-MYP-006-03 취소 처리, FN-MYP-006-04 목록 즉시 반영, FN-MYP-006-05 해제 완료 안내
- 기다리는 것: member 로그인·회원 조회 (AIC)
- 완료 조건: [취소]는 상태를 바꾸지 않고 닫힌다. 확인하면 목록에서 그 동물이 빠지고 토스트가 뜬다
- 연결 남음: FN-MYP-006-02 자진 해제 API (SJM 백엔드, 지금은 가짜 응답), FN-MYP-006-01~05 로그인·회원 조회 (AIC) → 자진 해제 API는 "공동양육 연동 해제 · 확인 팝업·토스트를 실제 API로" 절, 로그인·회원 조회는 `routes/domains/mypage/mypageRoutes.js` `auth: 'member'`(`ProtectedRoute`)에서 끝

## SCR-MYP-005 공동양육자 추가 — 끝

- 기능: FN-MYP-005-01 이메일 초대, FN-MYP-005-02 초대 대상 반려동물 선택, FN-MYP-005-03 보낸 초대, FN-MYP-005-04 초대 만료, FN-MYP-005-05 초대 수락 화면, FN-MYP-005-06 나중에 하기, FN-MYP-005-07 거절, FN-MYP-005-08 거절 확인 모달, FN-MYP-005-09 이메일 불일치 안내, FN-MYP-005-10 만료·처리된 초대 안내
- 기다리는 것: notification 알림 저장 (YAY)
- 완료 조건: 5명이 찬 동물은 체크박스가 비활성이다. 보낸 초대의 대기중 항목에 만료 예정일이 보인다
- 연결 남음: FN-MYP-005-01~08 초대 API (SJM 백엔드, 지금은 가짜 응답), FN-MYP-005-01 알림·메일 발송 (알림 저장 YAY) → 초대 API는 "초대 가짜 응답을 실제 API로" 절, 알림·메일 발송은 `CaregiverInvitationService.java` `createInvitation`이 `publishInvitation`을 불러 가입 회원에게 인앱 알림, 비회원에게 메일을 발행하는 것으로 끝

## SCR-MYP-010 픽셀 캐릭터 관리 — 끝 (1~3단계 모두 끝)

- 기능: FN-MYP-010-01 탭 구성, FN-MYP-010-02 내 캐릭터 목록, FN-MYP-010-03 캐릭터 만들기, FN-MYP-010-04 생성 상한, FN-MYP-010-05 대표 반려동물 지정, FN-MYP-010-07 공동양육 탭, FN-MYP-010-08 1단계·사진 첨부, FN-MYP-010-09 2단계·생성 중, FN-MYP-010-10 3단계·결과 확인, FN-MYP-010-12 생성 실패 시 대체, FN-MYP-010-13 미리보기·부위 슬롯, FN-MYP-010-14 보관함·카테고리 탭, FN-MYP-010-15 아이템 상점 열기, FN-MYP-010-16 되돌리기·장착, FN-MYP-010-17 캐릭터 규격 고정, FN-MYP-010-18 규격 일관성 검증, FN-MYP-010-19 규격 미확보 시 대체, FN-MYP-010-22 0마리 안내, FN-MYP-010-23 생성 오류 처리, FN-MYP-010-24 오류 문의
- API가 남의 것: FN-MYP-010-01~04·07~24 (LJS). 010-05 대표 지정은 SJM
- 기다리는 것: pet 캐릭터 이미지 조회 (LJS), notification 알림 저장 (YAY), 고객센터 1:1 문의 작성 화면 (KSJ)
- 완료 조건: 같은 부위 아이템을 고르면 기존 아이템이 해제된다. [되돌리기]는 진입 시점 착용 상태로 돌아간다. 만들기 1단계에서 품종·털색·특징이 읽기 전용으로 보이고, 생성 요청은 사진과 `petSn`만 보낸다(품종·털색·특징은 서버가 등록값을 읽는다)
- 연결 남음: FN-MYP-010-08~10·12~14·16 캐릭터 생성·아이템·착용 API (LJS, 머지됨. 아래 1~3단계로 연결), FN-MYP-010-05 대표 지정 API (SJM 백엔드), FN-MYP-010-09·23 완료·오류 처리 인앱 알림 (알림 저장 LJS), FN-MYP-010-24 문의 작성 화면 미리 채우기 (KSJ) → 생성·아이템·착용 API는 아래 1~3단계 절, 대표 지정은 `features/pet/api.js` `POST /pets/{petSn}/representative`, 완료 알림은 `CharacterCreationService.java:165`, 오류 처리 알림은 `PixelCharacterService.java:245`, 문의 미리 채우기는 `InquiryWritePage.jsx`에서 끝(생성 실패 알림은 확인 안 함)

## SCR-MYP-011 아이템 상점 모달 — 끝

- 기능: FN-MYP-011-01 미리보기·원래대로, FN-MYP-011-02 카테고리 탭, FN-MYP-011-03 아이템 목록·보유중 표시, FN-MYP-011-04 담은 아이템 목록, FN-MYP-011-05 구매, FN-MYP-011-06 권한
- API가 남의 것: FN-MYP-011-01~06 (LJS)
- 기다리는 것: 아이템 상점 (LJS)
- 연결 남음: FN-MYP-011-01~06 상점 목록·구매 API (LJS, 지금은 가짜 응답), FN-MYP-011-01 미리보기에 착용 이미지가 덮이는지는 이미지 API(LJS) 뒤 확인 → 상점 목록·구매 API는 "2단계 꾸미기·상점을 실제 API로" 절에서 끝(`features/pet/api.js`). 미리보기에 착용 이미지가 덮이는지는 남음
- 완료 조건: 총액이 보유 포인트를 넘으면 "포인트가 부족해요"가 보이고 [구매하기]가 비활성이다. 보유중 아이템은 클릭에 반응하지 않는다

## SCR-MYP-001 마이페이지 홈 — 끝

- 기능: FN-MYP-001-01 내 반려동물 카드 조회, FN-MYP-001-02 더보기, FN-MYP-001-03 포인트·지출 한눈에 보기, FN-MYP-001-04 오늘의 케어미션 요약, FN-MYP-001-05 반려동물 0마리 안내
- API가 남의 것: FN-MYP-001-01 캐릭터 얼굴 (LJS)
- 연결 남음: FN-MYP-001-01 캐릭터 얼굴 실제 이미지 (로그인 쿠키, AIC) → `components/PetFace.jsx`, `routes/AppRoutes.jsx` `ProtectedRoute`에서 끝
- 완료 조건: 7마리 이상이면 6마리만 보이고 [더보기 +N]으로 나머지가 펼쳐진다(기능명세서 v0.4_20261021 기준). 0마리면 등록 유도 안내가 보인다

## SCR-MYP-002 반려동물 프로필 목록 · 가족 영역 가짜 응답을 실제 API로 — 끝

- 기능: 명세 기능 ID 추가 없음. FN-MYP-004-01·03·04와 걸친다
- 기다리는 것: 백엔드 `GET /pets/{petSn}/caregivers`(`linkYmd` 포함), 주양육자 강제 해제 `DELETE /pets/{petSn}/caregivers/{brupRelSn}` (SJM 백엔드, 끝남)
- 완료 조건: 슬라이드 카드 가족 영역이 실제 목록(주양육자 첫 줄, 연동일)으로 바뀌고 주양육자의 [✕]가 강제 해제를 부른다. 공동양육자로 보면 주양육자와 본인만 보인다

## SCR-MYP-006 공동양육 연동 해제 · 확인 팝업·토스트를 실제 API로 — 끝

- 기능: 명세 기능 ID 추가 없음. FN-MYP-006-02·04와 걸친다
- 기다리는 것: 백엔드 `DELETE /pets/{petSn}/caregivers/{brupRelSn}` (SJM 백엔드, 끝남)
- 완료 조건: 확인하면 실제 해제를 부르고 `GET /pets`를 다시 읽어 그 동물이 목록에서 빠진다. 403 `PET_PRIMARY_ONLY`·404 `CAREGIVER_NOT_FOUND`를 처리한다

## SCR-MYP-003 반려동물 등록/수정 · 반려동물 조회·등록·수정·대표 지정을 실제 API로 — 끝

- 기능: 명세 기능 ID 추가 없음. FN-MYP-001-01, FN-MYP-002-02·04, FN-MYP-003-01~07, FN-MYP-010-05와 걸친다
- 기다리는 것: 백엔드 `GET·POST /pets`, `GET·PATCH /pets/{petSn}`, `POST /pets/{petSn}/representative` (SJM 백엔드, 끝남)
- 완료 조건: `features/pet/api.js`의 `getPets`·`getPet`·`createPet`·`updatePet`·`setRepresentativePet`이 실제 요청을 부르고 응답 키(`brupRoleCd`·`rprsPetYn`·`caregiverCount`·`bscCharSbstYn`)에 맞춰 화면이 그대로 보인다
- 연결 남음: FN-MYP-002-02 (백엔드 연결 `PetSummary`에 `nutrYn`·`minBdwg`·`maxBdwg` 추가, 백엔드 저장소에서 /start) → 백엔드 `PetSummary.java:25-27`에서 끝
- 연결 남음: FN-MYP-003-01 (체중 입력 잠금 판단용 건강기록 체중 조회, JAJ) → "체중 입력 잠금을 건강 일지 체중 기록 조회로 연결" 절에서 끝
- 연결 남음: FN-MYP-001-01 (메인 대표 반려동물 칩 `rprsYn` → `rprsPetYn`, YAY)

## SCR-MYP-002 반려동물 프로필 목록 · 반려동물 삭제를 실제 API로 — 끝

- 기능: 명세 기능 ID 추가 없음. FN-MYP-002-05·07·08과 걸친다
- 기다리는 것: 백엔드 `DELETE /pets/{petSn}` (SJM 백엔드, 끝남)
- 완료 조건: 삭제 확인 팝업에서 [삭제]하면 실제 삭제를 부르고 `GET /pets`를 다시 읽어 그 동물이 슬라이드에서 빠지고 대표 표시가 갱신된다. 403 `PET_PRIMARY_ONLY`·404 `PET_NOT_FOUND`를 처리한다

## SCR-MYP-002 반려동물 프로필 목록 · 슬라이드 중성화·정상 체중을 목록 값으로 — 끝

- 기능: 명세 기능 ID 추가 없음. FN-MYP-002-02·003-06과 걸친다
- 기다리는 것: 없음(백엔드 `GET /pets`의 `PetSummary`에 `nutrYn`·`minBdwg`·`maxBdwg` 추가 끝남)
- 완료 조건: 슬라이드의 "성별(중성화 완료)"와 "정상 a~bkg"를 `GET /pets/{petSn}` 상세 조회 없이 목록 응답 값으로 채운다

## SCR-MYP-005 공동양육자 추가 · 초대 가짜 응답을 실제 API로 — 끝

- 기능: 명세 기능 ID 추가 없음. FN-MYP-005-01~10과 걸친다
- 기다리는 것: 백엔드 `POST·GET /caregiver-invitations`, `GET /caregiver-invitations/{jntBrupInvtnSn}`, `POST …/accept`(`petSns`)·`…/reject` (SJM 백엔드, 끝남)
- 완료 조건: 초대 발송·보낸 초대·수락·거절·이메일 불일치·만료 안내가 실제 응답(`jntBrupInvtnSn`·`invtnSttsCd`·`emailMatched`·`invtnTrgtEmlMask`·`rcvrJoined`)으로 동작하고 `withExpiry`·가짜 토큰(`demo-*`)을 지운다. 초대 주소는 `/mypage/invitations/{jntBrupInvtnSn}`

- 연결 남음: FN-MYP-005-05 (백엔드 연결 `CaregiverInvitationPetSummary`에 `vrtyNm`·`vrtyDrctInptNm` 추가, 백엔드 저장소에서 /start) → 백엔드 `CaregiverInvitationPetSummary.java:16`, 프론트 `InvitationAccept.jsx:27`에서 끝

## SCR-MYP-020 포인트 관리/케어미션 · 포인트·케어미션 가짜 응답을 실제 API로 — 끝

- 기능: 명세 기능 ID 추가 없음. FN-MYP-020-01~04·07·09, FN-MYP-001-03·04와 걸친다
- 기다리는 것: 백엔드 `GET /members/me/points`, `GET /point-ledgers?yearMonth=`, `GET /pets/{petSn}/daily-missions?msnCrtrYmd=` (SJM 백엔드, 끝남)
- 완료 조건: `features/point/api.js`의 가짜가 실제 요청을 부르고 응답 키(`hldPnt`·`pntDlngTypeCd`·`dlngPnt`·`regDt`·`cmptnYn`)에 맞춰 화면이 그대로 보인다. `?fake=empty`를 지운다

## SCR-MYP-030 가계부 목록 · 가계부 가짜 응답을 실제 API로 — 끝

- 기능: 명세 기능 ID 추가 없음. FN-MYP-030-01~06·09~22, FN-MYP-031-02·03·05·06과 걸친다
- 기다리는 것: 백엔드 `/expenses`(등록·목록·통계·합계·월·반려동물·수정·삭제·조건 삭제·중복 확인), `PUT /members/me/expense-limit` (SJM 백엔드, 끝남)
- 완료 조건: `features/expense/api.js`의 가짜가 실제 요청을 부르고, 사용처 키를 `expndPlcusNm`으로 확정한다. 삭제된 반려동물은 `petDelYn`으로 "이름 (삭제됨)"이 보인다. `?fake=more-fail`을 지운다
- 연결 남음: FN-MYP-030-18·19·21 조건 일괄 삭제에서 개별 해제한 건 제외 (백엔드 연결 `POST /expenses/bulk-delete`에 `excludeExpndSn`, 건수 검사 "전체 − 제외 수", 불일치 응답 409, 백엔드 저장소에서 /start) → `excludeExpndSn`은 프론트 `expense/api.js:59-62`와 백엔드 `ExpenseBulkDeleteRequest.java`에서 끝(건수 검사·409는 확인 안 함)
- 연결 남음: FN-MYP-031-02 미래 날짜 검증 (백엔드 연결 `POST /expenses`·`PATCH /expenses/{expndSn}`에서 `EXPND_YMD` > 오늘(KST)이면 400, 백엔드 저장소에서 /start) → `ExpenseService.java:111, 165, 241` `checkNotFuture`에서 끝
- 연결 남음: FN-MYP-031-03·05 영수증 인식 → "SCR-MYP-031 영수증 인식을 실제 API로" 절에서 끝
- 끝남(SCR-MYP-031 영수증 인식 절, 클릭한 날짜로 결정): FN-MYP-031-03 영수증 OCR에서 `ckupYmd`가 null이면 지출 날짜를 오늘로 채우고 수정 가능하게 둔다(계약상 null이 맞음, LJS 확인)
- 하지 않음(명세에 다시 열기 진입점 없음): 가계부 출처 영수증 다시 열기. `GET /api/receipts/{recptSn}`이 `petSn` 필수라 지금은 열 수 없다. LJS가 백엔드를 고칠 때까지 다시 열기 없이 진행한다
- 연결 남음: FN-MYP-030-08 한도 알림 발송 (알림 저장 YAY, 가계부 API SJM 백엔드) → 백엔드 끝(`ExpenseService.java` `notifyLimit`), 화면 미확인

## SCR-MYP-040 회원정보 수정 · 조회·휴대폰 번호·프로필 사진 API 연결 — 끝

- 기능: 명세 기능 ID 추가 없음. 걸치는 기능: FN-MYP-040-02·03·05·08·09·11·13
- 기다리는 것: 백엔드 `GET /api/members/me`, `PATCH /api/members/me`(SJM, 2026-10-30 완료)
- 완료 조건: 6-2·6-3 프로필 요약(사진·닉네임·이메일 또는 SNS 표시)과 계정 정보(가입 방식·가입일 `joinDt`·최근 로그인 `lastLgnDt`)를 조회로 채운다. [사진 변경]은 multipart `profilePhoto`, [기본 이미지로]는 `profilePhotoReset=true`로 보낸다. 휴대폰 [저장]은 `mblTelno`로 보내고 409 PHONE_ALREADY_USED면 "이미 사용 중인 휴대전화번호입니다."를 보여 준다

## SCR-MYP-040 회원정보 수정 · 회원 조회와 본인 확인·비밀번호 변경 API 연결 — 끝

- 기능: 명세 기능 ID 추가 없음. 걸치는 기능: FN-MYP-040-01·06 (화면 6-1 본인 확인, 6-2 비밀번호 [변경]), 조회는 FN-MYP-040-09·13의 `joinPathCd`·`snsAcntLinks` 판정에만 쓴다
- 기다리는 것: 백엔드 `GET /api/members/me`(SJM), `POST /api/members/me/password-verification`, `PATCH /api/members/me/password`(YAY, 2026-11-03 develop 머지 `0f0bdfd`)
- 범위: `GET /members/me` 조회 연결만 이 마일스톤에서 한다. 닉네임·휴대폰·사진 변경은 위 "조회·휴대폰 번호·프로필 사진 API 연결" 마일스톤에 그대로 둔다
- 완료 조건:
  - `getMyProfile`을 `GET /members/me`로 바꾸고 응답 키(`acntEml`·`mbrNcnm`·`mblTelno`·`atchFileSn`·`joinPathCd`·`snsAcntLinks`·`joinDt`·`lastLgnDt`)를 그대로 쓴다. 가짜 키(`snsTyCd`·`mbrJoinPathCd`·`mbrRegDt`·`mbrLastLgnDt`·`mbrTelno`·`prflImgUrl`)에 기대는 곳은 새 키로 고친다. 가짜 `api.js` 본문 중 닉네임·휴대폰·사진은 건드리지 않는다
  - SNS 회원은 `joinPathCd`가 `USRC0006`(이메일)이 아닐 때다(`USRC0007` 네이버·`USRC0008` 카카오·`USRC0009` 구글). `snsAcntLinks`로는 판정하지 않는다. SNS 회원은 6-1을 건너뛰고 `password-verification`을 부르지 않는다
  - 6-1 [확인]은 `{pswd}`. 200이면 6-2로 바꾼다. 400 `CURRENT_PASSWORD_MISMATCH`면 입력란 아래에 "비밀번호가 일치하지 않아요". 400 `SNS_ONLY_MEMBER`면 6-3으로 바꾼다. 입력값은 상태에 남기지 않는다
  - 6-2 [저장]은 6-1 입력값을 쓰지 않고 현재 비밀번호 칸을 다시 입력받아 `{currentPswd, pswd, pswdCnfrm}`로 보낸다. 400 `CURRENT_PASSWORD_MISMATCH`는 현재 비밀번호 칸에 "현재 비밀번호가 일치하지 않아요", `PASSWORD_MISMATCH`는 확인 칸에 "비밀번호가 일치하지 않아요", `INVALID_INPUT_VALUE`의 `pswd`는 새 비밀번호 칸에 "영문과 숫자를 함께 써서 8~64자로 입력해 주세요(공백 제외)". 네트워크·서버 오류는 토스트 "잠시 후 다시 시도해 주세요". 200이면 토스트 "비밀번호를 변경했어요"를 띄우고 행을 닫는다
  - 새 비밀번호 클라이언트 검사를 서버 규칙(`^(?=.*[A-Za-z])(?=.*\d)[\x21-\x7E]{8,64}$`)에 맞춘다. 한글이 들어가면 [저장]을 켜지 않는다
  - 새 비밀번호 칸 안내 문구를 "영문과 숫자를 함께 써서 8~64자로 입력해 주세요(공백 제외)"로 바꾼다(사람 결정 2026-11-04, 설계서는 SJM이 직접 고친다)
  - 요청에 로그인 쿠키가 붙는지 확인한다(`withCredentials` 필요 여부는 Vite 프록시 기준으로 확인하고 필요할 때만 추가한다)
  - 화면 검증 계정: 비밀번호 변경은 이메일 가입·정상·`PSWD_HASH` 있는 회원(1차 후보 user0100, tester는 쓰지 않음)으로 로그인 화면에서 로그인한다. SNS 건너뛰기는 SNS 가입(USRC0007~0009)·정상 회원을 dev-token으로. 원래 시드 비밀번호는 숫자가 없어 화면으로 되돌릴 수 없으므로 복구는 해시 백업 UPDATE로만 한다
  - 화면 검증(Playwright, 비밀번호가 있는 검증 계정): 변경 200 직후 `GET /auth/me`가 200이고, 새로고침해도 `/mypage/profile`에서 로그인이 유지된다. 변경 전에 따로 연 두 번째 브라우저 컨텍스트는 access 만료 뒤 `/auth/refresh`가 401이다. 옛 비밀번호 로그인은 실패하고 새 비밀번호 로그인은 성공한다
  - 검증 뒤 원래 해시로 되돌리는 SQL을 보고의 "정리"에 적는다(DB 실행은 사람이 한다)
- 화면설계서 대조(v0.6_20261025, SCR-MYP-040): 문구·동작이 기능명세서 v0.5와 다른 곳은 없다. 설계서에 6-1 불일치 문구가 없어 위 문구는 새로 정한 것이다. 설계서 새 비밀번호 칸 안내 "8자 이상, 문자·숫자 조합"은 서버가 영문을 요구하는 것과 달라, 칸 안내를 "영문과 숫자를 함께 써서 8~64자로 입력해 주세요(공백 제외)"로 맞추기로 했다(SJM 결정 2026-11-04, 설계서 수정은 SJM이 직접)
- 연결 남음: 닉네임·휴대폰·프로필 사진 API 연결 (위 "조회·휴대폰 번호·프로필 사진 API 연결" 마일스톤, SJM) → 그 절에서 끝

## SCR-MYP-030 가계부 목록 · 전체 선택 뒤 해제한 건을 제외하고 삭제 — 끝

- 기능: 명세 기능 ID 추가 없음. 걸치는 기능: FN-MYP-030-18·19·21
- 기다리는 것: 백엔드 `POST /api/expenses/bulk-delete`의 `excludeExpndSn`(SJM 백엔드, 2026-11-03 완료)
- 완료 조건: 편집 모드에서 [조회 결과 전체 선택] 뒤 개별 해제한 번호를 `excludeExpndSn`으로 보내고, `expectedCnt`는 "조건에 맞는 건수 − 해제한 수"로 보낸다. 409 `EXPENSE_BULK_DELETE_CHANGED`면 목록을 다시 불러온 뒤 다시 선택하게 안내한다(잘못된 제외 번호도 같은 409)

## SCR-MYP-031 가계부 등록/수정 · 영수증 인식을 실제 API로 — 끝

- 기능: 명세 기능 ID 추가 없음. FN-MYP-031-03·04·05와 걸친다. SCR-MYP-030 실제 API 절의 "연결 남음: FN-MYP-031-03·05 영수증 인식"과 `ckupYmd` null 날짜 항목을 닫는다
- 기다리는 것: AI 서버 `POST /ai/receipts`(가계부 출처 `AIMC0027`, LJS), 백엔드 `POST /internal/ai/receipts`(LJS, `docs/api/receipt.md`)
- 완료 조건: `recognizeReceipt` 가짜를 지우고 실제 요청으로 인식한다. 인식 결과로 저장하면 `recptSn`이 붙는다. 인식 0건·일시 오류·시간 초과는 실패 안내와 [직접 입력](영수증 연결), 서버 파일 거절은 사유 문구

## SCR-MYP-020 포인트 관리/케어미션 · [건강 일지] 버튼을 건강 일지 화면으로 연결 — 끝

- 기능: 명세 기능 ID 추가 없음. FN-MYP-020-09의 [건강 일지] 이동, FN-MYP-003-01의 [건강 일지에서 기록하기] 이동을 닫는다
- 기다리는 것: 없음. 건강 일지 경로 `PATHS.HEALTH_DIARY`(JAJ)가 develop에 있다
- 완료 조건: 두 버튼이 토스트·빈 동작 대신 `/health/diary`로 이동한다
- 연결 남음: FN-MYP-003-01 (건강기록 체중 조회로 `lastBdwgRcd`가 와야 버튼이 보임, JAJ) → "체중 입력 잠금을 건강 일지 체중 기록 조회로 연결" 절에서 끝

## 제외

- 없음. 마이페이지 명세의 화면은 모두 SJM 담당이다

## 대조

- 마이페이지: 명세 115 = 마일스톤 115 + 제외 0

## SCR-MYP-010 픽셀 캐릭터 관리 · 1단계 목록·상태·이미지·진입을 실제 API로 — 끝

- 기능: 명세 기능 ID 추가 없음. FN-MYP-010-02·03·07·12·23, FN-MYP-001-01, FN-MYP-002-02와 걸친다
- 기다리는 것: 백엔드 `GET /pixel-characters`, `GET /pets/{petSn}/character-image` (LJS, 머지됨)
- 완료 조건: 목록은 `GET /pixel-characters`로 읽고(`GET /pets`에 키를 더하지 않는다), 상태는 `pixelCharSn` 유무 + `crtJobSttsCd`(CHRC0002 생성 중·0003 완료·0004 실패) + `bscCharSbstYn`으로 판정한다. `chrcSttsCd`·`chrcImgUrl` 의존을 PetFace·SummaryHero·PetMiniCard·PetSlide·PetProfileCard·InvitationAccept·CharacterCard·WearPreview에서 없앤다. 완료 카드를 누르면 꾸미기로 들어간다
- 이 단계에서 꾸미기 상세·아이템은 가짜 그대로
- 연결 남음: FN-MYP-010-12 첫 생성 실패의 [캐릭터 만들기] 재노출·실패 안내 문구 (기능명세서 확인, LJS)

## SCR-MYP-010 픽셀 캐릭터 관리 · 2단계 꾸미기·상점을 실제 API로 — 끝

- 기능: FN-MYP-010-13·14·16, FN-MYP-011-01~06과 걸친다
- 기다리는 것: 1단계 끝, 백엔드 `GET /pixel-characters/{pixelCharSn}`, `…/shop-items`, `POST …/held-items`, `PUT …/equipped-items` (LJS, 머지됨), AI 서버 `POST /ai/characters/{pixelCharSn}/preview` (LJS, `nyangmeong-ai` origin/develop f1ef7c0에 머지됨을 2026-11-04 확인)
- 기다리는 것: character-image 착용 합성 반영(LJS) — 반영되면 착용 저장 후 이미지 새로 불러오기 추가
- 완료 조건: 꾸미기 상세·보유·상점·구매·착용 저장이 실제 요청을 부르고 `POINT_NOT_ENOUGH`(400)·`PET_PRIMARY_ONLY`(403)·`ITEM_ALREADY_HELD`(409)를 처리한다. `fakeItems`·`SHOP_ITEMS`를 지운다
- 연결 남음: FN-MYP-010-13·FN-MYP-011-01 실제 합성 이미지 확인은 3단계 생성 후 실제 캐릭터로 한다(LJS 의견 2026-11-04: 맨몸 시트는 캐릭터 생성 성공 때 만들어져, 지금 공용 DB의 캐릭터 1·2·3은 `BODY_SHEET_FILE_SN`이 없어 미리보기가 404 `PIXEL_CHARACTER_NOT_FOUND`)
- 연결 남음: FN-MYP-011-05 구매 포인트 차감 (`ItemService`의 `PointFake`를 `PointService.use`로, LJS. 백엔드 마일스톤 SCR-MYP-020 연결 남음에 이미 있어 별도 절은 만들지 않음) → 안 됨: `ItemService.java:63, 85`가 아직 `pointFake`
- 연결 남음: FN-MYP-010-16 [장착] 뒤 `character-image` 착용 합성 반영 (LJS) → "[장착] 뒤 착용 모습 대표 이미지 저장" 절(`pet/api.js:100-105`, `pet/queries.js:265-275`)에서 끝

## SCR-MYP-010 픽셀 캐릭터 관리 · 3단계 캐릭터 생성을 실제 API로 — 끝

- 기능: FN-MYP-010-08~10·12·23·24와 걸친다
- 기다리는 것: 2단계 닫음(미리보기 확인은 이 단계 뒤로 미룸), 재생성 실패 뒤 다시 처리: LJS와 결정됨(자동 재시도 없음, 관리자 화면에서 같은 문의 재생성 허용, LJS 담당, SJM 할 일 없음. 재생성이 실패하거나 시간 초과로 끝나도 `BSC_CHAR_SBST_YN`은 'Y'로 유지돼 지금 판정대로 "오류 확인 중"을 보여 주면 되고 [캐릭터 만들기]가 잘못 뜨지 않는다), AI 서버 `POST /ai/characters`. 요청 형식·인증·완료 확인 방식은 `nyangmeong-ai` 코드에서 먼저 정리하고, 코드로 확인되지 않는 것은 "LJS 확인 필요"로 적는다
- 완료 조건: `createCharacter` 가짜와 `?fake=fail`을 지우고 실제 요청으로 생성·완료·실패가 이어진다

사전 조사(2026-11-04, `nyangmeong-ai` origin/develop f1ef7c0 `docs/api/character.md`·`app/character/{router,service}.py`·`app/core/image.py`, 백엔드 `PixelCharacterService`·`CharacterCreationService`)
- 요청: `POST /ai/characters` multipart/form-data, 필드는 `photo`(파일)와 `petSn`(Long) 둘뿐이다. 품종·털색·특징은 보내지 않는다(보내도 안 쓴다. 서버가 Java에서 등록값을 읽는다). 그래서 현재 `createCharacter({ petSn, photo, colrCd, colrDrctInptNm })`의 `colrCd`·`colrDrctInptNm`은 보내지 않는다(`CharacterCreateModal`의 인자도 정리). 사진은 jpg·jpeg·png·webp, 10MB 이하, 확장자와 파일 시그니처가 같아야 한다(PDF 불가)
- 인증: 쿠키 `access_token`을 AI 서버가 Java `/internal/auth/check`로 확인하고 `X-Requested-With: XMLHttpRequest` 필수. `aiApi`(`src/api/axios.js`)가 이미 헤더를 붙이고 `/ai` 프록시도 있어 추가 설정 없음
- 응답: 202 `{ charCrtJobSn }`. 생성은 응답 뒤 백그라운드로 돈다
- 오류: 400 `FILE_TYPE_NOT_ALLOWED`·`FILE_SIZE_EXCEEDED`·`INVALID_REQUEST`(`petSn`·`photo` 없음), 502 `EXTERNAL_API_ERROR`(생성기 없음·Java 연결 실패), Java 4xx 그대로: 주양육자 아님(`PET_PRIMARY_ONLY` 403), 이미 캐릭터 있음(`PIXEL_CHARACTER_ALREADY_EXISTS` 409), 생성 중(`PIXEL_CHARACTER_CREATING` 409)
- 완료 확인: 웹소켓·SSE 없음. 프론트는 `GET /pixel-characters`의 `crtJobSttsCd`를 폴링한다(CHRC0002 생성 중 → 0003 완료 / 0004 실패). 보고에는 `charCrtJobSn`이 없고 목록 항목에는 작업 번호가 없어 동물(`petSn`)별 상태로 본다. 생성이 끝나면 Java가 인앱 알림(`NotificationType.CHARACTER`)을 만든다. 멈춘 작업은 Java가 10분(`TIMEOUT_MINUTES`)에 정리해 실패로 돌린다. 폴링 간격·중단 조건은 기획 때 정한다(추천: 생성 중일 때만 3~5초, 12분 상한)
- 성공 보고(`report_success`)가 몸 시트(`BODY_SHEET_FILE_SN`)를 저장한다 → 2단계 미리보기 실제 확인의 선행 조건. 지금 `CHARACTER_BAKE_ENABLED=false`라 생성 직후 아이템 굽기는 안 한다(안 구운 아이템은 미리보기에서 `ITEM_BAKING`)
- 확인용 동물: tester(mbrSn 1)의 주양육 동물은 까미(1)·?(2)·루루(3)이고 모두 캐릭터 행이 있다(1·2는 `CHRC0003`, 루루는 `CHRC0004` 실패+기본 캐릭터). 서버는 `CHAR_PHOTO` 현재 사진이 없으면 다시 만들게 해 준다(`checkCreatable`). 캐릭터 없는 주양육 동물은 없다. 제안은 보고 참고

### 3단계 기획 (2026-11-04 작성, 2단계를 `/end`로 닫은 뒤 `/start`가 "지금 하는 것"으로 옮긴다)

기준: 마이페이지_기능명세서_v0.5_20261101 FN-MYP-010-08~10·12·23, `nyangmeong-ai` origin/develop f1ef7c0 `docs/api/character.md`. 디자인: 화면 변경 없음(기존 `CharacterCreateModal` 1~4단계 레이아웃 유지, 데이터만 실제로)

- 공통: `src/features/pet/api.js`의 `createCharacter`를 `aiApi.post('/characters', FormData{ photo, petSn })`로 바꾼다(202 `{ charCrtJobSn }`). **`colrCd`·`colrDrctInptNm`은 보내지 않고 인자에서 뺀다**(`CharacterCreateModal`의 호출부도). 가짜 `createCharacter`와 `?fake=fail`, 이로써 쓰는 곳이 없어지는 `fakePets`·`basePet`·`FAKE_CREATE_MS`·`getQueryParam`·미사용 import를 지운다 | 명령: `grep -nE "fakePets|FAKE_CREATE_MS|fake=" src/features/pet` 0줄, `yarn -s lint`, `yarn -s build` 종료 코드 0
- FN-MYP-010-08 사진 첨부: `CharacterCreateModal.jsx`에서 선택 직후 검사 — jpg·jpeg·png·webp가 아니면 "jpg, png, webp 사진만 올릴 수 있어요", 10MB 초과면 "10MB 이하 사진만 올릴 수 있어요"를 입력 아래에 보이고 [만들기]는 비활성(`accept`도 `.jpg,.jpeg,.png,.webp`). 문구는 설계서에 없어 새로 썼다 | 화면: 새 반려동물로 `.gif` 또는 11MB 파일을 고르면 문구가 뜨고 요청이 나가지 않는다(Network에 `/ai/characters` 없음). 정상 사진은 파일명이 보이고 [만들기] 활성
- FN-MYP-010-09 생성 요청·생성 중: `queries.js` `useCreateCharacter`의 `mutationFn`을 위 요청으로, `onSuccess`에서 `healthKeys.pixelCharacters`를 무효화하고 그 Promise를 반환해(목록을 다시 읽은 뒤 완료) 모달이 바로 "생성 중"으로 바뀌게 한다. Java가 202 전에 작업을 `CHRC0002`로 올리므로 목록에 곧바로 생성 중이 나온다 | 화면: [만들기] 직후 Network `POST /ai/characters` 202, 모달이 "…만들고 있어요", 카드는 "생성 중". 창을 닫아도 계속된다
- FN-MYP-010-09 완료 확인(폴링): `queries.js` `usePixelCharacters`에 `refetchInterval` 함수를 둔다 — 목록에 생성 중(`REQUESTED`·`GENERATING`)인 동물이 있을 때만 4초 간격, 처음 생성 중을 본 시점부터 12분이 지나면 멈춘다(`useRef`에 시작 시각, 생성 중이 없어지면 초기화). 이 화면(`CharacterPage`)에서만 돈다. 다른 화면은 알림으로 알린다(서버) | 화면: 생성 중에 Network에 `GET /pixel-characters`가 4초쯤 간격으로 나가고, 완료(`CHRC0003`)되면 멈춘다. 12분 상한은 코드 검토로 확인(실제로 12분 기다리지 않는다)
- FN-MYP-010-10·12·23 결과: `CharacterPage`가 모달에 `pet` 스냅샷(`creatingPet`)이 아니라 `petSn`만 넘기고 최신 목록의 같은 동물을 찾아 준다. 모달은 요청 성공 뒤 `charStatus`로 단계를 정한다 — `DONE`이고 오류 확인 중이 아니면 "완성" 단계(결과 이미지는 `useCharacterImage(petSn, 'full')`, 없으면 기존 아이콘), 생성 중이었다가 `NONE`(`CHRC0004`·10분 서버 정리 포함)이면 "만들지 못했어요" 단계, `isCharError`(오류 확인 중)면 기존 실패/문의 안내 | 화면: 실제 생성이 끝나면 모달이 완성 단계로 바뀌고 카드 이미지가 실제 캐릭터로 바뀐다. 실패는 가로채기(Playwright route)로 `crtJobSttsCd: CHRC0004` 응답을 줘서 확인
- 요청 오류: 400 `FILE_TYPE_NOT_ALLOWED`·`FILE_SIZE_EXCEEDED`는 "사진 첨부" 단계에 머물며 위 문구, 409 `PIXEL_CHARACTER_CREATING`·`PIXEL_CHARACTER_ALREADY_EXISTS`는 목록을 다시 읽고 모달을 닫으며 토스트 "이미 캐릭터를 만들었거나 만드는 중이에요", 403 `PET_PRIMARY_ONLY`는 토스트 "주양육자만 만들 수 있어요", 502 `EXTERNAL_API_ERROR`와 그 밖은 "캐릭터를 만들지 못했어요" 단계. 문구는 설계서에 없어 새로 썼다 | 화면: 가로채기로 각 코드를 주고 위 동작을 확인
- 이번엔 안 함: FN-MYP-010-24 오류 문의 미리 채우기(KSJ, 기존 유지), 생성 완료·오류 인앱 알림(서버), 재생성 실패 뒤 다시 처리(LJS와 결정됨: 자동 재시도 없음, 관리자 화면에서 같은 문의 재생성 허용, LJS 담당, SJM 할 일 없음), 대표 지정 API
- 2단계 연결 남음 확인(생성 뒤): 새 동물의 꾸미기 → `POST /ai/characters/{pixelCharSn}/preview`에 `{"itemSns":[]}` → 200 PNG(맨몸)가 뜨는지. 아이템을 입힌 합성은 AI 저장소 `CHARACTER_BAKE_ENABLED=false`라 안 구운 아이템이 `ITEM_BAKING`이다(위 결정)

확인용 동물과 정리 (공용 DB에 실제로 쓴다)
- 루루(PET_SN 3)는 쓰지 않는다(오류 확인 중 확인용). 화면에서 tester(mbrSn 1)로 확인용 반려동물을 새로 등록하고(이름 예 `생성확인`, 강아지, 필수 값만, 등록 후 `PET_SN`을 보고에 적는다) 캐릭터 관리의 [캐릭터 만들기]로 실제 생성한다. 생성 1회마다 OpenAI 이미지 API 비용이 든다(실패 경로는 가로채기로만 확인해 추가 호출 없음)
- 정리: 화면에서 그 반려동물을 삭제한다(`DELETE /pets/{petSn}`). 삭제는 소프트 삭제라 행은 남는다 — `PET`·`PIXEL_CHAR`·`CHAR_PHOTO`·`CHAR_CRT_JOB`·`CHAR_ITEM_SHEET`·`HLD_ITEM`(구매했다면)이 `DEL_YN='Y'`로 남고, `BRUP_REL`(양육관계)은 행이 남는다. 첨부 파일(`ATCH_FILE`의 올린 사진·몸 시트)과 생성 완료 인앱 알림(`CHARACTER`)도 그대로 남는다. 보고의 "정리"에 등록한 `PET_SN`과 이 목록을 적는다. 다시 보이게 하려면 `UPDATE PET SET DEL_YN='N' WHERE PET_SN=<번호>` 식으로 되돌리지 않는다(확인용이라 되돌릴 필요 없음). 새 동물은 대표가 아니라 대표 승계가 일어나지 않는다
- 새 의존성: 없음

결정: 확인용 사진은 사람이 준 강아지 정면 사진(로컬 파일)으로 확인함
결정: 아이템 미리보기는 맨몸만 확인하고 합성은 LJS(`CHARACTER_BAKE_ENABLED=false` 유지)
- 연결 남음: 없음(3단계 안). 착용 합성 반영 뒤 [장착] 이미지 새로 불러오기는 2단계 절·핸드오프에 있음

## SCR-MYP-010 픽셀 캐릭터 관리 · [장착] 뒤 착용 모습 대표 이미지 저장 — 끝

- 기능: 명세 기능 ID 추가 없음. FN-MYP-010-16(장착)·FN-MYP-010-13과 걸친다. 2단계 절의 "연결 남음: FN-MYP-010-16 [장착] 뒤 `character-image` 착용 합성 반영"을 닫는다
- 기다리는 것: AI 서버 `POST /ai/characters/{pixelCharSn}/equipped-image`(LJS, `nyangmeong-ai` origin/develop 27b1496 PR #37 머지), 백엔드 `PUT /internal/ai/characters/{pixelCharSn}/equipped-image`·`character-image` 저장본 우선(LJS, 백엔드 origin/develop 97f6d5e PR #149 머지, 공용 DB v0.13 (1) 실행됨)
- 완료 조건: [장착] 성공 뒤 같은 착용 아이템 번호(`itemSns`)로 AI 서버 대표 이미지 저장을 부르고, 끝나면(200·409 모두) 그 동물의 `character-image`(전신·얼굴) 캐시를 다시 읽고 실패 토스트는 없다. 아이템 0개면 AI를 부르지 않는다. 화면은 `equipped-image` 가로채기로 확인한다(`CHARACTER_BAKE_ENABLED=false`라 실제로는 409 `ITEM_BAKING`)
- 연결 남음: FN-MYP-010-16 실제 착용 이미지 표시(꾸미기 밖 화면) 확인 (굽기 `CHARACTER_BAKE_ENABLED` 켜짐, LJS)

## SCR-MYP-003 반려동물 등록/수정 · 체중 입력 잠금을 건강 일지 체중 기록 조회로 연결 — 끝

- 기능: FN-MYP-003-01 (수정 모달의 체중 읽기 전용 잠금, 마지막 체중 기록 표시, [건강 일지에서 기록하기])
- 기다리는 것: 없음. `GET /api/pets/{petSn}/daily-health-records?dailyRcdIdctCd=HLTC0014&size=1`(JAJ)이 develop에 있다
- 완료 조건: 건강 일지에 체중 기록이 있는 동물의 수정 모달은 체중이 읽기 전용(값·기록일·[건강 일지에서 기록하기])이고, 기록이 없는 동물은 입력 가능하다
- 연결 남음: 없음

## SCR-MYP-010 픽셀 캐릭터 관리 · [오류 문의] 접수 판정과 문의 연결 값 고치기 — 끝

- 기능: FN-MYP-010 꾸미기의 [오류 문의]/[문의 접수됨] 판정, 문의 작성 화면으로 넘기는 state
- 기다리는 것: 없음(문의 등록 쪽 `pixelCharSn` 전달은 KSJ 알림)
- 완료 조건: 상세 응답의 `inqryRcptYn`이 true면 [문의 접수됨](비활성), false면 [오류 문의]. 링크 state에 `pixelCharSn`이 있다
- 연결 남음: FN-MYP-010 (문의 등록 요청에 state의 `pixelCharSn`을 실어 보내기, KSJ의 `InquiryWritePage`·문의 등록 API) → `InquiryWritePage.jsx:52-56`, `features/inquiry/api.js:80-83`에서 끝

## SCR-MYP-002 반려동물 프로필 목록 · 가족 영역 반응형 개편과 슬라이드 레이아웃 — 끝

- 기능: FN-MYP-004-01 가족 목록(공동양육 배지·이름 말줄임·모바일 한 줄 카드와 더보기), FN-MYP-004-02 가족 초대(모바일 [+ 초대]·5명 토스트), FN-MYP-004-03·04 주양육자 표시(공동양육자 시점), FN-MYP-002-02 슬라이드(태블릿 구조·사진 원 크기·높이 전환·점 정렬)
- 기다리는 것: 없음
- 완료 조건: 폭 375/768/1024/1180/1440에서 주양육·공동양육 화면이 기획대로 보이고, 4명 이상·5명 꽉 찬 경우와 슬라이드 높이 전환(reduced-motion 포함)이 맞는다

## SCR-MYP-003 반려동물 등록/수정 · 종에 맞지 않는 털색 표시와 털색 이름 맞추기 — 끝

- 기능: FN-MYP-003-03 털색 선택(수정 모달이 종 목록에 없는 저장 털색을 만났을 때), FN-MYP-002-02 슬라이드 털색 칸
- 기다리는 것: 없음
- 완료 조건: 고양이인데 강아지 전용 털색(`PETC0011`)이 저장된 동물(탄이)의 슬라이드 털색 칸에 이름이 보이고, 수정 모달은 "검정"이 아니라 원래 털색과 다시 고르라는 안내를 보이며, 다시 고르기 전에는 저장되지 않는다. `PETC0011` 이름이 서버 공통코드와 같다
- 연결 남음: FN-MYP-003-03 (백엔드 연결 `PetService` 털색 검증, 백엔드 저장소에서 /start) → 안 됨: 백엔드 저장소 `milestones/SJM.md`의 "종에 맞지 않는 털색 코드 거절"(진행) 절에 있음

## SCR-MYP-003 반려동물 등록/수정 · 털색 선택 칸의 선택지 글자색 — 끝

- 기능: FN-MYP-003-03 털색 선택(값을 고르기 전 열린 목록의 선택지가 회색으로 보이는 결함)
- 기다리는 것: 없음
- 완료 조건: 등록 모달에서 `getComputedStyle`로 option color를 확인해 "털색 선택"만 placeholder 색, 나머지는 ink 색이다. 닫힌 칸은 고르기 전 회색, 고른 뒤 본문색이다. 열린 목록의 실제 모습은 사람 확인 항목이다
- 연결 남음: FN-MYP-003-03 (백엔드 연결 시드와 공용 DB의 고양이+PETC0011 55마리를 고양이 털색으로 수정, 백엔드 저장소에서 /start) → 안 됨: 백엔드 저장소 `milestones/SJM.md`의 "종에 맞지 않는 털색 데이터 정리"(대기) 절에 있음. 55마리는 시드 기준이고 공용 DB는 미확인

## SCR-MYP-003 반려동물 등록/수정 · 등록/수정 모달을 공용 Modal로(모바일 아래 시트) — 진행

- 기능: FN-MYP-003-01 반려동물 등록/수정(같은 모달 재사용)의 모달 겉틀
- 기다리는 것: 없음
- 완료 조건: 등록·수정 모달이 공용 `components/Modal`로 열린다. 761px 이상은 가운데 720px, 760px 이하는 아래에서 올라오는 시트다. 배경 클릭·Esc로 닫히지 않고 [✕]·[취소]로만 닫힌다. 품종 목록에서 Esc는 목록만 닫는다. 머리·바닥은 고정이고 본문만 스크롤된다
