import { BTN_SECONDARY } from '@/components/buttonStyles';
import FileImage from '@/components/FileImage';
import Modal from '@/components/Modal';
import { useFileImage } from '@/hooks/useFileImage';
import { formatDateTime } from '@/utils/formatDate';
import { getReceiptImageUrl } from './api';
import { adminProcessingKeys } from './queries';

/**
 * [영수증 원본 보기 모달]
 * - 비공개 이미지라 blob으로 받아 표시, 못 받으면 대체 칸
 */
export default function ReceiptImageModal({ receipt, onClose }) {
  const { src, isPending } = useFileImage({
    queryKey: adminProcessingKeys.receiptImage(receipt.recptSn),
    url: getReceiptImageUrl(receipt.recptSn),
  });

  return (
    <Modal
      title="영수증 원본"
      isWide
      onClose={onClose}
      footer={
        <button type="button" className={BTN_SECONDARY} onClick={onClose}>
          닫기
        </button>
      }
    >
      <p className="mb-3 text-sm text-subtle tabular-nums">
        {receipt.mbrNcnm} · {formatDateTime(receipt.frstRegDt)}
      </p>
      <FileImage
        src={src}
        pending={isPending}
        alt={`${receipt.mbrNcnm} 영수증 원본`}
        className="h-[420px] w-full rounded-[10px] object-contain max-[760px]:h-[60vh]"
      />
    </Modal>
  );
}
