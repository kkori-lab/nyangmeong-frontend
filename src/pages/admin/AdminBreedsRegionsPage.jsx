import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Select from '@/components/Select';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import BreedFormModal from '@/features/adminBreedRegion/BreedFormModal';
import BreedTable from '@/features/adminBreedRegion/BreedTable';
import RegionBrowser from '@/features/adminBreedRegion/RegionBrowser';
import { useAdminBreeds } from '@/features/adminBreedRegion/queries';
import { isForbiddenError } from '@/utils/isForbiddenError';
import { PET_SE, PET_SE_OPTIONS } from '@/utils/petCodes';
import AdminForbidden from './AdminForbidden';

const TAB_BREEDS = 'breeds';
const TAB_REGIONS = 'regions';

/** 등록 모달을 연 상태 */
const NEW_BREED = 'new';

const PET_SE_SELECT_OPTIONS = PET_SE_OPTIONS.map(({ code, name }) => ({
  value: code,
  label: `종: ${name}`,
}));
const PET_SE_CODES = PET_SE_OPTIONS.map(({ code }) => code);

/** 종 선택·버튼 줄 + 표(머리 줄 + 9행) */
function BreedListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full" />
      <SkeletonCard className="h-[500px]" />
    </div>
  );
}

/** 품종 탭: 종 선택 + 표 + 추가·수정 모달 */
function BreedsTab({ petSeCd, breeds, onPetSeChange }) {
  /** 열린 모달: null(닫힘), NEW_BREED(추가), 품종 행(수정) */
  const [editing, setEditing] = useState(null);
  const petSeName = PET_SE_OPTIONS.find(({ code }) => code === petSeCd).name;

  if (breeds.isPending) return <BreedListSkeleton />;
  if (isForbiddenError(breeds.error)) {
    return <AdminForbidden message={breeds.error.message} />;
  }

  const renderList = () => {
    if (breeds.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">
            품종 목록을 불러오지 못했어요.
          </p>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => breeds.refetch()}
          >
            다시 시도
          </button>
        </div>
      );
    }
    if (breeds.data.length === 0) {
      return (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          등록된 품종이 없어요
        </p>
      );
    }
    return <BreedTable breeds={breeds.data} onEdit={setEditing} />;
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Select
          label="종"
          value={petSeCd}
          options={PET_SE_SELECT_OPTIONS}
          className="w-[160px]"
          onChange={onPetSeChange}
        />
        <button
          type="button"
          className={BTN_PRIMARY}
          disabled={breeds.isError || breeds.isPlaceholderData}
          onClick={() => setEditing(NEW_BREED)}
        >
          <Plus className="size-4" aria-hidden="true" />
          품종 추가
        </button>
      </div>
      {renderList()}
      {editing != null && breeds.isSuccess && (
        <BreedFormModal
          breed={editing === NEW_BREED ? null : editing}
          petSeCd={petSeCd}
          petSeName={petSeName}
          breeds={breeds.data}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

/**
 * [품종·지역]
 * - 탭은 ?tab=regions, 없거나 모르면 품종
 * - 품종 탭 종은 ?petSeCd=, 없거나 모르면 강아지. 탭 개수는 지금 종의 품종 수
 * - 지역은 조회만
 */
export default function AdminBreedsRegionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab =
    searchParams.get('tab') === TAB_REGIONS ? TAB_REGIONS : TAB_BREEDS;
  const petSeParam = searchParams.get('petSeCd');
  const petSeCd = PET_SE_CODES.includes(petSeParam) ? petSeParam : PET_SE.DOG;

  const breeds = useAdminBreeds(petSeCd);

  const tabs = [
    {
      key: TAB_BREEDS,
      label: '품종',
      count: breeds.isSuccess ? breeds.data.length : null,
    },
    { key: TAB_REGIONS, label: '지역', count: null },
  ];

  const handleTabSelect = (nextTab) =>
    setSearchParams(nextTab === TAB_REGIONS ? { tab: TAB_REGIONS } : {});
  const handlePetSeChange = (nextPetSeCd) =>
    setSearchParams(nextPetSeCd === PET_SE.DOG ? {} : { petSeCd: nextPetSeCd });

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">품종·지역</h1>
      <div
        role="tablist"
        aria-label="품종·지역"
        className="mb-4 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]"
      >
        {tabs.map(({ key, label, count }) => {
          const isSelected = key === tab;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`relative h-12 shrink-0 px-4 text-base whitespace-nowrap ${
                isSelected
                  ? 'font-bold text-brand-900 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-brand-900'
                  : 'font-semibold text-subtle hover:text-ink'
              }`}
              onClick={() => handleTabSelect(key)}
            >
              {label}
              {count != null && (
                <span className="ml-1.5 tabular-nums">
                  {count.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">
        {tab === TAB_REGIONS ? (
          <RegionBrowser />
        ) : (
          <BreedsTab
            petSeCd={petSeCd}
            breeds={breeds}
            onPetSeChange={handlePetSeChange}
          />
        )}
      </div>
    </div>
  );
}
