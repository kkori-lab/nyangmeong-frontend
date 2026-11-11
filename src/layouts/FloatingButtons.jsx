import { Bot } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import arrow from '@/assets/arrow.svg';
import FileImage from '@/components/FileImage';
import { useMyPets } from '@/features/health/queries';
import useAiDock from '@/hooks/useAiDock';
import useAiWindow from '@/hooks/useAiWindow';
import { characterImageOptions } from '@/hooks/useCharacterImage';
import { useFileImage } from '@/hooks/useFileImage';
import { PATHS } from '@/routes/paths';

export default function FloatingButtons({ hasBottomNav = false }) {
  const openAiWindow = useAiWindow();
  const isMain = useLocation().pathname === PATHS.MAIN;
  const dock = useAiDock();
  /** AI 버튼 캐릭터: 대표 반려동물, 없으면 첫 마리 */
  const { data: pets } = useMyPets();
  const facePet = pets?.find((pet) => pet.rprsPetYn) ?? pets?.[0] ?? null;

  const handleAiClick = () => {
    if (!dock.consumeClick()) return;
    dock.closeBubble();
    openAiWindow(null, null, { from: 'fab' });
  };

  return (
    /** 바텀 네비(60px)가 있으면 그 위로 올림. 모바일에서 접히면 우측 가장자리에 붙임 */
    <div
      className={`fixed bottom-6 z-30 flex flex-col items-center gap-3 ${
        dock.folded ? '-right-1' : 'right-6'
      } ${
        hasBottomNav
          ? 'max-[760px]:bottom-[calc(76px+env(safe-area-inset-bottom))]'
          : ''
      }`}
    >
      <div className={isMain ? 'hidden' : 'relative'}>
        {dock.bubbleVisible && (
          <div
            role="status"
            className="absolute right-full top-1/2 mr-[17px] -translate-y-1/2 animate-sway whitespace-nowrap motion-reduce:animate-none h-10 rounded-full border border-fab-line bg-linear-to-r from-fab-soft to-white px-4 text-base font-semibold leading-[38px] text-brand-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.05)]"
          >
            AI 매니저
            <svg
              aria-hidden="true"
              viewBox="0 0 12 14"
              className="absolute -right-[10px] top-1/2 h-[14px] w-[12px] -translate-y-1/2"
            >
              <path d="M1.3 1 L11 7 L1.3 13 Z" className="fill-white" />
              <path
                d="M1.3 1 L11 7 L1.3 13"
                className="fill-none stroke-fab-line"
              />
            </svg>
          </div>
        )}
        {dock.folded ? (
          <button
            type="button"
            className="flex h-16 w-8 items-center justify-center rounded-l-[32px] border border-r-0 border-fab-line bg-fab text-brand-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.05)]"
            aria-label="AI 매니저 펼치기"
            onClick={dock.expand}
          >
            <img src={arrow} alt="" width={7} height={13} />
          </button>
        ) : (
          <button
            type="button"
            className="flex touch-none items-center justify-center"
            style={{
              transform: `translateX(${dock.offset}px)`,
              transition: dock.dragging ? 'none' : 'transform 0.2s',
            }}
            aria-label="AI"
            onClick={handleAiClick}
            {...dock.dragHandlers}
          >
            {facePet ? <PetBody pet={facePet} /> : <BotBox />}
          </button>
        )}
      </div>
      {!isMain && (
        <button
          type="button"
          className="h-[52px] w-[52px] rounded-2xl border border-[#e2e7e7] bg-white text-base font-bold text-[#3d4a4b] max-[760px]:hidden"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          TOP
        </button>
      )}
    </div>
  );
}

/** AI 버튼 캐릭터 전신: 틀 없이 선 모습. 모바일은 이미지 오른쪽 투명 여백(512 중 96px ≈ 14px)만큼 오른쪽으로 내보냄. 오류 확인 중(bscCharSbstYn)이면 흑백, 이미지가 없으면 BotBox */
function PetBody({ pet }) {
  const { src, isPending } = useFileImage(
    characterImageOptions(pet.petSn, 'full'),
  );
  const muted = pet.bscCharSbstYn ? 'opacity-55 grayscale' : '';
  return (
    <FileImage
      src={src}
      alt=""
      pending={isPending}
      className={`pointer-events-none size-24 max-w-none shrink-0 rounded-2xl object-contain [image-rendering:pixelated] max-[760px]:-mr-[14px] max-[760px]:size-[72px] ${muted}`}
      fallback={<BotBox />}
    />
  );
}

/** 반려동물·캐릭터 이미지가 없을 때 AI 버튼: 틀 안 Bot 아이콘 */
function BotBox() {
  return (
    <span className="flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-fab-line bg-fab text-brand-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.05)] max-[760px]:h-[52px] max-[760px]:w-[52px]">
      <Bot size={32} className="max-[760px]:size-6" />
    </span>
  );
}
