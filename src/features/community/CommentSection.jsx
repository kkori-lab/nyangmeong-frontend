import { Flag, MoreVertical } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import ConfirmModal from '@/components/ConfirmModal';
import { INPUT } from '@/components/formStyles';
import ReportModal from '@/components/ReportModal';
import { showToast } from '@/components/toastStore';
import { fitHeight } from '@/utils/fitHeight';
import { publicFileUrl } from '@/utils/fileUrl';
import { PROFANITY_MESSAGE, isProfanityError } from '@/utils/profanity';
import { formatRelativeTime } from '@/utils/formatDate';
import { stripLeadingEmoji } from './missingCodes';
const CMNT_MAX = 500;
const PREVIEW_MAX = 30;

const ACT_CLASS =
  'min-h-8 cursor-pointer rounded px-2 text-sm font-medium text-subtle hover:bg-surface-3 hover:text-ink max-[760px]:min-h-11';

const menuItemClass =
  'flex min-h-10 w-full cursor-pointer items-center gap-2 rounded px-3 text-left text-sm whitespace-nowrap text-ink hover:bg-surface-2';

/** 회원 기본 프로필(사진이 없을 때): 디자인의 .ava-user */
function CommentInput({
  inputId,
  placeholder,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
  mention = '',
}) {
  /** mention: 답글 대상 「@닉네임 」. 입력창에 미리 넣고, 보낼 때는 뗀다(서버가 rplyTrgtMbrNcnm으로 따로 준다) */
  const [text, setText] = useState(mention);
  const generatedId = useId();
  const id = inputId ?? generatedId;
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fitHeight(inputRef.current);
  }, [text]);

  useEffect(() => {
    const el = inputRef.current;
    if (mention && el) {
      el.focus();
      el.setSelectionRange(mention.length, mention.length);
    }
  }, [mention]);

  const body =
    mention && text.startsWith(mention) ? text.slice(mention.length) : text;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!body.trim() || isPending) return;
    onSubmit(body.trim(), () => setText(mention), setError);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="sr-only" htmlFor={id}>
        {placeholder}
      </label>
      <textarea
        ref={inputRef}
        rows={1}
        id={id}
        value={text}
        maxLength={CMNT_MAX + mention.length}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => {
          /** 한 줄 입력칸처럼 쓰되 길어지면 줄바꿈되어 높이가 늘어난다. 붙여 넣은 줄바꿈은 공백으로 */
          setText(
            event.target.value
              .replaceAll(/[\r\n]+/g, ' ')
              .slice(0, CMNT_MAX + mention.length),
          );
          setError('');
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            event.preventDefault();
            event.currentTarget.form.requestSubmit();
          }
        }}
        className={`${INPUT} min-h-10 resize-none overflow-hidden py-2 leading-6`}
      />
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-subtle">
          {body.length} / {CMNT_MAX}
        </span>
        <span className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={`${BTN_SECONDARY} min-w-20 cursor-pointer`}
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={!body.trim() || isPending}
            className={`${BTN_PRIMARY} min-w-24 cursor-pointer max-[760px]:h-11`}
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
    <div ref={rootRef} className="relative -mt-1 shrink-0">
      <button
        type="button"
        aria-label="댓글 더보기"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`grid size-8 cursor-pointer place-items-center rounded-full text-placeholder hover:bg-surface-3 hover:text-ink-2 ${open ? 'bg-surface-3 text-ink-2' : ''}`}
      >
        <MoreVertical size={20} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+4px)] right-0 z-20 min-w-32 rounded-md border border-line bg-white p-1"
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
            <Flag size={16} aria-hidden="true" className="text-subtle" />
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
      className={`grid items-start ${isFoundNotice ? 'my-2 rounded-lg border border-warn-line bg-warn-soft px-4 py-4' : 'py-2'} ${isReply ? 'grid-cols-[24px_minmax(0,1fr)_auto] gap-2' : 'grid-cols-[32px_minmax(0,1fr)_auto] gap-3 max-[760px]:gap-2'}`}
    >
      <span className="flex flex-col self-stretch">
        <Avatar
          src={publicFileUrl(comment.mbrAtchFileSn)}
          className={isReply ? 'size-6' : 'size-8'}
          iconSize={isReply ? 14 : 18}
        />
        {hasReplies && (
          <span
            aria-hidden="true"
            className="mx-auto mt-1 -mb-2 w-0.5 flex-1 bg-line"
          />
        )}
      </span>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-subtle">
          <b className="text-base font-semibold text-ink">{comment.mbrNcnm}</b>
          {isFoundNotice && (
            <Badge tone="ok" bordered>
              찾았어요
            </Badge>
          )}
          {comment.mbrSn === authorSn && !isFoundNotice && (
            <Badge tone="brand" bordered>
              작성자
            </Badge>
          )}
          <time>{formatRelativeTime(comment.regDt)}</time>
        </p>
        {isDeleted ? (
          <p className="mt-1 text-base leading-[1.6] text-subtle">
            삭제된 댓글입니다
          </p>
        ) : (
          <>
            <p className="mt-1 text-base leading-[1.6] break-words whitespace-pre-line text-ink">
              {comment.rplyTrgtMbrNcnm && (
                <span className="font-medium text-brand-500">
                  @{comment.rplyTrgtMbrNcnm}{' '}
                </span>
              )}
              {isFoundNotice
                ? stripLeadingEmoji(comment.cmntCn)
                : comment.cmntCn}
            </p>
            <p
              className={`mt-1 -ml-2 flex items-center ${isFoundNotice ? 'hidden' : ''}`}
            >
              {onReply && (
                <button
                  type="button"
                  onClick={() => onReply(comment)}
                  className={ACT_CLASS}
                >
                  답글쓰기
                </button>
              )}
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
  "relative before:absolute before:top-0 before:-left-[29px] before:h-[21px] before:w-[23px] before:rounded-bl-[14px] before:border-b-2 before:border-l-2 before:border-line before:content-[''] [&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:top-0 [&:not(:last-child)]:after:bottom-0 [&:not(:last-child)]:after:-left-[29px] [&:not(:last-child)]:after:border-l-2 [&:not(:last-child)]:after:border-line [&:not(:last-child)]:after:content-[''] max-[760px]:before:-left-[25px] max-[760px]:before:w-[21px] max-[760px]:[&:not(:last-child)]:after:-left-[25px]";

/**
 * 댓글 영역: 댓글 + 대댓글 1단계
 * - targetSn: 글 번호, authorSn: 글쓴이 회원번호(그 댓글에 「작성자」 배지), hooks: 게시판별 댓글 훅 묶음(useComments·useCreateComment·useDeleteComment·useReportComment)
 * - title·placeholder: 제목과 입력창 문구(실종센터는 「제보 · 댓글」), inputId: 맨 위 입력창 id(밖에서 포커스를 줄 때)
 * - sysAutoCrtYn이 true인 댓글(찾았어요 안내)은 강조 표시, 답글·신고 불가
 * - 답글에 단 답글은 원 댓글 스레드에 이어서 붙는다(보낼 때는 누른 댓글 번호, 서버가 원 댓글로 바꿔 저장하고 rplyTrgtMbrNcnm으로 「@닉네임」 응답)
 * - canWrite가 false면 새 댓글 입력칸과 [답글쓰기]를 숨긴다(찾았어요 처리된 실종 글)
 * - 삭제: 답글이 없는 댓글과 삭제된 답글은 줄이 사라지고 토스트, 답글이 남은 원 댓글은 「삭제된 댓글입니다」로 남는다(마지막 답글이 지워지면 그 줄도 사라짐). 댓글 수는 삭제된 댓글 제외
 */
export default function CommentSection({
  targetSn,
  authorSn,
  hooks,
  title = '댓글',
  placeholder = '댓글을 입력하세요',
  inputId,
  canWrite = true,
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

  /** 삭제된 답글은 그리지 않고, 삭제된 원 댓글은 보이는 답글이 남아 있을 때만 그린다 */
  const repliesOf = (rootSn) =>
    comments.filter((row) => row.prntCmntSn === rootSn && !row.delYn);
  const roots = comments.filter(
    (row) =>
      !row.prntCmntSn && (!row.delYn || repliesOf(row.cmntSn).length > 0),
  );
  const count = comments.filter((row) => !row.delYn).length;

  /** 삭제하면 줄이 사라지는 댓글인지: 답글이거나, 보이는 답글이 없는 원 댓글 */
  const vanishesOnDelete = (comment) =>
    Boolean(comment.prntCmntSn) || repliesOf(comment.cmntSn).length === 0;

  const handleCreate = (prntCmntSn) => (cmntCn, reset, fail) =>
    create.mutate(
      { targetSn, prntCmntSn, cmntCn },
      {
        onSuccess: () => {
          reset();
          setReplyTo(null);
        },
        /** 서버가 금칙어로 거절하면 토스트 대신 입력창 아래에 안내 */
        onError: (error) =>
          isProfanityError(error)
            ? fail(PROFANITY_MESSAGE)
            : showToast('댓글을 등록하지 못했어요', { type: 'error' }),
      },
    );

  /**
   * 눌린 댓글 아래에 입력창을 열고, 눌린 댓글 번호를 부모로 보낸다
   * - 답글에 단 답글을 원 댓글 스레드로 올리는 것은 서버가 한다. 원 댓글 번호를 보내면 원 댓글이 삭제된 스레드에서 거절된다
   */
  const renderReplyForm = (comment) =>
    replyTo === comment.cmntSn && (
      <CommentInput
        placeholder="답글을 입력하세요"
        submitLabel="등록하기"
        isPending={create.isPending}
        onSubmit={handleCreate(comment.cmntSn)}
        onCancel={() => setReplyTo(null)}
        mention={comment.prntCmntSn ? `@${comment.mbrNcnm} ` : ''}
      />
    );

  const rowProps = {
    onReply: canWrite ? (comment) => setReplyTo(comment.cmntSn) : undefined,
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
      className="scroll-mt-24 rounded-[14px] border border-line bg-white px-9 py-8 max-[760px]:px-5 max-[760px]:py-6"
    >
      <h2
        id="post-cmnt-title"
        className="text-lg font-bold tracking-[-0.01em] text-ink"
      >
        {title} <b className="text-ok">{count}</b>
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
              <ul className="pl-11 max-[760px]:pl-10">
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

      {canWrite && (
        <div className="mt-6">
          <CommentInput
            inputId={inputId}
            placeholder={placeholder}
            submitLabel="등록하기"
            isPending={create.isPending}
            onSubmit={handleCreate(null)}
          />
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="댓글을 삭제할까요?"
          description="삭제하면 되돌릴 수 없어요."
          confirmLabel="삭제하기"
          isDanger
          isPending={remove.isPending}
          errorMessage={remove.isError && '댓글을 삭제하지 못했어요'}
          onConfirm={() => {
            const vanishes = vanishesOnDelete(deleteTarget);
            remove.mutate(
              { targetSn, cmntSn: deleteTarget.cmntSn },
              {
                onSuccess: () => {
                  setDeleteTarget(null);
                  if (vanishes)
                    showToast('댓글이 삭제되었습니다', { type: 'success' });
                },
              },
            );
          }}
          onCancel={() => {
            remove.reset();
            setDeleteTarget(null);
          }}
        />
      )}
      {reportTarget && (
        <ReportModal
          title="댓글 신고하기"
          targetLabel={`"${reportTarget.mbrNcnm}" · "${preview(reportTarget)}"`}
          isPending={report.isPending}
          errorMessage={report.isError && report.error.message}
          onSubmit={(values) =>
            report.mutate(
              { cmntSn: reportTarget.cmntSn, ...values },
              {
                onSuccess: () => {
                  showToast('신고가 접수되었어요', { type: 'success' });
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
