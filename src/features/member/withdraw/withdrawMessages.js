/** 탈퇴 확인 문구. 띄어쓰기·마침표까지 그대로 비교한다(trim 하지 않음) */
export const WITHDRAW_PHRASE = '정말로 탈퇴하겠습니다.';

export const WITHDRAW_MESSAGES = {
  noticeCheck: '탈퇴 시 이용 종료와 정보 처리 내용을 확인했습니다.',
  noticeRequired: '탈퇴 안내를 확인하고 체크해 주세요.',
  petsError: '반려동물 정보를 불러오지 못했습니다.',
  phraseEmpty: '탈퇴 확인 문구를 입력해 주세요.',
  phraseMismatch:
    '확인 문구가 일치하지 않습니다. 띄어쓰기와 마침표까지 확인해 주세요.',
  phraseMatch: '문구가 일치합니다.',
  failed: '탈퇴를 처리하지 못했습니다. 계정은 유지됩니다.',
  failedGuide: '탈퇴를 처리하지 못했습니다. 다시 시도해 주세요.',
  checking: '탈퇴 처리 결과를 확인하고 있습니다.',
};
