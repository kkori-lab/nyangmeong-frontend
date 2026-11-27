/**
 * 확인 카드(ACTION) 칸의 표시 이름: 칸 이름은 Java 요청 DTO 그대로(ai 저장소 docs/api/chat.md ActionCard)
 * - 계약에 표시 이름이 없어 도구들의 칸을 여기에 둔다, 없는 칸은 칸 이름을 그대로 보인다
 */
export const ACTION_FIELD_NAMES = {
  petSn: '반려동물',
  /** 건강 일지 */
  dailyRcdIdctCd: '기록 지표',
  rcdDt: '기록 일시',
  rcdNvl: '수치',
  crsdSttsCd: '상태',
  /** 월 지출 한도 */
  mmExpndLimAmt: '월 지출 한도(원)',
  /** 일정 */
  schdlKndCd: '일정 종류',
  schdlDt: '일정 일시',
  hrInptYn: '시간 입력',
  ckupTypeCd: '검진유형',
  hsptlNm: '병원명',
  schdlNm: '일정명',
  memoCn: '메모',
  cldrBadgeColrCd: '캘린더 뱃지 색상',
  /** 케어 항목 */
  careArtclNm: '항목명',
  rprsIconId: '대표 아이콘',
  careZoneCd: '반복 유형',
  careCycleCd: '주기',
  cycleDrctInptDayCnt: '주기(일)',
  lastCmptnYmd: '마지막으로 한 날',
  /** 지출 */
  expndYmd: '지출일',
  expndClsfCd: '분류',
  common: '공통 지출',
  expndAmt: '금액(원)',
  dtlMttr: '상세 내용',
  expndPlcusNm: '사용처',
  /** 반려동물 */
  petNm: '이름',
  petSeCd: '종류',
  vrtyDrctInptNm: '품종(직접 입력)',
  petBrdt: '생일',
  chipNo: '동물등록번호',
  petGndrCd: '성별',
  nutrYn: '중성화',
  bdwgRngDrctInptYn: '체중 범위 직접 입력',
  petBdwg: '몸무게(kg)',
  goalBdwg: '목표 몸무게(kg)',
  minBdwg: '최소 몸무게(kg)',
  maxBdwg: '최대 몸무게(kg)',
  colrCd: '털색',
  colrDrctInptNm: '털색(직접 입력)',
  chrcCn: '특징',
  algyCn: '알레르기',
  dssCn: '질환',
  goalBdwgReset: '목표 몸무게 초기화',
  /** 검진기록·처방·기타 검사·반복 예방 등록(2026-11-27) */
  ckupYmd: '검진일',
  reptPrvntArtclCd: '예방 항목',
  reptCycleCd: '주기',
  bgngYmd: '시작일',
  /** 검사 수치 */
  ckupRcdSn: '검진기록',
  values: '검사 수치',
  inspArtclCd: '항목',
  inspArtclDrctInptNm: '항목(직접 입력)',
  rsltNvl: '수치',
  unitNm: '단위',
  refLlmtNvl: '참고 하한',
  refUplmtNvl: '참고 상한',
  /** 지속 관찰 항목 */
  obsrvArtclNm: '항목 이름',
  obsrvRegnCd: '부위',
  obsrvRegnDtlNm: '세부 위치',
  obsrvDt: '관찰 일시',
  obsrvSz: '크기',
  file: '사진',
  /** 수정 카드(2026-11-25): 건강기록 입력 창과 같은 이름 */
  ckupCn: '검진 내용',
  ckupMemoCn: '검진 메모',
  mdcnNm: '약품명',
  mdcnBgngYmd: '복용 시작일',
  mdcnEndYmd: '복용 종료일',
  dayMdcnNmtm: '1일 복용 횟수',
  prscSttsCd: '복용 상태',
  careRfltYn: '주기 체크',
  inspNm: '검사명',
  inspRsltCn: '검사 결과',
  refRange: '참고 범위',
  obsrvChgCd: '변화',
};

/** 칸 표시 이름 */
export const actionFieldName = (field) => ACTION_FIELD_NAMES[field] ?? field;
