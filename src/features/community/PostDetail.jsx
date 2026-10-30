import { ChevronLeft, ChevronRight, Flag, Heart, User } from 'lucide-react';
import { useState } from 'react';
import { generatePath, Link, useLocation, useNavigate } from 'react-router-dom';
import ConfirmModal from '@/components/ConfirmModal';
import PostBody from '@/components/PostBody';
import ReportModal from '@/components/ReportModal';
import SharePanel from '@/components/SharePanel';
import { showToast } from '@/components/toastStore';
import { PATHS } from '@/routes/paths';
import { formatDateTime, formatMonthDayDot } from '@/utils/formatDate';
import { getPostImageUrl } from './api';
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
  const toggleLike = useTogglePostLike();
  const remove = useDeletePost();
  const report = useReportPost();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const listTo = `${PATHS.COMMUNITY}${state?.listSearch ?? ''}`;
  const isLiked = post.liked;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-10">
      <div className="flex min-w-0 flex-col gap-4">
        <article className="rounded-[14px] border border-[#e2e7e7] bg-white px-9 pt-8 pb-7 max-[760px]:px-5 max-[760px]:pt-[22px] max-[760px]:pb-5">
          <PostBadges post={post} />
          <h2 className="mt-3 text-2xl leading-[1.35] font-bold tracking-[-0.24px] break-words text-[#1a3234] max-[760px]:text-xl">
            {post.pstTtl}
          </h2>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e7e7] pb-6 max-[760px]:pb-5">
            <p className="flex flex-wrap items-center gap-2 text-sm text-[#667374]">
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-full bg-[#e9f2f2] text-[#285a5c]"
              >
                <User size={18} />
              </span>
              <b className="text-base leading-normal font-semibold text-[#1a3234]">
                {post.mbrNcnm}
              </b>
              <i className="text-[#b9c4c4] not-italic">·</i>
              <time>{formatDateTime(post.regDt)}</time>
              <i className="text-[#b9c4c4] not-italic">·</i>
              <span>조회 {post.inqCnt}</span>
            </p>
            {post.owner && (
              <p className="flex items-center gap-2 text-sm font-medium text-[#566465]">
                <Link
                  to={generatePath(PATHS.COMMUNITY_POST_EDIT, {
                    pstSn: post.pstSn,
                  })}
                  className="hover:text-[#1a3234]"
                >
                  수정
                </Link>
                <i className="text-[#d3dae2] not-italic">·</i>
                <button
                  type="button"
                  onClick={() => setIsDeleting(true)}
                  className="cursor-pointer hover:text-[#1a3234]"
                >
                  삭제
                </button>
              </p>
            )}
          </div>

          <PostBody content={post.pstCn}>
            {post.imgs.length > 0 && (
              <div className="mb-6 flex flex-col gap-3">
                {post.imgs.map((img, index) => (
                  <img
                    key={img.atchFileSn}
                    src={getPostImageUrl(img.atchFileSn)}
                    alt={`첨부 이미지 ${index + 1}`}
                    className="h-auto max-w-full rounded-[10px]"
                  />
                ))}
              </div>
            )}
          </PostBody>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[#e2e7e7] pt-4">
            <Link
              to={listTo}
              className="inline-flex min-h-9 items-center gap-2 text-base leading-normal font-medium text-[#566465] transition-colors hover:text-[#1a3234]"
            >
              <ChevronLeft size={14} aria-hidden="true" />
              <span>
                목록<span className="max-[760px]:hidden">으로</span>
              </span>
            </Link>
            <div className="ml-auto flex items-center gap-2 max-[760px]:gap-1">
              <button
                type="button"
                aria-pressed={isLiked}
                aria-label="좋아요"
                disabled={toggleLike.isPending}
                onClick={() =>
                  toggleLike.mutate({ pstSn: post.pstSn, liked: isLiked })
                }
                className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 px-1 text-base font-semibold text-[#3d4a4b] ${isLiked ? 'text-[#f44b21]' : '[&_svg]:text-[#b9c4c4]'}`}
              >
                <Heart size={22} aria-hidden="true" fill="currentColor" />
                {post.rcmdtnCnt}
              </button>
              <i className="mx-1 h-3.5 w-px bg-[#b9c4c4]" aria-hidden="true" />
              <SharePanel title={post.pstTtl} />
              <i className="mx-1 h-3.5 w-px bg-[#b9c4c4]" aria-hidden="true" />
              <button
                type="button"
                aria-label="신고"
                onClick={() => setIsReporting(true)}
                className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 px-1 text-sm font-medium text-[#667374] hover:text-[#1a3234] max-[760px]:min-w-9 max-[760px]:justify-center"
              >
                <Flag
                  size={20}
                  aria-hidden="true"
                  className="min-[761px]:hidden"
                />
                <span className="max-[760px]:hidden">신고</span>
              </button>
            </div>
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
          <div className="flex items-center justify-between pb-2">
            <h2
              id="post-latest-title"
              className="text-lg leading-[1.4] font-bold text-[#1a3234]"
            >
              펫이야기 최신글
            </h2>
            <Link
              to={listTo}
              aria-label="펫이야기 목록으로"
              className="text-[#566465] hover:text-[#1a3234]"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </Link>
          </div>
          <ul>
            {latest?.content.map((item) => (
              <li
                key={item.pstSn}
                className="border-t border-[#e2e7e7] first:border-t-0"
              >
                <Link
                  to={generatePath(PATHS.COMMUNITY_POST_DETAIL, {
                    pstSn: item.pstSn,
                  })}
                  state={state}
                  className="group flex flex-col gap-0.5 py-3"
                >
                  <span className="truncate text-base leading-[1.6] text-[#3d4a4b] group-hover:text-[#285a5c]">
                    {item.pstTtl}
                  </span>
                  <time className="text-sm text-[#667374]">
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
          title="게시글을 삭제할까요? 삭제한 글은 되돌릴 수 없어요"
          confirmLabel="삭제"
          isPending={remove.isPending}
          errorMessage={remove.isError && '게시글을 삭제하지 못했어요'}
          onConfirm={() =>
            remove.mutate(post.pstSn, {
              onSuccess: () => {
                showToast('게시글을 삭제했어요');
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
          targetLabel={`대상: 게시글 · "${post.pstTtl}"`}
          isPending={report.isPending}
          errorMessage={report.isError && report.error.message}
          onSubmit={(values) =>
            report.mutate(
              { pstSn: post.pstSn, ...values },
              {
                onSuccess: () => {
                  showToast('신고가 접수되었어요');
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
