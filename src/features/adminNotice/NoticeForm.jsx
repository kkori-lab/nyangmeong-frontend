import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { PATHS } from '@/routes/paths';
import NoticeSendConfirmModal from './NoticeSendConfirmModal';
import { useCreateAdminNotice, useUpdateAdminNotice } from './queries';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';
const TEXTAREA_CLASS =
  'block min-h-[320px] w-full resize-y rounded-[6px] border border-[#d3dae2] bg-white px-3 py-2 text-base leading-[1.6] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';

/** 제목 최대 글자 수 */
const MAX_TTL_LENGTH = 200;
/** 내용 최대 글자 수 */
const MAX_CN_LENGTH = 4000;

/** 칸 이름과 글자 수 */
function FieldLabel({ htmlFor, label, length, maxLength }) {
  return (
    <div className="mb-1.5 flex items-center justify-between">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-2">
        {label}
      </label>
      <span className="text-sm text-subtle tabular-nums">
        {length.toLocaleString()}/{maxLength.toLocaleString()}
      </span>
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
 * - 저장하면 목록으로, 실패하면 입력을 유지하고 서버 문구 표시
 */
export default function NoticeForm({ notice }) {
  const navigate = useNavigate();
  const isEdit = Boolean(notice);

  const [ntcMttrTtl, setNtcMttrTtl] = useState(notice?.ntcMttrTtl ?? '');
  const [ntcMttrCn, setNtcMttrCn] = useState(notice?.ntcMttrCn ?? '');
  const [upendFixYn, setUpendFixYn] = useState(notice?.upendFixYn ?? false);
  const [useYn, setUseYn] = useState(notice?.useYn ?? true);
  const [ntfctnSndngYn, setNtfctnSndngYn] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const create = useCreateAdminNotice();
  const update = useUpdateAdminNotice();
  const save = isEdit ? update : create;

  const trimmedTtl = ntcMttrTtl.trim();
  const canSubmit = Boolean(trimmedTtl && ntcMttrCn.trim()) && !save.isPending;

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
    create.mutate({ ...body, ntfctnSndngYn }, { onSuccess: handleSaved });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    if (!isEdit && ntfctnSndngYn) {
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
        />
        <textarea
          id="ntcMttrCn"
          value={ntcMttrCn}
          maxLength={MAX_CN_LENGTH}
          placeholder="내용을 입력해 주세요"
          className={TEXTAREA_CLASS}
          onChange={(event) => setNtcMttrCn(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        <CheckOption checked={upendFixYn} onChange={setUpendFixYn}>
          상단 고정
        </CheckOption>
        <CheckOption checked={useYn} onChange={setUseYn}>
          사용
        </CheckOption>
        {!isEdit && (
          <CheckOption checked={ntfctnSndngYn} onChange={setNtfctnSndngYn}>
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
