# SJM 핸드오프

## 지금 하는 것

SCR-MYP-020 포인트 내역 · 검진기록 등록 줄을 "이름 · 검진기록 등록"으로 표시 — 끝 (2026-11-09, 검증 `통과` 1회차, 사람 확인 완료. `memoCn` 없음은 응답 가로채기로만 확인)

| 기능 | 바꿀 파일 | 완료 조건 | 근거 |
| --- | --- | --- | --- |
| SCR-MYP-020 검진기록 줄 제목 | `features/point/history/PointHistory.jsx` (`getTitle`) | 명령: `yarn -s lint`, `yarn -s build` 종료 코드 0. 화면: 검진기록(`MYPC0021`) 포인트가 있는 달에서 그 줄이 "이름 · 검진기록 등록"으로 보이고(`memoCn`이 없으면 유형 이름만), 케어미션·아이템 구매·관리자 조정 줄은 전과 같다. 375px·1280px 확인. 데이터가 없으면 만들지 않고 `GET /api/point-ledgers`(yearMonth 파라미터) 응답을 가로채 확인 | 사람 요청(피드백): 서버가 검진기록 `memoCn`에 반려동물 이름만 넣어 무슨 포인트인지 알 수 없음 |

- 디자인: 없음, 화면설계서 기준 (문구만 바뀜)
- DB 변경 없음, 연결 작업 없음

## 다음에 할 것

### 내 코드 작업

- SCR-MYP-040 (선택) `PASSWORD_SAME_AS_CURRENT`는 page.route 400으로만 확인했다. 로컬 백엔드를 develop으로 맞추고 규칙에 맞는 비밀번호의 이메일 계정으로 실제 응답 `message`가 같은지 본다
- SCR-MYP-002 10마리 보유 때 삭제하면 등록 카드로 바뀌는지 화면 확인(데이터가 없어 못 함)
- SCR-MYP-001 홈 로딩: 팀 규칙(`docs/convention/ui.md` "로딩 표시")상 스켈레톤이어야 한다. MyPetsSection 로딩을 실제 카드 크기 SkeletonCard로. 같이 SJM 담당 화면 전체에서 isPending일 때 null·문구인 곳을 찾아 고친다
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
