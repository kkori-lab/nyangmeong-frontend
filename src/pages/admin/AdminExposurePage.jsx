import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import ConfirmModal from '@/components/ConfirmModal';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { showToast } from '@/components/toastStore';
import CommentaryTable from '@/features/adminCommunity/CommentaryTable';
import HealthTipAssignModal from '@/features/adminCommunity/HealthTipAssignModal';
import HealthTipTable from '@/features/adminCommunity/HealthTipTable';
import PhraseFormModal from '@/features/adminCommunity/PhraseFormModal';
import PhraseTable from '@/features/adminCommunity/PhraseTable';
import {
  useAdminCommentaries,
  useAdminHealthTips,
  useAdminTodayPhrases,
  useUnassignHealthTip,
  useUpdateAdminCommentary,
  useUpdateAdminTodayPhrase,
} from '@/features/adminCommunity/queries';
import { PATHS } from '@/routes/paths';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const TABS = [
  { key: 'tips', label: '오늘의 건강팁' },
  { key: 'phrases', label: '오늘의 한마디' },
  { key: 'comments', label: 'AI 코멘트' },
];
const TAB_KEYS = TABS.map((tab) => tab.key);

const COMMENTARY_PAGE_SIZE = 20;

/** 안내·버튼 줄 + 표: 높이는 행 높이로 계산한 값 */
function ExposureSkeleton({ top, tableClassName }) {
  return (
    <div className="space-y-4" aria-busy="true">
      {top}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-6 w-[320px] max-w-[60%]" />
        <Skeleton className="h-10 w-[112px]" />
      </div>
      <SkeletonCard className={tableClassName} />
    </div>
  );
}

/** 조회 오류: 다시 시도 */
function LoadError({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-16">
      <p className="text-base text-subtle">{message}</p>
      <button type="button" className={BTN_SECONDARY} onClick={onRetry}>
        다시 시도
      </button>
    </div>
  );
}

/** 오늘의 건강팁 탭 */
function HealthTipsTab() {
  const [isAssigning, setIsAssigning] = useState(false);
  /** 해제 확인 중인 행: null이면 닫힘 */
  const [unassigning, setUnassigning] = useState(null);

  const tips = useAdminHealthTips();
  const unassign = useUnassignHealthTip();

  const handleUnassignConfirm = () => {
    unassign.mutate(unassigning.pstSn, {
      onSuccess: () => {
        showToast('건강팁 지정을 해제했어요');
        setUnassigning(null);
      },
    });
  };
  const handleUnassignCancel = () => {
    unassign.reset();
    setUnassigning(null);
  };

  if (tips.isPending) {
    return <ExposureSkeleton tableClassName="h-[230px]" />;
  }
  if (isForbiddenError(tips.error)) {
    return <AdminForbidden message={tips.error.message} />;
  }
  if (tips.isError) {
    return (
      <LoadError
        message="오늘의 건강팁을 불러오지 못했어요."
        onRetry={() => tips.refetch()}
      />
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-subtle">
          지정한 글이 삭제되거나 블라인드되면 자동 선정 글로 바뀌어요.
        </p>
        <button
          type="button"
          className={BTN_PRIMARY}
          onClick={() => setIsAssigning(true)}
        >
          건강팁 지정
        </button>
      </div>
      <HealthTipTable tips={tips.data} onUnassign={setUnassigning} />
      {isAssigning && (
        <HealthTipAssignModal onClose={() => setIsAssigning(false)} />
      )}
      {unassigning && (
        <ConfirmModal
          title="건강팁 지정을 해제할까요?"
          description={`"${unassigning.pstTtl}" 자리는 자동 선정 글로 채워져요.`}
          confirmLabel="지정 해제"
          errorMessage={unassign.error?.message}
          isPending={unassign.isPending}
          onConfirm={handleUnassignConfirm}
          onCancel={handleUnassignCancel}
        />
      )}
    </>
  );
}

/** 오늘의 한마디 탭 */
function PhrasesTab() {
  /** 열린 모달: null 닫힘, { phrase: null } 등록, { phrase } 수정 */
  const [editing, setEditing] = useState(null);

  const phrases = useAdminTodayPhrases();
  const update = useUpdateAdminTodayPhrase();

  const handleToggle = (phrase, next) =>
    update.mutate(
      {
        todayPhrsSn: phrase.todayPhrsSn,
        phrsCn: phrase.phrsCn,
        useYn: next,
      },
      { onError: (error) => showToast(error.message) },
    );

  if (phrases.isPending) {
    return (
      <ExposureSkeleton
        top={<SkeletonCard className="h-[82px]" />}
        tableClassName="h-[290px] max-[760px]:h-[340px]"
      />
    );
  }
  if (isForbiddenError(phrases.error)) {
    return <AdminForbidden message={phrases.error.message} />;
  }
  if (phrases.isError) {
    return (
      <LoadError
        message="오늘의 한마디 문구를 불러오지 못했어요."
        onRetry={() => phrases.refetch()}
      />
    );
  }

  const { todayPhrs, content } = phrases.data;

  return (
    <>
      <section
        aria-label="오늘 노출 문구"
        className="mb-4 rounded-[14px] border border-line bg-surface-2 px-5 py-4"
      >
        <p className="text-sm font-semibold text-ink-2">오늘 노출 문구</p>
        <p
          className={`mt-1 text-base ${todayPhrs ? 'text-ink' : 'text-subtle'}`}
        >
          {todayPhrs?.phrsCn ?? '오늘 고른 문구가 없어요'}
        </p>
      </section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-subtle">
          매일 00:00에 사용 중인 문구 중 하나를 무작위로 골라 보여 줘요.
        </p>
        <button
          type="button"
          className={BTN_PRIMARY}
          onClick={() => setEditing({ phrase: null })}
        >
          문구 등록
        </button>
      </div>
      {content.length === 0 ? (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          등록된 문구가 없어요
        </p>
      ) : (
        <PhraseTable
          phrases={content}
          pendingSn={update.isPending ? update.variables.todayPhrsSn : null}
          onToggle={handleToggle}
          onEdit={(phrase) => setEditing({ phrase })}
        />
      )}
      {editing && (
        <PhraseFormModal
          phrase={editing.phrase}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

/** AI 코멘트 탭 */
function CommentariesTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const commentaries = useAdminCommentaries({
    page,
    size: COMMENTARY_PAGE_SIZE,
  });
  const update = useUpdateAdminCommentary();

  const handleToggle = (commentary, next) =>
    update.mutate(
      { cmntyAiCmtrySn: commentary.cmntyAiCmtrySn, useYn: next },
      { onError: (error) => showToast(error.message) },
    );
  const handlePageChange = (nextPage) =>
    setSearchParams({ tab: 'comments', page: nextPage });

  if (commentaries.isPending) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-6 w-[360px] max-w-full" />
        <SkeletonCard className="h-[1400px] max-[760px]:h-[1800px]" />
        <Skeleton className="mx-auto h-9 w-64" />
      </div>
    );
  }
  if (isForbiddenError(commentaries.error)) {
    return <AdminForbidden message={commentaries.error.message} />;
  }
  if (commentaries.isError) {
    return (
      <LoadError
        message="AI 코멘트를 불러오지 못했어요."
        onRetry={() => commentaries.refetch()}
      />
    );
  }

  const { content, totalElements, totalPages } = commentaries.data;

  return (
    <>
      <p className="mb-4 text-sm text-subtle">
        사용하지 않는 날에는 기본 문구가 나가요. 기본 문구는{' '}
        <Link
          to={PATHS.ADMIN_SETTINGS}
          className="font-semibold text-brand-900 underline underline-offset-2"
        >
          운영 설정
        </Link>
        에서 바꿔요.
      </p>
      {content.length === 0 ? (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          AI 코멘트가 없어요
        </p>
      ) : (
        <>
          <CommentaryTable
            commentaries={content}
            pendingSn={
              update.isPending ? update.variables.cmntyAiCmtrySn : null
            }
            onToggle={handleToggle}
          />
          <p className="mt-3 mb-2 text-sm text-subtle">
            총 {totalElements.toLocaleString()}건 · {COMMENTARY_PAGE_SIZE}건씩
          </p>
          <BoardPagination
            page={page}
            totalPages={totalPages}
            onChange={handlePageChange}
          />
        </>
      )}
    </>
  );
}

/**
 * [노출 콘텐츠]
 * - 탭은 ?tab=tips|phrases|comments, 없거나 모르면 오늘의 건강팁
 * - 탭을 바꾸면 쪽 번호 초기화
 */
export default function AdminExposurePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const tab = TAB_KEYS.includes(tabParam) ? tabParam : 'tips';

  const handleTabSelect = (nextTab) =>
    setSearchParams(nextTab === 'tips' ? {} : { tab: nextTab });

  const renderTab = () => {
    if (tab === 'phrases') return <PhrasesTab />;
    if (tab === 'comments') return <CommentariesTab />;
    return <HealthTipsTab />;
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">노출 콘텐츠</h1>
      <div
        role="tablist"
        aria-label="노출 콘텐츠"
        className="mb-4 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]"
      >
        {TABS.map(({ key, label }) => {
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
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{renderTab()}</div>
    </div>
  );
}
