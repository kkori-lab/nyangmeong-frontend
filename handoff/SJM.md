# SJM 핸드오프

## 지금 하는 것

SCR-MYP-002 반려동물 프로필 목록 · 슬라이드 카드 표시 항목 바꾸기(생년월일·품종·중성화 배지·상세 2열 그리드) — 끝 (2026-11-10, 검증 `통과`, lint·build 0, 사람 확인 완료. 추가-1은 추가-2로 대체)

### 기획

- 배경: 사람 지시로 슬라이드 카드(PC·모바일)의 표시 항목만 바꾼다. 다른 화면·API·백엔드는 건드리지 않는다. 걸치는 기능: FN-MYP-002-02 반려동물 슬라이드, FN-MYP-002-03 인식칩 번호 표시
- 생년월일 값: 목록 응답의 `petBrdt`(YYYY-MM-DD)를 지금도 모바일 보조 줄에서 쓰고 있다. API·백엔드 변경 없음
- 디자인: 이 요청의 지시가 기준이다. 나머지는 지금 `PetSlide.jsx` 그대로. 스타일은 기존 토큰(`src/assets/index.css`, nyangmung.css와 같은 값)만 쓰고 아이콘은 lucide-react만 쓴다
- 생년월일 표기 `formatBirthAge(petBrdt)`
  - 바꿀 파일: `src/utils/petFormat.js`. 이 함수를 추가하고, 결과는 `yy.mm.dd (n살 n개월)`이다. 나이는 기존 `formatAge`를 그대로 쓴다(만 나이, 0살이면 `n개월`). `formatAge`는 건강·홈 화면도 쓰므로 고치지 않는다. 날짜 문자열은 직접 잘라 쓰고 `new Date` 시간대 변환을 거치지 않는다. 값이 없으면 빈 문자열
  - 완료 조건
    - 명령: `node --input-type=module`로 `src/utils/petFormat.js`를 불러 오늘을 고정해 확인한다. 생일 당일(21.11.10 → `5살`), 하루 전·뒤, 0살(`3개월`·`0개월`), 월말 생일 1월 31일생의 2월 28일·3월 1일 결과를 출력한다
- PC 헤더
  - 바꿀 파일: `src/features/pet/list/PetSlide.jsx`(`PetCard`)
  - 이름과 역할 배지 오른쪽에 `formatBirthAge`를 둔다. 라벨은 붙이지 않고, 색은 보조 텍스트(질문 2)·보통 굵기·`tabular-nums`로 한다. 모바일(≤760px)에서는 숨긴다. 공동양육 카드의 "주양육자 OOO" 줄(`OwnerLine`)은 그대로 둔다
- PC 상세 2열 그리드
  - 바꿀 파일: `PetSlide.jsx`(`InfoGroup` 2개 → `dl` 1개, `InfoRow`·`ChrcRow`·`ListRow`)
  - `dl` 하나를 `grid-cols-2 grid-rows-4`로 두고, 항목은 `품종·인식 번호 / 성별·특징 / 체중·알레르기 / 털색·기저질환` 순으로 행마다 좌우를 짝지어 둔다. 같은 grid 행이라 좌우 구분선이 같은 높이에 온다. 열마다 위 `border-line-strong`, 행 아래 `border-line-soft`, 마지막 행은 아래 선 없음은 지금과 같다
  - 라벨 "종" → "품종". 값은 `vrtyName || 종 이름`이고, 아래의 작은 강아지/고양이(`SubText`)는 지운다
  - 성별은 값만 둔다. "중성화 완료" 줄은 지우고, `nutrYn`일 때만 값 오른쪽에 `Badge` "중성화"를 붙인다(질문 1). 미중성화는 아무것도 붙이지 않는다
  - 모든 행은 한 줄이고 넘치면 `truncate`(…)다. 인식 번호는 줄바꿈하지 않는다. 특징의 [더보기], 알레르기·기저질환의 앞 2개+"외 N개" 버튼은 그대로 두고, 버튼은 말줄임 밖(`shrink-0`)에 둔다. 값이 없으면 지금처럼 라벨만 보인다
  - 쓰지 않게 된 `SubText`·`InfoGroup`은 지운다
- 모바일
  - 바꿀 파일: `PetSlide.jsx`(`PetCard` 보조 줄, `MobileInfo`)
  - 이름 아래 보조 줄은 `yy.mm.dd (n살 n개월) · 암컷(중성화)`로 바꾼다. 중성화하지 않았으면 `암컷`만 쓰고 품종은 뺀다
  - 상세 목록 맨 위에 "품종" 행(값 규칙은 PC와 같음)을 추가한다. 그 아래 체중·인식 번호·알레르기·기저질환·[정보 더보기](털색·특징)는 그대로다
- 완료 조건
  - 명령: `yarn -s lint`, `yarn -s build` 종료 코드 0, 위 `formatBirthAge` 출력이 기대와 같다
  - 화면(PC 1440·1024, 모바일 375): tester(mbrSn 1)로 로그인해 `/mypage/pets`에서 주양육+중성화, 주양육+미중성화, 공동양육+중성화, 공동양육+미중성화 4경우를 PC·모바일 모두 확인하고 스크린샷을 남긴다(스크린샷은 저장소 밖에 두고 커밋하지 않는다). 실제 데이터에 없는 경우는 `page.route`로 목록 응답의 `nutrYn`·`brupRoleCd`만 바꿔 보고, 그렇게 했다고 적는다. DB는 바꾸지 않는다
  - 화면: PC에서 ◀▶로 넘겨도 상세 `dl` 높이가 같다(`getBoundingClientRect`로 장마다 잰다). 좌우 같은 행 구분선의 y좌표가 같다. 긴 품종·특징·알레르기(외 N개)도 한 줄 말줄임이다
  - 화면: 헤더에 생년월일·나이가 배지 오른쪽에 보이고, 공동양육 카드에 "주양육자 OOO" 줄이 남아 있다
- 질문
  1. 중성화 배지 색: nyangmung.css에는 info 클래스가 없고 파란 배지는 `.badge-blue`(`--tone-blue-bg/fg`)다. "대기중"은 시안과 코드 모두 `.badge-amber`(노랑)이고, 파란 배지는 같은 줄의 "초대 발송"이다. `.badge-blue`와 같은 값인 `bg-tone-blue-bg text-tone-blue-fg`를 쓸까요? (추천: 파랑 `.badge-blue`)
  2. 생년월일 글자색: `text-secondary` 토큰이 없다. `text-muted`(#566465, "설명", 지금 모바일 보조 줄 색)와 `text-subtle`(#667374, "캡션·메타") 중 무엇을 쓸까요? (추천: `text-muted`)
  3. 월말 생일: 기존 `formatAge`는 일(日)이 생일 날짜에 못 미치면 달을 세지 않는다. 그래서 1월 31일생은 2월 28일에 `0개월`, 3월 1일에 `1개월`이다. 다른 화면과 같게 이 규칙을 그대로 둘까요? (추천: 그대로 둔다. 바꾸면 건강·홈의 나이도 같이 바뀐다)
  - 결정: 1) 파랑(.badge-blue). 이 컴포넌트가 토큰 유틸리티 방식이면 그 방식 가능 2) text-muted 3) 기존 formatAge 규칙 그대로
- 새 의존성: 없음

### 추가 요청

| 추가-1 | src/features/pet/list/PetSlide.jsx | 명령: yarn -s lint, yarn -s build 0 / 화면: 375·390에서 탄이·루루 보조 줄이 줄바뀔 때 "· 성별(중성화)"가 통째로 둘째 줄로 가고 가운뎃점이 둘째 줄 앞에 붙으며, 한 줄에 들어가면 한 줄 | 요청 2026-11-10 15:15 "모바일 보조 줄 줄바꿈: 생년월일 덩어리와 · 성별 덩어리를 각각 nowrap으로 묶기" |
| 추가-2 | src/features/pet/list/PetSlide.jsx | 명령: yarn -s lint, yarn -s build 0 / 화면: 375·430에서 코코·루루 모바일 보조 줄이 가운뎃점 없이 항상 두 줄(1줄 생년월일, 2줄 성별(중성화), 미중성화는 성별만), PC 헤더는 그대로 | 요청 2026-11-10 15:18 "모바일 보조 줄 가운뎃점 없애고 두 줄 고정" |

## 다음에 할 것

### 내 코드 작업

- JAJ·LJS 알림: 공용 `components/AnalyzeProgress.jsx`를 새로 만들었다(영수증 분석 게이지, `label` prop). JAJ의 `features/ai/receipt/ReceiptUploadModal.jsx`는 함수·상수를 지우고 import만 바꿨고 화면 동작은 같다. 새 분석 화면에 게이지가 필요하면 이 컴포넌트를 쓴다
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
