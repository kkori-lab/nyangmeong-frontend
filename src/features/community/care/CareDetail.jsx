import {
  CalendarClock,
  CalendarDays,
  Clock,
  Flag,
  HeartHandshake,
  MapPin,
  PawPrint,
  Wallet,
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
import { useChatModal } from '@/context/chatModal';
import { PATHS } from '@/routes/paths';
import { formatDate, getTodayYmd } from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';
import { LIST_RAIL_COLS } from '@/constants/listLayout';
import { getCostLabel, getPetBadges, isOpen, RCRT_STTS } from '../careCodes';
import {
  useDeleteCare,
  useReportCare,
  useToggleCareLike,
} from '../careQueries';
import AttachedImages from '../AttachedImages';
import CareAreaMap from './CareAreaMap';
import { CareCheckGuide } from './CareGuideRail';
import CareSideBox from './CareSideBox';
import CareStatusBadge from './CareStatusBadge';
import {
  formatPetKinds,
  formatScheduleDetail,
  getShapeNames,
  splitRegion,
} from './careUtils';

const ARTICLE_CLASS =
  'rounded-[14px] border border-line bg-white px-9 pt-8 pb-7 max-[760px]:px-5 max-[760px]:pt-6 max-[760px]:pb-5';

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

const iconProps = { size: 18, 'aria-hidden': true, className: 'text-subtle' };

const Dot = () => <i className="text-line-strong not-italic">·</i>;

/** 돌봄 요청 상세: 본문 · 돌봄 정보 · 좋아요/공유/신고 · 오른쪽 채팅 상자. 공개 댓글은 없다(문의는 채팅으로) */
export default function CareDetail({ post }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { open: openChatModal } = useChatModal();
  const toggleLike = useToggleCareLike(post.petPrtcRcrtSn);
  const remove = useDeleteCare();
  const report = useReportCare();
  const [modal, setModal] = useState('');
  const listTo = `${PATHS.COMMUNITY_PETCARE}${state?.listSearch ?? ''}`;
  const isMine = post.owner;
  const isLiked = post.liked;
  const badges = [...new Set([...getShapeNames(post), ...getPetBadges(post)])];
  const schedule = formatScheduleDetail(post);
  /** 매칭완료인데 돌봄 종료일이 지났으면 거래 마무리를 안내(일정 협의 글은 종료일이 없어 제외) */
  const isScheduleOver =
    post.rcrtSttsCd === RCRT_STTS.MATCHED &&
    Boolean(post.prtcEndDt) &&
    post.prtcEndDt.slice(0, 10) < getTodayYmd();

  const closeModal = () => setModal('');

  return (
    <div
      className={`grid ${LIST_RAIL_COLS} items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-10`}
    >
      <article className={ARTICLE_CLASS} aria-labelledby="care-title">
        <div className="flex flex-wrap gap-2">
          {post.owner && (
            <Badge tone="mine" bordered>
              내 글
            </Badge>
          )}
          <CareStatusBadge post={post} />
          {badges.map((name) => (
            <Badge key={name} tone="outline">
              {name}
            </Badge>
          ))}
        </div>
        <h2
          id="care-title"
          className="mt-3 text-2xl leading-[1.35] font-bold tracking-[-0.01em] break-words text-ink max-[760px]:text-lg"
        >
          {post.pstTtl}
        </h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line pb-6 max-[760px]:pb-5">
          <p className="flex flex-wrap items-center gap-2 text-sm text-subtle">
            <Avatar
              src={publicFileUrl(post.mbrAtchFileSn)}
              className="size-8"
            />
            <b className="text-base leading-normal font-semibold text-ink">
              {post.mbrNcnm}
            </b>
            <Dot />
            <time>{formatDate(post.regDt)} 등록</time>
            <Dot />
            <span>조회 {post.inqCnt}</span>
          </p>
          {isMine && (
            <p className="flex items-center gap-2">
              <Link
                to={generatePath(PATHS.COMMUNITY_PETCARE_EDIT, {
                  petPrtcRcrtSn: post.petPrtcRcrtSn,
                })}
                className={TEXT_ACTION}
              >
                수정
              </Link>
              <i className="text-input-line not-italic">·</i>
              <button
                type="button"
                onClick={() => setModal('delete')}
                className={`${TEXT_ACTION_DANGER} cursor-pointer`}
              >
                삭제
              </button>
            </p>
          )}
        </div>

        {isScheduleOver && (
          <p
            role="note"
            className="mt-4 flex items-center gap-2 rounded-box bg-warn-soft px-4 py-3 text-sm font-medium text-warn"
          >
            <CalendarClock size={18} aria-hidden="true" className="shrink-0" />
            돌봄 일정이 지났어요. 거래를 마무리해 주세요.
          </p>
        )}

        <PostBody content={post.pstCn}>
          <AttachedImages imgs={post.imgs} className="mb-6" />
          <section aria-labelledby="care-info-title">
            <h3 id="care-info-title" className="text-lg font-bold text-ink">
              돌봄 정보
            </h3>
            <dl className="mt-3 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 border-t border-line-strong max-[760px]:gap-x-3">
              <InfoRow icon={<PawPrint {...iconProps} />} label="반려동물">
                {formatPetKinds(post).map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </InfoRow>
              <InfoRow
                icon={<HeartHandshake {...iconProps} />}
                label="돌봄 형태"
              >
                <span className="flex flex-wrap gap-2">
                  {getShapeNames(post).map((name) => (
                    <Badge key={name} tone="outline">
                      {name}
                    </Badge>
                  ))}
                </span>
              </InfoRow>
              <InfoRow icon={<CalendarDays {...iconProps} />} label="돌봄 일정">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>{schedule.date}</span>
                  {schedule.time && (
                    <span className="inline-flex items-center gap-1">
                      <Clock
                        size={16}
                        aria-hidden="true"
                        className="text-subtle"
                      />
                      시간: {schedule.time}
                    </span>
                  )}
                </span>
              </InfoRow>
              <InfoRow icon={<Wallet {...iconProps} />} label="비용">
                <span className="text-lg leading-6 font-bold tabular-nums">
                  {getCostLabel(post)}
                </span>
              </InfoRow>
              <InfoRow icon={<MapPin {...iconProps} />} label="장소">
                전북 {post.rlsRgnNm} 인근
                <span className="mt-1 block text-sm text-muted">
                  개인정보 보호를 위해 대략적인 위치만 보여요
                </span>
              </InfoRow>
            </dl>
            <CareAreaMap place={splitRegion(post.rlsRgnNm)} className="mt-3" />
          </section>
        </PostBody>

        <p className="mb-4 rounded-lg bg-surface-2 px-4 py-3 text-sm leading-[1.6] text-muted">
          돌봄에 관한 문의와 일정 협의는 [채팅하기]에서 나눠 주세요.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-4">
          <div className="flex items-center gap-2 max-[760px]:gap-1">
            <LikeButton
              isLiked={isLiked}
              count={post.rcmdtnCnt}
              disabled={toggleLike.isPending}
              locked={!isOpen(post)}
              onToggle={() =>
                toggleLike.mutate({ pstSn: post.pstSn, liked: isLiked })
              }
            />
            <i className="mx-1 h-3.5 w-px bg-line-strong" aria-hidden="true" />
            <SharePanel title={post.pstTtl} locked={!isOpen(post)} />
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

      <div className="flex min-w-0 flex-col gap-8">
        <CareSideBox
          post={post}
          onChat={() => openChatModal({ pstSn: post.pstSn })}
          onOpenList={() => openChatModal({ listPstSn: post.pstSn })}
        />
        <CareCheckGuide />
      </div>

      {modal === 'delete' && (
        <ConfirmModal
          title="돌봄 요청을 삭제할까요?"
          description="삭제한 글은 되돌릴 수 없어요. 이미 나눈 채팅 기록은 그대로 남아요."
          confirmLabel="삭제하기"
          isDanger
          isPending={remove.isPending}
          errorMessage={remove.isError && '게시글을 삭제하지 못했어요'}
          onConfirm={() =>
            remove.mutate(post.petPrtcRcrtSn, {
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
