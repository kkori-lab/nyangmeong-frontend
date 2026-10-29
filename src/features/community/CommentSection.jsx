import { Flag, MoreVertical } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import userIcon from '@/assets/user.svg';
import Badge from '@/components/Badge';
import ConfirmModal from '@/components/ConfirmModal';
import ReportModal from '@/components/ReportModal';
import { showToast } from '@/components/toastStore';
import { formatRelativeTime } from '@/utils/formatDate';
const CMNT_MAX = 500;
const PREVIEW_MAX = 30;

const ACT_CLASS =
  'min-h-8 cursor-pointer rounded px-1.5 text-sm font-medium text-[#667374] hover:bg-[#ebf0f0] hover:text-[#1a3234] max-[760px]:min-h-10';

const menuItemClass =
  'flex min-h-10 w-full cursor-pointer items-center gap-2 rounded px-3 text-left text-sm whitespace-nowrap text-[#1a3234] hover:bg-[#f4f6f6]';

/** 회원 기본 프로필(사진이 없을 때): 디자인의 .ava-user */
function Avatar({ className }) {
  return (
    <span
      aria-hidden="true"
      style={{ backgroundImage: `url(${userIcon})` }}
      className={`block shrink-0 rounded-full border border-[#e2e7e7] bg-white bg-cover bg-center ${className}`}
    />
  );
}

function CommentInput({
  inputId,
  placeholder,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}) {
  const [text, setText] = useState('');
  const generatedId = useId();
  const id = inputId ?? generatedId;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!text.trim() || isPending) return;
    onSubmit(text.trim(), () => setText(''));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="sr-only" htmlFor={id}>
        {placeholder}
      </label>
      <textarea
        id={id}
        value={text}
        maxLength={CMNT_MAX}
        placeholder={placeholder}
        onChange={(event) => setText(event.target.value)}
        className="block min-h-20 w-full resize-y rounded-md border border-[#d3dae2] bg-white px-3 py-2.5 text-base leading-[1.6] placeholder:text-[#8c9899] hover:border-[#b9c4c4] focus:border-[#285a5c] focus:ring-2 focus:ring-[#285a5c]/20 focus:outline-none"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-[#667374]">
          {text.length} / {CMNT_MAX}
        </span>
        <span className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-9 min-w-20 cursor-pointer items-center justify-center rounded-md border border-[#e2e7e7] bg-white px-4 text-sm font-semibold text-[#1a3234] hover:bg-[#f4f6f6]"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={!text.trim() || isPending}
            className="inline-flex h-9 min-w-24 cursor-pointer items-center justify-center rounded-md bg-[#e9f2f2] px-4 text-sm font-semibold text-[#1e4a4c] hover:enabled:bg-[#dcebeb] disabled:cursor-not-allowed disabled:opacity-50 max-[760px]:h-11"
          >
            {submitLabel}
          </button>
        </span>
      </div>
    </form>
  );
}

/** 남의 댓글 오른쪽 ⋮ 메뉴: 신고하기 */
function CommentMenu({ comment, onReport }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative -mt-0.5 shrink-0">
      <button
        type="button"
        aria-label="댓글 더보기"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`grid size-8 cursor-pointer place-items-center rounded-full text-[#8c9899] hover:bg-[#ebf0f0] hover:text-[#3d4a4b] ${open ? 'bg-[#ebf0f0] text-[#3d4a4b]' : ''}`}
      >
        <MoreVertical size={20} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+4px)] right-0 z-20 min-w-32 rounded-md border border-[#e2e7e7] bg-white p-1 shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onReport(comment);
            }}
            className={menuItemClass}
          >
            <Flag size={16} aria-hidden="true" className="text-[#667374]" />
            신고하기
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 댓글 한 줄: 프로필 · 닉네임(작성자 배지) · 시간 · 본문 · [답글쓰기]
 * - 루트 댓글에 답글이 있으면 프로필 아래로 세로선(스레드) 연결
 * - 삭제된 댓글은 문구만 남기고 ⋮·답글쓰기를 숨김
 */
function CommentRow({
  comment,
  authorSn,
  isReply = false,
  hasReplies = false,
  replyForm,
  onReply,
  onDelete,
  onReport,
}) {
  const isDeleted = comment.delYn;
  const isMine = comment.owner;
  const isFoundNotice = comment.sysAutoCrtYn;

  return (
    <div
      className={`grid items-start ${isFoundNotice ? 'my-2 rounded-lg border border-warn-line bg-warn-soft px-4 py-3.5' : 'py-2'} ${isReply ? 'grid-cols-[24px_minmax(0,1fr)_auto] gap-2' : 'grid-cols-[40px_minmax(0,1fr)_auto] gap-3 max-[760px]:grid-cols-[32px_minmax(0,1fr)_auto] max-[760px]:gap-2.5'}`}
    >
      <span className="flex flex-col self-stretch">
        <Avatar className={isReply ? 'size-6' : 'size-10 max-[760px]:size-8'} />
        {hasReplies && (
          <span
            aria-hidden="true"
            className="mx-auto mt-1 -mb-2 w-0.5 flex-1 bg-[#e2e7e7]"
          />
        )}
      </span>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#667374]">
          <b className="text-base font-semibold text-[#1a3234]">
            {comment.mbrNcnm}
          </b>
          {isFoundNotice && <Badge tone="ok">찾았어요</Badge>}
          {comment.mbrSn === authorSn && !isFoundNotice && (
            <Badge tone="brand" className="h-[22px] px-2">
              작성자
            </Badge>
          )}
          <time>{formatRelativeTime(comment.regDt)}</time>
        </p>
        {isDeleted ? (
          <p className="mt-0.5 text-base leading-[1.6] text-[#667374]">
            삭제된 댓글입니다
          </p>
        ) : (
          <>
            <p className="mt-0.5 text-base leading-[1.6] break-words whitespace-pre-line text-[#1a3234]">
              {comment.cmntCn}
            </p>
            <p
              className={`mt-0.5 -ml-1.5 flex items-center ${isFoundNotice ? 'hidden' : ''}`}
            >
              <button
                type="button"
                onClick={() => onReply(comment)}
                className={ACT_CLASS}
              >
                답글쓰기
              </button>
              {isMine && (
                <button
                  type="button"
                  onClick={() => onDelete(comment)}
                  className={ACT_CLASS}
                >
                  삭제
                </button>
              )}
            </p>
          </>
        )}
        {replyForm && <div className="mt-2">{replyForm}</div>}
      </div>
      {!isDeleted && !isMine && !isFoundNotice && (
        <CommentMenu comment={comment} onReport={onReport} />
      )}
    </div>
  );
}

/** 답글: 왼쪽에 ㄴ 모양 연결선, 마지막이 아니면 세로선이 아래로 연결 */
const REPLY_ITEM_CLASS =
  "relative before:absolute before:top-0 before:-left-[33px] before:h-[21px] before:w-[27px] before:rounded-bl-[14px] before:border-b-2 before:border-l-2 before:border-[#e2e7e7] before:content-[''] [&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:top-0 [&:not(:last-child)]:after:bottom-0 [&:not(:last-child)]:after:-left-[33px] [&:not(:last-child)]:after:border-l-2 [&:not(:last-child)]:after:border-[#e2e7e7] [&:not(:last-child)]:after:content-[''] max-[760px]:before:-left-[27px] max-[760px]:before:w-[23px] max-[760px]:[&:not(:last-child)]:after:-left-[27px]";

/**
 * 댓글 영역: 댓글 + 대댓글 1단계
 * - targetSn: 글 번호, authorSn: 글쓴이 회원번호(그 댓글에 「작성자」 배지), hooks: 게시판별 댓글 훅 묶음(useComments·useCreateComment·useDeleteComment·useReportComment)
 * - title·placeholder: 제목과 입력창 문구(실종센터는 「제보 · 댓글」), inputId: 맨 위 입력창 id(밖에서 포커스를 줄 때)
 * - sysAutoCrtYn이 true인 댓글(찾았어요 안내)은 강조 표시, 답글·신고 불가
 * - 답글에 단 답글은 원 댓글 스레드에 이어서 붙는다(prntCmntSn은 항상 원 댓글)
 * - 삭제된 댓글은 문구로 바뀌고 답글은 유지. 댓글 수는 삭제된 댓글 제외
 */
export default function CommentSection({
  targetSn,
  authorSn,
  hooks,
  title = '댓글',
  placeholder = '댓글을 입력하세요',
  inputId,
}) {
  const { useComments, useCreateComment, useDeleteComment, useReportComment } =
    hooks;
  const { data: comments = [] } = useComments(targetSn);
  const create = useCreateComment();
  const remove = useDeleteComment();
  const report = useReportComment();
  const [replyTo, setReplyTo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);

  const roots = comments.filter((row) => !row.prntCmntSn);
  const repliesOf = (rootSn) =>
    comments.filter((row) => row.prntCmntSn === rootSn);
  const count = comments.filter((row) => !row.delYn).length;

  const handleCreate = (prntCmntSn) => (cmntCn, reset) =>
    create.mutate(
      { targetSn, prntCmntSn, cmntCn },
      {
        onSuccess: () => {
          reset();
          setReplyTo(null);
        },
        onError: () => showToast('댓글을 등록하지 못했어요'),
      },
    );

  /** 눌린 댓글 아래에 입력창을 열고, 등록할 때는 원 댓글의 답글로 추가 */
  const renderReplyForm = (comment) =>
    replyTo === comment.cmntSn && (
      <CommentInput
        placeholder="답글을 입력하세요"
        submitLabel="답글 등록"
        isPending={create.isPending}
        onSubmit={handleCreate(comment.prntCmntSn ?? comment.cmntSn)}
        onCancel={() => setReplyTo(null)}
      />
    );

  const rowProps = {
    onReply: (comment) => setReplyTo(comment.cmntSn),
    onDelete: setDeleteTarget,
    onReport: setReportTarget,
  };

  const preview = (comment) =>
    comment.cmntCn.length > PREVIEW_MAX
      ? `${comment.cmntCn.slice(0, PREVIEW_MAX)}…`
      : comment.cmntCn;

  return (
    <section
      id={inputId ? `${inputId}-section` : undefined}
      aria-labelledby="post-cmnt-title"
      className="scroll-mt-24 rounded-[14px] border border-[#e2e7e7] bg-white px-9 py-8 max-[760px]:px-5 max-[760px]:py-6"
    >
      <h2
        id="post-cmnt-title"
        className="text-lg font-bold tracking-[-0.18px] text-[#1a3234]"
      >
        {title} <b className="text-[#2f6f57]">{count}</b>
      </h2>
      <ul className="mt-3">
        {roots.map((root) => (
          <li key={root.cmntSn}>
            <CommentRow
              comment={root}
              authorSn={authorSn}
              hasReplies={repliesOf(root.cmntSn).length > 0}
              replyForm={renderReplyForm(root)}
              {...rowProps}
            />
            {repliesOf(root.cmntSn).length > 0 && (
              <ul className="pl-[52px] max-[760px]:pl-[42px]">
                {repliesOf(root.cmntSn).map((reply) => (
                  <li key={reply.cmntSn} className={REPLY_ITEM_CLASS}>
                    <CommentRow
                      comment={reply}
                      authorSn={authorSn}
                      isReply
                      replyForm={renderReplyForm(reply)}
                      {...rowProps}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <CommentInput
          inputId={inputId}
          placeholder={placeholder}
          submitLabel="댓글 등록"
          isPending={create.isPending}
          onSubmit={handleCreate(null)}
        />
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="댓글을 삭제할까요?"
          confirmLabel="삭제"
          isPending={remove.isPending}
          errorMessage={remove.isError && '댓글을 삭제하지 못했어요'}
          onConfirm={() =>
            remove.mutate(
              { targetSn, cmntSn: deleteTarget.cmntSn },
              { onSuccess: () => setDeleteTarget(null) },
            )
          }
          onCancel={() => {
            remove.reset();
            setDeleteTarget(null);
          }}
        />
      )}
      {reportTarget && (
        <ReportModal
          title="댓글 신고하기"
          targetLabel={`대상: 댓글 · "${reportTarget.mbrNcnm}" · "${preview(reportTarget)}"`}
          isPending={report.isPending}
          errorMessage={report.isError && report.error.message}
          onSubmit={(values) =>
            report.mutate(
              { cmntSn: reportTarget.cmntSn, ...values },
              {
                onSuccess: () => {
                  showToast('신고가 접수되었어요');
                  setReportTarget(null);
                },
              },
            )
          }
          onClose={() => {
            report.reset();
            setReportTarget(null);
          }}
        />
      )}
    </section>
  );
}
