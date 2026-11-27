# JAJ 핸드오프

## 지금 하는 것

끝남 — SCR-HLT-002 건강 일지 수정 추가-7~11(2026-11-27): 최근 건강기록 「오늘」 배지 날짜 뒤로, 배변 상태 선택 칸 값 오른쪽 정렬, 오늘 기록하기·하루 기록 수정 모달 숫자 칸을 label+input+단위 구조로 바꿔 화살표 왼쪽 끝·값~단위 간격 8px 통일. lint·build 0, Playwright 1440·390 확인, 사람 확인 끝. 기록은 `milestones/JAJ.md` 「건강기록 빈 화면 정리」 절 추가-7~11. 진행 중인 마일스톤 없음

### 추가 요청

- (2026-11-25) 추가-2 끝: 건강기록 "기록 없음" 문구를 버튼 없는 빈 화면 규칙(`text-base text-muted`)으로 통일: DashboardCard 빈 상태(LONG_EMPTY_TEXT 삭제)·WidgetTile 빈 타일·TodayRecordCard 배변 상태·CareList 빈 문구·검진상세 혈액/영상/기타 「결과가 없어요」. 문구 그대로. lint·build 0, 16px·400·#566465 측정, 사람 확인 끝. 기록은 `milestones/JAJ.md` 같은 절 추가-2
- (2026-11-25) 추가-3 끝: 종합 건강기록 검사 수치 카드 드롭다운 label을 기능 태그 없이 항목명만(SCR-HLT-011 ⑦). `[undefined] TBIL` 해소. WidgetCard label·주석, summaryApi trends.fnctTagCd, summaryUtils getFunctionTagName 삭제. 검진상세 배지·검사 수치 입력 드롭다운은 그대로. lint·build 0, Playwright 확인, 사람 확인 끝
- (2026-11-25) 추가-4 끝: 종합 건강기록 검사 수치·지속 관찰 카드 드롭다운 칸 `w-48 max-w-[60%]`로 고정(A안). 공용 DropdownSelect 목록 항목 한 줄·넘치면 …, 문자열 label이면 title. JSX label은 ReceiptPetLink 하나. lint·build 0, Playwright 측정, 사람 확인 끝. 기록은 `milestones/JAJ.md` 같은 절 추가-3·4
- (2026-11-26) 추가-5 끝: 건강 일지 4건. ① 오늘의 기록 카드 맨 밑 문구 「수정하거나 삭제하려면 아래 「최근 건강기록」을 눌러주세요」, 꺼 둔 항목 안내 삭제(맨 밑 줄 mt-auto) ② 오늘 기록하기 모달 위 안내를 NoticeBox 점 목록 2줄로, [항목 편집] 항상 보임(widgetIds null이면 5개 켜짐으로 보고 저장, ※신규 정책), 목록 아래 안내 삭제 ③ 건강기록 변화 카드 1건 회색 상자가 남은 높이 채움 ④ 배변 상태 탭을 최근 7일 원형 배지 띠로(조회 오늘-6~오늘, sub 「최근 7일」, 원 안은 그날 마지막 기록, ※신규 정책). lint·build 0, Playwright 확인, 사람 확인 끝
- (2026-11-26) 추가-6 끝: 건강 대시보드 튜토리얼 자동 열림을 공용 `dashboard/WidgetTutorialGate`로 꺼내 종합 건강기록·건강 일지·케어 캘린더 세 화면 첫 진입에서 엶(1마리 이상 + 저장한 적 없음, 화면 이동 없음, ※신규 정책). HealthDashboard에는 [대시보드 편집]·?tutorial=1 처리만 남김. /health에서 두 번 뜨지 않게. lint·build 0, Playwright(응답 route) 확인, 사람 확인 끝. 기록은 `milestones/JAJ.md` 같은 절 추가-5·6
- (2026-11-27) 추가-7 끝: 건강 일지 최근 건강기록 오늘 줄의 「오늘」 배지를 날짜 뒤로(「날짜 [오늘]」, RecentRecordTable DayDate)
- (2026-11-27) 추가-8 끝: 건강 일지 오늘 기록하기·하루 기록 수정 모달의 배변 상태 선택 칸 값을 오른쪽 정렬(화살표는 오른쪽 끝 그대로, 값은 화살표 바로 왼쪽). 공용 DropdownSelect는 고치지 않고 두 모달에서 className으로만
- (2026-11-27) 추가-9 끝: 오늘 기록하기 모달 숫자 칸 증감 화살표를 칸 안 왼쪽 끝으로([direction:rtl], 값은 오른쪽 정렬 유지), pr-12 → pr-9로 값이 단위 바로 옆에. 공용 INPUT은 그대로, 이 모달 숫자 칸에만. [unicode-bidi:plaintext]를 더해 rtl에서 「4.」이 「.4」로 뒤집혀 보이는 것을 막음
- (2026-11-27) 추가-10 끝: 오늘 기록하기 모달 숫자 칸을 label(테두리·배경·상태) 안에 테두리 없는 input + 단위 span을 gap-2로 나란히 두는 구조로 바꿔 값~단위 간격을 모든 단위에서 같게. 화살표 왼쪽 끝·오른쪽 정렬·[unicode-bidi:plaintext] 유지, hover·포커스·오류·입력 완료·disabled 상태는 label에서 같게. 수정 모달·공용 INPUT은 그대로
- (2026-11-27) 추가-11 끝: 하루 기록 수정 모달 숫자 칸도 추가-10과 같은 구조(label 안 테두리 없는 input + 단위 span, gap-2)로 바꿔 화살표를 칸 왼쪽 끝으로, 값~단위 간격을 모든 단위에서 같게. 오류·입력 완료 표시는 이 칸에 없어 넣지 않음. 배변 상태 DropdownSelect·TimeSelect·공용 INPUT은 그대로

## 다음에 할 것

- 커밋·푸시·PR: 추가-7~11(건강 일지 오늘 배지 위치, 배변 상태 값 정렬, 두 모달 숫자 칸 구조)

- 커밋·푸시·PR: 추가-5·6(건강 일지 수정 4건, 튜토리얼 세 화면 자동 열림)

- 팀 알림: 건강기록 세 화면 어디서든 대시보드 항목을 저장한 적 없으면 첫 진입에 튜토리얼이 뜸(`WidgetTutorialGate`)

- 커밋·푸시·PR: 추가-3·4(검사 수치 드롭다운 항목명만, 공용 DropdownSelect 목록 한 줄·… 처리)

- PR 올리기: `JAJ` 브랜치 푸시 끝(64b1940 + develop merge a288e54). 캡처 5장(`.playwright-mcp/pr/JAJ-20261125-SCR-HLT-00*-64b1940-after-*.png`)을 `pr-assets`에 올린 뒤 compare 페이지에서 PR 생성

- 팀 알림: 공용 `DropdownSelect` 목록 항목이 한 줄·넘치면 …로 바뀜(문자열 label이면 마우스 올리면 전체 이름)

- 팀 알림: 공용 `EmptyResult`가 바뀌어 다른 도메인 빈 화면도 같이 바뀜(버튼 없으면 아이콘·설명 없이 제목 한 줄, 버튼 있으면 제목 진한 색 18px·500·버튼 위 32px)
