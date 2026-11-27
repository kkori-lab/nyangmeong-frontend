import {
  CalendarDays,
  Clock,
  Flag,
  LockKeyhole,
  MapPin,
  PartyPopper,
  Palette,
  PawPrint,
  Phone,
  Tag,
} from 'lucide-react';
import { useState } from 'react';
import { generatePath, Link, useLocation, useNavigate } from 'react-router-dom';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import { TEXT_ACTION, TEXT_ACTION_DANGER } from '@/components/buttonStyles';
import ConfirmModal from '@/components/ConfirmModal';
import LikeButton from '@/components/LikeButton';
import PostBody from '@/components/PostBody';
import ReportModal from '@/components/ReportModal';
import SharePanel from '@/components/SharePanel';
import { showToast } from '@/components/toastStore';
import { PATHS } from '@/routes/paths';
import {
  addDays,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  getYmdOf,
} from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';
import { pickJosa } from '@/utils/josa';
import { LIST_RAIL_COLS } from '@/constants/listLayout';
import AttachedImages from '../AttachedImages';
import CommentSection from '../CommentSection';
import {
  EXTEND_DAYS,
  getBreedName,
  getPetLabel,
  getPetName,
  isExpired,
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
import {
  formatSeenAt,
  getRemainDays,
  MISSING_COMMENT_INPUT_ID,
} from './missingUtils';

const ARTICLE_CLASS =
  'rounded-[14px] border border-line bg-white px-9 pt-8 pb-7 max-[760px]:px-5 max-[760px]:pt-6 max-[760px]:pb-5';
const NOTE_CLASS =
  'mt-5 flex items-start gap-2 rounded-lg px-4 py-3 text-sm leading-[1.6]';

function InfoRow({ icon, label, children }) {
  return (
    <div className="col-span-2 grid grid-cols-subgrid border-b border-line py-4">
      <dt className="flex h-6 min-w-[120px] items-center gap-2 font-semibold whitespace-nowrap text-ink-2 max-[760px]:min-w-0">
        {icon}
        {label}
      </dt>
      <dd className="min-w-0 leading-6 break-words text-ink">{children}</dd>
    </div>
  );
}

/** 제목 위: 상태 · 반려동물 종류 배지, 제목, 작성자 · 등록일시 · 조회수 */
/** actions: 작성자 줄 오른쪽(좁은 폭에서는 아래)에 두는 작성자 메뉴 */
function PostHead({ post, children, actions }) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {post.owner && (
          <Badge tone="mine" bordered>
            내 글
          </Badge>
        )}
        <MissingStatusBadge post={post} />
        {post.petSeCd && (
          <Badge tone="outline">{getPetName(post.petSeCd)}</Badge>
        )}
      </div>
      <h2
        id="missing-title"
        className="mt-3 text-2xl leading-[1.35] font-bold tracking-[-0.01em] break-words text-ink max-[760px]:text-lg"
      >
        {post.pstTtl}
      </h2>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-6 max-[760px]:pb-5">
        <p className="flex flex-wrap items-center gap-2 text-sm text-subtle">
          <Avatar src={publicFileUrl(post.mbrAtchFileSn)} className="size-8" />
          {post.mbrNcnm && (
            <b className="text-base leading-normal font-semibold text-ink">
              {post.mbrNcnm}
            </b>
          )}
          {children}
        </p>
        {actions}
      </div>
    </>
  );
}

const Dot = () => <i className="text-line-strong not-italic">·</i>;

/**
 * 찾았어요로 바뀐 글을 작성자가 아닌 사람이 볼 때: 제목 · 상태 · 처리 시각과 완료 안내만
 * - 서버가 제목·상태·처리 시각 외에는 null로 줌(작성자·등록일·이름 없음)
 */
function FoundPublicView({ post, listTo }) {
  const { data: rail } = useMissingRail();
  return (
    <div
      className={`grid ${LIST_RAIL_COLS} items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-10`}
    >
      <article className={ARTICLE_CLASS} aria-labelledby="missing-title">
        <PostHead post={post}>
          <span>{formatDate(post.dscvSwtcDt)} 찾음</span>
        </PostHead>
        <div
          role="status"
          className="mt-6 flex flex-col items-center gap-2 rounded-[14px] border border-tone-green-fg/12 bg-tone-green-bg px-6 py-9 text-center"
        >
          <PartyPopper
            size={48}
            aria-hidden="true"
            className="text-tone-green-fg"
          />
          <h3 className="text-lg font-bold text-ink">
            {post.petNm ? `${post.petNm}${pickJosa(post.petNm, '이/가')} ` : ''}
            무사히 가족의 품으로 돌아갔어요
          </h3>
          <p className="text-ink-2">
            여러분의 제보와 관심 덕분이에요. 감사합니다!
          </p>
        </div>
        <p className="mt-5 flex items-start gap-2 text-sm leading-[1.6] text-muted">
          <LockKeyhole
            size={18}
            aria-hidden="true"
            className="mt-1 shrink-0 text-subtle"
          />
          <span>
            찾았어요로 바뀐 글은 보호자의 개인정보 보호를 위해 본문 · 사진 ·
            연락처 · 위치 · 댓글을 공개하지 않아요.
          </span>
        </p>
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
                  className="group flex min-h-[52px] items-center gap-2"
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
  const toggleLike = useToggleMissingLike(post.lostTpofSn);
  const remove = useDeleteMissing();
  const report = useReportMissing();
  const markFound = useMarkMissingFound();
  const extend = useExtendMissing();
  const [modal, setModal] = useState('');
  const listTo = `${PATHS.COMMUNITY_MISSING}${state?.listSearch ?? ''}`;
  const isMine = post.owner;
  const found = isFound(post);
  /** 만료는 작성자에게만 옴. 서버가 수정·찾았어요·연장을 받지 않아 삭제만 남김 */
  const expired = isExpired(post);
  const isLiked = post.liked;
  const breed = getBreedName(post);
  const remainDays = isMine && !found && !expired ? getRemainDays(post) : null;
  const expiringSoon = remainDays !== null && remainDays <= 7;

  if (found && !isMine) return <FoundPublicView post={post} listTo={listTo} />;

  const closeModal = () => setModal('');

  const handleFound = () =>
    markFound.mutate(post.lostTpofSn, {
      onSuccess: () => {
        closeModal();
        showToast('찾았어요로 바꿨어요', { type: 'success' });
      },
    });

  const handleExtend = () =>
    extend.mutate(post.lostTpofSn, {
      onSuccess: () => {
        closeModal();
        showToast(
          `게시 기간이 ${formatDate(addDays(getYmdOf(post.expryCrtrDt), EXTEND_DAYS))}까지 연장됐어요.`,
          { type: 'success' },
        );
      },
    });

  return (
    <div
      className={`grid ${LIST_RAIL_COLS} items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-10`}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <article className={ARTICLE_CLASS} aria-labelledby="missing-title">
          <PostHead
            post={post}
            actions={
              isMine && (
                <p className="flex items-center gap-2">
                  {!expired && !found && (
                    <>
                      <Link
                        to={generatePath(PATHS.COMMUNITY_MISSING_EDIT, {
                          lostTpofSn: post.lostTpofSn,
                        })}
                        className={TEXT_ACTION}
                      >
                        수정
                      </Link>
                      <i className="text-input-line not-italic">·</i>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setModal('delete')}
                    className={`${TEXT_ACTION_DANGER} cursor-pointer`}
                  >
                    삭제
                  </button>
                </p>
              )
            }
          >
            <Dot />
            <time>{formatDateTime(post.regDt)} 등록</time>
            <Dot />
            <span>조회 {post.inqCnt}</span>
          </PostHead>

          {expiringSoon && (
            <p
              className={`${NOTE_CLASS} border border-warn-line bg-warn-soft text-warn`}
            >
              <Clock size={18} aria-hidden="true" className="mt-1 shrink-0" />
              <span>
                게시 종료까지 <b>{remainDays}일</b> 남았어요. 아직 찾고 계시면
                오른쪽에서 <b>30일 더 게시</b>할 수 있어요.
              </span>
            </p>
          )}
          {isMine && found && (
            <p
              className={`${NOTE_CLASS} border border-tone-green-fg/12 bg-tone-green-bg text-tone-green-fg`}
            >
              <span>
                &apos;찾았어요&apos;로 바뀌었어요. 이제 다른 사용자에게는 본문 ·
                사진 · 연락처 · 위치 · 댓글이 보이지 않아요.
              </span>
            </p>
          )}

          <PostBody content={post.pstCn}>
            <AttachedImages imgs={post.imgs} className="mb-6" />
            <section aria-labelledby="missing-info-title">
              <h3
                id="missing-info-title"
                className="text-lg font-bold text-ink"
              >
                실종 정보
              </h3>
              <dl className="mt-3 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 border-t border-line-strong max-[760px]:gap-x-3">
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
                  label="실종 일시"
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
                  label="실종 장소"
                >
                  {post.wtnsPlcNm}
                </InfoRow>
              </dl>
              <div className="mt-3">
                <MissingMap
                  place={{
                    wtnsPlcNm: post.wtnsPlcNm,
                    wtnsPlcLat: Number(post.wtnsPlcLat),
                    wtnsPlcLot: Number(post.wtnsPlcLot),
                  }}
                />
              </div>
            </section>
          </PostBody>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-4">
            <div className="flex items-center gap-2 max-[760px]:gap-1">
              <LikeButton
                isLiked={isLiked}
                count={post.rcmdtnCnt}
                disabled={toggleLike.isPending}
                locked={(found || expired) && !isLiked}
                onToggle={() =>
                  toggleLike.mutate({ pstSn: post.pstSn, liked: isLiked })
                }
              />
              <i
                className="mx-1 h-3.5 w-px bg-line-strong"
                aria-hidden="true"
              />
              <SharePanel title={post.pstTtl} />
            </div>
            {!isMine && (
              <button
                type="button"
                aria-label="신고"
                onClick={() => setModal('report')}
                className="ml-auto inline-flex min-h-9 cursor-pointer items-center gap-2 px-1 text-sm font-medium text-subtle hover:text-ink max-[760px]:min-w-9 max-[760px]:justify-center"
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
          hooks={missingCommentHooks}
          title="제보 · 댓글"
          placeholder="목격한 장소와 시간을 자세히 알려 주시면 큰 도움이 돼요"
          inputId={MISSING_COMMENT_INPUT_ID}
          canWrite={!found}
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
          title="실종 게시글을 삭제할까요?"
          description="삭제한 글과 제보 댓글은 되돌릴 수 없어요. 찾으셨다면 삭제 대신 '찾았어요'를 눌러 주세요."
          confirmLabel="삭제하기"
          isDanger
          isPending={remove.isPending}
          errorMessage={remove.isError && '게시글을 삭제하지 못했어요'}
          onConfirm={() =>
            remove.mutate(post.lostTpofSn, {
              onSuccess: () => {
                showToast('게시글을 삭제했어요', { type: 'success' });
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
          targetLabel={`"${post.pstTtl}"`}
          isPending={report.isPending}
          errorMessage={report.isError && report.error.message}
          onSubmit={(values) =>
            report.mutate(
              { pstSn: post.pstSn, ...values },
              {
                onSuccess: () => {
                  showToast('신고가 접수되었어요', { type: 'success' });
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
