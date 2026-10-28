import FadeIn from './FadeIn';
import logo from '@/assets/landing/MainLogo.svg';
import petImage from '@/assets/landing/petImage.png';

export default function LandingFooter() {
  return (
    <footer
      id="contact"
      className="w-full scroll-mt-20 bg-brand-600 px-6 py-12 md:px-10 md:py-16 lg:py-20"
    >
      <FadeIn className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-12">
        <div className="justify-self-start">
          <img
            src={logo}
            alt="냥멍케어 로고"
            className="h-[38px] w-[150px] shrink-0 object-contain object-left lg:h-12 lg:w-[187px]"
          />
        </div>
        <div className="flex w-full flex-col items-center gap-6">
          <img
            src={petImage}
            alt="반려동물 이미지"
            className="h-[142px] w-[280px] shrink-0 object-contain md:h-[183px] md:w-[360px] lg:h-[223px] lg:w-[440px]"
          />
          <div className="text-center text-[14px] leading-[1.6] font-normal break-keep text-[#8c939a] md:text-[15px]">
            <p>
              본 사이트는 팀 [꼬리연구소]의 공동 역량 증명을 위한 포트폴리오
              용도로 제작되었으며, 일체의 상업적 목적이 없음을 밝힙니다.
            </p>
          </div>
        </div>
      </FadeIn>
    </footer>
  );
}
