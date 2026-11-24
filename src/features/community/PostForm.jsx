import { flushSync } from 'react-dom';
import useProfanityErrors from '@/hooks/useProfanityErrors';
import { useEffect, useState } from 'react';
import AutoTextarea from '@/components/AutoTextarea';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import FieldError, { Required } from '@/components/FieldError';
import { INPUT, LABEL } from '@/components/formStyles';
import ImageAttach from '@/components/ImageAttach';
import { PATHS } from '@/routes/paths';
import { publicFileUrl } from '@/utils/fileUrl';
import { LIST_RAIL_COLS } from '@/constants/listLayout';
import PostWriteGuide from './PostWriteGuide';
import { POST_BOARDS } from './postCodes';

const TITLE_MAX = 50;
const BODY_MAX = 2000;

/** 서버가 준 사진 [{ atchFileSn, sortSeq }]를 ImageAttach 항목으로: 공개 파일이라 주소를 바로 사용 */
const toImageItems = (imgs) =>
  imgs.map(({ atchFileSn }, index) => ({
    id: `file-${atchFileSn}`,
    atchFileSn,
    name: `첨부 이미지 ${index + 1}`,
    url: publicFileUrl(atchFileSn),
  }));

const LABEL_CLASS = `${LABEL} text-base text-ink`;

/**
 * 글쓰기·글수정 공용 폼
 * - 고친 것이 있으면(처음 값과 다르면) onDirtyChange(true). 나갈 때 확인은 부모(페이지)가 한다: onLeave(to)
 * - 새로고침·창 닫기는 브라우저 확인창
 */
const PROFANITY_FIELDS = {
  pstTtl: { key: 'title', id: 'post-title' },
  pstCn: { key: 'body', id: 'post-body' },
};

export default function PostForm({
  initial,
  mode,
  cancelTo,
  isPending,
  errorMessage,
  profanityFields,
  onSubmit,
  onLeave,
  onDirtyChange,
}) {
  const [bbsCd, setBbsCd] = useState(initial.bbsCd);
  const [title, setTitle] = useState(initial.pstTtl);
  const [body, setBody] = useState(initial.pstCn);
  const [initialImages] = useState(() => toImageItems(initial.imgs));
  const [images, setImages] = useState(initialImages);
  const [errors, setErrors] = useState({});
  useProfanityErrors(profanityFields, PROFANITY_FIELDS, setErrors);

  const isEdit = mode === 'edit';
  const isDirty =
    bbsCd !== initial.bbsCd ||
    title !== initial.pstTtl ||
    body !== initial.pstCn ||
    images.length !== initialImages.length ||
    images.some((image, i) => image.id !== initialImages[i]?.id);

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (event) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const clearError = (name) => setErrors((prev) => ({ ...prev, [name]: '' }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors = {};
    if (!bbsCd) nextErrors.bbsCd = '카테고리를 골라 주세요';
    if (!title.trim()) nextErrors.title = '제목을 입력해 주세요';
    if (!body.trim()) nextErrors.body = '내용을 입력해 주세요';
    /** 오류 표시(aria-invalid)가 화면에 반영된 뒤에 첫 빠진 항목을 찾도록 바로 반영한다 */
    flushSync(() => setErrors(nextErrors));
    if (Object.keys(nextErrors).length > 0) {
      /** 빠진 항목 중 첫 번째로 이동 */
      form
        .querySelector('[aria-invalid="true"], [data-invalid="true"]')
        ?.focus();
      return;
    }
    if (isPending) return;
    onSubmit({
      bbsCd,
      pstTtl: title.trim(),
      pstCn: body.trim(),
      images: images.filter((image) => image.file).map((image) => image.file),
      keepAtchFileSns: images
        .filter((image) => !image.file)
        .map((image) => image.atchFileSn),
    });
  };

  return (
    <div
      className={`grid ${LIST_RAIL_COLS} items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-6`}
    >
      <section
        aria-labelledby="post-form-title"
        className="rounded-[14px] border border-line bg-white px-9 pt-8 pb-7 max-[760px]:px-5 max-[760px]:pt-6 max-[760px]:pb-5"
      >
        <h2 id="post-form-title" className="sr-only">
          {isEdit ? '게시글 수정' : '게시글 작성'}
        </h2>
        <form
          id="post-form"
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-9"
        >
          <fieldset
            tabIndex={-1}
            data-invalid={Boolean(errors.bbsCd)}
            className="flex flex-col gap-2"
          >
            <legend className={`${LABEL_CLASS} mb-2`}>
              카테고리
              <Required />
            </legend>
            <div className="flex gap-6">
              {POST_BOARDS.map((board) => (
                <label
                  key={board.code}
                  className="flex min-h-8 cursor-pointer items-center gap-2 text-base text-ink-2"
                >
                  <input
                    type="radio"
                    name="bbsCd"
                    value={board.code}
                    checked={bbsCd === board.code}
                    onChange={() => {
                      setBbsCd(board.code);
                      clearError('bbsCd');
                    }}
                    className="size-4 accent-brand-500"
                  />
                  {board.name}
                </label>
              ))}
            </div>
            <p className="text-sm text-subtle">
              정보 · 꿀팁은 펫정보, 사진 · 일상 이야기는 펫일상을 골라 주세요
            </p>
            <FieldError>{errors.bbsCd}</FieldError>
          </fieldset>

          <div className="flex flex-col gap-2">
            <label htmlFor="post-title" className={LABEL_CLASS}>
              제목
              <Required />
            </label>
            {/** 글자 수(제목·내용 같음)는 높이를 차지하지 않고 칸 아래 오른쪽, 칸 사이 간격 안에 둔다 */}
            <div className="relative">
              <AutoTextarea
                id="post-title"
                rows={1}
                value={title}
                maxLength={TITLE_MAX}
                placeholder="제목을 입력하세요"
                aria-required="true"
                aria-invalid={Boolean(errors.title)}
                onChange={(event) => {
                  /** 제목은 줄을 나눌 수 없다: 붙여 넣은 줄바꿈은 공백으로 */
                  setTitle(
                    event.target.value
                      .replaceAll(/[\r\n]+/g, ' ')
                      .slice(0, TITLE_MAX),
                  );
                  clearError('title');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.preventDefault();
                }}
                className={`${INPUT} min-h-10 resize-none overflow-hidden py-2 leading-6 max-[760px]:min-h-11`}
              />
              <span className="absolute top-full right-0 mt-1 text-xs text-subtle">
                {title.length} / {TITLE_MAX}
              </span>
            </div>
            <FieldError>{errors.title}</FieldError>
          </div>

          <ImageAttach images={images} onChange={setImages} />

          <div className="flex flex-col gap-2">
            <label htmlFor="post-body" className={LABEL_CLASS}>
              내용
              <Required />
            </label>
            <div className="relative">
              <AutoTextarea
                id="post-body"
                value={body}
                maxLength={BODY_MAX}
                placeholder="우리 아이 이야기를 들려주세요"
                aria-required="true"
                aria-invalid={Boolean(errors.body)}
                onChange={(event) => {
                  setBody(event.target.value.slice(0, BODY_MAX));
                  clearError('body');
                }}
                className={`${INPUT} max-h-[600px] min-h-[200px] resize-y py-3 leading-[1.7]`}
              />
              <span className="absolute top-full right-0 mt-1 text-xs text-subtle">
                {body.length.toLocaleString()} / {BODY_MAX.toLocaleString()}
              </span>
            </div>
            <FieldError>{errors.body}</FieldError>
          </div>
        </form>

        {errorMessage && profanityFields.length === 0 && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {errorMessage}
          </p>
        )}

        <div className="mt-8 flex items-center justify-end gap-2 border-t border-line pt-6 max-[760px]:mt-6 max-[760px]:flex-wrap max-[760px]:pt-5">
          <button
            type="button"
            onClick={() => onLeave(cancelTo)}
            className={`${BTN_SECONDARY} min-w-[120px] max-[760px]:h-12 max-[760px]:min-w-0 max-[760px]:flex-1`}
          >
            취소
          </button>
          <button
            type="submit"
            form="post-form"
            disabled={isPending}
            className={`${BTN_PRIMARY} min-w-[120px] max-[760px]:h-12 max-[760px]:min-w-0 max-[760px]:flex-1`}
          >
            {isEdit ? '저장하기' : '등록하기'}
          </button>
        </div>
      </section>

      <PostWriteGuide />
    </div>
  );
}
