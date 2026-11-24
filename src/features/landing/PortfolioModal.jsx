import { ArrowRight, ShieldCheck, UserRound, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoWhite from '@/assets/logo-white.svg';
import Modal from '@/components/Modal';
import { PATHS } from '@/routes/paths';
import { GITHUB_REPOS, HERO_SLIDES } from './landingData';

const TITLE = 'pawever를 체험해 보세요';

/** lucide 1.x에는 브랜드 아이콘이 없어 GitHub 마크를 직접 그린다 */
function GithubLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

/** 회원은 랜딩 푸터와 같은 초록 카드, 관리자는 랜딩 섹션 바탕(#f7f7f4) 카드 */
const LOGIN_CARDS = [
  {
    key: 'member',
    icon: UserRound,
    title: '회원 로그인',
    desc: '건강 기록·AI 매니저를 체험합니다.',
    card: 'bg-brand-600 text-white hover:bg-brand-900',
    iconWrap: 'bg-white/15',
  },
  {
    key: 'admin',
    icon: ShieldCheck,
    title: '관리자 로그인',
    desc: '회원·게시글·운영 관리를 체험합니다.',
    card: 'bg-[#f7f7f4] text-black hover:bg-[#efefea]',
    iconWrap: 'bg-white text-brand-600',
  },
];

/** 랜딩 섹션 머리(SectionTitle)와 같은 영어 대문자 라벨 */
function GroupLabel({ children }) {
  return (
    <p className="mb-3 text-[13px] font-medium tracking-wider text-[#2c6669] uppercase max-[760px]:mb-2 max-[760px]:text-[12px]">
      {children}
    </p>
  );
}

/**
 * 랜딩 진입 때 뜨는 포트폴리오 안내. 위는 히어로 사진 배너, 아래는 팀 저장소 4개와 로그인 입구 2개.
 * 로그인 카드는 이메일 로그인 화면으로 가며 이동 state의 demo(member·admin)로 데모 계정을 칸에 미리 채운다(LoginPage).
 * 관리자는 로그인하면 역할에 따라 관리자 홈으로 가므로(getLoginDestination) redirect를 붙이지 않는다
 */
export default function PortfolioModal({ redirect, onClose }) {
  const loginPaths = {
    member: `${PATHS.LOGIN}?${new URLSearchParams({ method: 'email', ...(redirect && { redirect }) })}`,
    admin: `${PATHS.LOGIN}?method=email`,
  };

  return (
    <Modal
      title={TITLE}
      width={720}
      isLarge
      isAutoHeight
      isHeaderHidden
      isSheetDisabled
      onClose={onClose}
    >
      {/* 로그인 화면 사진 칸처럼 모달 가장자리까지 꽉 채운 사진 + 랜딩 히어로 같은 어두운 막·흰 글자 */}
      <div className="relative h-[140px] shrink-0 bg-black md:h-[320px]">
        <img
          src={HERO_SLIDES[1].image}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/35 to-black/20" />
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-4 right-4 grid size-8 place-items-center rounded-full bg-white/70 text-black transition-colors hover:bg-white"
        >
          <X className="size-4" />
        </button>
        {/*
            라벨·로고·제목이 눈으로 같은 간격이 되게: 글자 줄 높이 여백을 없애고(leading-none) gap으로 띄운다.
            로고는 "p" 꼬리만큼 아래가 비어 보여 제목을 그만큼(6px) 끌어올린다
          */}
        <div className="absolute inset-x-6 bottom-6 flex flex-col items-start gap-3 text-white max-[760px]:bottom-4 max-[760px]:gap-2.5 [&>img+p]:-mt-1.5">
          <p className="text-[13px] leading-none font-medium tracking-wider text-[#5cd1d6] uppercase">
            Portfolio Project
          </p>
          <img
            src={logoWhite}
            alt="pawever"
            className="h-7 w-auto max-[760px]:h-6"
          />
          <p
            aria-hidden="true"
            className="text-[20px] leading-none font-extrabold break-keep md:text-[30px]"
          >
            {TITLE}
          </p>
        </div>
      </div>

      <div className="px-6 pt-5 pb-8 max-[760px]:px-5 max-[760px]:pt-4 max-[760px]:pb-5 md:pb-10">
        <p className="text-[15px] leading-relaxed break-keep text-[#555555] max-[760px]:text-[13px]">
          반려동물의 건강 기록부터 케어미션, AI 매니저, 커뮤니티까지 한곳에 모은
          반려생활 서비스입니다. 역할을 골라 로그인하면 실제 기능을 확인할 수
          있습니다.
        </p>

        <div className="mt-6 max-[760px]:mt-4">
          <GroupLabel>Login</GroupLabel>
          <div className="grid gap-2 min-[760px]:grid-cols-2 min-[760px]:gap-3">
            {LOGIN_CARDS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  to={loginPaths[item.key]}
                  state={{ demo: item.key }}
                  className={`group flex items-center gap-4 rounded-[20px] px-5 py-4 transition-colors max-[760px]:gap-3 max-[760px]:rounded-2xl max-[760px]:px-4 max-[760px]:py-3 ${item.card}`}
                >
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-full max-[760px]:size-9 ${item.iconWrap}`}
                  >
                    <Icon
                      className="size-5 max-[760px]:size-4"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-bold max-[760px]:text-[15px]">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-5 break-keep opacity-75 max-[760px]:text-[12px] max-[760px]:leading-4">
                      {item.desc}
                    </span>
                  </span>
                  <ArrowRight
                    className="size-5 shrink-0 transition-transform group-hover:translate-x-1 max-[760px]:size-4"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-6 max-[760px]:mt-4">
          <GroupLabel>GitHub</GroupLabel>
          {/* 랜딩 헤더 [로그인]과 같은 알약 버튼 */}
          <ul className="grid grid-cols-2 gap-2 min-[760px]:grid-cols-4">
            {GITHUB_REPOS.map(({ name, url }) => (
              <li key={name}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-line text-[13px] max-[760px]:h-9 max-[760px]:text-[12px] font-semibold text-ink transition-colors hover:border-brand-600 hover:text-brand-600"
                >
                  <GithubLogo />
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-[13px] break-keep text-[#999999] max-[760px]:mt-4 max-[760px]:text-[11px]">
          데모 계정은 입력만 제공되며, 로그인 버튼을 직접 눌러야 접속됩니다.
        </p>
      </div>
    </Modal>
  );
}
