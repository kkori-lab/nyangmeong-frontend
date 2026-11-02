import { PET_SE_OPTIONS } from '@/utils/petCodes';
import { BRUP_ROLE_OPTIONS, getOptionLabel } from './memberLabels';
import MemberTabTable from './MemberTabTable';
import { useAdminMemberPets } from './queries';

const COLUMNS = ['이름', '종', '품종', '양육 역할', '공동양육 인원', '삭제'];

/** 종 표시: 없는 코드는 코드 그대로 */
const formatPetSe = (petSeCd) =>
  PET_SE_OPTIONS.find(({ code }) => code === petSeCd)?.name ?? petSeCd;

/**
 * [회원 상세 반려동물 탭]
 * - 반려동물별 공동양육 연동 인원 포함
 */
export default function MemberPetsTab({ mbrSn, page, size, onPageChange }) {
  const pets = useAdminMemberPets({ mbrSn, page, size });

  return (
    <MemberTabTable
      query={pets}
      columns={COLUMNS}
      emptyText="등록된 반려동물이 없어요"
      errorText="반려동물을 불러오지 못했어요."
      getRowKey={(pet) => pet.petSn}
      renderCells={(pet) => [
        pet.petNm,
        formatPetSe(pet.petSeCd),
        pet.vrtyNm ?? pet.vrtyDrctInptNm ?? '—',
        getOptionLabel(BRUP_ROLE_OPTIONS, pet.brupRoleCd),
        `${pet.caregiverCount}명`,
        pet.delYn ? '삭제됨' : '—',
      ]}
      page={page}
      onPageChange={onPageChange}
    />
  );
}
