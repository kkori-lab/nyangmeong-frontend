import { ChevronLeft, CircleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import AutoTextarea from '@/components/AutoTextarea';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import ImageAttach from '@/components/ImageAttach';
import { PATHS } from '@/routes/paths';
import { getPostImageUrl } from './api';
import PostWriteGuide from './PostWriteGuide';
import { POST_BOARDS } from './postCodes';

const TITLE_MAX = 50;
const BODY_MAX = 2000;

/** 서버가 준 사진 [{ atchFileSn, sortSeq }]를 ImageAttach 항목으로: 공개 파일이라 주소를 바로 쓴다 */
const toImageItems = (imgs) =>
  imgs.map(({ atchFileSn }, index) => ({
    id: `file-${atchFileSn}`,
    atchFileSn,
    name: `첨부 이미지 ${index + 1}`,
    url: getPostImageUrl(atchFileSn),
  }));

const INPUT_CLASS =
  'block w-full rounded-md border bg-white px-3 text-base placeholder:text-[#8c9899] hover:border-[#b9c4c4] focus:border-[#285a5c] focus:outline-none focus:ring-2 focus:ring-[#285a5c]/20';

const LABEL_CLASS =
  'flex items-center gap-0.5 text-base leading-[1.4] font-semibold text-[#1a3234]';

function Required() {
  return (
    <span aria-hidden="true" className="ml-0.5 font-bold text-[#b4473a]">
      *
    </span>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-1 text-sm text-[#b4473a]">
      <CircleAlert size={14} aria-hidden="true" />
      {message}
    </p>
  );
}

/**
 * 글쓰기·글수정 공용 폼
 * - 고친 것이 있으면(처음 값과 다르면) onDirtyChange(true). 나갈 때 확인은 부모(페이지)가 한다: onLeave(to)
 * - 새로고침·창 닫기는 브라우저 확인창
 */
export default function PostForm({
  initial,
  mode,
  cancelTo,
  isPending,
  errorMessage,
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
    const nextErrors = {};
    if (!bbsCd) nextErrors.bbsCd = '카테고리를 골라 주세요';
    if (!title.trim()) nextErrors.title = '제목을 입력해 주세요';
    if (!body.trim()) nextErrors.body = '내용을 입력해 주세요';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || isPending) return;
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
    <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-6">
      <section
        aria-labelledby="post-form-title"
        className="rounded-[14px] border border-[#e2e7e7] bg-white px-9 pt-8 pb-7 shadow-sm max-[760px]:px-5 max-[760px]:pt-[22px] max-[760px]:pb-5"
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
          <fieldset className="flex flex-col gap-1.5">
            <legend className={`${LABEL_CLASS} mb-1.5`}>
              카테고리
              <Required />
            </legend>
            <div className="flex gap-6">
              {POST_BOARDS.map((board) => (
                <label
                  key={board.code}
                  className="flex min-h-8 cursor-pointer items-center gap-2 text-base text-[#3d4a4b]"
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
                    className="size-4 accent-[#285a5c]"
                  />
                  {board.name}
                </label>
              ))}
            </div>
            <p className="text-sm text-[#667374]">
              정보 · 꿀팁은 펫정보, 사진 · 일상 이야기는 펫일상을 골라 주세요
            </p>
            <FieldError message={errors.bbsCd} />
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="post-title" className={LABEL_CLASS}>
                제목
                <Required />
              </label>
              <span className="text-sm text-[#667374]">
                {title.length} / {TITLE_MAX}
              </span>
            </div>
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
                setTitle(event.target.value.replaceAll(/[\r\n]+/g, ' '));
                clearError('title');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault();
              }}
              className={`${INPUT_CLASS} min-h-10 resize-none overflow-hidden py-[7px] leading-6 max-[760px]:min-h-11 max-[760px]:py-[9px] ${errors.title ? 'border-[#b4473a]' : 'border-[#d3dae2]'}`}
            />
            <FieldError message={errors.title} />
          </div>

          <ImageAttach images={images} onChange={setImages} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="post-body" className={LABEL_CLASS}>
              내용
              <Required />
            </label>
            <AutoTextarea
              id="post-body"
              value={body}
              maxLength={BODY_MAX}
              placeholder="우리 아이 이야기를 들려주세요"
              aria-required="true"
              aria-invalid={Boolean(errors.body)}
              onChange={(event) => {
                setBody(event.target.value);
                clearError('body');
              }}
              className={`${INPUT_CLASS} max-h-[600px] min-h-[300px] resize-y py-3 leading-[1.7] max-[760px]:min-h-[240px] ${errors.body ? 'border-[#b4473a]' : 'border-[#d3dae2]'}`}
            />
            <div className="flex items-start justify-between gap-3">
              <FieldError message={errors.body} />
              <span className="ml-auto shrink-0 text-sm text-[#667374]">
                {body.length.toLocaleString()} / {BODY_MAX.toLocaleString()}
              </span>
            </div>
          </div>
        </form>

        {errorMessage && (
          <p role="alert" className="mt-4 text-sm text-[#b4473a]">
            {errorMessage}
          </p>
        )}

        <div className="mt-8 flex items-center justify-end gap-2 border-t border-[#e2e7e7] pt-6 max-[760px]:mt-6 max-[760px]:flex-wrap max-[760px]:pt-5">
          <button
            type="button"
            onClick={() => onLeave(PATHS.COMMUNITY)}
            className="mr-auto inline-flex min-h-9 cursor-pointer items-center gap-1.5 text-base leading-normal font-medium text-[#566465] hover:text-[#1a3234] max-[760px]:order-3 max-[760px]:mr-0 max-[760px]:w-full max-[760px]:justify-center"
          >
            <ChevronLeft size={14} aria-hidden="true" />
            목록으로
          </button>
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
            {isEdit ? '저장' : '등록'}
          </button>
        </div>
      </section>

      <PostWriteGuide />
    </div>
  );
}
