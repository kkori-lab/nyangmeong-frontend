import PetFace from '@/components/PetFace';
import {
  formatAge,
  formatWeight,
  getGndrName,
  getVrtyName,
  splitList,
} from '@/utils/petFormat';

const TAG =
  'inline-flex h-6 items-center rounded-full border border-white/26 px-2 text-[13px] font-semibold';

export default function PetProfileCard({ pet }) {
  const meta = [getVrtyName(pet), formatAge(pet.petBrdt), getGndrName(pet)]
    .filter(Boolean)
    .join(' · ');
  const allergyCount = splitList(pet.algyCn).length;
  const diseaseCount = splitList(pet.dssCn).length;

  return (
    <div className="flex items-start gap-4 p-5">
      <PetFace
        petSn={pet.petSn}
        petSeCd={pet.petSeCd}
        chrcSttsCd={pet.chrcSttsCd}
        alt={`${pet.petNm} 캐릭터`}
        className="size-[76px] shrink-0 rounded-modal bg-white"
        fallback={
          <div className="grid size-[76px] shrink-0 place-items-center rounded-modal border border-dashed border-white/26 text-center text-sm leading-tight text-[#dbe8e8]">
            캐릭터
            <br />
            이미지
          </div>
        }
      />
      <div className="min-w-0">
        <p className="text-lg leading-none font-bold">{pet.petNm}</p>
        <p className="mt-1 text-[#dbe8e8]">{meta}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {pet.petBdwg != null && (
            <span className={`${TAG} tabular-nums`}>
              {formatWeight(pet.petBdwg)}
            </span>
          )}
          {allergyCount > 0 && (
            <span className={TAG}>알레르기 {allergyCount}</span>
          )}
          {diseaseCount > 0 && (
            <span className={TAG}>기저질환 {diseaseCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}
