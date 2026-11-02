/**
 * [관리자 사이드바 메뉴]
 * - IA 구조도 v0.3 '총관리자': 1차 12개(대시보드 + 묶음 11개)
 * - pathKey: PATHS의 키 -> 키가 PATHS에 생긴 메뉴만 그림
 */
export const ADMIN_MENUS = [
  { label: '대시보드', screenId: 'SCR-ADM-001', pathKey: 'ADMIN' },
  {
    label: '회원 관리',
    items: [
      { label: '회원 목록', screenId: 'SCR-ADM-010', pathKey: 'ADMIN_MEMBERS' },
      {
        label: '회원 제재',
        screenId: 'SCR-ADM-012',
        pathKey: 'ADMIN_MEMBER_SUSPENSIONS',
      },
      {
        label: '탈퇴 회원',
        screenId: 'SCR-ADM-013',
        pathKey: 'ADMIN_MEMBERS_WITHDRAWN',
      },
    ],
  },
  {
    label: '커뮤니티 관리',
    items: [
      { label: '게시글·댓글', screenId: 'SCR-ADM-020', pathKey: 'ADMIN_POSTS' },
      {
        label: '실종제보',
        screenId: 'SCR-ADM-021',
        pathKey: 'ADMIN_LOST_REPORTS',
      },
      {
        label: '펫돌봄 거래',
        screenId: 'SCR-ADM-022',
        pathKey: 'ADMIN_CARE_MATCHES',
      },
      {
        label: '노출 콘텐츠',
        screenId: 'SCR-ADM-023',
        pathKey: 'ADMIN_EXPOSURE',
      },
    ],
  },
  {
    label: '신고 관리',
    items: [
      { label: '신고 처리', screenId: 'SCR-ADM-030', pathKey: 'ADMIN_REPORTS' },
    ],
  },
  {
    label: '고객센터 관리',
    items: [
      { label: '공지사항', screenId: 'SCR-ADM-040', pathKey: 'ADMIN_NOTICES' },
      { label: 'FAQ', screenId: 'SCR-ADM-041', pathKey: 'ADMIN_FAQS' },
      {
        label: '1:1 문의',
        screenId: 'SCR-ADM-042',
        pathKey: 'ADMIN_INQUIRIES',
      },
    ],
  },
  {
    label: '콘텐츠 관리',
    items: [
      { label: '펫뉴스', screenId: 'SCR-ADM-050', pathKey: 'ADMIN_NEWS' },
      { label: '약관', screenId: 'SCR-ADM-051', pathKey: 'ADMIN_TERMS' },
    ],
  },
  {
    label: '장소 관리',
    items: [
      { label: '장소', screenId: 'SCR-ADM-060', pathKey: 'ADMIN_PLACES' },
    ],
  },
  {
    label: '캐릭터·리워드',
    items: [
      { label: '아이템', screenId: 'SCR-ADM-070', pathKey: 'ADMIN_ITEMS' },
      {
        label: '케어미션',
        screenId: 'SCR-ADM-071',
        pathKey: 'ADMIN_CARE_MISSIONS',
      },
      { label: '포인트', screenId: 'SCR-ADM-072', pathKey: 'ADMIN_POINTS' },
      {
        label: '기본 캐릭터',
        screenId: 'SCR-ADM-073',
        pathKey: 'ADMIN_DEFAULT_CHARACTERS',
      },
    ],
  },
  {
    label: 'AI 운영',
    items: [
      {
        label: '라우팅 매핑표',
        screenId: 'SCR-ADM-080',
        pathKey: 'ADMIN_AI_ROUTES',
      },
      {
        label: '키워드 사전',
        screenId: 'SCR-ADM-081',
        pathKey: 'ADMIN_AI_KEYWORDS',
      },
      {
        label: '처리 현황',
        screenId: 'SCR-ADM-082',
        pathKey: 'ADMIN_PROCESSING',
      },
    ],
  },
  {
    label: '알림 관리',
    items: [
      {
        label: '알림 템플릿',
        screenId: 'SCR-ADM-090',
        pathKey: 'ADMIN_NOTIFICATION_TEMPLATES',
      },
      {
        label: '발송 이력',
        screenId: 'SCR-ADM-091',
        pathKey: 'ADMIN_NOTIFICATION_LOGS',
      },
    ],
  },
  {
    label: '기준정보',
    items: [
      { label: '공통코드', screenId: 'SCR-ADM-100', pathKey: 'ADMIN_CODES' },
      {
        label: '품종·지역',
        screenId: 'SCR-ADM-101',
        pathKey: 'ADMIN_BREEDS_REGIONS',
      },
    ],
  },
  {
    label: '시스템',
    items: [
      {
        label: '운영 설정',
        screenId: 'SCR-ADM-110',
        pathKey: 'ADMIN_SETTINGS',
      },
      {
        label: '배치 현황',
        screenId: 'SCR-ADM-111',
        pathKey: 'ADMIN_BATCHES',
      },
      {
        label: '외부 API 사용량',
        screenId: 'SCR-ADM-112',
        pathKey: 'ADMIN_EXTERNAL_API_USAGE',
      },
      {
        label: '관리자 계정',
        screenId: 'SCR-ADM-113',
        pathKey: 'ADMIN_ADMINS',
      },
      {
        label: '감사 로그',
        screenId: 'SCR-ADM-114',
        pathKey: 'ADMIN_AUDIT_LOGS',
      },
    ],
  },
];
