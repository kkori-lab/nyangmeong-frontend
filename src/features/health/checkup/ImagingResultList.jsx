import { useState } from 'react';
import FileImage from '@/components/FileImage';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import { useFileImage } from '@/hooks/useFileImage';
import { healthKeys } from '../queries';
import { ROW_LINE, TEXT_BTN } from './checkupStyles';
import { IMAGING_KINDS, IMAGING_PARTS, findName } from './checkupTypes';

/**
 * [영상검사 목록]
 * - 첨부 자료 중 "영상 사진" 유형만 영상 종류·촬영 부위·썸네일로 보여 주는 조회 영역 (FN-HLT-005-02)
 * - 썸네일 클릭 → 원본 미리보기, 등록·교체·삭제는 첨부 자료 탭에서
 * - 비공개 파일이라 첨부 파일 API를 blob으로 받아 그린다
 */
export default function ImagingResultList({
  petSn,
  attachments,
  onGoAttachments,
}) {
  const [previewAttachment, setPreviewAttachment] = useState(null);

  return (
    <div>
      {attachments.length === 0 && <p className="text-muted">결과 없음</p>}
      <ul>
        {attachments.map((attachment) => (
          <li
            key={attachment.ckupRcdAtchSn}
            className={`flex items-center gap-3.5 py-3.5 ${ROW_LINE}`}
          >
            <button
              type="button"
              aria-label={`${attachment.orgnlFileNm} 원본 미리보기`}
              className="grid aspect-[4/3] w-14 shrink-0 cursor-zoom-in place-items-center overflow-hidden rounded-[10px] border border-dashed border-line-strong bg-surface-2 text-line-strong"
              onClick={() => setPreviewAttachment(attachment)}
            >
              <AttachmentImage
                petSn={petSn}
                attachment={attachment}
                className="size-full object-cover"
              />
            </button>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">
                {findName(IMAGING_KINDS, attachment.imgKndCd)} ·{' '}
                {findName(IMAGING_PARTS, attachment.shtRegnCd)}
              </span>
              <span className="flex items-center gap-1 text-subtle">
                <Icon name="image" className="text-lg" />
                <span className="break-all">{attachment.orgnlFileNm}</span>
              </span>
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={`${TEXT_BTN} mt-4`}
        onClick={onGoAttachments}
      >
        첨부 자료 탭에서 등록하기
        <Icon name="chevron_right" className="text-lg" />
      </button>

      {previewAttachment && (
        <Modal
          title={previewAttachment.orgnlFileNm}
          onClose={() => setPreviewAttachment(null)}
          footer={
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={() => setPreviewAttachment(null)}
            >
              닫기
            </button>
          }
        >
          <AttachmentImage
            petSn={petSn}
            attachment={previewAttachment}
            alt={previewAttachment.orgnlFileNm}
            className="max-h-[60vh] w-full object-contain"
          />
        </Modal>
      )}
    </div>
  );
}

/** 첨부 이미지 한 장: 받는 중에는 로딩 자리, 실패하면 아이콘 칸 */
function AttachmentImage({ petSn, attachment, alt = '', className }) {
  const { src, isPending } = useFileImage({
    queryKey: [
      ...healthKeys.checkupDetail(attachment.ckupRcdSn),
      'file',
      attachment.ckupRcdAtchSn,
    ],
    url: `/pets/${petSn}/checkup-attachments/${attachment.ckupRcdAtchSn}`,
  });
  return (
    <FileImage src={src} pending={isPending} alt={alt} className={className} />
  );
}
