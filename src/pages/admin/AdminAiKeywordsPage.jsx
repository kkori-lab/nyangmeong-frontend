import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import AiKeywordFormModal from '@/features/adminAiKeyword/AiKeywordFormModal';
import AiKeywordTable from '@/features/adminAiKeyword/AiKeywordTable';
import {
  DEFAULT_TAB_KEY,
  KEYWORD_TABS,
  findKeywordTab,
} from '@/features/adminAiKeyword/keywordLabels';
import { useAdminAiKeywords } from '@/features/adminAiKeyword/queries';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

/** 등록 모달을 연 상태 */
const NEW_KEYWORD = 'new';

/** 버튼 줄 + 표(머리 줄 + 몇 행, 어림값) */
function KeywordListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="ml-auto h-10 w-[120px]" />
      <SkeletonCard className="h-[300px]" />
    </div>
  );
}

/**
 * [키워드 사전] SCR-ADM-081
 * - 탭은 ?tab=verb|date|cycle|schedule|checkup|expense, 없거나 모르면 등록 표현
 * - 탭 아래 한 줄은 그 탭 단어 예시(tab.hint)
 * - [키워드 등록] -> 지금 탭에 등록 모달, 행 [수정] -> 수정 모달(삭제 포함)
 * - 뉴스 분류 키워드는 펫뉴스 화면(SCR-ADM-050), 시각은 서버 규칙이라 탭이 없다
 */
export default function AdminAiKeywordsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = findKeywordTab(searchParams.get('tab'));
  /** 열린 모달: null(닫힘), NEW_KEYWORD(등록), 키워드 행(수정) */
  const [editing, setEditing] = useState(null);

  const keywords = useAdminAiKeywords({
    dictUsgCd: tab.dictUsgCd,
    kwrdClsfNm: tab.kwrdClsfNm,
  });

  const handleTabSelect = (nextKey) =>
    setSearchParams(nextKey === DEFAULT_TAB_KEY ? {} : { tab: nextKey });

  const renderList = () => {
    if (keywords.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">
            키워드 사전을 불러오지 못했어요.
          </p>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => keywords.refetch()}
          >
            다시 시도
          </button>
        </div>
      );
    }
    if (keywords.data.length === 0) {
      return (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          등록된 키워드가 없어요
        </p>
      );
    }
    return (
      <AiKeywordTable tab={tab} keywords={keywords.data} onEdit={setEditing} />
    );
  };

  /** 본문: 로딩 / 403 / 목록 */
  const renderBody = () => {
    if (keywords.isPending) return <KeywordListSkeleton />;
    if (isForbiddenError(keywords.error)) {
      return <AdminForbidden message={keywords.error.message} />;
    }
    return (
      <>
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className={`${BTN_PRIMARY} max-[760px]:w-full`}
            onClick={() => setEditing(NEW_KEYWORD)}
          >
            키워드 등록
          </button>
        </div>
        {renderList()}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">키워드 사전</h1>
      <div
        role="tablist"
        aria-label="키워드 용도"
        className="mb-4 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]"
      >
        {KEYWORD_TABS.map(({ key, label }) => {
          const isSelected = key === tab.key;
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
            </button>
          );
        })}
      </div>
      <div role="tabpanel">
        <p className="mb-4 text-sm leading-[22px] text-subtle">{tab.hint}</p>
        {renderBody()}
      </div>
      {editing != null && (
        <AiKeywordFormModal
          key={tab.key}
          tab={tab}
          keyword={editing === NEW_KEYWORD ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
