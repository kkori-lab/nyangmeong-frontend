import {
  CalendarDays,
  ChevronLeft,
  Flag,
  Heart,
  HeartHandshake,
  MapPin,
  PawPrint,
  User,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { generatePath, Link, useLocation, useNavigate } from 'react-router-dom';
import Badge from '@/components/Badge';
import ConfirmModal from '@/components/ConfirmModal';
import PostBody from '@/components/PostBody';
import ReportModal from '@/components/ReportModal';
import SharePanel from '@/components/SharePanel';
import { showToast } from '@/components/toastStore';
import useChatWindow from '@/hooks/useChatWindow';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import { getCostLabel, getPetBadges } from '../careCodes';
import {
  useDeleteCare,
  useReportCare,
  useToggleCareLike,
} from '../careQueries';
import CareAreaMap from './CareAreaMap';
import { CareCheckGuide } from './CareGuideRail';
import CareSideBox from './CareSideBox';
import CareStatusBadge from './CareStatusBadge';
import {
  formatPetKinds,
  formatScheduleDetail,
  getShapeNames,
} from './careUtils';

const ARTICLE_CLASS =
  'rounded-[14px] border border-line bg-white px-9 pt-8 pb-7 max-[760px]:px-5 max-[760px]:pt-[22px] max-[760px]:pb-5';

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

const iconProps = { size: 18, 'aria-hidden': true, className: 'text-subtle' };

const Dot = () => <i className="text-line-strong not-italic">·</i>;

/** 돌봄 요청 상세: 본문 · 돌봄 정보 · 좋아요/공유/신고 · 오른쪽 채팅 상자. 공개 댓글은 없다(문의는 채팅으로) */
export default function CareDetail({ post }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const openChatWindow = useChatWindow();
  const toggleLike = useToggleCareLike();
  const remove = useDeleteCare();
  const report = useReportCare();
  const [modal, setModal] = useState('');
  const listTo = `${PATHS.COMMUNITY_PETCARE}${state?.listSearch ?? ''}`;
  const isMine = post.mineYn === 'Y';
  const isLiked = post.likeYn === 'Y';
  const badges = [...new Set([...getShapeNames(post), ...getPetBadges(post)])];
  const schedule = formatScheduleDetail(post);

  /** 클릭 핸들러에서 바로 열기: 요청을 기다린 뒤 열면 팝업 차단 */
  const handleChat = (params) => {
    if (!openChatWindow(params)) {
      showToast(
        '팝업이 차단되어 채팅 창을 열지 못했어요. 팝업을 허용해 주세요',
      );
    }
  };

  const closeModal = () => setModal('');

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-8 max-[1101px]:grid-cols-1 max-[1101px]:gap-10">
      <article className={ARTICLE_CLASS} aria-labelledby="care-title">
        <div className="flex flex-wrap gap-1.5">
          <CareStatusBadge post={post} />
          {badges.map((name) => (
            <Badge key={name} tone="outline">
              {name}
            </Badge>
          ))}
        </div>
        <h2
          id="care-title"
          className="mt-3 text-2xl leading-[1.35] font-bold tracking-[-0.24px] break-words text-ink max-[760px]:text-xl"
        >
          {post.pstTtl}
        </h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-1">
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
            <Dot />
            <time>{formatDate(post.regDt)} 등록</time>
            <Dot />
            <span>조회 {post.inqCnt}</span>
          </p>
          {isMine && (
            <p className="flex items-center gap-2 text-sm font-medium text-muted">
              <Link
                to={generatePath(PATHS.COMMUNITY_PETCARE_EDIT, {
                  petPrtcRcrtSn: post.petPrtcRcrtSn,
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
        </div>

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
          <section aria-labelledby="care-info-title" className="mb-8">
            <h3 id="care-info-title" className="text-lg font-bold text-ink">
              돌봄 정보
            </h3>
            <dl className="mt-3 border-t border-line-strong">
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
                <span className="flex flex-wrap gap-1.5">
                  {getShapeNames(post).map((name) => (
                    <Badge key={name} tone="outline">
                      {name}
                    </Badge>
                  ))}
                </span>
              </InfoRow>
              <InfoRow icon={<CalendarDays {...iconProps} />} label="돌봄 일정">
                {schedule.date}
                {schedule.time && (
                  <span className="mt-0.5 block text-sm text-muted">
                    {schedule.time}
                  </span>
                )}
              </InfoRow>
              <InfoRow icon={<Wallet {...iconProps} />} label="비용">
                <span className="text-lg font-bold">{getCostLabel(post)}</span>
              </InfoRow>
              <InfoRow icon={<MapPin {...iconProps} />} label="장소">
                전북 {post.sggNm} {post.emdNm} 인근
                <span className="mt-0.5 block text-sm text-muted">
                  개인정보 보호를 위해 대략적인 위치만 보여요
                </span>
              </InfoRow>
            </dl>
            <CareAreaMap
              place={{ sggNm: post.sggNm, emdNm: post.emdNm }}
              className="mt-3"
            />
          </section>
        </PostBody>

        <p className="mb-4 rounded-lg bg-surface-2 px-4 py-3 text-sm leading-[1.6] text-muted">
          돌봄에 관한 문의와 일정 협의는 [채팅하기]에서 나눠 주세요.
        </p>

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
              className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 px-1 text-base font-semibold text-ink-2 ${isLiked ? '[&_svg]:text-[#f44b21]' : '[&_svg]:text-line-strong'}`}
            >
              <Heart size={22} aria-hidden="true" fill="currentColor" />
              {post.rcmdtnCnt}
            </button>
            <i className="mx-1 h-3.5 w-px bg-line-strong" aria-hidden="true" />
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

      <div className="flex min-w-0 flex-col gap-8">
        <CareSideBox
          post={post}
          onChat={() => handleChat({ pstSn: post.pstSn })}
          onOpenList={() => handleChat({ listPstSn: post.pstSn })}
        />
        <CareCheckGuide />
      </div>

      {modal === 'delete' && (
        <ConfirmModal
          title="돌봄 요청을 삭제할까요? 삭제한 글은 되돌릴 수 없어요. 이미 나눈 채팅 기록은 그대로 남아요"
          confirmLabel="삭제하기"
          isPending={remove.isPending}
          errorMessage={remove.isError && '게시글을 삭제하지 못했어요'}
          onConfirm={() =>
            remove.mutate(post.petPrtcRcrtSn, {
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
