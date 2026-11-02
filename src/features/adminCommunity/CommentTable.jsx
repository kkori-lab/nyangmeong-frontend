import { useState } from 'react';
import { generatePath, Link } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import SkeletonCard from '@/components/SkeletonCard';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import { isForbiddenError } from '@/utils/isForbiddenError';
import CommentDeleteModal from './CommentDeleteModal';
import { useAdminComments } from './queries';

/**
 * [댓글 목록 표]
 * - 삭제된 댓글도 원문 표시, [삭제] 없음
 * - params로 게시글별 조회: 게시글 상세에서는 게시글 칸 숨김
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function CommentTable({
  params,
  onPageChange,
  isPostHidden = false,
  skeletonClassName = 'h-[1025px]',
}) {
  const [deleting, setDeleting] = useState(null);
  const comments = useAdminComments(params);

  const handleRetry = () => comments.refetch();
  const handleModalClose = () => setDeleting(null);

  if (comments.isPending) {
    return <SkeletonCard className={skeletonClassName} />;
  }
  if (isForbiddenError(comments.error)) {
    return (
      <p role="alert" className="py-16 text-center text-base text-subtle">
        {comments.error.message}
      </p>
    );
  }
  if (comments.isError) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 py-16">
        <p className="text-base text-subtle">댓글을 불러오지 못했어요.</p>
        <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
          다시 시도
        </button>
      </div>
    );
  }
  if (comments.data.content.length === 0) {
    return (
      <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
        {isPostHidden ? '댓글이 없어요' : '조건에 맞는 댓글이 없어요'}
      </p>
    );
  }

  const columns = [
    ...(isPostHidden ? [] : ['게시글']),
    '작성자',
    '내용',
    '상태',
    '작성일',
    '',
  ];

  return (
    <>
      <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-base">
          <thead>
            <tr className="border-b border-line text-sm text-subtle">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-4 py-3 font-semibold"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comments.data.content.map((comment) => (
              <tr
                key={comment.cmntSn}
                className="border-b border-line text-ink-2 last:border-b-0"
              >
                {!isPostHidden && (
                  <td className="max-w-[240px] truncate px-4 py-3">
                    <Link
                      to={generatePath(PATHS.ADMIN_POST_DETAIL, {
                        pstSn: comment.pstSn,
                      })}
                      className="hover:underline"
                    >
                      {comment.pstTtl}
                    </Link>
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    to={generatePath(PATHS.ADMIN_MEMBER_DETAIL, {
                      mbrSn: comment.mbrSn,
                    })}
                    className="hover:underline"
                  >
                    {comment.mbrNcnm}
                  </Link>
                </td>
                <td
                  title={comment.cmntCn}
                  className={`max-w-[360px] truncate px-4 py-3 ${
                    comment.delYn ? 'text-subtle' : ''
                  }`}
                >
                  {comment.cmntCn}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {comment.delYn ? '삭제' : '정상'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                  {formatDate(comment.regDt, { separator: '-' })}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {!comment.delYn && (
                    <button
                      type="button"
                      className="text-danger hover:underline"
                      onClick={() => setDeleting(comment)}
                    >
                      삭제
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 mb-2 text-sm text-subtle">
        총 {comments.data.totalElements.toLocaleString()}건 · {params.size}건씩
      </p>
      <BoardPagination
        page={params.page}
        totalPages={comments.data.totalPages}
        onChange={onPageChange}
      />
      {deleting && (
        <CommentDeleteModal comment={deleting} onClose={handleModalClose} />
      )}
    </>
  );
}
