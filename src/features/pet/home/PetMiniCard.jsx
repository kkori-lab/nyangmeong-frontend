import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '@/components/Badge';
import { PATHS } from '@/routes/paths';
import PetFace from '@/components/PetFace';
import { CHRC_STTS, PET_REL } from '@/utils/petCodes';
import { formatAge, getVrtyName } from '@/utils/petFormat';

/** 캐릭터를 만든 동물의 얼굴 바탕색 (순서대로 순환 사용) */
const TONES = [
  'bg-tone-blue-bg',
  'bg-tone-rose-bg',
  'bg-tone-amber-bg',
  'bg-tone-violet-bg',
  'bg-tone-green-bg',
];

export default function PetMiniCard({ pet, index }) {
  const isDone = pet.chrcSttsCd === CHRC_STTS.DONE;
  const isError = pet.chrcSttsCd === CHRC_STTS.ERROR;

  return (
    <Link
      to={PATHS.MYPAGE_PETS}
      state={{ petSn: pet.petSn }}
      className="group flex min-w-0 flex-1 items-center gap-4 rounded-card border border-line bg-white p-4 shadow-[0_1px_2px_rgba(26,50,52,0.04)] hover:border-brand-100 hover:shadow-depth-sm max-[760px]:min-h-16 max-[760px]:gap-3 max-[760px]:rounded-none max-[760px]:border-0 max-[760px]:px-4 max-[760px]:py-3 max-[760px]:shadow-none max-[760px]:hover:bg-surface-2 max-[760px]:hover:shadow-none"
    >
      <span
        className={`relative grid size-16 shrink-0 max-[760px]:size-10 place-items-center rounded-full ${
          isDone
            ? `${TONES[index % TONES.length]} text-brand-500`
            : 'bg-surface-2 text-line-strong shadow-[inset_0_0_0_1px_var(--color-line-strong)]'
        }`}
      >
        <PetFace
          petSn={pet.petSn}
          petSeCd={pet.petSeCd}
          chrcSttsCd={pet.chrcSttsCd}
          className="size-full rounded-full"
          iconClassName="size-7 max-[760px]:size-5"
        />
        {pet.rprsYn === 'Y' && (
          <span className="absolute -right-1.5 -bottom-1 max-[760px]:-right-2.5 max-[760px]:-bottom-1.5 max-[760px]:scale-[.85] inline-flex h-6 items-center rounded-full bg-brand-500 px-2.5 pt-[1.5px] text-[13px] leading-none font-semibold whitespace-nowrap text-white ring-2 ring-white">
            대표
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-2 text-lg font-bold group-hover:text-brand-600 max-[760px]:text-base">
          {pet.petNm}
          {pet.petRelCd === PET_REL.CO_PARENT && <Badge>공동양육</Badge>}
          {isError && <Badge tone="amber">오류 확인 중</Badge>}
        </span>
        <span className="text-sm text-subtle max-[760px]:truncate">
          {getVrtyName(pet)} · {formatAge(pet.petBrdt)}
        </span>
      </span>
      <ChevronRight
        className="ml-auto hidden size-5 shrink-0 text-line-strong max-[760px]:block"
        aria-hidden="true"
      />
    </Link>
  );
}
