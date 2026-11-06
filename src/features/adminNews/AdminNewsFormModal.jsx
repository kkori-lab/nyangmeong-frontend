import { ImagePlus } from 'lucide-react';
import { useId, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import Select from '@/components/Select';
import { showToast } from '@/components/toastStore';
import { publicFileUrl } from '@/utils/fileUrl';
import {
  RECEIPT_ACCEPT,
  RECEIPT_HELP,
  validateReceiptFile,
} from '@/utils/receiptFile';
import { ADMIN_SOURCE_LABEL, NEWS_CATEGORIES } from './newsLabels';
import { useCreateAdminNews, useUpdateAdminNews } from './queries';
import { toFieldErrors } from '@/utils/fieldErrors';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-danger';

const TEXTAREA_CLASS = INPUT_CLASS.replace(
  'h-10',
  'min-h-[132px] resize-y py-2',
).replace('leading-[1.4]', 'leading-6');

/** 제목 최대 글자 수 */
const MAX_TTL_LENGTH = 200;
/** 요약 최대 글자 수 */
const MAX_CN_LENGTH = 1000;

const CATEGORY_OPTIONS = [
  { value: '', label: '카테고리 선택' },
  ...NEWS_CATEGORIES.map(({ code, name }) => ({ value: code, label: name })),
];

/** 칸 이름과 글자 수 */
function FieldLabel({ htmlFor, label, length, maxLength }) {
  return (
    <div className="mb-1.5 flex items-center justify-between">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-2">
        {label}
      </label>
      {maxLength && (
        <span className="text-sm text-subtle tabular-nums">
          {length.toLocaleString()}/{maxLength.toLocaleString()}
        </span>
      )}
    </div>
  );
}

/** 칸 아래 안내 */
function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-danger">
      {message}
    </p>
  );
}

/** 칸마다 빠진 값 안내: 없으면 빈 객체 */
const validate = ({ newsClsfCd, newsTtl, newsCn }) => ({
  ...(newsClsfCd ? {} : { newsClsfCd: '카테고리를 골라 주세요' }),
  ...(newsTtl.trim() ? {} : { newsTtl: '제목을 입력해 주세요' }),
  ...(newsCn.trim() ? {} : { newsCn: '요약을 입력해 주세요' }),
});

/**
 * [관리자 뉴스 등록·수정 모달]
 * - news가 있으면 그 행 값으로 채운 수정, 없으면 등록
 * - 출처는 관리자 등록 고정, 원문 주소 칸 없음
 * - [등록]·[저장]을 누르면 칸마다 검사하고, 저장하면 토스트 후 닫음. 실패하면 입력 유지 + 서버 문구
 * - 400 칸별 오류는 클라이언트 안내가 없는 칸 아래, 그 밖 오류(404·업로드 실패)는 폼 아래
 */
export default function AdminNewsFormModal({ news, onClose }) {
  const formId = useId();
  const isEdit = Boolean(news);

  const [newsClsfCd, setNewsClsfCd] = useState(news?.newsClsfCd ?? '');
  const [newsTtl, setNewsTtl] = useState(news?.newsTtl ?? '');
  const [newsCn, setNewsCn] = useState(news?.newsCn ?? '');
  /** 새로 고른 썸네일: { file, url } */
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailError, setThumbnailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const create = useCreateAdminNews();
  const update = useUpdateAdminNews();
  const save = isEdit ? update : create;

  const clientErrors = isSubmitted
    ? validate({ newsClsfCd, newsTtl, newsCn })
    : {};
  const serverFieldErrors = toFieldErrors(save.error);
  const errors = {
    newsClsfCd: clientErrors.newsClsfCd ?? serverFieldErrors.newsClsfCd,
    newsTtl: clientErrors.newsTtl ?? serverFieldErrors.newsTtl,
    newsCn: clientErrors.newsCn ?? serverFieldErrors.newsCn,
  };
  // 칸 아래에 보일 서버 문구가 없으면 폼 아래에 서버 문구
  const hasServerFieldError = Object.keys(serverFieldErrors).some(
    (field) => field in errors,
  );
  const previewUrl = thumbnail?.url ?? publicFileUrl(news?.atchFileSn);

  const handleThumbnailChange = async (event) => {
    const [file] = event.target.files;
    event.target.value = '';
    if (!file) return;
    const reason = await validateReceiptFile(file);
    if (reason) {
      setThumbnailError(reason);
      return;
    }
    setThumbnailError('');
    setThumbnail({ file, url: URL.createObjectURL(file) });
  };

  const handleSaved = () => {
    showToast(isEdit ? '뉴스를 수정했어요' : '뉴스를 등록했어요');
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (save.isPending) return;
    setIsSubmitted(true);
    if (Object.keys(validate({ newsClsfCd, newsTtl, newsCn })).length > 0) {
      return;
    }
    const body = {
      newsClsfCd,
      newsTtl: newsTtl.trim(),
      newsCn: newsCn.trim(),
      ...(thumbnail ? { thumbnail: thumbnail.file } : {}),
    };
    if (isEdit) {
      update.mutate(
        { newsSn: news.newsSn, ...body },
        { onSuccess: handleSaved },
      );
      return;
    }
    create.mutate(body, { onSuccess: handleSaved });
  };

  return (
    <Modal
      title={isEdit ? '뉴스 수정' : '뉴스 등록'}
      isWide
      isTop
      isPending={save.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={save.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="submit"
            form={formId}
            className={BTN_PRIMARY}
            disabled={save.isPending}
          >
            {isEdit ? '저장' : '등록'}
          </button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="flex flex-wrap gap-x-8 gap-y-5">
          <div className="w-[200px] max-[760px]:w-full">
            <p className="mb-1.5 text-sm font-semibold text-ink-2">카테고리</p>
            <Select
              label="카테고리"
              value={newsClsfCd}
              options={CATEGORY_OPTIONS}
              placeholder="카테고리 선택"
              onChange={setNewsClsfCd}
            />
            <FieldError message={errors.newsClsfCd} />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold text-ink-2">출처</p>
            <p className="flex h-10 items-center text-base text-ink-2">
              {ADMIN_SOURCE_LABEL}
            </p>
          </div>
        </div>
        <div>
          <FieldLabel
            htmlFor={`${formId}-newsTtl`}
            label="제목"
            length={newsTtl.length}
            maxLength={MAX_TTL_LENGTH}
          />
          <input
            id={`${formId}-newsTtl`}
            type="text"
            value={newsTtl}
            maxLength={MAX_TTL_LENGTH}
            placeholder="제목을 입력해 주세요"
            aria-invalid={Boolean(errors.newsTtl)}
            aria-describedby={`${formId}-newsTtl-error`}
            className={INPUT_CLASS}
            onChange={(event) => setNewsTtl(event.target.value)}
          />
          <FieldError id={`${formId}-newsTtl-error`} message={errors.newsTtl} />
        </div>
        <div>
          <FieldLabel
            htmlFor={`${formId}-newsCn`}
            label="요약"
            length={newsCn.length}
            maxLength={MAX_CN_LENGTH}
          />
          <textarea
            id={`${formId}-newsCn`}
            value={newsCn}
            maxLength={MAX_CN_LENGTH}
            placeholder="요약을 입력해 주세요"
            aria-invalid={Boolean(errors.newsCn)}
            aria-describedby={`${formId}-newsCn-error`}
            className={TEXTAREA_CLASS}
            onChange={(event) => setNewsCn(event.target.value)}
          />
          <FieldError id={`${formId}-newsCn-error`} message={errors.newsCn} />
        </div>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-2">
            썸네일 <span className="font-normal text-subtle">(선택)</span>
          </p>
          <div className="flex items-center gap-4">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="썸네일 미리보기"
                className="h-20 w-[120px] rounded-[6px] bg-surface-2 object-cover"
              />
            )}
            <div>
              <label
                htmlFor={`${formId}-thumbnail`}
                className={`${BTN_SECONDARY} cursor-pointer gap-1.5`}
              >
                <ImagePlus className="size-4" aria-hidden="true" />
                {previewUrl ? '썸네일 바꾸기' : '썸네일 고르기'}
              </label>
              <input
                id={`${formId}-thumbnail`}
                type="file"
                accept={RECEIPT_ACCEPT}
                className="sr-only"
                onChange={handleThumbnailChange}
              />
              <p className="mt-1.5 text-sm text-subtle">{RECEIPT_HELP}</p>
            </div>
          </div>
          <FieldError message={thumbnailError} />
        </div>
        {save.isError && !hasServerFieldError && (
          <p role="alert" className="text-sm text-danger">
            {save.error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
