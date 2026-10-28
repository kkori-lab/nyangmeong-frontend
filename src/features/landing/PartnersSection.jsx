import FadeIn from './FadeIn';
import { BANNER_CARDS } from './landingData';

export default function PartnersSection() {
  return (
    <section
      id="partners"
      className="relative flex w-full scroll-mt-20 flex-col items-center justify-center overflow-hidden bg-[#fdfcfb] py-20 lg:h-[870px] lg:py-0"
    >
      <div className="flex w-full flex-col items-center px-4">
        <FadeIn delay={100} className="mb-12 text-center lg:mb-20">
          <h2 className="text-[28px] leading-[150%] font-bold text-ink lg:text-[40px]">
            함께하는 반려생활
          </h2>
          <p className="mt-2 text-[16px] leading-[150%] font-normal text-ink lg:text-[24px]">
            수첩, 메모장, 영수증에 흩어진 기록들을 쉽고 재미있게 관리해요.
          </p>
        </FadeIn>

        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-6">
          {BANNER_CARDS.map((card, index) => (
            <div
              key={card.title}
              className="group flex w-full max-w-[384px] flex-col"
            >
              <FadeIn delay={300 + index * 300}>
                <div className="aspect-[384/260] w-full overflow-hidden rounded-t-[20px] bg-[#c4c4c4]">
                  <img
                    src={card.image}
                    alt=""
                    className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>
              </FadeIn>
              <FadeIn delay={600 + index * 300}>
                <h3 className="mt-6 text-[20px] leading-[150%] font-semibold text-ink lg:text-[24px]">
                  {card.title}
                </h3>
                <p className="mt-2 text-[16px] leading-[150%] font-normal whitespace-pre-line text-ink-2">
                  {card.description}
                </p>
              </FadeIn>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
