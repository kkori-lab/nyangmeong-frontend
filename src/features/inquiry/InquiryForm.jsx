import { ChevronLeft, CircleAlert, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import AutoTextarea from '@/components/AutoTextarea';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import ConfirmModal from '@/components/ConfirmModal';
import DropdownSelect from '@/components/DropdownSelect';
import ImageAttach from '@/components/ImageAttach';
import { PATHS } from '@/routes/paths';
import { useInquiryImageUrls } from './queries';

const TITLE_MAX = 50;
const BODY_MAX = 2000;

/** 서버가 준 첨부 [{ atchFileSn, sortSeq, orgnlFileNm }]를 ImageAttach 항목으로: 이미지 주소는 렌더 시 채움 */
const toAttachItems = (imgs = []) =>
  imgs.map(({ atchFileSn, orgnlFileNm }, index) => ({
    id: `file-${atchFileSn}`,
    atchFileSn,
    name: orgnlFileNm || `첨부 이미지 ${index + 1}`,
    url: null,
  }));

const INPUT_CLASS =
  'block w-full rounded-md border bg-white px-3 text-base placeholder:text-[#8c9899] hover:border-[#b9c4c4] focus:border-[#285a5c] focus:outline-none focus:ring-2 focus:ring-[#285a5c]/20';

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
 * 문의 작성·수정 공용 폼
 * - 입력한 것이 있으면(처음 값과 다르면) 목록·취소로 나갈 때 확인 모달, 새로고침·닫기는 브라우저 확인창
 * - 고객센터 사이드 메뉴 이동은 틀의 onLeave가 이 확인으로 연결. 앱이 BrowserRouter라 헤더(GNB) 링크 이동은 차단 불가
 * - initial: { inqryTypeCd, inqryTtl, inqryCn, imgs }. 수정은 서버 상세 응답을 그대로 전달
 * - types: 문의 유형 공통코드 [{ comCd, comCdNm }]
 * - errorMessage·fieldErrors: 서버 오류의 message와 입력값 검증 오류 fields([{ field, message }])
 * - onSubmit({ inqryTypeCd, inqryTtl, inqryCn, images(새 File들), keepAtchFileSns(남길 기존 첨부) })
 */
export default function InquiryForm({
  initial,
  types,
  mode,
  cancelTo,
  isPending,
  errorMessage,
  fieldErrors,
  onSubmit,
}) {
  const navigate = useNavigate();
  const { leaveRef } = useOutletContext() ?? {};
  const [type, setType] = useState(initial.inqryTypeCd);
  const [title, setTitle] = useState(initial.inqryTtl);
  const [body, setBody] = useState(initial.inqryCn);
  const [initialImages] = useState(() => toAttachItems(initial.imgs));
  const [images, setImages] = useState(initialImages);
  const existingUrls = useInquiryImageUrls(
    initial.otoInqrySn,
    initial.imgs ?? [],
  );
  const [errors, setErrors] = useState({});
  const [leaveTo, setLeaveTo] = useState(null);

  const isEdit = mode === 'edit';
  const isDirty =
    type !== initial.inqryTypeCd ||
    title !== initial.inqryTtl ||
    body !== initial.inqryCn ||
    images.length !== initialImages.length ||
    images.some((image, i) => image.id !== initialImages[i]?.id);

  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (event) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  /** 목록으로·취소: 고친 것이 있으면 먼저 확인 */
  const handleLeave = (target) => {
    if (isDirty) setLeaveTo(target);
    else navigate(target);
  };

  /** 고객센터 틀의 사이드 메뉴·머리 이동도 같은 확인을 거치도록 설정 */
  useEffect(() => {
    if (!leaveRef) return undefined;
    leaveRef.current = handleLeave;
    return () => {
      leaveRef.current = null;
    };
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!type) nextErrors.type = '문의 유형을 골라 주세요';
    if (!title.trim()) nextErrors.title = '제목을 입력해 주세요';
    if (!body.trim()) nextErrors.body = '내용을 입력해 주세요';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || isPending) return;
    onSubmit({
      inqryTypeCd: type,
      inqryTtl: title.trim(),
      inqryCn: body.trim(),
      images: images.filter((image) => image.file).map((image) => image.file),
      keepAtchFileSns: images
        .filter((image) => !image.file)
        .map((image) => image.atchFileSn),
    });
  };

  const typeOptions = types.map(({ comCd, comCdNm }) => ({
    value: comCd,
    label: comCdNm,
  }));
  const serverFieldError = (field) =>
    fieldErrors?.find((item) => item.field === field)?.message;

  const clearError = (name) => setErrors((prev) => ({ ...prev, [name]: '' }));

  return (
    <section
      aria-labelledby="inquiry-form-title"
      className="rounded-[14px] border border-[#e2e7e7] bg-white px-9 pt-8 pb-7 shadow-sm max-[760px]:px-5 max-[760px]:pt-[22px] max-[760px]:pb-5"
    >
      <h2 id="inquiry-form-title" className="sr-only">
        {isEdit ? '문의 수정' : '새 문의 작성'}
      </h2>
      {!isEdit && (
        <p className="mb-6 flex items-start gap-2.5 rounded-[10px] border border-[#cfe3d6] bg-[#ebf3ee] px-4 py-3.5 text-sm font-medium text-[#2f6f57]">
          <Info size={16} aria-hidden="true" className="mt-[3px] shrink-0" />
          <span>
            답변이 등록되면 알림으로 알려 드려요. 자주 묻는 내용은{' '}
            <Link
              to={PATHS.FAQS}
              className="font-bold underline underline-offset-[3px]"
            >
              자주 묻는 질문
            </Link>
            에서 바로 확인할 수 있어요.
          </span>
        </p>
      )}
      <form
        id="inquiry-form"
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-7 max-[760px]:gap-6"
      >
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-0.5 text-base leading-[1.4] font-semibold text-[#1a3234]">
            문의 유형
            <span
              aria-hidden="true"
              className="ml-0.5 font-bold text-[#b4473a]"
            >
              *
            </span>
          </span>
          <DropdownSelect
            label="문의 유형"
            placeholder="선택해 주세요"
            value={type}
            options={typeOptions}
            onChange={(value) => {
              setType(value);
              clearError('type');
            }}
            className="max-w-[320px] max-[760px]:max-w-none"
          />
          <FieldError
            message={errors.type || serverFieldError('inqryTypeCd')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="inquiry-title"
              className="flex items-center gap-0.5 text-base leading-[1.4] font-semibold text-[#1a3234]"
            >
              제목
              <span
                aria-hidden="true"
                className="ml-0.5 font-bold text-[#b4473a]"
              >
                *
              </span>
            </label>
            <span className="text-sm text-[#667374]">
              {title.length} / {TITLE_MAX}
            </span>
          </div>
          <AutoTextarea
            id="inquiry-title"
            rows={1}
            value={title}
            maxLength={TITLE_MAX}
            placeholder="문의 제목을 입력해 주세요"
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
          <FieldError message={errors.title || serverFieldError('inqryTtl')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="inquiry-body"
            className="flex items-center gap-0.5 text-base leading-[1.4] font-semibold text-[#1a3234]"
          >
            내용
            <span
              aria-hidden="true"
              className="ml-0.5 font-bold text-[#b4473a]"
            >
              *
            </span>
          </label>
          <AutoTextarea
            id="inquiry-body"
            value={body}
            maxLength={BODY_MAX}
            placeholder="언제, 어떤 화면에서, 어떤 일이 있었는지 자세히 적어 주시면 더 빠르게 답변드릴 수 있어요"
            aria-required="true"
            aria-invalid={Boolean(errors.body)}
            onChange={(event) => {
              setBody(event.target.value);
              clearError('body');
            }}
            className={`${INPUT_CLASS} max-h-[600px] min-h-[300px] resize-y py-3 leading-[1.7] max-[760px]:min-h-[240px] ${errors.body ? 'border-[#b4473a]' : 'border-[#d3dae2]'}`}
          />
          <div className="flex items-start justify-between gap-3">
            <FieldError message={errors.body || serverFieldError('inqryCn')} />
            <span className="ml-auto shrink-0 text-sm text-[#667374]">
              {body.length.toLocaleString()} / {BODY_MAX.toLocaleString()}
            </span>
          </div>
        </div>

        <ImageAttach
          images={images.map((image) =>
            image.atchFileSn
              ? { ...image, url: existingUrls[image.atchFileSn] ?? null }
              : image,
          )}
          onChange={setImages}
          hint="화면 캡처를 함께 올려 주시면 확인이 빨라요."
        />
      </form>

      {errorMessage && (
        <p role="alert" className="mt-4 text-sm text-[#b4473a]">
          {errorMessage}
        </p>
      )}

      <div className="mt-8 flex items-center justify-end gap-2 border-t border-[#e2e7e7] pt-6 max-[760px]:mt-6 max-[760px]:flex-wrap max-[760px]:pt-5">
        <button
          type="button"
          onClick={() => handleLeave(PATHS.INQUIRIES)}
          className="mr-auto inline-flex min-h-9 cursor-pointer items-center gap-1.5 text-base leading-normal font-medium text-[#566465] hover:text-[#1a3234] max-[760px]:order-3 max-[760px]:mr-0 max-[760px]:w-full max-[760px]:justify-center"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          목록으로
        </button>
        <button
          type="button"
          onClick={() => handleLeave(cancelTo)}
          className={`${BTN_SECONDARY} min-w-[120px] max-[760px]:h-12 max-[760px]:min-w-0 max-[760px]:flex-1`}
        >
          취소
        </button>
        <button
          type="submit"
          form="inquiry-form"
          disabled={isPending}
          className={`${BTN_PRIMARY} min-w-[120px] max-[760px]:h-12 max-[760px]:min-w-0 max-[760px]:flex-1`}
        >
          {isEdit ? '저장' : '문의 제출'}
        </button>
      </div>

      {leaveTo && (
        <ConfirmModal
          title={
            isEdit
              ? '수정을 그만둘까요? 고친 내용은 저장되지 않고 원래 문의가 그대로 남아요'
              : '작성을 그만둘까요? 지금까지 쓴 내용은 저장되지 않아요'
          }
          confirmLabel="나가기"
          cancelLabel={isEdit ? '계속 수정' : '계속 쓰기'}
          onConfirm={() => navigate(leaveTo)}
          onCancel={() => setLeaveTo(null)}
        />
      )}
    </section>
  );
}
