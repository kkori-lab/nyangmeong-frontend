import { Flag } from 'lucide-react';
import { useState } from 'react';
import { generatePath, Link, useLocation, useNavigate } from 'react-router-dom';
import Avatar from '@/components/Avatar';
import { TEXT_ACTION, TEXT_ACTION_DANGER } from '@/components/buttonStyles';
import ConfirmModal from '@/components/ConfirmModal';
import LikeButton from '@/components/LikeButton';
import PostBody from '@/components/PostBody';
import ReportModal from '@/components/ReportModal';
import SharePanel from '@/components/SharePanel';
import { showToast } from '@/components/toastStore';
import { PATHS } from '@/routes/paths';
import { formatDateTime, formatMonthDayDot } from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';
import { LIST_RAIL_COLS } from '@/constants/listLayout';
import AttachedImages from './AttachedImages';
import CommentSection from './CommentSection';
import PostBadges from './PostBadges';
import {
  postCommentHooks,
  useDeletePost,
  usePostList,
  useReportPost,
  useTogglePostLike,
} from './queries';

const LATEST_SIZE = 5;

export default function PostDetail({ post }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { data: latest } = usePostList({
    page: 1,
    size: LATEST_SIZE,
    bbsCd: post.bbsCd,
  });
  const toggleLike = useTogglePostLike(post.pstSn);
  const remove = useDeletePost();
  const report = useReportPost();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const listTo = `${PATHS.COMMUNITY}${state?.listSearch ?? ''}`;
  const isLiked = post.liked;

  return (
    <div
      className={`grid ${LIST_RAIL_COLS} items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-10`}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <article className="rounded-[14px] border border-line bg-white px-9 pt-8 pb-7 max-[760px]:px-5 max-[760px]:pt-6 max-[760px]:pb-5">
          <PostBadges post={post} />
          <h2 className="mt-3 text-2xl leading-[1.35] font-bold tracking-[-0.01em] break-words text-ink max-[760px]:text-lg">
            {post.pstTtl}
          </h2>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-6 max-[760px]:pb-5">
            <p className="flex flex-wrap items-center gap-2 text-sm text-subtle">
              <Avatar
                src={publicFileUrl(post.mbrAtchFileSn)}
                className="size-8"
              />
              <b className="text-base leading-normal font-semibold text-ink">
                {post.mbrNcnm}
              </b>
              <i className="text-line-strong not-italic">·</i>
              <time>{formatDateTime(post.regDt)}</time>
              <i className="text-line-strong not-italic">·</i>
              <span>조회 {post.inqCnt}</span>
            </p>
            {post.owner && (
              <p className="flex items-center gap-2">
                <Link
                  to={generatePath(PATHS.COMMUNITY_POST_EDIT, {
                    pstSn: post.pstSn,
                  })}
                  className={TEXT_ACTION}
                >
                  수정
                </Link>
                <i className="text-input-line not-italic">·</i>
                <button
                  type="button"
                  onClick={() => setIsDeleting(true)}
                  className={`${TEXT_ACTION_DANGER} cursor-pointer`}
                >
                  삭제
                </button>
              </p>
            )}
          </div>

          <PostBody content={post.pstCn}>
            <AttachedImages imgs={post.imgs} />
          </PostBody>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-4">
            <div className="flex items-center gap-2 max-[760px]:gap-1">
              <LikeButton
                isLiked={isLiked}
                count={post.rcmdtnCnt}
                disabled={toggleLike.isPending}
                onToggle={() =>
                  toggleLike.mutate({ pstSn: post.pstSn, liked: isLiked })
                }
              />
              <i className="mx-1 h-4 w-px bg-line-strong" aria-hidden="true" />
              <SharePanel title={post.pstTtl} />
            </div>
            {!post.owner && (
              <button
                type="button"
                aria-label="신고"
                onClick={() => setIsReporting(true)}
                className="ml-auto inline-flex min-h-9 cursor-pointer items-center gap-2 px-1 text-sm font-medium text-subtle hover:text-ink max-[760px]:min-h-11 max-[760px]:min-w-11 max-[760px]:justify-center"
              >
                <Flag
                  size={20}
                  aria-hidden="true"
                  className="min-[760px]:hidden"
                />
                <span className="max-[760px]:hidden">신고</span>
              </button>
            )}
          </div>
        </article>

        <CommentSection
          targetSn={post.pstSn}
          authorSn={post.mbrSn}
          hooks={postCommentHooks}
        />
      </div>

      <aside aria-label="펫이야기 최신글" className="min-w-0">
        <section aria-labelledby="post-latest-title">
          <div className="pb-2">
            <h2
              id="post-latest-title"
              className="text-lg font-bold tracking-[-0.01em] text-ink"
            >
              펫이야기 최신글
            </h2>
          </div>
          <ul>
            {latest?.content.map((item) => (
              <li
                key={item.pstSn}
                className="border-t border-line first:border-t-0"
              >
                <Link
                  to={generatePath(PATHS.COMMUNITY_POST_DETAIL, {
                    pstSn: item.pstSn,
                  })}
                  state={state}
                  className="group flex flex-col gap-1 py-3"
                >
                  <span className="truncate text-base leading-[1.6] text-ink-2 group-hover:text-brand-500">
                    {item.pstTtl}
                  </span>
                  <time className="text-sm text-subtle">
                    {formatMonthDayDot(item.regDt)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      {isDeleting && (
        <ConfirmModal
          title="게시글을 삭제할까요?"
          description="삭제한 글은 되돌릴 수 없어요."
          confirmLabel="삭제하기"
          isDanger
          isPending={remove.isPending}
          errorMessage={remove.isError && '게시글을 삭제하지 못했어요'}
          onConfirm={() =>
            remove.mutate(post.pstSn, {
              onSuccess: () => {
                showToast('게시글을 삭제했어요', { type: 'success' });
                navigate(listTo, { replace: true });
              },
            })
          }
          onCancel={() => {
            remove.reset();
            setIsDeleting(false);
          }}
        />
      )}
      {isReporting && (
        <ReportModal
          title="게시글 신고하기"
          targetLabel={`"${post.pstTtl}"`}
          isPending={report.isPending}
          errorMessage={report.isError && report.error.message}
          onSubmit={(values) =>
            report.mutate(
              { pstSn: post.pstSn, ...values },
              {
                onSuccess: () => {
                  showToast('신고가 접수되었어요', { type: 'success' });
                  setIsReporting(false);
                },
              },
            )
          }
          onClose={() => {
            report.reset();
            setIsReporting(false);
          }}
        />
      )}
    </div>
  );
}
