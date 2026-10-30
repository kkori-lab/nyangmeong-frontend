import { ChevronLeft, Clock, Headset, ImageIcon, Lock } from 'lucide-react';
import { useState } from 'react';
import { generatePath, Link, useNavigate } from 'react-router-dom';
import Badge from '@/components/Badge';
import ConfirmModal from '@/components/ConfirmModal';
import { showToast } from '@/components/toastStore';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import { isAnswered } from './api';
import InquiryImageViewer from './InquiryImageViewer';
import InquiryStatusBadge from './InquiryStatusBadge';
import { useDeleteInquiry, useInquiryImageUrls } from './queries';

const ACTION_BUTTON_CLASS =
  'inline-flex h-10 min-w-[120px] items-center justify-center gap-1.5 rounded-md px-4 font-semibold max-[760px]:h-12 max-[760px]:min-w-0 max-[760px]:flex-1';
const EDIT_BUTTON_CLASS = `${ACTION_BUTTON_CLASS} bg-[#e9f2f2] text-[#1e4a4c]`;
const DELETE_BUTTON_CLASS = `${ACTION_BUTTON_CLASS} border border-[#d5dddd] bg-white text-[#566465] hover:bg-[#f4f7f7]`;

/** '2026-09-18T14:32:00' → '2026.09.18 14:32' */
const formatDateTime = (value) => `${formatDate(value)} ${value.slice(11, 16)}`;

export default function InquiryDetail({ inquiry }) {
  const answered = isAnswered(inquiry);
  const { imgs } = inquiry;
  const urls = useInquiryImageUrls(inquiry.otoInqrySn, imgs);
  const [viewerIndex, setViewerIndex] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const remove = useDeleteInquiry();
  const navigate = useNavigate();

  return (
    <article className="rounded-[14px] border border-[#e2e7e7] bg-white px-9 pt-8 pb-8 max-[760px]:px-5 max-[760px]:pt-6 max-[760px]:pb-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="outline">{inquiry.inqryTypeCdNm}</Badge>
        <InquiryStatusBadge isAnswered={answered} />
      </div>
      <h2 className="mt-[10px] text-2xl leading-[1.35] font-bold tracking-[-0.24px] text-[#1a3234] max-[760px]:text-xl">
        {inquiry.inqryTtl}
      </h2>
      <p className="mt-4 flex items-center gap-2 border-b border-[#e2e7e7] pb-6 text-sm text-[#667374]">
        <span>접수일</span>
        <time>{formatDateTime(inquiry.regDt)}</time>
      </p>

      <p className="mt-6 text-base leading-[1.7] whitespace-pre-line text-[#1a3234] max-[760px]:mt-5">
        {inquiry.inqryCn}
      </p>
      {imgs.length > 0 && (
        <>
          <p className="mt-6 text-sm font-semibold text-[#566465]">
            첨부 이미지 {imgs.length}
          </p>
          <ul className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(120px,148px))] gap-3 max-[760px]:grid-cols-3 max-[760px]:gap-2">
            {imgs.map((img, index) => (
              <li key={img.atchFileSn}>
                <button
                  type="button"
                  aria-label={`첨부 이미지 ${index + 1} 크게 보기`}
                  onClick={() => setViewerIndex(index)}
                  className="grid aspect-square w-full cursor-pointer place-items-center overflow-hidden rounded-[10px] border border-[#e2e7e7] bg-[#f4f6f6] text-[#b9c4c4]"
                >
                  {urls[img.atchFileSn] ? (
                    <img
                      src={urls[img.atchFileSn]}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={32} aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {viewerIndex !== null && (
        <InquiryImageViewer
          imgs={imgs}
          urls={urls}
          index={viewerIndex}
          onChange={setViewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}

      <section
        aria-labelledby="inquiry-answer"
        className="mt-10 border-t border-[#b9c4c4] pt-6 max-[760px]:mt-8 max-[760px]:pt-5"
      >
        <h3
          id="inquiry-answer"
          className="mb-4 text-lg font-bold text-[#1a3234]"
        >
          관리자 답변
        </h3>
        {answered ? (
          <div className="rounded-[10px] bg-[#e9f2f2] px-6 py-[22px] max-[760px]:p-[18px]">
            <p className="flex flex-wrap items-center gap-2 text-sm text-[#566465]">
              <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#1e4a4c]">
                <Headset size={18} aria-hidden="true" />
              </span>
              <b className="text-base font-semibold text-[#1a3234]">
                냥멍케어 고객센터
              </b>
              <i className="text-[#667374] not-italic" aria-hidden="true">
                ·
              </i>
              <time>{formatDateTime(inquiry.ansDt)}</time>
            </p>
            <p className="mt-4 text-base leading-[1.7] whitespace-pre-line text-[#1a3234]">
              {inquiry.ansCn}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3.5 rounded-[10px] border border-dashed border-[#b9c4c4] px-[22px] py-5 text-[#566465] max-[760px]:p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f4f6f6] text-[#667374]">
              <Clock size={22} aria-hidden="true" />
            </span>
            <p>
              <b className="block font-semibold text-[#1a3234]">
                아직 답변이 등록되지 않았어요
              </b>
              확인 후 답변을 드리고, 등록되면 알림으로 알려 드려요.
            </p>
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[#e2e7e7] pt-4">
        <Link
          to={PATHS.INQUIRIES}
          className="inline-flex min-h-9 items-center gap-1.5 text-base leading-normal font-medium text-[#566465] hover:text-[#1a3234]"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          목록으로
        </Link>
        {answered ? (
          <p className="ml-auto flex items-center gap-1.5 text-sm text-[#667374] max-[760px]:order-2 max-[760px]:ml-0 max-[760px]:w-full max-[760px]:justify-center">
            <Lock size={16} aria-hidden="true" />
            답변이 등록된 문의는 수정할 수 없어요
          </p>
        ) : (
          <div className="flex gap-2 max-[760px]:w-full">
            <button
              type="button"
              onClick={() => setIsDeleting(true)}
              className={DELETE_BUTTON_CLASS}
            >
              삭제
            </button>
            <Link
              to={generatePath(PATHS.INQUIRY_EDIT, {
                otoInqrySn: inquiry.otoInqrySn,
              })}
              className={`${EDIT_BUTTON_CLASS} hover:bg-[#cde0e0]`}
            >
              문의 수정
            </Link>
          </div>
        )}
      </div>

      {isDeleting && (
        <ConfirmModal
          title="문의를 삭제할까요? 삭제한 문의는 되돌릴 수 없어요"
          confirmLabel="삭제"
          isPending={remove.isPending}
          errorMessage={remove.error?.message}
          onConfirm={() =>
            remove.mutate(inquiry.otoInqrySn, {
              onSuccess: () => {
                showToast('문의를 삭제했어요');
                navigate(PATHS.INQUIRIES, { replace: true });
              },
            })
          }
          onCancel={() => {
            remove.reset();
            setIsDeleting(false);
          }}
        />
      )}
    </article>
  );
}
