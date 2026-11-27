import { NotebookPen, Sparkles, Stethoscope } from 'lucide-react';
import banner1 from '@/assets/landing/top/MainBanner1.webp';
import banner2 from '@/assets/landing/top/MainBanner2.webp';
import banner3 from '@/assets/landing/top/MainBanner3.webp';
import banner4 from '@/assets/landing/top/MainBanner4.webp';
import card1 from '@/assets/landing/service/card1.webp';
import card2 from '@/assets/landing/service/card2.webp';
import card3 from '@/assets/landing/service/card3.webp';
import card4 from '@/assets/landing/service/card4.webp';
import card5 from '@/assets/landing/service/card5.webp';
import card6 from '@/assets/landing/service/card6.webp';
import card7 from '@/assets/landing/service/card7.webp';
import step1 from '@/assets/landing/process/step1.gif';
import step2 from '@/assets/landing/process/step2.gif';
import step3 from '@/assets/landing/process/step3.gif';
import step4 from '@/assets/landing/process/step4.gif';
import healthScreen from '@/assets/landing/phone/health.png';

/** 랜딩 진입 팝업(PortfolioModal)의 팀 저장소 */
export const GITHUB_REPOS = [
  { name: 'Frontend', url: 'https://github.com/kkori-lab/nyangmeong-frontend' },
  { name: 'Backend', url: 'https://github.com/kkori-lab/nyangmeong-backend' },
  { name: 'AI', url: 'https://github.com/kkori-lab/nyangmeong-ai' },
  {
    name: 'Character',
    url: 'https://github.com/kkori-lab/nyangmeong-character',
  },
];

export const LANDING_NAV = [
  { name: '서비스 소개', id: 'service' },
  { name: '서비스 과정', id: 'process' },
  { name: 'pawever 데이터', id: 'stats' },
  { name: '자주 묻는 질문', id: 'features' },
];

export const HERO_SLIDES = [
  {
    image: banner1,
    sub: 'pawever',
    title1: '우리 아이의 건강을',
    title2: '한곳에 기록해요',
    desc: [
      '체중·식사·음수·산책부터 검진·처방까지',
      '반려동물의 하루를 차곡차곡 모아 드려요',
    ],
  },
  {
    image: banner2,
    sub: 'pawever',
    title1: '궁금한 건 말로 물어보세요',
    title2: 'AI 매니저가 찾아줘요',
    desc: [
      '체중 변화, 다음 접종, 근처 동물병원까지',
      '대화로 묻고 바로 확인할 수 있어요',
    ],
  },
  {
    image: banner3,
    sub: 'pawever',
    title1: '매일의 케어가',
    title2: '미션이 됩니다',
    desc: ['식사·음수·산책·약 복용을 체크하고', '포인트도 함께 모아 보세요'],
  },
  {
    image: banner4,
    sub: 'pawever',
    title1: '병원부터 이웃까지',
    title2: '함께하는 반려생활',
    desc: ['근처 플레이스와 커뮤니티, 실종센터까지', 'pawever 안에서 이어져요'],
  },
];

/** 카드 그림은 테스트 계정으로 찍은 모바일(390) 화면 */
export const SERVICE_CARDS = [
  {
    src: card1,
    title: '건강 일지',
    desc: '체중·식사·산책 변화를 그래프로 한눈에 봐요.',
  },
  {
    src: card2,
    title: '케어 캘린더',
    desc: '병원·접종·투약 일정을 아이별로 모아 챙겨요.',
  },
  {
    src: card3,
    title: '데일리 케어미션',
    desc: '매일의 케어를 체크하고 포인트를 모아요.',
  },
  {
    src: card7,
    title: '픽셀 캐릭터',
    desc: '우리 아이를 닮은 도트 캐릭터를 만들고 아이템으로 꾸며요.',
  },
  {
    src: card4,
    title: '나만의 가계부',
    desc: '사료부터 병원비까지 이번 달 지출을 관리해요.',
  },
  {
    src: card5,
    title: '펫이야기',
    desc: '보호자들과 사진과 돌봄 팁을 나눠요.',
  },
  {
    src: card6,
    title: '플레이스',
    desc: '근처 동물병원·미용실·동반 장소를 지도로 찾아요.',
  },
];

export const PROCESS_STEPS = [
  {
    step: 'STEP 01',
    title: 'pawever 회원가입',
    description: '이메일 인증이나 SNS 계정으로 간편하게 가입해요.',
    icon: step1,
  },
  {
    step: 'STEP 02',
    title: '반려동물 등록',
    description:
      '이름·품종·생일을 입력하고, 사진으로 나만의 픽셀 캐릭터를 만들어요.',
    icon: step2,
  },
  {
    step: 'STEP 03',
    title: '건강기록 작성',
    description:
      '체중·식사·산책과 검진·처방을 기록하면 AI가 분석해 리포트로 알려줘요.',
    icon: step3,
  },
  {
    step: 'STEP 04',
    title: '미션 및 일상 공유',
    description:
      '데일리 케어미션으로 포인트를 모으고, 커뮤니티에서 이웃과 일상을 나눠요.',
    icon: step4,
  },
];

/** 폰 목업 안 화면(종합 건강기록 대시보드를 390 폭으로 캡처) */
export const PHONE_SCREEN = healthScreen;

/**
 * 폰 밖으로 한 번씩 튀어나오는 큰 기능 카드. 값과 AI 문구는 폰 안 캡처 화면(로컬 테스트 계정 탄이)에서 가져왔다
 * - rows: 라벨/값 줄, lead·note: 큰 문장과 보조 문장, dir: 튀어나오는 쪽(-1 왼쪽, 1 오른쪽)
 * - pos: 폰 기준 위치(작은 화면 / 큰 화면)
 */
export const PHONE_CARDS = [
  {
    icon: NotebookPen,
    title: '매일 기록',
    rows: [
      { label: '체중', value: '5.3kg' },
      { label: '식사량', value: '88g' },
      { label: '음수량', value: '320ml' },
    ],
    dir: -1,
    pos: 'top-[10%] -left-[22%] lg:-left-[58%]',
  },
  {
    icon: Sparkles,
    title: 'AI 건강분석 리포트',
    lead: '건강을 잘 지키고 있어요',
    note: '식사량과 음수량이 함께 늘고 있으니 지금 루틴을 이어 가세요.',
    dir: 1,
    pos: 'top-[38%] -right-[22%] lg:-right-[38%]',
  },
  {
    icon: Stethoscope,
    title: '검진·처방',
    rows: [
      { label: '최근 검진', value: '171일 전' },
      { label: '현재 처방', value: '0건' },
    ],
    dir: -1,
    pos: 'top-[64%] -left-[22%] lg:-left-[58%]',
  },
];

/** 값은 화면 구성용 샘플 */
export const COUNT_DATA = [
  { label: '가입자 수', value: 1586, unit: '명' },
  { label: '등록된 반려동물', value: 1050, unit: '마리' },
  { label: '커뮤니티 글', value: 2450, unit: '건' },
  { label: '건강·케어 기록', value: 1041, unit: '건' },
];

export const FAQS = [
  {
    question: 'pawever는 무료로 사용할 수 있나요?',
    answer:
      'pawever는 이메일 또는 SNS 계정으로 간편하게 가입할 수 있으며 누구에게나 무료로 제공됩니다.',
  },
  {
    question: '반려동물을 여러 마리 등록하고 가족과 같이 관리할 수 있나요?',
    answer:
      '반려동물은 여러 마리 등록할 수 있어요. 마이페이지에서 가족을 공동양육자로 초대하면 건강기록을 함께 볼 수 있고, 공동양육자는 읽기 전용으로 이용해요.',
  },
  {
    question: '병원 정보는 어디서 확인하나요?',
    answer:
      '플레이스에서 병원·미용·용품·동반·호텔을 지도로 찾을 수 있어요. 진료 중 여부와 24시·응급 같은 태그, 내 위치에서의 거리, 즐겨찾기도 함께 확인할 수 있어요.',
  },
  {
    question: 'AI 매니저는 무엇을 도와주나요?',
    answer:
      '체중 변화나 다음 접종 일정을 물어보거나 근처 동물병원을 찾아 달라고 하면 해당 화면으로 안내해 드려요. 영수증 사진으로 가계부를 기록하는 것도 도와줘요.',
  },
];
