# SJM 핸드오프

## 지금 하는 것

SCR-MYP-003 반려동물 등록/수정 · 수정 모달 스켈레톤을 모바일 폼 길이에 맞추기 — 끝 (2026-11-10, 검증 `통과`, lint·build 0, 사람 확인 완료)

- `PetFormSkeleton`을 실제 폼과 같은 그리드·순서·폭으로 다시 짰다: PC는 이름 / 종류 / [품종|생년월일] / [성별|털색] / [체중|정상범위] / 추가 정보(펼친 상태 387px), 760px 이하는 2칸 그리드와 `MOBILE` 객체의 order·col-span
- 스켈레톤 안 스크롤 길이가 실제 폼의 99.9%(1440px·390px, 이전 390px 68%). 모달 높이 로딩 전후 같음, 가로 스크롤 없음
- 기획 3번(1440px 값 유지)과 달리 PC 배치도 실제 폼에 맞춰 고쳤고(마지막 구역 200→387px, 성별|털색·체중|정상범위 Row 분리) 사람이 받아들였다
- 부를 API·새 의존성·DB 변경 없음. 연결 작업 없음

## 다음에 할 것

### 내 코드 작업

- JAJ·LJS 알림: 공용 `components/AnalyzeProgress.jsx`를 새로 만들었다(영수증 분석 게이지, `label` prop). JAJ의 `features/ai/receipt/ReceiptUploadModal.jsx`는 함수·상수를 지우고 import만 바꿨고 화면 동작은 같다. 새 분석 화면에 게이지가 필요하면 이 컴포넌트를 쓴다
- SCR-MYP-040 (선택) `PASSWORD_SAME_AS_CURRENT`는 page.route 400으로만 확인했다. 로컬 백엔드를 develop으로 맞추고 규칙에 맞는 비밀번호의 이메일 계정으로 실제 응답 `message`가 같은지 본다
- SCR-MYP-002 10마리 보유 때 삭제하면 등록 카드로 바뀌는지 화면 확인(데이터가 없어 못 함)
- SCR-MYP-002·005 화면 확인: 삭제 때 공동양육자에게 알림이 실제로 갔는지(백엔드 알림 테스트), 초대 → 수락 → 삭제 → 자동 해제 흐름
- (선택) SCR-MYP-030 시드 `db/seed/20261028_seed_data.sql`의 `EXPND_SN=406`(병원·공용, "병원은 공용 불가" 규칙 위반): 팀장에게 알리고 백엔드 저장소에서 고침. 서버가 저장을 막아 급하지 않음

### 내 문서 작업(설계서·명세)

- 설계서에 없던 문구 반영: 반려동물 삭제 성공 토스트(SCR-MYP-002), 케어미션 안내("이 날은 출제된 미션이 없어요"·"오늘 출제된 미션이 없어요"·"미션을 불러오지 못했어요"), 초대 수락·거절·만료 안내와 "초대를 찾을 수 없어요"(SCR-MYP-005), 캐릭터 생성 안내(사진 형식·용량, 중복 생성·주양육자만·실패 토스트), 목표체중 오류 "0보다 큰 숫자로 입력해 주세요"
- SCR-MYP-040 설계서: 새 비밀번호 칸 안내, 휴대폰 "미등록" 표기
- FN-MYP-030-05: "등록순 고정"을 금액순(같으면 등록순, 공용은 맨 아래)으로
- FN-MYP-030-10·FN-MYP-002-07: "이름(삭제됨)" 표기와 문구가 맞는지 확인
- FN-MYP-040-09: SNS 계정 연동 버튼 추가(연동됨/가입 계정 표시, [연동하기], 해제 없음, 이메일·SNS 회원 모두 노출, 실패 시 서버 message 토스트)
- FN-MYP-003-03: 털색에 얼룩 추가
- FN-MYP-010-13: 고정 좌표 겹침 → 서버 합성(`POST /ai/characters/{pixelCharSn}/preview` PNG). 010-17·18·19는 서버 합성에 맞게 고치거나 삭제. 상점 미리보기가 다르면 FN-MYP-011-01도
- FN-MYP-004-01: 서버에 권한(`authrtNm`)이 없어 카드에서 뺀 "권한" 줄을 명세에서 고칠지

### 팀 답 기다림

- 등록-삭제를 반복하면 같은 날 케어미션이 다시 출제될 수 있다(포인트 악용 여지). 막을지 백엔드와 정한다
- SCR-MYP-010 털색을 "흰색"으로 등록했는데 생성 캐릭터가 검은 강아지였다. 서버가 털색을 반영하는지(LJS)
- FN-MYP-010-12 첫 생성 실패 때 [캐릭터 만들기] 재노출과 실패 안내 문구(LJS)
- 서버 상점이 `MYPC0006` 신발 4개를 주는데 프론트 부위는 5개(`MYPC0001~0005`)라 [전체]에만 나오고 부위 이름이 빈칸. 서버 DB가 다른지(LJS)
- 초대 수락 카드(`InvitationAccept`)에서 아직 양육자가 아니라 얼굴이 403이면 기본 아이콘만 보인다. 허용할지(LJS)
- 건강 일지 병원 영수증 저장 때 자동 기록되는 가계부 1건(FN-AIM-009-10)이 `recptSn`으로 연결되는지(JAJ·YAY). 가계부 출처 영수증 다시 열기는 명세에 진입점이 없어 안 했다(필요하면 명세에서 정한다)
- 공용 DB 정리(SCR-MYP-031 검증): 회원 1 지출 `EXPND_SN=10459`(소프트 삭제), 인앱 알림 `INAPP_NOTI_SN=5297`(남김). `NOTI_SNDNG_LOG` 발송 기록, petSn 1011 케어미션(EXPENSE_CREATE) 반영이 생겼을 수 있다. 복구: `DELETE FROM EXPND WHERE EXPND_SN = 10459;`, `DELETE FROM INAPP_NOTI WHERE INAPP_NOTI_SN = 5297;`
- 스타일 결정 합의: 그림자 토큰 `shadow-depth-sm/md/lg`·`ring-focus`·`ring-error`(`OPEN_ISSUES.md`에 제안), `@theme` 토큰·Pretendard CDN·브랜드 색 #285a5c·lucide·가계부 tone·warn 토큰. 합의되면 `docs/OPEN_ISSUES.md` 스타일링 항목 갱신

### 다른 사람 담당·기다리는 것

- FN-MYP-040-09 `POST /api/members/me/sns-links` 병합 뒤(YAY): 성공 토스트·"연동됨" 전환, 서버 오류 `message`를 화면으로 보고 `useSnsCallback` 오류 처리를 맞춘다
- `CHARACTER_BAKE_ENABLED`(LJS)가 켜지면 LJS와 `/mypage/characters`·홈 얼굴이 착용 모습인지 화면 확인. SCR-MYP-011 상점 미리보기 겹침도 이미지가 나오면 확인
- SCR-MYP-011 기준 문서 `v0.6_20261022`가 DMS에 올라오면 FN-MYP-011-03·04(사람이 준 수치로 만듦)와 대조
- SCR-MYP-005 진입: 알림 드롭다운(SCR-COM-004), 가입 직후 자동 노출(SCR-ACC-001, YAY·AIC), 로그인이 `redirect`를 받는지(AIC)
- 시안 v5의 페이지 배경 `#FDFCFB`·푸터 `#FCF9F7`이 `UserLayout.jsx`·`UserFooter.jsx`(LJS)에 아직 옛 값

### 리팩토링 때 맞출 것(QA 뒤)

- 공용 `components/Modal.jsx`: 가운데 모달에서 배경 오른쪽을 누르면 닫히지 않는다(왼쪽·위·아래는 닫힘, 가계부 [영수증으로 등록]에서 확인). `handleMouseDown`의 스크롤바 예외(`clientX >= rect.left + dialog.clientWidth`면 무시)가 `isTop`이 아닌 모달에도 걸려 모달 오른쪽 끝보다 오른쪽 배경 클릭이 무시된다. 고칠 방향: 스크롤바 예외는 `isTop`일 때만, 보통 모달은 클릭이 dialog 상자 밖일 때만 닫는다
