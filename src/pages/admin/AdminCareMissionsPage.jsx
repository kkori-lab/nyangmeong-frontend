import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import SkeletonCard from '@/components/SkeletonCard';
import CareMissionFormModal from '@/features/adminCareMission/CareMissionFormModal';
import CareMissionTable from '@/features/adminCareMission/CareMissionTable';
import {
  MSN_POOL,
  MSN_POOL_TABS,
} from '@/features/adminCareMission/careMissionLabels';
import { useAdminCareMissions } from '@/features/adminCareMission/queries';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

/**
 * 표 머리 줄(45px) + 행(65px) 계산 높이
 * - 미션은 추가하지 않아 풀마다 행 수가 정해져 있다: 전체 21, 일상케어 9, 활동기반 12
 */
const SKELETON_HEIGHT = {
  '': 'h-[1410px]',
  [MSN_POOL.DAILY]: 'h-[630px]',
  [MSN_POOL.ACTIVITY]: 'h-[825px]',
};

function MissionListSkeleton({ pool }) {
  return (
    <div aria-busy="true">
      <SkeletonCard className={SKELETON_HEIGHT[pool]} />
    </div>
  );
}

/**
 * [케어미션]
 * - 풀 탭은 ?pool=(MSN_POOL_CD), [수정] -> 수정 모달
 * - 미션은 서버 코드의 활동과 짝이라 추가하지 않는다(FN-ADM-071-02)
 */
export default function AdminCareMissionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  /** 수정 중인 미션: null이면 닫힘 */
  const [editing, setEditing] = useState(null);

  const pool = searchParams.get('pool') ?? '';
  const selectedPool = MSN_POOL_TABS.some(({ value }) => value === pool)
    ? pool
    : '';
  const missions = useAdminCareMissions(
    selectedPool ? { msnPoolCd: selectedPool } : {},
  );

  const handlePoolSelect = (nextPool) =>
    setSearchParams(nextPool ? { pool: nextPool } : {});

  const renderList = () => {
    if (missions.isPending) return <MissionListSkeleton pool={selectedPool} />;
    if (isForbiddenError(missions.error)) {
      return <AdminForbidden message={missions.error.message} />;
    }
    if (missions.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">
            케어미션 목록을 불러오지 못했어요.
          </p>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => missions.refetch()}
          >
            다시 시도
          </button>
        </div>
      );
    }
    if (missions.data.length === 0) {
      return (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          케어미션이 없어요
        </p>
      );
    }
    return <CareMissionTable missions={missions.data} onEdit={setEditing} />;
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">케어미션</h1>
      <div
        role="tablist"
        aria-label="미션 풀"
        className="mb-4 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]"
      >
        {MSN_POOL_TABS.map(({ value, label }) => {
          const isSelected = value === selectedPool;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`relative h-12 shrink-0 px-4 text-base whitespace-nowrap max-[760px]:px-2 ${
                isSelected
                  ? 'font-bold text-brand-900 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-brand-900 max-[760px]:after:inset-x-1'
                  : 'font-semibold text-subtle hover:text-ink'
              }`}
              onClick={() => handlePoolSelect(value)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{renderList()}</div>
      {editing && (
        <CareMissionFormModal
          mission={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
