import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import EmptyResult from '@/components/EmptyResult';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import CharacterCreateModal from '@/features/pet/character/CharacterCreateModal';
import CharacterDecorate, {
  DecorateSkeleton,
} from '@/features/pet/character/CharacterDecorate';
import CharacterEmpty from '@/features/pet/character/CharacterEmpty';
import CharacterGrid from '@/features/pet/character/CharacterGrid';
import CharacterTabs from '@/features/pet/character/CharacterTabs';
import {
  petKeys,
  usePets,
  usePixelCharacters,
  useSetRepresentativePet,
} from '@/features/pet/queries';
import { getCharState } from '@/features/pet/shared/charState';
import { BRUP_ROLE, CHRC_STTS } from '@/features/pet/shared/petCodes';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';

const DESCRIPTION = '우리 아이를 닮은 픽셀 캐릭터를 만들고 아이템으로 꾸며요';

/** 목록 로딩 자리: 탭 줄 + 안내 + 카드 2줄(5열, 좁으면 3·2열) + 안내 */
function CharacterPageSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-[26px] w-64" />
      <div className="grid grid-cols-2 gap-4 min-[600px]:grid-cols-3 min-[1101px]:grid-cols-5">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonCard
            key={index}
            className="h-[263px] max-[599px]:h-[223px]"
          />
        ))}
      </div>
      <Skeleton className="h-5 w-56" />
    </div>
  );
}

/** 탭은 ?tab=shared, 꾸미기는 ?pixelCharSn= (화면 안 단계는 URL을 늘리지 않음) */
export default function CharacterPage() {
  const petsQuery = usePets();
  const charsQuery = usePixelCharacters({ isPolling: true });
  const { data: rawPets = [] } = petsQuery;
  const { data: characters } = charsQuery;
  const queryClient = useQueryClient();
  /** 이 화면에서 생성 중으로 본 동물: 끝나면 캐릭터 이미지를 다시 읽는다 */
  const creatingSnsRef = useRef(new Set());
  const isPending = petsQuery.isPending || charsQuery.isPending;
  /** 데이터 없이 실패한 조회: 다시 읽을 때 이것만 refetch */
  const failedQueries = [petsQuery, charsQuery].filter(
    (query) => query.isError && query.data === undefined,
  );
  const { mutate: setRepresentative } = useSetRepresentativePet();
  const [searchParams, setSearchParams] = useSearchParams();
  const [creatingPetSn, setCreatingPetSn] = useState(null);

  useEffect(() => {
    characters?.forEach((item) => {
      const { status } = getCharState(item);
      if (status === CHRC_STTS.GENERATING) {
        creatingSnsRef.current.add(item.petSn);
      } else if (creatingSnsRef.current.delete(item.petSn)) {
        queryClient.invalidateQueries({ queryKey: petKeys.all });
      }
    });
  }, [characters, queryClient]);

  /** 반려동물에 캐릭터 목록의 번호·상태를 합친다 */
  const pets = rawPets.map((pet) => {
    const character = characters?.find((item) => item.petSn === pet.petSn);
    const { status, isError } = getCharState(character);
    return {
      ...pet,
      pixelCharSn: character?.pixelCharSn ?? null,
      charStatus: status,
      isCharError: isError,
    };
  });
  const ownPets = pets.filter((pet) => pet.brupRoleCd === BRUP_ROLE.PRIMARY);
  const sharedPets = pets.filter((pet) => pet.brupRoleCd !== BRUP_ROLE.PRIMARY);
  const creatingPet = pets.find((pet) => pet.petSn === creatingPetSn);
  const decoratingCharSn = Number(searchParams.get('pixelCharSn'));

  if (failedQueries.length > 0) {
    return (
      <SubPageLayout section="mypage" description={DESCRIPTION}>
        <EmptyResult title="캐릭터를 불러오지 못했어요">
          <button
            type="button"
            onClick={() => failedQueries.forEach((query) => query.refetch())}
            className={BTN_PRIMARY}
          >
            다시 시도
          </button>
        </EmptyResult>
      </SubPageLayout>
    );
  }

  if (isPending) {
    /** 꾸미기 주소로 들어오면 꾸미기 화면 배치대로 */
    if (decoratingCharSn) {
      return (
        <SubPageLayout
          section="mypage"
          title={
            <Skeleton className="inline-block h-[1em] w-28 align-middle" />
          }
          description={DESCRIPTION}
          contentClassName="min-[1101px]:pt-6 max-[760px]:grid max-[760px]:grid-cols-[auto_minmax(0,1fr)] max-[760px]:items-center"
        >
          <DecorateSkeleton />
        </SubPageLayout>
      );
    }
    return (
      <SubPageLayout section="mypage" description={DESCRIPTION}>
        <CharacterPageSkeleton />
      </SubPageLayout>
    );
  }

  if (decoratingCharSn) {
    /** 꾸미기는 완료된 내 캐릭터만(오류 확인 중 제외). 아니면 목록으로 */
    const decoratingPet = ownPets.find(
      (pet) => pet.pixelCharSn === decoratingCharSn,
    );
    if (
      decoratingPet?.charStatus !== CHRC_STTS.DONE ||
      decoratingPet.isCharError
    ) {
      return <Navigate to={PATHS.MYPAGE_CHARACTERS} replace />;
    }
    return (
      <SubPageLayout
        section="mypage"
        title={`${decoratingPet.petNm} 꾸미기`}
        description={DESCRIPTION}
        contentClassName="min-[1101px]:pt-6 max-[760px]:grid max-[760px]:grid-cols-[auto_minmax(0,1fr)] max-[760px]:items-center"
      >
        <CharacterDecorate pet={decoratingPet} />
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
                onDecorate={(pet) =>
                  setSearchParams({ pixelCharSn: pet.pixelCharSn })
                }
                onCreate={(pet) => setCreatingPetSn(pet.petSn)}
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
          onClose={() => setCreatingPetSn(null)}
        />
      )}
    </SubPageLayout>
  );
}
