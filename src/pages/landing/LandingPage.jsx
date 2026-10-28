import { useLocation } from 'react-router-dom';
import CountSection from '@/features/landing/CountSection';
import FaqSection from '@/features/landing/FaqSection';
import HeroSlider from '@/features/landing/HeroSlider';
import LandingFooter from '@/features/landing/LandingFooter';
import LandingHeader from '@/features/landing/LandingHeader';
import PartnersSection from '@/features/landing/PartnersSection';
import ProcessSection from '@/features/landing/ProcessSection';
import ServiceSection from '@/features/landing/ServiceSection';
import { PATHS } from '@/routes/paths';

export default function LandingPage() {
  const { search } = useLocation();
  const redirect = new URLSearchParams(search).get('redirect');
  const loginTo = redirect
    ? `${PATHS.LOGIN}?redirect=${encodeURIComponent(redirect)}`
    : PATHS.LOGIN;

  return (
    <div className="min-h-dvh bg-white">
      <LandingHeader loginTo={loginTo} />
      <main>
        <HeroSlider />
        <ServiceSection />
        <ProcessSection />
        <PartnersSection />
        <CountSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}
