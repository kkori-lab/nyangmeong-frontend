import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import CharacterCreateModal from '@/features/pet/character/CharacterCreateModal';
import CharacterDecorate from '@/features/pet/character/CharacterDecorate';
import CharacterEmpty from '@/features/pet/character/CharacterEmpty';
import CharacterGrid from '@/features/pet/character/CharacterGrid';
import CharacterTabs from '@/features/pet/character/CharacterTabs';
import { usePets, useSetRepresentativePet } from '@/features/pet/queries';
import { usePointBalance } from '@/features/point/queries';
import { BRUP_ROLE, CHRC_STTS } from '@/features/pet/shared/petCodes';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';

const DESCRIPTION = '우리 아이를 닮은 픽셀 캐릭터를 만들고 아이템으로 꾸며요';

/** 탭은 ?tab=shared, 꾸미기는 ?petSn= (화면 안 단계는 URL을 늘리지 않음) */
export default function CharacterPage() {
  const { data: pets = [], isPending } = usePets();
  const { data: point } = usePointBalance();
  const { mutate: setRepresentative } = useSetRepresentativePet();
  const [searchParams, setSearchParams] = useSearchParams();
  const [creatingPet, setCreatingPet] = useState(null);

  const ownPets = pets.filter((pet) => pet.brupRoleCd === BRUP_ROLE.PRIMARY);
  const sharedPets = pets.filter((pet) => pet.brupRoleCd !== BRUP_ROLE.PRIMARY);
  const decoratingPetSn = Number(searchParams.get('petSn'));

  if (isPending) {
    return <SubPageLayout section="mypage" description={DESCRIPTION} />;
  }

  if (decoratingPetSn) {
    /** 꾸미기는 완료된 내 캐릭터만. 아니면 목록으로 */
    const decoratingPet = ownPets.find((pet) => pet.petSn === decoratingPetSn);
    if (decoratingPet?.chrcSttsCd !== CHRC_STTS.DONE) {
      return <Navigate to={PATHS.MYPAGE_CHARACTERS} replace />;
    }
    return (
      <SubPageLayout
        section="mypage"
        title={`${decoratingPet.petNm} 꾸미기`}
        description={DESCRIPTION}
        contentClassName="min-[1101px]:pt-6 max-[760px]:grid max-[760px]:grid-cols-[auto_minmax(0,1fr)] max-[760px]:items-center"
      >
        <CharacterDecorate pet={decoratingPet} pntBal={point?.pntBal ?? 0} />
      </SubPageLayout>
    );
  }

  const hasShared = sharedPets.length > 0;
  /** 공동양육 동물이 없는데 ?tab=shared면 내 캐릭터 */
  const tab =
    hasShared && searchParams.get('tab') === 'shared' ? 'shared' : 'own';

  return (
    <SubPageLayout section="mypage" description={DESCRIPTION}>
      {pets.length === 0 ? (
        <CharacterEmpty />
      ) : (
        <div className="flex flex-col gap-4">
          {hasShared && (
            <CharacterTabs
              selectedKey={tab}
              sharedCount={sharedPets.length}
              onSelect={(key) =>
                setSearchParams(key === 'shared' ? { tab: 'shared' } : {})
              }
            />
          )}
          {tab === 'own' && ownPets.length > 0 && (
            <>
              <p className="text-subtle">
                캐릭터를 누르면 꾸미기 화면으로 이동해요
              </p>
              <CharacterGrid
                pets={ownPets}
                mode="own"
                onDecorate={(pet) => setSearchParams({ petSn: pet.petSn })}
                onCreate={setCreatingPet}
                onSetRepresentative={(pet) => setRepresentative(pet.petSn)}
              />
              <p className="text-sm text-subtle">
                캐릭터는 반려동물 1마리당 1개예요
              </p>
            </>
          )}
          {tab === 'shared' && (
            <CharacterGrid pets={sharedPets} mode="shared" />
          )}
        </div>
      )}
      {creatingPet && (
        <CharacterCreateModal
          pet={creatingPet}
          onClose={() => setCreatingPet(null)}
        />
      )}
    </SubPageLayout>
  );
}
