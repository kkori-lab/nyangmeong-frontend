import MemberTabTable from './MemberTabTable';
import { useAdminMemberPets } from './queries';

const COLUMNS = ['이름', '종', '품종', '양육 역할', '공동양육 인원', '삭제'];

/**
 * [회원 상세 반려동물 탭]
 * - 반려동물별 공동양육 연동 인원 포함
 */
export default function MemberPetsTab({ mbrSn }) {
  const pets = useAdminMemberPets(mbrSn);

  return (
    <MemberTabTable
      query={pets}
      columns={COLUMNS}
      emptyText="등록된 반려동물이 없어요"
      errorText="반려동물을 불러오지 못했어요."
      getRowKey={(pet) => pet.petSn}
      renderCells={(pet) => [
        pet.petNm,
        pet.petSeNm,
        pet.vrtyNm,
        pet.brupRoleNm,
        `${pet.jntBrupCnt}명`,
        pet.delYn === 'Y' ? '삭제됨' : '—',
      ]}
    />
  );
}
