import { useEffect, useRef, useState } from 'react';
import FadeIn from './FadeIn';
import { FAQS } from './landingData';

function ToggleIcon({ isOpen }) {
  return (
    <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-[#d7f0cf] lg:size-10">
      <span className="absolute h-0.5 w-3.5 rounded-full bg-ink lg:w-[18px]" />
      <span
        className={`absolute h-3.5 w-0.5 rounded-full bg-ink transition-transform duration-200 lg:h-[18px] ${
          isOpen ? 'scale-y-0' : 'scale-y-100'
        }`}
      />
    </span>
  );
}

export default function FaqSection() {
  const sectionRef = useRef(null);
  const revealedIndex = useRef(0);
  const [openItems, setOpenItems] = useState(() => FAQS.map((_, i) => i === 0));

  useEffect(() => {
    const onScroll = () => {
      const rect = sectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const startTop = vh * 0.8;
      const endTop = vh * 0.5 - rect.height / 2;
      const progress = Math.min(
        1,
        Math.max(0, (startTop - rect.top) / (startTop - endTop)),
      );
      const index = Math.min(
        FAQS.length - 1,
        Math.floor(progress * FAQS.length),
      );
      if (index > revealedIndex.current) {
        revealedIndex.current = index;
        setOpenItems((prev) => prev.map((open, i) => open || i <= index));
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleItem = (index) =>
    setOpenItems((prev) => prev.map((open, i) => (i === index ? !open : open)));

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative flex w-full scroll-mt-20 flex-col items-center justify-center overflow-hidden bg-[#f7f7f4] py-24 lg:min-h-[640px] lg:py-32"
    >
      <div className="flex w-full max-w-[800px] flex-col gap-4 px-4 lg:px-0">
        {FAQS.map((faq, index) => {
          const isOpen = openItems[index];
          return (
            <FadeIn
              key={faq.question}
              delay={100 + index * 400}
              className={`w-full rounded-[20px] bg-[#fdfcfb] ${
                isOpen ? 'border-2 border-[#2b5254]' : 'border border-[#c9d3d3]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(index)}
                aria-expanded={isOpen}
                className="flex min-h-[73px] w-full items-center justify-between gap-4 py-4 pr-4 pl-6 text-left lg:pr-4 lg:pl-11"
              >
                <span className="text-[16px] leading-[150%] font-semibold break-keep text-ink lg:text-[18px]">
                  {faq.question}
                </span>
                <ToggleIcon isOpen={isOpen} />
              </button>
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                  isOpen
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="pr-6 pb-6 pl-6 text-[14px] leading-[150%] font-normal break-keep text-ink-2 lg:pr-[72px] lg:pl-11 lg:text-[16px]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
