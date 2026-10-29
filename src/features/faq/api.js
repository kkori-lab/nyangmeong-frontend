/**
 * [FAQ 가짜 응답]
 * - FAQ API(KSJ 백엔드) 연결 전: api.get()으로 교체
 * - 키(faqSn·faqClsfNm·qstnCn·ansCn): Swagger 전 가정
 * - 분류(faqClsfNm)는 FAQ_CATEGORIES의 글자 그대로 오는 것으로 가정
 */
export const FAQ_CATEGORIES = ['이용방법', '계정', '신고 · 제재', '기타'];

const designFaqs = [
  [
    '이용방법',
    '건강기록은 어떻게 등록하나요?',
    '건강 메뉴에서 반려동물을 고른 뒤 기록하기를 눌러 체중 · 식사 · 배변 · 병원 기록을 남길 수 있어요.\n1. 건강 > 건강기록으로 이동해요\n2. 기록할 반려동물을 선택해요\n3. 항목을 고르고 내용을 입력한 뒤 저장해요\n저장한 기록은 날짜별로 모아 보고, 그래프로 변화를 확인할 수 있어요.',
  ],
  [
    '신고 · 제재',
    '신고한 게시글은 언제 처리되나요?',
    '신고가 접수되면 운영팀이 영업일 기준 1~2일 안에 검토해요. 운영 정책 위반이 확인되면 게시글을 숨기고 작성자에게 제재를 안내해요.\n처리 결과는 알림으로 알려 드려요.',
  ],
  [
    '계정',
    '비밀번호를 잊어버렸어요',
    '로그인 화면의 비밀번호 찾기에서 가입한 이메일을 입력하면 재설정 링크를 보내 드려요. 메일이 오지 않으면 스팸함을 먼저 확인해 주세요.\n소셜 계정(카카오 · 네이버)으로 가입했다면 해당 서비스에서 비밀번호를 바꿔야 해요.',
  ],
  [
    '이용방법',
    '인기글 랭킹은 어떻게 산정되나요?',
    '최근 7일 동안 받은 좋아요 · 댓글 · 조회수를 합산해 순위를 정해요. 같은 사용자의 반복 조회는 한 번만 반영돼요.',
  ],
  [
    '기타',
    '글쓰기는 비회원도 가능한가요?',
    '글 읽기는 누구나 할 수 있지만, 글쓰기 · 댓글 · 좋아요는 회원만 이용할 수 있어요. 안전한 커뮤니티를 위해 로그인 후 이용해 주세요.',
  ],
  [
    '이용방법',
    '케어미션 포인트는 언제 적립되나요?',
    '케어미션을 완료하면 바로 적립돼요. 하루에 받을 수 있는 포인트에는 한도가 있으며, 적립 내역은 마이페이지 > 포인트에서 확인할 수 있어요.',
  ],
  [
    '계정',
    '회원 탈퇴는 어떻게 하나요?',
    '마이페이지 > 계정 관리 맨 아래의 회원 탈퇴에서 진행할 수 있어요. 탈퇴하면 건강기록 · 포인트 · 작성한 글이 모두 삭제되고 되돌릴 수 없어요.',
  ],
  [
    '신고 · 제재',
    '게시글이 숨김 처리됐어요. 이의를 제기할 수 있나요?',
    '숨김 처리 알림을 받은 날부터 7일 안에 1:1 문의로 이의를 신청할 수 있어요. 운영팀이 다시 검토한 뒤 결과를 알려 드려요.',
  ],
  [
    '이용방법',
    '반려동물을 여러 마리 등록할 수 있나요?',
    '네, 마이페이지 > 반려동물 관리에서 최대 10마리까지 등록할 수 있어요. 건강기록과 케어미션은 반려동물마다 따로 관리돼요.',
  ],
  [
    '기타',
    '앱 알림이 오지 않아요',
    '휴대폰 설정에서 냥멍케어 알림이 켜져 있는지 확인해 주세요. 앱 안의 마이페이지 > 알림 설정에서도 받을 알림을 고를 수 있어요.',
  ],
];

/** 2쪽 이후를 채우는 자리 채움 */
const fillerFaqs = Array.from({ length: 15 }, (_, index) => [
  FAQ_CATEGORIES[index % FAQ_CATEGORIES.length],
  `자주 묻는 질문 ${index + 11}`,
  `자주 묻는 질문 ${index + 11}의 답변이에요.`,
]);

const fakeFaqs = [...designFaqs, ...fillerFaqs].map(
  ([faqClsfNm, qstnCn, ansCn], index) => ({
    faqSn: index + 1,
    faqClsfNm,
    qstnCn,
    ansCn,
  }),
);

/** 공백을 뺀 질문·답변에 검색어가 들어 있는지 */
const matchesKeyword = (item, keyword) => {
  const target = (item.qstnCn + item.ansCn).replace(/\s/g, '').toLowerCase();
  return target.includes(keyword.replace(/\s/g, '').toLowerCase());
};

export const getFaqs = ({
  page = 1,
  size = 10,
  category = '',
  keyword = '',
} = {}) => {
  const matched = fakeFaqs.filter(
    (item) =>
      (!category || item.faqClsfNm === category) &&
      matchesKeyword(item, keyword.trim()),
  );
  const totalPages = Math.ceil(matched.length / size);
  return Promise.resolve({
    content: matched.slice((page - 1) * size, page * size),
    page,
    size,
    totalElements: matched.length,
    totalPages,
    hasNext: page < totalPages,
  });
};
