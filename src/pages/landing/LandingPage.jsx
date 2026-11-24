import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import CountSection from '@/features/landing/CountSection';
import FaqSection from '@/features/landing/FaqSection';
import HeroSlider from '@/features/landing/HeroSlider';
import LandingFooter from '@/features/landing/LandingFooter';
import LandingHeader from '@/features/landing/LandingHeader';
import PartnersSection from '@/features/landing/PartnersSection';
import PortfolioModal from '@/features/landing/PortfolioModal';
import ProcessSection from '@/features/landing/ProcessSection';
import ServiceSection from '@/features/landing/ServiceSection';
import { PATHS } from '@/routes/paths';

export default function LandingPage() {
  const { search } = useLocation();
  const [heroKey, setHeroKey] = useState(0);
  /** 랜딩에 들어올 때마다 포트폴리오 안내를 띄운다 */
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(true);
  const redirect = new URLSearchParams(search).get('redirect');
  const loginTo = redirect
    ? `${PATHS.LOGIN}?redirect=${encodeURIComponent(redirect)}`
    : PATHS.LOGIN;

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
        <PartnersSection />
        <CountSection />
        <FaqSection />
      </main>
      <LandingFooter />
      {isPortfolioOpen && (
        <PortfolioModal
          redirect={redirect}
          onClose={() => setIsPortfolioOpen(false)}
        />
      )}
    </div>
  );
}
