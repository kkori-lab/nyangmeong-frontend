import { ImagePlus } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import PostBody from '@/components/PostBody';
import { showToast } from '@/components/toastStore';
import { PATHS } from '@/routes/paths';
import {
  RECEIPT_ACCEPT,
  RECEIPT_HELP,
  validateReceiptFile,
} from '@/utils/receiptFile';
import NoticeSendConfirmModal from './NoticeSendConfirmModal';
import {
  useCreateAdminNotice,
  useUpdateAdminNotice,
  useUploadNoticeImage,
} from './queries';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';
const TEXTAREA_CLASS =
  'block min-h-[320px] w-full resize-y rounded-[6px] border border-[#d3dae2] bg-white px-3 py-2 text-base leading-[1.6] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';

/** 제목 최대 글자 수 */
const MAX_TTL_LENGTH = 200;
/** 내용 최대 글자 수 */
const MAX_CN_LENGTH = 4000;

/** 본문 이미지 한 줄: 사용자 공지 상세(PostBody fileImages)가 이 줄을 이미지로 그린다 */
const imageLine = (atchFileSn) => `![](/api/files/public/${atchFileSn})`;

/** 칸 이름과 글자 수. action은 글자 수 왼쪽에 두는 버튼 */
function FieldLabel({ htmlFor, label, length, maxLength, action }) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {action}
        <span className="text-sm text-subtle tabular-nums">
          {length.toLocaleString()}/{maxLength.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/** 체크 한 칸 */
function CheckOption({ checked, onChange, children }) {
  return (
    <label className="flex min-h-8 cursor-pointer items-center gap-2 font-medium text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-brand-500"
      />
      {children}
    </label>
  );
}

/**
 * [공지 등록·수정 폼]
 * - notice가 있으면 수정, 없으면 등록
 * - 등록 때 [알림 발송]을 체크하면 확인 모달 뒤 등록, 수정 화면에는 체크 칸이 없다
 * - 삭제는 없고 사용을 끄면 비노출
 * - [이미지 넣기]: 올린 뒤 내용 커서 자리에 ![](/api/files/public/번호) 한 줄을 넣는다(HTML 저장 안 함)
 * - 내용 아래 미리보기는 사용자 공지 상세와 같은 PostBody라 그 줄이 이미지로 보인다
 * - 저장하면 목록으로, 실패하면 입력을 유지하고 서버 문구 표시
 */
export default function NoticeForm({ notice }) {
  const navigate = useNavigate();
  const isEdit = Boolean(notice);

  const [ntcMttrTtl, setNtcMttrTtl] = useState(notice?.ntcMttrTtl ?? '');
  const [ntcMttrCn, setNtcMttrCn] = useState(notice?.ntcMttrCn ?? '');
  const [upendFixYn, setUpendFixYn] = useState(notice?.upendFixYn ?? false);
  const [useYn, setUseYn] = useState(notice?.useYn ?? true);
  const [notiSndngYn, setNotiSndngYn] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const create = useCreateAdminNotice();
  const update = useUpdateAdminNotice();
  const save = isEdit ? update : create;
  const upload = useUploadNoticeImage();
  const contentRef = useRef(null);

  const trimmedTtl = ntcMttrTtl.trim();
  const canSubmit =
    Boolean(trimmedTtl && ntcMttrCn.trim()) &&
    !save.isPending &&
    !upload.isPending;

  /** 커서 자리에 이미지 줄을 넣는다. 앞뒤 글과 같은 줄이 되지 않게 줄바꿈을 붙인다 */
  const insertImageLine = (atchFileSn) => {
    const textarea = contentRef.current;
    const value = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const prefix = before && !before.endsWith('\n') ? '\n' : '';
    const suffix = after && !after.startsWith('\n') ? '\n' : '';
    const inserted = `${prefix}${imageLine(atchFileSn)}${suffix}`;
    const next = `${before}${inserted}${after}`;
    if (next.length > MAX_CN_LENGTH) {
      showToast(
        `내용이 ${MAX_CN_LENGTH.toLocaleString()}자를 넘어 이미지를 넣지 못했어요`,
      );
      return;
    }
    setNtcMttrCn(next);
    const cursor = before.length + inserted.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handleImageChange = async (event) => {
    const [file] = event.target.files;
    event.target.value = '';
    if (!file) return;
    const reason = await validateReceiptFile(file);
    if (reason) {
      showToast(reason);
      return;
    }
    upload.mutate(file, {
      onSuccess: ({ atchFileSn }) => insertImageLine(atchFileSn),
      onError: (error) => showToast(error.message),
    });
  };

  const handleSaved = () => {
    showToast(isEdit ? '공지를 수정했어요' : '공지를 등록했어요');
    navigate(PATHS.ADMIN_NOTICES);
  };

  const handleSave = () => {
    const body = { ntcMttrTtl: trimmedTtl, ntcMttrCn, upendFixYn, useYn };
    if (isEdit) {
      update.mutate(
        { ntcMttrSn: notice.ntcMttrSn, ...body },
        { onSuccess: handleSaved },
      );
      return;
    }
    create.mutate({ ...body, notiSndngYn }, { onSuccess: handleSaved });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    if (!isEdit && notiSndngYn) {
      create.reset();
      setIsConfirmOpen(true);
      return;
    }
    handleSave();
  };

  const handleConfirmCancel = () => setIsConfirmOpen(false);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[14px] border border-line bg-white p-6 max-[760px]:p-4"
    >
      <div>
        <FieldLabel
          htmlFor="ntcMttrTtl"
          label="제목"
          length={ntcMttrTtl.length}
          maxLength={MAX_TTL_LENGTH}
        />
        <input
          id="ntcMttrTtl"
          type="text"
          value={ntcMttrTtl}
          maxLength={MAX_TTL_LENGTH}
          placeholder="제목을 입력해 주세요"
          className={INPUT_CLASS}
          onChange={(event) => setNtcMttrTtl(event.target.value)}
        />
      </div>
      <div>
        <FieldLabel
          htmlFor="ntcMttrCn"
          label="내용"
          length={ntcMttrCn.length}
          maxLength={MAX_CN_LENGTH}
          action={
            <>
              <label
                htmlFor="ntcMttrImage"
                aria-disabled={upload.isPending}
                title={RECEIPT_HELP}
                className={`${BTN_SECONDARY} cursor-pointer gap-1.5 ${
                  upload.isPending
                    ? 'pointer-events-none border-transparent bg-surface-3 text-line-strong'
                    : ''
                }`}
              >
                <ImagePlus className="size-4" aria-hidden="true" />
                {upload.isPending ? '올리는 중' : '이미지 넣기'}
              </label>
              <input
                id="ntcMttrImage"
                type="file"
                accept={RECEIPT_ACCEPT}
                disabled={upload.isPending}
                className="sr-only"
                onChange={handleImageChange}
              />
            </>
          }
        />
        <textarea
          ref={contentRef}
          id="ntcMttrCn"
          value={ntcMttrCn}
          maxLength={MAX_CN_LENGTH}
          placeholder="내용을 입력해 주세요"
          className={TEXTAREA_CLASS}
          onChange={(event) => setNtcMttrCn(event.target.value)}
        />
        {ntcMttrCn.trim() && (
          <section
            aria-label="미리보기"
            className="mt-3 rounded-[6px] border border-line bg-surface-2 px-4 pt-3"
          >
            <h3 className="text-sm font-semibold text-ink-2">미리보기</h3>
            <PostBody content={ntcMttrCn} fileImages />
          </section>
        )}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        <CheckOption checked={upendFixYn} onChange={setUpendFixYn}>
          상단 고정
        </CheckOption>
        <CheckOption checked={useYn} onChange={setUseYn}>
          사용
        </CheckOption>
        {!isEdit && (
          <CheckOption checked={notiSndngYn} onChange={setNotiSndngYn}>
            알림 발송
          </CheckOption>
        )}
      </div>
      {save.isError && !isConfirmOpen && (
        <p role="alert" className="text-sm text-danger">
          {save.error.message}
        </p>
      )}
      <div className="flex justify-end gap-2 max-[760px]:[&>*]:flex-1">
        <Link to={PATHS.ADMIN_NOTICES} className={BTN_SECONDARY}>
          취소
        </Link>
        <button type="submit" className={BTN_PRIMARY} disabled={!canSubmit}>
          {isEdit ? '저장' : '등록'}
        </button>
      </div>
      {isConfirmOpen && (
        <NoticeSendConfirmModal
          errorMessage={create.isError ? create.error.message : null}
          isPending={create.isPending}
          onConfirm={handleSave}
          onCancel={handleConfirmCancel}
        />
      )}
    </form>
  );
}
