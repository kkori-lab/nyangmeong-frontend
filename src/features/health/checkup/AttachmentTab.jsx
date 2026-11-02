import { useRef, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { PATHS } from '@/routes/paths';
import { getAttachmentFile } from '../checkupApi';
import EmptyBox from '../diary/EmptyBox';
import {
  useAnalyzeLabPdf,
  useDeleteAttachment,
  useReplaceAttachment,
} from '../queries';
import AttachmentForm from './AttachmentForm';
import { getFileError } from './attachmentUtils';
import {
  ADD_ROW,
  BTN_SM,
  ROW_LINE,
  TAG,
  TEXT_BTN,
  TEXT_BTN_DEL,
} from './checkupStyles';
import {
  ATTACHMENT_IMAGE,
  ATTACHMENT_LAB,
  ATTACHMENT_ACCEPT,
  ATTACHMENT_TYPES,
  FILE_EXT_PDF,
  IMAGING_KINDS,
  IMAGING_PARTS,
  findName,
} from './checkupTypes';

/** 새 창에 연 PDF 임시 주소를 해제하기까지의 시간 */
const PDF_URL_LIFETIME = 60 * 1000;

/**
 * [첨부 자료 탭]
 * - 첨부 목록(유형 태그·파일명·영상 종류·촬영 부위)과 파일별 PDF 분석·다운로드·교체·삭제, [＋ 첨부 추가] (FN-HLT-005-01·04)
 * - PDF 파일은 [열기](새 창), 이미지는 [다운로드]
 * - PDF 분석은 검사결과지 유형의 PDF 행마다. 성공하면 인식 항목을 들고 검사 수치 입력으로 이동
 * - 영수증 원본은 첨부 자료에 넣지 않음
 */
export default function AttachmentTab({
  petSn,
  ckupRcdSn,
  attachments,
  isAddOpenInitially,
}) {
  const navigate = useNavigate();
  const replaceInputRef = useRef(null);
  const [isAddOpen, setIsAddOpen] = useState(isAddOpenInitially);
  const [replaceSn, setReplaceSn] = useState(null);
  const [deleteSn, setDeleteSn] = useState(null);
  const [analyzingSn, setAnalyzingSn] = useState(null);
  const replaceAttachment = useReplaceAttachment();
  const deleteAttachment = useDeleteAttachment();
  const analyzeLabPdf = useAnalyzeLabPdf();

  const hasLabPdf = attachments.some(isLabPdf);

  /** 비공개 파일이라 받은 Blob을 임시 주소로 바꿔 내려받는다 */
  const handleDownload = async (attachment) => {
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

  /** PDF는 받은 Blob을 새 창으로 연다. 팝업 차단을 피하려고 클릭 순간 빈 창을 먼저 연다 */
  const handleOpenPdf = async (attachment) => {
    const win = window.open('', '_blank');
    try {
      const blob = await getAttachmentFile({
        petSn,
        ckupRcdAtchSn: attachment.ckupRcdAtchSn,
      });
      const url = URL.createObjectURL(blob);
      win.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), PDF_URL_LIFETIME);
    } catch {
      win?.close();
      showToast('파일을 열지 못했어요. 잠시 뒤 다시 시도해 주세요');
    }
  };

  const handleReplaceChange = (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const error = getFileError(file);
    if (error) {
      showToast(error);
      return;
    }
    replaceAttachment.mutate({
      petSn,
      ckupRcdSn,
      ckupRcdAtchSn: replaceSn,
      file,
    });
  };

  const handleAnalyze = (attachment) => {
    setAnalyzingSn(attachment.ckupRcdAtchSn);
    analyzeLabPdf.mutate(
      { ckupRcdSn, atchSn: attachment.ckupRcdAtchSn },
      {
        onSuccess: (result) =>
          navigate(
            {
              pathname: generatePath(PATHS.HEALTH_CHECKUP_INSPECTIONS, {
                petSn,
                ckupRcdSn,
              }),
              search: `?mode=pdf&atch=${attachment.ckupRcdAtchSn}`,
            },
            { state: { analyzedItems: result.items } },
          ),
        onSettled: () => setAnalyzingSn(null),
      },
    );
  };

  const handleDelete = () =>
    deleteAttachment.mutate(
      { petSn, ckupRcdSn, ckupRcdAtchSn: deleteSn },
      { onSuccess: () => setDeleteSn(null) },
    );

  const addForm = isAddOpen && (
    <AttachmentForm
      petSn={petSn}
      ckupRcdSn={ckupRcdSn}
      onClose={() => setIsAddOpen(false)}
    />
  );

  return (
    <Card title="첨부 자료" sub="여러 건 등록 가능">
      {attachments.length === 0 ? (
        <>
          <EmptyBox
            icon="description"
            title="첨부한 자료가 없어요"
            description="검사결과지 PDF를 올리면 수치를 자동으로 읽어요"
            action={
              <button
                type="button"
                className={`${BTN_SECONDARY} ${BTN_SM}`}
                onClick={() => setIsAddOpen(true)}
              >
                ＋ 첨부 추가
              </button>
            }
          />
          {addForm}
        </>
      ) : (
        <>
          <ul>
            {attachments.map((attachment) => (
              <li
                key={attachment.ckupRcdAtchSn}
                className={`flex flex-wrap items-center gap-x-3 gap-y-2 py-3 ${ROW_LINE}`}
              >
                <span className={TAG}>
                  {findName(ATTACHMENT_TYPES, attachment.atchTypeCd)}
                </span>
                <span className="inline-flex min-w-0 items-center gap-1">
                  <Icon
                    name={
                      attachment.fileExtnCd === FILE_EXT_PDF
                        ? 'description'
                        : 'image'
                    }
                    className="text-lg"
                  />
                  <span className="break-all">{attachment.orgnlFileNm}</span>
                </span>
                {attachment.atchTypeCd === ATTACHMENT_IMAGE && (
                  <span className="text-sm text-subtle">
                    {findName(IMAGING_KINDS, attachment.imgKndCd)} ·{' '}
                    {findName(IMAGING_PARTS, attachment.shtRegnCd)}
                  </span>
                )}
                <span className="flex items-center gap-3 max-sm:w-full sm:ml-auto">
                  {isLabPdf(attachment) && (
                    <button
                      type="button"
                      disabled={analyzingSn !== null}
                      className="inline-flex h-8 items-center rounded-md bg-brand-50 px-3 font-semibold text-brand-600 hover:enabled:bg-brand-100 disabled:opacity-50"
                      onClick={() => handleAnalyze(attachment)}
                    >
                      PDF 분석
                    </button>
                  )}
                  {attachment.fileExtnCd === FILE_EXT_PDF ? (
                    <button
                      type="button"
                      className={TEXT_BTN}
                      onClick={() => handleOpenPdf(attachment)}
                    >
                      열기
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={TEXT_BTN}
                      onClick={() => handleDownload(attachment)}
                    >
                      다운로드
                    </button>
                  )}
                  <button
                    type="button"
                    className={TEXT_BTN}
                    disabled={replaceAttachment.isPending}
                    onClick={() => {
                      setReplaceSn(attachment.ckupRcdAtchSn);
                      replaceInputRef.current.click();
                    }}
                  >
                    교체
                  </button>
                  <button
                    type="button"
                    className={TEXT_BTN_DEL}
                    onClick={() => setDeleteSn(attachment.ckupRcdAtchSn)}
                  >
                    삭제
                  </button>
                </span>
              </li>
            ))}
          </ul>
          {analyzingSn !== null && (
            <p role="status" className="mt-3 text-sm text-subtle">
              PDF를 분석하고 있어요…
            </p>
          )}
          {!hasLabPdf && (
            <p className="mt-3 text-sm text-subtle">
              먼저 검사결과지를 등록하세요
            </p>
          )}
          {!isAddOpen && (
            <button
              type="button"
              className={`${TEXT_BTN} ${ADD_ROW}`}
              onClick={() => setIsAddOpen(true)}
            >
              <Icon name="add" className="text-lg" />
              첨부 추가
            </button>
          )}
          {addForm}
        </>
      )}

      <input
        ref={replaceInputRef}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        aria-label="교체할 파일"
        hidden
        onChange={handleReplaceChange}
      />

      {deleteSn !== null && (
        <Modal
          isConfirm
          title="이 첨부 자료를 삭제할까요?"
          isPending={deleteAttachment.isPending}
          onClose={() => setDeleteSn(null)}
          footer={
            <>
              <button
                type="button"
                className={BTN_SECONDARY}
                disabled={deleteAttachment.isPending}
                onClick={() => setDeleteSn(null)}
              >
                취소
              </button>
              <button
                type="button"
                className={BTN_DANGER}
                disabled={deleteAttachment.isPending}
                onClick={handleDelete}
              >
                삭제하기
              </button>
            </>
          }
        />
      )}
    </Card>
  );
}

/** 검사결과지 유형의 PDF 파일: [PDF 분석] 대상 */
function isLabPdf(attachment) {
  return (
    attachment.atchTypeCd === ATTACHMENT_LAB &&
    attachment.fileExtnCd === FILE_EXT_PDF
  );
}
