import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import CommentTable from '@/features/adminCommunity/CommentTable';
import PostDetailInfo from '@/features/adminCommunity/PostDetailInfo';
import PostHistory from '@/features/adminCommunity/PostHistory';
import {
  POST_STATUS_BLIND,
  POST_STATUS_NORMAL,
} from '@/features/adminCommunity/postLabels';
import PostStatusModal from '@/features/adminCommunity/PostStatusModal';
import { useAdminPost } from '@/features/adminCommunity/queries';
import { PATHS } from '@/routes/paths';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

/** 버튼 줄 + 상세 + 이력 + 댓글 자리 */
function PostDetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full" />
      <SkeletonCard className="h-[340px]" />
      <SkeletonCard className="h-[120px]" />
      <SkeletonCard className="h-[200px]" />
    </div>
  );
}

/**
 * [게시글 상세]
 * - 정상 글은 [블라인드], 블라인드 글은 [복구], 삭제 글은 조회만
 * - 댓글 쪽 번호는 ?page=
 */
export default function AdminPostDetailPage() {
  const { pstSn: pstSnParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openModal, setOpenModal] = useState(null);

  const pstSn = Number(pstSnParam);
  const post = useAdminPost(pstSn);

  const page = Number(searchParams.get('page')) || 1;

  const handlePageChange = (nextPage) => setSearchParams({ page: nextPage });
  const handleModalClose = () => setOpenModal(null);
  const handleRetry = () => post.refetch();

  /** 본문: 로딩 / 403 / 없는 글 / 그 밖의 오류 / 상세 */
  const renderBody = () => {
    if (post.isPending) return <PostDetailSkeleton />;
    if (isForbiddenError(post.error)) {
      return <AdminForbidden message={post.error.message} />;
    }
    if (post.error?.code === 'POST_NOT_FOUND') {
      return (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-[14px] border border-line bg-white py-16"
        >
          <p className="text-base text-subtle">게시글을 찾을 수 없어요</p>
          <Link to={PATHS.ADMIN_POSTS} className={BTN_SECONDARY}>
            목록으로
          </Link>
        </div>
      );
    }
    if (post.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">게시글을 불러오지 못했어요.</p>
          <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      );
    }

    const canBlind = post.data.pstSttsCd === POST_STATUS_NORMAL;
    const canRestore = post.data.pstSttsCd === POST_STATUS_BLIND;

    return (
      <>
        <div className="mb-4 flex items-center justify-between gap-2">
          <Link to={PATHS.ADMIN_POSTS} className={BTN_SECONDARY}>
            목록으로
          </Link>
          {canBlind && (
            <button
              type="button"
              className={BTN_DANGER}
              onClick={() => setOpenModal('blind')}
            >
              블라인드
            </button>
          )}
          {canRestore && (
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={() => setOpenModal('restore')}
            >
              복구
            </button>
          )}
        </div>
        <PostDetailInfo post={post.data} />
        <h2 className="mt-6 mb-3 text-lg font-bold text-ink">상태 이력</h2>
        <PostHistory histories={post.data.statusHistories} />
        <h2 className="mt-6 mb-3 text-lg font-bold text-ink">댓글</h2>
        <CommentTable
          params={{ pstSn, page, size: PAGE_SIZE }}
          onPageChange={handlePageChange}
          isPostHidden
          skeletonClassName="h-[200px]"
        />
        {openModal && (
          <PostStatusModal
            post={post.data}
            isRestore={openModal === 'restore'}
            onClose={handleModalClose}
          />
        )}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">게시글 상세</h1>
      {renderBody()}
    </div>
  );
}
