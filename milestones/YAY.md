# YAY 마일스톤

기준: 로그인·회원가입_기능명세서_v0.7_20260930, 플레이스_기능명세서_v0.5_20260930, 메인페이지_기능명세서_v0.9_20261001 (DMS, 2026-10-26)

## SCR-ACC-002 로그인 (이메일) — 끝
- 기능: FN-ACC-002-02 AI 안내 적용 범위, FN-ACC-002-13 AI 안내 표시 조건, FN-ACC-002-14 AI 안내 위치, FN-ACC-002-15 오류 문구·갱신, FN-ACC-002-01 뒤로가기, FN-ACC-002-22 이메일로 로그인하기, FN-ACC-002-08 회원가입, FN-ACC-002-03 아이디(이메일) 입력, FN-ACC-002-04 비밀번호 입력, FN-ACC-002-05 로그인 버튼, FN-ACC-002-07 비밀번호 찾기, FN-ACC-002-12 아이디 이메일 오류, FN-ACC-002-16 회원정보 불일치 공통 알림, FN-ACC-002-18 하단 보안코드 표시, FN-ACC-002-19 보안코드 새로고침, FN-ACC-002-20 보안코드 입력
- 완료 조건: `/login`에서 방법 선택 → 이메일 입력, 불일치 4번 뒤 5번째에 보안코드, 올바른 값이면 메인 이동(가짜 응답 기준)
- 연결 남음: 로그인·보안코드·로그아웃 API → 아래 "API 연결" 절

## SCR-ACC-002 로그인 · 로그인·로그아웃 API 연결 — 끝
- 백엔드 끝: `GET /auth/login-attempt-limits`, `POST /auth/captchas`, `POST /auth/login`, `POST /auth/logout` (백엔드 SCR-ACC-002 절의 "프론트 연결")
- 대상: `features/member/api.js`의 가짜 `getLoginStatus`·`getCaptcha`·`login`·`logout`
- 완료 조건: 실제 서버로 로그인하면 쿠키가 생기고 헤더가 로그인 상태가 된다. 5번 틀리면 서버가 그린 보안코드 이미지가 나온다
- 끝남: 승인 2026-10-27, 검증 통과(재검증), 사람 확인 2026-10-27
- 연결 남음: FN-ACC-001-22 (닉네임 확인·저장 API `PATCH /members/me/nickname`, YAY 백엔드 SCR-ACC-001)
- 연결 남음: (기반) 메인·마이페이지 라우트 `auth: 'member'` 전환 (팀과 정한 뒤, 각 라우트 담당)

## SCR-ACC-011 비밀번호 찾기 — 끝
- 기능: FN-ACC-011-01 로그인으로 돌아가기, FN-ACC-011-02 이메일 아이디 입력, FN-ACC-011-03 재설정 인증번호 보내기, FN-ACC-011-05 인증 대상 이메일, FN-ACC-011-06 재설정 인증번호 입력, FN-ACC-011-07 인증번호 재전송, FN-ACC-011-08 인증 확인 및 계정 분기, FN-ACC-011-09 인증 오류 안내, FN-ACC-011-10 SNS 전용 계정 안내, FN-ACC-011-11 SNS 로그인 화면으로
- 연결 남음: 인증번호 발송·확인 API(YAY 백엔드 SCR-ACC-011, 대기). `features/member/api.js`의 가짜 `sendRecoveryCode`·`verifyRecoveryCode`·`getRecoveryStatus`. 탈퇴 계정의 "재가입 복구 절차" 버튼은 재가입 복구 화면이 생기면 연결

## SCR-ACC-012 비밀번호 재설정 — 끝
- 기능: FN-ACC-012-01 새 비밀번호 입력, FN-ACC-012-02 새 비밀번호 확인, FN-ACC-012-03 비밀번호 재설정, FN-ACC-012-04 재설정 취소, FN-ACC-012-05 입력·저장 오류 안내, FN-ACC-012-06 재설정 권한 만료 안내, FN-ACC-012-07 이메일 인증 다시 하기, FN-ACC-012-08 재설정 완료 안내, FN-ACC-012-09 로그인으로 이동
- 연결 남음: 비밀번호 재설정 API(YAY 백엔드 SCR-ACC-012, 대기). 가짜 `resetPassword`

## SCR-ACC-001 회원가입 (이메일) — 대기
- 기능: FN-ACC-001-01 뒤로가기, FN-ACC-001-02 AI 매니저, FN-ACC-001-37 입력 완료 정보 확인, FN-ACC-001-11 전체 동의, FN-ACC-001-12 개별 약관 동의, FN-ACC-001-13 내용보기, FN-ACC-001-34 약관 동의 다음, FN-ACC-001-03 아이디 이메일 입력, FN-ACC-001-04 인증코드 발송, FN-ACC-001-05 인증번호 입력, FN-ACC-001-06 인증 확인, FN-ACC-001-35 이메일 인증 다음, FN-ACC-001-29 휴대전화번호 입력, FN-ACC-001-30 휴대전화번호 중복확인, FN-ACC-001-36 휴대전화번호 다음, FN-ACC-001-09 비밀번호 입력, FN-ACC-001-10 비밀번호 확인, FN-ACC-001-14 회원가입 버튼, FN-ACC-001-15 아이디 이메일 오류, FN-ACC-001-16 오류 안내 AI, FN-ACC-001-17 오류 위치 이동, FN-ACC-001-18 오류 문구·말풍선, FN-ACC-001-22 가입 직후 모달, FN-ACC-001-23 닫기·이탈, FN-ACC-001-24 현재 저장된 닉네임, FN-ACC-001-07 닉네임 편집, FN-ACC-001-08 중복 확인, FN-ACC-001-25 검증 결과 안내, FN-ACC-001-26 닉네임 설정 완료, FN-ACC-001-19 가입 완료 안내, FN-ACC-001-27 저장된 닉네임, FN-ACC-001-28 닉네임 설정 다시 열기, FN-ACC-001-20 로그인 화면으로, FN-ACC-001-38 이메일 중복 가입 안내, FN-ACC-001-39 기존 가입 방법으로 로그인, FN-ACC-002-21 가입 완료·로그인 방법 안내(화면은 SCR-ACC-002)
- 이미 만든 것: `features/member/signup/` 4단계 가입·닉네임 모달(가짜 API, 커밋 befd775). 사람 확인·`/end` 기록 없음
- 기다리는 것: 없음 (가입·이메일 인증·닉네임 API는 YAY 백엔드 SCR-ACC-001, 대기)
- 완료 조건: 약관 → 이메일 인증 → 번호 중복확인 → 비밀번호 순서로만 다음이 열리고, 가입 뒤 닉네임 모달 → 가입 완료 → 로그인 방법 선택으로 간다

## SCR-ACC-002 SNS 로그인 — 대기
- 기능: FN-ACC-002-09 네이버로 로그인하기, FN-ACC-002-10 카카오로 로그인하기, FN-ACC-002-11 구글로 로그인하기, FN-ACC-001-33 SNS 신규 가입 취소(화면은 SCR-ACC-001), FN-ACC-001-31 SNS 가입 계정 확인(화면은 SCR-ACC-001), FN-ACC-001-32 SNS 회원가입 완료(화면은 SCR-ACC-001)
- 기다리는 것: SNS 로그인 흐름 결정(백엔드 `docs/api/issues.md` 로그인 2번), 제공자 앱 키(팀)
- 완료 조건: 기존 연결 계정은 로그인되고, 처음 보는 SNS 계정은 SNS 가입 확인 화면으로 간다

## SCR-ACC-001 재가입 복구 — 대기
- 기능: FN-ACC-001-40 복구 대상 이메일 확인, FN-ACC-001-41 복구 인증번호 발송·재전송, FN-ACC-001-42 복구 인증번호 입력, FN-ACC-001-43 복구 본인확인, FN-ACC-001-44 기존 정보 복구 안내, FN-ACC-001-45 기존 정보 복구 실행, FN-ACC-001-46 복구 취소, FN-ACC-001-47 기존 정보 복구 완료, FN-ACC-001-48 복구 후 로그인으로
- 기다리는 것: 없음
- 완료 조건: 본인확인 뒤에만 복구 안내가 나오고, 복구 완료 뒤 로그인 방법 선택으로 간다(자동 로그인 없음)

## SCR-ACC-020 회원탈퇴 — 대기
- 기능: FN-ACC-020-01 탈퇴 안내 확인, FN-ACC-020-02 반려동물·공동양육 영향 확인, FN-ACC-020-03 탈퇴 유의사항 확인 동의, FN-ACC-020-04 탈퇴 문구 입력으로 이동, FN-ACC-020-05 탈퇴 취소, FN-ACC-020-06 탈퇴 대상 계정, FN-ACC-020-12 최종 탈퇴·입력 문구 안내, FN-ACC-020-20 탈퇴 확인 문구 입력, FN-ACC-020-13 최종 확인 취소, FN-ACC-020-14 회원탈퇴 실행, FN-ACC-020-15 탈퇴 실패·확인 중 안내, FN-ACC-020-16 결과 확인 및 재시도, FN-ACC-020-17 처리 안내 닫기, FN-ACC-020-18 회원탈퇴 완료, FN-ACC-020-19 랜딩페이지로 이동
- 기다리는 것: 회원정보 수정 화면(SCR-MYP-040, SJM)의 탈퇴 진입 버튼
- 완료 조건: "정말로 탈퇴하겠습니다."가 완전히 같을 때만 탈퇴하기가 켜지고, 완료 뒤 랜딩으로 간다

## SCR-HOS-001 플레이스 — 대기
- 기능: FN-HOS-001-33 로그인 필수 접근, FN-HOS-001-01 카테고리 탭, FN-HOS-001-03 지역·상호명·키워드 검색, FN-HOS-001-04 검색창 검색 버튼, FN-HOS-001-05 검색창 검색 결과 지도, FN-HOS-001-06 정렬 선택, FN-HOS-001-07 병원 결과 카드, FN-HOS-001-08 병원명, FN-HOS-001-09 즐겨찾기 저장·해제, FN-HOS-001-10 지도 핀, FN-HOS-001-11 지도 도구·이동, FN-HOS-001-29 즐겨찾기 고정 영역, FN-HOS-001-30 검색 결과 영역, FN-HOS-001-15 이동한 지도 영역, FN-HOS-001-16 이 지도 영역에서 다시 검색, FN-HOS-001-17 즐겨찾기, FN-HOS-001-31 이전 검색 결과, FN-HOS-001-18 재검색 지도 영역, FN-HOS-001-20 검색 결과 핀, FN-HOS-001-32 즐겨찾기(재검색 결과), FN-HOS-001-19 새 지도 범위의 검색 결과, FN-HOS-001-21 선택 병원 카드, FN-HOS-001-22 선택 병원명, FN-HOS-001-23 즐겨찾기 저장·해제(핀 선택), FN-HOS-001-24 선택 핀, FN-HOS-001-25 지도 요약 카드, FN-HOS-001-26 카카오맵 상세보기, FN-HOS-001-27 길찾기, FN-HOS-001-28 지도 도구·이동(핀 선택), FN-PLC-001-01 미용 탭·대상 데이터(화면은 SCR-PLC-001), FN-PLC-002-01 용품 탭·오프라인 매장 범위(화면은 SCR-PLC-002), FN-PLC-003-01 동반 탭·대상 데이터(화면은 SCR-PLC-003), FN-PLC-004-01 호텔 탭·정보 조회 범위(화면은 SCR-PLC-004)
- 이미 만든 것: `features/place/`, `pages/place/PlacePage.jsx`(`/places`). 기능명세서 대조·`/end` 기록 없음
- 기다리는 것: 장소 검색·즐겨찾기 API(YAY 백엔드 SCR-HOS-001, 대기), 카카오 지도 키(팀)
- 완료 조건: 키워드로 검색하면 핀과 결과 카드가 같은 업체로 이어지고, 지도를 옮기면 "이 지도 영역에서 다시 검색"이 나온다. 즐겨찾기는 재검색해도 위에 남는다

## SCR-MAN-001 메인페이지 — 대기
- 기능: FN-MAN-001 히어로 반려동물 캐릭터 노출, FN-MAN-002 AI매니저 검색바 진입 · 확장형 대화창 전환, FN-MAN-003 반려동물 프로필 요약 노출, FN-MAN-004 반려동물 선택 탭 전환, FN-MAN-005 건강 대시보드 기준일·업데이트 시각 표시, FN-MAN-006 건강 지표 위젯 노출, FN-MAN-007 건강 지표 위젯 순서 조정, FN-MAN-008 건강 지표 위젯 전체 보기 이동, FN-MAN-009 데일리 케어미션 미리보기 노출
- 이미 만든 것: `pages/main/MainPage.jsx`(히어로 AI·프로필·데일리 케어미션, 가짜 데이터). `/end` 기록 없음
- 기다리는 것: `pet` 목록·프로필 조회(SJM), 캐릭터 이미지 조회(LJS), 건강 지표·케어리스트(JAJ), AI 대화창 SCR-AIM-001·011(LJS 화면), 메인 조회 조합·위젯 순서 저장(YAY 백엔드)
- 완료 조건: 반려동물 탭을 바꾸면 프로필·위젯·케어미션이 그 반려동물 기준으로 바뀐다. 위젯 순서를 바꾸고 새로고침해도 유지된다

## SCR-ACC-001 회원가입 (이메일) · 가입·인증·닉네임 API 연결 — 대기
- 백엔드 끝: `GET /terms`, `GET /terms/{trmsSn}`, `POST /email-certifications`, `POST /email-certifications/{emlCertSn}/verify`, `GET /members/phone-availability`, `GET /members/nickname-availability`, `POST /members`, `PATCH /members/me/nickname` (백엔드 SCR-ACC-001 절의 "프론트 연결")
- 기능: 명세 기능 ID 추가 없음. FN-ACC-001-03~14·24~30·38에 걸친다
- 대상: `features/member/signup/`의 가짜 약관·이메일 인증·번호/닉네임 중복확인·가입·닉네임 저장 API
- 기다리는 것: 이 백엔드 작업(YAY SCR-ACC-001)의 PR 병합과 공용 DB 마이그레이션
- 완료 조건: 실제 서버로 약관 → 인증번호 발송·확인 → 번호 중복확인 → 가입 → 닉네임 저장이 되고, 가입 뒤 로그인 쿠키 없이 닉네임 모달이 동작한다. 재전송 제한은 `resendAvailableDt`로 남은 시간을 보여 준다

## SCR-ACC-011 비밀번호 찾기 · 인증번호 API 연결 — 끝
- 백엔드 끝: `POST /email-certifications`(목적 `USRC0011`), `POST /email-certifications/{emlCertSn}/verify`, `POST /email-certifications/{emlCertSn}/invalidate` (백엔드 SCR-ACC-011 절의 "프론트 연결")
- 기능: 명세 기능 ID 추가 없음. FN-ACC-011-02~10에 걸친다
- 대상: `features/member/password/`와 `features/member/api.js`의 가짜 `sendRecoveryCode`·`verifyRecoveryCode`·`getRecoveryStatus`. 확인 응답의 `certRslt`(`PASSWORD_RESET_READY`·`SNS_ONLY`+`snsOffrCds`·`MEMBER_NOT_FOUND`·`MEMBER_WITHDRAWN`)로 화면을 가르고, 이메일을 다시 입력하면 `invalidate`(본문 `certTrgtEml`)를 부른다
- 기다리는 것: 이 백엔드 작업(YAY SCR-ACC-011)의 PR 병합. 재설정 토큰(`pswdInitTkn`)을 쓰는 비밀번호 재설정은 백엔드 SCR-ACC-012가 끝난 뒤
- 완료 조건: 실제 서버로 발송 → 확인에서 계정 종류별 화면으로 가고, 재전송 제한은 `resendAvailableDt`로 남은 시간을 보여 준다
- 끝남: 승인 2026-10-29, 검증 통과, 사람 확인 2026-10-29. 추가-1(인증 화면 제목 잘림 방지·AI 안내 서서히 표시), 추가-2(폼 위 알림 서서히 표시)
- 연결 남음: 없음(재설정 API는 아래 SCR-ACC-012 연결 절)

## SCR-ACC-012 비밀번호 재설정 · 재설정 API 연결 — 대기
- 백엔드 끝: `POST /email-certifications/{emlCertSn}/password-reset`(`pswdInitTkn`·`pswd`·`pswdCnfrm`, 성공 200 데이터 없음), 취소는 `POST /email-certifications/{emlCertSn}/invalidate` (백엔드 SCR-ACC-012 절의 "프론트 연결")
- 기능: 명세 기능 ID 추가 없음. FN-ACC-012-01~06에 걸친다
- 대상: `features/member/password/`와 `features/member/api.js`의 가짜 `resetPassword`. 인증 확인 응답의 `emlCertSn`·`pswdInitTkn`·`initAuthrtExpryDt`를 메모리로 넘기고(URL에 넣지 않는다), 토큰이 없거나 `initAuthrtExpryDt`가 지났거나 400 `PASSWORD_RESET_NOT_AVAILABLE`이면 만료 화면, 400 `PASSWORD_MISMATCH`·`INVALID_INPUT_VALUE`는 입력칸 오류, 취소는 `invalidate`(본문 `certTrgtEml`). 성공해도 자동 로그인하지 않는다
- 기다리는 것: 이 백엔드 작업(YAY SCR-ACC-012)의 PR 병합과 공유 `application.properties`의 열린 경로 추가
- 완료 조건: 실제 서버로 인증 확인 → 새 비밀번호 저장 → 로그인 화면으로 가고, 같은 토큰 재사용·만료·취소 뒤에는 만료 화면이 나온다

## 제외
- 없음. 외부인증창 참고 행 6개(네이버·카카오·구글 외부 로그인·동의 창)는 명세에 기능 ID가 없다

## 대조
- 로그인·회원가입: 명세 101 = 마일스톤 101 + 제외 0 (ACC-002 이메일 16, ACC-011 10, ACC-012 9, ACC-001 이메일 36, SNS 6, 재가입 복구 9, ACC-020 15)
- 플레이스: 명세 33 = 마일스톤 33 + 제외 0
- 메인페이지: 명세 9 = 마일스톤 9 + 제외 0
