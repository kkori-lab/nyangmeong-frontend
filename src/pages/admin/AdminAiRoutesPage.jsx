import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import SearchInput from '@/components/SearchInput';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import AiRouteFormModal from '@/features/adminAiRoute/AiRouteFormModal';
import AiRouteTable from '@/features/adminAiRoute/AiRouteTable';
import { useAdminAiRoutes } from '@/features/adminAiRoute/queries';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

/** 등록 모달을 연 상태 */
const NEW_ROUTE = 'new';

/** 검색·버튼 줄 + 표(머리 줄 45px + 처음 매핑 45행 x 약 73px, 어림값) */
function RouteListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full" />
      <SkeletonCard className="h-[3330px]" />
    </div>
  );
}

/**
 * [라우팅 매핑표] SCR-ADM-080
 * - 지시어 검색은 ?q=, 행 클릭 -> 수정 모달, [매핑 등록] -> 등록 모달
 * - 우선순위는 모달의 숫자 칸으로 바꾼다(그 자리에 넣고 나머지를 한 칸씩 민다)
 */
export default function AdminAiRoutesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [keyword, setKeyword] = useState(q);
  /** 열린 모달: null(닫힘), NEW_ROUTE(등록), 매핑 행(수정) */
  const [editing, setEditing] = useState(null);

  const routes = useAdminAiRoutes(q ? { q } : {});

  const handleSearch = () => {
    const next = keyword.trim();
    setSearchParams(next ? { q: next } : {});
  };
  const handleKeywordChange = (value) => {
    setKeyword(value);
    /** 검색어를 다 지우면 바로 전체로 */
    if (!value.trim() && q) setSearchParams({});
  };

  const renderActions = () => (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <SearchInput
        value={keyword}
        onChange={handleKeywordChange}
        onSubmit={handleSearch}
        placeholder="지시어 검색"
        className="w-[320px] max-[760px]:w-full"
      />
      <button
        type="button"
        className={`${BTN_PRIMARY} ml-auto max-[760px]:ml-0 max-[760px]:w-full`}
        onClick={() => setEditing(NEW_ROUTE)}
      >
        매핑 등록
      </button>
    </div>
  );

  const renderList = () => {
    if (routes.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">
            라우팅 매핑표를 불러오지 못했어요.
          </p>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => routes.refetch()}
          >
            다시 시도
          </button>
        </div>
      );
    }
    if (routes.data.length === 0) {
      return (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          {q ? `'${q}'가 들어간 지시어가 없어요` : '등록된 매핑이 없어요'}
        </p>
      );
    }
    return <AiRouteTable routes={routes.data} onSelect={setEditing} />;
  };

  /** 본문: 로딩 / 403 / 목록 */
  const renderBody = () => {
    if (routes.isPending) return <RouteListSkeleton />;
    if (isForbiddenError(routes.error)) {
      return <AdminForbidden message={routes.error.message} />;
    }
    return (
      <>
        {renderActions()}
        {renderList()}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-2 text-2xl font-bold text-ink">라우팅 매핑표</h1>
      <p className="mb-5 text-sm leading-[22px] text-subtle">
        AI 대화창이 지시어를 보고 이동할 화면을 정하는 표예요. 가장 길게 일치한
        지시어가 먼저고, 길이가 같으면 우선순위가 높은(숫자가 작은) 행이
        먼저예요.
      </p>
      {renderBody()}
      {editing != null && (
        <AiRouteFormModal
          route={editing === NEW_ROUTE ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
