import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { readLastPetSn, writeLastPetSn } from '@/utils/lastPetSn';
import { useMyPets } from '../queries';
import { SelectedPetContext } from './selectedPet';

/**
 * [건강기록 3개 화면이 같은 반려동물을 보게 하는 선택값] (※신규 정책)
 * - mbrSn: 회원 번호(페이지가 features/member의 useMe로 받아 넘긴다. features끼리는 import 하지 않는다). 아직 모르면 undefined
 * - 정하는 순서: 이 화면에서 직접 고른 아이 → 주소 `?petSn=`(메인·알림·마이페이지 등록 뒤 복귀) → 마지막으로 고른 아이(`utils/lastPetSn`, 회원별, AI 채팅도 읽음) → 목록의 첫 번째 아이
 * - 마지막으로 고른 아이가 삭제됐거나 공동양육이 해제돼 목록에 없으면 첫 번째 아이로 바꾸고 저장값도 바꾼다
 * - `?petSn=`는 처음 한 번 읽고 주소에서 지운다. 안 지우면 새로고침 때마다 주소의 아이로 돌아가 마지막 선택 유지와 부딪힌다
 */
export default function SelectedPetProvider({ mbrSn, children }) {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const [searchParams] = useSearchParams();
  const { data: pets, isPending, isError } = useMyPets();
  /** 화면 안에서 직접 고른 아이 */
  const [chosenSn, setChosenSn] = useState(null);
  /** 주소로 들어온 아이. 처음 한 번만 읽는다 */
  const [requestedSn] = useState(
    () => Number(searchParams.get('petSn')) || null,
  );

  const findPet = (petSn) => pets?.find((item) => item.petSn === petSn);
  const pet =
    findPet(chosenSn) ??
    findPet(requestedSn) ??
    findPet(readLastPetSn(mbrSn)) ??
    pets?.[0] ??
    null;
  const petSn = pet?.petSn ?? null;

  /** 마지막으로 고른 아이를 보관 */
  useEffect(() => {
    if (petSn !== null) writeLastPetSn(mbrSn, petSn);
  }, [mbrSn, petSn]);

  /** 읽은 `?petSn=`는 주소에서 지운다(다른 쿼리·해시는 그대로) */
  useEffect(() => {
    if (!searchParams.has('petSn')) return;
    const next = new URLSearchParams(searchParams);
    next.delete('petSn');
    const search = next.toString();
    navigate(
      { pathname, search: search ? `?${search}` : '', hash },
      { replace: true },
    );
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- 첫 진입 때 한 번만 */
  }, []);

  return (
    <SelectedPetContext.Provider
      value={{
        pets: pets ?? [],
        pet,
        selectPet: setChosenSn,
        isPending,
        isError,
      }}
    >
      {children}
    </SelectedPetContext.Provider>
  );
}
