import { useState } from 'react';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import { showToast } from '@/components/toastStore';
import { formatDate, getYmdOf } from '@/utils/formatDate';
import { FILE_EXT_PDF } from '../checkup/checkupTypes';
import { getAttachmentFile } from '../checkupApi';
import AttachmentImage from './AttachmentImage';
import PhotoModal from './PhotoModal';
import { CardTitle, SummaryEmpty } from './SummaryParts';
import { DIARY_EXAM_PATH } from './summaryUtils';

/**
 * [첨부 자료] (FN-HLT-011-09)
 * - 검진기록 첨부파일 최신 4건을 가로로 나열(미리보기 → 파일명 → 날짜), 업로드·삭제 없음
 * - 이미지는 누르면 미리보기, PDF는 내려받기(비공개 파일이라 받은 Blob을 임시 주소로 바꿔 내려받음). [전체 보기]는 없음(명세 v1.1)
 * - 제목 줄 어디를 눌러도(버튼 포함) 목록을 접고 펼침(처음은 접힘, 명세 v1.1)
 */
export default function AttachmentStrip({ petSn, attachments }) {
  const [photo, setPhoto] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = async (attachment) => {
    if (isImage(attachment)) {
      setPhoto(attachment);
      return;
    }
    try {
      const blob = await getAttachmentFile({
        petSn,
        ckupRcdAtchSn: attachment.ckupRcdAtchSn,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.orgnlFileNm;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast('파일을 내려받지 못했어요. 잠시 뒤 다시 시도해 주세요');
    }
  };

  return (
    <Card
      title={<CardTitle icon="description">첨부 자료</CardTitle>}
      action={
        <button
          type="button"
          aria-expanded={isOpen}
          className="inline-flex shrink-0 items-center gap-0.5 font-semibold whitespace-nowrap text-muted hover:text-ink"
        >
          {isOpen ? '접기' : '펼치기'}
          <Icon
            name={isOpen ? 'expand_less' : 'expand_more'}
            className="text-xl"
          />
        </button>
      }
      onHeaderClick={() => setIsOpen((open) => !open)}
      bodyClassName={isOpen ? '' : 'hidden'}
    >
      {attachments.length === 0 ? (
        <SummaryEmpty
          icon="description"
          description="검진상세에 올린 결과지·증명서·영상 사진이 여기에 모여요"
          action="건강 일지에서 검진기록 등록하기"
          to={DIARY_EXAM_PATH}
        />
      ) : (
        <ul className="grid grid-cols-2 gap-4 min-[761px]:grid-cols-4 min-[1101px]:grid-cols-[repeat(4,160px)]">
          {attachments.map((attachment) => {
            const image = isImage(attachment);
            const actionLabel = `${attachment.orgnlFileNm} ${image ? '미리보기' : '다운로드'}`;
            return (
              <li key={attachment.ckupRcdAtchSn} className="min-w-0">
                <button
                  type="button"
                  aria-label={actionLabel}
                  className="group relative flex w-full flex-col gap-1 text-left"
                  onClick={() => handleOpen(attachment)}
                >
                  <span
                    className={`relative mb-2 grid aspect-[4/3] place-items-center overflow-hidden rounded-[10px] border border-line bg-surface-2 text-line-strong group-hover:border-brand-100 ${
                      image ? 'border-dashed' : ''
                    }`}
                  >
                    {image ? (
                      <AttachmentImage
                        petSn={petSn}
                        attachment={attachment}
                        className="size-full object-cover"
                      />
                    ) : (
                      <Icon
                        name={image ? 'image' : 'description'}
                        className="text-[52px]"
                      />
                    )}
                    <em className="absolute top-2 left-2 rounded-[4px] bg-ink px-2 text-[13px] font-semibold text-white not-italic">
                      {image ? 'IMG' : 'PDF'}
                    </em>
                  </span>
                  <span className="truncate text-lg/[1.6] font-semibold group-hover:text-brand-600">
                    {attachment.orgnlFileNm}
                  </span>
                  <span className="text-sm/[1.6] text-subtle">
                    {formatDate(getYmdOf(attachment.regDt))}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute top-2 right-2 grid size-8 place-items-center rounded-full border border-line bg-white text-muted"
                  >
                    <Icon
                      name={image ? 'zoom_in' : 'download'}
                      className="text-[18px]"
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {photo && (
        <PhotoModal onClose={() => setPhoto(null)}>
          <AttachmentImage
            petSn={petSn}
            attachment={photo}
            className="w-full rounded-[10px]"
          />
        </PhotoModal>
      )}
    </Card>
  );
}

const isImage = (attachment) => attachment.fileExtnCd !== FILE_EXT_PDF;
