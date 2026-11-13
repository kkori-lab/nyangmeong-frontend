# SJM 핸드오프

## 지금 하는 것

SCR-MYP-003 반려동물 등록/수정 · 체중 입력 소수 둘째 자리·200kg 제한 + 체중 정상범위 직접 입력 여부 전송·표시 — 끝 (2026-11-13, 검증 `통과`, lint·build 0, 사람 확인 완료)

### 기획

- 배경: 백엔드 PR #236(SJM)이 develop에 병합됨. 등록·수정·조회에 `bdwgRngDrctInptYn`('Y' 직접 입력, 'N' 서버 자동 계산) 추가, `petBdwg`·`goalBdwg`·`minBdwg`·`maxBdwg`는 소수 둘째 자리·200 이하(넘으면 400). 기존 반려동물은 모두 'Y'. 걸치는 기능: FN-MYP-003-01 등록/수정, FN-MYP-003-04 목표체중·체중 정상범위
- 서버 규칙(그대로 맞춘다): `PetBdwgRange.of` = 기준 체중 ×0.9 ~ ×1.1, 소수 둘째 자리 HALF_UP, 최소 0.01 이상·최대는 최소+0.01 이상, 최대 200에서 자름, 최소는 199.99에서 자름. 등록 'N'이면 보낸 범위 무시, 수정 'N'이면 저장된(같이 보낸 값이 있으면 그 값) 체중으로 다시 계산
- 디자인: 시안에 이 선택 UI가 없다. 지금 `PetFormModal.jsx`의 스타일·`RadioGroup`(PC 라디오, 모바일 세그먼트)을 그대로 쓴다. 토큰은 `src/assets/index.css`만, 아이콘은 lucide-react만
- API: `POST /api/pets`, `PATCH /api/pets/{petSn}`, `GET /api/pets/{petSn}`(내 것, 이미 연결됨). 새 API 없음
- 정상범위 계산 `calcBdwgRange(weight)`
  - 바꿀 파일: `src/features/pet/shared/bdwgRange.js`(새 파일, import 없음)
  - 입력 문자열을 0.01 단위 정수로 바꿔 정수로 계산한다(부동소수 반올림 오차 방지). 값이 비었거나 0 이하·200 초과·형식 오류면 null, 아니면 `{ minBdwg, maxBdwg }`(숫자)
  - 완료 조건 명령: `node --input-type=module`로 불러 출력 확인. 4.2→3.78~4.62, 4.25→3.83~4.68, 0.01→0.01~0.02, 0.05→0.05~0.06, 200→180~200, 199.99→179.99~200, ''·0·200.01→null
- 체중 입력 규칙 (FN-MYP-003-01·04)
  - 바꿀 파일: `src/features/pet/list/PetFormModal.jsx`(`DECIMAL_INPUT`, `validate`)
  - 입력 형식 `/^\d{0,3}(\.\d{0,2})?$/`: 소수 셋째 자리·네 자리 정수는 입력 자체가 안 된다
  - 체중·목표체중·최소·최대가 200 초과면 저장 때 그 항목 아래에 "200kg 이하로 입력해 주세요"(질문 1). 최소·최대는 범위 오류 자리(`errors.range`) 하나로
  - 서버 400 필드 오류는 지금 `errorKeyOf` 매핑 그대로 뜬다
- 정상범위 직접 입력 여부 (FN-MYP-003-04)
  - 바꿀 파일: `PetFormModal.jsx`(`EMPTY_FORM`, `toForm`, `validate`, 제출 body, 정상범위 `Group`)
  - 폼 값 `bdwgRngDrctInptYn`: 등록 기본 'N', 수정은 응답 값(없으면 'Y')
  - 정상범위 legend 아래에 `RadioGroup` "자동 계산('N') / 직접 입력('Y')"(질문 2)
  - 'N': 최소·최대 칸은 `readOnly`(배경 `surface-2`)이고 `calcBdwgRange(기준 체중)`의 미리보기를 보여 준다. 기준 체중은 체중 칸 값, 수정에서 체중이 잠겼으면(`lastBdwgRcd` 있음) `pet.petBdwg`(서버가 계산에 쓰는 값). 미리보기가 null이면 빈 칸 + placeholder "체중 입력 시 자동". 필수·최소<최대 검사 제외. 안내 문구는 "현재 체중의 ±10%로 자동 계산돼요. 성장기이거나 수의사 권장 범위가 있다면 직접 입력해 주세요."(모바일도 같은 문구)
  - 'Y': 지금처럼 직접 입력, 필수, 최소 < 최대, 0보다 큼, 200 이하. 'N'→'Y'로 바꿀 때 최소·최대 칸이 비어 있으면 미리보기 값으로 채운다(수정의 기존 값은 지우지 않는다). 안내 문구는 지금 문구("동물병원에서 확인한 범위를…") 그대로
  - 제출 body: `bdwgRngDrctInptYn`은 등록·수정 모두 항상 보낸다. `minBdwg`·`maxBdwg`는 'Y'일 때만 보낸다(서버가 'N'이면 무시하지만 보내지 않는다)
  - 다른 곳(`PetSlide`의 "정상 a~bkg", AI `actionFields.js`)은 바꾸지 않는다
- 완료 조건
  - 명령: `yarn -s lint`, `yarn -s build` 종료 코드 0, 위 `calcBdwgRange` 출력이 기대와 같다
  - 화면(PC 1440, 모바일 375): tester(mbrSn 1)로 로그인해 `/mypage/pets`의 [등록]
    - 기본이 "자동 계산", 체중 4.2 입력 → 최소 3.78·최대 4.62가 읽기 전용으로 보이고 안내 문구가 보인다. 체중을 지우면 범위가 비고 placeholder가 보인다
    - 체중 칸에 4.123·1000이 입력되지 않는다. 체중 200.5·목표체중 201 저장 → 각 항목 아래 "200kg 이하로 입력해 주세요"
    - "직접 입력"으로 바꾸면 칸에 미리보기 값이 채워지고 편집된다. 칸을 비우면 필수 오류, 최소 5·최대 4면 "최소 체중은 최대 체중보다 작아야 해요", 최대 200.01이면 200 오류
    - "자동 계산"으로 등록 → 요청 body에 `bdwgRngDrctInptYn:'N'`이 있고 `minBdwg`·`maxBdwg`가 없다(네트워크 요청으로 확인). 목록 슬라이드의 "정상 3.78~4.62kg"이 미리보기와 같다
    - 방금 등록한 동물 수정 모달이 "자동 계산"으로 열린다. 기존 동물 수정 모달은 "직접 입력"과 저장된 범위로 열린다(기존 동물은 저장하지 않는다)
    - 확인용으로 등록한 동물은 확인 뒤 화면에서 삭제하고, 바뀐 행과 복구 SQL을 "정리"에 적는다
- 질문
  1. 200 초과·형식 오류 문구를 띄우는 때: 지금 모달처럼 [저장]을 누를 때만 띄울까요, 입력하자마자 띄울까요? (추천: 저장 때. 지금 다른 항목의 오류와 같은 방식)
  2. 선택 UI: 정상범위 legend 바로 아래 "자동 계산 / 직접 입력" 라디오(모바일은 성별·중성화와 같은 세그먼트)로 둘까요? (추천: 그렇게 둔다)
  - 결정: 1) 저장 때 2) 그대로
- 문서 작업(`/end` 때 "다음에 할 것"으로): FN-MYP-003-04의 "소수 셋째 자리까지" → 둘째 자리·200kg 이하, 자동 계산('N')·직접 입력('Y')과 안내 문구 추가
- 새 의존성: 없음

### 추가 요청

| 추가-1 | src/utils/petFormat.js(`formatWeight`만), src/features/pet/list/PetSlide.jsx | 명령: yarn -s lint, yarn -s build 0, `formatWeight` 출력(4.20→4.2kg, 5.00→5kg, 4.236→4.24kg, 4.2→4.2kg) / 화면: 슬라이드 체중·"정상 a~bkg"가 끝 0 없이 표시 | 요청 2026-11-13 12:26 "formatWeight를 소수 셋째 자리에서 반올림해 둘째 자리까지, 끝 0 생략. PetSlide 체중·정상범위에 적용. 다른 함수는 건드리지 말 것" |

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
- FN-MYP-003-04: "소수 셋째 자리까지" → 소수 둘째 자리·200kg 이하, 정상범위 자동 계산('N')·직접 입력('Y') 선택과 안내 문구("현재 체중의 ±10%로 자동 계산돼요. 성장기이거나 수의사 권장 범위가 있다면 직접 입력해 주세요.") 추가
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

## 중단 2026-11-13 12:34 (5시간 한도 95%)
- 자동 커밋한 변경 5개: handoff/SJM.md, milestones/SJM.md, src/features/pet/list/PetFormModal.jsx, src/features/pet/list/PetSlide.jsx, src/utils/petFormat.js
- 커밋 안 한 새 파일 1개 (사람이 판단): src/features/pet/shared/bdwgRange.js
- 이어서: 이 파일의 "지금 하는 것" 과 `git log -1` 을 본다
