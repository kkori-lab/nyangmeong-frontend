/** 처리 상태(CSCG03) */
export const INQUIRY_STATUS_OPTIONS = [
  { value: 'CSCC0012', label: '미답변' },
  { value: 'CSCC0013', label: '답변 완료' },
];

/** 내부 분류: 유형에 따라 서버가 정한다 */
export const INQUIRY_CATEGORY_OPTIONS = [
  { value: 'DISPUTE', label: '분쟁' },
  { value: 'ERROR', label: '오류' },
  { value: 'ETC', label: '기타' },
];

/** 픽셀 캐릭터 문의 유형(CSCG02) */
export const INQUIRY_TYPE_PIXEL_CHARACTER = 'CSCC0006';

/** 캐릭터 오류 처리 결과(CHRG04) */
export const CHARACTER_ERROR_OPTIONS = [
  {
    value: 'CHRC0008',
    label: '무료 재생성',
    description:
      '캐릭터를 무료로 다시 만들어요. 생성이 끝나면 회원에게 알림이 가요.',
  },
  {
    value: 'CHRC0009',
    label: '원래 캐릭터 복원',
    description: '캐릭터를 원래대로 되돌리고 회원에게 바로 알림을 보내요.',
  },
];

/** 값에 맞는 이름, 없으면 값 그대로 */
export const getOptionLabel = (options, value) =>
  options.find((option) => option.value === value)?.label ?? value;
