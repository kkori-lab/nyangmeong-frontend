import FileImage from '@/components/FileImage';
import { useFileImage } from '@/hooks/useFileImage';
import { healthKeys } from '../queries';

/**
 * [첨부 이미지 한 장]
 * - 비공개 파일이라 GET /pets/{petSn}/checkup-attachments/{ckupRcdAtchSn}를 blob으로 받아 그린다
 * - 검진상세의 영상검사와 같은 캐시 키라 한 번 받으면 두 화면이 나눠 쓴다
 */
export default function AttachmentImage({ petSn, attachment, className }) {
  const { src, isPending } = useFileImage({
    queryKey: [
      ...healthKeys.checkupDetail(attachment.ckupRcdSn),
      'file',
      attachment.ckupRcdAtchSn,
    ],
    url: `/pets/${petSn}/checkup-attachments/${attachment.ckupRcdAtchSn}`,
  });

  return <FileImage src={src} pending={isPending} className={className} />;
}
