import {
  CalendarDays,
  ChevronLeft,
  Clock,
  Flag,
  Heart,
  LockKeyhole,
  MapPin,
  PartyPopper,
  Palette,
  PawPrint,
  Phone,
  Tag,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { generatePath, Link, useLocation, useNavigate } from 'react-router-dom';
import Badge from '@/components/Badge';
import ConfirmModal from '@/components/ConfirmModal';
import PostBody from '@/components/PostBody';
import ReportModal from '@/components/ReportModal';
import SharePanel from '@/components/SharePanel';
import { showToast } from '@/components/toastStore';
import { PATHS } from '@/routes/paths';
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from '@/utils/formatDate';
import CommentSection from '../CommentSection';
import {
  getBreedName,
  getPetLabel,
  getPetName,
  isFound,
} from '../missingCodes';
import {
  missingCommentHooks,
  useDeleteMissing,
  useExtendMissing,
  useMarkMissingFound,
  useMissingRail,
  useReportMissing,
  useToggleMissingLike,
} from '../missingQueries';
import MissingMap from './MissingMap';
import { ExtendConfirmModal, FoundConfirmModal } from './MissingOwnerModals';
import MissingStatusBadge from './MissingStatusBadge';
import { OwnerSide, VisitorSide } from './MissingSideBox';
import { formatSeenAt, MISSING_COMMENT_INPUT_ID } from './missingUtils';

const ARTICLE_CLASS =
  'rounded-[14px] border border-line bg-white px-9 pt-8 pb-7 max-[760px]:px-5 max-[760px]:pt-[22px] max-[760px]:pb-5';
const NOTE_CLASS =
  'mt-5 flex items-start gap-2 rounded-lg px-4 py-3 text-sm leading-[1.6]';

function InfoRow({ icon, label, children }) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 border-b border-line px-1 py-3.5 max-[760px]:grid-cols-[96px_minmax(0,1fr)] max-[760px]:gap-3">
      <dt className="flex items-center gap-1.5 font-semibold text-ink-2">
        {icon}
        {label}
      </dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
    </div>
  );
}

/** 제목 위: 상태 · 반려동물 종류 배지, 제목, 작성자 · 등록일시 · 조회수 */
function PostHead({ post, children }) {
  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        <MissingStatusBadge post={post} />
        <Badge tone="outline">{getPetName(post.petSeCd)}</Badge>
      </div>
      <h2
        id="missing-title"
        className="mt-3 text-2xl leading-[1.35] font-bold tracking-[-0.24px] break-words text-ink max-[760px]:text-xl"
      >
        {post.pstTtl}
      </h2>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pb-1">
        <p className="flex flex-wrap items-center gap-2 text-sm text-subtle">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-full bg-brand-50 text-brand-500"
          >
            <User size={18} />
          </span>
          <b className="text-base leading-normal font-semibold text-ink">
            {post.wrtrNcknm}
          </b>
          {children}
        </p>
      </div>
    </>
  );
}

const Dot = () => <i className="text-line-strong not-italic">·</i>;

/** 찾았어요로 바뀐 글을 작성자가 아닌 사람이 볼 때: 제목 · 상태 · 처리 시각과 완료 안내만 */
function FoundPublicView({ post, listTo }) {
  const { data: rail } = useMissingRail();
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-10">
      <article className={ARTICLE_CLASS} aria-labelledby="missing-title">
        <PostHead post={post}>
          <Dot />
          <time>{formatDate(post.regDt)} 등록</time>
          <Dot />
          <span>{formatDate(post.dscvSwtcDt)} 찾음</span>
        </PostHead>
        <div
          role="status"
          className="mt-6 flex flex-col items-center gap-2 rounded-[14px] border border-[#cfe3d6] bg-tone-green-bg px-6 py-9 text-center"
        >
          <PartyPopper
            size={48}
            aria-hidden="true"
            className="text-tone-green-fg"
          />
          <h3 className="text-xl font-bold text-ink">
            {post.petNm}가 무사히 가족의 품으로 돌아갔어요
          </h3>
          <p className="text-ink-2">
            여러분의 제보와 관심 덕분이에요. 감사합니다!
          </p>
        </div>
        <p className="mt-5 flex items-start gap-2 text-sm leading-[1.6] text-muted">
          <LockKeyhole
            size={18}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-subtle"
          />
          <span>
            찾았어요로 바뀐 글은 보호자의 개인정보 보호를 위해 본문 · 사진 ·
            연락처 · 위치 · 댓글을 공개하지 않아요.
          </span>
        </p>
        <div className="mt-6 flex border-t border-line pt-4">
          <Link
            to={listTo}
            className="inline-flex min-h-9 items-center gap-2 text-base font-medium text-muted hover:text-ink"
          >
            <ChevronLeft size={14} aria-hidden="true" />
            <span>
              목록<span className="max-[760px]:hidden">으로</span>
            </span>
          </Link>
        </div>
      </article>

      <aside aria-label="최근 실종 소식">
        <section aria-labelledby="missing-found-news-title">
          <h2
            id="missing-found-news-title"
            className="pb-3 text-lg font-bold text-ink"
          >
            최근 실종 소식
          </h2>
          <ul>
            {rail?.news.map((item) => (
              <li
                key={item.lostTpofSn}
                className="border-t border-line first:border-t-0"
              >
                <Link
                  to={generatePath(PATHS.COMMUNITY_MISSING_DETAIL, {
                    lostTpofSn: item.lostTpofSn,
                  })}
                  className="group flex min-h-[52px] items-center gap-2.5"
                >
                  <MissingStatusBadge post={item} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate font-medium text-ink group-hover:text-brand-600">
                    {getPetLabel(item)}
                  </span>
                  <small className="shrink-0 text-sm text-subtle">
                    {formatRelativeTime(item.regDt)}
                  </small>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to={listTo}
            className="mt-1 inline-flex min-h-10 items-center text-sm font-semibold text-brand-600 hover:underline"
          >
            실종센터 전체 보기
          </Link>
        </section>
      </aside>
    </div>
  );
}

export default function MissingDetail({ post }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const toggleLike = useToggleMissingLike();
  const remove = useDeleteMissing();
  const report = useReportMissing();
  const markFound = useMarkMissingFound();
  const extend = useExtendMissing();
  const [modal, setModal] = useState('');
  const listTo = `${PATHS.COMMUNITY_MISSING}${state?.listSearch ?? ''}`;
  const isMine = post.mineYn === 'Y';
  const found = isFound(post);
  const isLiked = post.likeYn === 'Y';
  const breed = getBreedName(post);
  const expiringSoon = isMine && !found && post.rmndDayCnt <= 7;

  if (found && !isMine) return <FoundPublicView post={post} listTo={listTo} />;

  const closeModal = () => setModal('');

  const handleFound = () =>
    markFound.mutate(post.lostTpofSn, {
      onSuccess: () => {
        closeModal();
        showToast('찾았어요로 바꿨어요');
      },
    });

  const handleExtend = () =>
    extend.mutate(post.lostTpofSn, {
      onSuccess: ({ expryCrtrDt }) => {
        closeModal();
        showToast(`게시 기간이 ${formatDate(expryCrtrDt)}까지 연장됐어요.`);
      },
    });

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-10">
      <div className="flex min-w-0 flex-col gap-4">
        <article className={ARTICLE_CLASS} aria-labelledby="missing-title">
          <PostHead post={post}>
            <Dot />
            <time>{formatDateTime(post.regDt)} 등록</time>
            <Dot />
            <span>조회 {post.inqCnt}</span>
          </PostHead>
          {isMine && (
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-muted">
              <Link
                to={generatePath(PATHS.COMMUNITY_MISSING_EDIT, {
                  lostTpofSn: post.lostTpofSn,
                })}
                className="hover:text-ink"
              >
                수정
              </Link>
              <i className="text-input-line not-italic">·</i>
              <button
                type="button"
                onClick={() => setModal('delete')}
                className="cursor-pointer hover:text-ink"
              >
                삭제
              </button>
            </p>
          )}

          {expiringSoon && (
            <p
              className={`${NOTE_CLASS} border border-warn-line bg-warn-soft text-warn`}
            >
              <Clock size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span>
                게시 종료까지 <b>{post.rmndDayCnt}일</b> 남았어요. 아직 찾고
                계시면 오른쪽에서 <b>30일 더 게시</b>할 수 있어요.
              </span>
            </p>
          )}
          {isMine && found && (
            <p
              className={`${NOTE_CLASS} border border-[#cfe3d6] bg-tone-green-bg text-tone-green-fg`}
            >
              <PartyPopper
                size={18}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              />
              <span>
                &apos;찾았어요&apos;로 바뀌었어요. 이제 다른 사용자에게는 본문 ·
                사진 · 연락처 · 위치 · 댓글이 보이지 않아요.
              </span>
            </p>
          )}

          <PostBody content={post.pstCn}>
            {post.atchFiles.length > 0 && (
              <div className="mb-6 flex flex-col gap-3">
                {post.atchFiles.map((file) => (
                  <img
                    key={file.id}
                    src={file.url}
                    alt={file.name}
                    className="h-auto max-w-full rounded-[10px]"
                  />
                ))}
              </div>
            )}
            <section aria-labelledby="missing-info-title" className="mb-8">
              <h3
                id="missing-info-title"
                className="text-lg font-bold text-ink"
              >
                실종 정보
              </h3>
              <dl className="mt-3 border-t border-line-strong">
                <InfoRow
                  icon={
                    <PawPrint
                      size={18}
                      aria-hidden="true"
                      className="text-subtle"
                    />
                  }
                  label="반려동물"
                >
                  {getPetName(post.petSeCd)}
                  {breed && ` · ${breed}`}
                </InfoRow>
                <InfoRow
                  icon={
                    <Palette
                      size={18}
                      aria-hidden="true"
                      className="text-subtle"
                    />
                  }
                  label="털 색상"
                >
                  {post.colrNm}
                </InfoRow>
                {post.chrcCn && (
                  <InfoRow
                    icon={
                      <Tag
                        size={18}
                        aria-hidden="true"
                        className="text-subtle"
                      />
                    }
                    label="특징"
                  >
                    {post.chrcCn}
                  </InfoRow>
                )}
                <InfoRow
                  icon={
                    <CalendarDays
                      size={18}
                      aria-hidden="true"
                      className="text-subtle"
                    />
                  }
                  label="마지막 목격"
                >
                  {formatSeenAt(post.lastWtnsDt)}
                </InfoRow>
                <InfoRow
                  icon={
                    <Phone
                      size={18}
                      aria-hidden="true"
                      className="text-subtle"
                    />
                  }
                  label="연락처"
                >
                  <span className="font-bold tracking-[0.01em]">
                    {post.cnpl}
                  </span>
                </InfoRow>
                <InfoRow
                  icon={
                    <MapPin
                      size={18}
                      aria-hidden="true"
                      className="text-subtle"
                    />
                  }
                  label="목격 장소"
                >
                  {post.wtnsPlcAddr}
                  <span className="mt-0.5 block text-sm text-muted">
                    실종 지역: 전북 {post.sggNm}
                  </span>
                </InfoRow>
              </dl>
              <div className="mt-3">
                <MissingMap
                  place={{
                    wtnsPlcNm: post.wtnsPlcNm,
                    wtnsPlcLat: post.wtnsPlcLat,
                    wtnsPlcLot: post.wtnsPlcLot,
                  }}
                />
              </div>
            </section>
          </PostBody>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-4">
            <Link
              to={listTo}
              className="inline-flex min-h-9 items-center gap-2 text-base leading-normal font-medium text-muted transition-colors hover:text-ink"
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
                onClick={() => toggleLike.mutate(post.pstSn)}
                className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 px-1 text-base font-semibold text-ink-2 ${isLiked ? 'text-[#f44b21]' : '[&_svg]:text-line-strong'}`}
              >
                <Heart size={22} aria-hidden="true" fill="currentColor" />
                {post.rcmdtnCnt}
              </button>
              <i
                className="mx-1 h-3.5 w-px bg-line-strong"
                aria-hidden="true"
              />
              <SharePanel title={post.pstTtl} />
              {!isMine && (
                <>
                  <i
                    className="mx-1 h-3.5 w-px bg-line-strong"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    aria-label="신고"
                    onClick={() => setModal('report')}
                    className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 px-1 text-sm font-medium text-subtle hover:text-ink max-[760px]:min-w-9 max-[760px]:justify-center"
                  >
                    <Flag
                      size={20}
                      aria-hidden="true"
                      className="min-[761px]:hidden"
                    />
                    <span className="max-[760px]:hidden">신고</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </article>

        <CommentSection
          targetSn={post.pstSn}
          authorSn={post.mbrSn}
          hooks={missingCommentHooks}
          title="제보 · 댓글"
          placeholder="목격한 장소와 시간을 자세히 알려 주시면 큰 도움이 돼요"
          inputId={MISSING_COMMENT_INPUT_ID}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-8">
        {isMine ? (
          <OwnerSide
            post={post}
            onFound={() => setModal('found')}
            onExtend={() => setModal('extend')}
          />
        ) : (
          <VisitorSide post={post} />
        )}
      </div>

      {modal === 'delete' && (
        <ConfirmModal
          title="실종 게시글을 삭제할까요? 삭제한 글과 제보 댓글은 되돌릴 수 없어요. 찾으셨다면 삭제 대신 '찾았어요'를 눌러 주세요"
          confirmLabel="삭제하기"
          isPending={remove.isPending}
          errorMessage={remove.isError && '게시글을 삭제하지 못했어요'}
          onConfirm={() =>
            remove.mutate(post.lostTpofSn, {
              onSuccess: () => {
                showToast('게시글을 삭제했어요');
                navigate(listTo, { replace: true });
              },
            })
          }
          onCancel={() => {
            remove.reset();
            closeModal();
          }}
        />
      )}
      {modal === 'found' && (
        <FoundConfirmModal
          post={post}
          isPending={markFound.isPending}
          errorMessage={markFound.isError && '찾았어요로 바꾸지 못했어요'}
          onConfirm={handleFound}
          onClose={() => {
            markFound.reset();
            closeModal();
          }}
        />
      )}
      {modal === 'extend' && (
        <ExtendConfirmModal
          post={post}
          isPending={extend.isPending}
          errorMessage={extend.isError && extend.error.message}
          onConfirm={handleExtend}
          onClose={() => {
            extend.reset();
            closeModal();
          }}
        />
      )}
      {modal === 'report' && (
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
                  closeModal();
                },
              },
            )
          }
          onClose={() => {
            report.reset();
            closeModal();
          }}
        />
      )}
    </div>
  );
}
