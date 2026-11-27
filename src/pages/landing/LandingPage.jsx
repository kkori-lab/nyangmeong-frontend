import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEMO_ACCOUNTS } from '@/api/env';
import { showToast } from '@/components/toastStore';
import CountSection from '@/features/landing/CountSection';
import FaqSection from '@/features/landing/FaqSection';
import HeroSlider from '@/features/landing/HeroSlider';
import LandingFooter from '@/features/landing/LandingFooter';
import LandingHeader from '@/features/landing/LandingHeader';
import HealthShowcaseSection from '@/features/landing/HealthShowcaseSection';
import PortfolioModal from '@/features/landing/PortfolioModal';
import ProcessSection from '@/features/landing/ProcessSection';
import ServiceSection from '@/features/landing/ServiceSection';
import { useFetchMe, useLogin } from '@/features/member/queries';
import { PATHS } from '@/routes/paths';
import { getLoginDestination } from '@/routes/redirect';

export default function LandingPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const login = useLogin();
  const fetchMe = useFetchMe();
  /** 팝업에서 바로 로그인 중인 데모 역할(member·admin) */
  const [demoKey, setDemoKey] = useState(null);
  const [heroKey, setHeroKey] = useState(0);
  /** 랜딩에 들어올 때마다 포트폴리오 안내를 띄운다 */
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(true);
  const redirect = new URLSearchParams(search).get('redirect');
  const loginTo = redirect
    ? `${PATHS.LOGIN}?redirect=${encodeURIComponent(redirect)}`
    : PATHS.LOGIN;

  /** 바로 로그인하지 못하면 전처럼 이메일 로그인 화면으로(데모 계정을 칸에 채움, LoginPage) */
  const goEmailLogin = (key) => {
    const params = new URLSearchParams({ method: 'email' });
    if (key === 'member' && redirect) params.set('redirect', redirect);
    navigate(`${PATHS.LOGIN}?${params}`, { state: { demo: key } });
  };

  /**
   * 팝업 데모 로그인: 그 역할의 데모 계정으로 바로 로그인하고 역할 홈으로(회원은 ?redirect= 유지, 관리자는 관리자 홈)
   * - 데모 값이 없거나 로그인 오류(보안코드 요구 등)면 로그인 화면으로
   */
  const handleDemoLogin = (key) => {
    const account = DEMO_ACCOUNTS[key];
    if (!account?.email || !account?.password) {
      goEmailLogin(key);
      return;
    }
    setDemoKey(key);
    login.mutate(
      { acntEml: account.email, pswd: account.password },
      {
        onSuccess: async () => {
          let mbrAuthrtCd;
          try {
            ({ mbrAuthrtCd } = await fetchMe());
          } catch {
            /** 역할 조회 실패: 회원 기준 이동 */
          }
          const redirectSearch = redirect
            ? `?${new URLSearchParams({ redirect })}`
            : '';
          navigate(getLoginDestination(mbrAuthrtCd, redirectSearch), {
            replace: true,
          });
        },
        onError: () => {
          setDemoKey(null);
          showToast('바로 로그인하지 못해 로그인 화면으로 옮겼어요', {
            type: 'error',
          });
          goEmailLogin(key);
        },
      },
    );
  };

  return (
    <div className="min-h-dvh bg-white">
      <LandingHeader
        loginTo={loginTo}
        onHome={() => setHeroKey((key) => key + 1)}
      />
      <main>
        {/* 로고를 누르면 key가 바뀌어 슬라이드가 첫 장부터 다시 시작한다 */}
        <HeroSlider key={heroKey} />
        <ServiceSection />
        <ProcessSection />
        <HealthShowcaseSection />
        <CountSection />
        <FaqSection />
      </main>
      <LandingFooter />
      {isPortfolioOpen && (
        <PortfolioModal
          pendingKey={demoKey}
          onDemoLogin={handleDemoLogin}
          onClose={() => setIsPortfolioOpen(false)}
        />
      )}
    </div>
  );
}
