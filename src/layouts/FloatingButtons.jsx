import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import arrow from '@/assets/arrow.svg';
import defaultCatCharacter from '@/assets/pets/default-character-cat-full.png';
import defaultDogCharacter from '@/assets/pets/default-character-dog-full.png';
import FileImage from '@/components/FileImage';
import { useMyPets } from '@/features/health/queries';
import { useMe } from '@/features/member/queries';
import PetFormModal from '@/features/pet/list/PetFormModal';
import { usePetLimit } from '@/features/pet/queries';
import useAiDock from '@/hooks/useAiDock';
import useAiWindow from '@/hooks/useAiWindow';
import { characterImageOptions } from '@/hooks/useCharacterImage';
import { useFileImage } from '@/hooks/useFileImage';
import { PATHS } from '@/routes/paths';
import { PET_SE } from '@/utils/petCodes';

export default function FloatingButtons({ hasBottomNav = false }) {
  const openAiWindow = useAiWindow();
  const isMain = useLocation().pathname === PATHS.MAIN;
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { data: me } = useMe();
  /** 메인은 버튼을 안 그리므로 말풍선도 본 것으로 치지 않음 */
  const dock = useAiDock({ mbrSn: me?.mbrSn, shown: !isMain });
  /** AI 버튼 캐릭터: 대표 반려동물만. 대표가 없으면 강아지 기본 캐릭터 */
  const { data: pets } = useMyPets();
  const facePet = pets?.find((pet) => pet.rprsPetYn) ?? null;
  /** 등록 버튼: 한도를 못 불러왔거나(불러오는 중·실패) 남은 자리가 없으면 숨김 */
  const { data: limit } = usePetLimit();
  const canRegister = limit?.remainingPetCount > 0;

  const handleAiClick = () => {
    if (!dock.consumeClick()) return;
    dock.closeBubble();
    openAiWindow(null, null, { from: 'fab' });
  };

  const handleRegisterClick = () => {
    if (!dock.consumeClick()) return;
    setIsRegisterOpen(true);
  };

  /** 메인은 검색창 [AI 매니저]가 있어 플로팅 버튼을 하나도 두지 않는다 */
  if (isMain) return null;

  return (
    /** 바텀 네비(60px)가 있으면 그 위로 올림. 모바일에서 접히면 우측 가장자리에 붙임.
     * z-20: 페이지 안 펼침 창(달력·셀렉트·⋮ 메뉴, z-30)이 겹치면 펼침 창이 위. 헤더·모달·드로워보다 아래 */
    <div
      className={`fixed bottom-6 z-20 flex flex-col items-center gap-3 ${
        dock.folded ? '-right-1' : 'right-6'
      } ${
        hasBottomNav
          ? 'max-[760px]:bottom-[calc(76px+env(safe-area-inset-bottom))]'
          : ''
      }`}
    >
      {dock.folded && (
        <button
          type="button"
          className="relative flex h-16 w-8 items-center justify-center rounded-l-[32px] after:absolute after:inset-y-0 after:-left-3 after:right-0 after:content-[''] border border-r-0 border-fab-line bg-fab text-brand-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.05)]"
          aria-label="AI 매니저 펼치기"
          /** 보이는 탭은 32px, 누르는 영역은 왼쪽으로 12px 넓혀 44px */
          onClick={dock.expand}
        >
          <img src={arrow} alt="" width={7} height={13} />
        </button>
      )}
      {/** AI·등록 묶음: 모바일에서 어느 쪽을 오른쪽으로 끌어도 같이 밀려 접힌다.
       * 접혀도 지우지 않고 숨겨 캐릭터 이미지를 다시 그리지 않는다(펼칠 때 로딩 칸 없음) */}
      <div
        className={`flex flex-col items-center gap-3 max-[760px]:touch-none ${
          dock.folded ? 'hidden' : ''
        }`}
        style={{
          transform: `translateX(${dock.offset}px)`,
          transition: dock.dragging ? 'none' : 'transform 0.2s',
        }}
        {...dock.dragHandlers}
      >
        <div className="relative">
          {dock.bubbleVisible && (
            /** AI 답변 말풍선 모양(흰 바탕·테두리, 꼬리 없음). 760 이상은 캐릭터 위, 미만은 캐릭터 왼쪽. 캐릭터 쪽 모서리만 4px */
            <div
              role="status"
              className="absolute bottom-full right-0 mb-1 animate-sway whitespace-nowrap rounded-[18px_18px_4px_18px] border border-line bg-white px-4 py-[9px] text-base font-semibold leading-5 tracking-[-0.03em] text-brand-500 motion-reduce:animate-none max-[760px]:bottom-auto max-[760px]:right-full max-[760px]:top-1/2 max-[760px]:mb-0 max-[760px]:mr-1 max-[760px]:-translate-y-1/2 max-[760px]:rounded-[18px_4px_18px_18px]"
            >
              AI 매니저
            </div>
          )}
          <button
            type="button"
            className="flex items-center justify-center"
            aria-label="AI"
            onClick={handleAiClick}
          >
            {facePet ? <PetBody pet={facePet} /> : <DefaultBody />}
          </button>
        </div>
        {canRegister && (
          <PawButton
            label="등록"
            aria-label="반려동물 등록"
            title="반려동물 등록"
            onClick={handleRegisterClick}
          />
        )}
      </div>
      <PawButton
        label="TOP"
        aria-label="맨 위로"
        className="max-[760px]:hidden"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
      {/** 이동 없이 지금 화면에서 마이페이지와 같은 등록 모달을 연다. 등록하면 모달이 토스트를 띄우고 닫힌다 */}
      {isRegisterOpen && (
        <PetFormModal onClose={() => setIsRegisterOpen(false)} />
      )}
    </div>
  );
}

/** AI 버튼 캐릭터 크기: 512 그림에서 캐릭터는 높이 67%라, 보이는 높이 PC 80px·모바일 60px이 되게 그림을 120px·90px로 그리고 넘친 투명 여백은 음수 여백으로 상쇄(자리는 96px·72px).
 * 모바일은 오른쪽을 더 내보내(-17px) 캐릭터 오른쪽 끝이 화면 가장자리에서 지금처럼 약 24px에 오게 함.
 * AI 서버는 눈 가운데를 그림 가운데에 놓고 꼬리는 대개 오른쪽이라, 눈으로 가운데가 맞게 그림만 PC 4px·모바일 3px 왼쪽으로 옮김 */
const BODY_CLASS =
  'pointer-events-none -m-3 size-[120px] max-w-none shrink-0 -translate-x-1 rounded-2xl object-contain [image-rendering:pixelated] max-[760px]:-my-[9px] max-[760px]:-ml-[9px] max-[760px]:-mr-[17px] max-[760px]:size-[90px] max-[760px]:-translate-x-[3px]';

/** AI 버튼 대표 반려동물 캐릭터 전신. 오류 확인 중(bscCharSbstYn)이면 흑백, 이미지를 못 불러오면 그 종의 기본 캐릭터 */
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
      className={`${BODY_CLASS} ${muted}`}
      fallback={<DefaultBody petSeCd={pet.petSeCd} className={muted} />}
    />
  );
}

/** 대표 반려동물이 없거나 캐릭터 이미지를 못 불러올 때: 우리 기본 캐릭터 전신(고양이가 아니면 강아지). 대표 캐릭터와 같은 512 배치라 크기·위치도 같다 */
function DefaultBody({ petSeCd, className = '' }) {
  const image =
    petSeCd === PET_SE.CAT ? defaultCatCharacter : defaultDogCharacter;
  return <img src={image} alt="" className={`${BODY_CLASS} ${className}`} />;
}

/** 발바닥 몸통: 발가락 4개 + 큰 패드 자리를 겹친 한 덩어리(viewBox 100) */
const PAW_BODY = (
  <>
    <circle cx="24" cy="44" r="16" />
    <circle cx="39" cy="26" r="17" />
    <circle cx="61" cy="26" r="17" />
    <circle cx="76" cy="44" r="16" />
    <ellipse cx="50" cy="65" rx="37" ry="28" />
    <ellipse cx="50" cy="48" rx="30" ry="22" />
  </>
);

/** 발가락 패드 4개: [가운데 x, 가운데 y, 가로 반지름, 세로 반지름, 기울기] */
const PAW_TOES = [
  [24, 46, 8, 10, -25],
  [40, 27, 9, 11, -8],
  [60, 27, 9, 11, 8],
  [76, 46, 8, 10, 25],
];

/**
 * 플로팅 [반려동물 등록]·[TOP] 발바닥 버튼. 흰 몸통 + 연청록 패드, 글자는 발바닥 전체 가운데.
 * PC 56px·모바일 48px, 누르는 영역은 감싼 네모 전체
 */
function PawButton({ label, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`relative size-14 shrink-0 text-brand-500 max-[760px]:size-12 ${className}`}
      {...props}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full overflow-visible drop-shadow-[0_2px_3px_rgba(31,42,43,0.1)]"
      >
        {/** 테두리: 같은 몸통을 조금 키워 뒤에 깐다 */}
        <g
          className="fill-line"
          transform="translate(50 50) scale(1.035) translate(-50 -50)"
        >
          {PAW_BODY}
        </g>
        <g className="fill-white">{PAW_BODY}</g>
        <g className="fill-brand-50">
          {PAW_TOES.map(([cx, cy, rx, ry, angle]) => (
            <ellipse
              key={cx}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              transform={`rotate(${angle} ${cx} ${cy})`}
            />
          ))}
          <path d="M50 52C61 52 70 62 72.5 71C75 81 65 85 50 83.5C35 85 25 81 27.5 71C30 62 39 52 50 52Z" />
        </g>
      </svg>
      <span className="relative flex size-full items-center justify-center pt-1 text-xs font-bold leading-[14px] tracking-[-0.01em]">
        {label}
      </span>
    </button>
  );
}
